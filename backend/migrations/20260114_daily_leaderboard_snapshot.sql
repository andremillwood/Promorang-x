-- =============================================
-- DAILY LAYER SCHEMA - PART 4: LEADERBOARD SNAPSHOT
-- Created: 2026-01-14
-- Purpose: Daily snapshot for "yesterday's final rank" display
-- =============================================

-- Drop if exists for clean slate (development only)
DROP TABLE IF EXISTS daily_leaderboard_snapshot CASCADE;

-- Computed once at day close (09:59 UTC, just before 10:00 reset)
-- Shows "yesterday's final rank" on Today Screen
CREATE TABLE daily_leaderboard_snapshot (
    id BIGSERIAL PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    
    -- Segment for future expansion (friends, region, etc.)
    segment VARCHAR(50) DEFAULT 'global',
    
    -- Total users in this segment for this day
    total_users INTEGER NOT NULL,
    
    -- When this snapshot was computed
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Store ranks as JSONB array for efficiency
    -- Format: [{ user_id, rank, dynamic_points, percentile }, ...]
    -- Sorted by rank ascending
    ranks_data JSONB NOT NULL DEFAULT '[]',
    
    -- One snapshot per date per segment
    UNIQUE(snapshot_date, segment)
);

-- Indexes for fast lookup
CREATE INDEX idx_leaderboard_snapshot_date ON daily_leaderboard_snapshot(snapshot_date);
CREATE INDEX idx_leaderboard_snapshot_segment ON daily_leaderboard_snapshot(segment);

-- Comments for documentation
COMMENT ON TABLE daily_leaderboard_snapshot IS 'Daily leaderboard snapshot computed at day close. UI shows "Rank (based on yesterday)".';
COMMENT ON COLUMN daily_leaderboard_snapshot.ranks_data IS 'JSONB array of {user_id, rank, dynamic_points, percentile} sorted by rank.';
