import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { assessmentData } = await req.json();

    console.log('Generating business insights for:', assessmentData.businessName);

    // Fetch all modules from database
    const { data: modules, error: modulesError } = await supabase
      .from('ai_literacy_modules')
      .select('*');

    if (modulesError) {
      console.error('Error fetching modules:', modulesError);
      throw modulesError;
    }

    // Build comprehensive assessment prompt using Mindmaker methodology
    const systemPrompt = `You are an expert AI literacy consultant from The Mindmaker, creator of the Mindmaker methodology: ASSESS → ABSORB → APPLY → ACCELERATE.

Your mission: Transform enterprise teams from AI-confused to AI-enabled, focusing on revenue impact and measurable business outcomes.

Core expertise:
- 200+ individuals transformed across enterprise teams
- Proven track record turning AI experiments into revenue drivers
- Deep understanding of the "pendulum theory" (AI as augmentation, not replacement)
- Expert in workflow redesign and agentic future preparation
- Specialization in helping teams spot automation opportunities without becoming automation dependent

You analyze business data and recommend personalized AI literacy modules that drive growth, efficiency, and competitive advantage.`;

    const userPrompt = `Analyze this business assessment and provide strategic AI literacy insights:

BUSINESS PROFILE:
- Company: ${assessmentData.businessName}
- Contact: ${assessmentData.contactName} (${assessmentData.contactEmail})
- Authority Level: ${assessmentData.authorityLevel}
- Timeline: ${assessmentData.implementationTimeline}

AI REVENUE IMPACT ASSESSMENT:
- Current AI Usage: ${assessmentData.aiUsagePercentage} of team uses AI weekly
- Growth Use Cases: ${assessmentData.growthUseCases}
- Messaging Adaptation with AI: ${assessmentData.messagingAdaptation}
- Revenue KPIs Linked: ${assessmentData.revenueKPIs}
- Power Users Emerging: ${assessmentData.powerUsers}
- Team Recognition: ${assessmentData.teamRecognition}

AVAILABLE MODULES TO RECOMMEND (Choose 3-4 most impactful):
${JSON.stringify(modules, null, 2)}

Based on Mindmaker methodology (ASSESS → ABSORB → APPLY → ACCELERATE), provide:

1. **AI Maturity Score** (0-100): Sophisticated assessment of where they are today
2. **Revenue Impact Potential** (0-100): Based on their growth indicators and current state
3. **Implementation Readiness** (0-100): Authority + timeline + business context
4. **Strategic Summary** (2-3 sentences): Executive-level insight that gets them excited
5. **Key Opportunities** (3-4 bullet points): Specific high-value AI applications for their situation
6. **Risk Factors** (2-3 bullet points): What could derail their AI journey if not addressed
7. **Recommended Modules** (3-4 modules): Select the most impactful modules from the database above, with specific rationale for each
8. **Investment Insight**: Brief ROI perspective based on their profile

Return ONLY valid JSON in this exact format:
{
  "aiMaturityScore": number,
  "revenueImpactPotential": number,
  "implementationReadiness": number,
  "strategicSummary": "string",
  "keyOpportunities": ["string", "string", "string"],
  "riskFactors": ["string", "string"],
  "recommendedModules": [
    {
      "id": "module-id",
      "rationale": "why this module is perfect for them"
    }
  ],
  "investmentInsight": "string"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    console.log('OpenAI response:', content);

    // Parse the JSON response
    let insights;
    try {
      insights = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      // Fallback insights if parsing fails
      insights = {
        aiMaturityScore: 60,
        revenueImpactPotential: 70,
        implementationReadiness: 65,
        strategicSummary: `${assessmentData.businessName} shows promising AI adoption signals. With focused literacy development, your team can transform experiments into measurable revenue impact.`,
        keyOpportunities: [
          'Accelerate go-to-market with AI-powered messaging adaptation',
          'Build power user network to drive business wins',
          'Link AI experiments to revenue KPIs for measurable ROI'
        ],
        riskFactors: [
          'AI adoption without strategic direction can lead to tool fatigue',
          'Missing revenue linkage may prevent executive buy-in'
        ],
        recommendedModules: [
          {
            id: 'align-leaders',
            rationale: 'Establish executive buy-in and strategic vision for AI transformation'
          },
          {
            id: 'agent-opp-spotter',
            rationale: 'Identify high-value automation opportunities in current workflows'
          },
          {
            id: 'get-building',
            rationale: 'Build first measurable AI tool to demonstrate ROI'
          }
        ],
        investmentInsight: 'Strategic AI literacy investment typically delivers 5-10x ROI within 90 days through improved efficiency and revenue acceleration.'
      };
    }

    // Enrich with full module details
    const enrichedModules = insights.recommendedModules.map((rec: any) => {
      const fullModule = modules.find((m: any) => m.id === rec.id);
      return {
        ...fullModule,
        rationale: rec.rationale
      };
    });

    const finalInsights = {
      ...insights,
      recommendedModules: enrichedModules
    };

    console.log('Generated insights:', finalInsights);

    return new Response(
      JSON.stringify(finalInsights),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-business-insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to generate business insights'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});