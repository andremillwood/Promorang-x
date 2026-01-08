-- =====================================================
-- SMART FEED & RECOMMENDATION SYSTEM
-- Adds User Preferences and Interaction Tracking
-- =====================================================

-- 1. USER PREFERENCES TABLE
-- Stores explicit user settings and inferred psychographics
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Geographic Data
    location_data JSONB DEFAULT '{}', -- { "lat": 40.7, "long": -74.0, "city": "New York", "country": "USA" }
    
    -- Demographic Data
    demographics JSONB DEFAULT '{}', -- { "age_range": "18-24", "gender": "female" }
    
    -- Explicit Interests
    interests TEXT[] DEFAULT '{}', -- ['fashion', 'tech', 'music']
    
    -- Psychographic / Inferred Data
    psychographics JSONB DEFAULT '{}', -- { "spend_tier": "high", "brand_affinity_score": 85 }
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER INTERACTIONS TABLE
-- Tracks implicit behavioral signals for the algorithm
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- The object being interacted with
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('content', 'drop', 'event', 'product', 'campaign')),
    item_id UUID NOT NULL,
    
    -- The type of interaction
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'click', 'like', 'share', 'rsvp', 'purchase', 'save', 'dismiss')),
    
    -- Weight for scoring (can be adjusted by backend logic, but stored here for analytics)
    weight INTEGER DEFAULT 1,
    
    -- Metadata (e.g., how long they viewed, what referral source)
    meta_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_item ON user_interactions(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created ON user_interactions(created_at);

-- 3. TRIGGER FOR UPDATED_AT
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at') THEN
        CREATE TRIGGER update_user_preferences_updated_at 
        BEFORE UPDATE ON user_preferences 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
