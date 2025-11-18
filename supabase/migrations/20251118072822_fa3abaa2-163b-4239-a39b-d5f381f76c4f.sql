-- Add autosave columns for strategic planning fields
ALTER TABLE bootcamp_plans
ADD COLUMN IF NOT EXISTS data_governance_notes TEXT,
ADD COLUMN IF NOT EXISTS pilot_metrics_notes TEXT;