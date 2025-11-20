-- Add alignment tracking to workshop_sessions
ALTER TABLE workshop_sessions
ADD COLUMN IF NOT EXISTS alignment_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tension_map jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS decision_framework_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS key_concepts_delivered jsonb DEFAULT '[]';

-- Add strategic context fields to exec_intakes
ALTER TABLE exec_intakes
ADD COLUMN IF NOT EXISTS target_2026 text,
ADD COLUMN IF NOT EXISTS current_ai_initiatives text,
ADD COLUMN IF NOT EXISTS decision_type text CHECK (decision_type IN ('start_pilot', 'pick_vendor', 'kill_or_scale', 'board_prep')),
ADD COLUMN IF NOT EXISTS workflow_bottlenecks text,
ADD COLUMN IF NOT EXISTS board_pack_url text,
ADD COLUMN IF NOT EXISTS strategic_context_complete boolean DEFAULT false;

-- Create decision_frameworks table
CREATE TABLE IF NOT EXISTS decision_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id uuid REFERENCES workshop_sessions(id) ON DELETE CASCADE,
  decision_process text,
  decision_criteria jsonb DEFAULT '{}',
  tension_map jsonb DEFAULT '{}',
  key_concepts jsonb DEFAULT '[]',
  sample_artifacts jsonb DEFAULT '{}',
  next_steps text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on decision_frameworks
ALTER TABLE decision_frameworks ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for decision_frameworks
CREATE POLICY "Anyone can manage decision frameworks"
  ON decision_frameworks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_decision_frameworks_updated_at
  BEFORE UPDATE ON decision_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();