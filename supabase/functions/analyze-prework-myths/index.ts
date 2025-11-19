import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { callWithFallback, getSegmentPrompt } from "../_shared/ai-fallback.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { intake_id } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!OPENAI_API_KEY || !LOVABLE_API_KEY) {
      throw new Error("API keys not configured");
    }
    
    // Get all pre-work responses
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { data: responses, error: fetchError } = await supabase
      .from('pre_workshop_inputs')
      .select('pre_work_responses')
      .eq('intake_id', intake_id);

    if (fetchError) {
      console.error("Error fetching pre-work responses:", fetchError);
      throw fetchError;
    }

    // Aggregate all myths/concerns
    const allConcerns: string[] = [];
    responses?.forEach(r => {
      const concerns = r.pre_work_responses?.ai_myths_concerns || [];
      allConcerns.push(...concerns);
    });

    if (allConcerns.length === 0) {
      return new Response(JSON.stringify({ 
        myths: [],
        raw_concerns: [] 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Analyzing concerns:", allConcerns);

    const userPrompt = `Analyze these AI concerns from executives: ${JSON.stringify(allConcerns)}. 

Return myth-reality pairs that directly address these concerns. Focus on practical, business-focused responses. Limit to 5-7 key myths. Use qualitative language, not fabricated metrics.`;

    const result = await callWithFallback({
      openAIKey: OPENAI_API_KEY,
      lovableKey: LOVABLE_API_KEY,
      messages: [
        { role: 'system', content: getSegmentPrompt('mythbusting') },
        { role: 'user', content: userPrompt }
      ],
      tools: [{
        type: "function",
        function: {
          name: "generate_myth_rebuttals",
          parameters: {
            type: "object",
            properties: {
              myths: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    myth: { type: "string" },
                    reality: { type: "string" }
                  },
                  required: ["myth", "reality"]
                }
              }
            },
            required: ["myths"]
          }
        }
      }],
      toolChoice: { type: "function", function: { name: "generate_myth_rebuttals" } }
    });

    console.log(`🔧 Myth Analysis: ${result.provider} (${result.latencyMs}ms)`);

    // Parse tool call response
    let mythsData = { myths: [] };
    if (result.toolCalls && result.toolCalls.length > 0) {
      mythsData = JSON.parse(result.toolCalls[0].function.arguments || '{"myths":[]}');
    }

    return new Response(JSON.stringify({ 
      myths: mythsData.myths,
      raw_concerns: allConcerns 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-prework-myths:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      myths: [],
      raw_concerns: []
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
