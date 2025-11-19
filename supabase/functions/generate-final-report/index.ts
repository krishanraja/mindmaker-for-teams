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

    // Fetch segment summaries
    const { data: segmentSummaries, error: summariesError } = await supabase
      .from('segment_summaries')
      .select('*')
      .eq('workshop_session_id', workshop_session_id);

    if (summariesError) throw summariesError;

    // Fetch key metrics
    const [simulations, charter, bottlenecks] = await Promise.all([
      supabase.from('simulation_results').select('*').eq('workshop_session_id', workshop_session_id),
      supabase.from('pilot_charter').select('*').eq('workshop_session_id', workshop_session_id).maybeSingle(),
      supabase.from('bottleneck_submissions').select('*').eq('workshop_session_id', workshop_session_id)
    ]);

    console.log('[generate-final-report] Data fetched:', {
      segmentSummaries: segmentSummaries?.length || 0,
      simulations: simulations.data?.length || 0,
      hasCharter: !!charter.data,
      bottlenecks: bottlenecks.data?.length || 0
    });

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

    // Build structured context for LLM
    const contextData = {
      workshop: {
        company: workshop.exec_intakes?.company_name || 'Organization',
        industry: workshop.exec_intakes?.industry || 'Not specified',
        participant_count: workshop.participant_count || 0,
        planned_duration: workshop.planned_duration_hours || 4,
        segments_completed: workshop.segments_completed || []
      },
      segment_summaries: segmentSummaries || [],
      simulations: {
        count: simulations.data?.length || 0,
        avg_time_saved: simulations.data?.length
          ? Math.round(simulations.data.reduce((sum, s) => sum + (s.time_savings_pct || 0), 0) / simulations.data.length)
          : null,
        avg_quality_gain: simulations.data?.length
          ? Math.round(simulations.data.reduce((sum, s) => sum + (s.quality_improvement_pct || 0), 0) / simulations.data.length)
          : null,
        top_results: simulations.data
          ?.sort((a, b) => (b.time_savings_pct || 0) - (a.time_savings_pct || 0))
          .slice(0, 3)
          .map(s => ({
            name: s.simulation_name,
            time_saved: Math.round(s.time_savings_pct || 0),
            quality_gain: Math.round(s.quality_improvement_pct || 0)
          })) || []
      },
      charter: charter.data ? {
        owner: charter.data.pilot_owner,
        sponsor: charter.data.executive_sponsor,
        milestones: {
          day_10: charter.data.milestone_d10,
          day_30: charter.data.milestone_d30,
          day_60: charter.data.milestone_d60,
          day_90: charter.data.milestone_d90
        }
      } : null,
      bottlenecks: {
        count: bottlenecks.data?.length || 0,
        top_clusters: [...new Set(bottlenecks.data?.map(b => b.cluster_name).filter(Boolean))].slice(0, 3)
      },
      urgency
    };

    // Build LLM prompt with strict constraints
    const systemPrompt = `You are generating a concise executive report for an AI leadership workshop.

CRITICAL RULES:
- Executive Summary: EXACTLY 110-140 words
- Strengths: EXACTLY 3 items, each ≤18 words, MUST reference specific metrics
- Gaps: EXACTLY 3 items, each ≤15 words, MUST be structural issues
- ALL percentages: integers only (42, not 42.3)
- Focus on ONE primary pilot
- If data is missing, say "To be determined" - DO NOT INVENT DATA
- Synthesize patterns, DO NOT list every detail

Return ONLY valid JSON in this exact schema:
{
  "urgency_score": number (integer),
  "urgency_label": "Low" | "Moderate" | "High",
  "exec_summary": string (110-140 words),
  "strengths": [string, string, string] (each ≤18 words),
  "gaps": [string, string, string] (each ≤15 words),
  "pilot_charter": {
    "title": string,
    "owner": string,
    "sponsor": string | null,
    "linked_goal": string | null,
    "expected_time_saving_percent": number | null,
    "key_metrics": [string, string, string],
    "milestones": {
      "day_10": string,
      "day_30": string,
      "day_60": string,
      "day_90": string
    }
  } | null,
  "appendix": {
    "alignment": {
      "goals": [string, string, string],
      "bottlenecks": [string, string],
      "leverage_points": [string, string, string]
    },
    "simulations": {
      "count": number,
      "median_time_saved": number | null,
      "median_quality_gain": number | null,
      "highlights": [string, string, string]
    },
    "journey": [string]
  }
}`;

    const userPrompt = `Generate executive report for ${contextData.workshop.company}:

SEGMENT SUMMARIES:
${segmentSummaries?.map(s => `${s.segment_key}: ${s.headline}\nKey points: ${s.key_points.join('; ')}`).join('\n\n') || 'No segment summaries available'}

SIMULATION RESULTS:
- Simulations run: ${contextData.simulations.count}
- Average time saved: ${contextData.simulations.avg_time_saved}%
- Top result: ${contextData.simulations.top_results[0]?.name || 'N/A'} (${contextData.simulations.top_results[0]?.time_saved || 0}% time saved)

PILOT CHARTER:
${contextData.charter ? `Owner: ${contextData.charter.owner}\nSponsor: ${contextData.charter.sponsor}\nD10: ${contextData.charter.milestones.day_10}` : 'No pilot charter created yet'}

BOTTLENECKS:
- Count: ${contextData.bottlenecks.count}
- Top clusters: ${contextData.bottlenecks.top_clusters.join(', ') || 'None identified'}

URGENCY:
- Score: ${urgency.score}
- Label: ${urgency.label}
- Drivers: ${contextData.bottlenecks.count} bottlenecks, ${contextData.charter ? 'pilot owner defined' : 'no pilot owner'}

COMPLETED SEGMENTS: ${contextData.workshop.segments_completed.join(', ') || 'None'}

Generate the report now. Return ONLY valid JSON.`;

    console.log('[generate-final-report] Calling AI with context...');

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
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    console.log('[generate-final-report] AI response received, parsing JSON...');

    // Extract JSON from response (may be wrapped in markdown code blocks)
    let jsonContent = aiContent.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    const reportData = JSON.parse(jsonContent);

    // Post-process: Force truncate ALL text fields to ensure limits
    if (reportData.exec_summary) {
      const words = reportData.exec_summary.split(/\s+/);
      if (words.length > 140) {
        reportData.exec_summary = words.slice(0, 140).join(' ') + '...';
      }
    }

    if (reportData.strengths) {
      reportData.strengths = reportData.strengths.slice(0, 3).map((s: string) => {
        const words = s.split(/\s+/);
        return words.length > 18 ? words.slice(0, 18).join(' ') + '...' : s;
      });
    }

    if (reportData.gaps) {
      reportData.gaps = reportData.gaps.slice(0, 3).map((g: string) => {
        const words = g.split(/\s+/);
        return words.length > 15 ? words.slice(0, 15).join(' ') + '...' : g;
      });
    }

    console.log('[generate-final-report] Report generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-final-report] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
