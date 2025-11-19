import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callWithFallback, getSegmentPrompt } from "../_shared/ai-fallback.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { segment, data } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!OPENAI_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('API keys not configured');
    }

    let userPrompt = '';

    switch (segment) {
      case 'bottleneck':
        userPrompt = `Analyze these bottleneck submissions and provide a 2-3 sentence summary of the key themes and their impact:\n\n${JSON.stringify(data)}`;
        break;
      
      case 'effortless_map':
        userPrompt = `Analyze these friction points and provide a 2-3 sentence insight about which areas have the highest AI-augmentation potential:\n\n${JSON.stringify(data)}`;
        break;
      
      case 'simulation':
        userPrompt = `Review these simulation results and provide a 2-3 sentence assessment of key risks and mitigation strategies:\n\n${JSON.stringify(data)}`;
        break;
      
      default:
        userPrompt = `Provide a concise 2-3 sentence insight about this workshop data:\n\n${JSON.stringify(data)}`;
    }

    const result = await callWithFallback({
      openAIKey: OPENAI_API_KEY,
      lovableKey: LOVABLE_API_KEY,
      messages: [
        { role: 'system', content: getSegmentPrompt(segment) },
        { role: 'user', content: userPrompt }
      ],
      maxTokens: 150
    });

    console.log(`📊 Workshop Insight [${segment}]: ${result.provider} (${result.latencyMs}ms)`);

    return new Response(
      JSON.stringify({ insight: result.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-workshop-insights:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
