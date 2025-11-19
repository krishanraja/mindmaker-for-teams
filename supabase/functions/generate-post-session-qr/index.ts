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
    const body = await req.json();
    console.log('[generate-post-session-qr] Request received');
    console.log('[generate-post-session-qr] Full body:', JSON.stringify(body));
    console.log('[generate-post-session-qr] Body keys:', Object.keys(body));
    
    // Handle both parameter names for compatibility
    const workshop_session_id = body.workshop_session_id || body.workshopId;
    console.log('[generate-post-session-qr] Extracted workshop_session_id:', workshop_session_id);

    if (!workshop_session_id) {
      console.error('[generate-post-session-qr] Missing workshop_session_id. Body received:', JSON.stringify(body));
      return new Response(
        JSON.stringify({ error: 'workshop_session_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[generate-post-session-qr] Processing for workshop:', workshop_session_id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Hardcode production URL like other QR codes in the app
    const appUrl = 'https://teams.themindmaker.ai';
    const feedbackUrl = `${appUrl}/mobile/post-session-review/${workshop_session_id}`;

    console.log('[generate-post-session-qr] Generated feedback URL:', feedbackUrl);

    // Fetch existing review stats with defensive error handling
    let reviews = [];
    try {
      const { data, error: reviewsError } = await supabase
        .from('post_session_reviews')
        .select('ai_leadership_confidence, session_enjoyment')
        .eq('workshop_session_id', workshop_session_id);

      if (reviewsError) {
        console.error('[generate-post-session-qr] Error fetching reviews:', reviewsError);
      } else {
        reviews = data || [];
      }
    } catch (dbError) {
      console.error('[generate-post-session-qr] Database query failed:', dbError);
      // Continue execution with empty reviews
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