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
    const { workshop_session_id } = await req.json();
    
    if (!workshop_session_id) {
      throw new Error('workshop_session_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[generate-final-report] Fetching workshop data...');

    // Fetch workshop session with all relations
    const { data: workshop, error: workshopError } = await supabase
      .from('workshop_sessions')
      .select('*, bootcamp_plans(*), exec_intakes(*)')
      .eq('id', workshop_session_id)
      .single();

    if (workshopError) throw workshopError;

    // Fetch all data sources
    const [segmentSummaries, simulations, charter, bottlenecks, mapItems] = await Promise.all([
      supabase.from('segment_summaries').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('simulation_results').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('pilot_charter').select('*').eq('workshop_session_id', workshop_session_id).maybeSingle(),
      supabase.from('bottleneck_submissions').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('effortless_map_items').select('*').eq('workshop_session_id', workshop_session_id)
    ]);

    console.log('[generate-final-report] Data fetched:', {
      segmentSummaries: segmentSummaries.data?.length || 0,
      simulations: simulations.data?.length || 0,
      hasCharter: !!charter.data,
      bottlenecks: bottlenecks.data?.length || 0,
      mapItems: mapItems.data?.length || 0
    });

    // INTELLIGENT DATA EXTRACTION - Derive insights even when segment_summaries is empty
    
    // 1. Extract Strategic Goals from multiple sources
    const deriveStrategicGoals = (): string[] => {
      const goals: string[] = [];
      
      // Priority 1: Explicit strategic objectives from intake
      const intakeGoals = workshop.exec_intakes?.strategic_objectives_2026;
      if (intakeGoals && intakeGoals.trim()) {
        goals.push(...intakeGoals.split(/[•\n]/).filter(g => g.trim()).map(g => g.trim()));
      }
      
      // Priority 2: From bootcamp plan
      const bootcampGoals = workshop.bootcamp_plans?.strategic_goals_2026;
      if (bootcampGoals && Array.isArray(bootcampGoals)) {
        goals.push(...bootcampGoals);
      }
      
      // Priority 3: Derive from bottleneck clusters
      if (bottlenecks.data && bottlenecks.data.length > 0 && goals.length === 0) {
        const clusterMap = new Map<string, number>();
        bottlenecks.data.forEach(b => {
          if (b.cluster_name) {
            clusterMap.set(b.cluster_name, (clusterMap.get(b.cluster_name) || 0) + 1);
          }
        });
        
        Array.from(clusterMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .forEach(([cluster]) => {
            goals.push(`Streamline ${cluster.toLowerCase()}`);
          });
      }
      
      // Priority 4: Derive from pilot charter milestones
      if (charter.data && goals.length === 0) {
        if (charter.data.milestone_d30) goals.push(charter.data.milestone_d30.substring(0, 60));
        if (charter.data.milestone_d90) goals.push(charter.data.milestone_d90.substring(0, 60));
      }
      
      return goals.slice(0, 5);
    };
    
    // 2. Build AI Leverage Points from simulation data
    const deriveAILeveragePoints = (): string[] => {
      const points: string[] = [];
      
      if (!simulations.data || simulations.data.length === 0) {
        return ['To be determined based on simulation results'];
      }
      
      // Group by simulation type
      const typeMap = new Map<string, { timeSavings: number[], qualityGains: number[] }>();
      
      simulations.data.forEach(sim => {
        if (!typeMap.has(sim.simulation_name)) {
          typeMap.set(sim.simulation_name, { timeSavings: [], qualityGains: [] });
        }
        const group = typeMap.get(sim.simulation_name)!;
        if (sim.time_savings_pct) group.timeSavings.push(sim.time_savings_pct);
        if (sim.quality_improvement_pct) group.qualityGains.push(sim.quality_improvement_pct);
      });
      
      // Generate leverage points
      typeMap.forEach((metrics, simName) => {
        if (metrics.timeSavings.length > 0) {
          const avgTime = Math.round(metrics.timeSavings.reduce((a, b) => a + b, 0) / metrics.timeSavings.length);
          points.push(`${simName}: ${avgTime}% median time savings`);
        }
      });
      
      // Add qualitative insights
      const highValueSims = simulations.data.filter(s => (s.time_savings_pct || 0) >= 40);
      if (highValueSims.length > 0) {
        points.push(`${highValueSims.length} high-value use cases identified (40%+ efficiency gain)`);
      }
      
      return points.slice(0, 5);
    };
    
    // 3. Detect Surprises and Anomalies
    const detectSurprises = (): string[] => {
      const surprises: string[] = [];
      
      if (simulations.data && simulations.data.length >= 2) {
        // Check for uniform quality scores (suspicious)
        const qualityScores = simulations.data
          .map(s => s.quality_improvement_pct)
          .filter(q => q !== null) as number[];
        
        if (qualityScores.length >= 2) {
          const uniqueScores = new Set(qualityScores);
          if (uniqueScores.size === 1) {
            surprises.push(`All simulations show identical ${qualityScores[0]}% quality gain - suggests need for more diverse quality metrics`);
          }
        }
        
        // Check for high variance in time savings
        const timeSavings = simulations.data
          .map(s => s.time_savings_pct)
          .filter(t => t !== null) as number[];
        
        if (timeSavings.length >= 2) {
          const min = Math.min(...timeSavings);
          const max = Math.max(...timeSavings);
          const variance = max - min;
          
          if (variance > 40) {
            surprises.push(`High variance in time savings (${min}% to ${max}%) indicates context-dependent AI value`);
          }
        }
      }
      
      // Check for bottleneck vs simulation misalignment
      if (bottlenecks.data && bottlenecks.data.length > 0 && simulations.data && simulations.data.length > 0) {
        const bottleneckClusters = new Set(bottlenecks.data.map(b => b.cluster_name).filter(Boolean));
        const hasApprovalBottleneck = Array.from(bottleneckClusters).some(c => 
          c?.toLowerCase().includes('approval') || c?.toLowerCase().includes('decision')
        );
        
        const hasApprovalSim = simulations.data.some(s => 
          s.simulation_name.toLowerCase().includes('approval') || 
          s.simulation_name.toLowerCase().includes('decision')
        );
        
        if (hasApprovalBottleneck && !hasApprovalSim) {
          surprises.push('Approval bottlenecks identified but not tested in simulations - opportunity for focused pilot');
        }
      }
      
      // Check for missing pilot charter despite good simulations
      if (simulations.data && simulations.data.length >= 2 && !charter.data) {
        const avgTimeSaved = simulations.data.reduce((sum, s) => sum + (s.time_savings_pct || 0), 0) / simulations.data.length;
        if (avgTimeSaved >= 30) {
          surprises.push('Strong simulation results (30%+ avg time savings) but no pilot charter yet - expedite pilot planning');
        }
      }
      
      return surprises.slice(0, 3);
    };

    // Calculate urgency score
    const calculateUrgencyScore = (): { score: number; label: string } => {
      let score = 0;
      const intake = workshop.exec_intakes;
      const bootcamp = workshop.bootcamp_plans;
      
      // Timeline pressure (0-30)
      score += 25;
      
      // Bottleneck severity (0-25)
      const bottleneckCount = bottlenecks.data?.length || 0;
      score += Math.min(Math.round((bottleneckCount / 30) * 25), 25);
      
      // Pilot readiness (0-25)
      if (charter.data?.pilot_owner && charter.data?.executive_sponsor) {
        score += 15;
      } else if (charter.data?.pilot_owner || charter.data?.executive_sponsor) {
        score += 8;
      }
      
      // Risk tolerance (0-20)
      const riskTolerance = bootcamp?.risk_tolerance || 50;
      if (riskTolerance >= 70) score += 20;
      else if (riskTolerance >= 50) score += 12;
      else score += 5;
      
      const roundedScore = Math.round(score);
      const label = roundedScore >= 70 ? 'High' : roundedScore >= 45 ? 'Moderate' : 'Low';
      
      return { score: roundedScore, label };
    };

    const urgency = calculateUrgencyScore();
    const strategicGoals = deriveStrategicGoals();
    const aiLeveragePoints = deriveAILeveragePoints();
    const surprises = detectSurprises();

    // Build structured context for LLM
    const contextData = {
      workshop: {
        company: workshop.exec_intakes?.company_name || 'Organization',
        industry: workshop.exec_intakes?.industry || 'Not specified',
        participant_count: workshop.participant_count || 0,
        planned_duration: workshop.planned_duration_hours || 4,
        segments_completed: workshop.segments_completed || []
      },
      segment_summaries: segmentSummaries.data || [],
      derived_insights: {
        strategic_goals: strategicGoals,
        ai_leverage_points: aiLeveragePoints,
        surprises: surprises,
        has_raw_data: {
          bottlenecks: (bottlenecks.data?.length || 0) > 0,
          simulations: (simulations.data?.length || 0) > 0,
          charter: !!charter.data,
          map_items: (mapItems.data?.length || 0) > 0
        }
      },
      simulations: {
        count: simulations.data?.length || 0,
        results: simulations.data?.map(s => ({
          name: s.simulation_name,
          time_saved_pct: Math.round(s.time_savings_pct || 0),
          quality_gain_pct: Math.round(s.quality_improvement_pct || 0),
          people_before: s.people_involved_before,
          people_after: s.people_involved_after
        })) || []
      },
      pilot_charter: charter.data ? {
        owner: charter.data.pilot_owner,
        sponsor: charter.data.executive_sponsor,
        milestone_d30: charter.data.milestone_d30,
        milestone_d90: charter.data.milestone_d90
      } : null,
      bottlenecks: {
        count: bottlenecks.data?.length || 0,
        clusters: bottlenecks.data?.reduce((acc, b) => {
          if (b.cluster_name) {
            acc[b.cluster_name] = (acc[b.cluster_name] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>) || {}
      },
      urgency: urgency
    };

    // Enhanced LLM System Prompt with Synthesis Rules
    const systemPrompt = `You are an executive strategy consultant analyzing an AI Leadership workshop. Your task is to synthesize session data into a professional, evidence-based executive report.

CRITICAL RULES:
1. **Synthesis Over Absence**: When segment_summaries are empty but raw data exists (bottlenecks, simulations, charter), YOU MUST synthesize insights from that raw data.
2. **Strategic Goals**: If not explicit, derive from:
   - Bottleneck cluster themes (e.g., "Streamline approval workflows" from "Approval Process Inefficiencies")
   - Simulation focus areas
   - Pilot charter milestones
3. **AI Leverage Points**: Extract from simulation results:
   - Group by scenario type
   - Calculate median gains per type
   - Format: "GTM scenarios: 50% median time savings"
4. **Surprises**: Identify contradictions, unexpected patterns, or anomalies:
   - Identical quality scores across diverse scenarios (suspicious)
   - High variance in time savings (context-dependent)
   - Bottleneck clusters vs simulation focus misalignment
   - Charter milestones that don't address identified bottlenecks
5. **Evidence Threshold**: Only say "To be determined" when data is TRULY missing (e.g., no bottlenecks AND no simulations AND no charter). If raw data exists, SYNTHESIZE IT.
6. **Tone**: Professional, data-driven, actionable. This is for executives who need clear next steps.
7. **Length Constraints**: 
   - Executive summary: max 3 sentences (under 300 chars)
   - Strengths: 3-5 bullets, max 18 words each
   - Gaps: 3-5 bullets, max 18 words each
   - Strategic goals: max 5 items, max 60 chars each
   - AI leverage points: max 5 items, max 80 chars each
   - Simulation highlights: max 3 items, max 100 chars each
   - Surprises: max 3 items, max 120 chars each

OUTPUT FORMAT: Valid JSON only (no markdown formatting).`;

    const userPrompt = `Analyze this AI Leadership workshop and generate a comprehensive executive report:

${JSON.stringify(contextData, null, 2)}

IMPORTANT: The derived_insights section contains strategic goals, AI leverage points, and surprises that were intelligently extracted from raw data. Use these extensively in your synthesis.

Generate a report following the exact JSON schema provided in the tools.`;

    // Call Lovable AI with tool calling for structured output
    console.log('[generate-final-report] Calling Lovable AI...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_executive_report',
            description: 'Generate a structured executive report from workshop data',
            parameters: {
              type: 'object',
              properties: {
                urgency: {
                  type: 'object',
                  properties: {
                    score: { type: 'number' },
                    label: { type: 'string' },
                    reasoning: { type: 'string', maxLength: 200 }
                  },
                  required: ['score', 'label', 'reasoning']
                },
                executive_summary: { type: 'string', maxLength: 300 },
                strengths: {
                  type: 'array',
                  items: { type: 'string', maxLength: 120 },
                  minItems: 3,
                  maxItems: 5
                },
                gaps: {
                  type: 'array',
                  items: { type: 'string', maxLength: 120 },
                  minItems: 3,
                  maxItems: 5
                },
                pilot_charter: {
                  type: 'object',
                  properties: {
                    exists: { type: 'boolean' },
                    owner: { type: 'string', maxLength: 100 },
                    sponsor: { type: 'string', maxLength: 100 },
                    first_milestone: { type: 'string', maxLength: 150 },
                    d90_goal: { type: 'string', maxLength: 150 }
                  },
                  required: ['exists']
                },
                appendix: {
                  type: 'object',
                  properties: {
                    alignment: {
                      type: 'object',
                      properties: {
                        strategic_goals: {
                          type: 'array',
                          items: { type: 'string', maxLength: 60 },
                          maxItems: 5
                        },
                        bottlenecks: {
                          type: 'array',
                          items: { type: 'string', maxLength: 80 },
                          maxItems: 5
                        },
                        ai_leverage_points: {
                          type: 'array',
                          items: { type: 'string', maxLength: 80 },
                          maxItems: 5
                        }
                      },
                      required: ['strategic_goals', 'bottlenecks', 'ai_leverage_points']
                    },
                    simulations: {
                      type: 'object',
                      properties: {
                        count: { type: 'number' },
                        median_time_saved: { type: ['number', 'null'] },
                        median_quality_gain: { type: ['number', 'null'] },
                        highlights: {
                          type: 'array',
                          items: { type: 'string', maxLength: 100 },
                          maxItems: 3
                        },
                        surprises: {
                          type: 'array',
                          items: { type: 'string', maxLength: 120 },
                          maxItems: 3
                        }
                      },
                      required: ['count', 'highlights', 'surprises']
                    },
                    journey: {
                      type: 'array',
                      items: { type: 'string', maxLength: 100 },
                      maxItems: 6
                    }
                  },
                  required: ['alignment', 'simulations', 'journey']
                }
              },
              required: ['urgency', 'executive_summary', 'strengths', 'gaps', 'pilot_charter', 'appendix'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_executive_report' } }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-final-report] AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('[generate-final-report] AI response received');

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    let reportData = JSON.parse(toolCall.function.arguments);

    // Post-processing: Force truncation to ensure constraints
    const truncate = (str: string, max: number) => str.length > max ? str.substring(0, max - 3) + '...' : str;
    
    reportData.executive_summary = truncate(reportData.executive_summary, 300);
    reportData.urgency.reasoning = truncate(reportData.urgency.reasoning, 200);
    reportData.strengths = reportData.strengths.slice(0, 5).map((s: string) => truncate(s, 120));
    reportData.gaps = reportData.gaps.slice(0, 5).map((s: string) => truncate(s, 120));
    
    if (reportData.appendix?.alignment) {
      reportData.appendix.alignment.strategic_goals = reportData.appendix.alignment.strategic_goals.slice(0, 5).map((s: string) => truncate(s, 60));
      reportData.appendix.alignment.bottlenecks = reportData.appendix.alignment.bottlenecks.slice(0, 5).map((s: string) => truncate(s, 80));
      reportData.appendix.alignment.ai_leverage_points = reportData.appendix.alignment.ai_leverage_points.slice(0, 5).map((s: string) => truncate(s, 80));
    }
    
    if (reportData.appendix?.simulations) {
      reportData.appendix.simulations.highlights = reportData.appendix.simulations.highlights.slice(0, 3).map((s: string) => truncate(s, 100));
      reportData.appendix.simulations.surprises = (reportData.appendix.simulations.surprises || []).slice(0, 3).map((s: string) => truncate(s, 120));
    }
    
    if (reportData.appendix?.journey) {
      reportData.appendix.journey = reportData.appendix.journey.slice(0, 6).map((s: string) => truncate(s, 100));
    }

    console.log('[generate-final-report] Report generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        report: reportData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[generate-final-report] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});