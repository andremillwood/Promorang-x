-- =====================================================
-- RELAY SYSTEM INTEGRATION
-- Adds Relays, Predictions, Seasons and updates core objects
-- =====================================================

-- Ensure core tables exist (handles rename if needed and provides safe stub creations)
DO $$ 
BEGIN
    -- 1. Handle content_items -> content_pieces rename
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_items') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_pieces') THEN
        ALTER TABLE content_items RENAME TO content_pieces;
    END IF;

    -- 2. Fallback content_pieces creation if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'content_pieces') THEN
        CREATE TABLE content_pieces (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
            platform VARCHAR(50) NOT NULL,
            platform_url TEXT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            media_url TEXT,
            total_shares INTEGER DEFAULT 1000,
            available_shares INTEGER DEFAULT 1000,
            engagement_shares_total INTEGER DEFAULT 100,
            engagement_shares_remaining INTEGER DEFAULT 100,
            share_price DECIMAL(10,4) DEFAULT 0.01,
            current_revenue DECIMAL(10,2) DEFAULT 0,
            performance_metrics JSONB,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    END IF;

    -- 3. Fallback drops creation if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'drops') THEN
        CREATE TABLE drops (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            drop_type VARCHAR(50),
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    END IF;

    -- 4. Fallback events creation if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
        CREATE TABLE events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            starts_at TIMESTAMPTZ,
            ends_at TIMESTAMPTZ,
            location TEXT,
            status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    END IF;

    -- 5. Fallback coupons creation if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coupons') THEN
        CREATE TABLE coupons (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            created_by UUID REFERENCES users(id) ON DELETE SET NULL,
            code VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            discount_type VARCHAR(20) NOT NULL,
            discount_value DECIMAL(10, 2) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    END IF;
END $$;

-- 1. SEASONS TABLE
-- Operator-managed hubs grouping Drops, Campaigns, Events
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Logical name (e.g. "Summer Splash 2026")
    title VARCHAR(255), -- Alias for name if needed
    slug VARCHAR(100) UNIQUE, -- URL-friendly identifier
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'archived', 'draft')),
    
    -- UI/UX Config
    theme_config JSONB DEFAULT '{}',
    access_type VARCHAR(20) DEFAULT 'open', -- 'open', 'private', 'invite_only'
    
    -- Relay Configuration
    relay_enabled BOOLEAN DEFAULT true,
    relay_constraints JSONB DEFAULT '{}',
    relay_weight DECIMAL(5,2) DEFAULT 1.0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was created previously
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seasons' AND column_name = 'operator_id') THEN
        ALTER TABLE seasons ADD COLUMN operator_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seasons' AND column_name = 'slug') THEN
        ALTER TABLE seasons ADD COLUMN slug VARCHAR(100) UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seasons' AND column_name = 'status') THEN
        ALTER TABLE seasons ADD COLUMN status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'archived', 'draft'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seasons' AND column_name = 'theme_config') THEN
        ALTER TABLE seasons ADD COLUMN theme_config JSONB DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seasons' AND column_name = 'access_type') THEN
        ALTER TABLE seasons ADD COLUMN access_type VARCHAR(20) DEFAULT 'open';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_seasons_operator_id ON seasons(operator_id);
CREATE INDEX IF NOT EXISTS idx_seasons_slug ON seasons(slug);
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

-- Ensure status exists if table was created previously without it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'predictions' AND column_name = 'status') THEN
        ALTER TABLE predictions ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled'));
    END IF;
END $$;

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
