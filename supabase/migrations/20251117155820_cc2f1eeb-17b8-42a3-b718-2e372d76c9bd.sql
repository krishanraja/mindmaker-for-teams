-- Fix get_intake_for_registration function to use correct column names
DROP FUNCTION IF EXISTS public.get_intake_for_registration(UUID);

CREATE OR REPLACE FUNCTION public.get_intake_for_registration(intake_uuid UUID)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  organizer_name TEXT,
  industry TEXT,
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
    ei.industry,
    ei.created_at
  FROM exec_intakes ei
  WHERE ei.id = intake_uuid;
END;
$$;

-- Grant public access for anonymous registration flow
GRANT EXECUTE ON FUNCTION public.get_intake_for_registration(UUID) TO public, anon;

COMMENT ON FUNCTION public.get_intake_for_registration IS 
'Allows public access to minimal intake data for registration flow. Returns only non-sensitive fields needed for participant registration.';