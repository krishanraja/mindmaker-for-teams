-- Phase 1: Unified Profiles Foundation
CREATE TABLE public.unified_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT,
  company TEXT,
  company_identifier_hash TEXT,
  
  source_tool TEXT NOT NULL DEFAULT 'teams',
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  total_interactions INT DEFAULT 0,
  latest_readiness_score INT,
  latest_assessment_tier TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.unified_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read unified_profiles"
  ON public.unified_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Service manage unified_profiles"
  ON public.unified_profiles FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE INDEX idx_unified_profiles_email ON public.unified_profiles(email);
CREATE INDEX idx_unified_profiles_company_hash ON public.unified_profiles(company_identifier_hash);

-- Migrate existing leaders
INSERT INTO public.unified_profiles (id, email, name, role, company, source_tool)
SELECT id, email, name, role, company, 'leaders'
FROM public.leaders
ON CONFLICT (email) DO UPDATE SET
  name = COALESCE(EXCLUDED.name, unified_profiles.name),
  role = COALESCE(EXCLUDED.role, unified_profiles.role),
  company = COALESCE(EXCLUDED.company, unified_profiles.company);

-- Migrate exec_pulses participants
INSERT INTO public.unified_profiles (email, name, role, source_tool)
SELECT DISTINCT participant_email, participant_name, participant_role, 'teams'
FROM public.exec_pulses
WHERE participant_email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- Migrate pre_workshop_inputs participants
INSERT INTO public.unified_profiles (email, name, source_tool)
SELECT DISTINCT participant_email, participant_name, 'teams'
FROM public.pre_workshop_inputs
WHERE participant_email IS NOT NULL
ON CONFLICT (email) DO NOTHING;

-- Add profile_id columns
ALTER TABLE public.exec_pulses 
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.unified_profiles(id);

ALTER TABLE public.pre_workshop_inputs 
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.unified_profiles(id);

ALTER TABLE public.bottleneck_submissions 
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.unified_profiles(id);

ALTER TABLE public.effortless_map_items 
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.unified_profiles(id);

ALTER TABLE public.working_group_inputs 
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.unified_profiles(id);

-- Backfill profile_id
UPDATE public.exec_pulses ep
SET profile_id = (SELECT id FROM public.unified_profiles WHERE email = ep.participant_email LIMIT 1)
WHERE profile_id IS NULL AND participant_email IS NOT NULL;

UPDATE public.pre_workshop_inputs pwi
SET profile_id = (SELECT id FROM public.unified_profiles WHERE email = pwi.participant_email LIMIT 1)
WHERE profile_id IS NULL AND participant_email IS NOT NULL;

