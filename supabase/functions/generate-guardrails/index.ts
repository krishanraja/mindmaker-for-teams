import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { scenario_context, simulation_results, ai_output_quality, risk_tolerance = 50 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const getRiskGuidance = (tolerance: number): string => {
      if (tolerance < 34) {
        return `Take a CONSERVATIVE approach: Design comprehensive guardrails with strict human checkpoints. Assume AI will make mistakes and build extensive validation layers. Err on the side of caution - when in doubt, add more oversight.`;
      } else if (tolerance < 67) {
        return `Take a BALANCED approach: Design guardrails that reflect the observed AI performance. Where AI performed well, lighter oversight is acceptable. Where limitations were observed, add appropriate checkpoints.`;
      } else {
        return `Take an AGGRESSIVE approach: Trust the AI's demonstrated capabilities. Focus guardrails on true edge cases and high-stakes decisions only. Minimize bureaucratic overhead while maintaining essential safeguards.`;
      }
    };

    const systemPrompt = `You are an AI risk and governance expert helping executives design responsible guardrails for AI implementation.

CONTEXT: This is based on a real executive workshop where the team experimented with AI on: "${scenario_context?.currentState || 'a business process'}".

AI PERFORMANCE OBSERVED:
- Output Quality: ${ai_output_quality}/10
- Time Savings: ${simulation_results?.time_savings_pct || 'Unknown'}%
- Quality Improvement: ${simulation_results?.quality_improvement_pct || 'Unknown'}%
${simulation_results?.org_changes ? `- Organizational Changes Identified: ${simulation_results.org_changes}` : ''}

${getRiskGuidance(risk_tolerance)}

Your task is to generate:
1. **riskIdentified**: What could go wrong with this specific AI use case? Be concrete and scenario-specific. (2-3 sentences)
2. **humanCheckpoint**: Where must humans intervene? Define specific review points. (2-3 sentences)
3. **validationRequired**: How will quality be verified over time? Define testing approach. (2-3 sentences)
4. **redFlags**: Array of 3-5 specific conditions that should trigger immediate human override.

Return ONLY valid JSON in this exact format:
{
  "guardrail": {
    "riskIdentified": "string",
    "humanCheckpoint": "string",
    "validationRequired": "string",
    "redFlags": ["string", "string", "string"]
  }
}`;

    const simulationTitle = scenario_context?.title || scenario_context?.currentState || 'Unknown Simulation';
    const userPrompt = `SCENARIO: ${simulationTitle}

CURRENT STATE: ${scenario_context?.currentState || 'Not provided'}
${scenario_context?.idealState ? `IDEAL STATE: ${scenario_context.idealState}` : ''}
${scenario_context?.painPoints ? `PAIN POINTS: ${scenario_context.painPoints.join(', ')}` : ''}

OBSERVED AI PERFORMANCE:
- Quality Rating: ${ai_output_quality}/10
${ai_output_quality < 7 ? '⚠️ Team observed significant limitations during testing' : '✓ Team was generally satisfied with AI output'}

RISK TOLERANCE SETTING: ${risk_tolerance < 34 ? 'CONSERVATIVE' : risk_tolerance < 67 ? 'BALANCED' : 'AGGRESSIVE'} (${risk_tolerance}/100)

Generate guardrails for this SPECIFIC scenario. Be concrete and actionable. Reference the actual business context.`;

    console.log('Generating guardrails with prompt:', userPrompt);

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    console.log('AI response:', content);

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-guardrails:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
