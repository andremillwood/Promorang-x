-- Migration: Add user preferences for personalization
-- This enables preference-based content, deal, and drop recommendations

-- Add preferences JSONB column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add preferences_completed_at for tracking completion
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferences_completed_at TIMESTAMPTZ;

-- Create index on preferences for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_preferences 
ON users USING GIN (preferences);

-- Create index on interests array within preferences for filtering
CREATE INDEX IF NOT EXISTS idx_users_preferences_interests 
ON users USING GIN ((preferences -> 'interests'));

-- Example preferences structure:
-- {
--   "interests": ["food", "shopping", "beauty", "fitness"],
--   "location": {
--     "city": "Los Angeles",
--     "zip": "90210",
--     "online_only": false
--   },
--   "deal_types": ["samples", "discounts", "events"],
--   "completed_at": "2026-01-15T12:00:00Z"
-- }

-- Add comment for documentation
COMMENT ON COLUMN users.preferences IS 'User preferences for personalized content recommendations (interests, location, deal types)';
COMMENT ON COLUMN users.preferences_completed_at IS 'Timestamp when user completed the onboarding preferences wizard';
