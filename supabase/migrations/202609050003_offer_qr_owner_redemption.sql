-- QR fulfillment is a merchant-scan journey. Only the issuing business can redeem it.

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
  IF v_offer.fulfillment_type IN ('merchant_validation', 'qr') AND v_offer.owner_user_id <> p_actor_user_id THEN
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

REVOKE ALL ON FUNCTION public.redeem_offer_atomic(uuid,text,uuid,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_offer_atomic(uuid,text,uuid,text) TO service_role;

NOTIFY pgrst, 'reload schema';
