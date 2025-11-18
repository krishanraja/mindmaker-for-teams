import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workshop_session_id, jargonLevel = 50 } = await req.json();
    
    if (!workshop_session_id) {
      throw new Error('workshop_session_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch workshop session
    const { data: workshop, error: workshopError } = await supabase
      .from('workshop_sessions')
      .select('*, bootcamp_plans(*), exec_intakes(*)')
      .eq('id', workshop_session_id)
      .single();

    if (workshopError) throw workshopError;

    console.log('Fetching comprehensive workshop data...');

    // Fetch ALL workshop data in parallel
    const [
      bottlenecks,
      mapItems,
      simulations,
      strategy,
      charter,
      workingInputs,
      preworkSubmissions,
      execPulses
    ] = await Promise.all([
      supabase.from('bottleneck_submissions').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('effortless_map_items').select('*').eq('workshop_session_id', workshop_session_id).order('vote_count', { ascending: false }),
      supabase.from('simulation_results').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('strategy_addendum').select('*').eq('workshop_session_id', workshop_session_id).maybeSingle(),
      supabase.from('pilot_charter').select('*').eq('workshop_session_id', workshop_session_id).maybeSingle(),
      supabase.from('working_group_inputs').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('pre_workshop_inputs').select('*').eq('intake_id', workshop.intake_id),
      supabase.from('exec_pulses').select('*').eq('intake_id', workshop.intake_id)
    ]);

    console.log('Data fetched:', {
      bottlenecks: bottlenecks.data?.length,
      simulations: simulations.data?.length,
      prework: preworkSubmissions.data?.length,
      workingInputs: workingInputs.data?.length
    });

    // Calculate urgency score
    const calculateUrgencyScore = () => {
      const bootcamp = workshop.bootcamp_plans;
      const intake = workshop.exec_intakes;
      
      // Timeline pressure (0-30 points)
      const timelinePressure = 25; // Default high urgency for 2026 goals
      
      // Competitive threat (0-25 points)
      const hasCompetitiveThreat = intake?.strategic_objectives_2026?.toLowerCase().includes('ahead') || 
                                   bootcamp?.competitive_landscape?.toLowerCase().includes('ahead');
      const competitiveThreat = hasCompetitiveThreat ? 25 : 15;
      
      // Bottleneck severity (0-20 points)
      const bottleneckCount = bottlenecks.data?.length || 0;
      const bottleneckSeverity = Math.min((bottleneckCount / 30) * 20, 20);
      
      // AI readiness (0-15 points) - inverse (lower readiness = higher urgency)
      const readinessMap: Record<string, number> = {
        'no_experience': 15,
        'experimenting': 12,
        'some_pilots': 8,
        'scaling': 4
      };
      const readiness = readinessMap[bootcamp?.ai_experience_level || 'experimenting'] || 12;
      
      // Market velocity (0-10 points)
      const marketVelocity = 8; // Default moderate-high
      
      return Math.round(timelinePressure + competitiveThreat + bottleneckSeverity + readiness + marketVelocity);
    };

    const urgencyScore = calculateUrgencyScore();

    // Extract rich simulation data
    const simulationDetails = simulations.data?.map(sim => ({
      name: sim.simulation_name,
      timeSavings: sim.time_savings_pct,
      costSavings: sim.cost_savings_usd,
      qualityImprovement: sim.quality_improvement_pct,
      qualityRating: sim.quality_rating,
      taskBreakdown: sim.task_breakdown,
      guardrails: sim.guardrails,
      discussionPrompts: sim.discussion_prompts,
      beforeSnapshot: sim.before_snapshot,
      afterSnapshot: sim.after_snapshot
    })) || [];

    // Extract task breakdown insights
    const allTasks = simulationDetails.flatMap(sim => 
      (sim.taskBreakdown || []).map((task: any) => ({
        description: task.description,
        category: task.category,
        aiCapability: task.aiCapability,
        humanOversight: task.humanOversight
      }))
    );

    // Extract guardrail insights
    const allGuardrails = simulationDetails.flatMap(sim => 
      sim.guardrails ? [sim.guardrails] : []
    );

    // Build comprehensive context
    const bootcamp = workshop.bootcamp_plans;
    const intake = workshop.exec_intakes;
    
    const contextData = {
      company: {
        name: intake?.company_name || 'Company',
        industry: intake?.industry || 'Unknown',
        strategicGoals: intake?.strategic_objectives_2026 || 'Not specified',
        competitiveLandscape: bootcamp?.competitive_landscape || 'Not specified'
      },
      preWorkshop: {
        aiExperience: bootcamp?.ai_experience_level || 'experimenting',
        anticipatedBottlenecks: intake?.anticipated_bottlenecks || [],
        aiMyths: bootcamp?.ai_myths_concerns || [],
        riskTolerance: bootcamp?.risk_tolerance || 50,
        pilotExpectations: bootcamp?.pilot_expectations || {},
        preworkResponses: preworkSubmissions.data?.map(pw => ({
          participant: pw.participant_name,
          responses: pw.pre_work_responses
        })) || []
      },
      workshop: {
        participantCount: workshop.participant_count || 0,
        bottlenecksIdentified: bottlenecks.data?.length || 0,
        bottleneckClusters: [...new Set(bottlenecks.data?.map(b => b.cluster_name).filter(Boolean))],
        topBottlenecks: bottlenecks.data?.slice(0, 5).map(b => b.bottleneck_text) || [],
        opportunitiesPrioritized: mapItems.data?.length || 0,
        topOpportunities: mapItems.data?.slice(0, 5).map(m => ({
          text: m.item_text,
          votes: m.vote_count,
          lane: m.lane
        })) || [],
        simulationsRun: simulations.data?.length || 0,
        pilotChartered: !!charter.data
      },
      simulations: {
        details: simulationDetails,
        avgTimeSavings: simulationDetails.length > 0 
          ? Math.round(simulationDetails.reduce((sum, s) => sum + (s.timeSavings || 0), 0) / simulationDetails.length)
          : 0,
        avgQualityRating: simulationDetails.length > 0
          ? Math.round(simulationDetails.reduce((sum, s) => sum + (s.qualityRating || 0), 0) / simulationDetails.length * 10) / 10
          : 0,
        tasks: allTasks,
        guardrails: allGuardrails
      },
      strategy: {
        targetsAtRisk: strategy?.data?.targets_at_risk,
        dataGovernance: strategy?.data?.data_governance_changes,
        pilotKPIs: strategy?.data?.pilot_kpis,
        workingGroupInputs: workingInputs.data?.map(w => ({
          category: w.input_category,
          text: w.input_text,
          participant: w.participant_name
        })) || []
      },
      charter: {
        pilotOwner: charter?.data?.pilot_owner,
        executiveSponsor: charter?.data?.executive_sponsor,
        pilotBudget: charter?.data?.pilot_budget,
        milestones: {
          d10: charter?.data?.milestone_d10,
          d30: charter?.data?.milestone_d30,
          d60: charter?.data?.milestone_d60,
          d90: charter?.data?.milestone_d90
        }
      }
    };

    // Generate jargon guidance
    const getJargonGuidance = (level: number) => {
      if (level < 33) return "Use only plain English. Avoid ALL acronyms, technical terms, and industry jargon. Explain concepts as if to someone with no business or tech background.";
      if (level < 67) return "Balance plain English with industry terms. Define acronyms on first use. Keep language accessible to smart generalists.";
      return "Use industry-standard terminology and acronyms freely. Assume expert audience familiar with business and AI concepts.";
    };

    const systemPrompt = `You are a world-class McKinsey consultant synthesizing an AI readiness workshop for executive leadership.

CONTEXT: This team completed a comprehensive 3-hour hands-on workshop where they:
1. Pre-work: Shared anticipated bottlenecks, AI concerns, and strategic context
2. Discovery: Identified actual bottlenecks through collaborative exercises
3. Experimentation: Ran live AI simulations on real scenarios
4. Risk Mitigation: Designed guardrails and safety frameworks
5. Task Breakdown: Analyzed human vs AI capabilities
6. Strategic Planning: Developed pilot charters and working group recommendations

YOUR ROLE: Create an executive-ready synthesis that:
- Shows the JOURNEY (what changed from pre-work assumptions to hands-on reality)
- Uses SPECIFIC DATA from the workshop (quote actual metrics, reference real scenarios tested, name participants when relevant)
- Balances INSIGHT with EVIDENCE (every claim must have supporting workshop data)
- Maintains EXECUTIVE TONE (clear, decisive, actionable, no fluff)
- NEVER fabricates statistics - if specific numbers aren't in the data, describe impact qualitatively

${getJargonGuidance(jargonLevel)}

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "executiveSummary": "200-250 word narrative showing the workshop journey from pre-work to final insights",
  "strengths": [
    {
      "title": "Clear, specific strength (no character limits)",
      "evidence": "Concrete data from workshop proving this strength (quote metrics, scenarios, participant insights)",
      "impact": "Why this matters strategically for 2026 goals"
    }
  ],
  "gaps": [
    {
      "title": "Specific gap identified (no character limits)",
      "evidence": "Workshop data showing this gap exists",
      "recommendation": "Concrete next step with timeline"
    }
  ],
  "journeyInsights": {
    "mythsBusted": "What pre-work assumptions were challenged during hands-on experimentation?",
    "surprisingFindings": "What unexpected insights emerged from simulations?",
    "momentsOfClarity": "Key breakthroughs during the workshop"
  },
  "participantHighlights": [
    {
      "quote": "Actual quote or paraphrased insight from working group",
      "attribution": "Role or name (if available)",
      "context": "When/why this was said"
    }
  ],
  "urgencyVerdict": "100-150 words answering: If an AI-native competitor launched tomorrow with access to this company's data and processes, what would happen? Use workshop data to make this concrete."
}`;

    const userPrompt = `Analyze this AI readiness workshop for ${contextData.company.name}:

=== COMPANY CONTEXT ===
Industry: ${contextData.company.industry}
AI Experience: ${contextData.preWorkshop.aiExperience}
Strategic Goals 2026: ${contextData.company.strategicGoals}
Competitive Context: ${contextData.company.competitiveLandscape}

=== PRE-WORKSHOP STATE ===
Anticipated Bottlenecks: ${JSON.stringify(contextData.preWorkshop.anticipatedBottlenecks)}
AI Myths/Concerns: ${JSON.stringify(contextData.preWorkshop.aiMyths)}
Risk Tolerance: ${contextData.preWorkshop.riskTolerance}/100
Pilot Expectations: ${JSON.stringify(contextData.preWorkshop.pilotExpectations)}

Pre-work Submissions (${contextData.preWorkshop.preworkResponses.length} participants):
${contextData.preWorkshop.preworkResponses.map(pw => `- ${pw.participant}: ${JSON.stringify(pw.responses)}`).join('\n')}

=== PHASE 1: DISCOVERY ===
Bottlenecks Identified: ${contextData.workshop.bottlenecksIdentified} (vs ${contextData.preWorkshop.anticipatedBottlenecks.length} anticipated)
Clusters Emerged: ${contextData.workshop.bottleneckClusters.join(', ')}
Top Issues: ${contextData.workshop.topBottlenecks.join('; ')}

=== PHASE 2: EXPERIMENTATION ===
Simulations Run: ${contextData.workshop.simulationsRun}
Scenarios Tested: ${contextData.simulations.details.map(s => s.name).join(', ')}

Simulation Results:
${contextData.simulations.details.map(s => `
- ${s.name}:
  Time Savings: ${s.timeSavings}%
  Quality Rating: ${s.qualityRating}/10
  Cost Impact: $${s.costSavings}
  Key Tasks: ${JSON.stringify(s.taskBreakdown?.slice(0, 3))}
  Guardrails: ${JSON.stringify(s.guardrails)}
`).join('\n')}

Average Performance:
- Time Savings: ${contextData.simulations.avgTimeSavings}%
- Quality Rating: ${contextData.simulations.avgQualityRating}/10

=== PHASE 3: RISK MITIGATION ===
Guardrails Designed: ${allGuardrails.length}
Risk Frameworks: ${JSON.stringify(allGuardrails)}

=== PHASE 4: TASK BREAKDOWN ===
Tasks Analyzed: ${allTasks.length}
AI-Capable Tasks: ${allTasks.filter((t: any) => t.category === 'ai-human' || t.category === 'ai-only').length}
Human-Only Tasks: ${allTasks.filter((t: any) => t.category === 'human-only').length}

=== PHASE 5: STRATEGIC PLANNING ===
Opportunities Prioritized: ${contextData.workshop.opportunitiesPrioritized}
Top Opportunities:
${contextData.workshop.topOpportunities.map(o => `- ${o.text} (${o.votes} votes, ${o.lane} lane)`).join('\n')}

Working Group Strategic Inputs (${contextData.strategy.workingGroupInputs.length}):
${contextData.strategy.workingGroupInputs.map(w => `- [${w.category}] ${w.text} - ${w.participant}`).join('\n')}

Pilot Charter:
- Owner: ${contextData.charter.pilotOwner || 'TBD'}
- Sponsor: ${contextData.charter.executiveSponsor || 'TBD'}
- Budget: $${contextData.charter.pilotBudget || 'TBD'}
- Milestones: ${JSON.stringify(contextData.charter.milestones)}

Strategy Addendum:
- Targets at Risk: ${contextData.strategy.targetsAtRisk}
- Data/Governance: ${contextData.strategy.dataGovernance}
- Pilot KPIs: ${contextData.strategy.pilotKPIs}

=== YOUR ANALYSIS ===
Generate the JSON structure with 4-5 strengths, 4-5 gaps, journey insights, participant highlights, and urgency verdict.
Base everything on the data above. Show the progression from pre-work assumptions to workshop reality.`;

    console.log('Calling Lovable AI for synthesis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway Error:', errorText);
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiSynthesis = aiData.choices[0].message.content;

    // Return comprehensive report data
    return new Response(
      JSON.stringify({
        success: true,
        reportData: {
          workshop,
          bottlenecks: bottlenecks.data,
          mapItems: mapItems.data,
          simulations: simulations.data,
          strategy: strategy.data,
          charter: charter.data,
          workingInputs: workingInputs.data,
          urgencyScore,
          roiMetrics,
          contextData
        },
        aiSynthesis,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating provocation report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
