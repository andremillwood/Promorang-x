-- =============================================
-- DAILY LAYER SCHEMA - PART 1: DAILY FEATURED (Headline Abstraction)
-- Created: 2026-01-14
-- Purpose: Flexible headline system for Today Screen
-- =============================================

-- Drop if exists for clean slate (development only)
DROP TABLE IF EXISTS daily_featured CASCADE;

-- Replaces daily_featured_drop with flexible headline system
CREATE TABLE daily_featured (
    id BIGSERIAL PRIMARY KEY,
    feature_date DATE NOT NULL UNIQUE,
    
    -- Headline type determines what "Today's Headline" shows
    -- reward: Today's Drop with gems/rewards
    -- multiplier: 2x Points Day
    -- status: Badge/status unlock day
    -- chance: Extra draw tickets day
    -- access: Feature preview/unlock
    -- sponsored: Advertiser-sponsored headline (Phase 2+)
    headline_type VARCHAR(50) NOT NULL DEFAULT 'reward'
        CHECK (headline_type IN ('reward', 'multiplier', 'status', 'chance', 'access', 'sponsored')),
    
    -- Only populated when headline_type requires a drop (e.g., 'reward')
    headline_drop_id UUID REFERENCES drops(id) ON DELETE SET NULL,
    
    -- Flexible payload for headline copy, config, imagery
    -- Example payloads by type:
    -- reward:     { "title": "Share this look", "subtitle": "Create Instagram Reel", "gems_available": 100 }
    -- multiplier: { "title": "2x Points Day!", "multiplier": 2.0, "reason": "Weekend Surge" }
    -- status:     { "title": "Top Creator Day", "badge": "rising_star" }
    -- chance:     { "title": "Lucky Friday", "extra_tickets": 1 }
    -- access:     { "title": "VIP Preview", "feature_unlock": "new_drops" }
    -- sponsored:  { "title": "Nike x Promorang", "sponsor_id": 123, "brand_image": "..." }
    headline_payload JSONB NOT NULL DEFAULT '{}',
    
    -- How this headline was selected
    selection_method VARCHAR(50) DEFAULT 'rotation'
        CHECK (selection_method IN ('rotation', 'curated', 'health', 'sponsored')),
    
    -- For sponsored headlines (Phase 2+)
    sponsor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast date lookup
CREATE INDEX idx_daily_featured_date ON daily_featured(feature_date);
CREATE INDEX idx_daily_featured_type ON daily_featured(headline_type);

-- Comment for documentation
COMMENT ON TABLE daily_featured IS 'Daily headline abstraction for Today Screen. Not all headlines require a drop.';
COMMENT ON COLUMN daily_featured.headline_type IS 'Type of headline: reward (drop), multiplier (2x day), status (badge), chance (extra tickets), access (feature unlock), sponsored';
COMMENT ON COLUMN daily_featured.headline_payload IS 'JSONB payload with type-specific configuration (title, subtitle, multiplier value, etc.)';
