import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { intake_id } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
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

    // Analyze with AI
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an AI transformation expert. Analyze common AI myths and provide clear, evidence-based rebuttals. CRITICAL: Base your analysis only on the concerns provided - do not fabricate statistics, percentages, or specific examples not present in the data."
          },
          {
            role: "user",
            content: `Analyze these AI concerns from executives: ${JSON.stringify(allConcerns)}. 
            
Return myth-reality pairs that directly address these concerns. Focus on practical, business-focused responses. Limit to 5-7 key myths. Use qualitative language, not fabricated metrics.`
          }
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
        tool_choice: { type: "function", function: { name: "generate_myth_rebuttals" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData));
    
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const mythsData = JSON.parse(toolCall?.function?.arguments || '{"myths":[]}');

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
