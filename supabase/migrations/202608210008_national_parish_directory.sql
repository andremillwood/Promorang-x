-- Reconciles pilot geography with the national source and exposes parish as a
-- first-class directory field without changing the existing view column types.

UPDATE public.pre_populated_venues venue
SET state = candidate.normalized_data->>'parish',
    city = COALESCE(NULLIF(candidate.normalized_data->>'city', ''), candidate.normalized_data->>'parish'),
    address = CASE
      WHEN venue.address IS NULL OR venue.address IN ('Jamaica', 'Kingston, Jamaica')
        THEN candidate.normalized_data->>'address'
      ELSE venue.address
    END,
    updated_at = now()
FROM public.inventory_candidates candidate
WHERE candidate.id = venue.inventory_candidate_id
  AND NULLIF(candidate.normalized_data->>'parish', '') IS NOT NULL
  AND (venue.state IS DISTINCT FROM candidate.normalized_data->>'parish'
    OR venue.city IS NULL
    OR venue.address IN ('Jamaica', 'Kingston, Jamaica'));

CREATE OR REPLACE VIEW public.view_public_venue_directory AS
SELECT
  vp.id, vp.slug, vp.name, vp.description, vp.location, vp.city,
  public.slugify(vp.city) AS city_slug, vp.country,
  public.slugify(vp.country) AS country_slug, vp.address, vp.venue_type, vp.images,
  vp.total_moments_hosted, vp.total_checkins, vp.avg_rating, vp.popularity_score,
  vp.verification_status,
  (SELECT count(*)::integer FROM public.moments moment WHERE moment.venue_id = vp.id AND moment.is_active = true) AS active_moments_count,
  'claimed'::text AS listing_status, NULL::text AS source_url, NULL::text AS attribution_text,
  NULL::text AS parish, NULL::text AS parish_slug
FROM public.venue_profiles vp
UNION ALL
SELECT
  imported.id, imported.venue_slug, imported.venue_name, NULL::text, imported.address,
  imported.city, public.slugify(imported.city), imported.country, public.slugify(imported.country),
  imported.address,
  CASE COALESCE(imported.categories[1], 'other')
    WHEN 'restaurant' THEN 'restaurant' WHEN 'cafe' THEN 'cafe'
    WHEN 'nightlife' THEN 'bar' WHEN 'shopping' THEN 'retail'
    WHEN 'arts_culture' THEN 'gallery' ELSE 'other' END,
  imported.photos, 0::integer, 0::integer, 0::numeric(3,2),
  round(COALESCE(candidate.confidence, 0) * 100, 2)::numeric(5,2),
  imported.verification_status, 0::integer, 'unclaimed'::text,
  imported.source_url, imported.attribution_text,
  imported.state, public.slugify(imported.state)
FROM public.pre_populated_venues imported
LEFT JOIN public.inventory_candidates candidate ON candidate.id = imported.inventory_candidate_id
WHERE imported.is_claimed = false AND imported.verification_status = 'unverified';

GRANT SELECT ON public.view_public_venue_directory TO anon, authenticated;
COMMENT ON VIEW public.view_public_venue_directory IS
  'National public venue discovery view with explicit Jamaica parish geography.';
NOTIFY pgrst, 'reload schema';
