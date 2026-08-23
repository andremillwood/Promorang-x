-- Publish the conservative Kingston launch tranche and expose it through the
-- existing public venue directory. Imported places stay unclaimed/unverified.

UPDATE public.inventory_candidates candidate
SET
  review_status = 'approved',
  review_notes = concat_ws(E'\n', candidate.review_notes, 'Auto-approved for Kingston launch tranche: OSM confidence >= 0.800.'),
  reviewed_at = now(),
  updated_at = now()
FROM public.inventory_sources source
WHERE candidate.source_id = source.id
  AND source.source_key = 'openstreetmap'
  AND candidate.entity_type = 'venue'
  AND candidate.review_status = 'pending'
  AND candidate.confidence >= 0.800
  AND candidate.duplicate_of IS NULL;

DO $$
DECLARE
  candidate record;
BEGIN
  FOR candidate IN
    SELECT inventory_candidate.id
    FROM public.inventory_candidates inventory_candidate
    JOIN public.inventory_sources source ON source.id = inventory_candidate.source_id
    WHERE source.source_key = 'openstreetmap'
      AND inventory_candidate.entity_type = 'venue'
      AND inventory_candidate.review_status = 'approved'
      AND inventory_candidate.confidence >= 0.800
      AND inventory_candidate.duplicate_of IS NULL
    ORDER BY inventory_candidate.confidence DESC, inventory_candidate.id
  LOOP
    PERFORM public.publish_approved_inventory_venue(candidate.id);
  END LOOP;
END;
$$;

CREATE OR REPLACE VIEW public.view_public_venue_directory AS
SELECT
  vp.id,
  vp.slug,
  vp.name,
  vp.description,
  vp.location,
  vp.city,
  public.slugify(vp.city) AS city_slug,
  vp.country,
  public.slugify(vp.country) AS country_slug,
  vp.address,
  vp.venue_type,
  vp.images,
  vp.total_moments_hosted,
  vp.total_checkins,
  vp.avg_rating,
  vp.popularity_score,
  vp.verification_status,
  (
    SELECT count(*)::integer
    FROM public.moments moment
    WHERE moment.venue_id = vp.id
      AND moment.is_active = true
  ) AS active_moments_count,
  'claimed'::text AS listing_status,
  NULL::text AS source_url,
  NULL::text AS attribution_text
FROM public.venue_profiles vp

UNION ALL

SELECT
  imported.id,
  imported.venue_slug AS slug,
  imported.venue_name AS name,
  NULL::text AS description,
  imported.address AS location,
  imported.city,
  public.slugify(imported.city) AS city_slug,
  imported.country,
  public.slugify(imported.country) AS country_slug,
  imported.address,
  CASE COALESCE(imported.categories[1], 'other')
    WHEN 'restaurant' THEN 'restaurant'
    WHEN 'cafe' THEN 'cafe'
    WHEN 'nightlife' THEN 'bar'
    WHEN 'shopping' THEN 'retail'
    WHEN 'arts_culture' THEN 'gallery'
    ELSE 'other'
  END AS venue_type,
  imported.photos AS images,
  0::integer AS total_moments_hosted,
  0::integer AS total_checkins,
  0::numeric(3,2) AS avg_rating,
  round(COALESCE(candidate.confidence, 0) * 100, 2)::numeric(5,2) AS popularity_score,
  imported.verification_status,
  0::integer AS active_moments_count,
  'unclaimed'::text AS listing_status,
  imported.source_url,
  imported.attribution_text
FROM public.pre_populated_venues imported
LEFT JOIN public.inventory_candidates candidate ON candidate.id = imported.inventory_candidate_id
WHERE imported.is_claimed = false
  AND imported.verification_status = 'unverified';

GRANT SELECT ON public.view_public_venue_directory TO anon, authenticated;
COMMENT ON VIEW public.view_public_venue_directory IS
  'Public discovery view combining claimed venue profiles with attributed, unclaimed cold-start inventory.';

NOTIFY pgrst, 'reload schema';
