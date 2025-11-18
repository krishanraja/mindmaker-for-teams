import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

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
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
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

Generate three sections:

1. **Strategic Targets at Risk**: Which 2026 goals are most threatened by identified bottlenecks? What competitive pressures require urgent action? Be specific and reference actual strategic goals. (3-4 sentences)

2. **Data & Governance Changes Required**: Based on the simulations conducted and guardrails needed, what data/governance infrastructure must change? Focus on prerequisites for AI adoption. (3-4 sentences)

3. **90-Day Pilot Success Metrics**: Define measurable success criteria for the pilot based on simulation performance and task breakdowns. Include weekly/monthly checkpoints. (3-4 bullet points)

Return ONLY valid JSON in this format:
{
  "targets_at_risk": "string",
  "data_governance_changes": "string",
  "pilot_kpis": "string"
}`;

    const userPrompt = `Risk tolerance: ${risk_tolerance < 34 ? 'CONSERVATIVE' : risk_tolerance < 67 ? 'BALANCED' : 'AGGRESSIVE'} (${risk_tolerance}/100)

Generate strategy insights now.`;

    console.log('Generating strategy insights for workshop:', workshop_session_id);

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

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in generate-strategy-insights:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
