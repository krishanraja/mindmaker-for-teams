import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (segment) {
      case 'bottleneck':
        systemPrompt = 'You are an expert facilitator analyzing organizational bottlenecks. Provide concise, actionable insights. NEVER fabricate statistics or specific examples not present in the data.';
        userPrompt = `Analyze these bottleneck submissions and provide a 2-3 sentence summary of the key themes and their impact:\n\n${JSON.stringify(data)}`;
        break;
      
      case 'effortless_map':
        systemPrompt = 'You are an AI transformation strategist. Identify patterns and opportunities. NEVER fabricate statistics or specific examples not present in the data.';
        userPrompt = `Analyze these friction points and provide a 2-3 sentence insight about which areas have the highest AI-augmentation potential:\n\n${JSON.stringify(data)}`;
        break;
      
      case 'simulation':
        systemPrompt = 'You are a risk assessment expert. Evaluate AI implementation scenarios. NEVER fabricate statistics or specific examples not present in the data.';
        userPrompt = `Review these simulation results and provide a 2-3 sentence assessment of key risks and mitigation strategies:\n\n${JSON.stringify(data)}`;
        break;
      
      default:
        systemPrompt = 'You are a helpful workshop facilitator providing insights. NEVER fabricate statistics or specific examples not present in the data.';
        userPrompt = `Provide a concise 2-3 sentence insight about this workshop data:\n\n${JSON.stringify(data)}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const insight = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ insight }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-workshop-insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
