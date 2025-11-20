import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callWithFallback } from "../_shared/ai-fallback.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workshop_session_id } = await req.json();

    if (!workshop_session_id) {
      throw new Error('workshop_session_id is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Gather workshop data
    const { data: workshop, error: workshopError } = await supabaseClient
      .from('workshop_sessions')
      .select('*')
      .eq('id', workshop_session_id)
      .single();

    if (workshopError) throw workshopError;

    // Get simulation results
    const { data: simulations } = await supabaseClient
      .from('simulation_results')
      .select('*')
      .eq('workshop_session_id', workshop_session_id);

    // Get strategy addendum
    const { data: strategy } = await supabaseClient
      .from('strategy_addendum')
      .select('*')
      .eq('workshop_session_id', workshop_session_id)
      .maybeSingle();

    // Get pilot charter
    const { data: charter } = await supabaseClient
      .from('pilot_charter')
      .select('*')
      .eq('workshop_session_id', workshop_session_id)
      .maybeSingle();

    // Get effortless map items (voting results)
    const { data: mapItems } = await supabaseClient
      .from('effortless_map_items')
      .select('*')
      .eq('workshop_session_id', workshop_session_id)
      .order('vote_count', { ascending: false })
      .limit(5);

    // Construct AI prompt
    const systemPrompt = `You are an AI advisor synthesizing a leadership workshop into a decision framework.

Your task: Analyze the workshop data and generate a clear decision framework showing:
1. How this team makes AI decisions (who decides, what criteria, what gates)
2. Where the team disagrees (tension map)
3. Key concepts they need to understand AI orchestration
4. Next steps for using this framework

Be specific and evidence-based. Reference actual moments from the workshop.`;

    const userPrompt = `Workshop Data:

SIMULATIONS (${simulations?.length || 0} completed):
${simulations?.map(s => `
- ${s.simulation_name}
- Quality perception: ${s.quality_improvement_pct || 0}/100
- Time savings: ${s.time_savings_pct || 0}%
- Guardrails: ${s.guardrails ? 'Defined' : 'Not defined'}
`).join('\n') || 'No simulations completed'}

STRATEGIC ADDENDUM:
${strategy ? `
- Targets at risk: ${strategy.targets_at_risk || 'Not defined'}
- Data governance: ${strategy.data_governance_changes || 'Not defined'}
- Pilot KPIs: ${strategy.pilot_kpis || 'Not defined'}
` : 'Not completed'}

PILOT CHARTER:
${charter ? `
- Owner: ${charter.pilot_owner || 'Not assigned'}
- Sponsor: ${charter.executive_sponsor || 'Not assigned'}
- Budget: ${charter.pilot_budget ? `$${charter.pilot_budget}` : 'Not defined'}
- Kill criteria: ${charter.kill_criteria || 'Not defined'}
- Extend criteria: ${charter.extend_criteria || 'Not defined'}
- Scale criteria: ${charter.scale_criteria || 'Not defined'}
` : 'Not completed'}

VOTING RESULTS (Top Priorities):
${mapItems?.map((item, i) => `${i + 1}. ${item.item_text} (${item.vote_count} votes)`).join('\n') || 'No votes'}

Generate a decision framework with:

1. DECISION PROCESS: Describe how this team makes AI decisions (1-2 sentences)

2. DECISION CRITERIA: List 3-5 clear criteria they use (e.g., "Must show ROI within 90 days")

3. TENSION MAP: Identify 3 key disagreements observed in the workshop (e.g., "CFO wants proof, CTO wants speed")

4. KEY CONCEPTS: List 3 mental models they need for AI orchestration (with brief descriptions)

5. NEXT STEPS: 3 specific actions to use this framework in their next AI conversation

Format as JSON with these exact keys: decision_process, decision_criteria (array), tension_map (object with keys like risk_appetite, trust_in_ai, ownership), key_concepts (array of {title, description}), next_steps (array)`;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const aiResponse = await callWithFallback(
      systemPrompt,
      userPrompt,
      openaiApiKey || '',
      lovableApiKey || ''
    );

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      // If parsing fails, create a basic structure
      parsedResponse = {
        decision_process: aiResponse.substring(0, 200),
        decision_criteria: ['Budget approval required', 'Clear ROI within 90 days', 'Measurable KPIs'],
        tension_map: {
          risk_appetite: 'Team shows mixed risk tolerance',
          trust_in_ai: 'Varying levels of trust in AI capabilities',
          ownership: 'Need clearer ownership structure'
        },
        key_concepts: [
          { title: 'AI as Thinking Partner', description: 'Use AI to augment human judgment' },
          { title: 'Orchestration vs Automation', description: 'AI orchestrates workflows; humans decide' },
          { title: 'Guardrails over Governance', description: 'Design constraints, not policies' }
        ],
        next_steps: [
          'Use this framework in next vendor conversation',
          'Test decision criteria with a small pilot',
          'Schedule 30-day check-in to refine approach'
        ]
      };
    }

    // Save to database
    const { data: framework, error: frameworkError } = await supabaseClient
      .from('decision_frameworks')
      .upsert({
        workshop_session_id,
        decision_process: parsedResponse.decision_process,
        decision_criteria: parsedResponse.decision_criteria,
        tension_map: parsedResponse.tension_map,
        key_concepts: parsedResponse.key_concepts,
        sample_artifacts: {
          pilot_charter_id: charter?.id,
          strategy_addendum_id: strategy?.id
        },
        next_steps: parsedResponse.next_steps,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'workshop_session_id'
      })
      .select()
      .single();

    if (frameworkError) throw frameworkError;

    // Update workshop session
    await supabaseClient
      .from('workshop_sessions')
      .update({
        decision_framework_generated: true,
        tension_map: parsedResponse.tension_map,
        key_concepts_delivered: parsedResponse.key_concepts,
        updated_at: new Date().toISOString()
      })
      .eq('id', workshop_session_id);

    return new Response(
      JSON.stringify({ framework }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating decision framework:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});