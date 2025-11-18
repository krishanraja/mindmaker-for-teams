-- Add column to store selected discussion options for simulation results
ALTER TABLE simulation_results 
ADD COLUMN IF NOT EXISTS selected_discussion_options JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN simulation_results.selected_discussion_options IS 'Stores user selections for AI-generated discussion prompts to persist across page navigation';