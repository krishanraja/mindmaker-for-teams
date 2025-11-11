export interface SimulationSection {
  type: 'analysis' | 'simulation' | 'tasks' | 'discussion' | 'risks';
  title: string;
  bullets?: string[];
  metrics?: {
    time_saved?: string;
    cost_impact?: string;
    quality_improvement?: string;
  };
  items?: Array<{
    task?: string;
    ai_capability?: number;
    human_oversight?: string;
    risk?: string;
    guardrail?: string;
  }>;
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
          type: 'analysis',
          title: 'Analysis',
          bullets: [content.substring(0, 500) + '...']
        }
      ]
    };
  }
}

export function extractTasksFromSimulation(simulation: ParsedSimulation) {
  const tasksSection = simulation.sections.find(s => s.type === 'tasks');
  if (!tasksSection?.items) return [];

  return tasksSection.items.map((item, index) => ({
    id: `task-${index}`,
    description: item.task || '',
    category: item.ai_capability! >= 70 ? 'ai-capable' as const : 
              item.ai_capability! >= 30 ? 'ai-human' as const : 
              'human-only' as const,
    aiCapability: item.ai_capability || 0,
    humanOversight: item.human_oversight || ''
  }));
}

export function extractGuardrailsFromSimulation(simulation: ParsedSimulation) {
  const risksSection = simulation.sections.find(s => s.type === 'risks');
  if (!risksSection?.items) return null;

  const risks = risksSection.items.map(item => item.risk).filter(Boolean);
  const guardrails = risksSection.items.map(item => item.guardrail).filter(Boolean);

  return {
    riskIdentified: risks.join('\n'),
    humanCheckpoint: guardrails.slice(0, 2).join('\n'),
    validationRequired: guardrails.slice(2).join('\n') || 'Quality review process needed',
    redFlags: ['Output quality below threshold', 'Compliance concerns detected', 'Stakeholder feedback negative']
  };
}
