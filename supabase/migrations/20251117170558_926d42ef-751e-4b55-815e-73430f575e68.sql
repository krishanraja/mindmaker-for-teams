-- CP1: Fix Foreign Key Constraint
-- Drop incorrect foreign key that references exec_intakes
ALTER TABLE workshop_sessions 
DROP CONSTRAINT IF EXISTS workshop_sessions_bootcamp_plan_id_fkey;

-- Add correct foreign key pointing to bootcamp_plans
ALTER TABLE workshop_sessions 
ADD CONSTRAINT workshop_sessions_bootcamp_plan_id_fkey 
FOREIGN KEY (bootcamp_plan_id) 
REFERENCES bootcamp_plans(id) 
ON DELETE SET NULL;

-- CP4: Update existing workshops with NULL intake_id to link to the Meliora intake
-- This ensures at least one workshop has a valid intake for testing
UPDATE workshop_sessions
SET intake_id = '3357b8b3-ce13-431b-92e5-338e5e750b51'
WHERE intake_id IS NULL
AND id = '4bb35435-d23c-4356-b3c6-28868b889dea';