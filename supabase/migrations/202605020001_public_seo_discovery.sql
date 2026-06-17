-- Public SEO discovery surface
-- Adds stable slugs, lightweight location normalization, brand associations,
-- and public views for archive/detail pages across moments, venues, brands, and content.

CREATE OR REPLACE FUNCTION public.slugify(input_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(
    regexp_replace(
      regexp_replace(lower(trim(COALESCE(input_text, ''))), '[^a-z0-9]+', '-', 'g'),
      '(^-+|-+$)',
      '',
      'g'
    ),
    ''
  );
$$;

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

CREATE TABLE IF NOT EXISTS public.moment_brand_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  brand_organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  association_type text NOT NULL DEFAULT 'sponsor'
    CHECK (association_type IN ('sponsor', 'partner', 'featured', 'organizer', 'campaign')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(moment_id, brand_organization_id, association_type)
);

CREATE TABLE IF NOT EXISTS public.content_brand_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  brand_organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  association_type text NOT NULL DEFAULT 'featured'
    CHECK (association_type IN ('featured', 'sponsor', 'partner', 'campaign')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(content_item_id, brand_organization_id, association_type)
);

CREATE INDEX IF NOT EXISTS idx_moments_slug ON public.moments(slug);
CREATE INDEX IF NOT EXISTS idx_moments_city_country ON public.moments(city, country);
CREATE INDEX IF NOT EXISTS idx_content_items_slug ON public.content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_city_country ON public.content_items(city, country);
CREATE INDEX IF NOT EXISTS idx_moment_brand_links_moment ON public.moment_brand_links(moment_id);
CREATE INDEX IF NOT EXISTS idx_moment_brand_links_brand ON public.moment_brand_links(brand_organization_id);
CREATE INDEX IF NOT EXISTS idx_content_brand_links_content ON public.content_brand_links(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_brand_links_brand ON public.content_brand_links(brand_organization_id);

UPDATE public.moments
SET
  slug = COALESCE(slug, public.slugify(title) || '-' || left(id::text, 8)),
  seo_title = COALESCE(seo_title, title),
  seo_description = COALESCE(seo_description, left(COALESCE(description, 'Discover this moment on Promorang.'), 155))
WHERE slug IS NULL
   OR seo_title IS NULL
   OR seo_description IS NULL;

UPDATE public.content_items
SET
  slug = COALESCE(slug, public.slugify(COALESCE(title, 'content')) || '-' || left(id::text, 8)),
  seo_title = COALESCE(seo_title, COALESCE(title, 'Content on Promorang')),
  seo_description = COALESCE(seo_description, left(COALESCE(description, 'Explore creator content on Promorang.'), 155))
WHERE slug IS NULL
   OR seo_title IS NULL
   OR seo_description IS NULL;

UPDATE public.moments m
SET
  city = COALESCE(m.city, vp.city),
  country = COALESCE(m.country, vp.country),
  location = COALESCE(m.location, vp.location, vp.city),
  venue_name = COALESCE(m.venue_name, vp.name)
FROM public.venue_profiles vp
WHERE m.venue_id = vp.id
  AND (
    m.city IS NULL
    OR m.country IS NULL
    OR m.location IS NULL
    OR m.venue_name IS NULL
  );

UPDATE public.moments
SET
  city = COALESCE(city, NULLIF(trim(split_part(location, ',', 1)), '')),
  country = COALESCE(country, NULLIF(trim(split_part(location, ',', 2)), ''))
WHERE location IS NOT NULL
  AND (city IS NULL OR country IS NULL);

UPDATE public.content_items ci
SET
  city = COALESCE(ci.city, m.city),
  country = COALESCE(ci.country, m.country)
FROM public.content_moment_links cml
JOIN public.moments m ON m.id = cml.moment_id
WHERE ci.id = cml.content_item_id
  AND (ci.city IS NULL OR ci.country IS NULL);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'moments_slug_unique'
  ) THEN
    ALTER TABLE public.moments
      ADD CONSTRAINT moments_slug_unique UNIQUE (slug);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'content_items_slug_unique'
  ) THEN
    ALTER TABLE public.content_items
      ADD CONSTRAINT content_items_slug_unique UNIQUE (slug);
  END IF;
