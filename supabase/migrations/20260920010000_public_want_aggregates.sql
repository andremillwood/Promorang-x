-- Public-safe aggregate reader for participant Wants.
-- Anonymous callers may see only repeated, grouped intent. Single open-text asks stay private.

CREATE OR REPLACE FUNCTION public.list_public_discovery_named_intent_counts(p_city text)
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
  HAVING count(*) >= 2
  ORDER BY count(*) DESC, max(intents.created_at) DESC
  LIMIT 40;
$$;

REVOKE ALL ON FUNCTION public.list_public_discovery_named_intent_counts(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_discovery_named_intent_counts(text) TO anon, authenticated;

COMMENT ON FUNCTION public.list_public_discovery_named_intent_counts(text) IS
  'Public-safe grouped Wants. Suppresses singleton open-text asks so anonymous market browsing never exposes an individual query.';
