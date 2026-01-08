-- =====================================================
-- RELAY SYSTEM INTEGRATION
-- Adds Relays, Predictions, Seasons and updates core objects
-- =====================================================

-- 1. SEASONS TABLE
-- Operator-managed hubs grouping Drops, Campaigns, Events
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'archived')),
    
    -- Relay Configuration
    relay_enabled BOOLEAN DEFAULT true,
    relay_constraints JSONB DEFAULT '{}', -- e.g., { "min_trust_score": 50 }
    relay_weight DECIMAL(5,2) DEFAULT 1.0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seasons_operator_id ON seasons(operator_id);
CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons(status);

-- 2. PREDICTIONS TABLE
-- Social forecasts about content, campaigns, or drops
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Target of prediction
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('content', 'campaign', 'drop', 'season', 'market')),
    target_id UUID NOT NULL, -- Logical reference to various tables
    
    prediction_type VARCHAR(50) NOT NULL, -- e.g., 'virality_threshold', 'completion_rate', 'roi_multiplier'
    predicted_outcome JSONB NOT NULL, -- e.g., { "views": 100000 } or { "success": true }
    
    stake_amount DECIMAL(15,8) DEFAULT 0, -- Optional staking for confidence
    confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 100),
    
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
    result VARCHAR(20) CHECK (result IN ('correct', 'incorrect', 'partial', 'pending')),
    
    resolve_date TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    
    -- Relay Configuration
    relay_enabled BOOLEAN DEFAULT true,
    relay_constraints JSONB DEFAULT '{}',
    relay_weight DECIMAL(5,2) DEFAULT 1.0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_creator ON predictions(creator_id);
CREATE INDEX IF NOT EXISTS idx_predictions_target ON predictions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);

-- 3. RELAYS TABLE (Lineage Engine)
-- Tracks propagation of objects
CREATE TABLE IF NOT EXISTS relays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- The Object being Relayed
    object_type VARCHAR(20) NOT NULL CHECK (object_type IN ('content', 'prediction', 'drop', 'campaign', 'event', 'coupon', 'season')),
    object_id UUID NOT NULL, -- ID of the content, prediction, etc.
    
    -- Who started this specific chain (might be the content creator, or a previous relayer)
    -- Actually, for lineage: 
    -- 'originator_user_id' is the creator of the OBJECT. 
    -- 'relayer_user_id' is the person performing THIS relay action.
    originator_user_id UUID, -- Denormalized for fast queries
    relayer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Parent Relay (nullable for first-level relays directly from object)
    parent_relay_id UUID REFERENCES relays(id) ON DELETE SET NULL,
    
    -- Depth of this relay in the tree (0 for direct share? Or 1?)
    depth_level INTEGER DEFAULT 1,
    
    -- Metrics for this specific relay node
    downstream_engagement_count INTEGER DEFAULT 0,
    downstream_completion_count INTEGER DEFAULT 0,
    downstream_prediction_accuracy DECIMAL(5,2),
    
    -- Context
    context_data JSONB DEFAULT '{}', -- e.g., { "channel": "pod", "message": "Check this out" }
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relays_object ON relays(object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_relays_relayer_id ON relays(relayer_user_id);
CREATE INDEX IF NOT EXISTS idx_relays_parent_id ON relays(parent_relay_id);

-- 4. UPDATE EXISTING TABLES
-- Add Relay capabilities

-- Content Pieces
ALTER TABLE content_pieces 
ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS relay_weight DECIMAL(5,2) DEFAULT 1.0;

-- Drops
ALTER TABLE drops 
ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS relay_weight DECIMAL(5,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;

-- Advertiser Campaigns (assuming table exists, adding checks just in case)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'advertiser_campaigns') THEN
        ALTER TABLE advertiser_campaigns 
        ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}',
        ADD COLUMN IF NOT EXISTS relay_weight DECIMAL(5,2) DEFAULT 1.0,
        ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS relay_weight DECIMAL(5,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id) ON DELETE SET NULL;

-- Coupons (Marketplace/Unified)
ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS relay_weight DECIMAL(5,2) DEFAULT 1.0;

-- 5. TRIGGER FOR UPDATED_AT
-- Reuse existing function if available, else create
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_seasons_updated_at') THEN
        CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_predictions_updated_at') THEN
        CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
