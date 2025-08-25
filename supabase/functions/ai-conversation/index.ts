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
    const { userInput, context, sessionId, conversationState, nextQuestion } = await req.json();
    
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
    const systemPrompt = buildSystemPrompt(context, conversationState, nextQuestion);

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
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_business_data',
              description: 'Extract structured business information from user responses',
              parameters: {
                type: 'object',
                properties: {
                   businessName: { type: 'string' },
                  businessDescription: { type: 'string' },
                  industry: { type: 'string' },
                  employeeCount: { type: 'number' },
                  businessFunctions: { type: 'array', items: { type: 'string' } },
                  aiAdoption: { type: 'string' },
                  currentAIUse: { type: 'string' },
                  challenges: { type: 'array', items: { type: 'string' } },
                  executiveAnxiety: { type: 'number' },
                  managementAnxiety: { type: 'number' },
                  staffAnxiety: { type: 'number' },
                  techAnxiety: { type: 'number' },
                  nonTechAnxiety: { type: 'number' },
                  aiSkills: { type: 'array', items: { type: 'string' } },
                  automationRisks: { type: 'array', items: { type: 'string' } },
                  learningModality: { type: 'string' },
                  changeNarrative: { type: 'string' },
                  successTargets: { type: 'array', items: { type: 'string' } },
                  userName: { type: 'string' },
                  businessEmail: { type: 'string' },
                  businessUrl: { type: 'string' },
                  country: { type: 'string' },
                  readyToProgress: { type: 'boolean' },
                  confidence: { type: 'number', minimum: 0, maximum: 1 }
                }
              }
            }
          },
          {
            type: 'function',
            function: {
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
          }
        ],
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content || '';
    const toolCalls = data.choices[0].message.tool_calls;

    console.log('AI Response generated, length:', aiResponse?.length);

    // Process tool calls for data extraction
    let extractedData = {};
    let detectedEmotion = 'neutral';
    let detectedIntent = 'general';

    if (toolCalls && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        try {
          const functionArgs = JSON.parse(toolCall.function.arguments);
          
          if (toolCall.function.name === 'extract_business_data') {
            extractedData = functionArgs;
            console.log('Extracted business data:', extractedData);
          } else if (toolCall.function.name === 'analyze_sentiment') {
            detectedEmotion = functionArgs.emotion || 'neutral';
            detectedIntent = functionArgs.urgency || 'medium';
          }
        } catch (error) {
          console.error('Error parsing tool call:', error);
        }
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

function buildSystemPrompt(context: any, conversationState?: any, nextQuestion?: string): string {
  const userProfile = context.userProfile || {};
  const sessionData = context.sessionData || {};
  
  let prompt = `You are an expert AI transformation consultant from Fractionl.ai. You're conducting a focused business AI readiness assessment to gather ALL data needed for a complete diagnostic.

YOUR MISSION: Collect comprehensive data through natural conversation that covers:
- Business basics (name, industry, employee count, functions)
- Current AI adoption and challenges
- Team anxiety levels (executives, management, staff, tech/non-tech teams)
- Existing AI skills and automation risks
- Learning preferences and change narratives
- Success targets and goals
- Contact information for follow-up

CONVERSATION RULES:
1. Ask ONE clear, focused question at a time
2. Build naturally on previous answers - show you're listening
3. NEVER repeat questions about information already provided
4. Extract and remember ALL data from each response
5. Provide smart multiple-choice quick replies
6. Guide toward comprehensive data collection

CURRENT PHASE: ${conversationState?.currentPhase || 'business'}
SUGGESTED NEXT: ${nextQuestion || 'Ask about business name'}
CONFIDENCE: ${conversationState?.confidence || 0}%

DATA COLLECTED SO FAR:
${conversationState?.collectedData ? JSON.stringify(conversationState.collectedData, null, 2) : 'None yet'}

PERSONALITY: Be ${getPersonalityStyle(userProfile.preferredStyle)} but always professional and insightful.

CURRENT CONTEXT:
- User's name: ${userProfile.name || 'Not provided'}
- Company: ${userProfile.company || 'Not provided'}  
- Industry: ${userProfile.industry || 'Not provided'}
- Session duration: ${Math.round((Date.now() - new Date(sessionData.startTime).getTime()) / 60000)} minutes

When you have comprehensive data across all areas (80%+ confidence), set readyToProgress=true in extract_business_data to complete the assessment.

Always use extract_business_data tool for EVERY response to capture data and analyze_sentiment to understand user state.`;

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
  
  // Generate contextual quick replies based on current conversation state
  if (!extractedData.businessName) {
    return []; // Let them type their business name
  }
  
  if (extractedData.businessName && !extractedData.industry) {
    suggestions.push("Software", "Healthcare", "Manufacturing", "Consulting", "Retail", "Other");
  }
  
  if (extractedData.industry && !extractedData.employeeCount) {
    suggestions.push("1-10 people", "11-50 people", "51-200 people", "200+ people");
  }
  
  if (extractedData.employeeCount && !extractedData.currentAIUse) {
    suggestions.push("Yes, several tools", "Just basic ones", "None yet", "Not sure");
  }
  
  if (extractedData.currentAIUse && !extractedData.challenges) {
    suggestions.push("Efficiency", "Competition", "Growth", "Costs", "Other");
  }
  
  return suggestions.slice(0, 4);
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