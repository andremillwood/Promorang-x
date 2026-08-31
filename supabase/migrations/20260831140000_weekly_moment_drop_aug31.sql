-- Monday 31 Aug 2026 weekly Moments catalog: new official dates inside
-- today → +90 days (horizon 29 Nov 2026), plus queued December listings.

INSERT INTO public.cultural_calendar_events (
  event_key, title, description, category, city, country, country_code, country_slug, city_slug, hub_id,
  timezone, location, venue_name, starts_at, ends_at, source_name, source_url, attribution_text, schedule_precision, image_url
) VALUES
(
  'women-with-a-purpose-5k-2026-10-18',
  'Women With a Purpose Breast Cancer 5K Run/Walk',
  'JK Breast Cancer Foundation''s annual 5K run/walk and breakfast party in Treasure Beach, listed on the Visit Jamaica events calendar for 18 October 2026.',
  'fitness',
  'Treasure Beach',
  'Jamaica',
  'JM',
  'jamaica',
  'treasure-beach',
  'treasure-beach',
  'America/Jamaica',
  'Treasure Beach, St. Elizabeth',
  'Treasure Beach',
  timestamp '2026-10-18 06:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-10-18 12:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/experiences/events/',
  'Source: Visit Jamaica',
  'day',
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200'
),
(
  'jamaica-pro-am-annies-revenge-2026-11-18',
  'Jamaica Pro Am ‘Annie’s Revenge’ Golf Invitational',
  'Montego Bay pro-am golf invitational hosted around Half Moon, White Witch, and Cinnamon Hill, listed by Visit Jamaica for 18–22 November 2026.',
  'outdoor',
  'Montego Bay',
  'Jamaica',
  'JM',
  'jamaica',
  'montego-bay',
  'montego-bay',
  'America/Jamaica',
  'Half Moon, Montego Bay',
  'Half Moon',
  timestamp '2026-11-18 08:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-11-22 18:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/blog/post/events-happening-in-jamaica/',
  'Source: Visit Jamaica / Jamaica Pro Am',
  'weekend',
  'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200'
),
(
  'mouttet-mile-2026-12-05',
  'Mouttet Mile',
  'Caymanas Park''s one-mile race day, listed on the Visit Jamaica 2026 events blog for 5 December. Queued until it enters the 90-day window.',
  'outdoor',
  'Caymanas',
  'Jamaica',
  'JM',
  'jamaica',
  'kingston',
  'kingston',
  'America/Jamaica',
  'Caymanas Park, St. Catherine',
  'Caymanas Park',
  timestamp '2026-12-05 12:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-12-05 18:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/blog/post/events-happening-in-jamaica/',
  'Source: Visit Jamaica',
  'day',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200'
),
(
  'reggae-marathon-2026-12-06',
  'Reggae Marathon',
  'Jamaica''s international marathon, half marathon, 10K and 5K, listed on the Visit Jamaica 2026 events blog for 6 December in Kingston. Queued until it enters the 90-day window.',
  'fitness',
  'Kingston',
  'Jamaica',
  'JM',
  'jamaica',
  'kingston',
  'kingston',
  'America/Jamaica',
  'Kingston, Jamaica',
  'Reggae Marathon',
  timestamp '2026-12-06 05:00:00' AT TIME ZONE 'America/Jamaica',
  timestamp '2026-12-06 14:00:00' AT TIME ZONE 'America/Jamaica',
  'Visit Jamaica',
  'https://www.visitjamaica.com/blog/post/events-happening-in-jamaica/',
  'Source: Visit Jamaica',
  'day',
  'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=1200'
),
(
  'pa-colon-day-2026-11-05',
  'Panama Colón Day',
  'National holiday on 5 November marking Colón''s role in the 1903 independence movement, observed in Panama City and Colón.',
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
  timestamp '2026-11-05 09:00:00' AT TIME ZONE 'America/Panama',
  timestamp '2026-11-05 16:00:00' AT TIME ZONE 'America/Panama',
  'Visit Panama',
  'https://www.visitpanama.com/',
  'Source: Panama public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'
),
(
  'pa-los-santos-2026-11-10',
  'Los Santos Uprising Day',
  'National holiday on 10 November commemorating the 1821 uprising in Los Santos that began Panama''s independence from Spain.',
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
  timestamp '2026-11-10 09:00:00' AT TIME ZONE 'America/Panama',
  timestamp '2026-11-10 16:00:00' AT TIME ZONE 'America/Panama',
  'Visit Panama',
  'https://www.visitpanama.com/',
  'Source: Panama public holiday calendar',
  'day',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200'
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
  attribution_text = EXCLUDED.attribution_text,
  updated_at = now();

UPDATE public.cultural_calendar_events
SET
  description = 'National holiday marking independence from Spain on 28 November, with observances in Panama City.',
  updated_at = now()
WHERE event_key = 'pa-independence-day-2026-11-28';

UPDATE public.cultural_calendar_events
SET
  description = 'Trinidad & Tobago public holiday for Divali, the festival of lights. The Office of the President announces the official date 1–2 weeks prior; 8 November is a commonly cited 2026 date, not an OTP decree.',
  updated_at = now()
WHERE event_key = 'tt-divali-2026-11-08';

UPDATE public.cultural_calendar_events
SET
  description = 'Guyana public holiday for Divali, the festival of lights. The official date is announced close to the observance; 8 November is a commonly cited 2026 date.',
  updated_at = now()
WHERE event_key = 'gy-divali-2026-11-08';

UPDATE public.cultural_calendar_events
SET
  description = 'Downtown Kingston''s public arts festival on Water Lane and Church Street. Kingston Creative currently lists Artwalk on the last Sunday of every quarter; this October date follows an earlier Jamaica Tourist Board monthly flyer and is unverified against the 2026 Kingston Creative page.',
  updated_at = now()
WHERE event_key = 'kingston-creative-artwalk-2026-10-25';

UPDATE public.cultural_calendar_events
SET
  description = 'Downtown Kingston''s public arts festival on Water Lane and Church Street. Kingston Creative currently lists Artwalk on the last Sunday of every quarter (Q4 2026 would be 27 December); this November date follows an earlier Jamaica Tourist Board monthly flyer and is unverified against the 2026 Kingston Creative page.',
  updated_at = now()
WHERE event_key = 'kingston-creative-artwalk-2026-11-29';
