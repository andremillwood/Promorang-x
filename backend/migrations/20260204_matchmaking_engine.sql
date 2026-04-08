-- MIGRATION: MATCHMAKING ENGINE
-- Description: Creates a function to find compatible partners for a given stakeholder or context.

CREATE OR REPLACE FUNCTION fn_get_matchmaking_suggestions(
    target_role TEXT,
    target_category TEXT DEFAULT NULL,
    target_location TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    subtitle TEXT,
    description TEXT,
    logo_url TEXT,
    match_reason TEXT,
    compatibility_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH potential_matches AS (
        -- 1. BRANDS
        SELECT 
            b.id,
            b.name,
            b.industry as subtitle,
            b.description,
            b.logo_url,
            'brand' as source_role,
            CASE 
                WHEN b.industry ILIKE '%' || target_category || '%' THEN 1.0
                ELSE 0.3
            END as cat_score,
            1.0 as loc_score
        FROM view_brand_discovery b
        WHERE target_role = 'brand'

        UNION ALL

        -- 2. MERCHANTS
        SELECT 
            m.id,
            m.name,
            m.category as subtitle,
            m.description,
            m.logo_url,
            'merchant' as source_role,
            CASE 
                WHEN m.category ILIKE '%' || target_category || '%' THEN 1.0
                WHEN target_category = 'social' THEN 0.8
                ELSE 0.2
            END as cat_score,
            CASE 
                WHEN target_location IS NOT NULL AND m.location_city ILIKE '%' || target_location || '%' THEN 1.0
                ELSE 0.5
            END as loc_score
        FROM view_merchant_discovery m
        WHERE target_role = 'merchant'

        UNION ALL

        -- 3. HOSTS
        SELECT 
            h.id,
            COALESCE(h.display_name, h.username) as name,
            'Host' as subtitle,
            h.bio as description,
            h.profile_image as logo_url,
            'host' as source_role,
            (h.reliability_score / 100.0) as cat_score, -- Hosts are matched on reliability
            1.0 as loc_score
        FROM view_host_discovery h
        WHERE target_role = 'host'
    )
    SELECT 
        pm.id,
        pm.name,
        pm.subtitle,
        pm.description,
        pm.logo_url,
        CASE 
            WHEN pm.cat_score >= 0.8 AND pm.loc_score >= 0.8 THEN 'Perfect category & location match!'
            WHEN pm.cat_score >= 0.8 THEN 'Strong category alignment'
            WHEN pm.loc_score >= 0.8 THEN 'Nearby in ' || target_location
            ELSE 'Recommended ecosystem partner'
        END as match_reason,
        (pm.cat_score * 0.7 + pm.loc_score * 0.3) as compatibility_score
    FROM potential_matches pm
    ORDER BY compatibility_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions
GRANT EXECUTE ON FUNCTION fn_get_matchmaking_suggestions(TEXT, TEXT, TEXT, INTEGER) TO anon, authenticated;
