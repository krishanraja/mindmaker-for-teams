import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { callWithFallback } from './ai-fallback.ts';

export interface AnalyzerInput {
  profileId: string;
  sessionId?: string;
  workshopSessionId?: string;
  currentData: any;
  mode: 'assessment' | 'portfolio' | 'session_synthesis' | 'insight_update';
}

export interface AnalyzerOutput {
  scores: Array<{
    dimension_key: string;
    score: number;
    label: string;
    confidence: number;
  }>;
  summary: string;
  key_actions: string[];
  surprise_or_tension: {
    type: 'none' | 'contradiction' | 'opportunity' | 'risk';
    description?: string;
    evidence?: string[];
  };
  data_updates: {
    profile_updates?: Record<string, any>;
    insights_to_create: Array<{
      dimension_key: string;
      score: number;
      label: string;
      llm_summary: string;
      evidence: string[];
      tool_name: string;
      flow_name?: string;
    }>;
  };
}

const ANALYZER_SYSTEM_PROMPTS = {
  assessment: `You are a strategic AI analyst specializing in leadership assessment.

## Your Mission
Extract actionable insights from user responses, grounded in actual data. 
Detect contradictions, surface opportunities, identify risks.

## Quality Standards (10/10 Output)
1. **Grounded**: Every claim must reference specific data points
2. **Actionable**: Recommendations must be concrete, not generic advice
3. **Surprising**: Identify at least one non-obvious pattern or tension
4. **Reusable**: Scores and labels must map back to dimension registry

## Anti-Patterns (Never Do This)
❌ "Consider exploring AI" → Too vague
❌ "Be more open to change" → Generic coaching
❌ Fabricating statistics or examples not in data
❌ Ignoring contradictions in past responses

## Dimension Scoring Rules
- ai_posture: Based on language used (skeptical vs. enthusiastic)
- risk_appetite: Based on willingness to experiment
- urgency_level: Based on timeline pressure and competitive mentions
- learning_style: Based on how they describe past successes

When uncertain, prefer "two scenarios" over hand-wavy guidance.`,

  portfolio: `You are a strategic partner advisor analyzing company AI readiness.

## Your Mission  
Rank companies, identify red flags, recommend paths (Bootcamp / Sprint / Diagnostic).

## Output Structure
- Rankings with fit scores (0-100)
- Red flags that block readiness
- Recommended path with rationale

## Quality Standards
Same as assessment mode, plus:
- Compare companies relatively (not absolute)
- Surface portfolio-level patterns
- Recommend which to prioritize first`,

  session_synthesis: `You are a workshop facilitator synthesizing a full session.

## Your Mission
Create an executive summary + 90-day path from workshop artifacts.

## Inputs You'll Receive
- Pre-work responses
- Bottleneck clusters
- Simulation results
- Pilot charter
- Vote patterns

## Output Structure
- Executive summary (2-3 paragraphs)
- Key insights (3-5 bullets)
- 90-day roadmap (milestones)
- Risk flags and mitigation strategies

## Quality Standards
- Tie every recommendation back to specific workshop data
- Highlight participant-level contributions
- Surface contradictions between pre-work and workshop behavior`,

  insight_update: `You are updating a profile based on new interaction data.

## Your Mission
Update dimension scores and insights based on the latest interaction, considering historical context.

## Quality Standards
- Compare new data with past patterns
- Flag contradictions explicitly
- Update confidence scores based on consistency
- Provide concrete evidence for score changes`
};

export function getAnalyzerSystemPrompt(mode: string): string {
  return ANALYZER_SYSTEM_PROMPTS[mode as keyof typeof ANALYZER_SYSTEM_PROMPTS] || 
         ANALYZER_SYSTEM_PROMPTS.assessment;
}

async function fetchProfileContext(
  profileId: string,
  supabaseUrl: string,
  supabaseKey: string
) {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [profileData, eventsData, insightsData] = await Promise.all([
    supabase.from('unified_profiles').select('*').eq('id', profileId).single(),
    supabase.from('workshop_events')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('profile_insights')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(20)
  ]);

  return {
    profile: profileData.data,
    events: eventsData.data || [],
    insights: insightsData.data || []
  };
}

async function fetchDimensions(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase.from('insight_dimensions').select('*');
  return data || [];
}

