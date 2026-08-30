-- Named Discover asks become city demand operators can read.
-- Store only the words and the city — never emails, phones, or voter identity in the operator view.

CREATE TABLE IF NOT EXISTS public.discovery_named_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  query_raw text NOT NULL,
  query_key text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT discovery_named_intents_query_len CHECK (char_length(query_raw) BETWEEN 3 AND 120)
);

CREATE INDEX IF NOT EXISTS idx_discovery_named_intents_city_time
  ON public.discovery_named_intents (city, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS discovery_named_intents_user_daily
  ON public.discovery_named_intents (
    city,
    query_key,
    user_id,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS discovery_named_intents_anon_daily
  ON public.discovery_named_intents (
    city,
    query_key,
    anonymous_id,
    ((created_at AT TIME ZONE 'UTC')::date)
  )
  WHERE anonymous_id IS NOT NULL;

ALTER TABLE public.discovery_named_intents ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.discovery_named_intents FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.discovery_named_intents TO service_role;

CREATE OR REPLACE FUNCTION public.record_discovery_named_intent(
  p_city text,
  p_query text,
  p_anonymous_id text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw text;
  v_key text;
  v_city text;
BEGIN
  v_raw := trim(both FROM coalesce(p_query, ''));
  v_city := coalesce(nullif(trim(both FROM coalesce(p_city, '')), ''), 'Kingston & St. Andrew');

  IF char_length(v_raw) < 3 OR char_length(v_raw) > 120 THEN
    RETURN false;
  END IF;

  SELECT string_agg(w, ' ' ORDER BY w)
  INTO v_key
  FROM (
    SELECT DISTINCT regexp_split_to_table(lower(v_raw), '[^a-z0-9]+') AS w
  ) words
  WHERE char_length(w) > 2
    AND w NOT IN ('and', 'for', 'the', 'with');

  IF v_key IS NULL OR char_length(v_key) < 3 THEN
    RETURN false;
  END IF;

  INSERT INTO public.discovery_named_intents (city, query_raw, query_key, user_id, anonymous_id)
  VALUES (
    v_city,
    v_raw,
    v_key,
    auth.uid(),
    CASE WHEN auth.uid() IS NULL THEN nullif(trim(both FROM coalesce(p_anonymous_id, '')), '') END
  );

  RETURN true;
EXCEPTION
  WHEN unique_violation THEN
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_discovery_named_intent_counts(p_city text)
RETURNS TABLE (
  city text,
  query_key text,
  query_raw text,
  ask_count integer,
  last_asked_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    intents.city,
    intents.query_key,
    max(intents.query_raw) AS query_raw,
    count(*)::integer AS ask_count,
    max(intents.created_at) AS last_asked_at
  FROM public.discovery_named_intents intents
  WHERE intents.city = coalesce(nullif(trim(both FROM coalesce(p_city, '')), ''), 'Kingston & St. Andrew')
    AND intents.created_at > now() - interval '30 days'
  GROUP BY intents.city, intents.query_key
  ORDER BY count(*) DESC, max(intents.created_at) DESC
  LIMIT 40;
$$;

REVOKE ALL ON FUNCTION public.record_discovery_named_intent(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_discovery_named_intent_counts(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_discovery_named_intent(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_discovery_named_intent_counts(text) TO authenticated;
