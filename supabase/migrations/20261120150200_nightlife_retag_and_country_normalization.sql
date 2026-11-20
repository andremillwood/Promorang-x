-- Nightlife retag and country normalization.
-- Capleton: id 00000000-0000-0000-0002-000000000052,
-- slug encore-live-featuring-capleton.
-- Live title is 'Encore Live featuring Capleton' (confirmed). Do not rewrite it.
-- The seed title differs; the match is the id plus that slug or a Capleton title.
-- Ladies Throwback: id 58fa8801-6f83-40e3-a80b-86d6a67fc1a7,
-- title kept exactly. Category only. Stays closed. Does not touch
-- event_editions, so prevent_retired_aftrhrs_edition is not tripped.
-- I Luv Hip Hop / ILHH is intentionally not updated. Pending Andre via Operations.

CREATE OR REPLACE FUNCTION public.normalize_place_country(
  p_country text,
  p_country_code text,
  p_city text
) RETURNS TABLE (country text, country_code text)
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  v_raw text := NULLIF(btrim(p_country), '');
  v_code text := NULLIF(upper(btrim(p_country_code)), '');
  v_key text;
  v_city text := lower(btrim(COALESCE(p_city, '')));
  v_name text;
  v_iso text;
BEGIN
  v_key := translate(
    lower(btrim(COALESCE(p_country, ''))),
    'áàâãäéèêëíìîïóòôõöúùûüçñ',
    'aaaaaeeeeiiiiooooouuuucn'
  );
  v_key := replace(v_key, '&', ' and ');
  v_key := btrim(regexp_replace(v_key, '[^a-z0-9]+', ' ', 'g'));
  v_key := btrim(regexp_replace(v_key, '\s+', ' ', 'g'));

  IF v_key IN ('jm', 'jamaica', 'jamaican') THEN
    v_name := 'Jamaica'; v_iso := 'JM';
  ELSIF v_key IN ('us', 'usa', 'u s', 'u s a', 'united states', 'united states of america') THEN
    v_name := 'United States'; v_iso := 'US';
  ELSIF v_key IN ('ky', 'cayman', 'cayman islands') THEN
    v_name := 'Cayman Islands'; v_iso := 'KY';
  ELSIF v_key IN ('bb', 'barbados') THEN
    v_name := 'Barbados'; v_iso := 'BB';
  ELSIF v_key IN ('tt', 'trinidad', 'trinidad and tobago', 'trinidad tobago') THEN
    v_name := 'Trinidad and Tobago'; v_iso := 'TT';
  ELSIF v_key IN ('gh', 'ghana') THEN
    v_name := 'Ghana'; v_iso := 'GH';
  ELSIF v_key IN ('ca', 'canada') THEN
    v_name := 'Canada'; v_iso := 'CA';
  ELSIF v_key IN ('gy', 'guyana') THEN
    v_name := 'Guyana'; v_iso := 'GY';
  ELSIF v_key IN ('gb', 'uk', 'united kingdom', 'great britain') THEN
    v_name := 'United Kingdom'; v_iso := 'GB';
  ELSIF v_key IN ('bs', 'bahamas', 'the bahamas') THEN
    v_name := 'The Bahamas'; v_iso := 'BS';
  ELSIF v_key IN ('ag', 'antigua', 'antigua and barbuda') THEN
    v_name := 'Antigua and Barbuda'; v_iso := 'AG';
  ELSIF v_key IN ('bz', 'belize') THEN
    v_name := 'Belize'; v_iso := 'BZ';
  ELSIF v_key IN ('dm', 'dominica') THEN
    v_name := 'Dominica'; v_iso := 'DM';
  ELSIF v_key IN ('gd', 'grenada') THEN
    v_name := 'Grenada'; v_iso := 'GD';
  ELSIF v_key IN ('kn', 'saint kitts', 'st kitts', 'saint kitts and nevis') THEN
    v_name := 'Saint Kitts and Nevis'; v_iso := 'KN';
  ELSIF v_key IN ('lc', 'saint lucia', 'st lucia') THEN
    v_name := 'Saint Lucia'; v_iso := 'LC';
  ELSIF v_key IN ('vc', 'saint vincent', 'st vincent', 'saint vincent and the grenadines') THEN
    v_name := 'Saint Vincent and the Grenadines'; v_iso := 'VC';
  ELSIF v_key IN ('cu', 'cuba') THEN
    v_name := 'Cuba'; v_iso := 'CU';
  ELSIF v_key IN ('ht', 'haiti') THEN
    v_name := 'Haiti'; v_iso := 'HT';
  ELSIF v_key IN ('sr', 'suriname') THEN
    v_name := 'Suriname'; v_iso := 'SR';
  ELSIF v_key IN ('pr', 'puerto rico') THEN
    v_name := 'Puerto Rico'; v_iso := 'PR';
  ELSIF v_key IN ('aw', 'aruba') THEN
    v_name := 'Aruba'; v_iso := 'AW';
  ELSIF v_key IN ('cw', 'curacao') THEN
    v_name := 'Curaçao'; v_iso := 'CW';
  ELSIF v_key IN ('sx', 'sint maarten', 'st maarten') THEN
    v_name := 'Sint Maarten'; v_iso := 'SX';
  ELSIF v_key IN ('vi', 'us virgin islands', 'u s virgin islands') THEN
    v_name := 'U.S. Virgin Islands'; v_iso := 'VI';
  ELSIF v_key IN ('vg', 'british virgin islands') THEN
    v_name := 'British Virgin Islands'; v_iso := 'VG';
  ELSIF v_key IN ('tc', 'turks and caicos', 'turks and caicos islands') THEN
    v_name := 'Turks and Caicos Islands'; v_iso := 'TC';
  ELSIF v_key IN ('ai', 'anguilla') THEN
    v_name := 'Anguilla'; v_iso := 'AI';
  ELSIF v_key IN ('ms', 'montserrat') THEN
    v_name := 'Montserrat'; v_iso := 'MS';
  ELSIF v_key IN ('bm', 'bermuda') THEN
    v_name := 'Bermuda'; v_iso := 'BM';
  ELSIF v_key IN ('gp', 'guadeloupe') THEN
    v_name := 'Guadeloupe'; v_iso := 'GP';
  ELSIF v_key IN ('mq', 'martinique') THEN
    v_name := 'Martinique'; v_iso := 'MQ';
  ELSIF v_key IN ('bq', 'caribbean netherlands') THEN
    v_name := 'Caribbean Netherlands'; v_iso := 'BQ';
  ELSIF v_key IN ('gf', 'french guiana') THEN
    v_name := 'French Guiana'; v_iso := 'GF';
  ELSIF v_key IN ('ng', 'nigeria') THEN
    v_name := 'Nigeria'; v_iso := 'NG';
  ELSIF v_key IN ('do', 'dominican republic') THEN
    v_name := 'Dominican Republic'; v_iso := 'DO';
  ELSIF v_key IN ('co', 'colombia') THEN
    v_name := 'Colombia'; v_iso := 'CO';
  ELSIF v_key IN ('br', 'brazil') THEN
    v_name := 'Brazil'; v_iso := 'BR';
  ELSIF v_key IN ('pa', 'panama') THEN
    v_name := 'Panama'; v_iso := 'PA';
  ELSIF v_key IN ('mx', 'mexico') THEN
    v_name := 'Mexico'; v_iso := 'MX';
  ELSIF v_key IN ('gt', 'guatemala') THEN
    v_name := 'Guatemala'; v_iso := 'GT';
  ELSIF v_key IN ('hn', 'honduras') THEN
    v_name := 'Honduras'; v_iso := 'HN';
  ELSIF v_key IN ('sv', 'el salvador') THEN
    v_name := 'El Salvador'; v_iso := 'SV';
  ELSIF v_key IN ('ni', 'nicaragua') THEN
    v_name := 'Nicaragua'; v_iso := 'NI';
  ELSIF v_key IN ('cr', 'costa rica') THEN
    v_name := 'Costa Rica'; v_iso := 'CR';
  ELSIF v_key IN ('ar', 'argentina') THEN
    v_name := 'Argentina'; v_iso := 'AR';
  ELSIF v_key IN ('bo', 'bolivia') THEN
    v_name := 'Bolivia'; v_iso := 'BO';
  ELSIF v_key IN ('cl', 'chile') THEN
    v_name := 'Chile'; v_iso := 'CL';
  ELSIF v_key IN ('ec', 'ecuador') THEN
    v_name := 'Ecuador'; v_iso := 'EC';
  ELSIF v_key IN ('py', 'paraguay') THEN
    v_name := 'Paraguay'; v_iso := 'PY';
  ELSIF v_key IN ('pe', 'peru') THEN
    v_name := 'Peru'; v_iso := 'PE';
  ELSIF v_key IN ('uy', 'uruguay') THEN
    v_name := 'Uruguay'; v_iso := 'UY';
  ELSIF v_key IN ('ve', 'venezuela') THEN
    v_name := 'Venezuela'; v_iso := 'VE';
  ELSIF (v_raw IS NULL OR v_key = lower(v_code)) AND v_code IN (
    'JM','US','KY','BB','TT','GH','CA','GY','GB','BS','AG','BZ','DM','GD','KN','LC','VC','CU','HT','SR','PR','AW','CW','SX','VI','VG','TC','AI','MS','BM','GP','MQ','BQ','GF','NG','DO','CO','BR','PA','MX','GT','HN','SV','NI','CR','AR','BO','CL','EC','PY','PE','UY','VE'
  ) THEN
    v_iso := v_code;
    v_name := CASE v_code
      WHEN 'JM' THEN 'Jamaica'
      WHEN 'US' THEN 'United States'
      WHEN 'KY' THEN 'Cayman Islands'
      WHEN 'BB' THEN 'Barbados'
      WHEN 'TT' THEN 'Trinidad and Tobago'
      WHEN 'GH' THEN 'Ghana'
      WHEN 'CA' THEN 'Canada'
      WHEN 'GY' THEN 'Guyana'
      WHEN 'GB' THEN 'United Kingdom'
      WHEN 'BS' THEN 'The Bahamas'
      WHEN 'AG' THEN 'Antigua and Barbuda'
      WHEN 'BZ' THEN 'Belize'
      WHEN 'DM' THEN 'Dominica'
      WHEN 'GD' THEN 'Grenada'
      WHEN 'KN' THEN 'Saint Kitts and Nevis'
      WHEN 'LC' THEN 'Saint Lucia'
      WHEN 'VC' THEN 'Saint Vincent and the Grenadines'
      WHEN 'CU' THEN 'Cuba'
      WHEN 'HT' THEN 'Haiti'
      WHEN 'SR' THEN 'Suriname'
      WHEN 'PR' THEN 'Puerto Rico'
      WHEN 'AW' THEN 'Aruba'
      WHEN 'CW' THEN 'Curaçao'
      WHEN 'SX' THEN 'Sint Maarten'
      WHEN 'VI' THEN 'U.S. Virgin Islands'
      WHEN 'VG' THEN 'British Virgin Islands'
      WHEN 'TC' THEN 'Turks and Caicos Islands'
      WHEN 'AI' THEN 'Anguilla'
      WHEN 'MS' THEN 'Montserrat'
      WHEN 'BM' THEN 'Bermuda'
      WHEN 'GP' THEN 'Guadeloupe'
      WHEN 'MQ' THEN 'Martinique'
      WHEN 'BQ' THEN 'Caribbean Netherlands'
      WHEN 'GF' THEN 'French Guiana'
      WHEN 'NG' THEN 'Nigeria'
      WHEN 'DO' THEN 'Dominican Republic'
      WHEN 'CO' THEN 'Colombia'
      WHEN 'BR' THEN 'Brazil'
      WHEN 'PA' THEN 'Panama'
      WHEN 'MX' THEN 'Mexico'
      WHEN 'GT' THEN 'Guatemala'
      WHEN 'HN' THEN 'Honduras'
      WHEN 'SV' THEN 'El Salvador'
      WHEN 'NI' THEN 'Nicaragua'
      WHEN 'CR' THEN 'Costa Rica'
      WHEN 'AR' THEN 'Argentina'
      WHEN 'BO' THEN 'Bolivia'
      WHEN 'CL' THEN 'Chile'
      WHEN 'EC' THEN 'Ecuador'
      WHEN 'PY' THEN 'Paraguay'
      WHEN 'PE' THEN 'Peru'
      WHEN 'UY' THEN 'Uruguay'
      WHEN 'VE' THEN 'Venezuela'
      ELSE v_raw
    END;
  ELSIF v_raw IS NULL AND v_code IS NULL AND (
    v_city IN ('kingston', 'new kingston', 'treasure beach', 'montego bay')
    OR v_city LIKE 'kingston,%'
    OR v_city LIKE 'new kingston,%'
    OR v_city LIKE 'treasure beach,%'
    OR v_city LIKE 'montego bay,%'
  ) THEN
    v_name := 'Jamaica';
    v_iso := 'JM';
  ELSE
    -- Unknown country text stays as written. Do not invent an ISO code.
    v_name := v_raw;
    v_iso := CASE WHEN v_code ~ '^[A-Z]{2}$' THEN v_code ELSE NULL END;
  END IF;

  -- A Jamaica name always carries JM, even if an old code disagreed.
  IF v_name = 'Jamaica' THEN
    v_iso := 'JM';
  END IF;

  country := v_name;
  country_code := v_iso;
  RETURN NEXT;
  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.normalize_place_country(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_place_country(text, text, text) TO service_role;

CREATE TABLE IF NOT EXISTS public.country_normalization_backup_moments (
  moment_id uuid PRIMARY KEY,
  country text,
  country_code text,
  city text,
  backed_up_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.country_normalization_backup_venues (
  venue_id uuid PRIMARY KEY,
  country text,
  country_code text,
  city text,
  backed_up_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.country_normalization_backup_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_normalization_backup_venues ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.country_normalization_backup_moments FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.country_normalization_backup_venues FROM PUBLIC, anon, authenticated;

INSERT INTO public.country_normalization_backup_moments (moment_id, country, country_code, city)
SELECT id, country, country_code, city
FROM public.moments
ON CONFLICT (moment_id) DO NOTHING;

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS country text;

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS country_code text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'venues' AND column_name = 'city'
  ) THEN
    EXECUTE $sql$
      INSERT INTO public.country_normalization_backup_venues (venue_id, country, country_code, city)
      SELECT id, country, country_code, city
      FROM public.venues
      ON CONFLICT (venue_id) DO NOTHING
    $sql$;
  ELSE
    EXECUTE $sql$
      INSERT INTO public.country_normalization_backup_venues (venue_id, country, country_code, city)
      SELECT id, country, country_code, NULL::text
      FROM public.venues
      ON CONFLICT (venue_id) DO NOTHING
    $sql$;
  END IF;
END $$;

UPDATE public.moments AS moment
SET country = norm.country,
    country_code = norm.country_code,
    updated_at = now()
FROM public.moments AS src
CROSS JOIN LATERAL public.normalize_place_country(src.country, src.country_code, src.city) AS norm
WHERE moment.id = src.id
  AND (
    moment.country IS DISTINCT FROM norm.country
    OR moment.country_code IS DISTINCT FROM norm.country_code
  );

DO $$
DECLARE
  v_city_expr text := 'NULL::text';
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'venues' AND column_name = 'city'
  ) THEN
    v_city_expr := 'src.city';
  END IF;

  EXECUTE format($sql$
    UPDATE public.venues AS venue
    SET country = norm.country,
        country_code = norm.country_code,
        updated_at = now()
    FROM public.venues AS src
    CROSS JOIN LATERAL public.normalize_place_country(src.country, src.country_code, %s) AS norm
    WHERE venue.id = src.id
      AND (
        venue.country IS DISTINCT FROM norm.country
        OR venue.country_code IS DISTINCT FROM norm.country_code
      )
  $sql$, v_city_expr);
END $$;

ALTER TABLE public.venues
  DROP CONSTRAINT IF EXISTS venues_country_code_iso2;

ALTER TABLE public.venues
  ADD CONSTRAINT venues_country_code_iso2
  CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$');

CREATE INDEX IF NOT EXISTS idx_venues_country_code ON public.venues(country_code);

-- Capleton: nightlife category, share plus a presence requirement.
-- No-op with a notice when the seeded id/slug is not in this database.
DO $$
DECLARE
  v_capleton uuid := '00000000-0000-0000-0002-000000000052';
  v_found boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.moments
    WHERE id = v_capleton
      AND (
        slug = 'encore-live-featuring-capleton'
        OR title ILIKE '%Capleton%'
      )
  ) INTO v_found;

  IF NOT v_found THEN
    RAISE NOTICE 'Capleton moment % slug encore-live-featuring-capleton was not found. No retag applied.', v_capleton;
    RETURN;
  END IF;

  UPDATE public.moments
  SET category = 'Nightlife & Social',
      proof_mode = 'multi_modal',
      proof_type = 'Share',
      updated_at = now()
  WHERE id = v_capleton
    AND (
      slug = 'encore-live-featuring-capleton'
      OR title ILIKE '%Capleton%'
    );

  INSERT INTO public.proof_requirements (moment_id, requirement_type, is_required, weight, metadata)
  SELECT v_capleton, 'venue_qr', true, 1,
         jsonb_build_object('purpose', 'presence', 'moment', 'capleton')
  WHERE NOT EXISTS (
    SELECT 1 FROM public.proof_requirements
    WHERE moment_id = v_capleton
      AND requirement_type = 'venue_qr'
  );
END $$;

-- Ladies Throwback: category only. Lifecycle stays whatever it already is.
DO $$
DECLARE
  v_throwback uuid := '58fa8801-6f83-40e3-a80b-86d6a67fc1a7';
  v_status_before text;
  v_active_before boolean;
  v_status_after text;
  v_active_after boolean;
BEGIN
  SELECT status, is_active INTO v_status_before, v_active_before
  FROM public.moments
  WHERE id = v_throwback
    AND title = 'Encore: Ladies Throwback Playground';

  IF NOT FOUND THEN
    RAISE NOTICE 'Encore Ladies Throwback % was not found. Category was not changed.', v_throwback;
    RETURN;
  END IF;

  UPDATE public.moments
  SET category = 'Nightlife & Social',
      updated_at = now()
  WHERE id = v_throwback
    AND title = 'Encore: Ladies Throwback Playground';

  SELECT status, is_active INTO v_status_after, v_active_after
  FROM public.moments
  WHERE id = v_throwback;

  IF v_status_before IS DISTINCT FROM v_status_after
     OR v_active_before IS DISTINCT FROM v_active_after THEN
    RAISE EXCEPTION 'Encore Ladies Throwback lifecycle changed during category retag';
  END IF;
END $$;
