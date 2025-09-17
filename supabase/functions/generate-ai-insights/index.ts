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

    // Create a comprehensive prompt for generating insights
    const prompt = `You are an expert AI transformation consultant analyzing business discovery data to generate personalized recommendations for AI literacy training.

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

Based on this profile, provide a detailed analysis in the following JSON format:

{
  "readinessScore": number (0-100 based on their AI maturity, leadership buy-in, and implementation urgency),
  "recommendations": [
    "Specific, actionable recommendation tailored to their situation",
    "Another targeted recommendation",
    "Third recommendation focusing on their success metrics"
  ],
  "riskFactors": [
    "Key risk factor they should address",
    "Another potential challenge to monitor"
  ],
  "opportunityAreas": [
    "High-value opportunity area for AI implementation",
    "Strategic advantage they could gain",
    "Quick win they could achieve"
  ],
  "investmentRange": "One of: '$18k-$25k', '$25k-$45k', '$45k-$60k', '$60k+' (based on company size, complexity, and needs)"
}

Focus on:
1. Their specific industry context and challenges
2. Company size-appropriate recommendations
3. Addressing their stated concerns and success metrics
4. Realistic investment range based on their profile
5. Actionable next steps that match their timeline

Be specific, professional, and demonstrate deep understanding of their business situation.`;

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
      insights = {
        readinessScore: 65,
        recommendations: [
          "Start with executive alignment and mindset reset sessions",
          "Implement hands-on AI literacy workshops for key team members",
          "Establish governance framework and best practices early"
        ],
        riskFactors: [
          "Resistance to change from team members",
          "Lack of clear success metrics and measurement"
        ],
        opportunityAreas: [
          "Operational efficiency improvements",
          "Competitive advantage through early AI adoption",
          "Enhanced team confidence and capability"
        ],
        investmentRange: "$25k-$45k"
      };
    }

    console.log('Generated AI insights:', insights);

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});