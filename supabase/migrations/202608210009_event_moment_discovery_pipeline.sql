-- Governed online-event inventory: evidence, venue matching, verification missions,
-- Discovery polls, attributed imported Moments, rewards, and owner handoff metadata.

INSERT INTO public.inventory_sources (source_key,name,source_type,base_url,attribution_text,terms_url,metadata)
VALUES ('visitjamaica-events','Visit Jamaica Events','official_directory','https://www.visitjamaica.com/experiences/events/events-calendar/','Source: Visit Jamaica','https://www.visitjamaica.com/terms-of-use/',jsonb_build_object('authority','Jamaica Tourist Board','content_policy','facts_and_links_only'))
ON CONFLICT (source_key) DO UPDATE SET attribution_text=excluded.attribution_text, metadata=excluded.metadata, updated_at=now();

ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS inventory_candidate_id uuid REFERENCES public.inventory_candidates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS external_source_url text,
  ADD COLUMN IF NOT EXISTS external_attribution text,
  ADD COLUMN IF NOT EXISTS external_last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS ownership_status text NOT NULL DEFAULT 'owned',
  ADD COLUMN IF NOT EXISTS source_confidence numeric(4,3),
  ADD COLUMN IF NOT EXISTS schedule_precision text NOT NULL DEFAULT 'exact';
CREATE UNIQUE INDEX IF NOT EXISTS uq_moments_inventory_candidate ON public.moments(inventory_candidate_id) WHERE inventory_candidate_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.event_candidate_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_candidate_id uuid NOT NULL REFERENCES public.inventory_candidates(id) ON DELETE CASCADE,
  source_url text NOT NULL,
  source_name text NOT NULL,
  evidence_type text NOT NULL CHECK (evidence_type IN ('official_calendar','organizer_page','venue_page','ticket_page','community_report')),
  observed_facts jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_authoritative boolean NOT NULL DEFAULT false,
  checked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(inventory_candidate_id,source_url)
);

CREATE TABLE IF NOT EXISTS public.event_verification_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_candidate_id uuid NOT NULL REFERENCES public.inventory_candidates(id) ON DELETE CASCADE,
  mission_type text NOT NULL CHECK (mission_type IN ('schedule','venue','recurrence','ticket_link','organizer')),
  title text NOT NULL, instructions text NOT NULL,
  proof_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  reward_points integer NOT NULL DEFAULT 20 CHECK (reward_points > 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','claimed','submitted','verified','closed')),
  active_claim_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(inventory_candidate_id,mission_type)
);

CREATE TABLE IF NOT EXISTS public.event_verification_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES public.event_verification_missions(id) ON DELETE CASCADE,
  contributor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed','submitted','approved','rejected','expired')),
  proposed_value jsonb, proof jsonb NOT NULL DEFAULT '[]'::jsonb, contributor_notes text, reviewer_notes text,
  claimed_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '48 hours',
  submitted_at timestamptz, reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, reviewed_at timestamptz,
  reward_points_awarded integer NOT NULL DEFAULT 0, economy_transaction_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_verification_missions DROP CONSTRAINT IF EXISTS event_verification_missions_active_claim_id_fkey;
