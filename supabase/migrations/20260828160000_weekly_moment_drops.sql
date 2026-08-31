-- Weekly Moment announcements with a 90-day calendar lead window.
-- Cultural calendar rows stay queued until their date is within 90 days,
-- then publish as platform Moments and land in that Monday's drop.

CREATE TABLE IF NOT EXISTS public.cultural_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'arts',
  city text,
  country text NOT NULL DEFAULT 'Jamaica',
  location text,
  venue_name text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  source_name text NOT NULL,
  source_url text,
  attribution_text text,
  schedule_precision text NOT NULL DEFAULT 'exact'
    CHECK (schedule_precision IN ('exact', 'day', 'weekend', 'month', 'season')),
  image_url text,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'published', 'skipped', 'expired')),
  published_moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cultural_calendar_starts
  ON public.cultural_calendar_events (starts_at, status);

CREATE TABLE IF NOT EXISTS public.weekly_moment_drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  horizon_ends_on date NOT NULL,
  title text NOT NULL,
  announcement text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  published_count integer NOT NULL DEFAULT 0,
  announced_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.weekly_moment_drop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES public.weekly_moment_drops(id) ON DELETE CASCADE,
  moment_id uuid NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  calendar_event_id uuid REFERENCES public.cultural_calendar_events(id) ON DELETE SET NULL,
  role text NOT NULL CHECK (role IN ('new_this_week', 'horizon')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (drop_id, moment_id)
);

CREATE INDEX IF NOT EXISTS idx_weekly_moment_drop_items_drop
  ON public.weekly_moment_drop_items (drop_id, role);

ALTER TABLE public.cultural_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_moment_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_moment_drop_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.cultural_calendar_events FROM anon, authenticated;
REVOKE ALL ON public.weekly_moment_drops FROM anon, authenticated;
REVOKE ALL ON public.weekly_moment_drop_items FROM anon, authenticated;
GRANT ALL ON public.cultural_calendar_events TO service_role;
GRANT ALL ON public.weekly_moment_drops TO service_role;
GRANT ALL ON public.weekly_moment_drop_items TO service_role;

