import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const geminiServiceAccount = Deno.env.get('GEMINI_SERVICE_ACCOUNT_KEY');
    
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
    
    // 2. Build AI Leverage Points from simulation data - STRATEGIC BUSINESS INSIGHTS
    const deriveAILeveragePoints = (): string[] => {
      const points: string[] = [];
      
      if (!simulations.data || simulations.data.length === 0) {
        return ['To be determined based on simulation results'];
      }
      
      // Group simulations by business impact area
      const customerFacing = simulations.data.filter(s => 
        s.simulation_name.toLowerCase().includes('customer') || 
        s.simulation_name.toLowerCase().includes('client') ||
        s.simulation_name.toLowerCase().includes('support')
      );
      
      const operations = simulations.data.filter(s => 
        s.simulation_name.toLowerCase().includes('workflow') || 
        s.simulation_name.toLowerCase().includes('process') ||
        s.simulation_name.toLowerCase().includes('approval')
      );
      
      const strategy = simulations.data.filter(s => 
        s.simulation_name.toLowerCase().includes('gtm') || 
        s.simulation_name.toLowerCase().includes('strategy') ||
        s.simulation_name.toLowerCase().includes('planning')
      );
      
      // Generate strategic insights (not data echoes)
      if (customerFacing.length > 0) {
        const avgTimeSaved = Math.round(customerFacing.reduce((sum, s) => sum + (s.time_savings_pct || 0), 0) / customerFacing.length);
        if (avgTimeSaved >= 30) {
          points.push(`Customer-facing teams could respond ${avgTimeSaved}% faster to market opportunities`);
        } else {
          points.push(`Customer response workflows show ${avgTimeSaved}% efficiency potential with AI assistance`);
        }
      }
      
      if (operations.length > 0) {
        const avgTimeSaved = Math.round(operations.reduce((sum, s) => sum + (s.time_savings_pct || 0), 0) / operations.length);
        if (avgTimeSaved >= 40) {
          points.push(`Operational bottlenecks could accelerate ${avgTimeSaved}%, freeing team capacity for strategic work`);
        } else {
          points.push(`Internal workflows show ${avgTimeSaved}% automation potential in approval cycles`);
        }
      }
      
      if (strategy.length > 0) {
        const avgTimeSaved = Math.round(strategy.reduce((sum, s) => sum + (s.time_savings_pct || 0), 0) / strategy.length);
        if (avgTimeSaved >= 35) {
          points.push(`Strategic planning cycles could compress by ${avgTimeSaved}%, enabling faster market pivots`);
        } else {
          points.push(`Strategy development shows ${avgTimeSaved}% efficiency gains through AI-assisted analysis`);
        }
      }
      
      // Identify cross-functional high-value scenarios
      const highValueSims = simulations.data.filter(s => (s.time_savings_pct || 0) >= 40);
      if (highValueSims.length >= 3) {
        points.push(`${highValueSims.length} customer-critical workflows identified with 40%+ efficiency gains`);
      } else if (highValueSims.length > 0) {
        const topScenario = highValueSims[0];
        const impact = Math.round(topScenario.time_savings_pct || 0);
        points.push(`Highest-impact scenario: ${impact}% efficiency gain in ${topScenario.simulation_name.toLowerCase()}`);
      }
      
      // Quality improvements as business value
      const avgQuality = simulations.data.reduce((sum, s) => sum + (s.quality_improvement_pct || 0), 0) / simulations.data.length;
      if (avgQuality >= 15) {
        points.push(`Output quality improvements averaging ${Math.round(avgQuality)}% could reduce rework and escalations`);
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
        participant_count: Array.isArray(workshop.exec_intakes?.participants) ? workshop.exec_intakes.participants.length : 0,
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
3. **AI Leverage Points - STRATEGIC BUSINESS INSIGHTS ONLY**:
   ❌ BAD (Data Echo): "gtm-pivot: 45% median time savings"
   ❌ BAD (Technical): "simulation-name shows 42% efficiency"
   ✅ GOOD: "GTM strategy adjustments could compress by 45%, accelerating sales cycles"
   ✅ GOOD: "Customer response time could improve 42% through AI-assisted competitive intelligence"
   
   RULES FOR AI LEVERAGE POINTS:
   - Translate technical metrics into executive-level business value
   - Focus on strategic outcomes: faster market response, reduced costs, freed capacity
   - Never echo simulation names or raw percentages without business context
   - Use action verbs: "could accelerate", "would enable", "reduces friction in"
   - Connect to customer impact, revenue, or competitive advantage

4. **Surprises**: Identify contradictions, unexpected patterns, or anomalies:
   - Identical quality scores across diverse scenarios (suspicious)
   - High variance in time savings (context-dependent)
   - Bottleneck clusters vs simulation focus misalignment
   - Charter milestones that don't address identified bottlenecks
5. **Evidence Threshold**: Only say "To be determined" when data is TRULY missing (e.g., no bottlenecks AND no simulations AND no charter). If raw data exists, SYNTHESIZE IT.
6. **Tone**: Professional, data-driven, actionable. This is for executives who need clear next steps.
7. **Length Constraints - WRITE COMPLETE THOUGHTS**:
   - Executive summary: 2-3 complete sentences, naturally under 280 characters
   - Urgency reasoning: 1-2 complete sentences, naturally under 180 characters
   - Strengths: 3-5 bullets, complete thoughts under 110 words each
   - Gaps: 3-5 bullets, complete thoughts under 110 words each
   - Strategic goals: max 5 items, naturally under 55 chars each
   - AI leverage points: max 5 items, naturally under 75 chars each
   - Simulation highlights: max 3 items, naturally under 90 chars each
   - Surprises: max 3 items, naturally under 110 chars each
   
   CRITICAL: End all text with proper punctuation. Never truncate mid-sentence. If approaching limit, use a shorter but complete sentence.

OUTPUT FORMAT: Valid JSON only (no markdown formatting).`;

    const userPrompt = `Analyze this AI Leadership workshop and generate a comprehensive executive report:

${JSON.stringify(contextData, null, 2)}

IMPORTANT: The derived_insights section contains strategic goals, AI leverage points, and surprises that were intelligently extracted from raw data. Use these extensively in your synthesis.

Generate a report following the exact JSON schema provided in the tools.`;

    // Call AI with 3-tier fallback (Gemini RAG → OpenAI → Lovable AI)
    console.log('[generate-final-report] Calling AI with fallback...');
    
    const aiResult = await callWithFallback({
      openAIKey: openAIApiKey,
      lovableKey: lovableApiKey,
      geminiServiceAccount,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 8192,
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
      toolChoice: { type: 'function', function: { name: 'generate_executive_report' } }
    });

    console.log(`[generate-final-report] AI response received from ${aiResult.provider} in ${aiResult.latencyMs}ms`);

    // Extract tool call result
    if (!aiResult.toolCalls || aiResult.toolCalls.length === 0) {
      throw new Error('No tool call in AI response');
    }

    let reportData = JSON.parse(aiResult.toolCalls[0].function.arguments);

    // Validation: Check for quality issues (but don't truncate)
    const validateText = (text: string, fieldName: string): boolean => {
      // Check if text ends mid-sentence (no punctuation in last 20 chars)
      const lastChars = text.slice(-20);
      const hasPunctuation = /[.!?]/.test(lastChars);
      if (!hasPunctuation && text.length > 50) {
        console.warn(`[generate-final-report] ${fieldName} may be truncated mid-sentence: "${text.slice(-30)}"`);
        return false;
      }
      return true;
    };
    
    // Validate key text fields
    validateText(reportData.executive_summary, 'executive_summary');
    validateText(reportData.urgency?.reasoning || '', 'urgency.reasoning');
    
    // Validate AI leverage points don't contain raw simulation names
    if (reportData.appendix?.alignment?.ai_leverage_points) {
      const hasDataEcho = reportData.appendix.alignment.ai_leverage_points.some((point: string) => {
        const lower = point.toLowerCase();
        return lower.includes('median') || lower.includes('simulation') || /^\w+-\w+:/.test(point);
      });
      if (hasDataEcho) {
        console.warn('[generate-final-report] AI leverage points contain data echoes instead of strategic insights');
      }
    }
    
    // Enforce array length limits (but don't truncate strings)
    reportData.strengths = reportData.strengths?.slice(0, 5) || [];
    reportData.gaps = reportData.gaps?.slice(0, 5) || [];
    
    if (reportData.appendix?.alignment) {
      reportData.appendix.alignment.strategic_goals = reportData.appendix.alignment.strategic_goals?.slice(0, 5) || [];
      reportData.appendix.alignment.bottlenecks = reportData.appendix.alignment.bottlenecks?.slice(0, 5) || [];
      reportData.appendix.alignment.ai_leverage_points = reportData.appendix.alignment.ai_leverage_points?.slice(0, 5) || [];
    }
    
    if (reportData.appendix?.simulations) {
      reportData.appendix.simulations.highlights = reportData.appendix.simulations.highlights?.slice(0, 3) || [];
      reportData.appendix.simulations.surprises = reportData.appendix.simulations.surprises?.slice(0, 3) || [];
    }
    
    if (reportData.appendix?.journey) {
      reportData.appendix.journey = reportData.appendix.journey?.slice(0, 6) || [];
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