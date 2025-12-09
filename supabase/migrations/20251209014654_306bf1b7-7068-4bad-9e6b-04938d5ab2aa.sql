-- Fix 1: Enable RLS on tables that have it disabled
ALTER TABLE backup_workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_dimensions ENABLE ROW LEVEL SECURITY;

-- Create restrictive policies for backup_workshop_sessions (admin/service only)
CREATE POLICY "Service role only for backup sessions"
ON backup_workshop_sessions
FOR ALL
USING (false)
WITH CHECK (false);

-- Create read-only policy for insight_dimensions (public read is OK for config data)
CREATE POLICY "Anyone can view insight dimensions"
ON insight_dimensions
FOR SELECT
USING (true);

-- Fix 2: Remove overly permissive public read policies from leader assessment tables
DROP POLICY IF EXISTS "Allow public read access to assessments" ON leader_assessments;

-- Fix 3: Create has_role function if it doesn't exist for secure role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;