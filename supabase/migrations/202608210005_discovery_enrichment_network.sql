-- Discovery-powered listing enrichment.
-- Publishes unique Kingston inventory, creates claimable proof tasks, and turns
-- uncertain operating status into community Discovery polls.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.discovery_questions
  ADD COLUMN IF NOT EXISTS inventory_candidate_id uuid REFERENCES public.inventory_candidates(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS pre_populated_venue_id uuid REFERENCES public.pre_populated_venues(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'demand',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.discovery_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discovery_id uuid NOT NULL REFERENCES public.discovery_questions(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.discovery_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (discovery_id, user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_discovery_question_inventory_type
  ON public.discovery_questions (inventory_candidate_id, question_type);

CREATE TABLE IF NOT EXISTS public.listing_enrichment_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_candidate_id uuid NOT NULL REFERENCES public.inventory_candidates(id) ON DELETE CASCADE,
  pre_populated_venue_id uuid NOT NULL REFERENCES public.pre_populated_venues(id) ON DELETE CASCADE,
  field_key text NOT NULL CHECK (field_key IN ('operating_status', 'street_address', 'opening_hours', 'phone', 'website', 'social_profiles', 'original_photo', 'category', 'amenities', 'menu')),
  title text NOT NULL,
  instructions text NOT NULL,
  proof_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  reward_points integer NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'submitted', 'verified', 'paused', 'retired')),
  priority integer NOT NULL DEFAULT 50 CHECK (priority BETWEEN 0 AND 100),
  active_claim_id uuid,
  verified_value jsonb,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inventory_candidate_id, field_key)
);

CREATE TABLE IF NOT EXISTS public.listing_enrichment_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES public.listing_enrichment_opportunities(id) ON DELETE CASCADE,
  contributor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'submitted', 'approved', 'rejected', 'expired', 'withdrawn')),
  proposed_value jsonb,
  proof jsonb NOT NULL DEFAULT '[]'::jsonb,
  contributor_notes text,
  reviewer_notes text,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '48 hours',
  submitted_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  reward_points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_enrichment_opportunities
  DROP CONSTRAINT IF EXISTS listing_enrichment_opportunities_active_claim_id_fkey;
