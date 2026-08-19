-- Keep illustrative records out of production discovery and social proof.
-- Sample routes may still address demo records directly, but public directories
-- only aggregate stakeholder-created activity.

ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS content_origin text NOT NULL DEFAULT 'stakeholder_created';

ALTER TABLE public.content_items
  DROP CONSTRAINT IF EXISTS content_items_content_origin_check;

ALTER TABLE public.content_items
  ADD CONSTRAINT content_items_content_origin_check
  CHECK (content_origin IN ('stakeholder_created', 'platform_seed', 'demo', 'scraped', 'imported'));

UPDATE public.content_items
SET content_origin = 'demo'
WHERE content_origin = 'stakeholder_created'
  AND (
    lower(coalesce(title, '')) LIKE '%demo%'
    OR lower(coalesce(title, '')) LIKE '%example%'
    OR lower(coalesce(media_url, '')) LIKE '%/demo%'
  );

CREATE INDEX IF NOT EXISTS idx_content_items_content_origin
  ON public.content_items(content_origin, posted_at DESC);

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
  array_remove(array_agg(DISTINCT o.slug), NULL) AS associated_brand_slugs
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
  m.ends_at, m.reward, m.host_id, m.is_active, pc.participant_count;

CREATE OR REPLACE VIEW public.view_public_content_directory AS
SELECT
  ci.id, ci.slug, ci.title, ci.description, ci.media_url, ci.platform, ci.posted_at,
  COALESCE(ci.seo_title, ci.title, 'Content on Promorang') AS seo_title,
  COALESCE(ci.seo_description, left(COALESCE(ci.description, ''), 155)) AS seo_description,
  vmd.category, vmd.category_slug,
  COALESCE(ci.city, vmd.city) AS city,
  public.slugify(COALESCE(ci.city, vmd.city)) AS city_slug,
  COALESCE(ci.country, vmd.country) AS country,
  public.slugify(COALESCE(ci.country, vmd.country)) AS country_slug,
  vmd.location, vmd.venue_id, vmd.venue_name, vmd.venue_slug,
  array_remove(array_cat(array_agg(DISTINCT o.slug), COALESCE(vmd.associated_brand_slugs, ARRAY[]::text[])), NULL) AS associated_brand_slugs,
  array_remove(array_cat(array_agg(DISTINCT o.name), COALESCE(vmd.associated_brand_names, ARRAY[]::text[])), NULL) AS associated_brand_names,
  vmd.id AS linked_moment_id, vmd.slug AS linked_moment_slug, vmd.title AS linked_moment_title
FROM public.content_items ci
LEFT JOIN public.content_brand_links cbl ON cbl.content_item_id = ci.id
LEFT JOIN public.organizations o ON o.id = cbl.brand_organization_id
LEFT JOIN public.content_moment_links cml ON cml.content_item_id = ci.id
LEFT JOIN public.view_public_moment_directory vmd ON vmd.id = cml.moment_id
WHERE ci.content_origin = 'stakeholder_created'
GROUP BY
  ci.id, ci.slug, ci.title, ci.description, ci.media_url, ci.platform,
  ci.posted_at, ci.seo_title, ci.seo_description, ci.city, ci.country,
  vmd.category, vmd.category_slug, vmd.city, vmd.country, vmd.location,
  vmd.venue_id, vmd.venue_name, vmd.venue_slug, vmd.associated_brand_slugs,
  vmd.associated_brand_names, vmd.id, vmd.slug, vmd.title;

COMMENT ON COLUMN public.content_items.content_origin IS
  'Provenance marker used to keep illustrative content out of production discovery and metrics.';

NOTIFY pgrst, 'reload schema';
