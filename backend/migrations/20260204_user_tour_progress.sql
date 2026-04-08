-- Migration: User Tour Progress Tracking
-- Description: Track user progress through product tours and onboarding flows
-- Created: 2026-02-04

-- Create user_tour_progress table
CREATE TABLE IF NOT EXISTS user_tour_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tour_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    current_step INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    skipped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per tour
    UNIQUE(user_id, tour_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_tour_progress_user_id ON user_tour_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tour_progress_tour_id ON user_tour_progress(tour_id);
CREATE INDEX IF NOT EXISTS idx_user_tour_progress_completed ON user_tour_progress(completed);

-- Enable RLS
ALTER TABLE user_tour_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own tour progress" ON user_tour_progress;
CREATE POLICY "Users can view their own tour progress"
    ON user_tour_progress
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tour progress" ON user_tour_progress;
CREATE POLICY "Users can insert their own tour progress"
    ON user_tour_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tour progress" ON user_tour_progress;
CREATE POLICY "Users can update their own tour progress"
    ON user_tour_progress
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_tour_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS user_tour_progress_updated_at ON user_tour_progress;
CREATE TRIGGER user_tour_progress_updated_at
    BEFORE UPDATE ON user_tour_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_tour_progress_updated_at();

-- Comments
COMMENT ON TABLE user_tour_progress IS 'Tracks user progress through product tours and onboarding flows';
COMMENT ON COLUMN user_tour_progress.tour_id IS 'Identifier for the tour (e.g., first-time-user, create-moment, etc.)';
COMMENT ON COLUMN user_tour_progress.current_step IS 'Current step index in the tour';
COMMENT ON COLUMN user_tour_progress.skipped IS 'Whether the user skipped the tour';
