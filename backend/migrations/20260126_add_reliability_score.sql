-- =============================================
-- MIGRATION: ADD RELIABILITY SCORE
-- DESCRIPTION: Adds PRI columns to users table.
-- =============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS reliability_decay_rate INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_reliability_update TIMESTAMPTZ DEFAULT NOW();

-- Add index for querying high-reliability users
CREATE INDEX IF NOT EXISTS idx_users_reliability ON users(reliability_score);

-- Comment
COMMENT ON COLUMN users.reliability_score IS 'Promorang Reliability Index (0-100)';
