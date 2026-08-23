-- Completes the listing enrichment lifecycle: evidence storage, Scout submission,
-- admin review, verified field application, canonical rewards, and reputation.

ALTER TABLE public.pre_populated_venues
  ADD COLUMN IF NOT EXISTS opening_hours text,
  ADD COLUMN IF NOT EXISTS amenities jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS menu_url text,
  ADD COLUMN IF NOT EXISTS community_verified_at timestamptz;

ALTER TABLE public.listing_enrichment_claims
  ADD COLUMN IF NOT EXISTS applied_value jsonb,
  ADD COLUMN IF NOT EXISTS economy_transaction_id uuid,
  ADD COLUMN IF NOT EXISTS reputation_delta integer NOT NULL DEFAULT 0;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('enrichment-proofs', 'enrichment-proofs', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public reads enrichment proof media" ON storage.objects;
CREATE POLICY "Public reads enrichment proof media" ON storage.objects FOR SELECT USING (bucket_id = 'enrichment-proofs');
DROP POLICY IF EXISTS "Scouts upload own enrichment proof media" ON storage.objects;
CREATE POLICY "Scouts upload own enrichment proof media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'enrichment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "Scouts manage own enrichment proof media" ON storage.objects;
CREATE POLICY "Scouts manage own enrichment proof media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'enrichment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE OR REPLACE FUNCTION public.is_enrichment_reviewer(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role::text IN ('admin','administrator','master_admin','moderator','platform_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.review_listing_enrichment(
  p_claim_id uuid,
  p_decision text,
  p_reviewer_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  reviewer uuid := auth.uid();
  claim public.listing_enrichment_claims%ROWTYPE;
  opportunity public.listing_enrichment_opportunities%ROWTYPE;
  venue public.pre_populated_venues%ROWTYPE;
  reward integer;
  reputation integer;
  transaction_id uuid;
  submitted_text text;
BEGIN
  IF reviewer IS NULL OR NOT public.is_enrichment_reviewer(reviewer) THEN RAISE EXCEPTION 'Admin review permission required'; END IF;
  IF p_decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Decision must be approved or rejected'; END IF;

  SELECT * INTO claim FROM public.listing_enrichment_claims WHERE id = p_claim_id FOR UPDATE;
  IF NOT FOUND OR claim.status <> 'submitted' THEN RAISE EXCEPTION 'Submitted claim not found'; END IF;
  SELECT * INTO opportunity FROM public.listing_enrichment_opportunities WHERE id = claim.opportunity_id FOR UPDATE;
  SELECT * INTO venue FROM public.pre_populated_venues WHERE id = opportunity.pre_populated_venue_id FOR UPDATE;

  IF p_decision = 'rejected' THEN
    UPDATE public.listing_enrichment_claims SET status='rejected', reviewer_notes=p_reviewer_notes,
      reviewed_by=reviewer, reviewed_at=now(), updated_at=now() WHERE id=claim.id;
    UPDATE public.listing_enrichment_opportunities SET status='open', active_claim_id=NULL, updated_at=now() WHERE id=opportunity.id;
    RETURN jsonb_build_object('status','rejected','claim_id',claim.id);
  END IF;

  submitted_text := COALESCE(claim.proposed_value->>'value', claim.proposed_value#>>'{}');
  CASE opportunity.field_key
    WHEN 'phone' THEN UPDATE public.pre_populated_venues SET phone=submitted_text, updated_at=now() WHERE id=venue.id;
    WHEN 'website' THEN UPDATE public.pre_populated_venues SET website=submitted_text, updated_at=now() WHERE id=venue.id;
    WHEN 'street_address' THEN UPDATE public.pre_populated_venues SET address=submitted_text, updated_at=now() WHERE id=venue.id;
    WHEN 'opening_hours' THEN UPDATE public.pre_populated_venues SET opening_hours=submitted_text, updated_at=now() WHERE id=venue.id;
    WHEN 'menu' THEN UPDATE public.pre_populated_venues SET menu_url=submitted_text, updated_at=now() WHERE id=venue.id;
    WHEN 'social_profiles' THEN UPDATE public.pre_populated_venues SET social_profiles=COALESCE(claim.proposed_value,'{}'::jsonb), updated_at=now() WHERE id=venue.id;
    WHEN 'amenities' THEN UPDATE public.pre_populated_venues SET amenities=COALESCE(claim.proposed_value,'[]'::jsonb), updated_at=now() WHERE id=venue.id;
    WHEN 'category' THEN UPDATE public.pre_populated_venues SET categories=ARRAY[submitted_text], updated_at=now() WHERE id=venue.id;
    WHEN 'original_photo' THEN UPDATE public.pre_populated_venues SET photos=COALESCE(photos,'[]'::jsonb) || COALESCE(claim.proof,'[]'::jsonb), updated_at=now() WHERE id=venue.id;
    WHEN 'operating_status' THEN UPDATE public.pre_populated_venues SET community_verified_at=now(), updated_at=now() WHERE id=venue.id;
    ELSE NULL;
  END CASE;

  reward := opportunity.reward_points;
  reputation := greatest(5, least(25, reward / 2));
  SELECT id INTO transaction_id FROM public.post_economy_transaction(
    claim.contributor_id, 'points', reward, 'earn', 'listing_enrichment',
    'listing-enrichment:' || claim.id::text, claim.id, 'listing_enrichment_claims',
    'Approved Scout enrichment for ' || venue.venue_name,
    jsonb_build_object('venue_id',venue.id,'field_key',opportunity.field_key)
  );

  INSERT INTO public.reputation_scores(user_id,category,score,title_level,last_updated)
  VALUES (claim.contributor_id,'place_scout',reputation,'Scout',now())
  ON CONFLICT (user_id,category) DO UPDATE SET
    score=public.reputation_scores.score + EXCLUDED.score,
    title_level=CASE WHEN public.reputation_scores.score + EXCLUDED.score >= 500 THEN 'Master'
                     WHEN public.reputation_scores.score + EXCLUDED.score >= 200 THEN 'Specialist'
                     WHEN public.reputation_scores.score + EXCLUDED.score >= 75 THEN 'Insider'
                     ELSE 'Scout' END,
    last_updated=now();

  UPDATE public.listing_enrichment_claims SET status='approved', reviewer_notes=p_reviewer_notes,
    reviewed_by=reviewer, reviewed_at=now(), reward_points_awarded=reward,
    economy_transaction_id=transaction_id, reputation_delta=reputation,
    applied_value=claim.proposed_value, updated_at=now() WHERE id=claim.id;
  UPDATE public.listing_enrichment_opportunities SET status='verified', active_claim_id=NULL,
    verified_value=claim.proposed_value, verified_by=reviewer, verified_at=now(), updated_at=now() WHERE id=opportunity.id;

  IF opportunity.field_key = 'operating_status' THEN
    UPDATE public.discovery_questions SET status='resolved', is_moment_triggered=true,
      metadata=metadata || jsonb_build_object('resolution','community_verified','resolved_at',now()), updated_at=now()
    WHERE inventory_candidate_id=opportunity.inventory_candidate_id AND question_type='listing_verification';
  END IF;

  RETURN jsonb_build_object('status','approved','claim_id',claim.id,'points',reward,'reputation',reputation,'transaction_id',transaction_id);
END;
$$;

REVOKE ALL ON FUNCTION public.review_listing_enrichment(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_listing_enrichment(uuid,text,text) TO authenticated;

DROP VIEW IF EXISTS public.view_my_enrichment_claims;
CREATE VIEW public.view_my_enrichment_claims AS
SELECT claim.id, claim.status, claim.proposed_value, claim.proof, claim.contributor_notes,
       claim.reviewer_notes, claim.claimed_at, claim.expires_at, claim.submitted_at,
       claim.reviewed_at, claim.reward_points_awarded, claim.reputation_delta,
       opportunity.field_key, opportunity.title, opportunity.instructions,
       opportunity.proof_requirements, opportunity.reward_points,
       venue.venue_name, venue.venue_slug, venue.city
FROM public.listing_enrichment_claims claim
JOIN public.listing_enrichment_opportunities opportunity ON opportunity.id=claim.opportunity_id
JOIN public.pre_populated_venues venue ON venue.id=opportunity.pre_populated_venue_id
WHERE claim.contributor_id=auth.uid();

DROP VIEW IF EXISTS public.view_enrichment_review_queue;
CREATE VIEW public.view_enrichment_review_queue AS
SELECT claim.id, claim.contributor_id, claim.proposed_value, claim.proof, claim.contributor_notes,
       claim.submitted_at, opportunity.field_key, opportunity.title, opportunity.instructions,
       opportunity.reward_points, venue.venue_name, venue.venue_slug, venue.city,
       profile.display_name AS contributor_name, profile.username AS contributor_username
FROM public.listing_enrichment_claims claim
JOIN public.listing_enrichment_opportunities opportunity ON opportunity.id=claim.opportunity_id
JOIN public.pre_populated_venues venue ON venue.id=opportunity.pre_populated_venue_id
LEFT JOIN public.profiles profile ON profile.id=claim.contributor_id
WHERE claim.status='submitted' AND public.is_enrichment_reviewer(auth.uid());

GRANT SELECT ON public.view_my_enrichment_claims TO authenticated;
GRANT SELECT ON public.view_enrichment_review_queue TO authenticated;
NOTIFY pgrst, 'reload schema';
