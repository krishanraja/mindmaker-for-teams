-- Create security definer function for safe public access to intake data
CREATE OR REPLACE FUNCTION public.get_intake_for_registration(intake_uuid UUID)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  organizer_name TEXT,
  workshop_date TIMESTAMPTZ,
  session_name TEXT,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ei.id,
    ei.company_name,
    ei.organizer_name,
    ei.workshop_date,
    ei.session_name,
    ei.created_at
  FROM exec_intakes ei
  WHERE ei.id = intake_uuid;
END;
$$;

-- Grant execute to public (anonymous users)
GRANT EXECUTE ON FUNCTION public.get_intake_for_registration(UUID) TO public, anon;

-- Add helpful comment
COMMENT ON FUNCTION public.get_intake_for_registration IS 
'Allows public access to minimal intake data for registration flow. Returns only non-sensitive fields needed for participant registration.';
