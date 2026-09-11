-- Mirror AftrHrs guest RSVPs onto the Promorang Moment going count.
-- Guest landing stays account-free; the AftrHrs Moment still receives those names.

CREATE OR REPLACE FUNCTION public.aftrhrs_attach_guest_to_moment(
  p_name text,
  p_email text,
  p_phone text,
  p_code text,
  p_kind text DEFAULT 'rsvp',
  p_moment_id uuid DEFAULT '00000000-0000-0000-0002-000000000080'::uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id uuid;
  v_mobile text;
  v_code text;
BEGIN
  v_code := upper(trim(coalesce(p_code, '')));
  v_mobile := left(trim(coalesce(nullif(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), ''), p_phone, '0000000')), 40);
  IF v_code = '' OR char_length(trim(coalesce(p_name, ''))) < 2 THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.guest_moment_rsvps (
    moment_id, full_name, mobile, email, guest_count, status, pass_code,
    consent_email, schedule_snapshot
  ) VALUES (
    coalesce(p_moment_id, '00000000-0000-0000-0002-000000000080'::uuid),
    trim(p_name),
    v_mobile,
    nullif(lower(trim(coalesce(p_email, ''))), ''),
    1,
    'confirmed',
    v_code,
    true,
    jsonb_build_object('source', 'aftrhrs_guest', 'kind', coalesce(p_kind, 'rsvp'))
  )
  ON CONFLICT (pass_code) DO NOTHING
  RETURNING id INTO v_id;

  RETURN v_id;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.aftrhrs_sync_guest_to_moment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.aftrhrs_attach_guest_to_moment(
      NEW.full_name,
      NEW.email,
      coalesce(NEW.phone_normalized, NEW.phone),
      NEW.unique_code,
      NEW.kind,
      '00000000-0000-0000-0002-000000000080'::uuid
    );
    RETURN NEW;
  END IF;

  IF NEW.status = 'expired' AND OLD.status IS DISTINCT FROM 'expired' THEN
    UPDATE public.guest_moment_rsvps
    SET status = 'cancelled',
        cancelled_at = now(),
        updated_at = now()
    WHERE pass_code = NEW.unique_code
      AND status = 'confirmed';
  ELSIF NEW.status = 'redeemed' AND OLD.status IS DISTINCT FROM 'redeemed' THEN
    UPDATE public.guest_moment_rsvps
    SET status = 'checked_in',
        checked_in_at = coalesce(NEW.redeemed_at, now()),
        updated_at = now()
    WHERE pass_code = NEW.unique_code
      AND status = 'confirmed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_aftrhrs_guest_to_moment ON public.aftrhrs_guest_entries;
CREATE TRIGGER trg_aftrhrs_guest_to_moment
  AFTER INSERT OR UPDATE OF status ON public.aftrhrs_guest_entries
  FOR EACH ROW EXECUTE PROCEDURE public.aftrhrs_sync_guest_to_moment();

CREATE OR REPLACE FUNCTION public.moment_going_count(p_moment_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (
    (SELECT count(*) FROM public.moment_participants mp WHERE mp.moment_id = p_moment_id)
    + (SELECT count(*) FROM public.guest_moment_rsvps g
       WHERE g.moment_id = p_moment_id AND g.status IN ('confirmed', 'checked_in'))
    + (SELECT count(*) FROM public.event_moment_participations e WHERE e.event_id = p_moment_id)
  )::integer;
$$;

INSERT INTO public.guest_moment_rsvps (
  moment_id, full_name, mobile, email, guest_count, status, pass_code,
  consent_email, schedule_snapshot
)
SELECT
  '00000000-0000-0000-0002-000000000080'::uuid,
  e.full_name,
  left(coalesce(nullif(e.phone_normalized, ''), e.phone, '0000000'), 40),
  e.email,
  1,
  CASE WHEN e.status = 'redeemed' THEN 'checked_in' ELSE 'confirmed' END,
  e.unique_code,
  true,
  jsonb_build_object('source', 'aftrhrs_guest', 'kind', e.kind, 'backfill', true)
FROM public.aftrhrs_guest_entries e
WHERE e.status IN ('active', 'redeemed')
  AND coalesce(e.unique_code, '') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.guest_moment_rsvps g WHERE g.pass_code = e.unique_code
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.guest_moment_rsvps g
    WHERE g.moment_id = '00000000-0000-0000-0002-000000000080'::uuid
      AND g.mobile = left(coalesce(nullif(e.phone_normalized, ''), e.phone, '0000000'), 40)
      AND g.status = 'confirmed'
  )
ON CONFLICT (pass_code) DO NOTHING;

CREATE OR REPLACE VIEW public.view_public_moment_directory AS
WITH participant_counts AS (
  SELECT going.moment_id, count(*)::integer AS participant_count
  FROM (
    SELECT mp.moment_id FROM public.moment_participants mp
    UNION ALL
    SELECT g.moment_id FROM public.guest_moment_rsvps g
      WHERE g.status IN ('confirmed', 'checked_in')
    UNION ALL
    SELECT e.event_id AS moment_id FROM public.event_moment_participations e
  ) going
  GROUP BY going.moment_id
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
GRANT EXECUTE ON FUNCTION public.moment_going_count(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.aftrhrs_attach_guest_to_moment(text, text, text, text, text, uuid) TO service_role;

COMMENT ON FUNCTION public.moment_going_count(uuid) IS
  'Account joiners, guest RSVPs, and AftrHrs event participations that count as going.';

NOTIFY pgrst, 'reload schema';
