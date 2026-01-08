-- =====================================================
-- PROMORANG ECONOMY v3.3 - ENGAGEMENT & TRUST SYSTEM
-- Fixes: Follower Abuse, Supply Volatility, UX Complexity
-- =====================================================

-- ===========================================
-- 1. USER ENGAGEMENT METRICS TABLE
-- Tracks engagement rates and effective followers
-- ===========================================
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL DEFAULT 'instagram',
    
    -- Raw follower data
    raw_followers INTEGER DEFAULT 0 CHECK (raw_followers >= 0),
    
    -- Engagement metrics
    engagement_rate DECIMAL(8,6) DEFAULT 0 CHECK (engagement_rate >= 0), -- e.g., 0.035 = 3.5%
    avg_likes_per_post INTEGER DEFAULT 0,
    avg_comments_per_post INTEGER DEFAULT 0,
    total_posts_analyzed INTEGER DEFAULT 0,
    
    -- Calculated effective followers (engagement-weighted)
    effective_followers INTEGER DEFAULT 0 CHECK (effective_followers >= 0),
    
    -- Timestamps
    last_synced_at TIMESTAMPTZ,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_engagement_metrics_platform ON user_engagement_metrics(platform);
CREATE INDEX idx_engagement_metrics_effective ON user_engagement_metrics(effective_followers DESC);

-- Trigger for updated_at
CREATE TRIGGER update_engagement_metrics_updated_at
    BEFORE UPDATE ON user_engagement_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ===========================================
-- 2. USER TRUST TIERS TABLE
-- Gating mechanism for follower point rewards
-- ===========================================
CREATE TYPE trust_level_enum AS ENUM ('low', 'standard', 'high');

CREATE TABLE IF NOT EXISTS user_trust_tiers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Trust classification
    trust_level trust_level_enum DEFAULT 'standard',
    
    -- Quality tracking
    proof_quality_score INTEGER DEFAULT 50 CHECK (proof_quality_score >= 0 AND proof_quality_score <= 100),
    completed_proofs INTEGER DEFAULT 0,
    approved_proofs INTEGER DEFAULT 0,
    rejected_proofs INTEGER DEFAULT 0,
    flagged_count INTEGER DEFAULT 0,
    
    -- Multiplier (can be overridden by admin)
    custom_multiplier DECIMAL(3,2),
    
    -- Evaluation timestamps
    last_evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    next_evaluation_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trust_tiers_level ON user_trust_tiers(trust_level);
CREATE INDEX idx_trust_tiers_flagged ON user_trust_tiers(flagged_count) WHERE flagged_count > 0;

-- Trigger for updated_at
CREATE TRIGGER update_trust_tiers_updated_at
    BEFORE UPDATE ON user_trust_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ===========================================
-- 3. PLATFORM DROPS TABLE
-- Buffer drops and community-funded drops
-- ===========================================
CREATE TYPE drop_source_enum AS ENUM ('advertiser', 'platform', 'community', 'seasonal');

-- Add drop_source to existing drops table
ALTER TABLE drops ADD COLUMN IF NOT EXISTS drop_source drop_source_enum DEFAULT 'advertiser';
ALTER TABLE drops ADD COLUMN IF NOT EXISTS funding_pool_id UUID;
ALTER TABLE drops ADD COLUMN IF NOT EXISTS is_buffer_drop BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_drops_source ON drops(drop_source);
CREATE INDEX idx_drops_buffer ON drops(is_buffer_drop) WHERE is_buffer_drop = TRUE;


