import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { scenario_context, simulation_results, ai_output_quality, risk_tolerance = 50 } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GEMINI_SERVICE_ACCOUNT_KEY = Deno.env.get('GEMINI_SERVICE_ACCOUNT_KEY');
    
    if (!OPENAI_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('API keys not configured');
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

CRITICAL VALIDATION RULES:
- NEVER cite specific statistics, percentages, or timeframes not present in the data
- Base guardrails on the SPECIFIC SCENARIO and OBSERVED AI PERFORMANCE
- Use qualitative language ("significant", "moderate") instead of fabricated metrics
- Flag all assumptions explicitly with "ASSUMPTION:" prefix

CONTEXT: This is based on a real executive workshop where the team experimented with AI on: "${scenario_context?.currentState || 'a business process'}".

AI PERFORMANCE OBSERVED:
- Output Quality: ${ai_output_quality}/10
- Time Savings: ${simulation_results?.time_savings_pct || 'Unknown'}%
- Quality Improvement: ${simulation_results?.quality_improvement_pct || 'Unknown'}%
${simulation_results?.org_changes ? `- Organizational Changes Identified: ${simulation_results.org_changes}` : ''}

${getRiskGuidance(risk_tolerance)}

Generate structured guardrails for this scenario.`;

    const simulationTitle = scenario_context?.title || scenario_context?.currentState || 'Unknown Simulation';
    const userPrompt = `SCENARIO: ${simulationTitle}

CURRENT STATE: ${scenario_context?.currentState || 'Not provided'}
${scenario_context?.idealState ? `IDEAL STATE: ${scenario_context.idealState}` : ''}
${scenario_context?.painPoints ? `PAIN POINTS: ${scenario_context.painPoints.join(', ')}` : ''}

OBSERVED AI PERFORMANCE:
- Quality Rating: ${ai_output_quality}/10
${ai_output_quality < 7 ? '⚠️ Team observed significant limitations during testing' : '✓ Team was generally satisfied with AI output'}

RISK TOLERANCE SETTING: ${risk_tolerance < 34 ? 'CONSERVATIVE' : risk_tolerance < 67 ? 'BALANCED' : 'AGGRESSIVE'} (${risk_tolerance}/100)

Generate guardrails for this SPECIFIC scenario.`;

    console.log('🛡️ Generating guardrails for:', simulationTitle);

    const result = await callWithFallback({
      openAIKey: OPENAI_API_KEY,
      lovableKey: LOVABLE_API_KEY,
      geminiServiceAccount: GEMINI_SERVICE_ACCOUNT_KEY,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      maxTokens: 1500,
      tools: [{
        type: "function",
        function: {
          name: "generate_guardrails",
          description: "Return structured guardrails for AI implementation",
          parameters: {
            type: "object",
            properties: {
              guardrail: {
                type: "object",
                properties: {
                  riskIdentified: { 
                    type: "string", 
                    description: "What could go wrong with this AI use case (2-3 sentences)" 
                  },
                  humanCheckpoint: { 
                    type: "string", 
                    description: "Where humans must intervene with specific review points (2-3 sentences)" 
                  },
                  validationRequired: { 
                    type: "string", 
                    description: "How quality will be verified over time (2-3 sentences)" 
                  },
                  redFlags: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-5 specific conditions triggering immediate human override" 
                  }
                },
                required: ["riskIdentified", "humanCheckpoint", "validationRequired", "redFlags"]
              }
            },
            required: ["guardrail"]
          }
        }
      }],
      toolChoice: { type: 'function', function: { name: 'generate_guardrails' } }
    });

    console.log(`✅ Guardrails generated via ${result.provider} in ${result.latencyMs}ms`);

    // Parse tool call response
    let parsed;
    if (result.toolCalls && result.toolCalls.length > 0) {
      const toolCall = result.toolCalls[0];
      parsed = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback to regex parsing if tool calling failed
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    return new Response(JSON.stringify({ 
      ...parsed,
      _meta: {
        provider: result.provider,
        latencyMs: result.latencyMs,
        model: result.provider === 'gemini-rag' 
          ? 'gemini-2.0-flash' 
          : (result.provider === 'openai' ? 'gpt-4o-mini' : 'google/gemini-2.5-flash')
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Error in generate-guardrails:', error);
    
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
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
