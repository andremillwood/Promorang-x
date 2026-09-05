-- Anyone can put a place or a night on the table. A house claims it.
-- The finder keeps a PromoCard slip — not points. Operators see words, not names.

CREATE TABLE IF NOT EXISTS public.found_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('place', 'moment')),
  title text NOT NULL,
  words text NOT NULL,
  words_key text NOT NULL,
  where_hint text,
  perk_to_finder text NOT NULL,
  named_count integer NOT NULL DEFAULT 1 CHECK (named_count >= 1),
  finder_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  finder_anon_id text,
  status text NOT NULL DEFAULT 'unclaimed' CHECK (status IN ('unclaimed', 'claimed')),
  claimant_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT found_listings_title_len CHECK (char_length(title) BETWEEN 3 AND 120),
  CONSTRAINT found_listings_perk_len CHECK (char_length(perk_to_finder) BETWEEN 2 AND 160)
);

CREATE INDEX IF NOT EXISTS idx_found_listings_city_status
  ON public.found_listings (city, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS found_listings_unclaimed_city_key
  ON public.found_listings (city, words_key)
  WHERE status = 'unclaimed';

ALTER TABLE public.found_listings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.found_listings FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.found_listings TO service_role;

CREATE OR REPLACE FUNCTION public.found_words_key(p_words text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT string_agg(w, ' ' ORDER BY w)
  FROM (
    SELECT DISTINCT regexp_split_to_table(lower(coalesce(p_words, '')), '[^a-z0-9]+') AS w
  ) words
  WHERE char_length(w) > 2
    AND w NOT IN ('and', 'for', 'the', 'with');
$$;

CREATE OR REPLACE FUNCTION public.put_up_found_listing(
  p_city text,
  p_kind text,
  p_title text,
  p_words text DEFAULT NULL,
  p_where_hint text DEFAULT NULL,
  p_perk_to_finder text DEFAULT NULL,
  p_anonymous_id text DEFAULT NULL
) RETURNS TABLE (
  listing_id uuid,
  title text,
  kind text,
  words text,
  where_hint text,
  perk_to_finder text,
  status text,
  named_count integer,
  already_up boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_city text;
  v_kind text;
  v_title text;
  v_words text;
  v_key text;
  v_where text;
  v_perk text;
  v_anon text;
  v_existing public.found_listings%ROWTYPE;
BEGIN
  v_city := coalesce(nullif(trim(both FROM coalesce(p_city, '')), ''), 'Kingston & St. Andrew');
  v_kind := CASE WHEN p_kind = 'place' THEN 'place' ELSE 'moment' END;
  v_title := trim(both FROM coalesce(p_title, ''));
  v_words := nullif(trim(both FROM coalesce(p_words, v_title)), '');
  v_where := nullif(trim(both FROM coalesce(p_where_hint, '')), '');
  v_perk := nullif(trim(both FROM coalesce(p_perk_to_finder, '')), '');
  v_anon := CASE WHEN auth.uid() IS NULL THEN nullif(trim(both FROM coalesce(p_anonymous_id, '')), '') END;

  IF char_length(v_title) < 3 THEN
    RETURN;
  END IF;

  v_key := public.found_words_key(coalesce(v_words, v_title));
  IF v_key IS NULL OR char_length(v_key) < 3 THEN
    RETURN;
  END IF;

  IF v_perk IS NULL THEN
    v_perk := CASE
      WHEN v_kind = 'place' THEN 'First table when the house claims this'
      ELSE 'A door pass when a host claims this'
    END;
  END IF;

  SELECT * INTO v_existing
  FROM public.found_listings
  WHERE city = v_city AND words_key = v_key AND status = 'unclaimed'
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    UPDATE public.found_listings
    SET named_count = v_existing.named_count + 1
    WHERE id = v_existing.id
    RETURNING * INTO v_existing;

    listing_id := v_existing.id;
    title := v_existing.title;
    kind := v_existing.kind;
    words := v_existing.words;
    where_hint := v_existing.where_hint;
    perk_to_finder := v_existing.perk_to_finder;
    status := v_existing.status;
    named_count := v_existing.named_count;
    already_up := true;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO public.found_listings (
    city, kind, title, words, words_key, where_hint, perk_to_finder, finder_user_id, finder_anon_id
  ) VALUES (
    v_city, v_kind, v_title, coalesce(v_words, v_title), v_key, v_where, v_perk, auth.uid(), v_anon
  )
  RETURNING * INTO v_existing;

  listing_id := v_existing.id;
  title := v_existing.title;
  kind := v_existing.kind;
  words := v_existing.words;
  where_hint := v_existing.where_hint;
  perk_to_finder := v_existing.perk_to_finder;
  status := v_existing.status;
  named_count := v_existing.named_count;
  already_up := false;
  RETURN NEXT;
EXCEPTION
  WHEN unique_violation THEN
    SELECT * INTO v_existing
    FROM public.found_listings
    WHERE city = v_city AND words_key = v_key AND status = 'unclaimed'
    LIMIT 1;
    IF v_existing.id IS NOT NULL THEN
      listing_id := v_existing.id;
      title := v_existing.title;
      kind := v_existing.kind;
      words := v_existing.words;
      where_hint := v_existing.where_hint;
      perk_to_finder := v_existing.perk_to_finder;
      status := v_existing.status;
      named_count := v_existing.named_count;
      already_up := true;
      RETURN NEXT;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_found_listings(
  p_city text,
  p_anonymous_id text DEFAULT NULL
) RETURNS TABLE (
  listing_id uuid,
  city text,
  kind text,
  title text,
  words text,
  where_hint text,
  perk_to_finder text,
  status text,
  named_count integer,
  you_found boolean,
  claimed_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    listings.id,
    listings.city,
    listings.kind,
    listings.title,
    listings.words,
    listings.where_hint,
    listings.perk_to_finder,
    listings.status,
    listings.named_count,
    (
      (auth.uid() IS NOT NULL AND listings.finder_user_id = auth.uid())
      OR (
        auth.uid() IS NULL
        AND p_anonymous_id IS NOT NULL
        AND listings.finder_anon_id = nullif(trim(both FROM coalesce(p_anonymous_id, '')), '')
      )
    ) AS you_found,
    listings.claimed_at,
    listings.created_at
  FROM public.found_listings listings
  WHERE listings.city = coalesce(nullif(trim(both FROM coalesce(p_city, '')), ''), 'Kingston & St. Andrew')
  ORDER BY
    CASE WHEN listings.status = 'unclaimed' THEN 0 ELSE 1 END,
    listings.named_count DESC,
    listings.created_at DESC
  LIMIT 40;
$$;

CREATE OR REPLACE FUNCTION public.claim_found_listing(p_listing_id uuid)
RETURNS TABLE (
  listing_id uuid,
  title text,
  kind text,
  perk_to_finder text,
  status text,
  keep text,
  slip_code text,
  already_claimed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing public.found_listings%ROWTYPE;
  v_code text;
  v_keep text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to claim this.';
  END IF;

  SELECT * INTO v_listing
  FROM public.found_listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF v_listing.id IS NULL THEN
    RETURN;
  END IF;

  IF v_listing.status = 'claimed' THEN
    listing_id := v_listing.id;
    title := v_listing.title;
    kind := v_listing.kind;
    perk_to_finder := v_listing.perk_to_finder;
    status := v_listing.status;
    keep := 'workspace';
    slip_code := NULL;
    already_claimed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  UPDATE public.found_listings
  SET
    status = 'claimed',
    claimant_user_id = auth.uid(),
    claimed_at = now()
  WHERE id = v_listing.id
  RETURNING * INTO v_listing;

  IF v_listing.finder_user_id IS NOT NULL AND v_listing.finder_user_id = auth.uid() THEN
    v_keep := 'workspace';
  ELSIF v_listing.finder_anon_id IS NOT NULL AND v_listing.finder_user_id IS NULL THEN
    v_keep := 'slip';
    v_code := 'PR-' || upper(substr(replace(v_listing.id::text, '-', ''), 1, 4)) || upper(substr(md5(random()::text), 1, 4));
    INSERT INTO public.discovery_card_unlocks (
      city, poll_id, poll_question, perk_title, query_raw, user_id, anonymous_id, redemption_code, status
    ) VALUES (
      v_listing.city,
      'found:' || v_listing.id::text,
      v_listing.title,
      v_listing.perk_to_finder,
      v_listing.words,
      NULL,
      v_listing.finder_anon_id,
      v_code,
      'claimed'
    )
    ON CONFLICT DO NOTHING;
  ELSIF v_listing.finder_user_id IS NOT NULL THEN
    v_keep := 'slip';
    v_code := 'PR-' || upper(substr(replace(v_listing.id::text, '-', ''), 1, 4)) || upper(substr(md5(random()::text), 1, 4));
    INSERT INTO public.discovery_card_unlocks (
      city, poll_id, poll_question, perk_title, query_raw, user_id, anonymous_id, redemption_code, status
    ) VALUES (
      v_listing.city,
      'found:' || v_listing.id::text,
      v_listing.title,
      v_listing.perk_to_finder,
      v_listing.words,
      v_listing.finder_user_id,
      NULL,
      v_code,
      'claimed'
    )
    ON CONFLICT DO NOTHING;
  ELSE
    v_keep := 'workspace';
  END IF;

  listing_id := v_listing.id;
  title := v_listing.title;
  kind := v_listing.kind;
  perk_to_finder := v_listing.perk_to_finder;
  status := v_listing.status;
  keep := v_keep;
  slip_code := v_code;
  already_claimed := false;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.put_up_found_listing(text, text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_found_listings(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_found_listing(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.put_up_found_listing(text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_found_listings(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_found_listing(uuid) TO authenticated;

INSERT INTO public.found_listings (
  id, city, kind, title, words, words_key, where_hint, perk_to_finder, named_count, finder_anon_id
)
SELECT
  v.id,
  'Kingston & St. Andrew',
  v.kind,
  v.title,
  v.words,
  v.words_key,
  v.where_hint,
  v.perk_to_finder,
  v.named_count,
  v.finder_anon_id
FROM (
  VALUES
    (
      '11111111-1111-4111-8111-111111111111'::uuid,
      'moment',
      'Hiking with kids',
      'hiking with kids',
      'hiking kids',
      'Blue Mountains',
      'First family table when a host claims this',
      3,
      'seed:hiking-kids'
    ),
    (
      '22222222-2222-4222-8222-222222222222'::uuid,
      'place',
      'Sunday church',
      'sunday church',
      'church sunday',
      'Kingston',
      'A seat when the house opens the door',
      2,
      'seed:sunday-church'
    )
) AS v(id, kind, title, words, words_key, where_hint, perk_to_finder, named_count, finder_anon_id)
WHERE NOT EXISTS (
  SELECT 1 FROM public.found_listings existing WHERE existing.finder_anon_id LIKE 'seed:%'
);
