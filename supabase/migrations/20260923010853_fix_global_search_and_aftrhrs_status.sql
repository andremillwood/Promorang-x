-- Repair the public global search function after the advertiser and venue
-- schemas diverged from the columns referenced by the original function.
-- Keep this function security-invoker: every source below is already exposed
-- for public discovery through its own RLS policy or security-invoker view.
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
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH query AS (
    SELECT lower(trim(search_term)) AS term
  )
  SELECT *
  FROM (
    SELECT
      m.id,
      m.title::TEXT,
      COALESCE(m.venue_name, m.location, 'Moment')::TEXT AS subtitle,
      COALESCE(m.description, '')::TEXT AS description,
      'moment'::TEXT AS result_type,
      m.image_url::TEXT,
      ('/moments/' || COALESCE(NULLIF(m.slug, ''), m.id::TEXT))::TEXT AS path,
      CASE
        WHEN lower(m.title) = q.term THEN 120
        WHEN lower(m.title) LIKE '%' || q.term || '%' THEN 100
        WHEN lower(COALESCE(m.description, '')) LIKE '%' || q.term || '%' THEN 80
        ELSE 60
      END::NUMERIC AS relevance_score
    FROM public.moments m
    CROSS JOIN query q
    WHERE m.is_active = true
      AND (
        lower(m.title) LIKE '%' || q.term || '%'
        OR lower(COALESCE(m.description, '')) LIKE '%' || q.term || '%'
        OR lower(COALESCE(m.venue_name, '')) LIKE '%' || q.term || '%'
        OR lower(COALESCE(m.location, '')) LIKE '%' || q.term || '%'
      )

    UNION ALL

    SELECT
      a.user_id AS id,
      a.company_name::TEXT AS title,
      COALESCE(a.industry, 'Brand')::TEXT AS subtitle,
      COALESCE(a.company_description, '')::TEXT AS description,
      'brand'::TEXT AS result_type,
      NULL::TEXT AS image_url,
      ('/brands/' || a.user_id::TEXT)::TEXT AS path,
      CASE
        WHEN lower(a.company_name) = q.term THEN 110
        WHEN lower(a.company_name) LIKE '%' || q.term || '%' THEN 90
        ELSE 70
      END::NUMERIC AS relevance_score
    FROM public.advertiser_profiles a
    CROSS JOIN query q
    WHERE lower(a.company_name) LIKE '%' || q.term || '%'
      OR lower(COALESCE(a.company_description, '')) LIKE '%' || q.term || '%'
      OR lower(COALESCE(a.industry, '')) LIKE '%' || q.term || '%'

    UNION ALL

    SELECT
      v.id,
      v.name::TEXT AS title,
      COALESCE(v.venue_type, v.city, 'Place')::TEXT AS subtitle,
      COALESCE(v.description, '')::TEXT AS description,
      'venue'::TEXT AS result_type,
      NULL::TEXT AS image_url,
      ('/venues/' || COALESCE(NULLIF(v.slug, ''), v.id::TEXT))::TEXT AS path,
      CASE
        WHEN lower(v.name) = q.term THEN 110
        WHEN lower(v.name) LIKE '%' || q.term || '%' THEN 90
        ELSE 65
      END::NUMERIC AS relevance_score
    FROM public.view_public_venue_directory v
    CROSS JOIN query q
    WHERE lower(v.name) LIKE '%' || q.term || '%'
      OR lower(COALESCE(v.description, '')) LIKE '%' || q.term || '%'
      OR lower(COALESCE(v.city, '')) LIKE '%' || q.term || '%'
      OR lower(COALESCE(v.venue_type, '')) LIKE '%' || q.term || '%'
  ) results
  ORDER BY relevance_score DESC, title ASC
  LIMIT 50;
$$;

REVOKE ALL ON FUNCTION public.fn_global_search(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_global_search(TEXT) TO anon, authenticated;

-- AftrHrs is a live recurring Moment, not an unpublished draft. Its dedicated
-- release/claim state remains managed separately by the AftrHrs edition tables.
UPDATE public.moments
SET status = 'joinable',
    updated_at = now()
WHERE slug = 'aftrhrs'
  AND is_active = true
  AND status = 'draft';