-- ===========================================
-- 4. PLATFORM FUNDING POOLS TABLE
-- Manages buffer and seasonal drop funding
-- ===========================================
CREATE TABLE IF NOT EXISTS platform_funding_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    pool_type VARCHAR(50) NOT NULL, -- 'buffer', 'weekly', 'monthly', 'event'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Funding amounts
    total_funded DECIMAL(15,2) DEFAULT 0,
    available_balance DECIMAL(15,2) DEFAULT 0,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Pool configuration
    gem_reward_min DECIMAL(10,2) DEFAULT 0.6,
    gem_reward_max DECIMAL(10,2) DEFAULT 0.8,
    key_cost INTEGER DEFAULT 1,
    daily_drop_limit INTEGER DEFAULT 5,
    
    -- Timing
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_funding_pools_type ON platform_funding_pools(pool_type);
CREATE INDEX idx_funding_pools_active ON platform_funding_pools(is_active) WHERE is_active = TRUE;

-- Trigger for updated_at
CREATE TRIGGER update_funding_pools_updated_at
    BEFORE UPDATE ON platform_funding_pools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ===========================================
-- 5. USER ONBOARDING PROGRESS TABLE
-- Tracks progressive disclosure state
-- ===========================================
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Onboarding stage
    onboarding_week INTEGER DEFAULT 1 CHECK (onboarding_week >= 1),
    
    -- Revealed features (JSONB array of feature keys)
    revealed_features JSONB DEFAULT '["points", "daily_unlock", "gems_earned"]'::jsonb,
    
    -- Tour/Guide status
    has_completed_tour BOOLEAN DEFAULT FALSE,
    tour_step INTEGER DEFAULT 0,
    
    -- Engagement tracking for progressive reveal
    total_actions_completed INTEGER DEFAULT 0,
    drops_completed INTEGER DEFAULT 0,
    points_earned_total INTEGER DEFAULT 0,
    
    -- Manual overrides
    show_all_features BOOLEAN DEFAULT FALSE,
    
    first_login_at TIMESTAMPTZ DEFAULT NOW(),
    last_feature_revealed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_onboarding_progress_updated_at
    BEFORE UPDATE ON user_onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ===========================================
-- 6. FOLLOWER POINTS HISTORY TABLE
-- Tracks monthly follower-based point claims
-- ===========================================
CREATE TABLE IF NOT EXISTS follower_points_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Claim period
    claim_month DATE NOT NULL, -- First day of the month
    
    -- Calculation details
    raw_followers INTEGER NOT NULL,
    engagement_rate DECIMAL(8,6) NOT NULL,
    effective_followers INTEGER NOT NULL,
    trust_level trust_level_enum NOT NULL,
    trust_multiplier DECIMAL(3,2) NOT NULL,
    
    -- Point breakdown
    base_points INTEGER NOT NULL,
    diminished_points INTEGER NOT NULL,
    final_points INTEGER NOT NULL,
    
    -- Status
    claimed_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, claim_month)
);

CREATE INDEX idx_follower_claims_user ON follower_points_claims(user_id);
CREATE INDEX idx_follower_claims_month ON follower_points_claims(claim_month);


-- ===========================================
-- 7. CONFIGURATION TABLE
-- Stores economy configuration values
-- ===========================================
CREATE TABLE IF NOT EXISTS economy_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration values
INSERT INTO economy_config (key, value, description) VALUES
('platform_median_engagement_rate', '0.035', 'Platform median engagement rate for comparison (3.5%)'),
('follower_tiers', '[{"max": 2000, "points_per_follower": 10}, {"max": 10000, "points_per_follower": 4}, {"max": null, "points_per_follower": 1}]', 'Diminishing returns tiers for follower points'),
('trust_multipliers', '{"low": 0.5, "standard": 1.0, "high": 1.2}', 'Point multipliers by trust level'),
('buffer_drop_config', '{"daily_count": 5, "gem_min": 0.6, "gem_max": 0.8, "key_cost": 1}', 'Buffer drop default configuration'),
('progressive_disclosure_weeks', '{"week_1": ["points", "daily_unlock", "gems_earned"], "week_2": ["promokeys", "conversion_rates", "master_key"], "week_3": ["leaderboard_math", "advanced_analytics"]}', 'Features revealed by onboarding week')
ON CONFLICT (key) DO NOTHING;


