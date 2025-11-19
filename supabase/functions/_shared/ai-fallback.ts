// AI Fallback System: OpenAI 4o-mini → Lovable AI (Gemini 2.5 Flash)
// 5-second timeout with automatic provider switching

const WORKSHOP_FOUNDATION_PROMPT = `
You are MindMaker AI, a specialized workshop facilitator for executive AI transformation workshops.

## Core Principles
1. Executive-Appropriate Language: Use business terminology, avoid technical jargon
2. Evidence-Based Only: NEVER fabricate statistics, percentages, or specific examples not present in data
3. Actionable Insights: Every insight must lead to a concrete next step
4. Risk-Aware: Balance optimism with practical guardrail considerations

## Workshop Phases (The Journey)
1. Mythbusting: Address AI misconceptions with practical rebuttals
2. Bottleneck Discovery: Identify friction points in current workflows
3. Effortless Map: Prioritize AI-augmentation opportunities
4. Simulation Lab: Test AI scenarios with guardrails
5. Strategy Addendum: Define pilot scope and success metrics

## Output Guidelines
- Concise: 2-3 sentences maximum for insights
- Specific: Reference actual workshop data points
- Forward-Looking: Always suggest next steps
- Executive-Focused: Speak to business outcomes, not technical implementation

## Terminology
- Use "AI-augmentation" not "AI replacement"
- Use "guardrails" not "constraints"
- Use "pilot" not "POC" or "experiment"
- Use "strategic friction" not "bottlenecks" in executive summaries
`;

const SEGMENT_PROMPTS = {
  bottleneck: WORKSHOP_FOUNDATION_PROMPT + `

## Current Segment: Bottleneck Discovery
Analyze organizational friction points that waste time, create frustration, or block strategic initiatives.
Focus on: repetitive tasks, information delays, approval bottlenecks, manual data entry.
Provide insights that help executives see patterns across their organization.`,

  effortless_map: WORKSHOP_FOUNDATION_PROMPT + `

## Current Segment: Effortless Map
Identify which friction points have the highest AI-augmentation potential.
Focus on: quick wins, measurable impact, low implementation risk, executive sponsor availability.
Prioritize opportunities that demonstrate immediate business value.`,

  simulation: WORKSHOP_FOUNDATION_PROMPT + `

## Current Segment: Simulation Lab
Evaluate AI implementation scenarios with guardrails and risk assessment.
Focus on: realistic use cases, practical constraints, change management, success metrics.
Balance optimism with pragmatic risk mitigation.`,

  mythbusting: WORKSHOP_FOUNDATION_PROMPT + `

## Current Segment: Mythbusting
Address executive concerns about AI adoption with practical, business-focused rebuttals.
Common themes: job displacement, data privacy, implementation complexity, ROI uncertainty.
Format: Myth (executive's actual concern) → Reality (practical, reassuring response).
Limit to 5-7 key myths. Use qualitative language, not fabricated metrics.`,

  synthesis: WORKSHOP_FOUNDATION_PROMPT + `

## Current Segment: Huddle Synthesis
Synthesize clustered bottleneck submissions into executive-ready insights.
Focus on: key themes, priority actions, strategic implications.
Be concise, strategic, and action-oriented. Focus on business impact, not technical details.`,

  strategy: WORKSHOP_FOUNDATION_PROMPT + `

## Current Segment: Strategy Addendum
Synthesize workshop findings into executive-ready strategic recommendations.
Focus on: pilot scope, success metrics, risk mitigation, 90-day milestones.
Tone: Confident but realistic, emphasizing quick wins and measurable outcomes.`
};

interface AICallOptions {
  openAIKey: string;
  lovableKey: string;
  geminiServiceAccount?: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens?: number;
  temperature?: number;
  tools?: any;
  toolChoice?: any;
  stream?: boolean;
}

interface AICallResult {
  content: string;
  provider: 'openai' | 'lovable-gemini' | 'gemini-rag';
  latencyMs: number;
  toolCalls?: any;
}

// Verify both providers on module load
async function verifyBothProviders(openAIKey: string, lovableKey: string) {
  const testPrompt = "Respond with OK";

  // Test OpenAI 4o-mini
  try {
    const openAITest = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${openAIKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: testPrompt }],
        max_tokens: 10
      })
    });
    console.log('✅ OpenAI 4o-mini: HEALTHY', { status: openAITest.status });
  } catch (e) {
    console.error('❌ OpenAI 4o-mini: FAILED', e instanceof Error ? e.message : 'Unknown error');
  }

  // Test Lovable AI (Gemini)
  try {
    const lovableTest = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${lovableKey}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: testPrompt }],
        max_tokens: 10
      })
    });
    console.log('✅ Lovable AI (Gemini 2.5): HEALTHY', { status: lovableTest.status });
  } catch (e) {
    console.error('❌ Lovable AI: FAILED', e instanceof Error ? e.message : 'Unknown error');
  }

  console.log('🔄 Dual-provider fallback: READY (5s timeout)');
}

