-- Add huddle synthesis table for AI-generated bottleneck insights
CREATE TABLE IF NOT EXISTS public.huddle_synthesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES public.workshop_sessions(id),
  synthesis_text TEXT NOT NULL,
  key_themes JSONB DEFAULT '[]'::jsonb,
  priority_actions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.huddle_synthesis ENABLE ROW LEVEL SECURITY;

-- Allow facilitators to manage huddle synthesis
CREATE POLICY "Users can manage workshop huddle synthesis"
  ON public.huddle_synthesis
  FOR ALL
  USING (workshop_session_id IN (
    SELECT id FROM public.workshop_sessions WHERE true
  ));

-- Add trigger for updated_at
CREATE TRIGGER update_huddle_synthesis_updated_at
  BEFORE UPDATE ON public.huddle_synthesis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();