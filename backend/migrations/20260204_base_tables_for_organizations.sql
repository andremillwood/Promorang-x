-- =============================================
-- MIGRATION: BASE TABLES FOR ORGANIZATIONS
-- DATE: 2026-02-04
-- DESCRIPTION: Creates base tables (venues, campaigns, merchant_products) 
--              required for organizations migration
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. VENUES TABLE
-- =============================================
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
    venue_type TEXT, -- 'restaurant', 'bar', 'cafe', 'retail', 'venue', etc.
    amenities JSONB DEFAULT '[]',
    operating_hours JSONB, -- { "monday": { "open": "09:00", "close": "17:00" }, ... }
    is_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_owner ON venues(owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(venue_slug);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(venue_type);

-- =============================================
-- 2. CAMPAIGNS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    campaign_type TEXT, -- 'brand_awareness', 'activation', 'bounty', etc.
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    budget_total DECIMAL(10, 2),
    budget_spent DECIMAL(10, 2) DEFAULT 0,
    budget_remaining DECIMAL(10, 2),
    target_audience JSONB, -- Demographics, interests, etc.
    geo_targeting JSONB, -- Cities, regions, coordinates
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    objectives JSONB, -- Goals, KPIs, etc.
    creative_assets JSONB, -- Images, videos, copy
    performance_metrics JSONB, -- Impressions, clicks, conversions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser ON campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON campaigns(start_date, end_date);

-- =============================================
-- 3. MERCHANT_PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS merchant_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    category TEXT,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2), -- Original price for discounts
    cost DECIMAL(10, 2), -- Cost to merchant
    sku TEXT,
    barcode TEXT,
    inventory_quantity INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT TRUE,
    images JSONB DEFAULT '[]', -- Array of image URLs
    variants JSONB DEFAULT '[]', -- Size, color, etc.
    tags TEXT[], -- For categorization and search
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    weight DECIMAL(10, 2), -- For shipping
    dimensions JSONB, -- { "length": 10, "width": 5, "height": 3, "unit": "in" }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_products_merchant ON merchant_products(merchant_id);
CREATE INDEX IF NOT EXISTS idx_merchant_products_venue ON merchant_products(venue_id);
CREATE INDEX IF NOT EXISTS idx_merchant_products_category ON merchant_products(category);
CREATE INDEX IF NOT EXISTS idx_merchant_products_active ON merchant_products(is_active);
CREATE INDEX IF NOT EXISTS idx_merchant_products_sku ON merchant_products(sku);

-- =============================================
-- 4. SPONSORSHIP_REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS sponsorship_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    requested_amount DECIMAL(10, 2),
    offered_amount DECIMAL(10, 2),
    message TEXT,
    brand_response TEXT,
    expires_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsorship_requests_host ON sponsorship_requests(host_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_requests_moment ON sponsorship_requests(moment_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_requests_brand ON sponsorship_requests(brand_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_requests_status ON sponsorship_requests(status);

-- =============================================
-- 5. TRIGGERS FOR UPDATED_AT
-- =============================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
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

DROP TRIGGER IF EXISTS update_merchant_products_updated_at ON merchant_products;
CREATE TRIGGER update_merchant_products_updated_at
    BEFORE UPDATE ON merchant_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sponsorship_requests_updated_at ON sponsorship_requests;
CREATE TRIGGER update_sponsorship_requests_updated_at
    BEFORE UPDATE ON sponsorship_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. ROW LEVEL SECURITY
-- =============================================

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_requests ENABLE ROW LEVEL SECURITY;

-- Venues: Public read, owner write
CREATE POLICY "Public can view active venues"
    ON venues FOR SELECT
    USING (status = 'active');

CREATE POLICY "Owners can manage their venues"
    ON venues FOR ALL
    USING (owner_id = auth.uid());

-- Campaigns: Advertiser only
CREATE POLICY "Advertisers can view their campaigns"
    ON campaigns FOR SELECT
    USING (advertiser_id = auth.uid());

CREATE POLICY "Advertisers can manage their campaigns"
    ON campaigns FOR ALL
    USING (advertiser_id = auth.uid());

-- Merchant Products: Public read active, merchant write
CREATE POLICY "Public can view active products"
    ON merchant_products FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Merchants can manage their products"
    ON merchant_products FOR ALL
    USING (merchant_id = auth.uid());

-- Sponsorship Requests: Host and Brand access
CREATE POLICY "Hosts can view their sponsorship requests"
    ON sponsorship_requests FOR SELECT
    USING (host_id = auth.uid() OR brand_id = auth.uid());

CREATE POLICY "Hosts can create sponsorship requests"
    ON sponsorship_requests FOR INSERT
    WITH CHECK (host_id = auth.uid());

CREATE POLICY "Brands can respond to sponsorship requests"
    ON sponsorship_requests FOR UPDATE
    USING (brand_id = auth.uid());

-- =============================================
-- END MIGRATION
-- =============================================
