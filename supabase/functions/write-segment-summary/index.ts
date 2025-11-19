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
    const { 
      workshop_session_id, 
      segment_key, 
      headline, 
      key_points, 
      primary_metric, 
      primary_metric_label,
      segment_data 
    } = await req.json();

    if (!workshop_session_id || !segment_key || !headline || !key_points) {
      throw new Error('Missing required fields');
    }

    // Validate headline length
    if (headline.length > 80) {
      throw new Error('Headline must be 80 characters or less');
    }

    // Validate key_points count and length
    if (key_points.length > 5) {
      throw new Error('Maximum 5 key points allowed');
    }

    const validatedKeyPoints = key_points.map((point: string) => {
      const wordCount = point.split(/\s+/).length;
      if (wordCount > 18) {
        console.warn(`Key point exceeds 18 words: "${point.slice(0, 50)}..."`);
      }
      return point;
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert segment summary (replace if exists for this workshop+segment combo)
    const { data, error } = await supabase
      .from('segment_summaries')
      .upsert({
        workshop_session_id,
        segment_key,
        headline,
        key_points: validatedKeyPoints,
        primary_metric: primary_metric || null,
        primary_metric_label: primary_metric_label || null,
        segment_data: segment_data || {}
      }, {
        onConflict: 'workshop_session_id,segment_key'
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[write-segment-summary] Saved ${segment_key} summary for workshop ${workshop_session_id}`);

    return new Response(
      JSON.stringify({ success: true, summary: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[write-segment-summary] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