ALTER TABLE public.event_verification_missions ADD CONSTRAINT event_verification_missions_active_claim_id_fkey FOREIGN KEY(active_claim_id) REFERENCES public.event_verification_claims(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_event_verification_claim ON public.event_verification_claims(mission_id) WHERE status IN ('claimed','submitted');

ALTER TABLE public.event_candidate_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_verification_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_verification_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads event evidence" ON public.event_candidate_evidence FOR SELECT USING (true);
CREATE POLICY "Public reads open event missions" ON public.event_verification_missions FOR SELECT USING (status IN ('open','claimed'));
CREATE POLICY "Contributors read own event claims" ON public.event_verification_claims FOR SELECT USING (contributor_id=auth.uid());

CREATE OR REPLACE FUNCTION public.publish_approved_event_candidate(p_candidate_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE candidate public.inventory_candidates%rowtype; moment_id uuid; starts timestamptz; venue uuid;
BEGIN
  SELECT * INTO candidate FROM public.inventory_candidates WHERE id=p_candidate_id FOR UPDATE;
  IF NOT FOUND OR candidate.entity_type<>'moment' OR candidate.review_status<>'approved' THEN RAISE EXCEPTION 'Approved event candidate required'; END IF;
  starts := (candidate.normalized_data->>'starts_at')::timestamptz;
  IF starts < now()-interval '12 hours' THEN RAISE EXCEPTION 'Cannot publish an expired event candidate'; END IF;
  venue := NULLIF(candidate.normalized_data->>'venue_id','')::uuid;
  INSERT INTO public.moments (
    title,slug,description,category,location,venue_id,venue_name,city,country,starts_at,ends_at,
    is_active,status,visibility,content_origin,recurrence_enabled,recurrence_frequency,recurrence_interval,
    recurrence_by_weekday,recurrence_until,inventory_candidate_id,external_source_url,external_attribution,
    external_last_checked_at,ownership_status,source_confidence,schedule_precision,seo_title,seo_description
  ) VALUES (
    candidate.normalized_data->>'title', public.slugify(candidate.normalized_data->>'title')||'-'||left(candidate.id::text,8),
    candidate.normalized_data->>'description', COALESCE(candidate.normalized_data->>'category','community'),
    candidate.normalized_data->>'location', venue, candidate.normalized_data->>'venue_name',
    candidate.normalized_data->>'city','Jamaica',starts,NULLIF(candidate.normalized_data->>'ends_at','')::timestamptz,
    true,'scheduled','open','imported',COALESCE((candidate.normalized_data->>'recurrence_enabled')::boolean,false),
    NULLIF(candidate.normalized_data->>'recurrence_frequency','')::public.moment_recurrence_frequency,
    COALESCE((candidate.normalized_data->>'recurrence_interval')::integer,1),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(candidate.normalized_data->'recurrence_by_weekday','[]'::jsonb))::smallint),'{}'::smallint[]),
    NULLIF(candidate.normalized_data->>'recurrence_until','')::timestamptz,candidate.id,candidate.source_url,'Source: Visit Jamaica',
    candidate.source_last_checked_at,'unclaimed',candidate.confidence,COALESCE(candidate.normalized_data->>'schedule_precision','exact'),candidate.normalized_data->>'title',left(candidate.normalized_data->>'description',155)
  ) ON CONFLICT (inventory_candidate_id) DO UPDATE SET
    starts_at=excluded.starts_at,ends_at=excluded.ends_at,venue_id=excluded.venue_id,venue_name=excluded.venue_name,
    location=excluded.location,external_last_checked_at=excluded.external_last_checked_at,source_confidence=excluded.source_confidence,updated_at=now()
  RETURNING id INTO moment_id;
  UPDATE public.inventory_candidates SET review_status='published',published_record_id=moment_id::text,updated_at=now() WHERE id=candidate.id;
  RETURN moment_id;
