export interface DiscussionPrompt {
  question: string;
  options: string[];
}

export interface SimulationSection {
  type: 'current_state' | 'ai_transformation' | 'discussion';
  title: string;
  insights?: string[];
  metrics?: {
    time_saved?: string;
    cost_impact?: string;
    quality_improvement?: string;
  };
  impact_description?: string;
  prompts?: (string | DiscussionPrompt)[];
}

export interface ParsedSimulation {
  sections: SimulationSection[];
}

export function parseSimulationResponse(content: string): ParsedSimulation {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Invalid simulation structure');
    }

    return parsed as ParsedSimulation;
  } catch (error) {
    console.error('Error parsing simulation response:', error);
    
    // Fallback: create a basic structure from the text
    return {
      sections: [
        {
          type: 'current_state',
          title: 'Analysis',
          insights: [content.substring(0, 500) + '...']
        }
      ]
    };
  }
}

export function extractTasksFromSimulation(simulation: ParsedSimulation) {
  // Extract insights from ai_transformation section as pseudo-tasks
  const aiSection = simulation.sections.find(s => s.type === 'ai_transformation');
  if (!aiSection?.insights) return [];

  return aiSection.insights.map((insight, index) => ({
    id: `task-${index}`,
    description: insight,
    category: 'ai-human' as const,
    aiCapability: 60,
    humanOversight: 'Strategic oversight required'
  }));
}

export function extractGuardrailsFromSimulation(simulation: ParsedSimulation) {
  // Extract discussion prompts as guardrail considerations
  const discussionSection = simulation.sections.find(s => s.type === 'discussion');
  if (!discussionSection?.prompts) return null;

  const promptTexts = discussionSection.prompts.map(p => 
    typeof p === 'string' ? p : p.question
  );

  return {
    riskIdentified: 'Implementation risks identified in discussion guide',
    humanCheckpoint: promptTexts.slice(0, 2).join('\n'),
    validationRequired: promptTexts[2] || 'Quality review process needed',
    redFlags: ['Output quality below threshold', 'Compliance concerns detected', 'Stakeholder feedback negative']
  };
}

// Sanitize insights to detect and flag potential fabricated statistics
const sanitizeInsights = (insights: string[]): string[] => {
  const fabricationPatterns = [
    /\d+%\s+(increase|decrease|reduction|improvement|growth|loss|faster|slower|higher|lower)/gi,
    /\$[\d,]+\s*(million|thousand|k|m|annually|per year|savings|revenue|loss|cost)/gi,
    /\d+x\s+(faster|slower|more|less|better|worse)/gi,
    /save\s+\$[\d,]+/gi,
    /reduce.*\d+%/gi,
    /improve.*\d+%/gi,
  ];
  
  return insights.map(insight => {
    // Check for suspicious numeric claims
    const hasFabrication = fabricationPatterns.some(pattern => pattern.test(insight));
    if (hasFabrication) {
      console.warn('⚠️ POTENTIAL FABRICATED STATISTIC DETECTED:', insight);
      // Flag it in development
      if (import.meta.env.DEV) {
        console.error('AI generated fabricated metric - this should not happen!');
      }
    }
    return insight;
  });
};

export const parseAIResponse = (content: string): string[] => {
  try {
    // Try to parse as JSON array first
    const parsed = JSON.parse(content);
    let insights: string[];
    
    if (Array.isArray(parsed)) {
      insights = parsed;
    } else if (parsed.insights && Array.isArray(parsed.insights)) {
      // If it's an object with insights property
      insights = parsed.insights;
    } else {
      // If it's a single insight
      insights = [content];
    }
    
    // Sanitize to detect fabrications
    return sanitizeInsights(insights);
  } catch {
    // If not valid JSON, treat as plain text
    return sanitizeInsights([content]);
  }
};
