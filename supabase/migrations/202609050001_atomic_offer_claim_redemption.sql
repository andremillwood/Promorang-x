-- Make offer claim, drop claim, and redemption authoritative database transactions.
-- These functions accept a user id because the API uses the service role. They are
-- intentionally unavailable to browser roles; the API must authenticate the caller.

CREATE OR REPLACE FUNCTION public.claim_offer_atomic(
  p_user_id uuid,
  p_offer_id uuid,
  p_source_event_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS public.offer_issuances
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offer public.offers%ROWTYPE;
  v_distribution public.offer_distributions%ROWTYPE;
  v_issuance public.offer_issuances%ROWTYPE;
  v_active_count integer;
  v_source_event text;
BEGIN
  IF p_user_id IS NULL OR p_offer_id IS NULL THEN RAISE EXCEPTION 'User and offer are required'; END IF;

  SELECT * INTO v_offer FROM public.offers WHERE id = p_offer_id FOR UPDATE;
  IF NOT FOUND OR v_offer.status <> 'active' OR v_offer.starts_at > now()
     OR (v_offer.ends_at IS NOT NULL AND v_offer.ends_at <= now()) THEN
    RAISE EXCEPTION 'Offer unavailable';
  END IF;

  SELECT * INTO v_distribution
  FROM public.offer_distributions
  WHERE offer_id = p_offer_id AND channel = 'direct' AND is_active
  ORDER BY created_at, id LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This offer is not available for direct claim'; END IF;

  SELECT count(*) INTO v_active_count
  FROM public.offer_issuances
  WHERE offer_id = p_offer_id AND user_id = p_user_id
    AND status IN ('issued','claimed','fulfillment_pending','redeemed');
  IF v_active_count >= v_offer.per_user_limit THEN RAISE EXCEPTION 'Offer already claimed'; END IF;
  IF v_offer.quantity_total IS NOT NULL
     AND v_offer.quantity_reserved + v_offer.quantity_redeemed >= v_offer.quantity_total THEN
    RAISE EXCEPTION 'Offer out of stock';
  END IF;
  IF v_distribution.allocation_limit IS NOT NULL
     AND v_distribution.allocation_count >= v_distribution.allocation_limit THEN
    RAISE EXCEPTION 'Offer allocation exhausted';
  END IF;

  v_source_event := coalesce(nullif(p_source_event_id,''), 'direct:' || p_offer_id::text || ':' || p_user_id::text);
  INSERT INTO public.offer_issuances(
    offer_id, distribution_id, user_id, source_event_id, redemption_code,
    expires_at, metadata
  ) VALUES (
    p_offer_id, v_distribution.id, p_user_id, v_source_event,
    'PR-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
    now() + make_interval(days => v_offer.claim_expires_days), coalesce(p_metadata,'{}'::jsonb)
  ) RETURNING * INTO v_issuance;

  UPDATE public.offers SET quantity_reserved = quantity_reserved + 1 WHERE id = p_offer_id;
  UPDATE public.offer_distributions SET allocation_count = allocation_count + 1 WHERE id = v_distribution.id;
  INSERT INTO public.offer_redemption_events(issuance_id,event_type,actor_user_id,metadata)
    VALUES(v_issuance.id,'issued',p_user_id,jsonb_build_object('channel','direct','event',v_distribution.trigger_event));
  RETURN v_issuance;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'Offer already claimed';
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_community_drop_atomic(
  p_user_id uuid,
  p_slug text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_drop public.community_drops%ROWTYPE;
  v_claim public.community_drop_claims%ROWTYPE;
  v_issuance public.offer_issuances%ROWTYPE;
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'Sign in to claim this'; END IF;
  SELECT * INTO v_drop FROM public.community_drops WHERE slug = p_slug FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This drop is no longer available'; END IF;
  IF v_drop.status <> 'active' THEN RAISE EXCEPTION 'This drop has closed'; END IF;
  IF v_drop.remaining IS NOT NULL AND v_drop.remaining <= 0 THEN RAISE EXCEPTION 'It is already gone'; END IF;

  SELECT * INTO v_claim FROM public.community_drop_claims
    WHERE drop_id = v_drop.id AND user_id = p_user_id;
  IF FOUND THEN
    RETURN jsonb_build_object('already_claimed',true,'drop',to_jsonb(v_drop),'claim',to_jsonb(v_claim));
  END IF;

  IF v_drop.offer_id IS NOT NULL THEN
    v_issuance := public.claim_offer_atomic(
      p_user_id, v_drop.offer_id,
      'drop:' || v_drop.id::text || ':' || p_user_id::text,
      jsonb_build_object('drop_id',v_drop.id,'scene_id',v_drop.scene_id,'referrer_id',v_drop.creator_id,'contributor_id',v_drop.creator_id)
    );
  END IF;

  INSERT INTO public.community_drop_claims(drop_id,user_id,referrer_id,scene_id,offer_issuance_id,status,metadata)
  VALUES(v_drop.id,p_user_id,v_drop.creator_id,v_drop.scene_id,v_issuance.id,'claimed',jsonb_build_object('offer_id',v_drop.offer_id))
  RETURNING * INTO v_claim;

  IF v_drop.remaining IS NOT NULL THEN
    UPDATE public.community_drops
    SET remaining = remaining - 1,
        status = CASE WHEN remaining - 1 = 0 THEN 'exhausted' ELSE status END,
        updated_at = now()
    WHERE id = v_drop.id RETURNING * INTO v_drop;
  END IF;
  RETURN jsonb_build_object('already_claimed',false,'drop',to_jsonb(v_drop),'claim',to_jsonb(v_claim),'issuance',to_jsonb(v_issuance));
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_offer_atomic(
  p_actor_user_id uuid,
  p_redemption_code text,
  p_venue_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS public.offer_issuances
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_issuance public.offer_issuances%ROWTYPE;
  v_offer public.offers%ROWTYPE;
BEGIN
  SELECT * INTO v_issuance FROM public.offer_issuances
    WHERE redemption_code = upper(trim(p_redemption_code)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Redemption code not found'; END IF;
  IF v_issuance.status NOT IN ('claimed','issued','fulfillment_pending') THEN RAISE EXCEPTION 'Offer is not redeemable'; END IF;
  IF v_issuance.expires_at IS NOT NULL AND v_issuance.expires_at <= now() THEN RAISE EXCEPTION 'Offer has expired'; END IF;

  SELECT * INTO v_offer FROM public.offers WHERE id = v_issuance.offer_id FOR UPDATE;
  IF v_offer.fulfillment_type = 'merchant_validation' AND v_offer.owner_user_id <> p_actor_user_id THEN
    RAISE EXCEPTION 'Only the issuing business can validate this offer';
  END IF;

  UPDATE public.offer_issuances SET status='redeemed',redeemed_at=now(),redeemed_by=p_actor_user_id
    WHERE id=v_issuance.id RETURNING * INTO v_issuance;
  UPDATE public.offers SET quantity_reserved=greatest(0,quantity_reserved-1),quantity_redeemed=quantity_redeemed+1
    WHERE id=v_offer.id;
  UPDATE public.community_drop_claims SET status='redeemed' WHERE offer_issuance_id=v_issuance.id;
  INSERT INTO public.offer_redemption_events(issuance_id,event_type,actor_user_id,venue_id,notes)
    VALUES(v_issuance.id,'redeemed',p_actor_user_id,p_venue_id,p_notes);
  RETURN v_issuance;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_offer_atomic(uuid,uuid,text,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_community_drop_atomic(uuid,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.redeem_offer_atomic(uuid,text,uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_offer_atomic(uuid,uuid,text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_community_drop_atomic(uuid,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.redeem_offer_atomic(uuid,text,uuid,text) TO service_role;

DROP POLICY IF EXISTS community_drop_claims_insert ON public.community_drop_claims;
REVOKE INSERT, UPDATE, DELETE ON public.community_drop_claims FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.offer_issuances FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.offer_redemption_events FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';
