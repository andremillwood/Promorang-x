-- Migration: Add push notification support
-- This adds the push_token column to the users table for storing Expo push tokens

-- Add push_token column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token_updated_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;

-- Index for querying users with push tokens
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token) WHERE push_token IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN users.push_token IS 'Expo Push Token for mobile notifications';
COMMENT ON COLUMN users.notifications_enabled IS 'Whether user has opted-in for push notifications';