CREATE OR REPLACE FUNCTION public.publish_cultural_calendar_event(p_event_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event public.cultural_calendar_events%ROWTYPE;
  moment_id uuid;
  slug_value text;
BEGIN
  SELECT * INTO event FROM public.cultural_calendar_events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cultural calendar event not found';
  END IF;
  IF event.status = 'published' AND event.published_moment_id IS NOT NULL THEN
    RETURN event.published_moment_id;
  END IF;
  IF event.starts_at < now() - interval '12 hours' THEN
    UPDATE public.cultural_calendar_events
    SET status = 'expired', updated_at = now()
    WHERE id = event.id;
    RAISE EXCEPTION 'Cannot publish an expired calendar event';
  END IF;

  slug_value := concat(public.slugify(event.event_key), '-', left(event.id::text, 8));

  INSERT INTO public.moments (
    title, slug, description, category, location, venue_name, city, country,
    starts_at, ends_at, is_active, status, visibility, content_origin,
    image_url, external_source_url, external_attribution, external_last_checked_at,
    ownership_status, schedule_precision, seo_title, seo_description
  ) VALUES (
    event.title,
    slug_value,
    event.description,
    event.category,
    COALESCE(event.location, concat_ws(', ', event.venue_name, event.city, event.country)),
    event.venue_name,
    event.city,
    event.country,
    event.starts_at,
    event.ends_at,
    true,
    'scheduled',
    'open',
    'platform_seed',
    event.image_url,
    event.source_url,
    COALESCE(event.attribution_text, 'Source: ' || event.source_name),
    now(),
    'unclaimed',
    event.schedule_precision,
    event.title,
    left(event.description, 155)
  )
  RETURNING id INTO moment_id;

  UPDATE public.cultural_calendar_events
  SET status = 'published', published_moment_id = moment_id, updated_at = now()
  WHERE id = event.id;

  RETURN moment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_cultural_calendar_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_cultural_calendar_event(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.run_weekly_moment_drop(p_as_of timestamptz DEFAULT now())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  as_of timestamptz := COALESCE(p_as_of, now());
  week_start date := (date_trunc('week', as_of AT TIME ZONE 'America/Jamaica'))::date;
  horizon_end date := ((as_of AT TIME ZONE 'America/Jamaica')::date + 90);
  drop_id uuid;
  event_row public.cultural_calendar_events%ROWTYPE;
  published_ids uuid[] := '{}';
  new_count integer := 0;
  horizon_count integer := 0;
  announcement text;
BEGIN
  INSERT INTO public.weekly_moment_drops (
    week_start, horizon_ends_on, title, announcement, status
  ) VALUES (
    week_start,
    horizon_end,
    'This week on Promorang',
    '',
    'published'
  )
  ON CONFLICT (week_start) DO UPDATE
    SET horizon_ends_on = EXCLUDED.horizon_ends_on, updated_at = now()
  RETURNING id INTO drop_id;

  FOR event_row IN
    SELECT * FROM public.cultural_calendar_events
    WHERE status = 'queued'
      AND starts_at >= as_of - interval '12 hours'
      AND starts_at < as_of + interval '90 days'
    ORDER BY starts_at
  LOOP
    BEGIN
      published_ids := published_ids || public.publish_cultural_calendar_event(event_row.id);
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.cultural_calendar_events
      SET status = CASE WHEN event_row.starts_at < as_of - interval '12 hours' THEN 'expired' ELSE status END,
          updated_at = now()
      WHERE id = event_row.id;
    END;
  END LOOP;

  DELETE FROM public.weekly_moment_drop_items WHERE drop_id = drop_id;

  INSERT INTO public.weekly_moment_drop_items (drop_id, moment_id, calendar_event_id, role)
  SELECT drop_id, calendar.published_moment_id, calendar.id, 'new_this_week'
  FROM public.cultural_calendar_events calendar
  WHERE calendar.published_moment_id IS NOT NULL
    AND calendar.updated_at >= week_start::timestamptz
    AND calendar.starts_at >= as_of - interval '12 hours'
    AND calendar.starts_at < as_of + interval '90 days';

  INSERT INTO public.weekly_moment_drop_items (drop_id, moment_id, calendar_event_id, role)
  SELECT drop_id, moment.id, calendar.id, 'new_this_week'
  FROM public.moments moment
  LEFT JOIN public.cultural_calendar_events calendar ON calendar.published_moment_id = moment.id
  WHERE moment.is_active = true
    AND moment.visibility = 'open'
    AND moment.status IN ('scheduled', 'joinable', 'active')
    AND moment.content_origin IN ('stakeholder_created', 'imported', 'platform_seed')
    AND moment.created_at >= week_start::timestamptz
    AND moment.starts_at >= as_of - interval '12 hours'
    AND moment.starts_at < as_of + interval '90 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.weekly_moment_drop_items item
      WHERE item.drop_id = drop_id AND item.moment_id = moment.id
    );

  GET DIAGNOSTICS new_count = ROW_COUNT;

  INSERT INTO public.weekly_moment_drop_items (drop_id, moment_id, calendar_event_id, role)
  SELECT drop_id, moment.id, calendar.id, 'horizon'
  FROM public.moments moment
  LEFT JOIN public.cultural_calendar_events calendar ON calendar.published_moment_id = moment.id
  WHERE moment.is_active = true
    AND moment.visibility = 'open'
    AND moment.status IN ('scheduled', 'joinable', 'active')
    AND moment.content_origin IN ('stakeholder_created', 'imported', 'platform_seed')
    AND moment.starts_at >= as_of
    AND moment.starts_at < as_of + interval '90 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.weekly_moment_drop_items item
      WHERE item.drop_id = drop_id AND item.moment_id = moment.id
    )
  ORDER BY moment.starts_at
  LIMIT 24;

  SELECT count(*) INTO new_count
  FROM public.weekly_moment_drop_items
  WHERE drop_id = drop_id AND role = 'new_this_week';

  SELECT count(*) INTO horizon_count
  FROM public.weekly_moment_drop_items
  WHERE drop_id = drop_id AND role = 'horizon';

  SELECT string_agg('• ' || moment.title || ' — ' || to_char(moment.starts_at AT TIME ZONE 'America/Jamaica', 'Dy Mon DD'), E'\n' ORDER BY moment.starts_at)
  INTO announcement
  FROM public.weekly_moment_drop_items item
  JOIN public.moments moment ON moment.id = item.moment_id
  WHERE item.drop_id = drop_id AND item.role = 'new_this_week';

  UPDATE public.weekly_moment_drops
  SET
    title = 'This week on Promorang',
    announcement = concat_ws(
      E'\n\n',
      'This week on Promorang (' || to_char(week_start, 'Mon DD') || ')',
      CASE
        WHEN new_count > 0 THEN 'Newly announced (' || new_count || '):' || E'\n' || COALESCE(announcement, '')
        ELSE 'No new Moments cleared this week. The 90-day calendar is still being filled.'
      END,
      CASE WHEN horizon_count > 0 THEN horizon_count || ' more dated events sit inside the 90-day planning window.' ELSE NULL END
    ),
    published_count = COALESCE(array_length(published_ids, 1), 0),
    announced_count = new_count,
    metadata = jsonb_build_object(
      'lead_days', 90,
      'horizon_count', horizon_count,
      'published_moment_ids', to_jsonb(published_ids)
    ),
    updated_at = now()
  WHERE id = drop_id;

  RETURN jsonb_build_object(
    'drop_id', drop_id,
    'week_start', week_start,
    'horizon_ends_on', horizon_end,
    'published_count', COALESCE(array_length(published_ids, 1), 0),
    'new_this_week', new_count,
    'horizon_count', horizon_count
  );
