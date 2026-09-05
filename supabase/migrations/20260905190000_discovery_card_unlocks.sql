-- A Discover answer puts a perk on the PromoCard. Hosts see how many can spend it.
-- Store the perk words and a show-this code — not emails or phones.

CREATE TABLE IF NOT EXISTS public.discovery_card_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  poll_id text NOT NULL,
  poll_question text NOT NULL,
  perk_title text NOT NULL,
  query_raw text,
  query_key text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id text,
  redemption_code text NOT NULL,
  status text NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'used')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT discovery_card_unlocks_perk_len CHECK (char_length(perk_title) BETWEEN 2 AND 160)
);

CREATE INDEX IF NOT EXISTS idx_discovery_card_unlocks_city_poll
  ON public.discovery_card_unlocks (city, poll_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS discovery_card_unlocks_user_poll
  ON public.discovery_card_unlocks (poll_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS discovery_card_unlocks_anon_poll
  ON public.discovery_card_unlocks (poll_id, anonymous_id)
  WHERE anonymous_id IS NOT NULL;

ALTER TABLE public.discovery_card_unlocks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.discovery_card_unlocks FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.discovery_card_unlocks TO service_role;

CREATE OR REPLACE FUNCTION public.unlock_discovery_onto_card(
  p_city text,
  p_poll_id text,
  p_poll_question text,
  p_perk_title text,
  p_query text DEFAULT NULL,
  p_anonymous_id text DEFAULT NULL
) RETURNS TABLE (
  unlock_id uuid,
  redemption_code text,
  perk_title text,
  already_on_card boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_city text;
  v_poll text;
  v_question text;
  v_perk text;
  v_query text;
  v_key text;
  v_anon text;
  v_code text;
  v_existing public.discovery_card_unlocks%ROWTYPE;
BEGIN
  v_city := coalesce(nullif(trim(both FROM coalesce(p_city, '')), ''), 'Kingston & St. Andrew');
  v_poll := nullif(trim(both FROM coalesce(p_poll_id, '')), '');
  v_question := trim(both FROM coalesce(p_poll_question, ''));
  v_perk := trim(both FROM coalesce(p_perk_title, ''));
  v_query := nullif(trim(both FROM coalesce(p_query, '')), '');
  v_anon := CASE WHEN auth.uid() IS NULL THEN nullif(trim(both FROM coalesce(p_anonymous_id, '')), '') END;

  IF v_poll IS NULL OR char_length(v_question) < 3 OR char_length(v_perk) < 2 THEN
    RETURN;
  END IF;

  SELECT string_agg(w, ' ' ORDER BY w)
  INTO v_key
  FROM (
    SELECT DISTINCT regexp_split_to_table(lower(coalesce(v_query, '')), '[^a-z0-9]+') AS w
  ) words
  WHERE char_length(w) > 2
    AND w NOT IN ('and', 'for', 'the', 'with');

  IF auth.uid() IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM public.discovery_card_unlocks
    WHERE poll_id = v_poll AND user_id = auth.uid()
    LIMIT 1;
  ELSIF v_anon IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM public.discovery_card_unlocks
    WHERE poll_id = v_poll AND anonymous_id = v_anon
    LIMIT 1;
  END IF;

  IF v_existing.id IS NOT NULL THEN
    unlock_id := v_existing.id;
    redemption_code := v_existing.redemption_code;
    perk_title := v_existing.perk_title;
    already_on_card := true;
    RETURN NEXT;
    RETURN;
  END IF;

  v_code := 'PR-' || upper(substr(replace(v_poll, '-', ''), greatest(char_length(replace(v_poll, '-', '')) - 3, 1))) || upper(substr(md5(random()::text), 1, 4));

  INSERT INTO public.discovery_card_unlocks (
    city, poll_id, poll_question, perk_title, query_raw, query_key, user_id, anonymous_id, redemption_code
  ) VALUES (
    v_city, v_poll, v_question, v_perk, v_query, v_key, auth.uid(), v_anon, v_code
  )
  RETURNING * INTO v_existing;

  unlock_id := v_existing.id;
  redemption_code := v_existing.redemption_code;
  perk_title := v_existing.perk_title;
  already_on_card := false;
  RETURN NEXT;
EXCEPTION
  WHEN unique_violation THEN
    SELECT * INTO v_existing
    FROM public.discovery_card_unlocks
    WHERE poll_id = v_poll
      AND (
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
        OR (auth.uid() IS NULL AND anonymous_id = v_anon)
      )
    LIMIT 1;
    IF v_existing.id IS NOT NULL THEN
      unlock_id := v_existing.id;
      redemption_code := v_existing.redemption_code;
      perk_title := v_existing.perk_title;
      already_on_card := true;
      RETURN NEXT;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_discovery_card_unlock_counts(p_city text)
RETURNS TABLE (
  poll_id text,
  perk_title text,
  on_cards integer,
  used integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    unlocks.poll_id,
    max(unlocks.perk_title) AS perk_title,
    count(*) FILTER (WHERE unlocks.status = 'claimed')::integer AS on_cards,
    count(*) FILTER (WHERE unlocks.status = 'used')::integer AS used
  FROM public.discovery_card_unlocks unlocks
  WHERE unlocks.city = coalesce(nullif(trim(both FROM coalesce(p_city, '')), ''), 'Kingston & St. Andrew')
  GROUP BY unlocks.poll_id
  ORDER BY count(*) FILTER (WHERE unlocks.status = 'claimed') DESC
  LIMIT 40;
$$;

REVOKE ALL ON FUNCTION public.unlock_discovery_onto_card(text, text, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_discovery_card_unlock_counts(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_discovery_onto_card(text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_discovery_card_unlock_counts(text) TO authenticated;
