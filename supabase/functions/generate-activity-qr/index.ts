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
    const { workshop_session_id, activity_type } = await req.json();

    if (!workshop_session_id || !activity_type) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate unique activity URL
    const activityId = crypto.randomUUID();
    const activityUrl = `${supabaseUrl}/mobile/${activity_type}/${workshop_session_id}/${activityId}`;

    // Create activity session
    const { data, error } = await supabase
      .from('activity_sessions')
      .insert({
        workshop_session_id,
        activity_type,
        qr_code_url: activityUrl,
        is_active: true,
        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        activity_session: data,
        qr_url: activityUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-activity-qr:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