END $$;

ALTER TABLE public.moment_brand_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_brand_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read moment brand links" ON public.moment_brand_links;
CREATE POLICY "Public can read moment brand links"
  ON public.moment_brand_links
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can read content brand links" ON public.content_brand_links;
CREATE POLICY "Public can read content brand links"
  ON public.content_brand_links
  FOR SELECT
  USING (true);

CREATE OR REPLACE VIEW public.view_moment_brand_associations AS
SELECT DISTINCT
  mbl.moment_id,
  mbl.brand_organization_id AS brand_id
FROM public.moment_brand_links mbl
UNION
SELECT DISTINCT
  sr.moment_id,
  om.organization_id AS brand_id
FROM public.sponsorship_requests sr
JOIN public.organization_members om
  ON om.user_id = sr.brand_id
JOIN public.organizations o
  ON o.id = om.organization_id
WHERE o.type = 'brand'
  AND sr.status = 'approved';

CREATE OR REPLACE VIEW public.view_public_moment_directory AS
WITH participant_counts AS (
  SELECT
    mp.moment_id,
    count(*)::integer AS participant_count
  FROM public.moment_participants mp
  GROUP BY mp.moment_id
)
SELECT
  m.id,
  m.slug,
  m.title,
  m.description,
  COALESCE(m.seo_title, m.title) AS seo_title,
  COALESCE(m.seo_description, left(COALESCE(m.description, ''), 155)) AS seo_description,
  m.category,
  public.slugify(m.category) AS category_slug,
  COALESCE(m.city, vp.city) AS city,
  public.slugify(COALESCE(m.city, vp.city)) AS city_slug,
  COALESCE(m.country, vp.country) AS country,
  public.slugify(COALESCE(m.country, vp.country)) AS country_slug,
  COALESCE(m.location, vp.location, concat_ws(', ', vp.city, vp.country)) AS location,
  m.venue_id,
  COALESCE(m.venue_name, vp.name) AS venue_name,
  vp.slug AS venue_slug,
  m.image_url,
  m.starts_at,
  m.ends_at,
  m.reward,
  m.host_id,
  m.is_active,
  COALESCE(pc.participant_count, 0) AS participant_count,
  array_remove(array_agg(DISTINCT o.id), NULL) AS associated_brand_ids,
  array_remove(array_agg(DISTINCT o.name), NULL) AS associated_brand_names,
  array_remove(array_agg(DISTINCT o.slug), NULL) AS associated_brand_slugs
FROM public.moments m
LEFT JOIN public.venue_profiles vp
  ON vp.id = m.venue_id
LEFT JOIN participant_counts pc
  ON pc.moment_id = m.id
LEFT JOIN public.view_moment_brand_associations mba
  ON mba.moment_id = m.id
LEFT JOIN public.organizations o
  ON o.id = mba.brand_id
GROUP BY
  m.id,
  m.slug,
  m.title,
  m.description,
  m.seo_title,
  m.seo_description,
  m.category,
  m.city,
  vp.city,
  m.country,
  vp.country,
  m.location,
  vp.location,
  m.venue_id,
  m.venue_name,
  vp.name,
  vp.slug,
  m.image_url,
  m.starts_at,
  m.ends_at,
  m.reward,
  m.host_id,
  m.is_active,
  pc.participant_count;

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
    FROM public.moments m
    WHERE m.venue_id = vp.id
      AND m.is_active = true
  ) AS active_moments_count
FROM public.venue_profiles vp;

