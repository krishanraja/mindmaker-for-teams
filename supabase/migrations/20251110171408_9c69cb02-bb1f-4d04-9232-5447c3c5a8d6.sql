-- Workshop Sessions Table
CREATE TABLE IF NOT EXISTS public.workshop_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES public.exec_intakes(id),
  facilitator_name TEXT NOT NULL,
  workshop_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  current_segment INTEGER DEFAULT 1 CHECK (current_segment BETWEEN 1 AND 6),
  segment_timers JSONB DEFAULT '[]'::jsonb,
  participant_count INTEGER DEFAULT 0,
  cognitive_baseline_data JSONB DEFAULT '{}'::jsonb,
  workshop_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Activity Sessions Table (for QR code activities)
CREATE TABLE IF NOT EXISTS public.activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES public.workshop_sessions(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('bottleneck', 'effortless_map', 'simulation_vote', 'dot_voting', 'working_group')),
  qr_code_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Bottleneck Submissions Table
CREATE TABLE IF NOT EXISTS public.bottleneck_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES public.workshop_sessions(id) ON DELETE CASCADE,
  activity_session_id UUID REFERENCES public.activity_sessions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  bottleneck_text TEXT NOT NULL,
  cluster_id TEXT,
  cluster_name TEXT,
  position_x NUMERIC,
  position_y NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Effortless Map Items Table
CREATE TABLE IF NOT EXISTS public.effortless_map_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES public.workshop_sessions(id) ON DELETE CASCADE,
  activity_session_id UUID REFERENCES public.activity_sessions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  item_text TEXT NOT NULL,
  lane TEXT NOT NULL CHECK (lane IN ('customers', 'content', 'operations', 'risk')),
  constraint_inverted BOOLEAN DEFAULT false,
  sponsor_name TEXT,
  vote_count INTEGER DEFAULT 0,
  priority_rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Voting Results Table
CREATE TABLE IF NOT EXISTS public.voting_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES public.workshop_sessions(id) ON DELETE CASCADE,
  activity_session_id UUID REFERENCES public.activity_sessions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('effortless_map', 'simulation')),
  dots_allocated INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Simulation Results Table
CREATE TABLE IF NOT EXISTS public.simulation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES public.workshop_sessions(id) ON DELETE CASCADE,
  simulation_id TEXT NOT NULL,
  simulation_name TEXT NOT NULL,
  before_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  after_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  time_savings_pct NUMERIC,
  cost_savings_usd NUMERIC,
  quality_improvement_pct NUMERIC,
  org_changes_checklist JSONB DEFAULT '[]'::jsonb,
  vote_count INTEGER DEFAULT 0,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Strategy Addendum Table
CREATE TABLE IF NOT EXISTS public.strategy_addendum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES public.workshop_sessions(id) ON DELETE CASCADE,
  targets_at_risk TEXT,
  ai_leverage_points JSONB DEFAULT '[]'::jsonb,
  org_process_changes JSONB DEFAULT '[]'::jsonb,
  data_governance_changes TEXT,
  pilot_kpis TEXT,
  working_group_inputs JSONB DEFAULT '{}'::jsonb,
  policy_risk_checklist JSONB DEFAULT '[]'::jsonb,
  ceo_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Working Group Inputs Table
CREATE TABLE IF NOT EXISTS public.working_group_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES public.workshop_sessions(id) ON DELETE CASCADE,
  activity_session_id UUID REFERENCES public.activity_sessions(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL CHECK (table_number IN (1, 2)),
  participant_name TEXT NOT NULL,
  input_text TEXT NOT NULL,
  input_category TEXT NOT NULL CHECK (input_category IN ('targets', 'leverage', 'changes', 'governance', 'pilot')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pilot Charter Table
CREATE TABLE IF NOT EXISTS public.pilot_charter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES public.workshop_sessions(id) ON DELETE CASCADE,
  pilot_owner TEXT NOT NULL,
  pilot_budget NUMERIC,
  executive_sponsor TEXT NOT NULL,
  milestone_d10 TEXT,
  milestone_d30 TEXT,
  milestone_d60 TEXT,
  milestone_d90 TEXT,
  kill_criteria TEXT,
  extend_criteria TEXT,
  scale_criteria TEXT,
  meeting_cadence TEXT NOT NULL,
  calendar_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Pre Workshop Inputs Table
CREATE TABLE IF NOT EXISTS public.pre_workshop_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES public.exec_intakes(id) ON DELETE CASCADE,
  participant_email TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  pre_work_responses JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bottleneck_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.effortless_map_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voting_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_addendum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_group_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_charter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_workshop_inputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view workshop sessions" ON public.workshop_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create workshop sessions" ON public.workshop_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update workshop sessions" ON public.workshop_sessions FOR UPDATE USING (true);

CREATE POLICY "Anyone can view activity sessions" ON public.activity_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create activity sessions" ON public.activity_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update activity sessions" ON public.activity_sessions FOR UPDATE USING (true);

CREATE POLICY "Anyone can manage bottleneck submissions" ON public.bottleneck_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage effortless map items" ON public.effortless_map_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage voting results" ON public.voting_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage simulation results" ON public.simulation_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage strategy addendum" ON public.strategy_addendum FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage working group inputs" ON public.working_group_inputs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage pilot charter" ON public.pilot_charter FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage pre workshop inputs" ON public.pre_workshop_inputs FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_workshop_sessions_intake ON public.workshop_sessions(intake_id);
CREATE INDEX idx_activity_sessions_workshop ON public.activity_sessions(workshop_session_id);
CREATE INDEX idx_bottleneck_submissions_workshop ON public.bottleneck_submissions(workshop_session_id);
CREATE INDEX idx_effortless_map_workshop ON public.effortless_map_items(workshop_session_id);
CREATE INDEX idx_voting_results_workshop ON public.voting_results(workshop_session_id);
CREATE INDEX idx_simulation_results_workshop ON public.simulation_results(workshop_session_id);
CREATE INDEX idx_strategy_addendum_workshop ON public.strategy_addendum(workshop_session_id);
CREATE INDEX idx_working_group_workshop ON public.working_group_inputs(workshop_session_id);
CREATE INDEX idx_pilot_charter_workshop ON public.pilot_charter(workshop_session_id);
CREATE INDEX idx_pre_workshop_intake ON public.pre_workshop_inputs(intake_id);

-- Trigger for updated_at
CREATE TRIGGER update_workshop_sessions_updated_at
  BEFORE UPDATE ON public.workshop_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_addendum_updated_at
  BEFORE UPDATE ON public.strategy_addendum
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pilot_charter_updated_at
  BEFORE UPDATE ON public.pilot_charter
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();