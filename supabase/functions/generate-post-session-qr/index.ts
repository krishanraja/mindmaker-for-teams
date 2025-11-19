import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate feedback URL using production APP_URL
    const appUrl = Deno.env.get('APP_URL') || 'https://teams.themindmaker.ai';
    const feedbackUrl = `${appUrl}/mobile/post-session-review/${workshop_session_id}`;

    console.log('[generate-post-session-qr] Generated feedback URL:', feedbackUrl);

    // Fetch existing review stats
    const { data: reviews, error: reviewsError } = await supabase
      .from('post_session_reviews')
      .select('ai_leadership_confidence, session_enjoyment')
      .eq('workshop_session_id', workshop_session_id);

    if (reviewsError) {
      console.error('[generate-post-session-qr] Error fetching reviews:', reviewsError);
    }

    const avgConfidence = reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.ai_leadership_confidence, 0) / reviews.length).toFixed(1)
      : null;
    
    const avgEnjoyment = reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.session_enjoyment, 0) / reviews.length).toFixed(1)
      : null;

    return new Response(
      JSON.stringify({ 
        qr_url: feedbackUrl,
        review_stats: {
          count: reviews?.length || 0,
          avg_confidence: avgConfidence ? parseFloat(avgConfidence) : null,
          avg_enjoyment: avgEnjoyment ? parseFloat(avgEnjoyment) : null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[generate-post-session-qr] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});