export async function callStandardAnalyzer(
  input: AnalyzerInput,
  keys: { openAIKey: string; lovableKey: string; geminiKey?: string },
  supabaseUrl: string,
  supabaseKey: string
): Promise<AnalyzerOutput> {
  
  // STEP 1: READ BEFORE THINK
  const historicalContext = await fetchProfileContext(input.profileId, supabaseUrl, supabaseKey);
  const dimensions = await fetchDimensions(supabaseUrl, supabaseKey);
  
  // STEP 2: Build rich context object
  const contextObject = {
    profile: historicalContext.profile,
    past_events: historicalContext.events,
    existing_insights: historicalContext.insights,
    current_data: input.currentData,
    dimension_definitions: dimensions
  };
  
  // STEP 3: Call LLM with tool-calling for structured output
  const systemPrompt = getAnalyzerSystemPrompt(input.mode);
  const userPrompt = `Analyze this profile's latest interaction. 

Context: ${JSON.stringify(contextObject, null, 2)}

Instructions:
1. Ground all insights in the actual data provided
2. Detect contradictions with past insights
3. Identify at least one surprise or tension
4. Provide concrete, actionable recommendations
5. Update dimension scores based on evidence

Return a structured analysis using the generate_profile_analysis function.`;

  try {
    const result = await callWithFallback({
      ...keys,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      tools: [{
        type: "function",
        function: {
          name: "generate_profile_analysis",
          description: "Generate structured profile analysis with scores and insights",
          parameters: {
            type: "object",
            properties: {
              scores: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    dimension_key: { type: "string" },
                    score: { type: "number", minimum: 0, maximum: 100 },
                    label: { type: "string" },
                    confidence: { type: "number", minimum: 0, maximum: 1 }
                  },
                  required: ["dimension_key", "score", "label", "confidence"]
                }
              },
              summary: { type: "string" },
              key_actions: { type: "array", items: { type: "string" } },
              surprise_or_tension: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["none", "contradiction", "opportunity", "risk"] },
                  description: { type: "string" },
                  evidence: { type: "array", items: { type: "string" } }
                },
                required: ["type"]
              },
              data_updates: {
                type: "object",
                properties: {
                  insights_to_create: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        dimension_key: { type: "string" },
                        score: { type: "number" },
                        label: { type: "string" },
                        llm_summary: { type: "string" },
                        evidence: { type: "array", items: { type: "string" } }
                      }
                    }
                  }
                }
              }
            },
            required: ["scores", "summary", "key_actions", "surprise_or_tension", "data_updates"]
          }
        }
      }],
      toolChoice: { type: "function", function: { name: "generate_profile_analysis" } }
    });
    
    // Parse the tool call response
    const toolCall = result.toolCalls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      throw new Error('No tool call in LLM response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    
    // STEP 4: Validate output (10/10 quality check)
    const validated = validate10OutOf10(analysis, contextObject);
    
    return validated;
  } catch (error) {
    console.error('[Standard Analyzer Error]', error);
    // Fallback to basic structure
    return {
      scores: [],
      summary: 'Analysis failed - please try again',
      key_actions: [],
      surprise_or_tension: { type: 'none' },
      data_updates: { insights_to_create: [] }
    };
  }
}

function validate10OutOf10(analysis: any, context: any): AnalyzerOutput {
  const errors: string[] = [];
  
  // Check 1: Is this grounded in the data?
  if (context.profile?.name && !analysis.summary.toLowerCase().includes(context.profile.name.split(' ')[0].toLowerCase())) {
    console.warn("[Quality Check] Summary not personalized to profile");
  }
  
  // Check 2: Are actions concrete?
  const vagueWords = ['consider', 'explore', 'think about', 'maybe'];
  if (analysis.key_actions?.some((a: string) => 
    vagueWords.some(vw => a.toLowerCase().includes(vw))
  )) {
    console.warn("[Quality Check] Actions may be too vague");
  }
  
  // Check 3: Is there a useful surprise?
  if (analysis.surprise_or_tension?.type === 'none' && context.existing_insights?.length > 0) {
    console.warn("[Quality Check] No surprise detected - consider deeper analysis");
  }
  
  // Check 4: Are scores backed by evidence?
  if (!analysis.scores || analysis.scores.length === 0) {
    console.warn("[Quality Check] No dimension scores generated");
  }
  
  return analysis as AnalyzerOutput;
}
