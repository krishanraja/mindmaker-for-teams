// Workshop and Bootcamp Plan Types

export interface Participant {
  name: string;
  email: string;
  role: string;
}

export interface SimulationSnapshot {
  title?: string;
  currentState: string;
  challenge: string;
  constraints?: string[];
  successCriteria?: string[];
}

export interface ExecIntake {
  id: string;
  company_name: string;
  industry?: string;
  organizer_name: string;
  organizer_email: string;
  strategic_objectives_2026?: string;
  anticipated_bottlenecks?: string[];
  participants?: Participant[];
  preferred_dates?: string[];
  scheduling_notes?: string;
  created_at: string;
}

export interface BootcampPlan {
  id: string;
  intake_id: string;
  simulation_1_id: string | null;
  simulation_1_snapshot: SimulationSnapshot | null;
  simulation_2_id: string | null;
  simulation_2_snapshot: SimulationSnapshot | null;
  ai_readiness_scores: {
    awarenessScore: number;
    applicationScore: number;
    trustScore: number;
    governanceScore: number;
  } | null;
  ai_experience_level: string;
  strategic_context: {
    strategic_goals_2026: string[];
    anticipated_bottlenecks: string[];
  } | null;
  strategic_goals_2026: string[];
  anticipated_bottlenecks: string[];
  ai_myths_concerns: string[];
  pilot_expectations: {
    pilot_owner: string;
    executive_sponsor: string;
    pilot_budget: string;
    meeting_cadence: string;
  } | null;
  created_at: string;
}

export interface WorkshopSession {
  id: string;
  intake_id: string;
  facilitator_name: string;
  facilitator_email: string;
  bootcamp_plan_id: string | null;
  workshop_date: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  current_segment: number;
  participant_count: number;
  exec_intakes?: ExecIntake;
  created_at: string;
}

export interface ActivitySession {
  id: string;
  workshop_session_id: string;
  activity_type: 'bottleneck_board' | 'effortless_map' | 'dot_voting' | 'strategy_working_group';
  status: 'setup' | 'active' | 'completed';
  qr_code: string;
  participant_count: number;
  created_at: string;
}

export interface BottleneckSubmission {
  id: string;
  workshop_session_id: string;
  participant_name: string;
  bottleneck_text: string;
  cluster_id: string | null;
  created_at: string;
}

export interface MapItem {
  id: string;
  workshop_session_id: string;
  participant_name: string;
  item_text: string;
  lane: 'customers' | 'content' | 'operations' | 'risk';
  sponsor_name: string | null;
  vote_count: number;
  created_at: string;
}

export interface VoteSubmission {
  itemId: string;
  voteCount: number;
}

export interface PilotCharter {
  id: string;
  workshop_session_id: string;
  pilot_owner: string;
  executive_sponsor: string;
  pilot_budget: string;
  meeting_cadence: string;
  day_10_milestone: string;
  day_30_milestone: string;
  day_60_milestone: string;
  day_90_milestone: string;
  kill_criteria: string;
  extend_criteria: string;
  scale_criteria: string;
  created_at: string;
}

export interface StrategyAddendum {
  id: string;
  workshop_session_id: string;
  targets_at_risk: string;
  data_governance_changes: string;
  pilot_kpis: string;
  risk_alignment_level?: string;
  governance_disagreements?: string[];
  convergence_time_minutes?: number;
  sticking_points?: string[];
  created_at: string;
}
