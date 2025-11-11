import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenarioContext, userPrompt, mode = 'iterate' } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    console.log('🔍 CP0 Diagnostic - API Key Check:', {
      keyExists: !!OPENAI_API_KEY,
      keyLength: OPENAI_API_KEY?.length || 0,
      keyPrefix: OPENAI_API_KEY?.substring(0, 7) || 'none'
    });

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('🔍 CP0 Diagnostic - Request:', { 
      mode, 
      scenarioContext, 
      promptLength: userPrompt?.length,
      hasCurrentState: !!scenarioContext?.currentState,
      hasDesiredOutcome: !!scenarioContext?.desiredOutcome
    });

    let systemPrompt = '';
    let userMessage = '';

    if (mode === 'generate_simulation') {
      // Initial simulation generation mode
      systemPrompt = `You are Mindmaker AI, a management consultant presenting to C-suite executives.

SCENARIO:
Current Situation: ${scenarioContext.currentState || 'Not specified'}
Desired Outcome: ${scenarioContext.desiredOutcome || 'Not specified'}

YOUR TASK: Generate a concise discussion guide (think McKinsey slide deck, not engineering doc) for THIS specific scenario.

Return ONLY valid JSON (no markdown) with this EXACT structure:
{
  "sections": [
    {
      "type": "current_state",
      "title": "Today's Reality",
      "insights": [
        "2-3 crisp observations about current inefficiencies",
        "Be concrete and quantifiable where possible"
      ]
    },
    {
      "type": "ai_transformation",
      "title": "With AI Augmentation",
      "insights": [
        "3-4 specific ways AI changes the game for THIS scenario",
        "Focus on strategic impact, not technical details"
      ],
      "metrics": {
        "time_saved": "e.g., 60% faster turnaround",
        "cost_impact": "e.g., $200K annual savings",
        "quality_improvement": "e.g., 40% fewer errors"
      }
    },
    {
      "type": "discussion",
      "title": "Key Questions for Your Team",
      "prompts": [
        "Strategic question that probes implementation readiness",
        "Change management consideration for this transformation",
        "Risk or guardrail question specific to this scenario"
      ]
    }
  ]
}

RULES:
- Maximum 3-4 bullets per section
- Use their exact situation (quote their words)
- Include concrete numbers/metrics
- Write for executives, not engineers
- Keep it scannable and discussion-focused
- Return ONLY the JSON object`;

      userMessage = `Generate an executive discussion guide for this scenario.`;
    } else {
      // Iterative prompting mode
      systemPrompt = `You are Mindmaker AI, an enterprise AI consultant helping a leadership team explore AI capabilities for their business scenario.

SCENARIO CONTEXT:
Current Situation: ${scenarioContext.currentState || 'Not specified'}
Key Stakeholders: ${scenarioContext.stakeholders || 'Not specified'}
Desired Outcome: ${scenarioContext.desiredOutcome || 'Not specified'}
Constraints: ${scenarioContext.constraints || 'Not specified'}

The team has a specific question about implementing AI for this scenario. Provide practical, specific guidance that acknowledges limitations and real-world implementation considerations. Keep your response concise and boardroom-ready.`;

      userMessage = userPrompt;
    }

    const requestPayload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: mode === 'generate_simulation' ? 1000 : 600,
      stream: mode === 'iterate',
    };

    console.log('🔍 CP0 Diagnostic - OpenAI Request:', {
      model: requestPayload.model,
      systemPromptLength: systemPrompt.length,
      userMessageLength: userMessage.length,
      maxTokens: requestPayload.max_completion_tokens,
      stream: requestPayload.stream,
      messageCount: requestPayload.messages.length
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    console.log('🔍 CP0 Diagnostic - OpenAI Response Status:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🚨 CP0 Diagnostic - OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        errorBodyLength: errorText.length
      });
      
      // Try to parse error as JSON for better diagnostics
      try {
        const errorJson = JSON.parse(errorText);
        console.error('🚨 CP0 Diagnostic - Parsed Error:', errorJson);
      } catch {
        console.error('🚨 CP0 Diagnostic - Raw Error Text:', errorText);
      }
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'OpenAI API key is invalid or not configured.' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`OpenAI API returned ${response.status}: ${errorText}`);
    }

    if (mode === 'generate_simulation') {
      // Non-streaming for initial generation (need full JSON)
      const data = await response.json();
      
      console.log('🔍 CP0 Diagnostic - OpenAI Response Structure:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        hasFirstChoice: !!data.choices?.[0],
        hasMessage: !!data.choices?.[0]?.message,
        hasContent: !!data.choices?.[0]?.message?.content,
        contentType: typeof data.choices?.[0]?.message?.content,
        contentLength: data.choices?.[0]?.message?.content?.length || 0,
        fullResponseKeys: Object.keys(data),
        usage: data.usage,
        model: data.model,
        error: data.error
      });
      
      // Validate response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('🚨 CP0 Diagnostic - Invalid Response Structure:', JSON.stringify(data, null, 2));
        throw new Error('OpenAI returned invalid response structure');
      }
      
      const content = data.choices[0].message.content;
      
      if (!content || content.trim() === '') {
        console.error('🚨 CP0 Diagnostic - Empty Content:', {
          content,
          fullMessage: data.choices[0].message,
          fullData: JSON.stringify(data, null, 2)
        });
        throw new Error('OpenAI returned empty content');
      }
      
      console.log('✅ CP0 Diagnostic - Valid Content Received:', {
        contentLength: content.length,
        contentPreview: content.substring(0, 200),
        contentSuffix: content.substring(content.length - 100)
      });
      
      return new Response(JSON.stringify({ content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Stream the response for iterative prompts
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
        },
      });
    }

  } catch (error) {
    console.error('Error in simulation-ai-experiment:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});