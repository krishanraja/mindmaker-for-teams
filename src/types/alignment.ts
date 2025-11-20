// Alignment Sprint Data Types

export interface TensionObservation {
  segment: number;
  timestamp: string;
  type: 'disagreement' | 'confusion' | 'avoidance' | 'conflict';
  description: string;
  participants_involved?: string[];
}

export interface AlignmentSignals {
  convergence_time_minutes?: number;
  disagreement_count: number;
  commitment_level: 'low' | 'medium' | 'high';
}

export interface TeamReaction {
  impressed: string[];
  skeptical: string[];
  neutral: string[];
  key_disagreements: string[];
}

export interface CommitmentSignals {
  named_owner: boolean;
  named_sponsor: boolean;
  specific_budget: boolean;
  wrote_kill_criteria: boolean;
}

export interface DecisionFramework {
  id: string;
  workshop_session_id: string;
  decision_process: string;
  decision_criteria: any;
  tension_map: any;
  key_concepts: any;
  next_steps: string[];
  decision_style_observed?: 'consensus' | 'executive_override' | 'delegation' | 'avoidance';
  time_to_alignment_minutes?: number;
  major_tensions?: string[];
  unresolved_disagreements?: string[];
  created_at: string;
}

export interface BattleTest1Data {
  simulation_id: string;
  team_reactions: TeamReaction;
  disagreement_points: string[];
  time_to_review_minutes: number;
}

export interface BattleTest2Data {
  risk_alignment_level: 'low' | 'medium' | 'high';
  governance_disagreements: string[];
  convergence_time_minutes: number;
  sticking_points: string[];
}

export interface BattleTest3Data {
  owner_clarity_level: 'clear' | 'vague' | 'contested';
  budget_agreement_level: 'aligned' | 'debated' | 'unclear';
  kill_criteria_specificity: 'specific' | 'generic' | 'missing';
  commitment_signals: CommitmentSignals;
}
