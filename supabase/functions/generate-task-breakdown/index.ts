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
    const { scenario_context, simulation_results, automation_preference = 50, simulation_id } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build AI prompt with automation guidance
    const getAutomationGuidance = (preference: number): string => {
      if (preference < 34) {
        return "Take a CONSERVATIVE approach: favor human oversight and judgment. Only mark tasks as 'ai-capable' if you're highly confident AI can handle them independently. When in doubt, use 'ai-human' or 'human-only'.";
      } else if (preference < 67) {
        return "Take a BALANCED approach: distribute tasks evenly across categories based on genuine capability assessment.";
      } else {
        return "Take an AGGRESSIVE approach: favor AI automation where feasible. Mark tasks as 'ai-capable' if AI can reasonably handle them with acceptable quality. Reserve 'human-only' for tasks that truly require human judgment, relationships, or context.";
      }
    };
    
    const systemPrompt = `You are an AI expert helping executives break down business processes into discrete tasks and categorize them by automation potential.

CONTEXT: This is a real executive workshop analyzing "${scenario_context?.currentState || 'a business process'}".

${getAutomationGuidance(automation_preference)}

For each task, determine:
- ai-capable: AI can handle this independently based on observed performance
- ai-human: AI drafts or assists, human reviews and refines
- human-only: Requires judgment, relationships, or context AI doesn't have

CRITICAL: Base your task breakdown on the SPECIFIC SCENARIO provided. If this is about "Board Deck Crisis Mode", tasks should be specific to board presentations (gathering data, drafting slides, incorporating feedback). If this is about "Contract Review", tasks should be specific to legal review (clause analysis, risk identification, redlining).

Return ONLY valid JSON in this exact format:
{
  "tasks": [
    {
      "description": "Specific task related to the scenario",
      "category": "ai-capable" | "ai-human" | "human-only",
      "reasoning": "Why this category fits based on the scenario context"
    }
  ]
}`;

    const simulationTitle = scenario_context?.title || scenario_context?.currentState || 'Unknown Simulation';
    const userPrompt = `SCENARIO: ${simulationTitle}

CURRENT STATE: ${scenario_context?.currentState || 'Not provided'}

${scenario_context?.idealState ? `IDEAL STATE: ${scenario_context.idealState}` : ''}

${scenario_context?.painPoints ? `PAIN POINTS: ${scenario_context.painPoints.join(', ')}` : ''}

${simulation_results ? `AI PERFORMANCE OBSERVED: 
- Time saved: ${simulation_results.time_savings_pct}%
- Quality improved: ${simulation_results.quality_improvement_pct}%
- Cost savings: $${simulation_results.cost_savings_usd || 0}` : ''}

Break down this SPECIFIC process into 5-8 discrete tasks that are DIRECTLY RELEVANT to the scenario above. Do not provide generic tasks. Each task should be something an executive would recognize as part of this specific workflow.`;

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