-- Get or create profile function
CREATE OR REPLACE FUNCTION public.get_or_create_profile(
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_source_tool TEXT DEFAULT 'teams'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT id INTO v_profile_id
  FROM public.unified_profiles
  WHERE email = p_email;
  
  IF v_profile_id IS NULL THEN
    INSERT INTO public.unified_profiles (email, name, role, company, source_tool)
    VALUES (p_email, p_name, p_role, p_company, p_source_tool)
    RETURNING id INTO v_profile_id;
  ELSE
    UPDATE public.unified_profiles
    SET 
      last_active_at = NOW(),
      total_interactions = total_interactions + 1,
      name = COALESCE(p_name, name),
      role = COALESCE(p_role, role),
      company = COALESCE(p_company, company)
    WHERE id = v_profile_id;
  END IF;
  
  RETURN v_profile_id;
END;
$$;

-- Phase 2: Granular Event Capture
CREATE TABLE public.workshop_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  profile_id UUID REFERENCES public.unified_profiles(id),
  session_id UUID,
  workshop_session_id UUID REFERENCES public.workshop_sessions(id),
  
  tool_name TEXT NOT NULL,
  flow_name TEXT,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  dimension_key TEXT,
  
  raw_input TEXT NOT NULL,
  structured_values JSONB DEFAULT '{}',
  
  event_type TEXT NOT NULL,
  response_duration_seconds INT,
  context_snapshot JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workshop_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read workshop_events"
  ON public.workshop_events FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone insert workshop_events"
  ON public.workshop_events FOR INSERT
  WITH CHECK (TRUE);

CREATE INDEX idx_workshop_events_profile ON public.workshop_events(profile_id);
CREATE INDEX idx_workshop_events_session ON public.workshop_events(session_id);
CREATE INDEX idx_workshop_events_question ON public.workshop_events(question_id);
CREATE INDEX idx_workshop_events_dimension ON public.workshop_events(dimension_key);
CREATE INDEX idx_workshop_events_flow ON public.workshop_events(flow_name);

-- Workshop questions registry
CREATE TABLE public.workshop_questions (
  id TEXT PRIMARY KEY,
  tool_name TEXT NOT NULL,
  flow_name TEXT NOT NULL,
  dimension_key TEXT,
  
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  
  weight NUMERIC DEFAULT 1.0,
  display_order INT,
  active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.workshop_questions (id, tool_name, flow_name, dimension_key, question_text, question_type, display_order) VALUES
('prework_personal_bottleneck', 'teams', 'pre_workshop', 'bottleneck_context', 'What''s your biggest personal bottleneck right now?', 'text', 1),
('prework_strategic_goal', 'teams', 'pre_workshop', 'strategic_alignment', 'Which strategic goal are you most focused on?', 'text', 2),
('prework_ai_concern', 'teams', 'pre_workshop', 'ai_posture', 'What''s your biggest AI concern or myth?', 'text', 3),
('prework_ai_workflow_wish', 'teams', 'pre_workshop', 'ai_application', 'If AI could handle one thing in your workflow, what would it be?', 'text', 4),
('exec_pulse_awareness', 'teams', 'executive_pulse', 'awareness', 'Rate your team''s AI awareness', 'rating', 1),
('exec_pulse_application', 'teams', 'executive_pulse', 'application', 'Rate your team''s AI application capability', 'rating', 2),
('exec_pulse_trust', 'teams', 'executive_pulse', 'trust', 'Rate your team''s trust in AI', 'rating', 3),
('exec_pulse_governance', 'teams', 'executive_pulse', 'governance', 'Rate your team''s AI governance maturity', 'rating', 4);

-- Phase 3: Meaning Extraction Layer
CREATE TABLE public.insight_dimensions (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  scale_type TEXT NOT NULL,
  scale_labels JSONB,
  applicable_tools TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.insight_dimensions (key, name, description, scale_type, scale_labels, applicable_tools) VALUES
('ai_posture', 'AI Posture', 'Current stance toward AI adoption', 'categorical', '["ai-skeptic", "ai-aware", "ai-experimenting", "ai-deploying"]', ARRAY['leaders', 'teams', 'partners']),
('risk_appetite', 'Risk Appetite', 'Willingness to take implementation risks', 'numeric_0_100', NULL, ARRAY['leaders', 'teams', 'partners']),
('learning_style', 'Learning Style', 'Preferred learning modality', 'categorical', '["visual", "hands-on", "conceptual", "peer-learning"]', ARRAY['leaders', 'teams']),
('urgency_level', 'Urgency Level', 'Time pressure for AI transformation', 'categorical', '["exploratory", "moderate", "high", "critical"]', ARRAY['teams', 'partners']),
('delegation_readiness', 'Delegation Readiness', 'Ability to delegate to AI systems', 'numeric_0_100', NULL, ARRAY['leaders']),
('data_posture', 'Data Posture', 'State of data infrastructure readiness', 'categorical', '["siloed", "emerging", "integrated", "mature"]', ARRAY['teams', 'partners']),
('ai_readiness', 'AI Readiness', 'Overall readiness for AI implementation', 'numeric_0_100', NULL, ARRAY['leaders', 'teams', 'partners']),
('readiness_tier', 'Readiness Tier', 'AI maturity tier', 'categorical', '["emerging", "establishing", "advancing", "leading"]', ARRAY['leaders', 'teams']);

CREATE TABLE public.profile_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  profile_id UUID REFERENCES public.unified_profiles(id) NOT NULL,
  source_event_ids UUID[],
  
  dimension_key TEXT NOT NULL REFERENCES public.insight_dimensions(key),
  score INT CHECK (score >= 0 AND score <= 100),
  label TEXT,
  confidence NUMERIC DEFAULT 1.0,
  
  llm_summary TEXT,
  evidence TEXT[],
  contradiction_flag BOOLEAN DEFAULT FALSE,
  surprise_factor TEXT,
  
  context_snapshot JSONB DEFAULT '{}',
  tool_name TEXT NOT NULL,
  flow_name TEXT,
  
  generated_by TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profile_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read profile_insights"
  ON public.profile_insights FOR SELECT
  USING (TRUE);

CREATE POLICY "Service manage profile_insights"
  ON public.profile_insights FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE INDEX idx_profile_insights_profile ON public.profile_insights(profile_id);
CREATE INDEX idx_profile_insights_dimension ON public.profile_insights(dimension_key);
CREATE INDEX idx_profile_insights_source_events ON public.profile_insights USING GIN(source_event_ids);

-- Phase 5: Auto-update profiles from insights
CREATE OR REPLACE FUNCTION update_profile_from_insights()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.unified_profiles
  SET 
    latest_readiness_score = (
      SELECT score FROM public.profile_insights
      WHERE profile_id = NEW.profile_id 
        AND dimension_key = 'ai_readiness'
      ORDER BY created_at DESC
      LIMIT 1
    ),
    latest_assessment_tier = (
      SELECT label FROM public.profile_insights
      WHERE profile_id = NEW.profile_id 
        AND dimension_key = 'readiness_tier'
      ORDER BY created_at DESC
      LIMIT 1
    ),
    updated_at = NOW()
  WHERE id = NEW.profile_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_insight_created
  AFTER INSERT ON public.profile_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_from_insights();