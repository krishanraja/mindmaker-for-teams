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

    // Fetch workshop data
    const [bottlenecks, mapItems, simulations, strategy, charter, workingInputs] = await Promise.all([
      supabase.from('bottleneck_submissions').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('effortless_map_items').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('simulation_results').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('strategy_addendum').select('*').eq('workshop_session_id', workshop_session_id).single(),
      supabase.from('pilot_charter').select('*').eq('workshop_session_id', workshop_session_id).single(),
      supabase.from('working_group_inputs').select('*').eq('workshop_session_id', workshop_session_id)
    ]);

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

    // Calculate ROI metrics from simulations
    const roiMetrics = simulations.data?.map(sim => ({
      name: sim.simulation_name,
      timeSavings: sim.time_savings_pct,
      costSavings: sim.cost_savings_usd,
      qualityImprovement: sim.quality_improvement_pct,
      beforeSnapshot: sim.before_snapshot,
      afterSnapshot: sim.after_snapshot
    })) || [];

    // Prepare context for AI
    const bootcamp = workshop.bootcamp_plans;
    const intake = workshop.exec_intakes;
    
    const contextData = {
      company: {
        name: intake?.company_name,
        industry: intake?.industry,
        strategicGoals: intake?.strategic_objectives_2026,
        competitiveLandscape: bootcamp?.competitive_landscape
      },
      preWorkshop: {
        aiExperience: bootcamp?.ai_experience_level,
        anticipatedBottlenecks: intake?.anticipated_bottlenecks || [],
        aiMyths: bootcamp?.ai_myths_concerns || [],
        riskTolerance: bootcamp?.risk_tolerance,
        pilotExpectations: bootcamp?.pilot_expectations
      },
      workshop: {
        bottlenecksIdentified: bottlenecks.data?.length || 0,
        bottleneckClusters: [...new Set(bottlenecks.data?.map(b => b.cluster_name).filter(Boolean))],
        opportunitiesPrioritized: mapItems.data?.length || 0,
        simulationsRun: simulations.data?.length || 0,
        pilotChartered: !!charter.data
      },
      results: {
        roiMetrics,
        strategicTargets: strategy.data?.targets_at_risk,
        pilotOwner: charter.data?.pilot_owner,
        pilotBudget: charter.data?.pilot_budget
      }
    };

    // Generate AI synthesis with jargon level guidance
    const getJargonGuidance = (level: number) => {
      if (level < 33) return "Use only plain English. Avoid ALL acronyms, technical terms, and industry jargon. Explain concepts as if to someone with no business or tech background. Use simple, everyday language.";
      if (level < 67) return "Balance plain English with industry terms. Define acronyms on first use. Keep language accessible to smart generalists.";
      return "Use industry-standard terminology and acronyms freely. Assume expert audience familiar with business and AI concepts.";
    };

    const systemPrompt = `You are a McKinsey-level strategy consultant specializing in AI transformation. 
Synthesize workshop data into an executive summary that creates urgency while being data-driven and actionable.
Be specific, use numbers, and make it feel personalized to this company.

${getJargonGuidance(jargonLevel)}`;

    const userPrompt = `Analyze this AI readiness workshop for ${contextData.company.name}:

Company Context:
- Industry: ${contextData.company.industry}
- AI Experience: ${contextData.preWorkshop.aiExperience}
- Strategic Goals: ${contextData.company.strategicGoals}
- Competitive Context: ${contextData.company.competitiveLandscape}

Workshop Results:
- ${contextData.workshop.bottlenecksIdentified} bottlenecks identified
- ${contextData.workshop.opportunitiesPrioritized} opportunities prioritized
- ${contextData.workshop.simulationsRun} simulations completed
- Pilot owner: ${contextData.results.pilotOwner}

Pre-workshop, they anticipated: ${JSON.stringify(contextData.preWorkshop.anticipatedBottlenecks)}
Their AI myths/concerns: ${JSON.stringify(contextData.preWorkshop.aiMyths)}

Simulation ROI: ${JSON.stringify(contextData.results.roiMetrics)}

Generate (with strict character limits):
1. Executive summary (150-200 words) - company snapshot, workshop ROI narrative
2. Strengths: EXACTLY 3 bullet points, each under 60 characters
3. Gaps: EXACTLY 3 bullet points, each under 60 characters  
4. Urgency verdict (2-3 sentences) that answers: "If an AI-native startup launched tomorrow with your data, would they beat you?"

CRITICAL: Keep Strengths and Gaps concise (max 60 chars each). Be specific and impactful.`;

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
