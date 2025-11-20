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
      const jargonGuidance = getJargonGuidance(jargonLevel);
      const currentState = scenarioContext.currentState || 'Not specified';
      const desiredOutcome = scenarioContext.desiredOutcome || 'Not specified';
      
      systemPrompt = WORKSHOP_FOUNDATION_PROMPT + '\n\n## Current Segment: Simulation Lab\n\n' + jargonGuidance + '\n\nSCENARIO:\nCurrent Situation: ' + currentState + '\nDesired Outcome: ' + desiredOutcome + '\n\nCRITICAL ANTI-FABRICATION RULES:\n- NEVER invent statistics, percentages, dollar amounts, or specific timeframes\n- ONLY reference data explicitly provided in the scenario context\n- If no specific metrics exist, use qualitative language ("significant", "substantial", "notable")\n- When discussing business impact, use conditional language: "could result in", "may lead to", "potential for"\n- DO NOT create specific numeric examples unless they come from the provided scenario\n- Focus on describing the nature of the opportunity, not inventing measurable outcomes\n\nYOUR TASK: Generate an executive discussion guide for THIS specific scenario in plain, actionable language.\n\nReturn ONLY valid JSON (no markdown) with this EXACT structure:\n{\n  "sections": [\n    {\n      "type": "current_state",\n      "title": "Today\'s Reality",\n      "insights": [\n        "Probe WHY this is broken - what\'s the real cost/pain/risk? (qualitative only)",\n        "Be brutally specific about business impact (no fabricated numbers)",\n        "Include concrete examples from THIS scenario (no made-up statistics)"\n      ]\n    },\n    {\n      "type": "ai_transformation",\n      "title": "With AI Augmentation",\n      "insights": [\n        "Show exactly HOW AI addresses THIS specific problem",\n        "Reference what similar companies have done (general examples only, no specific metrics unless provided)",\n        "Connect directly to THEIR scenario, not generic AI benefits"\n      ],\n      "impact_description": "Qualitative description of potential impact without specific numbers"\n    },\n    {\n      "type": "discussion",\n      "title": "Key Questions for Your Team",\n      "prompts": [\n        {\n          "question": "Specific strategic question about THIS scenario",\n          "ideas": [\n            "Idea 1: First concrete approach you could try",\n            "Idea 2: Second concrete approach you could try",\n            "Idea 3: Third concrete approach you could try"\n          ]\n        },\n        {\n          "question": "Change management question specific to THIS transformation",\n          "ideas": [\n            "Idea 1: First stakeholder/adoption strategy",\n            "Idea 2: Second stakeholder/adoption strategy",\n            "Idea 3: Third stakeholder/adoption strategy"\n          ]\n        },\n        {\n          "question": "Risk/guardrail question for THIS specific scenario",\n          "ideas": [\n            "Idea 1: First mitigation approach",\n            "Idea 2: Second mitigation approach",\n            "Idea 3: Third mitigation approach"\n          ]\n        }\n      ]\n    }\n  ]\n}\n\nCRITICAL RULES:\n1. CURRENT STATE: Don\'t just describe it - explain WHY it\'s a problem. What\'s breaking? What\'s the cost?\n2. AI TRANSFORMATION: Reference specific companies/industries solving similar problems. Be concrete, not theoretical.\n3. DISCUSSION PROMPTS: Frame as "ideas to consider" not rigid options. Each question must have 3 distinct, actionable ideas the team can discuss. Use the word "ideas" not "options".\n4. Use THEIR exact words and situation throughout\n5. Be specific to THIS scenario - no generic platitudes or jargon\n6. Return ONLY the JSON object';

      userMessage = scenarioContext?.currentState 
        ? 'Generate a simulation discussion guide for: ' + scenarioContext.currentState + '. Desired outcome: ' + (scenarioContext.desiredOutcome || 'improved efficiency and effectiveness') + '.'
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

      console.log('🎯 Simulation Generation: ' + result.provider + ' (' + result.latencyMs + 'ms)');

      return new Response(JSON.stringify({ content: result.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Iterative mode - streaming (keep OpenAI only for now)
      systemPrompt = WORKSHOP_FOUNDATION_PROMPT + '\n\n## Current Segment: Simulation Lab - Iterative Discussion\n\nYou are facilitating a follow-up discussion about an AI transformation scenario.\nThe executive team is exploring ideas, asking clarifying questions, or refining their approach.\n\nRespond in a conversational, supportive tone. Keep answers concise (2-3 sentences).\nFocus on practical next steps and real-world considerations.';

      userMessage = userPrompt || 'Continue the discussion.';

      console.log('🔍 CP0 Diagnostic - Streaming Mode Request:', {
        promptLength: userMessage.length,
        hasScenarioContext: !!scenarioContext
      });

      // Retry logic with exponential backoff for streaming
      const streamWithRetry = async (maxRetries = 3): Promise<Response> => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + OPENAI_API_KEY,
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

            console.log('🔍 CP0 Diagnostic - OpenAI Response Status:', {
              ok: response.ok,
              status: response.status,
              statusText: response.statusText,
              attempt: i + 1
            });

            if (response.status === 429) {
              throw new Error('RATE_LIMIT_EXCEEDED');
            }
            if (response.status === 402) {
              throw new Error('PAYMENT_REQUIRED');
            }
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('🚨 CP0 Diagnostic - OpenAI API Error:', {
                status: response.status,
                statusText: response.statusText,
                errorBody: errorText,
                attempt: i + 1
              });

              if (response.status === 401) {
                throw new Error('OpenAI API key is invalid or not configured.');
              }

              throw new Error('OpenAI API returned ' + response.status + ': ' + errorText);
            }

            return response;
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = Math.min(1000 * Math.pow(2, i), 10000);
            console.log(`Retry attempt ${i + 1} after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        throw new Error('Max retries exceeded');
      };

      let response: Response;
      try {
        response = await streamWithRetry();
      } catch (error: any) {
        if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
          return new Response(JSON.stringify({
            error: 'AI service temporarily unavailable due to high demand. Please try again in 1 minute.',
            errorCode: 'RATE_LIMIT',
            retryAfter: 60
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (error.message?.includes('PAYMENT_REQUIRED')) {
          return new Response(JSON.stringify({
            error: 'AI service requires payment. Please contact support.',
            errorCode: 'PAYMENT_REQUIRED'
          }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw error;
      }

      // Stream the response
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