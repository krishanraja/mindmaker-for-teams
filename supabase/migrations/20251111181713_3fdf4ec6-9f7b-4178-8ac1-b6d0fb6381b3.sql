-- Add DELETE policy for exec_intakes
CREATE POLICY "Anyone can delete intakes"
ON public.exec_intakes
FOR DELETE
USING (true);

-- Add DELETE policy for workshop_sessions  
CREATE POLICY "Anyone can delete workshop sessions"
ON public.workshop_sessions
FOR DELETE
USING (true);