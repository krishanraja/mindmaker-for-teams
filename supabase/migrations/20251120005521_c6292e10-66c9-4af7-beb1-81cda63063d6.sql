-- Fix RLS security issues - Enable RLS on workshop_questions
ALTER TABLE public.workshop_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read workshop_questions"
  ON public.workshop_questions FOR SELECT
  USING (TRUE);