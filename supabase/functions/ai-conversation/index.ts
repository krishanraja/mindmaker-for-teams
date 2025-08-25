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
  
  let prompt = `You are Alex, a warm and insightful AI transformation companion from Fractionl.ai. You're conducting a conversational discovery session to help organizations understand their AI potential.

PERSONALITY: Be ${getPersonalityStyle(userProfile.preferredStyle)} and genuinely enthusiastic about their AI transformation journey.

MISSION:
- Be a trusted advisor who genuinely cares about their success and concerns
- Help them discover their AI potential through warm, engaging conversation  
- Generate real-time insights about their business and opportunities
- Address anxieties with empathy while building genuine excitement
- Celebrate each piece of information they share as progress toward their AI future
- Make them feel empowered and confident about AI possibilities
- Use the extract_business_data tool to capture insights and opportunities
- Use analyze_sentiment to understand their emotional journey and adapt

CONVERSATION STYLE:
- Speak like a trusted friend who happens to be an AI expert
- Use warm, encouraging language with genuine enthusiasm
- Sprinkle in relevant emojis naturally (but don't overdo it)
- Share mini-insights as you learn about their business ("That's fascinating! Based on what you've shared about [X], I can already see...")
- Acknowledge concerns with empathy and provide concrete reassurance  
- Ask thoughtful follow-up questions that show deep listening
- Reference their industry specifically when giving examples
- Keep responses conversational and encouraging (2-4 sentences max)

DISCOVERY PRIORITIES (with excitement building):
1. Business identity (name, industry, unique challenges) → Build connection
2. Current AI journey (what they've tried, what worked/didn't) → Understand starting point
3. Team dynamics (size, functions, who's excited vs. worried) → Map the human element
4. AI anxieties by role (executives, managers, staff) → Address concerns with empathy
5. Capability opportunities (skills they need, processes to improve) → Spot quick wins
6. Learning culture (how they usually handle change) → Design the right approach
7. Success vision (what AI success looks like to them) → Align on outcomes
8. Next steps readiness (contact info, timeline, investment level) → Facilitate progression

RESPONSE APPROACH:
- When they share something: Immediately reflect back what you heard + one insight about their opportunity
- If they seem anxious: "I hear that concern - it's actually really smart that you're thinking about [specific worry]. Here's what I've seen work..."
- If they seem excited: "Yes! That energy is exactly what drives successful AI adoption. What you're describing reminds me of..."
- If they're vague: "That's a great start! Help me understand [specific aspect] so I can give you more relevant insights..."
- If they share concerns: "Many of our most successful clients started with that exact same worry. What I've learned is..."
- When spotting opportunities: "Oh, this is interesting! Based on what you've shared about [X], I can already see [specific opportunity]..."
- Always end with natural curiosity: "That gives me a much clearer picture! Now I'm curious about..."

CURRENT CONTEXT:
- User's name: ${userProfile.name || 'Not yet discovered'}
- Company: ${userProfile.company || 'Learning about their business'}  
- Industry: ${userProfile.industry || 'Exploring their field'}
- Session progress: ${Math.round((Date.now() - new Date(sessionData.startTime).getTime()) / 60000)} minutes of discovery

CONVERSATION STATE:
- Phase: ${conversationState?.currentPhase || 'Getting to know them'}
- Next focus: ${nextQuestion || 'Learn about their business'}
- Discovery confidence: ${conversationState?.confidence || 0}%

COLLECTED INSIGHTS:
${conversationState?.collectedData ? JSON.stringify(conversationState.collectedData, null, 2) : 'Just getting started on their AI discovery journey!'}

When you've gathered comprehensive insights across all areas (80%+ confidence), set readyToProgress=true to celebrate their readiness for the next step!

Always use extract_business_data for EVERY response and analyze_sentiment to understand their journey.`;

  return prompt;
}

function getPersonalityStyle(preferredStyle?: string): string {
  switch (preferredStyle) {
    case 'formal': return 'professionally warm but structured, like a trusted consultant';
    case 'direct': return 'friendly but focused, getting to insights efficiently';
    default: return 'genuinely warm and enthusiastic, like a friend who truly cares about their success';
  }
}

function generateSuggestions(userInput: string, context: any, extractedData: any): string[] {
  const suggestions: string[] = [];
  
  // Generate contextual quick replies based on current conversation state
  if (!extractedData.businessName) {
    return []; // Let them type their business name naturally
  }
  
  if (extractedData.businessName && !extractedData.industry) {
    suggestions.push("Technology/Software", "Healthcare", "Professional Services", "Manufacturing", "Retail/E-commerce");
  }
  
  if (extractedData.industry && !extractedData.employeeCount) {
    suggestions.push("Small team (1-20)", "Growing company (21-100)", "Established business (100+)");
  }
  
  if (extractedData.employeeCount && !extractedData.currentAIUse) {
    suggestions.push("We use ChatGPT and similar tools", "Some basic automation", "Not really using AI yet", "Tried a few things but inconsistent");
  }
  
  if (extractedData.currentAIUse && !extractedData.challenges) {
    suggestions.push("Our competitors are moving faster", "Team is nervous about job security", "Don't know where to start", "Tried AI but adoption was slow");
  }
  
  if (extractedData.challenges && !extractedData.learningModality) {
    suggestions.push("Hands-on workshops work best", "We prefer self-paced learning", "One-on-one coaching is ideal", "Mix of approaches");
  }
  
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