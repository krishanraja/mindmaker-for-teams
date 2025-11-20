import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callWithFallback } from '../_shared/ai-fallback.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { discoveryData } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create a comprehensive prompt for generating insights focused on AI literacy
    const prompt = `You are an expert AI literacy consultant specializing in team development and capability building, analyzing discovery data to generate personalized AI literacy assessments.

**Company Profile:**
- Company: ${discoveryData.businessName}
- Industry: ${discoveryData.industry}
- Size: ${discoveryData.employeeCount} employees
- Contact Role: ${discoveryData.contactRole}

**Current AI Situation:**
- Current AI Use: ${discoveryData.currentAIUse}
- Leadership Vision: ${discoveryData.leadershipVision}
- Implementation Timeline: ${discoveryData.implementationTimeline}

**Challenges & Goals:**
- Biggest Challenges: ${discoveryData.biggestChallenges?.join(', ')}
- Success Metrics: ${discoveryData.successMetrics?.join(', ')}
- Learning Preferences: ${discoveryData.learningPreferences}

Focus ONLY on AI literacy training and team development:
- Building AI confidence across teams
- Reducing AI anxiety and resistance
- Developing practical AI skills
- Creating AI-literate leadership
- Team enablement and coaching approaches
- Learning formats and educational strategies

Based on this profile, provide a detailed analysis in the following JSON format (focus ONLY on AI literacy and team development):

{
  "readinessScore": number (0-100 based on team readiness, leadership support, and learning culture),
  "recommendations": [
    "AI literacy confidence building recommendation for this specific team size and industry",
    "Learning format recommendation based on their preferences and challenges", 
    "Leadership enablement approach for building AI-confident teams"
  ],
  "opportunityAreas": [
    "Team AI literacy development opportunity specific to their challenges",
    "Leadership confidence building opportunity",
    "Practical skill development opportunity for their context"
  ],
  "investmentRange": "CRITICAL: Use team size-based pricing tiers: 1-10 employees='$8k-$15k', 11-50 employees='$15k-$28k', 51-200 employees='$28k-$45k', 201-1000 employees='$45k-$65k', 1000+ employees='$65k+'"
}

Focus EXCLUSIVELY on:
1. AI literacy and confidence building for teams
2. Learning approaches that reduce anxiety and build capability
3. Leadership development for AI adoption
4. Team enablement strategies
5. Educational program recommendations
6. Realistic investment for literacy training programs

Be specific about team development approaches, not product strategy or technical implementation.`;

    console.log('Calling AI with 3-tier fallback for insights generation...');

    const result = await callWithFallback({
      openAIKey: openAIApiKey,
      lovableKey: Deno.env.get('LOVABLE_API_KEY')!,
      geminiServiceAccount: Deno.env.get('GEMINI_SERVICE_ACCOUNT_KEY'),
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert AI transformation consultant who generates precise, actionable business insights. Always respond with valid JSON only.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxTokens: 1500
    });

    console.log(`✅ AI insights generated via ${result.provider} in ${result.latencyMs}ms`);

    const aiResponse = result.content;
    
    // Store metadata for response
    const aiMeta = {
      provider: result.provider,
      latencyMs: result.latencyMs,
      model: result.provider === 'gemini-rag' 
        ? 'gemini-2.0-flash' 
        : (result.provider === 'openai' ? 'gpt-4o-mini' : 'google/gemini-2.5-flash')
    };
    
    // Parse the JSON response
    let insights;
    try {
      insights = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      // Fallback insights
      // Calculate team size-based pricing for fallback
      const getInvestmentRangeBySize = (employeeCount: number) => {
        if (employeeCount <= 10) return "$5k-$12k";
        if (employeeCount <= 50) return "$12k-$25k";
        if (employeeCount <= 200) return "$25k-$45k";
        if (employeeCount <= 1000) return "$45k-$75k";
        return "$75k+";
      };

      insights = {
        readinessScore: 65,
        recommendations: [
          "Implement AI literacy coaching to build leadership confidence",
          "Develop product strategy leveraging AI capabilities",
          "Create team enablement workshops focused on practical AI adoption"
        ],
        opportunityAreas: [
          "Build AI-confident teams through strategic coaching",
          "Leverage AI for competitive product advantages",
          "Develop sustainable AI learning frameworks"
        ],
        investmentRange: getInvestmentRangeBySize(discoveryData.employeeCount || 50)
      };
    }

    console.log('Generated AI insights:', insights);

    return new Response(JSON.stringify({ 
      insights,
      _meta: aiMeta
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in generate-ai-insights function:', error);
    
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
    
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});