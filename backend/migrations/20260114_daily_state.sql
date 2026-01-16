-- =============================================
-- DAILY LAYER SCHEMA - PART 3: DAILY STATE (On-Demand Upsert)
-- Created: 2026-01-14
-- Purpose: Per-user daily state, created ON-DEMAND (not precomputed)
-- =============================================

-- Drop if exists for clean slate (development only)
DROP TABLE IF EXISTS daily_state CASCADE;

-- Per-user state, created ON-DEMAND when user opens Today Screen
-- NOT precomputed for all users at midnight
CREATE TABLE daily_state (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    state_date DATE NOT NULL,
    
    -- Links to global daily artifacts
    featured_id BIGINT REFERENCES daily_featured(id) ON DELETE SET NULL,
    draw_id BIGINT REFERENCES daily_draw(id) ON DELETE SET NULL,
    
    -- Engagement tracking for Today's Headline
    headline_viewed BOOLEAN DEFAULT FALSE,
    headline_engaged BOOLEAN DEFAULT FALSE,
    
    -- Today's Multiplier (computed on upsert based on user's status)
    -- Types: base, streak_bonus, catchup_boost, weekend_wave, welcome_boost, milestone, sponsored
    multiplier_type VARCHAR(50) NOT NULL DEFAULT 'base',
    multiplier_value DECIMAL(4,2) DEFAULT 1.0 CHECK (multiplier_value <= 2.5),
    multiplier_reason TEXT,
    
    -- Today's Progress (NOT rank - rank comes from snapshot)
    tickets_earned INTEGER DEFAULT 0,
    dynamic_points_earned INTEGER DEFAULT 0,
    
    -- Activities completed today (for tracking/debugging)
    activities_completed JSONB DEFAULT '[]',
    
    -- Draw status for this user
    draw_auto_entered BOOLEAN DEFAULT FALSE,
    draw_result JSONB, -- Populated after draw execution if user won
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One state per user per day
    UNIQUE(user_id, state_date)
);

-- Indexes for fast lookup
CREATE INDEX idx_daily_state_user_date ON daily_state(user_id, state_date);
CREATE INDEX idx_daily_state_date ON daily_state(state_date);
CREATE INDEX idx_daily_state_points ON daily_state(state_date, dynamic_points_earned DESC);

-- Comments for documentation
COMMENT ON TABLE daily_state IS 'Per-user daily state. Created ON-DEMAND when user opens Today Screen (not precomputed).';
COMMENT ON COLUMN daily_state.multiplier_value IS 'Capped at 2.5x maximum.';
COMMENT ON COLUMN daily_state.dynamic_points_earned IS 'Only dynamic points (not static IG followers). Used for daily ranking.';
