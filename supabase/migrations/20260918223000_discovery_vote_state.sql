-- Current-user Discovery vote state belongs to the database, not browser history.
-- Anonymous callers receive NULL because auth.uid() is NULL.

CREATE OR REPLACE VIEW public.view_public_listing_discovery_polls AS
SELECT
  question.id,
  question.question,
  question.category,
  question.author_name,
  question.total_votes,
  question.threshold_for_moment,
  question.metadata->>'venue_slug' AS venue_slug,
  COALESCE((question.metadata->>'reward_points')::integer, 0) AS reward_points,
  jsonb_agg(
    jsonb_build_object('id', option.id, 'text', option.option_text, 'votes', option.votes_count)
    ORDER BY option.created_at, option.id
  ) AS options,
  (
    SELECT vote.option_id
    FROM public.discovery_votes vote
    WHERE vote.discovery_id = question.id
      AND vote.user_id = auth.uid()
    ORDER BY vote.created_at DESC
    LIMIT 1
  ) AS user_voted_option_id
FROM public.discovery_questions question
JOIN public.discovery_options option
  ON COALESCE(option.discovery_id, option.question_id) = question.id
WHERE question.question_type = 'listing_verification'
  AND question.status = 'active'
GROUP BY question.id;

CREATE OR REPLACE VIEW public.view_public_city_discovery_polls AS
SELECT
  question.id,
  question.question,
  question.category,
  question.author_name,
  question.total_votes,
  question.threshold_for_moment,
  question.created_at,
  question.metadata->>'country_code' AS country_code,
  question.metadata->>'country_slug' AS country_slug,
  question.metadata->>'city' AS city,
  question.metadata->>'city_slug' AS city_slug,
  jsonb_agg(
    jsonb_build_object('id', option.id, 'text', option.option_text, 'votes', option.votes_count)
    ORDER BY option.created_at, option.id
  ) AS options,
  (
    SELECT vote.option_id
    FROM public.discovery_votes vote
    WHERE vote.discovery_id = question.id
      AND vote.user_id = auth.uid()
    ORDER BY vote.created_at DESC
    LIMIT 1
  ) AS user_voted_option_id
FROM public.discovery_questions question
JOIN public.discovery_options option
  ON COALESCE(option.discovery_id, option.question_id) = question.id
WHERE question.question_type = 'city_direction'
  AND question.status = 'active'
GROUP BY question.id;

GRANT SELECT ON public.view_public_listing_discovery_polls TO anon, authenticated;
GRANT SELECT ON public.view_public_city_discovery_polls TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
