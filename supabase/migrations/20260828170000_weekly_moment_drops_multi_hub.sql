-- Scope the weekly Moment catalog to every live and pilot hub, not Jamaica only.

ALTER TABLE public.cultural_calendar_events
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_slug text,
  ADD COLUMN IF NOT EXISTS city_slug text,
  ADD COLUMN IF NOT EXISTS hub_id text,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Jamaica';

UPDATE public.cultural_calendar_events
SET
  country_code = 'JM',
  country_slug = 'jamaica',
  timezone = 'America/Jamaica',
  city_slug = CASE
    WHEN event_key LIKE 'mobay-%' OR event_key LIKE 'mbj-%' THEN 'montego-bay'
    WHEN event_key LIKE 'lovers-leap-%' OR event_key LIKE 'treasure-beach-%' THEN 'treasure-beach'
    ELSE 'kingston'
  END,
  hub_id = CASE
    WHEN event_key LIKE 'mobay-%' OR event_key LIKE 'mbj-%' THEN 'montego-bay'
    WHEN event_key LIKE 'lovers-leap-%' OR event_key LIKE 'treasure-beach-%' THEN 'treasure-beach'
    ELSE 'kingston'
  END
WHERE country_code IS NULL OR city_slug IS NULL OR hub_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_cultural_calendar_market
  ON public.cultural_calendar_events (country_code, city_slug, starts_at);

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
    title, slug, description, category, location, venue_name, city, country, country_code,
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
    event.country_code,
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
  moment.country_code,
  public.slugify(moment.city) AS city_slug,
  public.slugify(moment.country) AS country_slug,
  calendar.hub_id,
  moment.location,
  moment.venue_name,
  moment.starts_at,
  moment.ends_at,
  moment.image_url
FROM public.weekly_moment_drop_items item
JOIN public.weekly_moment_drops drop ON drop.id = item.drop_id
JOIN public.moments moment ON moment.id = item.moment_id
LEFT JOIN public.cultural_calendar_events calendar ON calendar.id = item.calendar_event_id
WHERE drop.status = 'published'
  AND moment.is_active = true;

GRANT SELECT ON public.view_public_weekly_moment_drop_items TO anon, authenticated;

