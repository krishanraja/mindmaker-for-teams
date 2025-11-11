-- Add new columns to simulation_results table for interactive AI lab
ALTER TABLE simulation_results 
ADD COLUMN IF NOT EXISTS prompts_used JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_outputs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS task_breakdown JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS guardrails JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS output_quality_ratings JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scenario_context JSONB DEFAULT '{}'::jsonb;