import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const openaiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all unclustered bottleneck submissions
    const { data: submissions, error: fetchError } = await supabase
      .from('bottleneck_submissions')
      .select('*')
      .eq('workshop_session_id', workshop_session_id)
      .is('cluster_id', null);

    if (fetchError) throw fetchError;

    if (!submissions || submissions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No unclustered submissions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare bottlenecks for clustering
    const bottlenecks = submissions.map(s => ({
      id: s.id,
      text: s.bottleneck_text,
      participant: s.participant_name
    }));

    // Call OpenAI to cluster
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing organizational bottlenecks and clustering them into themes. 
            Given a list of bottlenecks, cluster them into 3-4 major themes. Return JSON with this structure:
            {
              "clusters": [
                {
                  "cluster_id": "unique-id",
                  "cluster_name": "Theme name",
                  "item_ids": ["id1", "id2"]
                }
              ]
            }`
          },
          {
            role: 'user',
            content: JSON.stringify({ bottlenecks })
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    const clusterResult = JSON.parse(aiData.choices[0].message.content);

    // Update submissions with cluster assignments
    for (const cluster of clusterResult.clusters) {
      for (const itemId of cluster.item_ids) {
        await supabase
          .from('bottleneck_submissions')
          .update({
            cluster_id: cluster.cluster_id,
            cluster_name: cluster.cluster_name,
          })
          .eq('id', itemId);
      }
    }

    return new Response(
      JSON.stringify({ clusters: clusterResult.clusters }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cluster-bottleneck-inputs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
