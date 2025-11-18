-- Create provocation_reports table for persisting AI-generated reports
CREATE TABLE IF NOT EXISTS provocation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id uuid REFERENCES workshop_sessions(id),
  report_data jsonb NOT NULL,
  ai_synthesis text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE provocation_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can manage workshop provocation reports
CREATE POLICY "Users can manage workshop provocation reports"
  ON provocation_reports
  FOR ALL
  USING (
    workshop_session_id IN (
      SELECT id FROM workshop_sessions WHERE true
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_provocation_reports_updated_at
  BEFORE UPDATE ON provocation_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();