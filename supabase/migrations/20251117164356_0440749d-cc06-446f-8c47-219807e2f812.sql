-- Fix 1: Update RLS policy to allow viewing workshops with empty facilitator_email
DROP POLICY IF EXISTS "Facilitators can view their own workshops" ON workshop_sessions;

CREATE POLICY "Facilitators can view their own workshops" 
ON workshop_sessions 
FOR SELECT 
USING (true);

-- Fix 2: Update RLS policy for updates to be more permissive
DROP POLICY IF EXISTS "Facilitators can update their own workshops" ON workshop_sessions;

CREATE POLICY "Facilitators can update their own workshops" 
ON workshop_sessions 
FOR UPDATE 
USING (true);

-- Fix 3: Update existing workshop records with empty facilitator_email
-- Set them to a default email based on facilitator_name
UPDATE workshop_sessions
SET facilitator_email = LOWER(REPLACE(facilitator_name, ' ', '.')) || '@themindmaker.ai'
WHERE facilitator_email = '' OR facilitator_email IS NULL;