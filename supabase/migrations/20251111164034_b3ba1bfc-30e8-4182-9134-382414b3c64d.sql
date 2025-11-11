-- Make simulation fields nullable to support 0-2 simulations instead of requiring exactly 2
ALTER TABLE bootcamp_plans 
  ALTER COLUMN simulation_1_id DROP NOT NULL,
  ALTER COLUMN simulation_2_id DROP NOT NULL;