-- Official dated events for live and pilot hubs inside or just beyond the first 90-day window.
INSERT INTO public.cultural_calendar_events (
  event_key, title, description, category, city, country, country_code, country_slug, city_slug, hub_id,
  timezone, location, venue_name, starts_at, ends_at, source_name, source_url, attribution_text, schedule_precision, image_url
) VALUES
(
  'tt-independence-day-2026-08-31',
  'Trinidad & Tobago Independence Day',
  'National holiday marking independence from Britain on 31 August 1962. The official parade gathers at the Queen''s Park Savannah in Port of Spain.',
  'arts',
  'Port of Spain',
  'Trinidad & Tobago',
  'TT',
  'trinidad-and-tobago',
  'port-of-spain',
  'trinidad',
  'America/Port_of_Spain',
  'Queen''s Park Savannah, Port of Spain',
  'Queen''s Park Savannah',
  timestamp '2026-08-31 09:00:00' AT TIME ZONE 'America/Port_of_Spain',
  timestamp '2026-08-31 16:00:00' AT TIME ZONE 'America/Port_of_Spain',
  'Office of the President of Trinidad and Tobago',
  'https://otp.tt/trinidad-and-tobago/national-holidays-and-awards/',
  'Source: Office of the President of Trinidad and Tobago',
  'day',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1200'
),
(
  'tt-republic-day-2026-09-24',
  'Trinidad & Tobago Republic Day',
  'National holiday observed on 24 September, marking the first sitting of Parliament under the republican constitution.',
  'arts',
  'Port of Spain',
  'Trinidad & Tobago',
  'TT',
  'trinidad-and-tobago',
  'port-of-spain',
  'trinidad',
  'America/Port_of_Spain',
  'Port of Spain, Trinidad & Tobago',
  'Port of Spain',
  timestamp '2026-09-24 09:00:00' AT TIME ZONE 'America/Port_of_Spain',
  timestamp '2026-09-24 16:00:00' AT TIME ZONE 'America/Port_of_Spain',
  'Office of the President of Trinidad and Tobago',
  'https://otp.tt/trinidad-and-tobago/national-holidays-and-awards/',
  'Source: Office of the President of Trinidad and Tobago',
  'day',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1200'
),
(
  'tt-divali-2026-11-08',
  'Divali',
  'Trinidad & Tobago public holiday for Divali, the festival of lights.',
  'arts',
  'Port of Spain',
  'Trinidad & Tobago',
  'TT',
  'trinidad-and-tobago',
  'port-of-spain',
  'trinidad',
  'America/Port_of_Spain',
  'Port of Spain and island-wide',
  'Divali',
  timestamp '2026-11-08 18:00:00' AT TIME ZONE 'America/Port_of_Spain',
  timestamp '2026-11-08 23:00:00' AT TIME ZONE 'America/Port_of_Spain',
  'Office of the President of Trinidad and Tobago',
  'https://otp.tt/trinidad-and-tobago/national-holidays-and-awards/',
  'Source: Office of the President of Trinidad and Tobago',
  'day',
  'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?auto=format&fit=crop&q=80&w=1200'
),
(
  'bb-independence-day-2026-11-30',
  'Barbados Independence Day',
  'National holiday marking independence from Britain on 30 November 1966. Queued until it enters the 90-day window.',
  'arts',
  'Bridgetown',
  'Barbados',
  'BB',
  'barbados',
  'bridgetown',
  'barbados',
  'America/Barbados',
  'Bridgetown, Barbados',
  'National Heroes Square',
  timestamp '2026-11-30 09:00:00' AT TIME ZONE 'America/Barbados',
  timestamp '2026-11-30 16:00:00' AT TIME ZONE 'America/Barbados',
  'Visit Barbados',
  'https://www.visitbarbados.org/events',
  'Source: Visit Barbados / Barbados public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200'
),
(
  'bs-national-heroes-day-2026-10-12',
  'Bahamas National Heroes Day',
  'Public holiday on the second Monday in October, honouring Bahamians who shaped the nation.',
  'arts',
  'Nassau',
  'The Bahamas',
  'BS',
  'the-bahamas',
  'nassau',
  'bahamas',
  'America/Nassau',
  'Nassau, New Providence',
  'Nassau',
  timestamp '2026-10-12 09:00:00' AT TIME ZONE 'America/Nassau',
  timestamp '2026-10-12 16:00:00' AT TIME ZONE 'America/Nassau',
  'Bahamas Ministry of Tourism',
  'https://www.bahamas.com/events',
  'Source: Bahamas public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&q=80&w=1200'
),
(
  'gy-divali-2026-11-08',
  'Guyana Divali',
  'Guyana public holiday for Divali, the festival of lights.',
  'arts',
  'Georgetown',
  'Guyana',
  'GY',
  'guyana',
  'georgetown',
  'guyana',
  'America/Guyana',
  'Georgetown, Guyana',
  'Georgetown',
  timestamp '2026-11-08 18:00:00' AT TIME ZONE 'America/Guyana',
  timestamp '2026-11-08 23:00:00' AT TIME ZONE 'America/Guyana',
  'Guyana Tourism Authority',
  'https://guyanatourism.com/',
  'Source: Guyana public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?auto=format&fit=crop&q=80&w=1200'
),
(
  'gh-founders-day-2026-09-21',
  'Ghana Founders'' Day',
  'National holiday on 21 September honouring the founders of Ghana, with Accra ceremonies and public gatherings.',
  'arts',
  'Accra',
  'Ghana',
  'GH',
  'ghana',
  'accra',
  'accra',
  'Africa/Accra',
  'Accra, Greater Accra',
  'Independence Square',
  timestamp '2026-09-21 09:00:00' AT TIME ZONE 'Africa/Accra',
  timestamp '2026-09-21 16:00:00' AT TIME ZONE 'Africa/Accra',
  'Ghana Tourism Authority',
  'https://visitghana.com/',
  'Source: Ghana public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?auto=format&fit=crop&q=80&w=1200'
),
(
  'do-mercedes-2026-09-24',
  'Día de las Mercedes',
  'Dominican public holiday honouring Our Lady of Mercedes, observed across Santo Domingo.',
  'arts',
  'Santo Domingo',
  'Dominican Republic',
  'DO',
  'dominican-republic',
  'santo-domingo',
  'dominican-republic',
  'America/Santo_Domingo',
  'Santo Domingo, Dominican Republic',
  'Santo Domingo',
  timestamp '2026-09-24 09:00:00' AT TIME ZONE 'America/Santo_Domingo',
  timestamp '2026-09-24 16:00:00' AT TIME ZONE 'America/Santo_Domingo',
  'Go Dominican Republic',
  'https://www.godominicanrepublic.com/',
  'Source: Dominican Republic public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&q=80&w=1200'
),
(
  'do-constitution-day-2026-11-06',
  'Dominican Constitution Day',
  'National holiday marking the Dominican constitution, observed in Santo Domingo and across the country.',
  'arts',
  'Santo Domingo',
  'Dominican Republic',
  'DO',
  'dominican-republic',
  'santo-domingo',
  'dominican-republic',
  'America/Santo_Domingo',
  'Santo Domingo, Dominican Republic',
  'Santo Domingo',
  timestamp '2026-11-06 09:00:00' AT TIME ZONE 'America/Santo_Domingo',
  timestamp '2026-11-06 16:00:00' AT TIME ZONE 'America/Santo_Domingo',
  'Go Dominican Republic',
  'https://www.godominicanrepublic.com/',
  'Source: Dominican Republic public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=1200'
),
(
  'co-dia-de-la-raza-2026-10-12',
  'Día de la Raza',
  'Colombian public holiday on 12 October, observed in Bogotá and across the country.',
  'arts',
  'Bogotá',
  'Colombia',
  'CO',
  'colombia',
  'bogota',
  'bogota',
  'America/Bogota',
  'Bogotá, Colombia',
  'Bogotá',
  timestamp '2026-10-12 09:00:00' AT TIME ZONE 'America/Bogota',
  timestamp '2026-10-12 16:00:00' AT TIME ZONE 'America/Bogota',
  'ProColombia',
  'https://colombia.travel/en/events',
  'Source: Colombia public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1531765408077-9a1faf6e1b1d?auto=format&fit=crop&q=80&w=1200'
),
(
  'co-all-saints-medellin-2026-11-01',
  'Día de Todos los Santos',
  'Colombian public holiday on 1 November, observed in Medellín and nationwide.',
  'arts',
  'Medellín',
  'Colombia',
  'CO',
  'colombia',
  'medellin',
  'medellin',
  'America/Bogota',
  'Medellín, Antioquia',
  'Medellín',
  timestamp '2026-11-01 09:00:00' AT TIME ZONE 'America/Bogota',
  timestamp '2026-11-01 16:00:00' AT TIME ZONE 'America/Bogota',
  'ProColombia',
  'https://colombia.travel/en/events',
  'Source: Colombia public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200'
),
(
  'pa-separation-day-2026-11-03',
  'Panama Separation Day',
  'National holiday on 3 November marking Panama''s separation from Colombia, with parades in Panama City.',
  'arts',
  'Panama City',
  'Panama',
  'PA',
  'panama',
  'panama-city',
  'panama-city',
  'America/Panama',
  'Panama City, Panama',
  'Casco Viejo',
  timestamp '2026-11-03 09:00:00' AT TIME ZONE 'America/Panama',
  timestamp '2026-11-03 16:00:00' AT TIME ZONE 'America/Panama',
  'Visit Panama',
  'https://www.visitpanama.com/',
  'Source: Panama public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1200'
),
(
  'pa-independence-day-2026-11-28',
  'Panama Independence Day',
  'National holiday marking independence from Spain on 28 November. Queued until it enters the 90-day window.',
  'arts',
  'Panama City',
  'Panama',
  'PA',
  'panama',
  'panama-city',
  'panama-city',
  'America/Panama',
  'Panama City, Panama',
  'Panama City',
  timestamp '2026-11-28 09:00:00' AT TIME ZONE 'America/Panama',
  timestamp '2026-11-28 16:00:00' AT TIME ZONE 'America/Panama',
  'Visit Panama',
  'https://www.visitpanama.com/',
  'Source: Panama public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200'
)
ON CONFLICT (event_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  country_code = EXCLUDED.country_code,
  country_slug = EXCLUDED.country_slug,
  city_slug = EXCLUDED.city_slug,
  hub_id = EXCLUDED.hub_id,
  timezone = EXCLUDED.timezone,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  source_url = EXCLUDED.source_url,
  updated_at = now();

NOTIFY pgrst, 'reload schema';