CREATE OR REPLACE VIEW public.view_public_brand_directory AS
SELECT
  o.id,
  o.slug,
  o.name,
  o.avatar_url AS logo_url,
  o.website AS website_url,
  o.created_at,
  (
    SELECT count(*)::integer
    FROM public.campaigns c
    WHERE c.brand_id = o.id
      AND c.is_active = true
  ) AS active_campaigns_count,
  (
    SELECT count(DISTINCT mba.moment_id)::integer
    FROM public.view_moment_brand_associations mba
    WHERE mba.brand_id = o.id
  ) AS associated_moments_count
FROM public.organizations o
WHERE o.type = 'brand';

CREATE OR REPLACE VIEW public.view_public_content_directory AS
SELECT
  ci.id,
  ci.slug,
  ci.title,
  ci.description,
  ci.media_url,
  ci.platform,
  ci.posted_at,
  COALESCE(ci.seo_title, ci.title, 'Content on Promorang') AS seo_title,
  COALESCE(ci.seo_description, left(COALESCE(ci.description, ''), 155)) AS seo_description,
  vmd.category,
  vmd.category_slug,
  COALESCE(ci.city, vmd.city) AS city,
  public.slugify(COALESCE(ci.city, vmd.city)) AS city_slug,
  COALESCE(ci.country, vmd.country) AS country,
  public.slugify(COALESCE(ci.country, vmd.country)) AS country_slug,
  vmd.location,
  vmd.venue_id,
  vmd.venue_name,
  vmd.venue_slug,
  array_remove(array_cat(
    array_agg(DISTINCT o.slug),
    COALESCE(vmd.associated_brand_slugs, ARRAY[]::text[])
  ), NULL) AS associated_brand_slugs,
  array_remove(array_cat(
    array_agg(DISTINCT o.name),
    COALESCE(vmd.associated_brand_names, ARRAY[]::text[])
  ), NULL) AS associated_brand_names,
  vmd.id AS linked_moment_id,
  vmd.slug AS linked_moment_slug,
  vmd.title AS linked_moment_title
FROM public.content_items ci
LEFT JOIN public.content_brand_links cbl
  ON cbl.content_item_id = ci.id
LEFT JOIN public.organizations o
  ON o.id = cbl.brand_organization_id
LEFT JOIN public.content_moment_links cml
  ON cml.content_item_id = ci.id
LEFT JOIN public.view_public_moment_directory vmd
  ON vmd.id = cml.moment_id
GROUP BY
  ci.id,
  ci.slug,
  ci.title,
  ci.description,
  ci.media_url,
  ci.platform,
  ci.posted_at,
  ci.seo_title,
  ci.seo_description,
  ci.city,
  ci.country,
  vmd.category,
  vmd.category_slug,
  vmd.city,
  vmd.country,
  vmd.location,
  vmd.venue_id,
  vmd.venue_name,
  vmd.venue_slug,
  vmd.associated_brand_slugs,
  vmd.associated_brand_names,
  vmd.id,
  vmd.slug,
  vmd.title;

GRANT SELECT ON public.view_moment_brand_associations TO anon, authenticated;
GRANT SELECT ON public.view_public_moment_directory TO anon, authenticated;
GRANT SELECT ON public.view_public_venue_directory TO anon, authenticated;
GRANT SELECT ON public.view_public_brand_directory TO anon, authenticated;
GRANT SELECT ON public.view_public_content_directory TO anon, authenticated;

COMMENT ON VIEW public.view_public_moment_directory IS 'Public discovery view for SEO-friendly moment archives and detail pages.';
COMMENT ON VIEW public.view_public_venue_directory IS 'Public discovery view for venue archive and detail pages.';
COMMENT ON VIEW public.view_public_brand_directory IS 'Public discovery view for brand archive and detail pages.';
COMMENT ON VIEW public.view_public_content_directory IS 'Public discovery view for content grouped by moment, venue, brand, and location.';

notify pgrst, 'reload schema';
