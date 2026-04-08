-- MIGRATION: UNIFIED GLOBAL SEARCH FUNCTION
-- Description: Creates a standard function for searching across all stakeholder categories.

CREATE OR REPLACE FUNCTION fn_global_search(search_term TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    result_type TEXT,
    image_url TEXT,
    path TEXT,
    relevance_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    -- 1. SEARCH MOMENTS
    SELECT 
        m.id,
        m.title,
        m.category as subtitle,
        m.description,
        'moment'::TEXT as result_type,
        m.cover_image as image_url,
        '/moments/' || m.id as path,
        1.0::FLOAT as relevance_score
    FROM moments m
    WHERE m.status IN ('live', 'scheduled', 'published')
      AND (m.title ILIKE '%' || search_term || '%' OR m.description ILIKE '%' || search_term || '%')

    UNION ALL

    -- 2. SEARCH BRANDS
    SELECT 
        b.id,
        b.name as title,
        b.industry as subtitle,
        b.description,
        'brand'::TEXT as result_type,
        b.logo_url as image_url,
        '/brands/' || b.id as path,
        0.9::FLOAT as relevance_score
    FROM view_brand_discovery b
    WHERE b.name ILIKE '%' || search_term || '%' OR b.description ILIKE '%' || search_term || '%'

    UNION ALL

    -- 3. SEARCH MERCHANTS
    SELECT 
        me.id,
        me.name as title,
        me.category as subtitle,
        me.description,
        'merchant'::TEXT as result_type,
        me.logo_url as image_url,
        '/merchants/' || me.id as path,
        0.8::FLOAT as relevance_score
    FROM view_merchant_discovery me
    WHERE me.name ILIKE '%' || search_term || '%' 
       OR me.description ILIKE '%' || search_term || '%'
       OR me.location_city ILIKE '%' || search_term || '%'

    UNION ALL

    -- 4. SEARCH HOSTS
    SELECT 
        h.id,
        COALESCE(h.display_name, h.username) as title,
        'Host'::TEXT as subtitle,
        h.bio as description,
        'host'::TEXT as result_type,
        h.profile_image as image_url,
        '/hosts/' || h.id as path,
        0.7::FLOAT as relevance_score
    FROM view_host_discovery h
    WHERE h.display_name ILIKE '%' || search_term || '%' 
       OR h.username ILIKE '%' || search_term || '%'
       OR h.bio ILIKE '%' || search_term || '%'

    ORDER BY relevance_score DESC, title ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissions
GRANT EXECUTE ON FUNCTION fn_global_search(TEXT) TO anon, authenticated;

COMMENT ON FUNCTION fn_global_search IS 'Global search across moments, brands, merchants, and hosts.';
