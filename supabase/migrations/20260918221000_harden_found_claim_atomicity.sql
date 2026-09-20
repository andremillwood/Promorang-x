-- A Found claim and its promised finder PromoCard slip are one transaction.
-- Return only a redemption code that is actually persisted.

CREATE OR REPLACE FUNCTION public.claim_found_listing(p_listing_id uuid)
RETURNS TABLE (
  listing_id uuid,
  title text,
  kind text,
  perk_to_finder text,
  status text,
  keep text,
  slip_code text,
  already_claimed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing public.found_listings%ROWTYPE;
  v_poll_id text;
  v_code text;
  v_keep text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sign in to claim this.';
  END IF;

  SELECT * INTO v_listing
  FROM public.found_listings
  WHERE id = p_listing_id
  FOR UPDATE;

  IF v_listing.id IS NULL THEN
    RETURN;
  END IF;

  IF v_listing.status = 'claimed' THEN
    listing_id := v_listing.id;
    title := v_listing.title;
    kind := v_listing.kind;
    perk_to_finder := v_listing.perk_to_finder;
    status := v_listing.status;
    keep := 'workspace';
    slip_code := NULL;
    already_claimed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  UPDATE public.found_listings
  SET
    status = 'claimed',
    claimant_user_id = auth.uid(),
    claimed_at = now()
  WHERE id = v_listing.id
    AND status = 'unclaimed'
  RETURNING * INTO v_listing;

  IF v_listing.id IS NULL OR v_listing.status <> 'claimed' THEN
    RAISE EXCEPTION 'Could not claim that request yet.';
  END IF;

  v_keep := 'workspace';
  v_code := NULL;
  v_poll_id := 'found:' || v_listing.id::text;

  IF v_listing.finder_user_id IS NOT NULL AND v_listing.finder_user_id = auth.uid() THEN
    v_keep := 'workspace';
  ELSIF v_listing.finder_user_id IS NOT NULL THEN
    SELECT unlocks.redemption_code
      INTO v_code
    FROM public.discovery_card_unlocks unlocks
    WHERE unlocks.poll_id = v_poll_id
      AND unlocks.user_id = v_listing.finder_user_id
    LIMIT 1;

    IF v_code IS NULL THEN
      v_code := 'PR-' || upper(substr(replace(v_listing.id::text, '-', ''), 1, 4))
        || upper(substr(md5(random()::text), 1, 4));

      INSERT INTO public.discovery_card_unlocks (
        city, poll_id, poll_question, perk_title, query_raw,
        user_id, anonymous_id, redemption_code, status
      ) VALUES (
        v_listing.city, v_poll_id, v_listing.title, v_listing.perk_to_finder, v_listing.words,
        v_listing.finder_user_id, NULL, v_code, 'claimed'
      )
      ON CONFLICT DO NOTHING
      RETURNING redemption_code INTO v_code;

      IF v_code IS NULL THEN
        SELECT unlocks.redemption_code
          INTO v_code
        FROM public.discovery_card_unlocks unlocks
        WHERE unlocks.poll_id = v_poll_id
          AND unlocks.user_id = v_listing.finder_user_id
        LIMIT 1;
      END IF;
    END IF;

    IF v_code IS NULL THEN
      RAISE EXCEPTION 'Could not issue the finder PromoCard slip.';
    END IF;
    v_keep := 'slip';
  ELSIF v_listing.finder_anon_id IS NOT NULL THEN
    SELECT unlocks.redemption_code
      INTO v_code
    FROM public.discovery_card_unlocks unlocks
    WHERE unlocks.poll_id = v_poll_id
      AND unlocks.anonymous_id = v_listing.finder_anon_id
    LIMIT 1;

    IF v_code IS NULL THEN
      v_code := 'PR-' || upper(substr(replace(v_listing.id::text, '-', ''), 1, 4))
        || upper(substr(md5(random()::text), 1, 4));

      INSERT INTO public.discovery_card_unlocks (
        city, poll_id, poll_question, perk_title, query_raw,
        user_id, anonymous_id, redemption_code, status
      ) VALUES (
        v_listing.city, v_poll_id, v_listing.title, v_listing.perk_to_finder, v_listing.words,
        NULL, v_listing.finder_anon_id, v_code, 'claimed'
      )
      ON CONFLICT DO NOTHING
      RETURNING redemption_code INTO v_code;

      IF v_code IS NULL THEN
        SELECT unlocks.redemption_code
          INTO v_code
        FROM public.discovery_card_unlocks unlocks
        WHERE unlocks.poll_id = v_poll_id
          AND unlocks.anonymous_id = v_listing.finder_anon_id
        LIMIT 1;
      END IF;
    END IF;

    IF v_code IS NULL THEN
      RAISE EXCEPTION 'Could not issue the finder PromoCard slip.';
    END IF;
    v_keep := 'slip';
  END IF;

  listing_id := v_listing.id;
  title := v_listing.title;
  kind := v_listing.kind;
  perk_to_finder := v_listing.perk_to_finder;
  status := v_listing.status;
  keep := v_keep;
  slip_code := v_code;
  already_claimed := false;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_found_listing(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_found_listing(uuid) TO authenticated;
