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
      throw new Error('Missing workshop_session_id');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all workshop data
    const { data: workshop } = await supabase
      .from('workshop_sessions')
      .select('*, exec_intakes(*)')
      .eq('id', workshop_session_id)
      .single();

    const { data: bottlenecks } = await supabase
      .from('bottleneck_submissions')
      .select('*')
      .eq('workshop_session_id', workshop_session_id);

    const { data: mapItems } = await supabase
      .from('effortless_map_items')
      .select('*')
      .eq('workshop_session_id', workshop_session_id)
      .order('vote_count', { ascending: false });

    const { data: simulations } = await supabase
      .from('simulation_results')
      .select('*')
      .eq('workshop_session_id', workshop_session_id);

    const { data: addendum } = await supabase
      .from('strategy_addendum')
      .select('*')
      .eq('workshop_session_id', workshop_session_id)
      .single();

    const { data: charter } = await supabase
      .from('pilot_charter')
      .select('*')
      .eq('workshop_session_id', workshop_session_id)
      .single();

    const { data: pulses } = await supabase
      .from('exec_pulses')
      .select('*')
      .eq('intake_id', workshop?.intake_id);

    // Aggregate data for PDF
    const pdfData = {
      workshop,
      bottlenecks,
      mapItems,
      simulations,
      addendum,
      charter,
      pulses,
      generated_at: new Date().toISOString(),
    };

    // In a real implementation, you would use a PDF generation library
    // For now, we return structured JSON that can be used by a client-side PDF generator
    const pdfBase64 = btoa(JSON.stringify(pdfData, null, 2));

    return new Response(
      JSON.stringify({ 
        pdf: pdfBase64,
        filename: `MINDMAKER_Workshop_${workshop?.exec_intakes?.company_name}.pdf`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-executive-pdf:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
