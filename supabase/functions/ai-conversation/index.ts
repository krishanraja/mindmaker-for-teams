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
    
    // Validate OpenAI response structure
    if (!data.choices || !data.choices[0]) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI');
    }
    
    const aiResponse = data.choices[0].message?.content || '';
    const toolCalls = data.choices[0].message?.tool_calls;

    // Ensure we have a valid response
    if (!aiResponse && (!toolCalls || toolCalls.length === 0)) {
      console.error('Empty OpenAI response received');
      throw new Error('Empty response from AI');
    }

    console.log('AI Response generated, length:', aiResponse?.length || 0);

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
    
    // Provide proper fallback response and suggestions
    const fallbackSuggestions = [
      "Tell me about your business",
      "What industry are you in?", 
      "How many employees do you have?"
    ];
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I apologize, but I'm having trouble processing your message right now. Let's try a simpler approach - could you tell me about your business?",
      extractedData: {},
      detectedEmotion: 'neutral',
      detectedIntent: 'general',
      suggestions: fallbackSuggestions,
      personalizations: {},
      sessionId
    }), {
      status: 200, // Return 200 to avoid breaking the UI
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildSystemPrompt(context: any, conversationState?: any, nextQuestion?: string): string {
  const userProfile = context.userProfile || {};
  const sessionData = context.sessionData || {};
  
  let prompt = `You are an AI Readiness Assessment Specialist from Fractionl.ai, conducting a strategic assessment for Enterprise L&D Leaders. Your role is to efficiently evaluate organizational AI readiness across 5 key dimensions.

POSITIONING: You are a business consultant with deep expertise in AI transformation for enterprises, not a casual chat companion.

PROFESSIONAL MANDATE:
- Conduct a structured AI readiness assessment for enterprise L&D organizations
- Provide immediate business insights that demonstrate strategic acumen
- Focus on ROI, competitive advantage, and measurable outcomes
- Use professional terminology and business-focused language
- Reference L&D-specific use cases (employee training, skill development, performance management)
- Assess organizational capacity for AI-driven learning initiatives

TARGET AUDIENCE: Enterprise L&D Leaders responsible for:
- Employee skill development and training programs
- Learning technology strategy and implementation
- Change management for new technologies
- ROI measurement of learning initiatives
- Compliance and governance in learning systems

ASSESSMENT FRAMEWORK (5 Key Dimensions):
1. ORGANIZATIONAL STRUCTURE: Industry, size, L&D team structure, reporting relationships
2. CURRENT AI MATURITY: Existing AI tools in L&D, pilot programs, success metrics
3. STRATEGIC READINESS: Executive support, budget allocation, competitive pressures
4. TALENT & SKILLS: Current AI literacy, skill gaps, training capacity
5. IMPLEMENTATION CAPACITY: Change management capability, technology infrastructure, governance

PROFESSIONAL COMMUNICATION STYLE:
- Use business terminology and strategic frameworks
- Reference industry benchmarks and best practices
- Provide immediate, actionable insights based on their responses
- Connect each answer to specific AI transformation opportunities
- Focus on business outcomes: productivity, engagement, retention, compliance
- Keep responses concise and value-focused (2-3 sentences)

DISCOVERY SEQUENCE:
1. START: "Let's assess your organization's AI readiness. What industry are you in?"
2. QUALIFY: Organization size, L&D team structure, primary training challenges
3. ASSESS: Current AI adoption in learning, existing tools, pilot results
4. EVALUATE: Executive support, budget, competitive landscape
5. IDENTIFY: Skill gaps, change readiness, implementation barriers
6. RECOMMEND: Priority use cases, implementation approach, ROI projections

PROFESSIONAL RESPONSES:
- Replace "What brings you here?" with "What's your primary industry?"
- Ask about specific L&D metrics: "What's your biggest training scalability challenge?"
- Reference competitive context: "How are your competitors approaching AI in L&D?"
- Focus on business outcomes: "What would successful AI adoption look like for your L&D ROI?"
- Provide industry insights: "In [industry], we typically see the highest impact from..."

AVOID: Casual conversation, small talk, overly friendly tone, irrelevant personal questions

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

function generateSuggestions(userInput: string, context: any, extractedData: any): any {
  try {
    const data = extractedData || {};
    
    // Generate structured selection interfaces instead of text suggestions
    if (!data.industry) {
      return {
        type: 'dropdown',
        title: 'What industry are you in?',
        description: 'Select your primary industry sector',
        choices: [
          { value: 'healthcare', label: 'Healthcare', description: 'Hospitals, clinics, medical services' },
          { value: 'financial-services', label: 'Financial Services', description: 'Banking, insurance, fintech' },
          { value: 'manufacturing', label: 'Manufacturing', description: 'Production, assembly, industrial' },
          { value: 'technology', label: 'Technology', description: 'Software, hardware, IT services' },
          { value: 'professional-services', label: 'Professional Services', description: 'Consulting, legal, accounting' },
          { value: 'retail', label: 'Retail & E-commerce', description: 'Consumer goods, online sales' },
          { value: 'education', label: 'Education', description: 'Schools, universities, training' },
          { value: 'government', label: 'Government', description: 'Public sector, agencies' },
          { value: 'other', label: 'Other', description: 'Not listed above' }
        ]
      };
    }
    
    if (data.industry && !data.employeeCount) {
      return {
        type: 'radio',
        title: 'How many employees does your organization have?',
        description: 'Select the size that best describes your organization',
        choices: [
          { value: '50-200', label: '50-200 employees', description: 'Small to medium enterprise' },
          { value: '200-1000', label: '200-1,000 employees', description: 'Medium enterprise' },
          { value: '1000-5000', label: '1,000-5,000 employees', description: 'Large enterprise' },
          { value: '5000-20000', label: '5,000-20,000 employees', description: 'Very large enterprise' },
          { value: '20000+', label: '20,000+ employees', description: 'Global enterprise' }
        ]
      };
    }
    
    if (data.employeeCount && !data.currentAIUse) {
      return {
        type: 'button-grid',
        title: 'What describes your current AI adoption in L&D?',
        description: 'Select your current state of AI implementation',
        choices: [
          { value: 'none', label: 'No AI in L&D', description: 'Traditional training methods only' },
          { value: 'exploring', label: 'Exploring AI', description: 'Researching and evaluating options' },
          { value: 'pilot', label: 'Running Pilots', description: 'Testing AI tools in limited scope' },
          { value: 'partial', label: 'Partial Implementation', description: 'Some teams using AI tools' },
          { value: 'full', label: 'Full Deployment', description: 'AI integrated across L&D' }
        ],
        columns: 2
      };
    }
    
    if (data.currentAIUse && !data.challenges) {
      return {
        type: 'multi-select',
        title: 'What are your biggest L&D challenges?',
        description: 'Select up to 3 challenges your organization faces',
        maxSelections: 3,
        choices: [
          { value: 'scaling', label: 'Training Doesn\'t Scale', description: 'Hard to reach all employees' },
          { value: 'engagement', label: 'Low Engagement', description: 'Poor completion rates' },
          { value: 'personalization', label: 'One-Size-Fits-All', description: 'Can\'t personalize learning' },
          { value: 'skills-gaps', label: 'Skills Gaps Growing', description: 'Can\'t keep up with needs' },
          { value: 'measurement', label: 'ROI Measurement', description: 'Hard to prove impact' },
          { value: 'compliance', label: 'Compliance Requirements', description: 'Regulatory training burden' },
          { value: 'budget', label: 'Budget Constraints', description: 'Limited L&D resources' },
          { value: 'technology', label: 'Outdated Technology', description: 'Legacy learning systems' }
        ]
      };
    }
    
    if (data.challenges && !data.successTargets) {
      return {
        type: 'multi-select',
        title: 'What would success look like for your L&D transformation?',
        description: 'Select your top 3 success metrics',
        maxSelections: 3,
        choices: [
          { value: 'cost-reduction', label: '30% Cost Reduction', description: 'Lower training delivery costs' },
          { value: 'completion-rates', label: 'Higher Completion Rates', description: '80%+ course completion' },
          { value: 'faster-development', label: 'Faster Skill Development', description: '50% faster learning cycles' },
          { value: 'personalization', label: 'Personalized Learning', description: 'Adaptive learning paths' },
          { value: 'compliance', label: 'Automated Compliance', description: 'Real-time compliance tracking' },
          { value: 'engagement', label: 'Better Engagement', description: 'Higher learner satisfaction' },
          { value: 'roi-visibility', label: 'Clear ROI Visibility', description: 'Measurable business impact' },
          { value: 'global-scale', label: 'Global Scalability', description: 'Consistent worldwide delivery' }
        ]
      };
    }
    
    // Default text suggestions if no structured selection is needed
    return ["Tell me more about your specific requirements", "What's your timeline for implementation?", "Any other priorities we should discuss?"];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return ["What's your biggest L&D challenge?", "How do you currently measure training ROI?", "What's your annual L&D budget?"];
  }
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