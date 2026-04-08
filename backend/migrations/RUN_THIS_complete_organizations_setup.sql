-- =============================================
-- COMPLETE ORGANIZATIONS SETUP (FIXED)
-- Run this entire file in Supabase SQL Editor
-- Handles existing tables gracefully
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PART 1: BASE TABLES (with conditional creation)
-- =============================================

-- 1. VENUES TABLE
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_name TEXT NOT NULL,
    venue_slug TEXT UNIQUE,
    description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    website_url TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    capacity INTEGER,
    venue_type TEXT,
    amenities JSONB DEFAULT '[]',
    operating_hours JSONB,
    is_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_owner ON venues(owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(venue_slug);

-- 2. CAMPAIGNS TABLE - Add missing columns if table exists
DO $$
BEGIN
    -- Create table if it doesn't exist
    CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        advertiser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'slug') THEN
        ALTER TABLE campaigns ADD COLUMN slug TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'description') THEN
        ALTER TABLE campaigns ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'campaign_type') THEN
        ALTER TABLE campaigns ADD COLUMN campaign_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'status') THEN
        ALTER TABLE campaigns ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'budget_total') THEN
        ALTER TABLE campaigns ADD COLUMN budget_total DECIMAL(10, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'budget_spent') THEN
        ALTER TABLE campaigns ADD COLUMN budget_spent DECIMAL(10, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'start_date') THEN
        ALTER TABLE campaigns ADD COLUMN start_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'end_date') THEN
        ALTER TABLE campaigns ADD COLUMN end_date TIMESTAMPTZ;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser ON campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- 3. MERCHANT_PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS merchant_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    category TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sku TEXT,
    inventory_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_products_merchant ON merchant_products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_products_venue ON merchant_products(venue_id);

-- 4. SPONSORSHIP_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS sponsorship_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    requested_amount DECIMAL(10, 2),
    offered_amount DECIMAL(10, 2),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsorship_requests_host ON sponsorship_requests(host_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_requests_moment ON sponsorship_requests(moment_id);

-- =============================================
-- PART 2: ORGANIZATIONS
-- =============================================

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'brand', 'merchant', 'agency'
    billing_email TEXT,
    avatar_url TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Organization Members Table
DO $$ BEGIN
    CREATE TYPE org_member_role AS ENUM ('owner', 'admin', 'manager', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role org_member_role DEFAULT 'staff',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 3. Add organization_id to existing tables
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE merchant_products ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE sponsorship_requests ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_org ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_venues_org ON venues(organization_id);

-- =============================================
-- PART 3: TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PART 4: ROW LEVEL SECURITY
-- =============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Members can view their team" ON organization_members;
DROP POLICY IF EXISTS "Public can view active venues" ON venues;
DROP POLICY IF EXISTS "Owners can manage their venues" ON venues;
DROP POLICY IF EXISTS "Advertisers can manage their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Public can view active products" ON merchant_products;
DROP POLICY IF EXISTS "Merchants can manage their products" ON merchant_products;

-- Organizations: Members can view
CREATE POLICY "Members can view their organizations"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- Organization Members: Members can view team
CREATE POLICY "Members can view their team"
    ON organization_members FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- Venues: Public read active, owner/org write
CREATE POLICY "Public can view active venues"
    ON venues FOR SELECT
    USING (status = 'active');

CREATE POLICY "Owners can manage their venues"
    ON venues FOR ALL
    USING (owner_id = auth.uid());

-- Campaigns: Advertiser/org access
CREATE POLICY "Advertisers can manage their campaigns"
    ON campaigns FOR ALL
    USING (advertiser_id = auth.uid());

-- Products: Public read, merchant write
CREATE POLICY "Public can view active products"
    ON merchant_products FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Merchants can manage their products"
    ON merchant_products FOR ALL
    USING (merchant_id = auth.uid());

-- =============================================
-- SUCCESS!
-- =============================================
-- All tables created/updated. Organizations feature is now ready!
-- =============================================
