export interface SimulationSection {
  type: 'current_state' | 'ai_transformation' | 'discussion';
  title: string;
  insights?: string[];
  metrics?: {
    time_saved?: string;
    cost_impact?: string;
    quality_improvement?: string;
  };
  prompts?: string[];
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

  return {
    riskIdentified: 'Implementation risks identified in discussion guide',
    humanCheckpoint: discussionSection.prompts.slice(0, 2).join('\n'),
    validationRequired: discussionSection.prompts[2] || 'Quality review process needed',
    redFlags: ['Output quality below threshold', 'Compliance concerns detected', 'Stakeholder feedback negative']
  };
}
