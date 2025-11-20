import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const { profile_id, include_history = false } = await req.json();

    if (!profile_id) {
      return new Response(
        JSON.stringify({ error: 'profile_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch everything about this profile
    const [profileResult, eventsResult, insightsResult] = await Promise.all([
      supabase.from('unified_profiles').select('*').eq('id', profile_id).single(),
      supabase.from('workshop_events')
        .select('*')
        .eq('profile_id', profile_id)
        .order('created_at', { ascending: false })
        .limit(include_history ? 100 : 20),
      supabase.from('profile_insights')
        .select('*')
        .eq('profile_id', profile_id)
        .order('created_at', { ascending: false })
    ]);

    if (profileResult.error) throw profileResult.error;

    // Build dimension summary (latest insight per dimension)
    const dimensionSummary: Record<string, any> = {};
    if (insightsResult.data) {
      for (const insight of insightsResult.data) {
        if (!dimensionSummary[insight.dimension_key] || 
            new Date(insight.created_at) > new Date(dimensionSummary[insight.dimension_key].updated_at)) {
          dimensionSummary[insight.dimension_key] = {
            score: insight.score,
            label: insight.label,
            summary: insight.llm_summary,
            confidence: insight.confidence,
            updated_at: insight.created_at
          };
        }
      }
    }

    // Build question-answer history
    const qaHistory = eventsResult.data?.map(e => ({
      question: e.question_text,
      answer: e.raw_input,
      dimension: e.dimension_key,
      asked_at: e.created_at,
      flow: e.flow_name
    })) || [];

    return new Response(
      JSON.stringify({
        profile: profileResult.data,
        dimension_summary: dimensionSummary,
        qa_history: qaHistory,
        total_interactions: eventsResult.data?.length || 0,
        total_insights: insightsResult.data?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-profile-context error]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
