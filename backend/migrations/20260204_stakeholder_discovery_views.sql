-- MIGRATION: PUBLIC ORGANIZATION DISCOVERY VIEWS
-- Description: Creates secure views for discovering Brands and Merchants without exposing billing or sensitive fields.

-- 1. View for Brand Discovery
CREATE OR REPLACE VIEW view_brand_discovery AS
SELECT 
    id,
    name,
    slug,
    logo_url,
    banner_url,
    description,
    website_url,
    industry,
    verified_status,
    created_at,
    (SELECT count(*) FROM campaigns WHERE advertiser_id = id AND status = 'published') as active_campaigns_count,
    (SELECT count(*) FROM moment_sponsorships ms JOIN moments m ON ms.moment_id = m.id WHERE ms.sponsor_id = id AND m.status = 'closed') as successfully_sponsored_moments
FROM organizations
WHERE type = 'brand' 
  AND status = 'active';

-- 2. View for Merchant Discovery
CREATE OR REPLACE VIEW view_merchant_discovery AS
SELECT 
    id,
    name,
    slug,
    logo_url,
    banner_url,
    description,
    website_url,
    category,
    location_city,
    location_state,
    verified_status,
    created_at,
    (SELECT count(*) FROM merchant_products WHERE organization_id = id AND status = 'active') as product_count,
    (SELECT count(*) FROM redemptions r JOIN merchant_products mp ON r.reference_id = mp.id::text WHERE mp.organization_id = id) as total_redemptions
FROM organizations
WHERE type = 'merchant' 
  AND status = 'active';

-- 3. View for Host/Organizer Discovery (from Users table)
CREATE OR REPLACE VIEW view_host_discovery AS
SELECT 
    id,
    username,
    display_name,
    profile_image,
    bio,
    reliability_score,
    user_tier,
    created_at,
    (SELECT count(*) FROM moments WHERE organizer_id = id AND status = 'closed') as hosted_moments_count,
    (SELECT count(*) FROM event_rsvps er JOIN moments m ON er.moment_id = m.id WHERE m.organizer_id = id) as total_participants_reached
FROM users
WHERE user_type IN ('operator', 'creator') -- Core host roles
  AND reliability_score >= 80; -- Only show reputable hosts by default

-- Permissions
GRANT SELECT ON view_brand_discovery TO anon, authenticated;
GRANT SELECT ON view_merchant_discovery TO anon, authenticated;
GRANT SELECT ON view_host_discovery TO anon, authenticated;

COMMENT ON VIEW view_brand_discovery IS 'Secure public view for Brand discovery and directory.';
COMMENT ON VIEW view_merchant_discovery IS 'Secure public view for Merchant discovery and directory.';
COMMENT ON VIEW view_host_discovery IS 'Secure public view for Host discovery and directory.';
