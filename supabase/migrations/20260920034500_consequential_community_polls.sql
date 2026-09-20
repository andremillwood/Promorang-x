-- Consequential community polls: public read model for user-created demand questions.
-- Polls remain interest/decision signals. They do not create supply, attendance or rewards.

CREATE OR REPLACE VIEW public.view_public_community_demand_polls AS
SELECT
  question.id,
  question.question,
  question.category,
  question.author_name,
  question.total_votes,
  question.threshold_for_moment,
  question.created_at,
  question.metadata->>'city' AS city,
  question.metadata->>'purpose' AS purpose,
  question.metadata->>'consequence' AS consequence,
  question.metadata->>'decision_owner' AS decision_owner,
  question.metadata->>'source' AS source,
  jsonb_agg(
    jsonb_build_object(
      'id', option.id,
      'text', option.option_text,
      'votes', option.votes_count
    )
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
WHERE question.question_type = 'demand'
  AND question.status = 'active'
GROUP BY question.id;

GRANT SELECT ON public.view_public_community_demand_polls TO anon, authenticated;

COMMENT ON VIEW public.view_public_community_demand_polls IS
  'Public community-created questions with purpose/consequence context. Answers remain signals, not automatic supply or reward issuance.';

NOTIFY pgrst, 'reload schema';