// Get Google OAuth2 access token from service account
async function getGeminiAccessToken(serviceAccountJson: string): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  // Create JWT for Google OAuth2
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/generative-language.retriever https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };
  
  const jwtHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const jwtClaimSet = btoa(JSON.stringify(claimSet)).replace(/=/g, '');
  
  // Import private key
  const pemKey = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binaryKey = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  // Sign JWT
  const encoder = new TextEncoder();
  const data = encoder.encode(`${jwtHeader}.${jwtClaimSet}`);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, data);
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const jwt = `${jwtHeader}.${jwtClaimSet}.${signatureBase64}`;
  
  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`OAuth2 token error: ${errorText}`);
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function callGeminiRAG(options: AICallOptions): Promise<string> {
  if (!options.geminiServiceAccount) {
    throw new Error("Gemini service account not provided");
  }
  
  console.log("🔮 Calling Gemini RAG (custom trained model)...");
  
  const accessToken = await getGeminiAccessToken(options.geminiServiceAccount);
  const serviceAccount = JSON.parse(options.geminiServiceAccount);
  
  // Convert OpenAI format messages to Gemini format
  const geminiContents = options.messages.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));
  
  // Build request body
  const requestBody: any = {
    contents: geminiContents,
    generationConfig: {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.maxTokens || 8192
    }
  };
  
  // Add tools if provided (convert OpenAI format to Gemini format)
  if (options.tools) {
    requestBody.tools = [{
      functionDeclarations: options.tools.map((tool: any) => ({
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters
      }))
    }];
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-goog-user-project": serviceAccount.project_id
      },
      body: JSON.stringify(requestBody)
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini RAG error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  const candidate = data.candidates?.[0];
  
  if (!candidate) {
    throw new Error("No candidate in Gemini response");
  }
  
  // Extract content and function calls
  const parts = candidate.content?.parts || [];
  const textPart = parts.find((p: any) => p.text);
  const functionCall = parts.find((p: any) => p.functionCall);
  
  if (functionCall && options.tools) {
    // Convert Gemini function call to OpenAI format
    return JSON.stringify({
      content: textPart?.text || "",
      toolCalls: [{
        id: functionCall.functionCall.name,
        type: "function",
        function: {
          name: functionCall.functionCall.name,
          arguments: JSON.stringify(functionCall.functionCall.args)
        }
      }]
    });
  }
  
  return textPart?.text || "";
}

async function callOpenAI(options: AICallOptions): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: options.messages,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      tools: options.tools,
      tool_choice: options.toolChoice,
      stream: options.stream || false
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Handle tool calls
  if (options.tools && data.choices?.[0]?.message?.tool_calls) {
    return JSON.stringify({
      content: data.choices[0].message.content,
      toolCalls: data.choices[0].message.tool_calls
    });
  }
  
  return data.choices[0].message.content;
}

async function callLovableAI(options: AICallOptions): Promise<string> {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${options.lovableKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: options.messages,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      tools: options.tools,
      tool_choice: options.toolChoice,
      stream: options.stream || false
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lovable AI error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // Handle tool calls (Lovable AI uses same format as OpenAI)
  if (options.tools && data.choices?.[0]?.message?.tool_calls) {
    return JSON.stringify({
      content: data.choices[0].message.content,
      toolCalls: data.choices[0].message.tool_calls
    });
  }
  
  return data.choices[0].message.content;
}

// Track if providers have been verified (module-level variable)
let providersVerified = false;

export async function callWithFallback(options: AICallOptions): Promise<AICallResult> {
  // Verify providers once on first call
  if (!providersVerified) {
    await verifyBothProviders(options.openAIKey, options.lovableKey);
    providersVerified = true;
  }

  console.log("🤖 3-tier AI fallback: Gemini RAG → OpenAI → Lovable AI");

  // Try Gemini RAG first (if credentials provided)
  if (options.geminiServiceAccount) {
    const geminiTimeout = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 5000)
    );
    const geminiStart = Date.now();

    try {
      const result = await Promise.race([
        callGeminiRAG(options),
        geminiTimeout
      ]);
      
      const latency = Date.now() - geminiStart;
      console.log(`✅ Gemini RAG response: ${latency}ms`);
      
      if (options.tools && result.includes('toolCalls')) {
        const parsed = JSON.parse(result);
        return {
          content: parsed.content || '',
          provider: 'gemini-rag',
          latencyMs: latency,
          toolCalls: parsed.toolCalls
        };
      }
      
      return {
        content: result,
        provider: 'gemini-rag',
        latencyMs: latency
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log(`⚠️ Gemini RAG failed (${errorMsg}), falling back to OpenAI`);
    }
  }

  // Try OpenAI as second option
  const openAITimeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('OPENAI_TIMEOUT')), 5000)
  );
  const openAIStart = Date.now();

  try {
    const result = await Promise.race([
      callOpenAI(options),
      openAITimeout
    ]);
    
    const latency = Date.now() - openAIStart;
    console.log(`✅ OpenAI response: ${latency}ms`);
    
    if (options.tools && result.includes('toolCalls')) {
      const parsed = JSON.parse(result);
      return {
        content: parsed.content || '',
        provider: 'openai',
        latencyMs: latency,
        toolCalls: parsed.toolCalls
      };
    }
    
    return {
      content: result,
      provider: 'openai',
      latencyMs: latency
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.log(`⚠️ OpenAI failed (${errorMsg}), falling back to Lovable AI`);
  }

  // Last resort: Lovable AI
  const lovableStart = Date.now();
  const lovableResult = await callLovableAI(options);
  const lovableLatency = Date.now() - lovableStart;
  
  console.log(`✅ Lovable AI response: ${lovableLatency}ms`);
  
  if (options.tools && lovableResult.includes('toolCalls')) {
    const parsed = JSON.parse(lovableResult);
    return {
      content: parsed.content || '',
      provider: 'lovable-gemini',
      latencyMs: lovableLatency,
      toolCalls: parsed.toolCalls
    };
  }
  
  return {
    content: lovableResult,
    provider: 'lovable-gemini',
    latencyMs: lovableLatency
  };
}

export function getSegmentPrompt(segment: string): string {
  return SEGMENT_PROMPTS[segment as keyof typeof SEGMENT_PROMPTS] || WORKSHOP_FOUNDATION_PROMPT;
}

export { WORKSHOP_FOUNDATION_PROMPT, SEGMENT_PROMPTS };
