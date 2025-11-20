-- Add tension tracking and alignment observation columns to workshop_sessions
ALTER TABLE workshop_sessions
ADD COLUMN IF NOT EXISTS tension_observations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS alignment_signals jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN workshop_sessions.tension_observations IS 'Array of observed tension moments: {segment, timestamp, type, description, participants_involved}';
COMMENT ON COLUMN workshop_sessions.alignment_signals IS 'Tracked alignment indicators: {convergence_time, disagreement_count, commitment_level}';

-- Add team reaction tracking to simulation_results
ALTER TABLE simulation_results
ADD COLUMN IF NOT EXISTS team_reactions jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS disagreement_points text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN simulation_results.team_reactions IS 'Tracks who was impressed vs skeptical: {impressed: [names], skeptical: [names], neutral: [names], key_disagreements: []}';
COMMENT ON COLUMN simulation_results.disagreement_points IS 'Specific points of disagreement observed during simulation review';

-- Update strategy_addendum to track alignment, not readiness
ALTER TABLE strategy_addendum
ADD COLUMN IF NOT EXISTS risk_alignment_level text,
ADD COLUMN IF NOT EXISTS governance_disagreements text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS convergence_time_minutes integer,
ADD COLUMN IF NOT EXISTS sticking_points text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN strategy_addendum.risk_alignment_level IS 'low, medium, high - how aligned was the team on risk tolerance?';
COMMENT ON COLUMN strategy_addendum.governance_disagreements IS 'Specific disagreements about data governance approach';
COMMENT ON COLUMN strategy_addendum.convergence_time_minutes IS 'How long did it take to reach consensus?';

-- Update pilot_charter to track commitment signals, not deliverables
ALTER TABLE pilot_charter
ADD COLUMN IF NOT EXISTS owner_clarity_level text,
ADD COLUMN IF NOT EXISTS budget_agreement_level text,
ADD COLUMN IF NOT EXISTS kill_criteria_specificity text,
ADD COLUMN IF NOT EXISTS commitment_signals jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN pilot_charter.owner_clarity_level IS 'clear, vague, contested - could they name a clear owner?';
COMMENT ON COLUMN pilot_charter.budget_agreement_level IS 'aligned, debated, unclear - budget discussion quality';
COMMENT ON COLUMN pilot_charter.kill_criteria_specificity IS 'specific, generic, missing - quality of kill criteria';
COMMENT ON COLUMN pilot_charter.commitment_signals IS 'Observable commitment: {named_owner: bool, named_sponsor: bool, specific_budget: bool, wrote_kill_criteria: bool}';

-- Update decision_frameworks to focus on decision process, not pilot plan
ALTER TABLE decision_frameworks
ADD COLUMN IF NOT EXISTS decision_style_observed text,
ADD COLUMN IF NOT EXISTS time_to_alignment_minutes integer,
ADD COLUMN IF NOT EXISTS major_tensions text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS unresolved_disagreements text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN decision_frameworks.decision_style_observed IS 'consensus, executive_override, delegation, avoidance';
COMMENT ON COLUMN decision_frameworks.time_to_alignment_minutes IS 'Total time from first battle test to final framework';
COMMENT ON COLUMN decision_frameworks.major_tensions IS 'Key tensions surfaced across all battle tests';
COMMENT ON COLUMN decision_frameworks.unresolved_disagreements IS 'Disagreements that remained unresolved by end of session';