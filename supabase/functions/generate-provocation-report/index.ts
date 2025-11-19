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
      execPulses,
      votingResults,
      huddleSynthesis
    ] = await Promise.all([
      supabase.from('bottleneck_submissions').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('effortless_map_items').select('*').eq('workshop_session_id', workshop_session_id).order('vote_count', { ascending: false }),
      supabase.from('simulation_results').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('strategy_addendum').select('*').eq('workshop_session_id', workshop_session_id).maybeSingle(),
      supabase.from('pilot_charter').select('*').eq('workshop_session_id', workshop_session_id).maybeSingle(),
      supabase.from('working_group_inputs').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('pre_workshop_inputs').select('*').eq('intake_id', workshop.intake_id),
      supabase.from('exec_pulses').select('*').eq('intake_id', workshop.intake_id),
      supabase.from('voting_results').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('huddle_synthesis').select('*').eq('workshop_session_id', workshop_session_id).maybeSingle()
    ]);

    console.log('Data fetched:', {
      bottlenecks: bottlenecks.data?.length,
      simulations: simulations.data?.length,
      prework: preworkSubmissions.data?.length,
      workingInputs: workingInputs.data?.length,
      votingResults: votingResults.data?.length,
      huddleSynthesis: huddleSynthesis.data ? 'present' : 'absent',
      mapItems: mapItems.data?.length,
      strategy: strategy.data ? 'present' : 'absent',
      charter: charter.data ? 'present' : 'absent'
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
        'production_use': 5
      };
      const aiReadiness = readinessMap[bootcamp?.ai_experience_level || 'no_experience'] || 12;
      
      // Participation signal (0-10 points) - high engagement = higher urgency
      const participationRate = preworkSubmissions.data?.length || 0;
      const participationSignal = Math.min((participationRate / 10) * 10, 10);
      
      const total = timelinePressure + competitiveThreat + bottleneckSeverity + aiReadiness + participationSignal;
      return Math.min(total, 100);
    };

    const urgencyScore = Math.round(calculateUrgencyScore());

    // Extract strategic goals from strategy addendum if intake doesn't have them
    const extractedStrategicGoals = strategy?.data?.targets_at_risk 
      ? strategy.data.targets_at_risk.match(/'([^']+)'/g)?.map(g => g.replace(/'/g, '')) || []
      : [];
    
    // Build derived goals from workshop activities
    const derivedGoals: string[] = [];
    if (strategy?.data?.targets_at_risk) {
      derivedGoals.push(`Mitigate strategic risks: ${strategy.data.targets_at_risk.slice(0, 100)}`);
    }
    if (bottlenecks.data && bottlenecks.data.length > 0) {
      const topClusters = [...new Set(bottlenecks.data.map(b => b.cluster_name).filter(Boolean))].slice(0, 2);
      if (topClusters.length > 0) {
        derivedGoals.push(`Address operational bottlenecks in: ${topClusters.join(', ')}`);
      }
    }

    // Prioritize: 1) Intake goals, 2) Derived goals, 3) Extracted strategy goals, 4) Professional TBD
    const strategicGoalsText = workshop.exec_intakes?.strategic_objectives_2026 || 
                               (derivedGoals.length > 0 
                                 ? derivedGoals.join('; ')
                                 : extractedStrategicGoals.length > 0 
                                   ? extractedStrategicGoals.join(', ')
                                   : 'Strategic goals to be defined during pilot planning');

    const getRiskLabel = (tolerance: number): string => {
      if (tolerance >= 75) return 'High';
      if (tolerance >= 50) return 'Balanced';
      if (tolerance >= 25) return 'Conservative';
      return 'Risk-averse';
    };

    // Extract rich simulation data with rounded metrics
    const simulationDetails = simulations.data?.map(sim => ({
      name: sim.simulation_name,
      timeSavings: Math.round(sim.time_savings_pct || 0),
      costSavings: sim.cost_savings_usd ? Math.round(sim.cost_savings_usd) : null,
      qualityImprovement: Math.round(sim.quality_improvement_pct || 0),
      qualityRating: Math.round((sim.quality_rating || 0) * 10) / 10, // 1 decimal for quality
      taskBreakdown: sim.task_breakdown,
      guardrails: sim.guardrails,
      discussionPrompts: sim.discussion_prompts,
      beforeSnapshot: sim.before_snapshot,
      afterSnapshot: sim.after_snapshot
    })) || [];

    // Aggregate simulation metrics (kill the duplicates)
    const simulationMetrics = {
      count: simulationDetails.length,
      medianTimeSavings: simulationDetails.length > 0 
        ? Math.round(
            simulationDetails
              .map(s => s.timeSavings)
              .sort((a, b) => a - b)[Math.floor(simulationDetails.length / 2)]
          )
        : 0,
      medianQuality: simulationDetails.length > 0
        ? Math.round(
            simulationDetails
              .map(s => s.qualityRating)
              .sort((a, b) => a - b)[Math.floor(simulationDetails.length / 2)] * 10
          ) / 10
        : 0,
      highlights: [
        // Best result
        ...simulationDetails.sort((a, b) => (b.timeSavings || 0) - (a.timeSavings || 0)).slice(0, 1),
        // Typical result (median performer)
        simulationDetails[Math.floor(simulationDetails.length / 2)],
        // Edge case (lowest performer or quality concern)
        simulationDetails.find(s => s.qualityRating < 6) || simulationDetails[simulationDetails.length - 1]
      ].filter(Boolean).slice(0, 3) // Max 3 highlights
    };

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

    // Extract top opportunities for derived goals
    const topOpportunities = mapItems.data?.filter(item => item.lane === 'opportunity')
      .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)) || [];
    
    const topBottleneckCluster = [...new Set(bottlenecks.data?.map(b => b.cluster_name).filter(Boolean))][0];

    // Extract guardrails analysis from all simulations
    const allGuardrailsData = simulations.data?.flatMap(sim => {
      if (!sim.guardrails) return [];
      const g = sim.guardrails as any;
      return [{
        riskIdentified: g.riskIdentified || g.risk_identified || '',
        humanCheckpoint: g.humanCheckpoint || g.human_checkpoint || '',
        redFlags: g.redFlags || g.red_flags || []
      }];
    }) || [];
    
    const guardrailsCount = allGuardrailsData.length;
    const redFlagsCount = allGuardrailsData.reduce((count, g) => count + (g.redFlags?.length || 0), 0);
    const topGuardrail = allGuardrailsData[0]?.humanCheckpoint || 'Human oversight frameworks to be designed';

    // Extract task breakdown analysis from all simulations
    const allTasksData = simulations.data?.flatMap(sim => {
      if (!sim.task_breakdown) return [];
      return Array.isArray(sim.task_breakdown) ? sim.task_breakdown : [];
    }) || [];
    
    const aiCapableTasks = allTasksData.filter(t => 
      t.category === 'ai-only' || t.category === 'ai-human'
    );
    const humanOnlyTasks = allTasksData.filter(t => t.category === 'human-only');
    const topAutomationTask = aiCapableTasks
      .sort((a, b) => (b.automationPotential || 0) - (a.automationPotential || 0))[0];

    // Extract working group consensus
    const workingGroupInputsCategorized = workingInputs.data?.reduce((acc, input) => {
      acc[input.input_category] = (acc[input.input_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const consensusCategory = Object.entries(workingGroupInputsCategorized)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Strategic alignment';

    // Build comprehensive context
    const bootcamp = workshop.bootcamp_plans;
    const intake = workshop.exec_intakes;
    
    // Derive strategic goals from workshop if none exist
    const derivedGoalsFromWorkshop = !intake?.strategic_objectives_2026 ? [
      topOpportunities[0]?.item_text ? `Priority 1: ${topOpportunities[0].item_text}` : null,
      topBottleneckCluster ? `Address bottleneck: ${topBottleneckCluster}` : null,
      simulations.data?.[0] ? `Pilot AI for ${simulations.data[0].simulation_name}` : null
    ].filter(Boolean) : [];

    // Derive AI leverage points from simulation performance
    const derivedLeveragePoints = simulations.data
      ?.filter(sim => (sim.time_savings_pct || 0) > 30)
      .map(sim => ({
        scenario: sim.simulation_name,
        timeSavings: `${sim.time_savings_pct}% time savings`,
        qualityRating: sim.quality_improvement_pct ? `${Math.round(sim.quality_improvement_pct / 10)}/10 quality` : 'N/A',
        recommendation: 'High potential for pilot'
      })) || [];

    // Generate realistic next steps based on workshop state
    const realisticNextSteps = [
      charter.data?.pilot_owner 
        ? `D10: ${charter.data.pilot_owner} to define pilot scope` 
        : 'D10: Leadership to nominate pilot owner',
      'D30: Secure executive sponsor commitment and budget',
      topOpportunities[0] 
        ? `D60: Deploy pilot for ${topOpportunities[0].item_text}` 
        : 'D60: Deploy pilot for top opportunity',
      'D90: Present results and decide scale/kill/pivot'
    ];

    const contextData = {
      company: {
        name: intake?.company_name || 'Company',
        industry: intake?.industry || 'Unknown',
        strategicGoals: strategicGoalsText,
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
        participantCount: (intake?.participants as any[] || []).length,
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
      },
      enrichedData: {
        riskData: {
          guardrailsCount,
          riskTolerance: bootcamp?.risk_tolerance || 50,
          riskLabel: getRiskLabel(bootcamp?.risk_tolerance || 50),
          redFlagsCount,
          topGuardrail
        },
        taskData: {
          totalTasks: allTasksData.length,
          aiCapable: aiCapableTasks.length,
          aiCapablePct: allTasksData.length > 0 ? Math.round((aiCapableTasks.length / allTasksData.length) * 100) : 0,
          humanOnly: humanOnlyTasks.length,
          humanOnlyPct: allTasksData.length > 0 ? Math.round((humanOnlyTasks.length / allTasksData.length) * 100) : 0,
          topAutomation: topAutomationTask?.description || 'Task automation opportunities identified'
        },
        votingData: {
          totalVotes: votingResults.data?.length || 0,
          topVotedItems: votingResults.data?.slice(0, 5) || []
        },
        huddleInsights: huddleSynthesis.data ? {
          summary: huddleSynthesis.data.synthesis_text,
          themes: huddleSynthesis.data.key_themes || [],
          actions: huddleSynthesis.data.priority_actions || []
        } : null,
        discussionDepth: {
          totalPrompts: simulations.data?.reduce((sum, sim) => sum + (sim.prompts_used?.length || 0), 0) || 0,
          selections: simulations.data?.reduce((sum, sim) => sum + Object.keys(sim.selected_discussion_options || {}).length, 0) || 0
        },
        strategyData: {
          topOpportunities: topOpportunities.length,
          workingGroupInputs: workingInputs.data?.length || 0,
          consensusArea: consensusCategory
        },
        derivedGoalsFromWorkshop: derivedGoalsFromWorkshop,
        derivedLeveragePoints,
        realisticNextSteps
      }
    };

    // Generate jargon guidance
    const getJargonGuidance = (level: number) => {
      if (level < 33) return "Use only plain English. Avoid ALL acronyms, technical terms, and industry jargon. Explain concepts as if to someone with no business or tech background.";
      if (level < 67) return "Balance plain English with industry terms. Define acronyms on first use. Keep language accessible to smart generalists.";
      return "Use industry-standard terminology and acronyms freely. Assume expert audience familiar with business and AI concepts.";
    };

    const systemPrompt = `You are synthesizing an AI readiness workshop for executives. Return ONLY valid JSON.

${getJargonGuidance(jargonLevel)}

CRITICAL WORD LIMITS (COUNT EVERY WORD - VIOLATING THESE WILL RESULT IN REJECTION):
- Executive Summary: 90-100 words MAXIMUM. This is a HARD CAP.
- Strengths: EXACTLY 3 items (no more, no less)
  - Each evidence: ≤18 words
  - Each impact: ≤15 words
- Gaps: EXACTLY 3 items (no more, no less)
  - Each evidence: ≤18 words
  - Each recommendation: ≤15 words
- Evidence MUST reference specific metrics from workshop (e.g., "42% time saved", "37/57 tasks AI-capable")
- NEVER invent data not present in input
- Focus on ONE priority 90-day pilot only
- If segment has no data, omit that section completely
- ALL percentages must be integers (42, not 42.3333...)

ANTI-FABRICATION RULES:
1. NEVER invent statistics not in the data
2. Reference SPECIFIC workshop outputs: actual bottlenecks, actual simulation names
3. Every quantified claim must be traceable to provided data
4. If data missing, say "not measured" - don't guess
5. Avoid vague phrases like "significant improvements" - be specific

Return this exact JSON structure:
{
  "executiveSummary": "<90-100 words MAXIMUM>",
  "strengths": [
    {"title": "<max 12 words>", "evidence": "<max 18 words with metric>", "impact": "<max 15 words>"}
  ],
  "gaps": [
    {"title": "<max 12 words>", "evidence": "<max 18 words with metric>", "recommendation": "<max 15 words>"}
  ],
  "journeyInsights": {
    "mythsBusted": "<max 80 words>",
    "surprisingFindings": "<max 80 words>",
    "momentsOfClarity": "<max 80 words>"
  },
  "urgencyVerdict": "<100-120 words>"
}`;

    const userPrompt = `Analyze this AI readiness workshop for ${contextData.company.name}:

=== COMPANY CONTEXT ===
Industry: ${contextData.company.industry}
AI Experience: ${contextData.preWorkshop.aiExperience}
Company: ${contextData.company.name}
2026 Goals: ${contextData.company.strategicGoals.slice(0, 200)}...

Bottlenecks Identified: ${contextData.workshop.bottlenecksIdentified}
Top Clusters: ${contextData.workshop.bottleneckClusters.slice(0, 2).join(', ')}

Simulations: ${simulationMetrics.count} run
- Median time savings: ${simulationMetrics.medianTimeSavings}%
- Median quality: ${simulationMetrics.medianQuality}/10
- Best result: ${simulationMetrics.highlights[0]?.name} (${simulationMetrics.highlights[0]?.timeSavings}% saved)

Tasks Analyzed: ${allTasksData.length}
- AI-capable: ${aiCapableTasks.length} (${allTasksData.length > 0 ? Math.round((aiCapableTasks.length / allTasksData.length) * 100) : 0}%)

Pilot Status: ${charter?.data?.pilot_owner || 'No owner assigned'}
Risk Tolerance: ${bootcamp?.risk_tolerance || 50}% (${getRiskLabel(bootcamp?.risk_tolerance || 50)})

Generate synthesis using ONLY this data. Follow word limits EXACTLY.`;

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
        temperature: 0.5,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`AI synthesis failed: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI response received, parsing...');

    // Helper function to truncate text to word limit
    const truncateToWords = (text: string, maxWords: number): string => {
      const words = text.trim().split(/\s+/);
      if (words.length <= maxWords) return text;
      return words.slice(0, maxWords).join(' ') + '...';
    };

    let synthesis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      synthesis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiContent);
      
      // POST-PROCESSING: Force-enforce word limits even if LLM ignored prompts
      if (synthesis.executiveSummary) {
        synthesis.executiveSummary = truncateToWords(synthesis.executiveSummary, 100);
      }
      
      // Force exactly 3 strengths
      if (synthesis.strengths && Array.isArray(synthesis.strengths)) {
        synthesis.strengths = synthesis.strengths.slice(0, 3);
        synthesis.strengths = synthesis.strengths.map((s: any) => ({
          title: s.title,
          evidence: truncateToWords(s.evidence || '', 18),
          impact: truncateToWords(s.impact || '', 15)
        }));
      }
      
      // Force exactly 3 gaps
      if (synthesis.gaps && Array.isArray(synthesis.gaps)) {
        synthesis.gaps = synthesis.gaps.slice(0, 3);
        synthesis.gaps = synthesis.gaps.map((g: any) => ({
          title: g.title,
          evidence: truncateToWords(g.evidence || '', 18),
          recommendation: truncateToWords(g.recommendation || '', 15)
        }));
      }

      console.log('Post-processing applied:', {
        execSummaryWords: synthesis.executiveSummary?.split(' ').length,
        strengthsCount: synthesis.strengths?.length,
        gapsCount: synthesis.gaps?.length
      });
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw AI content:', aiContent);
      throw new Error('Failed to parse AI synthesis JSON');
    }

    // Build response data
    const reportData = {
      urgencyScore: Math.round(urgencyScore), // Enforce rounding
      urgencyLabel: urgencyScore >= 70 ? 'High' : urgencyScore >= 40 ? 'Moderate' : 'Low',
      simulationMetrics, // NEW: Aggregate simulation data
      roiMetrics: simulationDetails, // Keep for backwards compatibility
      contextData,
      workshop,
      charter: charter?.data,
      strategy: strategy?.data,
      bottlenecks: bottlenecks.data,
      simulations: contextData.simulations,
      workingInputs: workingInputs.data,
      preworkSubmissions: preworkSubmissions.data
    };

    console.log('Report generated successfully');

    return new Response(
      JSON.stringify({
        reportData,
        aiSynthesis: synthesis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in generate-provocation-report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
