
CREATE OR REPLACE FUNCTION public.sync_inventory_candidate_market()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE existing_id uuid;
BEGIN
  NEW.country_code := COALESCE(NEW.country_code,NEW.normalized_data->>'country_code');
  NEW.country_slug := COALESCE(NEW.country_slug,NEW.normalized_data->>'country_slug',public.slugify(NEW.normalized_data->>'country'));
  NEW.city_slug := COALESCE(NEW.city_slug,NEW.normalized_data->>'city_slug',public.slugify(NEW.normalized_data->>'city'));
  IF NEW.entity_type='moment' AND NEW.expires_at IS NULL THEN
    NEW.expires_at := COALESCE(NULLIF(NEW.normalized_data->>'ends_at','')::timestamptz,NULLIF(NEW.normalized_data->>'starts_at','')::timestamptz)+interval '24 hours';
  END IF;
  SELECT candidate.id INTO existing_id FROM public.inventory_candidates candidate
  WHERE candidate.fingerprint=NEW.fingerprint AND candidate.entity_type=NEW.entity_type
    AND candidate.id<>NEW.id AND candidate.lifecycle_status IN ('current','stale')
  ORDER BY candidate.created_at LIMIT 1;
  IF existing_id IS NOT NULL THEN
    NEW.duplicate_of := COALESCE(NEW.duplicate_of,existing_id);
    IF NEW.review_status NOT IN ('published','rejected') THEN NEW.review_status := 'needs_research'; END IF;
  END IF;
  RETURN NEW;
END; $function$;

CREATE TRIGGER sync_inventory_candidate_market BEFORE INSERT OR UPDATE OF normalized_data,country_code,country_slug,city_slug ON public.inventory_candidates FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_candidate_market();
CREATE VIEW public.view_public_venue_directory AS  SELECT vp.id,
    vp.slug,
    vp.name,
    vp.description,
    vp.location,
    vp.city,
    slugify(vp.city) AS city_slug,
    vp.country,
    slugify(vp.country) AS country_slug,
    vp.address,
    vp.venue_type,
    vp.images,
    vp.total_moments_hosted,
    vp.total_checkins,
    vp.avg_rating,
    vp.popularity_score,
    vp.verification_status,
    ( SELECT count(*)::integer AS count
           FROM moments moment
          WHERE moment.venue_id = vp.id AND moment.is_active = true) AS active_moments_count,
    'claimed'::text AS listing_status,
    NULL::text AS source_url,
    NULL::text AS attribution_text,
    NULL::text AS parish,
    NULL::text AS parish_slug
   FROM venue_profiles vp
UNION ALL
 SELECT imported.id,
    imported.venue_slug AS slug,
    imported.venue_name AS name,
    NULL::text AS description,
    imported.address AS location,
    imported.city,
    slugify(imported.city) AS city_slug,
    imported.country,
    slugify(imported.country) AS country_slug,
    imported.address,
        CASE COALESCE(imported.categories[1], 'other'::text)
            WHEN 'restaurant'::text THEN 'restaurant'::text
            WHEN 'cafe'::text THEN 'cafe'::text
            WHEN 'nightlife'::text THEN 'bar'::text
            WHEN 'shopping'::text THEN 'retail'::text
            WHEN 'arts_culture'::text THEN 'gallery'::text
            ELSE 'other'::text
        END AS venue_type,
    imported.photos AS images,
    0 AS total_moments_hosted,
    0 AS total_checkins,
    0::numeric(3,2) AS avg_rating,
    round(COALESCE(candidate.confidence, 0::numeric) * 100::numeric, 2)::numeric(5,2) AS popularity_score,
    imported.verification_status,
    0 AS active_moments_count,
    'unclaimed'::text AS listing_status,
    imported.source_url,
    imported.attribution_text,
    imported.state AS parish,
    slugify(imported.state) AS parish_slug
   FROM pre_populated_venues imported
     LEFT JOIN inventory_candidates candidate ON candidate.id = imported.inventory_candidate_id
  WHERE imported.is_claimed = false AND imported.verification_status = 'unverified'::text;
CREATE VIEW public.view_public_moment_directory AS  WITH participant_counts AS (
         SELECT going.moment_id,
            count(*)::integer AS participant_count
           FROM ( SELECT mp.moment_id
                   FROM moment_participants mp
                UNION ALL
                 SELECT g.moment_id
                   FROM guest_moment_rsvps g
                  WHERE g.status = ANY (ARRAY['confirmed'::text, 'checked_in'::text])
                UNION ALL
                 SELECT e.event_id AS moment_id
                   FROM event_moment_participations e) going
          GROUP BY going.moment_id
        )
 SELECT m.id,
    m.slug,
    m.title,
    m.description,
    COALESCE(m.seo_title, m.title) AS seo_title,
    COALESCE(m.seo_description, "left"(COALESCE(m.description, ''::text), 155)) AS seo_description,
    m.category,
    slugify(m.category) AS category_slug,
    COALESCE(m.city, vp.city) AS city,
    slugify(COALESCE(m.city, vp.city)) AS city_slug,
    COALESCE(m.country, vp.country) AS country,
    slugify(COALESCE(m.country, vp.country)) AS country_slug,
    COALESCE(m.location, vp.location, concat_ws(', '::text, vp.city, vp.country)) AS location,
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
    array_remove(array_agg(DISTINCT o.id), NULL::uuid) AS associated_brand_ids,
    array_remove(array_agg(DISTINCT o.name), NULL::text) AS associated_brand_names,
    array_remove(array_agg(DISTINCT o.slug), NULL::text) AS associated_brand_slugs,
    m.latitude,
    m.longitude
   FROM moments m
     LEFT JOIN venue_profiles vp ON vp.id = m.venue_id
     LEFT JOIN participant_counts pc ON pc.moment_id = m.id
     LEFT JOIN view_moment_brand_associations mba ON mba.moment_id = m.id
     LEFT JOIN organizations o ON o.id = mba.brand_id
  WHERE m.content_origin = 'stakeholder_created'::moment_content_origin
  GROUP BY m.id, m.slug, m.title, m.description, m.seo_title, m.seo_description, m.category, m.city, vp.city, m.country, vp.country, m.location, vp.location, m.venue_id, m.venue_name, vp.name, vp.slug, m.image_url, m.starts_at, m.ends_at, m.reward, m.host_id, m.is_active, pc.participant_count, m.latitude, m.longitude;

