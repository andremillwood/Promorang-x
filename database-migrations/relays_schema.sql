-- =============================================
-- RELAYS SCHEMA
-- Lineage tracking for content propagation
-- =============================================

-- Main Relays Table
CREATE TABLE IF NOT EXISTS relays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_type VARCHAR(50) NOT NULL, -- 'content', 'drop', 'event', 'coupon', etc.
    object_id UUID NOT NULL, -- ID of the relayed object
    originator_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Original creator
    relayer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- User who relayed
    parent_relay_id UUID REFERENCES relays(id) ON DELETE SET NULL, -- For chain tracking
    depth_level INTEGER DEFAULT 1, -- How deep in the relay tree
    context_data JSONB DEFAULT '{}', -- Additional context (platform, message, etc.)
    downstream_engagement_count INTEGER DEFAULT 0, -- Track clicks/views from this relay
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_relays_object ON relays(object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_relays_relayer ON relays(relayer_user_id);
CREATE INDEX IF NOT EXISTS idx_relays_originator ON relays(originator_user_id);
CREATE INDEX IF NOT EXISTS idx_relays_parent ON relays(parent_relay_id);

-- =============================================
-- ADD RELAY COLUMNS TO EXISTING TABLES (OPTIONAL)
-- These only run if the tables exist
-- =============================================

-- Content Pieces (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'content_pieces') THEN
        ALTER TABLE content_pieces ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT TRUE;
        ALTER TABLE content_pieces ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}';
    END IF;
END $$;

-- Drops (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'drops') THEN
        ALTER TABLE drops ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT TRUE;
        ALTER TABLE drops ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}';
    END IF;
END $$;

-- Events (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'events') THEN
        ALTER TABLE events ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT TRUE;
        ALTER TABLE events ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}';
    END IF;
END $$;

-- Coupons (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coupons') THEN
        ALTER TABLE coupons ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT TRUE;
        ALTER TABLE coupons ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}';
    END IF;
END $$;

-- Campaigns (if exists)
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'advertiser_campaigns') THEN
        ALTER TABLE advertiser_campaigns ADD COLUMN IF NOT EXISTS relay_enabled BOOLEAN DEFAULT TRUE;
        ALTER TABLE advertiser_campaigns ADD COLUMN IF NOT EXISTS relay_constraints JSONB DEFAULT '{}';
    END IF;
END $$;

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE relays ENABLE ROW LEVEL SECURITY;

-- Anyone can read relays (public lineage)
CREATE POLICY relays_public_read ON relays FOR SELECT USING (true);

-- Users can create their own relays
CREATE POLICY relays_create_own ON relays FOR INSERT WITH CHECK (
    relayer_user_id = auth.uid()
);

-- Users can update their own relays (e.g. engagement count)
CREATE POLICY relays_update_own ON relays FOR UPDATE USING (
    relayer_user_id = auth.uid()
);

-- =============================================
-- TRIGGER
-- =============================================
CREATE TRIGGER update_relays_updated_at 
BEFORE UPDATE ON relays 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
