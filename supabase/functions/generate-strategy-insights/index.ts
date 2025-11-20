import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
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
    const { workshop_session_id, risk_tolerance = 50 } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GEMINI_SERVICE_ACCOUNT_KEY = Deno.env.get('GEMINI_SERVICE_ACCOUNT_KEY');
    
    if (!OPENAI_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('API keys not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch workshop data
    const { data: workshopSession } = await supabase
      .from('workshop_sessions')
      .select('*, bootcamp_plans(*), exec_intakes(*)')
      .eq('id', workshop_session_id)
      .single();

    const { data: opportunities } = await supabase
      .from('effortless_map_items')
      .select('*')
      .eq('workshop_session_id', workshop_session_id)
      .order('vote_count', { ascending: false })
      .limit(5);

    const { data: simulations } = await supabase
      .from('simulation_results')
      .select('*')
      .eq('workshop_session_id', workshop_session_id);

    const { data: bottlenecks } = await supabase
      .from('bottleneck_submissions')
      .select('bottleneck_text, cluster_name')
      .eq('workshop_session_id', workshop_session_id);

    const { data: workingGroupInputs } = await supabase
      .from('strategy_addendum')
      .select('working_group_inputs')
      .eq('workshop_session_id', workshop_session_id)
      .single();

    const getRiskGuidance = (tolerance: number): string => {
      if (tolerance < 34) {
        return `Take a CONSERVATIVE approach: Recommend extensive oversight, longer pilot phases, and cautious rollout plans. Emphasize risk mitigation over speed.`;
      } else if (tolerance < 67) {
        return `Take a BALANCED approach: Recommend measured progress with appropriate checkpoints. Balance innovation with responsible governance.`;
      } else {
        return `Take an AGGRESSIVE approach: Recommend bold action with streamlined oversight. Focus on speed-to-value while maintaining essential safeguards.`;
      }
    };

    const bootcampPlan = workshopSession?.bootcamp_plans;
    const strategicGoals = bootcampPlan?.strategic_goals_2026 || [];
    const competitiveLandscape = bootcampPlan?.competitive_landscape || 'Not provided';

    const systemPrompt = `You are an executive strategy advisor synthesizing workshop insights into actionable recommendations.

CRITICAL VALIDATION RULES:
- NEVER cite specific statistics, percentages, or timeframes not present in the data
- If asked to quantify something without data, say "Insufficient data to quantify"
- Flag all assumptions explicitly with "ASSUMPTION:" prefix
- Reference actual workshop data points when making claims
- Use qualitative language ("significant", "moderate") instead of fabricated metrics

WORKSHOP CONTEXT:
- Company: ${workshopSession?.exec_intakes?.company_name || 'Unknown'}
- Industry: ${workshopSession?.exec_intakes?.industry || 'Not specified'}
- Strategic Goals (2026): ${strategicGoals.join(', ') || 'Not provided'}
- Competitive Landscape: ${competitiveLandscape}

TOP OPPORTUNITIES IDENTIFIED:
${opportunities?.map((o, i) => `${i + 1}. ${o.item_text} (${o.vote_count} votes, ${o.lane} lane)`).join('\n') || 'None'}

BOTTLENECKS OBSERVED:
${bottlenecks?.map(b => `- ${b.bottleneck_text}${b.cluster_name ? ` (${b.cluster_name})` : ''}`).join('\n') || 'None'}

SIMULATION PERFORMANCE:
${simulations?.map(s => `- ${s.simulation_name}: ${s.time_savings_pct || 0}% time savings, ${s.quality_improvement_pct || 0}% quality improvement`).join('\n') || 'None conducted'}

${getRiskGuidance(risk_tolerance)}

Generate strategic insights in structured format.`;

    const userPrompt = `Risk tolerance: ${risk_tolerance < 34 ? 'CONSERVATIVE' : risk_tolerance < 67 ? 'BALANCED' : 'AGGRESSIVE'} (${risk_tolerance}/100)

Generate strategy insights now.`;

    console.log('🎯 Generating strategy insights for workshop:', workshop_session_id);

    const result = await callWithFallback({
      openAIKey: OPENAI_API_KEY,
      lovableKey: LOVABLE_API_KEY,
      geminiServiceAccount: GEMINI_SERVICE_ACCOUNT_KEY,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      modelOverride: { gemini: 'google/gemini-2.5-pro' },
      temperature: 0.5,
      maxTokens: 2000,
      tools: [{
        type: "function",
        function: {
          name: "strategy_insights",
          description: "Return strategic insights in structured format",
          parameters: {
            type: "object",
            properties: {
              targets_at_risk: { 
                type: "string", 
                description: "Which 2026 goals are most threatened by identified bottlenecks (3-4 sentences)" 
              },
              data_governance_changes: { 
                type: "string", 
                description: "Required data/governance infrastructure changes based on simulations (3-4 sentences)" 
              },
              pilot_kpis: { 
                type: "string", 
                description: "Measurable success criteria for 90-day pilot (3-4 bullet points)" 
              }
            },
            required: ["targets_at_risk", "data_governance_changes", "pilot_kpis"]
          }
        }
      }],
      toolChoice: { type: 'function', function: { name: 'strategy_insights' } }
    });

    console.log(`✅ Strategy insights generated via ${result.provider} in ${result.latencyMs}ms`);

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
      insights: parsed,
      _meta: {
        provider: result.provider,
        latencyMs: result.latencyMs,
        model: result.provider === 'gemini-rag' 
          ? 'gemini-2.0-flash' 
          : (result.provider === 'openai' ? 'gpt-4o-mini' : 'google/gemini-2.5-pro')
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Error in generate-strategy-insights:', error);
    
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
