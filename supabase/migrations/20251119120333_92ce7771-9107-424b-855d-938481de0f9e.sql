-- Create segment_summaries table for incremental workshop synthesis
CREATE TABLE IF NOT EXISTS segment_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID NOT NULL REFERENCES workshop_sessions(id) ON DELETE CASCADE,
  segment_key TEXT NOT NULL CHECK (segment_key IN (
    'mirror', 'time_machine', 'crystal_ball', 'rewrite', 'huddle', 'draft', 'provocation'
  )),
  headline TEXT NOT NULL CHECK (char_length(headline) <= 80),
  key_points TEXT[] NOT NULL CHECK (array_length(key_points, 1) <= 5),
  primary_metric NUMERIC,
  primary_metric_label TEXT CHECK (char_length(primary_metric_label) <= 40),
  segment_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workshop_session_id, segment_key)
);

CREATE INDEX idx_segment_summaries_workshop ON segment_summaries(workshop_session_id);

-- Add duration tracking to workshop_sessions for dynamic report scaling
ALTER TABLE workshop_sessions 
ADD COLUMN IF NOT EXISTS planned_duration_hours NUMERIC DEFAULT 4.0 
CHECK (planned_duration_hours IN (1.0, 2.0, 3.0, 4.0));

ALTER TABLE workshop_sessions 
ADD COLUMN IF NOT EXISTS segments_completed TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Enable RLS on segment_summaries
ALTER TABLE segment_summaries ENABLE ROW LEVEL SECURITY;

-- Allow users to manage segment summaries for their workshops
CREATE POLICY "Users can manage workshop segment summaries"
ON segment_summaries
FOR ALL
USING (workshop_session_id IN (
  SELECT id FROM workshop_sessions WHERE true
));