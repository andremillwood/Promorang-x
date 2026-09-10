-- Encore is a biweekly Friday series at Fiction, starting 11 Sep 2026.
-- Keep the old Wednesday slug resolvable via title/id; the public slug is now `encore`.

UPDATE public.moments
SET
  title = 'Encore',
  slug = CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM public.moments other
      WHERE other.slug = 'encore' AND other.id <> moments.id
    ) THEN 'encore'
    ELSE slug
  END,
  description = 'A room built for crews and tastemakers. Unlock priority entry, secret table dividends, signature bottle service perks, and meet the people worth knowing. Every other Friday at Fiction.',
  starts_at = '2026-09-11 20:00:00-05',
  ends_at = '2026-09-12 02:00:00-05',
  recurrence_enabled = true,
  recurrence_frequency = 'weekly',
  recurrence_interval = 2,
  recurrence_by_weekday = ARRAY[5]::smallint[],
  recurrence_timezone = 'America/Jamaica',
  recurrence_until = NULL,
  recurrence_count = NULL,
  series_key = COALESCE(series_key, 'encore'),
  updated_at = now()
WHERE id = '00000000-0000-0000-0002-000000000002'
   OR slug IN ('encore', 'encore-wednesday-social-vip')
   OR (
     title ILIKE '%Encore%'
     AND title NOT ILIKE '%Capleton%'
     AND title NOT ILIKE '%Encore Live%'
     AND COALESCE(slug, '') NOT ILIKE '%capleton%'
     AND COALESCE(slug, '') NOT ILIKE '%encore-live%'
   );

UPDATE public.presents_experiences
SET
  metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{day}', '"Friday"'),
  updated_at = now()
WHERE event_name = 'Encore'
   OR slug IN ('encore-secret-table', 'encore-fast-lane');
