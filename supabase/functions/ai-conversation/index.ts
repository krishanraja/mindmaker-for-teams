import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userInput, context, sessionId } = await req.json();
    
    console.log(`AI Conversation - Session: ${sessionId}, Input length: ${userInput.length}`);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build conversation history for OpenAI
    const conversationHistory = context.messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Create system prompt based on context and user profile
    const systemPrompt = buildSystemPrompt(context);

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userInput }
        ],
        max_completion_tokens: 2000,
        functions: [
          {
            name: 'extract_business_data',
            description: 'Extract structured business information from user responses',
            parameters: {
              type: 'object',
              properties: {
                businessName: { type: 'string' },
                industry: { type: 'string' },
                employeeCount: { type: 'number' },
                currentAIUse: { type: 'string' },
                challenges: { type: 'array', items: { type: 'string' } },
                readyToProgress: { type: 'boolean' },
                confidence: { type: 'number', minimum: 0, maximum: 1 }
              }
            }
          },
          {
            name: 'analyze_sentiment',
            description: 'Analyze emotional tone and communication style',
            parameters: {
              type: 'object',
              properties: {
                emotion: { type: 'string', enum: ['excited', 'nervous', 'confident', 'frustrated', 'curious', 'neutral'] },
                communicationStyle: { type: 'string', enum: ['casual', 'formal', 'direct'] },
                urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
                engagementLevel: { type: 'string', enum: ['low', 'medium', 'high'] }
              }
            }
          }
        ],
        function_call: 'auto',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const functionCall = data.choices[0].message.function_call;

    console.log('AI Response generated, length:', aiResponse?.length);

    // Process function calls for data extraction
    let extractedData = {};
    let detectedEmotion = 'neutral';
    let detectedIntent = 'general';

    if (functionCall) {
      try {
        const functionArgs = JSON.parse(functionCall.arguments);
        
        if (functionCall.name === 'extract_business_data') {
          extractedData = functionArgs;
          console.log('Extracted business data:', extractedData);
        } else if (functionCall.name === 'analyze_sentiment') {
          detectedEmotion = functionArgs.emotion || 'neutral';
          detectedIntent = functionArgs.urgency || 'medium';
        }
      } catch (error) {
        console.error('Error parsing function call:', error);
      }
    }

    // Generate contextual suggestions
    const suggestions = generateSuggestions(userInput, context, extractedData);

    // Generate personalizations for future responses
    const personalizations = generatePersonalizations(context, extractedData);

    return new Response(JSON.stringify({
      response: aiResponse,
      extractedData,
      detectedEmotion,
      detectedIntent,
      suggestions,
      personalizations,
      sessionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-conversation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I apologize, but I'm having trouble processing your message right now. Could you please try rephrasing that?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildSystemPrompt(context: any): string {
  const userProfile = context.userProfile || {};
  const sessionData = context.sessionData || {};
  
  let prompt = `You are an expert AI transformation consultant from Fractionl.ai. Your role is to help organizations understand their AI readiness and create personalized transformation strategies.

PERSONALITY: Be ${getPersonalityStyle(userProfile.preferredStyle)} but always professional and insightful.

CURRENT CONTEXT:
- User's name: ${userProfile.name || 'Not provided'}
- Company: ${userProfile.company || 'Not provided'}  
- Industry: ${userProfile.industry || 'Not provided'}
- Communication style: ${userProfile.preferredStyle || 'Not determined'}
- Session duration: ${Math.round((Date.now() - new Date(sessionData.startTime).getTime()) / 60000)} minutes

YOUR GOALS:
1. Understand their organization's current AI state
2. Identify challenges, anxieties, and opportunities
3. Gather key business information naturally through conversation
4. Build confidence about AI transformation
5. Guide them toward actionable next steps

CONVERSATION STRATEGY:
- Ask ONE focused question at a time
- Listen actively and reference previous responses
- Share relevant insights and examples
- Address concerns with empathy and expertise
- Gradually build toward a comprehensive understanding

KEY INFORMATION TO GATHER:
- Business name and description
- Team size and structure
- Current AI adoption level
- Main challenges and pain points
- Team's anxiety levels about AI
- Success metrics and goals
- Change management experience

WHEN TO PROGRESS:
When you have gathered sufficient information about their business context, team readiness, and transformation goals, use the extract_business_data function with readyToProgress=true.`;

  return prompt;
}

function getPersonalityStyle(preferredStyle?: string): string {
  switch (preferredStyle) {
    case 'formal': return 'polished and structured';
    case 'direct': return 'concise and to-the-point';
    default: return 'warm and conversational';
  }
}

function generateSuggestions(userInput: string, context: any, extractedData: any): string[] {
  const suggestions: string[] = [];
  
  // Generate contextual suggestions based on what they've discussed
  if (userInput.toLowerCase().includes('anxiety') || userInput.toLowerCase().includes('worried')) {
    suggestions.push("What specific concerns does your team have about AI?");
    suggestions.push("How can we address these concerns in your transformation plan?");
  }
  
  if (userInput.toLowerCase().includes('competitor') || userInput.toLowerCase().includes('behind')) {
    suggestions.push("What AI capabilities are your competitors using?");
    suggestions.push("What's your timeline for catching up?");
  }
  
  if (userInput.toLowerCase().includes('leadership') || userInput.toLowerCase().includes('budget')) {
    suggestions.push("What would convince leadership to invest in AI?");
    suggestions.push("What ROI metrics matter most to your organization?");
  }

  // Limit to 2-3 most relevant suggestions
  return suggestions.slice(0, 3);
}

function generatePersonalizations(context: any, extractedData: any): any {
  const personalizations: any = {};
  
  // Industry-specific personalizations
  if (extractedData.industry) {
    personalizations.industryInsights = getIndustryInsights(extractedData.industry);
  }
  
  // Company size personalizations
  if (extractedData.employeeCount) {
    personalizations.sizeRecommendations = getSizeRecommendations(extractedData.employeeCount);
  }
  
  return personalizations;
}

function getIndustryInsights(industry: string): string[] {
  const insights: Record<string, string[]> = {
    'healthcare': ['HIPAA compliance considerations', 'Clinical decision support opportunities'],
    'finance': ['Regulatory compliance requirements', 'Fraud detection applications'],
    'retail': ['Customer personalization opportunities', 'Inventory optimization potential'],
    'manufacturing': ['Predictive maintenance benefits', 'Quality control automation'],
    'education': ['Personalized learning paths', 'Administrative efficiency gains']
  };
  
  return insights[industry.toLowerCase()] || ['Cross-industry best practices', 'Competitive advantage opportunities'];
}

function getSizeRecommendations(employeeCount: number): string[] {
  if (employeeCount < 50) {
    return ['Focus on high-impact, low-maintenance AI tools', 'Consider SaaS solutions over custom development'];
  } else if (employeeCount < 500) {
    return ['Build AI governance framework', 'Invest in employee training programs'];
  } else {
    return ['Establish AI center of excellence', 'Develop comprehensive change management strategy'];
  }
}