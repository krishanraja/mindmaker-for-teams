-- Create enum for executive roles
CREATE TYPE public.exec_role AS ENUM ('CEO', 'CTO', 'COO', 'CMO', 'CFO', 'VP', 'Director', 'Other');

-- Organizer intake data
CREATE TABLE public.exec_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  industry TEXT,
  strategic_objectives_2026 TEXT,
  anticipated_bottlenecks JSONB DEFAULT '[]'::jsonb,
  participants JSONB DEFAULT '[]'::jsonb,
  preferred_dates JSONB DEFAULT '[]'::jsonb,
  scheduling_notes TEXT,
  organizer_email TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual executive pulse responses
CREATE TABLE public.exec_pulses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES public.exec_intakes(id) ON DELETE CASCADE,
  participant_email TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  participant_role TEXT NOT NULL,
  awareness_score INTEGER,
  application_score INTEGER,
  trust_score INTEGER,
  governance_score INTEGER,
  pulse_responses JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bootcamp plan configuration
CREATE TABLE public.bootcamp_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES public.exec_intakes(id) ON DELETE CASCADE,
  simulation_1_id TEXT NOT NULL,
  simulation_1_snapshot JSONB DEFAULT '{}'::jsonb,
  simulation_2_id TEXT NOT NULL,
  simulation_2_snapshot JSONB DEFAULT '{}'::jsonb,
  agenda_config JSONB DEFAULT '{}'::jsonb,
  required_prework JSONB DEFAULT '[]'::jsonb,
  cognitive_baseline JSONB DEFAULT '{}'::jsonb,
  calendly_booking_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  booked_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.exec_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exec_pulses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exec_intakes
CREATE POLICY "Anyone can create intake"
  ON public.exec_intakes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Organizers can view their own intakes"
  ON public.exec_intakes FOR SELECT
  USING (true);

CREATE POLICY "Organizers can update their own intakes"
  ON public.exec_intakes FOR UPDATE
  USING (true);

-- RLS Policies for exec_pulses
CREATE POLICY "Anyone can create pulses"
  ON public.exec_pulses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view pulses"
  ON public.exec_pulses FOR SELECT
  USING (true);

CREATE POLICY "Participants can update their own pulses"
  ON public.exec_pulses FOR UPDATE
  USING (true);

-- RLS Policies for bootcamp_plans
CREATE POLICY "Anyone can create bootcamp plans"
  ON public.bootcamp_plans FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view bootcamp plans"
  ON public.bootcamp_plans FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update bootcamp plans"
  ON public.bootcamp_plans FOR UPDATE
  USING (true);

-- Create trigger for updating updated_at
CREATE TRIGGER update_exec_intakes_updated_at
  BEFORE UPDATE ON public.exec_intakes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();