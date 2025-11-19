import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callWithFallback, WORKSHOP_FOUNDATION_PROMPT } from "../_shared/ai-fallback.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenarioContext, userPrompt, mode = 'iterate', jargonLevel = 50 } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    console.log('🔍 CP0 Diagnostic - API Key Check:', {
      openAIKeyExists: !!OPENAI_API_KEY,
      lovableKeyExists: !!LOVABLE_API_KEY,
      openAIKeyLength: OPENAI_API_KEY?.length || 0,
      openAIKeyPrefix: OPENAI_API_KEY?.substring(0, 7) || 'none'
    });

    if (!OPENAI_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('API keys not configured');
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

    // Build jargon guidance based on level
    const getJargonGuidance = (level: number) => {
      if (level < 33) return "Use only plain English. Avoid ALL acronyms, technical terms, and industry jargon. Explain concepts as if to someone with no business or tech background. Use simple, everyday language.";
      if (level < 67) return "Balance plain English with industry terms. Define acronyms on first use. Keep language accessible to smart generalists.";
      return "Use industry-standard terminology and acronyms freely. Assume expert audience familiar with business and AI concepts.";
    };

    if (mode === 'generate_simulation') {
      // Initial simulation generation mode - use fallback system
      systemPrompt = WORKSHOP_FOUNDATION_PROMPT + `

## Current Segment: Simulation Lab

${getJargonGuidance(jargonLevel)}

SCENARIO:
Current Situation: ${scenarioContext.currentState || 'Not specified'}
Desired Outcome: ${scenarioContext.desiredOutcome || 'Not specified'}

CRITICAL ANTI-FABRICATION RULES:
- NEVER invent statistics, percentages, dollar amounts, or specific timeframes
- ONLY reference data explicitly provided in the scenario context
- If no specific metrics exist, use qualitative language ("significant", "substantial", "notable")
- When discussing business impact, use conditional language: "could result in", "may lead to", "potential for"
- DO NOT create specific numeric examples unless they come from the provided scenario
- Focus on describing the nature of the opportunity, not inventing measurable outcomes

YOUR TASK: Generate an executive discussion guide for THIS specific scenario in plain, actionable language.

Return ONLY valid JSON (no markdown) with this EXACT structure:
{
  "sections": [
    {
      "type": "current_state",
      "title": "Today's Reality",
      "insights": [
        "Probe WHY this is broken - what's the real cost/pain/risk? (qualitative only)",
        "Be brutally specific about business impact (no fabricated numbers)",
        "Include concrete examples from THIS scenario (no made-up statistics)"
      ]
    },
    {
      "type": "ai_transformation",
      "title": "With AI Augmentation",
      "insights": [
        "Show exactly HOW AI addresses THIS specific problem",
        "Reference what similar companies have done (general examples only, no specific metrics unless provided)",
        "Connect directly to THEIR scenario, not generic AI benefits"
      ],
      "impact_description": "Qualitative description of potential impact without specific numbers"
    },
    {
      "type": "discussion",
      "title": "Key Questions for Your Team",
      "prompts": [
        {
          "question": "Specific strategic question about THIS scenario",
          "ideas": [
            "Idea 1: First concrete approach you could try",
            "Idea 2: Second concrete approach you could try",
            "Idea 3: Third concrete approach you could try"
          ]
        },
        {
          "question": "Change management question specific to THIS transformation",
          "ideas": [
            "Idea 1: First stakeholder/adoption strategy",
            "Idea 2: Second stakeholder/adoption strategy",
            "Idea 3: Third stakeholder/adoption strategy"
          ]
        },
        {
          "question": "Risk/guardrail question for THIS specific scenario",
          "ideas": [
            "Idea 1: First mitigation approach",
            "Idea 2: Second mitigation approach",
            "Idea 3: Third mitigation approach"
          ]
        }
      ]
    }
  ]
}

CRITICAL RULES:
1. CURRENT STATE: Don't just describe it - explain WHY it's a problem. What's breaking? What's the cost?
2. AI TRANSFORMATION: Reference specific companies/industries solving similar problems. Be concrete, not theoretical.
3. DISCUSSION PROMPTS: Frame as "ideas to consider" not rigid options. Each question must have 3 distinct, actionable ideas the team can discuss. Use the word "ideas" not "options".
4. Use THEIR exact words and situation throughout
5. Be specific to THIS scenario - no generic platitudes or jargon
6. Return ONLY the JSON object`;

      userMessage = scenarioContext?.currentState 
        ? `Generate a simulation discussion guide for: ${scenarioContext.currentState}. Desired outcome: ${scenarioContext.desiredOutcome || 'improved efficiency and effectiveness'}.`
        : 'Generate a general AI transformation scenario discussion guide.';

      const result = await callWithFallback({
        openAIKey: OPENAI_API_KEY,
        lovableKey: LOVABLE_API_KEY,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        maxTokens: 2000,
        temperature: 0.7
      });

      console.log(`🎯 Simulation Generation: ${result.provider} (${result.latencyMs}ms)`);

      return new Response(JSON.stringify({ content: result.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Iterative mode - streaming (keep OpenAI only for now)
      systemPrompt = WORKSHOP_FOUNDATION_PROMPT + `

## Current Segment: Simulation Lab - Iterative Discussion

You are facilitating a follow-up discussion about an AI transformation scenario.
The executive team is exploring ideas, asking clarifying questions, or refining their approach.

Respond in a conversational, supportive tone. Keep answers concise (2-3 sentences).
Focus on practical next steps and real-world considerations.`;

      userMessage = userPrompt || 'Continue the discussion.';

      console.log('🔍 CP0 Diagnostic - Streaming Mode Request:', {
        promptLength: userMessage.length,
        hasScenarioContext: !!scenarioContext
      });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 300,
          temperature: 0.7,
          stream: true
        }),
      });
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