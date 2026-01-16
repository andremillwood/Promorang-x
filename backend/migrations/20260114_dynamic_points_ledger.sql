-- =============================================
-- DAILY LAYER SCHEMA - PART 5: DYNAMIC POINTS LEDGER
-- Created: 2026-01-14
-- Purpose: Track convertible points (static vs dynamic split)
-- =============================================

-- Drop if exists for clean slate (development only)
DROP TABLE IF EXISTS dynamic_points_ledger CASCADE;

-- Tracks ONLY convertible dynamic points
-- Static points (IG followers, signup bonus) are NOT stored here and NOT convertible
CREATE TABLE dynamic_points_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Point source type (ONLY dynamic sources allowed)
    -- Valid: 'drop_engagement', 'proof_verified', 'streak_bonus', 'quest_complete', 
    --        'social_action', 'daily_visit', 'draw_ticket'
    -- NOT valid (static, non-convertible): 'ig_followers', 'signup_bonus', 'referral_bonus'
    source_type VARCHAR(50) NOT NULL,
    
    -- Points amount (always positive for earnings)
    points_amount INTEGER NOT NULL CHECK (points_amount > 0),
    
    -- Optional reference to source (drop_id, quest_id, etc.)
    -- Changed to UUID to support references to UUID tables (drops, etc.)
    reference_id UUID,
    
    -- Human-readable description
    description TEXT,
    
    -- Conversion tracking (for Points → Keys)
    converted_to_keys BOOLEAN DEFAULT FALSE,
    converted_at TIMESTAMPTZ,
    
    -- Promorang date this was earned (for daily caps)
    earned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX idx_dynamic_points_user ON dynamic_points_ledger(user_id);
CREATE INDEX idx_dynamic_points_date ON dynamic_points_ledger(earned_date);
CREATE INDEX idx_dynamic_points_unconverted ON dynamic_points_ledger(user_id) 
    WHERE converted_to_keys = FALSE;

-- Comments for documentation
COMMENT ON TABLE dynamic_points_ledger IS 'Only dynamic (activity-based) points. Static points (IG followers) NOT stored here, NOT convertible to Keys.';
COMMENT ON COLUMN dynamic_points_ledger.source_type IS 'Must be dynamic source: drop_engagement, proof_verified, streak_bonus, quest_complete, social_action, daily_visit.';
COMMENT ON COLUMN dynamic_points_ledger.converted_to_keys IS 'Tracks whether these points have been converted to Keys (automatic threshold conversion).';
