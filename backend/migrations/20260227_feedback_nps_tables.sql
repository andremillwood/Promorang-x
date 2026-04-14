-- Migration: Add feedback and NPS tables for OpenClaw feedback intelligence
-- Supports post-moment surveys, NPS tracking, and sentiment analysis

-- ============================================
-- Moment Feedback table
-- ============================================
CREATE TABLE IF NOT EXISTS moment_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid REFERENCES moments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(moment_id, user_id)
);

-- ============================================
-- NPS Responses table
-- ============================================
CREATE TABLE IF NOT EXISTS nps_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer CHECK (score >= 0 AND score <= 10) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_moment_feedback_moment ON moment_feedback(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_feedback_user ON moment_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_user ON nps_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_nps_responses_created ON nps_responses(created_at);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE moment_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
DROP POLICY IF EXISTS "Users can submit feedback" ON moment_feedback;
CREATE POLICY "Users can submit feedback"
  ON moment_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON moment_feedback;
CREATE POLICY "Users can view own feedback"
  ON moment_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Hosts can view feedback for their moments
DROP POLICY IF EXISTS "Hosts can view moment feedback" ON moment_feedback;
CREATE POLICY "Hosts can view moment feedback"
  ON moment_feedback FOR SELECT
  USING (
    moment_id IN (
      SELECT id FROM moments WHERE host_id = auth.uid()
    )
  );

-- Users can submit NPS
DROP POLICY IF EXISTS "Users can submit NPS" ON nps_responses;
CREATE POLICY "Users can submit NPS"
  ON nps_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
