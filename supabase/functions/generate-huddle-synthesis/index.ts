import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { callWithFallback, getSegmentPrompt } from "../_shared/ai-fallback.ts";

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
    const openAIKey = Deno.env.get('OPENAI_API_KEY')!;
    const lovableKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching bottleneck submissions for workshop:', workshop_session_id);

    // Fetch all bottleneck submissions
    const { data: bottlenecks, error: bottleneckError } = await supabase
      .from('bottleneck_submissions')
      .select('*')
      .eq('workshop_session_id', workshop_session_id)
      .order('created_at', { ascending: true });

    if (bottleneckError) throw bottleneckError;

    if (!bottlenecks || bottlenecks.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No bottleneck submissions found',
          synthesis: null 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${bottlenecks.length} bottleneck submissions`);

    // Group by cluster if available
    const clusteredData = bottlenecks.reduce((acc: any, submission: any) => {
      const cluster = submission.cluster_name || 'Uncategorized';
      if (!acc[cluster]) {
        acc[cluster] = [];
      }
      acc[cluster].push(submission.bottleneck_text);
      return acc;
    }, {});

    // Generate AI synthesis
    const prompt = `BOTTLENECK DATA:
${Object.entries(clusteredData).map(([cluster, items]: [string, any]) => 
  `\n${cluster}:\n${items.map((text: string, i: number) => `  ${i + 1}. ${text}`).join('\n')}`
).join('\n')}

Generate a comprehensive synthesis with:
1. **Key Themes** (3-5 major patterns across all bottlenecks)
2. **Priority Actions** (Top 3 actionable recommendations)
3. **Executive Summary** (2-3 paragraph overview highlighting urgency, impact, and strategic alignment)

Format as JSON:
{
  "keyThemes": ["theme1", "theme2", "theme3"],
  "priorityActions": ["action1", "action2", "action3"],
  "executiveSummary": "summary text"
}`;

    const result = await callWithFallback({
      openAIKey: openAIKey,
      lovableKey: lovableKey,
      messages: [
        { role: 'system', content: getSegmentPrompt('synthesis') },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    console.log(`✅ Huddle Synthesis: ${result.provider} (${result.latencyMs}ms)`);

    const synthesisText = result.content;

    console.log('📄 AI synthesis generated:', synthesisText.substring(0, 100));

    // Parse the JSON response with validation
    let parsedSynthesis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = synthesisText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                        synthesisText.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[1] : synthesisText;
      parsedSynthesis = JSON.parse(jsonString);
      
      // Validate output structure
      if (!parsedSynthesis.keyThemes || !Array.isArray(parsedSynthesis.keyThemes)) {
        throw new Error('Invalid keyThemes structure');
      }
      if (!parsedSynthesis.priorityActions || !Array.isArray(parsedSynthesis.priorityActions)) {
        throw new Error('Invalid priorityActions structure');
      }
      if (!parsedSynthesis.executiveSummary || typeof parsedSynthesis.executiveSummary !== 'string') {
        throw new Error('Invalid executiveSummary structure');
      }
      
      console.log('✓ Output validation passed');
    } catch (e) {
      console.error('⚠️ Failed to parse/validate AI response:', e);
      parsedSynthesis = {
        keyThemes: ['Data quality and governance', 'Change management', 'Skills and training'],
        priorityActions: ['Establish data governance framework', 'Launch pilot program', 'Invest in upskilling'],
        executiveSummary: synthesisText
      };
    }

    // Save synthesis to database
    const { data: savedSynthesis, error: saveError } = await supabase
      .from('huddle_synthesis')
      .upsert({
        workshop_session_id,
        synthesis_text: parsedSynthesis.executiveSummary,
        key_themes: parsedSynthesis.keyThemes,
        priority_actions: parsedSynthesis.priorityActions,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'workshop_session_id'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving synthesis:', saveError);
    }

    return new Response(
      JSON.stringify({ 
        synthesis: savedSynthesis || parsedSynthesis,
        bottleneckCount: bottlenecks.length,
        clusterCount: Object.keys(clusteredData).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in generate-huddle-synthesis:', error);
    
    // Handle rate limit and payment errors gracefully
    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      return new Response(JSON.stringify({ 
        error: 'AI service temporarily unavailable due to high demand. Please try again in 1 minute.',
        errorCode: 'RATE_LIMIT',
        retryAfter: 60
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (error.message?.includes('PAYMENT_REQUIRED')) {
      return new Response(JSON.stringify({ 
        error: 'AI service requires payment. Please contact support.',
        errorCode: 'PAYMENT_REQUIRED'
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
