-- Create post_session_reviews table for participant feedback
CREATE TABLE IF NOT EXISTS post_session_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_session_id UUID REFERENCES workshop_sessions(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  ai_leadership_confidence INTEGER NOT NULL CHECK (ai_leadership_confidence BETWEEN 1 AND 10),
  session_enjoyment INTEGER NOT NULL CHECK (session_enjoyment BETWEEN 1 AND 10),
  optional_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE post_session_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert reviews (public access)
CREATE POLICY "Anyone can submit post-session reviews"
  ON post_session_reviews
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view reviews for their workshop
CREATE POLICY "Anyone can view post-session reviews"
  ON post_session_reviews
  FOR SELECT
  USING (true);

-- Create index for faster queries by workshop
CREATE INDEX idx_post_session_reviews_workshop ON post_session_reviews(workshop_session_id);

-- Create storage bucket for post-session QR codes if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-session-qr', 'post-session-qr', true)
ON CONFLICT (id) DO NOTHING;