import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario_context, simulation_results } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build AI prompt
    const systemPrompt = `You are an AI expert helping executives break down business processes into discrete tasks and categorize them by automation potential.

Analyze the provided scenario and simulation results, then generate a detailed task breakdown.

For each task, determine:
- ai-capable: AI can handle this independently based on observed performance
- ai-human: AI drafts or assists, human reviews and refines
- human-only: Requires judgment, relationships, or context AI doesn't have

Return ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "description": "Gather input data from department heads",
      "category": "human-only",
      "reasoning": "Requires relationship building and context interpretation"
    }
  ]
}`;

    const userPrompt = `Scenario: ${scenario_context?.currentState || 'Not provided'}

${simulation_results ? `AI Performance Observed: Time saved ${simulation_results.time_savings_pct}%, Quality improved ${simulation_results.quality_improvement_pct}%` : ''}

Break down this process into 5-8 discrete tasks and categorize each based on AI capability.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from AI response
    let parsed;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(
      JSON.stringify({ tasks: parsed.tasks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-task-breakdown:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});