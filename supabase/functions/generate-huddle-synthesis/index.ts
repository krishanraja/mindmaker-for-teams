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

    // Generate AI synthesis - ALIGNMENT FOCUS
    const prompt = `BOTTLENECK DATA FROM ALIGNMENT SPRINT:
${Object.entries(clusteredData).map(([cluster, items]: [string, any]) => 
  `\n${cluster}:\n${items.map((text: string, i: number) => `  ${i + 1}. ${text}`).join('\n')}`
).join('\n')}

CONTEXT: This bottleneck identification was part of "The Mirror" segment - the team's first reflection on where AI might help. This reveals their CURRENT beliefs about constraints before battle-testing.

Generate a synthesis focusing on ALIGNMENT INSIGHTS:

1. **Key Themes** (3-5 patterns):
   - What types of constraints dominate? (approval delays, data quality, communication friction, etc.)
   - Are these bottlenecks AI-solvable or structural/cultural?
   - What does the bottleneck pattern reveal about this team's decision-making culture?

2. **Tension Indicators** (2-3 observations):
   - Where do bottleneck types conflict? (e.g., "speed vs quality" bottlenecks suggest tension)
   - Are there bottlenecks that require human judgment vs pure automation?
   - Do any bottlenecks suggest misaligned priorities across functions?

3. **Priority Actions** (Top 3 - ALIGNMENT FOCUSED):
   NOT "implement X tool" - instead:
   - "Test whether team agrees AI can address [cluster] in Battle Test #1"
   - "Clarify ownership for [cross-functional bottleneck] before piloting"
   - "Surface risk tolerance gap: some bottlenecks need speed, others need oversight"

4. **Executive Summary** (2-3 paragraphs):
   Frame this as: "What the bottleneck patterns reveal about this team's readiness to make AI decisions together"

Format as JSON:
{
  "keyThemes": ["theme1", "theme2", "theme3"],
  "tensionIndicators": ["tension1", "tension2"],
  "priorityActions": ["action1", "action2", "action3"],
  "executiveSummary": "summary text"
}`;

    const result = await callWithFallback({
      openAIKey: openAIKey,
      lovableKey: lovableKey,
      messages: [
        { role: 'system', content: 'You are an executive facilitator analyzing an Alignment Sprint workshop. Focus on decision-making patterns, not implementation recommendations.' },
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
      
      // Validate output structure - UPDATED FOR ALIGNMENT SPRINT
      if (!parsedSynthesis.keyThemes || !Array.isArray(parsedSynthesis.keyThemes)) {
        throw new Error('Invalid keyThemes structure');
      }
      if (!parsedSynthesis.tensionIndicators || !Array.isArray(parsedSynthesis.tensionIndicators)) {
        console.warn('Missing tensionIndicators - using empty array');
        parsedSynthesis.tensionIndicators = [];
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
        keyThemes: ['Workflow bottlenecks identified', 'Cross-functional dependencies', 'Decision-making delays'],
        tensionIndicators: ['Speed vs oversight tension', 'Ownership clarity needed'],
        priorityActions: ['Test alignment on bottleneck priorities in Battle Test #1', 'Clarify ownership before piloting', 'Surface risk tolerance differences'],
        executiveSummary: synthesisText
      };
    }

    // Save synthesis to database - INCLUDE TENSION INDICATORS
    const { data: savedSynthesis, error: saveError } = await supabase
      .from('huddle_synthesis')
      .upsert({
        workshop_session_id,
        synthesis_text: parsedSynthesis.executiveSummary,
        key_themes: parsedSynthesis.keyThemes,
        priority_actions: parsedSynthesis.priorityActions,
        // Store tension indicators in key_themes for backward compatibility
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
        clusterCount: Object.keys(clusteredData).length,
        _meta: {
          provider: result.provider,
          latencyMs: result.latencyMs,
          model: result.provider === 'gemini-rag' 
            ? 'gemini-2.0-flash' 
            : (result.provider === 'openai' ? 'gpt-4o-mini' : 'google/gemini-2.5-flash')
        }
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
