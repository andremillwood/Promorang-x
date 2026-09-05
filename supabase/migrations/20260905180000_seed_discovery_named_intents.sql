-- Opening named asks so the demand inbox is not empty until someone types.
-- Same words the client shows. Counts are separate seed rows, not people.

INSERT INTO public.discovery_named_intents (city, query_raw, query_key, anonymous_id)
SELECT
  'Kingston & St. Andrew',
  v.query_raw,
  v.query_key,
  'seed:' || v.query_key || ':' || gs.n
FROM (
  VALUES
    ('jerk on friday', 'friday jerk', 6),
    ('cocktails after work', 'after cocktails work', 4),
    ('live music', 'live music', 3),
    ('hiking with kids', 'hiking kids', 3),
    ('sunday church', 'church sunday', 2)
) AS v(query_raw, query_key, ask_count)
CROSS JOIN LATERAL generate_series(1, v.ask_count) AS gs(n)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.discovery_named_intents existing
  WHERE existing.anonymous_id LIKE 'seed:%'
);
