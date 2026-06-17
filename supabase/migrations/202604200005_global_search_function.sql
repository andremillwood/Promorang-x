-- =====================================================
-- GLOBAL SEARCH FUNCTION
-- Unified search across moments, brands, merchants, hosts, and users
-- =====================================================

-- Create the global search function
CREATE OR REPLACE FUNCTION public.fn_global_search(search_term TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    result_type TEXT,
    image_url TEXT,
    path TEXT,
    relevance_score NUMERIC
) AS $$
DECLARE
    normalized_term TEXT;
BEGIN
    normalized_term := lower(trim(search_term));
    
    RETURN QUERY
    -- Search Moments
    SELECT 
        m.id,
        m.title,
        COALESCE(m.location, 'Unknown location')::TEXT as subtitle,
        COALESCE(m.description, '')::TEXT as description,
        'moment'::TEXT as result_type,
        m.image_url,
        ('/moments/' || m.id)::TEXT as path,
        CASE 
            WHEN lower(m.title) LIKE '%' || normalized_term || '%' THEN 100
            WHEN lower(m.description) LIKE '%' || normalized_term || '%' THEN 80
            WHEN lower(m.location) LIKE '%' || normalized_term || '%' THEN 60
            ELSE 40
        END::NUMERIC as relevance_score
    FROM public.moments m
    WHERE m.is_active = true
        AND (
            lower(m.title) LIKE '%' || normalized_term || '%'
            OR lower(COALESCE(m.description, '')) LIKE '%' || normalized_term || '%'
            OR lower(COALESCE(m.location, '')) LIKE '%' || normalized_term || '%'
        )
    
    UNION ALL
    
    -- Search Users (creators, hosts, regular users)
    SELECT 
        u.id,
        COALESCE(u.display_name, u.username, 'Unknown')::TEXT as title,
        COALESCE(u.user_type, 'User')::TEXT as subtitle,
        COALESCE(u.username, '')::TEXT as description,
        'user'::TEXT as result_type,
        u.avatar_url,
        ('/profile/' || u.id)::TEXT as path,
        CASE 
            WHEN lower(COALESCE(u.username, '')) = normalized_term THEN 100
            WHEN lower(COALESCE(u.display_name, '')) LIKE '%' || normalized_term || '%' THEN 90
            WHEN lower(COALESCE(u.username, '')) LIKE '%' || normalized_term || '%' THEN 80
            ELSE 50
        END::NUMERIC as relevance_score
    FROM public.users u
    WHERE u.email IS NOT NULL  -- Active users have email
        AND (
            lower(COALESCE(u.display_name, '')) LIKE '%' || normalized_term || '%'
            OR lower(COALESCE(u.username, '')) LIKE '%' || normalized_term || '%'
        )
    
    UNION ALL
    
    -- Search Advertisers (as Brands)
    SELECT 
        a.id,
        COALESCE(a.business_name, a.company_name, 'Unknown Brand')::TEXT as title,
        COALESCE(a.industry, 'Brand')::TEXT as subtitle,
        COALESCE(a.description, '')::TEXT as description,
        'brand'::TEXT as result_type,
        a.logo_url as image_url,
        ('/brands/' || a.id)::TEXT as path,
        CASE 
            WHEN lower(COALESCE(a.business_name, '')) LIKE '%' || normalized_term || '%' THEN 100
            WHEN lower(COALESCE(a.company_name, '')) LIKE '%' || normalized_term || '%' THEN 90
            WHEN lower(COALESCE(a.description, '')) LIKE '%' || normalized_term || '%' THEN 70
            ELSE 50
        END::NUMERIC as relevance_score
    FROM public.advertiser_profiles a
    WHERE a.is_active = true OR a.is_active IS NULL
        AND (
            lower(COALESCE(a.business_name, '')) LIKE '%' || normalized_term || '%'
            OR lower(COALESCE(a.company_name, '')) LIKE '%' || normalized_term || '%'
            OR lower(COALESCE(a.description, '')) LIKE '%' || normalized_term || '%'
        )
    
    UNION ALL
    
    -- Search Merchants (as Merchants/Venues)
    SELECT 
        m.id,
        COALESCE(m.business_name, 'Unknown Venue')::TEXT as title,
        COALESCE(m.category, 'Venue')::TEXT as subtitle,
        COALESCE(m.description, '')::TEXT as description,
        'merchant'::TEXT as result_type,
        m.logo_url as image_url,
        ('/merchants/' || m.id)::TEXT as path,
        CASE 
            WHEN lower(COALESCE(m.business_name, '')) LIKE '%' || normalized_term || '%' THEN 100
            WHEN lower(COALESCE(m.description, '')) LIKE '%' || normalized_term || '%' THEN 70
            ELSE 50
        END::NUMERIC as relevance_score
    FROM public.merchant_profiles m
    WHERE m.is_active = true OR m.is_active IS NULL
        AND (
            lower(COALESCE(m.business_name, '')) LIKE '%' || normalized_term || '%'
            OR lower(COALESCE(m.description, '')) LIKE '%' || normalized_term || '%'
        )
    
    UNION ALL
    
    -- Search Hosts (users with host role/moments)
    SELECT 
        u.id,
        COALESCE(u.display_name, u.username, 'Unknown Host')::TEXT as title,
        ('Host · ' || COALESCE((SELECT count(*)::TEXT FROM public.moments m WHERE m.host_id = u.id), '0') || ' moments')::TEXT as subtitle,
        COALESCE(u.username, '')::TEXT as description,
        'host'::TEXT as result_type,
        u.avatar_url,
        ('/hosts/' || u.id)::TEXT as path,
        CASE 
            WHEN lower(COALESCE(u.display_name, '')) LIKE '%' || normalized_term || '%' THEN 95
            WHEN lower(COALESCE(u.username, '')) LIKE '%' || normalized_term || '%' THEN 85
            ELSE 55
        END::NUMERIC as relevance_score
    FROM public.users u
    WHERE EXISTS (SELECT 1 FROM public.moments m WHERE m.host_id = u.id LIMIT 1)
        AND (
            lower(COALESCE(u.display_name, '')) LIKE '%' || normalized_term || '%'
            OR lower(COALESCE(u.username, '')) LIKE '%' || normalized_term || '%'
        )
    
    ORDER BY relevance_score DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment for documentation
COMMENT ON FUNCTION public.fn_global_search(TEXT) IS 
'Unified search across moments, users, brands, merchants, and hosts. Returns results sorted by relevance score.';

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.fn_global_search(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_global_search(TEXT) TO anon;