-- ===========================================
-- 8. HELPER FUNCTIONS
-- ===========================================

-- Function to calculate effective followers
CREATE OR REPLACE FUNCTION calculate_effective_followers(
    p_raw_followers INTEGER,
    p_engagement_rate DECIMAL
) RETURNS INTEGER AS $$
DECLARE
    median_er DECIMAL;
    er_ratio DECIMAL;
BEGIN
    -- Get platform median from config
    SELECT (value::text)::decimal INTO median_er 
    FROM economy_config WHERE key = 'platform_median_engagement_rate';
    
    IF median_er IS NULL OR median_er = 0 THEN
        median_er := 0.035; -- Default 3.5%
    END IF;
    
    -- Calculate ER ratio
    er_ratio := COALESCE(p_engagement_rate, 0) / median_er;
    
    -- Return minimum of raw followers or engagement-weighted followers
    RETURN LEAST(p_raw_followers, FLOOR(p_raw_followers * er_ratio)::INTEGER);
END;
$$ LANGUAGE plpgsql;


-- Function to get trust multiplier
CREATE OR REPLACE FUNCTION get_trust_multiplier(p_user_id UUID) 
RETURNS DECIMAL AS $$
DECLARE
    user_trust trust_level_enum;
    multipliers JSONB;
    result DECIMAL;
BEGIN
    -- Get user's trust level
    SELECT trust_level INTO user_trust 
    FROM user_trust_tiers WHERE user_id = p_user_id;
    
    IF user_trust IS NULL THEN
        user_trust := 'standard';
    END IF;
    
    -- Get multipliers from config
    SELECT value INTO multipliers 
    FROM economy_config WHERE key = 'trust_multipliers';
    
    -- Return appropriate multiplier
    result := COALESCE((multipliers->>user_trust::text)::decimal, 1.0);
    RETURN result;
END;
$$ LANGUAGE plpgsql;


-- ===========================================
-- 9. AUTO-CREATE RECORDS FOR NEW USERS
-- ===========================================

-- Function to initialize all economy tables for new user
CREATE OR REPLACE FUNCTION create_user_economy_records()
RETURNS TRIGGER AS $$
BEGIN
    -- Create engagement metrics record
    INSERT INTO user_engagement_metrics (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create trust tier record
    INSERT INTO user_trust_tiers (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create onboarding progress record
    INSERT INTO user_onboarding_progress (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table
DROP TRIGGER IF EXISTS trigger_create_user_economy_records ON users;
CREATE TRIGGER trigger_create_user_economy_records
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_economy_records();


-- ===========================================
-- 10. BACKFILL EXISTING USERS
-- ===========================================

-- Backfill engagement metrics
INSERT INTO user_engagement_metrics (user_id, raw_followers)
SELECT id, COALESCE(followers_count, 0) FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Backfill trust tiers
INSERT INTO user_trust_tiers (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Backfill onboarding progress
INSERT INTO user_onboarding_progress (user_id, show_all_features, first_login_at)
SELECT id, TRUE, created_at FROM users
ON CONFLICT (user_id) DO NOTHING;


-- ===========================================
-- 11. CREATE INITIAL BUFFER POOL
-- ===========================================

INSERT INTO platform_funding_pools (
    pool_type, 
    name, 
    description, 
    total_funded, 
    available_balance,
    gem_reward_min,
    gem_reward_max,
    key_cost,
    daily_drop_limit
) VALUES (
    'buffer',
    'Platform Buffer Pool',
    'Always-available drops funded by platform to maintain PromoKey floor value',
    10000,
    10000,
    0.6,
    0.8,
    1,
    5
);


-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
-- Economy v3.3 migration complete:
-- - Engagement-weighted follower system
-- - Trust tier gating
-- - Platform buffer drops
-- - Progressive disclosure tracking
-- - Configurable economy parameters
