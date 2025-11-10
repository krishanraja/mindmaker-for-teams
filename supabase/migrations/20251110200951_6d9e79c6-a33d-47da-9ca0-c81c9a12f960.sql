-- Add new fields to simulation_results table for enhanced business metrics

-- Add people involved metrics
ALTER TABLE simulation_results 
ADD COLUMN IF NOT EXISTS people_involved_before integer,
ADD COLUMN IF NOT EXISTS people_involved_after integer;

-- Add error rate metrics
ALTER TABLE simulation_results 
ADD COLUMN IF NOT EXISTS error_rate_before_pct numeric,
ADD COLUMN IF NOT EXISTS error_rate_after_pct numeric;

-- Add satisfaction metrics
ALTER TABLE simulation_results 
ADD COLUMN IF NOT EXISTS satisfaction_before numeric,
ADD COLUMN IF NOT EXISTS satisfaction_after numeric;

-- Add qualitative insights
ALTER TABLE simulation_results 
ADD COLUMN IF NOT EXISTS qualitative_changes text,
ADD COLUMN IF NOT EXISTS risks_introduced text,
ADD COLUMN IF NOT EXISTS org_changes_required jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN simulation_results.people_involved_before IS 'Number of people involved in the process before AI augmentation';
COMMENT ON COLUMN simulation_results.people_involved_after IS 'Number of people involved in the process after AI augmentation';
COMMENT ON COLUMN simulation_results.error_rate_before_pct IS 'Percentage of work requiring revisions/rework before AI';
COMMENT ON COLUMN simulation_results.error_rate_after_pct IS 'Percentage of work requiring revisions/rework after AI';
COMMENT ON COLUMN simulation_results.satisfaction_before IS 'Stakeholder satisfaction score (1-10) before AI';
COMMENT ON COLUMN simulation_results.satisfaction_after IS 'Stakeholder satisfaction score (1-10) after AI';
COMMENT ON COLUMN simulation_results.qualitative_changes IS 'Description of how the workflow transforms with AI';
COMMENT ON COLUMN simulation_results.risks_introduced IS 'Potential risks and safeguards needed when using AI';
COMMENT ON COLUMN simulation_results.org_changes_required IS 'Array of organizational changes needed (training, roles, tools, etc.)';