ALTER TABLE public.listing_enrichment_opportunities
  ADD CONSTRAINT listing_enrichment_opportunities_active_claim_id_fkey
  FOREIGN KEY (active_claim_id) REFERENCES public.listing_enrichment_claims(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_enrichment_active_contributor_claim
  ON public.listing_enrichment_claims (opportunity_id)
  WHERE status IN ('claimed', 'submitted');
CREATE INDEX IF NOT EXISTS idx_listing_enrichment_open
  ON public.listing_enrichment_opportunities (status, priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_listing_enrichment_contributor
  ON public.listing_enrichment_claims (contributor_id, status, claimed_at DESC);

ALTER TABLE public.listing_enrichment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_enrichment_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view enrichment opportunities" ON public.listing_enrichment_opportunities;
CREATE POLICY "Public can view enrichment opportunities"
  ON public.listing_enrichment_opportunities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Contributors can view own enrichment claims" ON public.listing_enrichment_claims;
CREATE POLICY "Contributors can view own enrichment claims"
  ON public.listing_enrichment_claims FOR SELECT USING (auth.uid() = contributor_id);

CREATE OR REPLACE FUNCTION public.claim_listing_enrichment(p_opportunity_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contributor uuid := auth.uid();
  opportunity public.listing_enrichment_opportunities%ROWTYPE;
  claim_id uuid;
BEGIN
  IF contributor IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;

  UPDATE public.listing_enrichment_claims
  SET status = 'expired', updated_at = now()
  WHERE opportunity_id = p_opportunity_id AND status = 'claimed' AND expires_at <= now();

  SELECT * INTO opportunity FROM public.listing_enrichment_opportunities
  WHERE id = p_opportunity_id FOR UPDATE;
  IF NOT FOUND OR opportunity.status NOT IN ('open', 'claimed') THEN
    RAISE EXCEPTION 'Enrichment opportunity is unavailable';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.listing_enrichment_claims
    WHERE opportunity_id = p_opportunity_id AND status IN ('claimed', 'submitted')
  ) THEN RAISE EXCEPTION 'Another Scout is already working on this'; END IF;

  INSERT INTO public.listing_enrichment_claims (opportunity_id, contributor_id)
  VALUES (p_opportunity_id, contributor) RETURNING id INTO claim_id;
  UPDATE public.listing_enrichment_opportunities
  SET status = 'claimed', active_claim_id = claim_id, updated_at = now()
  WHERE id = p_opportunity_id;
  RETURN claim_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_listing_enrichment(
  p_claim_id uuid,
  p_proposed_value jsonb,
  p_proof jsonb,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.listing_enrichment_claims
  SET status = 'submitted', proposed_value = p_proposed_value,
      proof = COALESCE(p_proof, '[]'::jsonb), contributor_notes = p_notes,
      submitted_at = now(), updated_at = now()
  WHERE id = p_claim_id AND contributor_id = auth.uid() AND status = 'claimed' AND expires_at > now();
  IF NOT FOUND THEN RAISE EXCEPTION 'Active claim not found'; END IF;
  UPDATE public.listing_enrichment_opportunities opportunity
  SET status = 'submitted', updated_at = now()
  FROM public.listing_enrichment_claims claim
  WHERE claim.id = p_claim_id AND opportunity.id = claim.opportunity_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_listing_enrichment(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_listing_enrichment(uuid,jsonb,jsonb,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_listing_enrichment(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_listing_enrichment(uuid,jsonb,jsonb,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.cast_listing_discovery_vote(p_discovery_id uuid, p_option_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE voter uuid := auth.uid();
BEGIN
  IF voter IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.discovery_options option
    WHERE option.id = p_option_id AND COALESCE(option.discovery_id, option.question_id) = p_discovery_id
  ) THEN RAISE EXCEPTION 'Option does not belong to this Discovery'; END IF;

  INSERT INTO public.discovery_votes (discovery_id, option_id, user_id)
  VALUES (p_discovery_id, p_option_id, voter);
  UPDATE public.discovery_options SET votes_count = COALESCE(votes_count, 0) + 1 WHERE id = p_option_id;
  UPDATE public.discovery_questions SET total_votes = COALESCE(total_votes, 0) + 1, updated_at = now() WHERE id = p_discovery_id;
END;
$$;

REVOKE ALL ON FUNCTION public.cast_listing_discovery_vote(uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cast_listing_discovery_vote(uuid,uuid) TO authenticated;

-- Publish every unique OSM candidate. Duplicate fingerprints remain in research.
WITH ranked AS (
  SELECT candidate.id,
         row_number() OVER (PARTITION BY candidate.fingerprint ORDER BY candidate.confidence DESC, candidate.created_at, candidate.id) AS duplicate_rank
  FROM public.inventory_candidates candidate
  JOIN public.inventory_sources source ON source.id = candidate.source_id
  WHERE source.source_key = 'openstreetmap' AND candidate.entity_type = 'venue'
)
UPDATE public.inventory_candidates candidate
SET review_status = 'approved',
    review_notes = concat_ws(E'\n', candidate.review_notes, 'Approved as an attributed unclaimed listing; missing facts become Scout enrichment opportunities.'),
    reviewed_at = now(), updated_at = now()
FROM ranked
WHERE candidate.id = ranked.id AND ranked.duplicate_rank = 1
  AND candidate.review_status IN ('pending', 'needs_research');

DO $$
DECLARE candidate record;
BEGIN
  FOR candidate IN
    SELECT item.id FROM public.inventory_candidates item
    JOIN public.inventory_sources source ON source.id = item.source_id
    WHERE source.source_key = 'openstreetmap' AND item.entity_type = 'venue'
      AND item.review_status = 'approved'
    ORDER BY item.confidence DESC, item.id
  LOOP
    PERFORM public.publish_approved_inventory_venue(candidate.id);
  END LOOP;
END;
$$;

-- Every imported venue gets an operating-status check and original-photo task.
INSERT INTO public.listing_enrichment_opportunities (
  inventory_candidate_id, pre_populated_venue_id, field_key, title, instructions, proof_requirements, reward_points, priority
)
SELECT candidate.id, venue.id, 'operating_status', 'Confirm this place is operating',
       'Visit or provide a recent authoritative source confirming that this place currently operates.',
       '["recent geotagged photo or official dated source", "short observation"]'::jsonb, 25, 95
FROM public.pre_populated_venues venue
JOIN public.inventory_candidates candidate ON candidate.id = venue.inventory_candidate_id
ON CONFLICT (inventory_candidate_id, field_key) DO NOTHING;

INSERT INTO public.listing_enrichment_opportunities (
  inventory_candidate_id, pre_populated_venue_id, field_key, title, instructions, proof_requirements, reward_points, priority
)
SELECT candidate.id, venue.id, 'original_photo', 'Photograph the storefront',
       'Take a clear, original photo showing the venue exterior or public entrance. Do not upload copied social or map imagery.',
       '["original photo", "location confirmation"]'::jsonb, 35, 80
FROM public.pre_populated_venues venue
JOIN public.inventory_candidates candidate ON candidate.id = venue.inventory_candidate_id
ON CONFLICT (inventory_candidate_id, field_key) DO NOTHING;

-- Generate missing-fact tasks from source evidence.
INSERT INTO public.listing_enrichment_opportunities (
  inventory_candidate_id, pre_populated_venue_id, field_key, title, instructions, proof_requirements, reward_points, priority
)
SELECT candidate.id, venue.id, missing.field_key, missing.title, missing.instructions, missing.proof, missing.reward, missing.priority
FROM public.pre_populated_venues venue
JOIN public.inventory_candidates candidate ON candidate.id = venue.inventory_candidate_id
CROSS JOIN LATERAL (
  VALUES
    ('street_address', 'Confirm the street address', 'Submit the visible street address with location proof.', '["street sign, storefront, receipt, or official source"]'::jsonb, 25, 85, candidate.raw_data->'tags'->>'addr:street'),
    ('opening_hours', 'Confirm opening hours', 'Submit current public opening hours and supporting proof.', '["storefront hours, current menu, or official source"]'::jsonb, 20, 70, candidate.normalized_data->>'opening_hours'),
    ('phone', 'Confirm the business phone', 'Submit a current public business telephone number and its source.', '["official source or visible business material"]'::jsonb, 15, 55, candidate.normalized_data->>'phone'),
    ('website', 'Find the official website', 'Submit the business-owned website, not a directory or review page.', '["official website URL"]'::jsonb, 15, 50, candidate.normalized_data->>'website')
) AS missing(field_key, title, instructions, proof, reward, priority, existing_value)
WHERE NULLIF(missing.existing_value, '') IS NULL
ON CONFLICT (inventory_candidate_id, field_key) DO NOTHING;

-- Low-confidence places become real Discovery ballots instead of invisible rows.
INSERT INTO public.discovery_questions (
  inventory_candidate_id, pre_populated_venue_id, question, category, author_name,
  threshold_for_moment, question_type, status, metadata
)
SELECT candidate.id, venue.id,
       concat('Is ', venue.venue_name, ' still operating in ', COALESCE(venue.city, 'Kingston'), '?'),
       'Place Verification', 'Promorang Scout Network', 5, 'listing_verification', 'active',
       jsonb_build_object('venue_slug', venue.venue_slug, 'reward_points', 0, 'confidence', candidate.confidence)
FROM public.pre_populated_venues venue
JOIN public.inventory_candidates candidate ON candidate.id = venue.inventory_candidate_id
WHERE candidate.confidence < 0.800
ON CONFLICT (inventory_candidate_id, question_type) DO NOTHING;

INSERT INTO public.discovery_options (discovery_id, question_id, option_text, votes_count)
SELECT question.id, question.id, option.option_text, 0
FROM public.discovery_questions question
CROSS JOIN (VALUES
  ('Yes — I visited recently'),
  ('I know it exists, but not recently'),
  ('It needs an in-person check'),
  ('It appears closed or moved')
) AS option(option_text)
WHERE question.question_type = 'listing_verification'
  AND NOT EXISTS (SELECT 1 FROM public.discovery_options existing WHERE COALESCE(existing.discovery_id, existing.question_id) = question.id);

CREATE OR REPLACE VIEW public.view_public_listing_enrichment AS
SELECT opportunity.id, opportunity.field_key, opportunity.title, opportunity.instructions,
       opportunity.proof_requirements, opportunity.reward_points, opportunity.status, opportunity.priority,
       venue.id AS venue_id, venue.venue_name, venue.venue_slug, venue.city, venue.country
FROM public.listing_enrichment_opportunities opportunity
JOIN public.pre_populated_venues venue ON venue.id = opportunity.pre_populated_venue_id
WHERE opportunity.status IN ('open', 'claimed');

CREATE OR REPLACE VIEW public.view_public_listing_discovery_polls AS
SELECT question.id, question.question, question.category, question.author_name,
       question.total_votes, question.threshold_for_moment,
       question.metadata->>'venue_slug' AS venue_slug,
       COALESCE((question.metadata->>'reward_points')::integer, 0) AS reward_points,
       jsonb_agg(jsonb_build_object('id', option.id, 'text', option.option_text, 'votes', option.votes_count) ORDER BY option.created_at, option.id) AS options
FROM public.discovery_questions question
JOIN public.discovery_options option ON COALESCE(option.discovery_id, option.question_id) = question.id
WHERE question.question_type = 'listing_verification' AND question.status = 'active'
GROUP BY question.id;

GRANT SELECT ON public.view_public_listing_enrichment TO anon, authenticated;
GRANT SELECT ON public.view_public_listing_discovery_polls TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
