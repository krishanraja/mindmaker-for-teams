import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callWithFallback } from '../_shared/ai-fallback.ts';

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
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GEMINI_SERVICE_ACCOUNT_KEY = Deno.env.get('GEMINI_SERVICE_ACCOUNT_KEY');
    
    if (!OPENAI_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('API keys not configured');
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

CRITICAL VALIDATION RULES:
- NEVER cite specific statistics, percentages, or timeframes not present in the data
- Base task breakdown on the SPECIFIC SCENARIO provided
- Use qualitative language ("significant", "moderate") instead of fabricated metrics

${getAutomationGuidance(automation_preference)}

For each task, determine:
- ai-capable: AI can handle this independently based on observed performance
- ai-human: AI drafts or assists, human reviews and refines
- human-only: Requires judgment, relationships, or context AI doesn't have

Return structured task breakdown.`;

    const simulationTitle = scenario_context?.title || scenario_context?.currentState || 'Unknown Simulation';
    const userPrompt = `SCENARIO: ${simulationTitle}

CURRENT STATE: ${scenario_context?.currentState || 'Not provided'}

${scenario_context?.idealState ? `IDEAL STATE: ${scenario_context.idealState}` : ''}

${scenario_context?.painPoints ? `PAIN POINTS: ${scenario_context.painPoints.join(', ')}` : ''}

${simulation_results ? `AI PERFORMANCE OBSERVED: 
- Time saved: ${simulation_results.time_savings_pct}%
- Quality improved: ${simulation_results.quality_improvement_pct}%
- Cost savings: $${simulation_results.cost_savings_usd || 0}` : ''}

Break down this SPECIFIC process into 5-8 discrete tasks that are DIRECTLY RELEVANT to the scenario above.`;

    console.log('🔧 Generating task breakdown for:', simulationTitle);

    const result = await callWithFallback({
      openAIKey: OPENAI_API_KEY,
      lovableKey: LOVABLE_API_KEY,
      geminiServiceAccount: GEMINI_SERVICE_ACCOUNT_KEY,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 1500
    });

    console.log(`✅ Task breakdown generated via ${result.provider} in ${result.latencyMs}ms`);

    // Parse JSON from AI response
    let parsed;
    try {
      const jsonMatch = result.content.match(/```json\n([\s\S]*?)\n```/) || 
                        result.content.match(/```\n([\s\S]*?)\n```/) ||
                        result.content.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : result.content;
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error('❌ Failed to parse AI response:', result.content);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(
      JSON.stringify({ tasks: parsed.tasks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in generate-task-breakdown:', error);
    
    // Handle rate limit and payment errors gracefully
    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      return new Response(JSON.stringify({ 
        error: 'AI service temporarily unavailable due to high demand. Please try again in 1 minute.',
        errorCode: 'RATE_LIMIT',
        retryAfter: 60
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (error.message?.includes('PAYMENT_REQUIRED')) {
      return new Response(JSON.stringify({ 
        error: 'AI service requires payment. Please contact support.',
        errorCode: 'PAYMENT_REQUIRED'
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