END; $$;
REVOKE ALL ON FUNCTION public.publish_approved_event_candidate(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_approved_event_candidate(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.claim_event_verification(p_mission_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE contributor uuid:=auth.uid(); claim_id uuid;
BEGIN
  IF contributor IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  UPDATE public.event_verification_claims SET status='expired',updated_at=now() WHERE mission_id=p_mission_id AND status='claimed' AND expires_at<=now();
  IF EXISTS(SELECT 1 FROM public.event_verification_claims WHERE mission_id=p_mission_id AND status IN ('claimed','submitted')) THEN RAISE EXCEPTION 'Mission already claimed'; END IF;
  INSERT INTO public.event_verification_claims(mission_id,contributor_id) VALUES(p_mission_id,contributor) RETURNING id INTO claim_id;
  UPDATE public.event_verification_missions SET status='claimed',active_claim_id=claim_id,updated_at=now() WHERE id=p_mission_id AND status IN ('open','claimed');
  IF NOT FOUND THEN RAISE EXCEPTION 'Mission unavailable'; END IF; RETURN claim_id;
END; $$;

CREATE OR REPLACE FUNCTION public.submit_event_verification(p_claim_id uuid,p_proposed_value jsonb,p_proof jsonb,p_notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  UPDATE public.event_verification_claims SET status='submitted',proposed_value=p_proposed_value,proof=COALESCE(p_proof,'[]'),contributor_notes=p_notes,submitted_at=now(),updated_at=now()
  WHERE id=p_claim_id AND contributor_id=auth.uid() AND status='claimed' AND expires_at>now();
  IF NOT FOUND THEN RAISE EXCEPTION 'Active claim not found'; END IF;
  UPDATE public.event_verification_missions mission SET status='submitted',updated_at=now() FROM public.event_verification_claims claim WHERE claim.id=p_claim_id AND mission.id=claim.mission_id;
END; $$;
REVOKE ALL ON FUNCTION public.claim_event_verification(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_event_verification(uuid,jsonb,jsonb,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_event_verification(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_event_verification(uuid,jsonb,jsonb,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_event_verification(p_claim_id uuid,p_decision text,p_reviewer_notes text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE reviewer uuid:=auth.uid(); claim public.event_verification_claims%rowtype; mission public.event_verification_missions%rowtype; candidate public.inventory_candidates%rowtype; tx uuid; discovery_type text;
BEGIN
  IF reviewer IS NULL OR NOT public.is_enrichment_reviewer(reviewer) THEN RAISE EXCEPTION 'Admin review permission required'; END IF;
  IF p_decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Decision must be approved or rejected'; END IF;
  SELECT * INTO claim FROM public.event_verification_claims WHERE id=p_claim_id FOR UPDATE;
  IF NOT FOUND OR claim.status<>'submitted' THEN RAISE EXCEPTION 'Submitted claim not found'; END IF;
  SELECT * INTO mission FROM public.event_verification_missions WHERE id=claim.mission_id FOR UPDATE;
  SELECT * INTO candidate FROM public.inventory_candidates WHERE id=mission.inventory_candidate_id FOR UPDATE;
  IF p_decision='rejected' THEN
    UPDATE public.event_verification_claims SET status='rejected',reviewer_notes=p_reviewer_notes,reviewed_by=reviewer,reviewed_at=now(),updated_at=now() WHERE id=claim.id;
    UPDATE public.event_verification_missions SET status='open',active_claim_id=NULL,updated_at=now() WHERE id=mission.id;
    RETURN jsonb_build_object('status','rejected');
  END IF;
  SELECT id INTO tx FROM public.post_economy_transaction(claim.contributor_id,'points',mission.reward_points,'earn','event_verification','event-verification:'||claim.id,claim.id,'event_verification_claims','Approved Jamaica event verification',jsonb_build_object('candidate_id',candidate.id,'mission_type',mission.mission_type));
  UPDATE public.event_verification_claims SET status='approved',reviewer_notes=p_reviewer_notes,reviewed_by=reviewer,reviewed_at=now(),reward_points_awarded=mission.reward_points,economy_transaction_id=tx,updated_at=now() WHERE id=claim.id;
  UPDATE public.event_verification_missions SET status='verified',active_claim_id=NULL,updated_at=now() WHERE id=mission.id;
  UPDATE public.inventory_candidates SET normalized_data=normalized_data||jsonb_build_object('verified_facts',COALESCE(normalized_data->'verified_facts','{}'::jsonb)||jsonb_build_object(mission.mission_type,COALESCE(claim.proposed_value,'{}'::jsonb))),updated_at=now() WHERE id=candidate.id;
  discovery_type:='event_'||mission.mission_type||'_verification';
  UPDATE public.discovery_questions SET status='resolved',metadata=metadata||jsonb_build_object('resolution','scout_verified','resolved_at',now()),updated_at=now() WHERE inventory_candidate_id=candidate.id AND question_type=discovery_type;
  RETURN jsonb_build_object('status','approved','points',mission.reward_points,'transaction_id',tx);
END; $$;
REVOKE ALL ON FUNCTION public.review_event_verification(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_event_verification(uuid,text,text) TO authenticated;

CREATE OR REPLACE VIEW public.view_public_event_verification_missions AS
SELECT mission.id,mission.mission_type,mission.title,mission.instructions,mission.proof_requirements,mission.reward_points,mission.status,
       candidate.normalized_data->>'title' AS event_title,candidate.normalized_data->>'starts_at' AS proposed_start,
       candidate.normalized_data->>'venue_name' AS proposed_venue,candidate.normalized_data->>'city' AS city,candidate.source_url
FROM public.event_verification_missions mission JOIN public.inventory_candidates candidate ON candidate.id=mission.inventory_candidate_id
WHERE mission.status IN ('open','claimed');
GRANT SELECT ON public.view_public_event_verification_missions TO anon,authenticated;

CREATE OR REPLACE VIEW public.view_my_event_verification_claims AS
SELECT claim.id,claim.status,claim.proposed_value,claim.proof,claim.contributor_notes,claim.reviewer_notes,claim.claimed_at,claim.expires_at,claim.submitted_at,claim.reviewed_at,claim.reward_points_awarded,
       mission.mission_type,mission.title,mission.instructions,mission.proof_requirements,mission.reward_points,
       candidate.normalized_data->>'title' AS event_title,candidate.normalized_data->>'starts_at' AS proposed_start,candidate.source_url
FROM public.event_verification_claims claim JOIN public.event_verification_missions mission ON mission.id=claim.mission_id JOIN public.inventory_candidates candidate ON candidate.id=mission.inventory_candidate_id
WHERE claim.contributor_id=auth.uid();
CREATE OR REPLACE VIEW public.view_event_verification_review_queue AS
SELECT claim.id,claim.contributor_id,claim.proposed_value,claim.proof,claim.contributor_notes,claim.submitted_at,
       mission.mission_type,mission.title,mission.instructions,mission.reward_points,
       candidate.normalized_data->>'title' AS event_title,candidate.normalized_data->>'starts_at' AS proposed_start,candidate.normalized_data->>'venue_name' AS proposed_venue,candidate.source_url
FROM public.event_verification_claims claim JOIN public.event_verification_missions mission ON mission.id=claim.mission_id JOIN public.inventory_candidates candidate ON candidate.id=mission.inventory_candidate_id
WHERE claim.status='submitted' AND public.is_enrichment_reviewer(auth.uid());
GRANT SELECT ON public.view_my_event_verification_claims TO authenticated;
GRANT SELECT ON public.view_event_verification_review_queue TO authenticated;
NOTIFY pgrst,'reload schema';
