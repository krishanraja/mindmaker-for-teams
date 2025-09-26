import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert AI transformation consultant who generates precise, actionable business insights. Always respond with valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const aiResponse = data.choices[0].message.content;
    
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

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-insights function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});