END;
$$;

REVOKE ALL ON FUNCTION public.run_weekly_moment_drop(timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.run_weekly_moment_drop(timestamptz) TO service_role;

-- Official and dated Jamaica events inside the first 90-day window (Aug 28–Nov 26, 2026).
INSERT INTO public.cultural_calendar_events (
  event_key, title, description, category, city, country, location, venue_name,
  starts_at, ends_at, source_name, source_url, attribution_text, schedule_precision, image_url
) VALUES
(
  'amalgamation-global-gala-2026-08-28',
  'Amalgamation – The Global Gala',
  'A Kingston night of performance and gathering at the Little Theatre, listed on the Visit Jamaica events calendar.',
  'arts',
  'Kingston',
  'Jamaica',
  'Little Theatre, Kingston',
  'Little Theatre',
  timestamp '2026-08-28 19:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-08-28 22:30:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/experiences/events/',
  'Source: Visit Jamaica',
  'exact',
  'https://images.unsplash.com/photo-1507676184212-b9cd4d47e1ee?auto=format&fit=crop&q=80&w=1200'
),
(
  'lovers-leap-lighthouse-2026-08-29',
  'Lover''s Leap Lighthouse Series',
  'A South Coast lighthouse gathering listed on the Visit Jamaica events calendar.',
  'outdoor',
  'St. Elizabeth',
  'Jamaica',
  'Lover''s Leap, St. Elizabeth',
  'Lover''s Leap Lighthouse',
  timestamp '2026-08-29 18:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-08-29 21:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/experiences/events/',
  'Source: Visit Jamaica',
  'day',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'
),
(
  'mobay-creative-arts-2026-08-30',
  'Montego Bay Creative Arts Festival',
  'Kingston Creative''s western Jamaica arts festival. The next staging is Sunday, August 30, 2026.',
  'arts',
  'Montego Bay',
  'Jamaica',
  'Montego Bay, St. James',
  'Montego Bay Creative Arts Festival',
  timestamp '2026-08-30 11:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-08-30 18:00:00' AT TIME ZONE 'America/Jamaica',
  'Kingston Creative',
  'https://kingstoncreative.org/artwalk/',
  'Source: Kingston Creative',
  'exact',
  'https://images.unsplash.com/photo-1460661419201-b3d27177ab4f?auto=format&fit=crop&q=80&w=1200'
),
(
  'mbj-team-sangster-run-2026-09-06',
  'MBJ Team Sangster Charity Run/Walk for Education',
  'A Montego Bay charity run and walk for education, listed on the Visit Jamaica events calendar.',
  'fitness',
  'Montego Bay',
  'Jamaica',
  'Sangster International Airport area, Montego Bay',
  'MBJ Team Sangster',
  timestamp '2026-09-06 06:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-09-06 11:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/experiences/events/',
  'Source: Visit Jamaica',
  'exact',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=1200'
),
(
  'jamaica-bridal-expo-2026-09-13',
  'Jamaica Bridal Expo',
  'A Kingston bridal and wedding showcase listed on the Visit Jamaica events calendar.',
  'social',
  'Kingston',
  'Jamaica',
  'Kingston, Jamaica',
  'Jamaica Bridal Expo',
  timestamp '2026-09-13 10:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-09-13 18:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/experiences/events/',
  'Source: Visit Jamaica',
  'day',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200'
),
(
  'kingston-creative-artwalk-2026-09-27',
  'Kingston Creative Artwalk — September',
  'Downtown Kingston''s public arts festival on Water Lane and Church Street. Jamaica Tourist Board lists Artwalk on the last Sunday of each month.',
  'arts',
  'Kingston',
  'Jamaica',
  'Water Lane and Church Street, Downtown Kingston',
  'Kingston Creative Artwalk',
  timestamp '2026-09-27 11:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-09-27 18:00:00' AT TIME ZONE 'America/Jamaica',
  'Kingston Creative',
  'https://kingstoncreative.org/artwalk/',
  'Source: Kingston Creative / Visit Jamaica',
  'day',
  'https://images.unsplash.com/photo-1460661419201-b3d27177ab4f?auto=format&fit=crop&q=80&w=1200'
),
(
  'kingston-creative-artwalk-2026-10-25',
  'Kingston Creative Artwalk — October',
  'Downtown Kingston''s public arts festival on Water Lane and Church Street, last Sunday of the month.',
  'arts',
  'Kingston',
  'Jamaica',
  'Water Lane and Church Street, Downtown Kingston',
  'Kingston Creative Artwalk',
  timestamp '2026-10-25 11:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-10-25 18:00:00' AT TIME ZONE 'America/Jamaica',
  'Kingston Creative',
  'https://kingstoncreative.org/artwalk/',
  'Source: Kingston Creative / Visit Jamaica',
  'day',
  'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&q=80&w=1200'
),
(
  'national-heroes-day-2026-10-19',
  'National Heroes Day',
  'Jamaica''s public holiday on the third Monday in October. Observances gather at National Heroes Park and across parishes.',
  'arts',
  'Kingston',
  'Jamaica',
  'National Heroes Park, Kingston',
  'National Heroes Park',
  timestamp '2026-10-19 09:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-10-19 16:00:00' AT TIME ZONE 'America/Jamaica',
  'Government of Jamaica',
  'https://www.visitjamaica.com/experiences/events/events-calendar/',
  'Source: Jamaica public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=1200'
),
(
  'heroes-weekend-2026-10-17',
  'Heroes Weekend',
  'Visit Jamaica notes that Heroes Weekend fills Kingston and the island with holiday gatherings across the three-day weekend.',
  'music',
  'Kingston',
  'Jamaica',
  'Kingston and island-wide',
  'Heroes Weekend',
  timestamp '2026-10-17 18:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-10-19 23:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/experiences/events/events-calendar/',
  'Source: Visit Jamaica',
  'weekend',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200'
),
(
  'kingston-creative-artwalk-2026-11-29',
  'Kingston Creative Artwalk — November',
  'Downtown Kingston''s public arts festival on Water Lane and Church Street, last Sunday of the month.',
  'arts',
  'Kingston',
  'Jamaica',
  'Water Lane and Church Street, Downtown Kingston',
  'Kingston Creative Artwalk',
  timestamp '2026-11-29 11:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-11-29 18:00:00' AT TIME ZONE 'America/Jamaica',
  'Kingston Creative',
  'https://kingstoncreative.org/artwalk/',
  'Source: Kingston Creative / Visit Jamaica',
  'day',
  'https://images.unsplash.com/photo-1460661419201-b3d27177ab4f?auto=format&fit=crop&q=80&w=1200'
),
(
  'treasure-beach-food-rum-reggae-2026-11-06',
  'Treasure Beach Food, Rum & Reggae Festival',
  'A South Coast food, rum, and reggae weekend listed on the Visit Jamaica events calendar for November 6.',
  'food',
  'Treasure Beach',
  'Jamaica',
  'Treasure Beach, St. Elizabeth',
  'Treasure Beach',
  timestamp '2026-11-06 12:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-11-08 23:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/experiences/events/',
  'Source: Visit Jamaica',
  'weekend',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200'
),
(
  'jamaica-restaurant-week-2026-11',
  'Jamaica Restaurant Week',
  'Visit Jamaica lists Restaurant Week every November as an island-wide restaurant-hopping window.',
  'food',
  'Kingston',
  'Jamaica',
  'Island-wide, Jamaica',
  'Jamaica Restaurant Week',
  timestamp '2026-11-01 12:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-11-30 22:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/experiences/events/events-calendar/',
  'Source: Visit Jamaica',
  'month',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200'
)
ON CONFLICT (event_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  source_url = EXCLUDED.source_url,
  attribution_text = EXCLUDED.attribution_text,
  updated_at = now();

-- Show official and platform-dated Moments in public discovery. Keep demo/scraped out.
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
WHERE m.content_origin IN ('stakeholder_created', 'imported', 'platform_seed')
  AND m.is_active = true
GROUP BY
  m.id, m.slug, m.title, m.description, m.seo_title, m.seo_description,
  m.category, m.city, vp.city, m.country, vp.country, m.location, vp.location,
  m.venue_id, m.venue_name, vp.name, vp.slug, m.image_url, m.starts_at,
  m.ends_at, m.reward, m.host_id, m.is_active, pc.participant_count,
  m.latitude, m.longitude;

CREATE OR REPLACE VIEW public.view_public_weekly_moment_drops AS
SELECT id, week_start, horizon_ends_on, title, announcement, published_count, announced_count, created_at
FROM public.weekly_moment_drops
WHERE status = 'published';

CREATE OR REPLACE VIEW public.view_public_weekly_moment_drop_items AS
SELECT
  item.id,
  item.drop_id,
  item.role,
  drop.week_start,
  drop.horizon_ends_on,
  drop.title AS drop_title,
  drop.announcement,
  moment.id AS moment_id,
  moment.slug,
  moment.title,
  moment.description,
  moment.category,
  moment.city,
  moment.country,
  moment.location,
  moment.venue_name,
  moment.starts_at,
  moment.ends_at,
  moment.image_url
FROM public.weekly_moment_drop_items item
JOIN public.weekly_moment_drops drop ON drop.id = item.drop_id
JOIN public.moments moment ON moment.id = item.moment_id
WHERE drop.status = 'published'
  AND moment.is_active = true;

GRANT SELECT ON public.view_public_weekly_moment_drops TO anon, authenticated;
GRANT SELECT ON public.view_public_weekly_moment_drop_items TO anon, authenticated;
GRANT SELECT ON public.view_public_moment_directory TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
