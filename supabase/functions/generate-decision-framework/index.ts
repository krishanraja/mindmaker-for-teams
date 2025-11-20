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
    const systemPrompt = `You are an executive facilitator synthesizing an Alignment Sprint workshop into a decision framework.

CONTEXT: This was NOT an AI implementation workshop. This was a leadership alignment session where the team battle-tested their ability to make AI decisions together.

Your task: Analyze the workshop data to reveal:
1. **Decision Process**: HOW this team actually makes AI decisions (not how they say they do)
   - Who has veto power? Who defers? Who drives?
   - What criteria emerge in practice vs in theory?
   - What gates/approvals are implicitly required?

2. **Tension Map**: WHERE the team is misaligned (this is the most valuable insight)
   - Risk appetite tensions (who wants proof vs who wants speed)
   - Trust in AI (who believes output quality vs who's skeptical)
   - Ownership clarity (who owns execution vs who sponsors)
   - Resource allocation (budget hawks vs experimenters)

3. **Key Concepts**: Mental models they need for AI orchestration (not automation)
   - AI as thinking partner vs replacement
   - Orchestration (human decides) vs automation (AI decides)
   - Guardrails over governance
   - Task breakdown: what AI does vs what humans must do

4. **Next Steps**: How to USE this framework in their next AI conversation
   - Apply decision criteria to vendor pitch
   - Test ownership model with small pilot
   - Use tension map to set expectations

CRITICAL: Be evidence-based. Reference actual moments from the workshop (simulations, charter debates, voting patterns). If you saw disagreement, NAME IT. If you saw consensus, VALIDATE IT.`;

    const userPrompt = `Workshop Data - Battle Test Results:

BATTLE TEST #1: AI PERFORMANCE (${simulations?.length || 0} simulations)
${simulations?.map(s => `
→ Scenario: ${s.simulation_name}
  - Time efficiency: ${s.time_savings_pct || 0}% improvement
  - Quality perception: ${s.quality_improvement_pct || 0}/100
  - Guardrails defined: ${s.guardrails ? 'Yes' : 'No'}
  - Team reactions: ${s.team_reactions ? JSON.stringify(s.team_reactions) : 'Not captured'}
  - Disagreement points: ${s.disagreement_points?.join(', ') || 'None noted'}
`).join('\n') || 'No simulations completed'}

BATTLE TEST #2: STRATEGIC TRADE-OFFS
${strategy ? `
→ Risk Tolerance Set: ${strategy.risk_tolerance || 'Not set'}/100
→ Targets at risk discussion: ${strategy.targets_at_risk || 'Not discussed'}
→ Data governance position: ${strategy.data_governance_changes || 'Not defined'}
→ Pilot KPIs agreed: ${strategy.pilot_kpis || 'Not defined'}
` : '→ Not completed (team couldn\'t converge on strategic criteria)'}

BATTLE TEST #3: OWNERSHIP & GATES
${charter ? `
→ Pilot Owner: ${charter.pilot_owner || 'NO OWNER ASSIGNED'}
→ Executive Sponsor: ${charter.executive_sponsor || 'NO SPONSOR ASSIGNED'}
→ Budget: ${charter.pilot_budget ? `$${charter.pilot_budget}` : 'NO BUDGET AGREED'}
→ Kill criteria: ${charter.kill_criteria || 'NO KILL CRITERIA'}
→ Extend criteria: ${charter.extend_criteria || 'NO EXTEND CRITERIA'}
→ Scale criteria: ${charter.scale_criteria || 'NO SCALE CRITERIA'}
` : '→ Not completed (team couldn\'t agree on ownership/accountability)'}

VOTING PATTERNS (Reveals Priorities):
${mapItems?.map((item, i) => `${i + 1}. "${item.item_text}" - ${item.vote_count} votes`).join('\n') || 'No voting data'}

ANALYSIS INSTRUCTIONS:

1. **DECISION PROCESS** (1-2 sentences):
   Observe WHO drove decisions in each battle test. Who had veto power? Who deferred? Who needed consensus?
   Example: "CFO holds budget veto; CTO proposes; COO validates execution feasibility before committing."

2. **DECISION CRITERIA** (3-5 items):
   What filters did they use? Extract from their actual behavior, not aspirations.
   Examples: "Must show ROI within 90 days", "Requires legal review for customer-facing AI", "Cannot exceed $50k without board approval"

3. **TENSION MAP** (object with 3-4 tension types):
   {
     "risk_appetite": "CFO wants proof before pilot; CTO wants to experiment fast",
     "trust_in_ai": "Operations believes AI can handle X; Legal skeptical of Y",
     "ownership": "No clear owner emerged - accountability gap",
     "resource_allocation": "Exec sponsor committed; pilot owner hesitant on budget"
   }

4. **KEY CONCEPTS** (3 mental models):
   [
     {
       "title": "AI as Thinking Partner",
       "description": "Use AI to augment human judgment, not replace it. Example: AI drafts, human edits."
     },
     {
       "title": "Orchestration vs Automation",
       "description": "AI orchestrates workflows; humans make final calls. Example: AI prioritizes tasks, human approves."
     },
     {
       "title": "Guardrails over Governance",
       "description": "Design constraints early; avoid policy paralysis. Example: Human-in-loop for customer impact."
     }
   ]

5. **NEXT STEPS** (3 actions):
   [
     "Use these decision criteria in your next vendor conversation to test alignment",
     "Address the [specific tension] by clarifying [specific thing]",
     "Schedule 30-day check-in to see if framework held up in practice"
   ]

Format as JSON with these exact keys: decision_process, decision_criteria (array), tension_map (object), key_concepts (array of objects), next_steps (array)`;

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