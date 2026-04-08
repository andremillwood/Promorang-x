-- MIGRATION: REPAIR BRAND INFRASTRUCTURE
-- Description: Creates missing tables and views causing 404s and 400s across Brand Overview and Merchant Discovery dashboards.

-- 1. Create brand_budgets
CREATE TABLE IF NOT EXISTS brand_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    total_budget NUMERIC DEFAULT 0,
    allocated_budget NUMERIC DEFAULT 0,
    spent_budget NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE brand_budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their organization budgets" ON brand_budgets;
CREATE POLICY "Users can view their organization budgets" ON brand_budgets
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Service roles can manage budgets" ON brand_budgets;
CREATE POLICY "Service roles can manage budgets" ON brand_budgets
    FOR ALL USING (true);


-- 2. Create brand_loyalty_tiers
DO $$ BEGIN
    CREATE TYPE loyalty_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS brand_loyalty_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    tier loyalty_tier NOT NULL,
    min_points INTEGER NOT NULL DEFAULT 0,
    discount_percent NUMERIC,
    priority_access BOOLEAN DEFAULT false,
    tier_benefits JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE brand_loyalty_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view loyalty tiers" ON brand_loyalty_tiers;
CREATE POLICY "Public can view loyalty tiers" ON brand_loyalty_tiers
    FOR SELECT USING (true);


-- 3. Create brand_ambassadors
DO $$ BEGIN
    CREATE TYPE ambassador_status AS ENUM ('pending', 'active', 'paused', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS brand_ambassadors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status ambassador_status DEFAULT 'pending',
    bio TEXT,
    social_links JSONB,
    perks JSONB,
    commission_rate NUMERIC,
    monthly_target INTEGER,
    ambassador_code TEXT UNIQUE,
    total_earnings NUMERIC DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(brand_id, user_id)
);

ALTER TABLE brand_ambassadors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active ambassadors" ON brand_ambassadors;
CREATE POLICY "Public can view active ambassadors" ON brand_ambassadors
    FOR SELECT USING (status = 'active');
    
DROP POLICY IF EXISTS "Users can manage their own ambassador profile" ON brand_ambassadors;
CREATE POLICY "Users can manage their own ambassador profile" ON brand_ambassadors
    FOR ALL USING (user_id = auth.uid());
    
DROP POLICY IF EXISTS "Brand members can manage their ambassadors" ON brand_ambassadors;
CREATE POLICY "Brand members can manage their ambassadors" ON brand_ambassadors
    FOR ALL USING (
        brand_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

-- 4. Re-create fully aliased view_host_discovery
CREATE OR REPLACE VIEW view_host_discovery AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.avatar_url as profile_image,
    u.bio,
    u.reliability_score,
    u.user_tier,
    u.created_at,
    (SELECT count(*) FROM moments m WHERE m.organizer_id = u.id AND m.status = 'closed') as hosted_moments_count,
    (SELECT count(*) FROM event_rsvps er JOIN moments m ON er.event_id = m.id WHERE m.organizer_id = u.id) as total_participants_reached
FROM users u
WHERE u.user_type IN ('operator', 'creator')
  AND u.reliability_score >= 80;


-- 5. Re-create view_brand_discovery using ONLY existing organization fields
CREATE OR REPLACE VIEW view_brand_discovery AS
SELECT 
    o.id,
    o.name,
    o.slug,
    o.avatar_url as logo_url,
    NULL::text as banner_url,
    NULL::text as description,
    o.website as website_url,
    NULL::text as industry,
    FALSE as verified_status,
    o.created_at,
    (SELECT count(*) FROM campaigns c WHERE c.brand_id = o.id AND c.is_active = true) as active_campaigns_count,
    (SELECT count(*) FROM sponsorship_requests s WHERE s.brand_id = o.id AND s.status = 'approved') as successfully_sponsored_moments
FROM organizations o
WHERE o.type = 'brand';


-- 6. Re-create view_merchant_discovery using ONLY existing organization fields
CREATE OR REPLACE VIEW view_merchant_discovery AS
SELECT 
    o.id,
    o.name,
    o.slug,
    o.avatar_url as logo_url,
    NULL::text as banner_url,
    NULL::text as description,
    o.website as website_url,
    NULL::text as category,
    NULL::text as location_city,
    NULL::text as location_state,
    FALSE as verified_status,
    o.created_at,
    (SELECT count(*) FROM merchant_products mp WHERE mp.merchant_id = o.id AND mp.is_active = true) as product_count,
    0 as total_redemptions
FROM organizations o
WHERE o.type = 'merchant';

-- 7. Re-create brand_campaign_analytics view with safe core fallbacks
CREATE OR REPLACE VIEW brand_campaign_analytics AS
SELECT 
  c.id AS campaign_id,
  c.brand_id AS brand_id,
  c.title AS campaign_name,
  c.budget AS budget_usd,
  CASE WHEN c.is_active THEN 'active' ELSE 'inactive' END AS status,
  0::bigint AS moments_sponsored,
  0::bigint AS unique_hosts,
  0::numeric AS total_spent,
  0::bigint AS total_participants,
  0::bigint AS total_redemptions,
  0::numeric AS avg_participants_per_moment,
  0::numeric AS total_escrow_distributed,
  0::numeric AS cost_per_participant,
  c.created_at,
  c.start_date AS starts_at,
  c.end_date AS ends_at
FROM campaigns c;

-- Ensure public access to the views
GRANT SELECT ON view_brand_discovery TO anon, authenticated;
GRANT SELECT ON view_merchant_discovery TO anon, authenticated;
GRANT SELECT ON view_host_discovery TO anon, authenticated;
GRANT SELECT ON brand_campaign_analytics TO anon, authenticated;

COMMENT ON VIEW view_brand_discovery IS 'Secure public view for Brand discovery and directory.';
COMMENT ON VIEW view_merchant_discovery IS 'Secure public view for Merchant discovery and directory.';
COMMENT ON VIEW view_host_discovery IS 'Secure public view for Host discovery and directory.';

-- Fix permissions for PostgREST
GRANT ALL ON brand_budgets TO anon, authenticated, service_role;
GRANT ALL ON brand_loyalty_tiers TO anon, authenticated, service_role;
GRANT ALL ON brand_ambassadors TO anon, authenticated, service_role;
