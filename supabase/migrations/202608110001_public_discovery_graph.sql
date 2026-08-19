-- Complete the public Scene → Discovery → Location graph used by archives and SEO.
ALTER TABLE public.discoveries
  ADD COLUMN IF NOT EXISTS scene_id uuid REFERENCES public.scenes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_discoveries_scene_id
  ON public.discoveries(scene_id)
  WHERE verification_status = 'approved';

-- Public map consumers must use stored coordinates; fabricated marker positions
-- undermine directions and location trust. Recreate the directory with coordinates.
CREATE OR REPLACE VIEW public.view_public_moment_directory AS
WITH participant_counts AS (
  SELECT mp.moment_id, count(*)::integer AS participant_count
  FROM public.moment_participants mp
  GROUP BY mp.moment_id
)
SELECT
  m.id, m.slug, m.title, m.description,
  COALESCE(m.seo_title, m.title) AS seo_title,
  COALESCE(m.seo_description, left(COALESCE(m.description, ''), 155)) AS seo_description,
  m.category, public.slugify(m.category) AS category_slug,
  COALESCE(m.city, vp.city) AS city,
  public.slugify(COALESCE(m.city, vp.city)) AS city_slug,
  COALESCE(m.country, vp.country) AS country,
  public.slugify(COALESCE(m.country, vp.country)) AS country_slug,
  COALESCE(m.location, vp.location, concat_ws(', ', vp.city, vp.country)) AS location,
  m.venue_id, COALESCE(m.venue_name, vp.name) AS venue_name, vp.slug AS venue_slug,
  m.image_url, m.starts_at, m.ends_at, m.reward, m.host_id, m.is_active,
  COALESCE(pc.participant_count, 0) AS participant_count,
  array_remove(array_agg(DISTINCT o.id), NULL) AS associated_brand_ids,
  array_remove(array_agg(DISTINCT o.name), NULL) AS associated_brand_names,
  array_remove(array_agg(DISTINCT o.slug), NULL) AS associated_brand_slugs,
  m.latitude,
  m.longitude
FROM public.moments m
LEFT JOIN public.venue_profiles vp ON vp.id = m.venue_id
LEFT JOIN participant_counts pc ON pc.moment_id = m.id
LEFT JOIN public.view_moment_brand_associations mba ON mba.moment_id = m.id
LEFT JOIN public.organizations o ON o.id = mba.brand_id
WHERE m.content_origin = 'stakeholder_created'
GROUP BY
  m.id, m.slug, m.title, m.description, m.seo_title, m.seo_description,
  m.category, m.city, vp.city, m.country, vp.country, m.location, vp.location,
  m.venue_id, m.venue_name, vp.name, vp.slug, m.image_url, m.starts_at,
  m.ends_at, m.reward, m.host_id, m.is_active, pc.participant_count,
  m.latitude, m.longitude;

GRANT SELECT ON public.view_public_moment_directory TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
