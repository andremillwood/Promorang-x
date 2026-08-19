-- Migration: 202608070001_trending_and_recommendations.sql
-- Description: Velocity-based Trending Score and Recommendation Engine for Promorang Moments

-- Function 1: Calculate trending momentum score for moments
CREATE OR REPLACE FUNCTION fn_get_trending_moments(
  p_latitude DECIMAL(10,8) DEFAULT NULL,
  p_longitude DECIMAL(10,8) DEFAULT NULL,
  p_radius_km DECIMAL(10,2) DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  venue_name TEXT,
  category TEXT,
  image_url TEXT,
  banner_image_url TEXT,
  reward TEXT,
  starts_at TIMESTAMPTZ,
  latitude DECIMAL(10,8),
  longitude DECIMAL(10,8),
  trending_score NUMERIC,
  distance_km NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.description,
    m.location,
    m.venue_name,
    m.category,
    m.image_url,
    m.banner_image_url,
    m.reward::TEXT,
    m.starts_at,
    m.latitude,
    m.longitude,
    -- Velocity formula: (rsvps * 3 + reward_pool_weight) / (hours_old + 2)^1.5
    ROUND(
      CAST(
        (COALESCE(m.max_participants, 10) * 0.2 + 10) / 
        POWER(EXTRACT(EPOCH FROM (NOW() - COALESCE(m.created_at, NOW() - INTERVAL '1 day'))) / 3600.0 + 2.0, 1.5)
      AS NUMERIC), 
      2
    ) AS trending_score,
    CASE 
      WHEN p_latitude IS NOT NULL AND p_longitude IS NOT NULL AND m.latitude IS NOT NULL AND m.longitude IS NOT NULL THEN
        ROUND(
          CAST(
            6371.0 * acos(
              LEAST(1.0, GREATEST(-1.0,
                cos(radians(p_latitude)) * cos(radians(m.latitude)) * 
                cos(radians(m.longitude) - radians(p_longitude)) + 
                sin(radians(p_latitude)) * sin(radians(m.latitude))
              ))
            )
          AS NUMERIC),
          2
        )
      ELSE NULL
    END AS distance_km
  FROM moments m
  WHERE (m.status IS NULL OR m.status = 'published' OR m.status = 'active')
    AND (
      p_radius_km IS NULL OR 
      p_latitude IS NULL OR 
      p_longitude IS NULL OR 
      m.latitude IS NULL OR
      (6371.0 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(p_latitude)) * cos(radians(m.latitude)) * 
          cos(radians(m.longitude) - radians(p_longitude)) + 
          sin(radians(p_latitude)) * sin(radians(m.latitude))
        ))
      )) <= p_radius_km
    )
  ORDER BY trending_score DESC, m.starts_at ASC
  LIMIT p_limit;
END;
$$;

-- Function 2: Personalized recommendations based on category and proximity
CREATE OR REPLACE FUNCTION fn_get_personalized_recommendations(
  p_user_id UUID,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  venue_name TEXT,
  category TEXT,
  image_url TEXT,
  reward TEXT,
  starts_at TIMESTAMPTZ,
  recommendation_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.description,
    m.location,
    m.venue_name,
    m.category,
    m.image_url,
    m.reward::TEXT,
    m.starts_at,
    'Based on trending moments in your area' AS recommendation_reason
  FROM moments m
  WHERE (m.status IS NULL OR m.status = 'published' OR m.status = 'active')
  ORDER BY m.starts_at ASC
  LIMIT p_limit;
END;
$$;
