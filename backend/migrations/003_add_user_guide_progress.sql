-- Create user_guide_progress table
CREATE TABLE IF NOT EXISTS user_guide_progress (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guide_id TEXT NOT NULL,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, guide_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_guide_progress_user_id ON user_guide_progress(user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_guide_progress_updated_at
BEFORE UPDATE ON user_guide_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add onboarding_completed column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
