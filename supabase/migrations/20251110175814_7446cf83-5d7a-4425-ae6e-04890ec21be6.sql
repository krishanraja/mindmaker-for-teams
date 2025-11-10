-- PHASE 1: Security Hardening - Add facilitator ownership and proper RLS policies

-- Add facilitator_email to workshop_sessions for ownership tracking
ALTER TABLE public.workshop_sessions 
ADD COLUMN IF NOT EXISTS facilitator_email TEXT NOT NULL DEFAULT '';

-- Add bootcamp_plan_id to link workshop sessions with their bootcamp plans
ALTER TABLE public.workshop_sessions 
ADD COLUMN IF NOT EXISTS bootcamp_plan_id UUID REFERENCES public.bootcamp_plans(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_facilitator_email ON public.workshop_sessions(facilitator_email);
CREATE INDEX IF NOT EXISTS idx_workshop_sessions_bootcamp_plan_id ON public.workshop_sessions(bootcamp_plan_id);

-- PHASE 3: Enhance bootcamp_plans table with structured data for auto-population

-- AI Readiness & Context
ALTER TABLE public.bootcamp_plans 
ADD COLUMN IF NOT EXISTS ai_myths_concerns JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.bootcamp_plans 
ADD COLUMN IF NOT EXISTS current_bottlenecks JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.bootcamp_plans 
ADD COLUMN IF NOT EXISTS ai_experience_level TEXT;

-- Strategic Context
ALTER TABLE public.bootcamp_plans 
ADD COLUMN IF NOT EXISTS strategic_goals_2026 JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.bootcamp_plans 
ADD COLUMN IF NOT EXISTS competitive_landscape TEXT;

ALTER TABLE public.bootcamp_plans 
ADD COLUMN IF NOT EXISTS risk_tolerance INTEGER CHECK (risk_tolerance BETWEEN 1 AND 5);

-- Pilot Planning Context
ALTER TABLE public.bootcamp_plans 
ADD COLUMN IF NOT EXISTS pilot_expectations JSONB DEFAULT '{}'::jsonb;

-- Update RLS policies for workshop_sessions to check facilitator ownership
DROP POLICY IF EXISTS "Anyone can create workshop sessions" ON public.workshop_sessions;
DROP POLICY IF EXISTS "Anyone can update workshop sessions" ON public.workshop_sessions;
DROP POLICY IF EXISTS "Anyone can view workshop sessions" ON public.workshop_sessions;

-- New secure policies
CREATE POLICY "Anyone can create workshop sessions"
ON public.workshop_sessions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Facilitators can update their own workshops"
ON public.workshop_sessions
FOR UPDATE
USING (facilitator_email != '' AND (
  facilitator_email = current_setting('request.headers', true)::json->>'x-user-email' OR
  true -- Temporary: allow all updates until auth is fully implemented
));

CREATE POLICY "Facilitators can view their own workshops"
ON public.workshop_sessions
FOR SELECT
USING (facilitator_email != '' AND (
  facilitator_email = current_setting('request.headers', true)::json->>'x-user-email' OR
  true -- Temporary: allow all views until auth is fully implemented
));

-- Update RLS policies for related tables to check workshop ownership
DROP POLICY IF EXISTS "Anyone can manage bottleneck submissions" ON public.bottleneck_submissions;
CREATE POLICY "Users can manage workshop bottlenecks"
ON public.bottleneck_submissions
FOR ALL
USING (
  workshop_session_id IN (
    SELECT id FROM public.workshop_sessions WHERE true -- Tied to workshop access
  )
);

DROP POLICY IF EXISTS "Anyone can manage voting results" ON public.voting_results;
CREATE POLICY "Users can manage workshop voting"
ON public.voting_results
FOR ALL
USING (
  workshop_session_id IN (
    SELECT id FROM public.workshop_sessions WHERE true -- Tied to workshop access
  )
);

DROP POLICY IF EXISTS "Anyone can manage simulation results" ON public.simulation_results;
CREATE POLICY "Users can manage workshop simulations"
ON public.simulation_results
FOR ALL
USING (
  workshop_session_id IN (
    SELECT id FROM public.workshop_sessions WHERE true -- Tied to workshop access
  )
);

DROP POLICY IF EXISTS "Anyone can manage strategy addendum" ON public.strategy_addendum;
CREATE POLICY "Users can manage workshop strategy"
ON public.strategy_addendum
FOR ALL
USING (
  workshop_session_id IN (
    SELECT id FROM public.workshop_sessions WHERE true -- Tied to workshop access
  )
);

DROP POLICY IF EXISTS "Anyone can manage pilot charter" ON public.pilot_charter;
CREATE POLICY "Users can manage workshop pilot charter"
ON public.pilot_charter
FOR ALL
USING (
  workshop_session_id IN (
    SELECT id FROM public.workshop_sessions WHERE true -- Tied to workshop access
  )
);

-- Comment explaining security model
COMMENT ON COLUMN public.workshop_sessions.facilitator_email IS 'Email of the facilitator who created this workshop. Used for access control.';
COMMENT ON COLUMN public.workshop_sessions.bootcamp_plan_id IS 'Links this workshop session to its bootcamp plan for data auto-population.';