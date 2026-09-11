-- True weekly AftrHrs night: one Friday edition, 30 new digital passes,
-- unused last-week passes expire Saturday 06:00 America/Jamaica, guests can claim again.

ALTER TABLE public.event_editions
  ADD COLUMN IF NOT EXISTS week_friday date;

UPDATE public.event_editions
SET week_friday = '2026-09-11'
WHERE slug = 'aftrhrs'
  AND week_friday IS NULL;

UPDATE public.event_passes p
SET edition_id = e.id
FROM public.event_editions e
WHERE p.edition_id IS NULL
  AND e.moment_id = p.event_id
  AND e.slug = 'aftrhrs';

CREATE UNIQUE INDEX IF NOT EXISTS event_editions_moment_week_friday
  ON public.event_editions(moment_id, week_friday)
  WHERE week_friday IS NOT NULL;

DROP INDEX IF EXISTS public.event_passes_one_digital_free_per_user;
DROP INDEX IF EXISTS public.event_passes_one_digital_free_per_email;
DROP INDEX IF EXISTS public.event_passes_one_digital_free_per_phone;

CREATE UNIQUE INDEX IF NOT EXISTS event_passes_one_digital_free_per_user_edition
  ON public.event_passes(edition_id, user_id)
  WHERE pass_type = 'digital-free' AND status IN ('active', 'redeemed', 'transferred') AND edition_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS event_passes_one_digital_free_per_email_edition
  ON public.event_passes(edition_id, email_normalized)
  WHERE pass_type = 'digital-free' AND status IN ('active', 'redeemed', 'transferred') AND email_normalized IS NOT NULL AND edition_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS event_passes_one_digital_free_per_phone_edition
  ON public.event_passes(edition_id, phone_normalized)
  WHERE pass_type = 'digital-free' AND status IN ('active', 'redeemed', 'transferred') AND phone_normalized IS NOT NULL AND edition_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.aftrhrs_claim_friday(p_now timestamptz DEFAULT now())
RETURNS date
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  WITH j AS (
    SELECT
      (p_now AT TIME ZONE 'America/Jamaica')::date AS d,
      EXTRACT(DOW FROM (p_now AT TIME ZONE 'America/Jamaica'))::int AS dow,
      EXTRACT(HOUR FROM (p_now AT TIME ZONE 'America/Jamaica'))::int AS hour
  )
  SELECT CASE
    WHEN dow = 6 AND hour < 6 THEN d - 1
    WHEN dow = 5 THEN d
    WHEN dow = 6 THEN d + 6
    ELSE d + (5 - dow)
  END
  FROM j;
$$;

CREATE OR REPLACE FUNCTION public.ensure_aftrhrs_weekly_edition(p_now timestamptz DEFAULT now())
RETURNS public.event_editions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_moment_id uuid := '00000000-0000-0000-0002-000000000080';
  v_friday date;
  v_edition public.event_editions%ROWTYPE;
  v_prev public.event_editions%ROWTYPE;
  v_slug text;
BEGIN
  v_friday := public.aftrhrs_claim_friday(p_now);

  UPDATE public.event_passes AS p
  SET status = 'expired',
      updated_at = now()
  FROM public.event_editions AS e
  WHERE p.edition_id = e.id
    AND e.moment_id = v_moment_id
    AND e.week_friday IS NOT NULL
    AND e.week_friday < v_friday
    AND p.status = 'active';

  SELECT * INTO v_edition
  FROM public.event_editions
  WHERE moment_id = v_moment_id
    AND week_friday = v_friday
  LIMIT 1;

  IF FOUND THEN
    RETURN v_edition;
  END IF;

  SELECT * INTO v_prev
  FROM public.event_editions
  WHERE moment_id = v_moment_id
  ORDER BY week_friday DESC NULLS LAST, created_at DESC
  LIMIT 1;

  v_slug := CASE
    WHEN v_friday = DATE '2026-09-11' THEN 'aftrhrs'
    ELSE 'aftrhrs-' || v_friday::text
  END;

  INSERT INTO public.event_editions (
    moment_id, venue_id, slug, title, tagline, supporting_copy, powered_by,
    music_categories, published, page_mode, claims_open, digital_allocation,
    digital_claimed, claim_opens_at, claim_closes_at, capacity_information,
    paid_admission_jmd, paid_patron_benefit, venue_policies, faqs, artwork,
    metadata, week_friday
  ) VALUES (
    v_moment_id,
    COALESCE(v_prev.venue_id, '00000000-0000-0000-0003-000000000080'::uuid),
    v_slug,
    COALESCE(v_prev.title, 'AftrHrs'),
    COALESCE(v_prev.tagline, 'After hours is where house lives.'),
    COALESCE(v_prev.supporting_copy, ''),
    COALESCE(v_prev.powered_by, 'Origin — Alric & Boyd'),
    COALESCE(v_prev.music_categories, ARRAY['Afro House', 'Classic House', 'House Fusion']::text[]),
    true,
    'live',
    true,
    30,
    0,
    NULL,
    NULL,
    v_prev.capacity_information,
    COALESCE(v_prev.paid_admission_jmd, 2000),
    COALESCE(v_prev.paid_patron_benefit, 'Complimentary drink and wings'),
    COALESCE(v_prev.venue_policies, '{}'::jsonb),
    COALESCE(v_prev.faqs, '[]'::jsonb),
    COALESCE(v_prev.artwork, '{}'::jsonb),
    COALESCE(v_prev.metadata, '{}'::jsonb),
    v_friday
  )
  ON CONFLICT (slug) DO UPDATE
    SET week_friday = EXCLUDED.week_friday,
        claims_open = true,
        page_mode = 'live',
        updated_at = now()
  RETURNING * INTO v_edition;

  IF v_edition.id IS NULL THEN
    SELECT * INTO v_edition
    FROM public.event_editions
    WHERE moment_id = v_moment_id
      AND week_friday = v_friday
    LIMIT 1;
  END IF;

  RETURN v_edition;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_aftrhrs_digital_pass(
  p_user_id uuid,
  p_event_id uuid,
  p_terms_accepted boolean DEFAULT false,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_campaign text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_edition public.event_editions%ROWTYPE;
  v_pass public.event_passes%ROWTYPE;
  v_code text;
  v_email text;
  v_phone text;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;
  IF p_terms_accepted IS NOT TRUE THEN
    RAISE EXCEPTION 'TERMS_REQUIRED';
  END IF;

  v_edition := public.ensure_aftrhrs_weekly_edition();

  v_email := NULLIF(lower(trim(COALESCE(p_email, ''))), '');
  v_phone := NULLIF(regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g'), '');
  IF v_phone IS NOT NULL AND length(v_phone) < 7 THEN
    v_phone := NULL;
  ELSIF v_phone IS NOT NULL AND length(v_phone) = 11 AND left(v_phone, 1) = '1' THEN
    v_phone := substr(v_phone, 2);
  END IF;

  SELECT * INTO v_edition
  FROM public.event_editions
  WHERE id = v_edition.id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND';
  END IF;
  IF v_edition.published IS NOT TRUE THEN
    RAISE EXCEPTION 'UNPUBLISHED';
  END IF;
  IF v_edition.claims_open IS NOT TRUE THEN
    RAISE EXCEPTION 'CLAIMS_CLOSED';
  END IF;
  IF v_edition.claim_opens_at IS NOT NULL AND now() < v_edition.claim_opens_at THEN
    RAISE EXCEPTION 'CLAIMS_CLOSED';
  END IF;
  IF v_edition.claim_closes_at IS NOT NULL AND now() >= v_edition.claim_closes_at THEN
    RAISE EXCEPTION 'DEADLINE';
  END IF;
  IF v_edition.digital_claimed >= v_edition.digital_allocation THEN
    RAISE EXCEPTION 'SOLD_OUT';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.event_passes
    WHERE edition_id = v_edition.id
      AND user_id = p_user_id
      AND pass_type = 'digital-free'
      AND status IN ('active', 'redeemed', 'transferred')
  ) THEN
    RAISE EXCEPTION 'ALREADY_CLAIMED';
  END IF;

  IF v_email IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.event_passes
    WHERE edition_id = v_edition.id
      AND email_normalized = v_email
      AND pass_type = 'digital-free'
      AND status IN ('active', 'redeemed', 'transferred')
  ) THEN
    RAISE EXCEPTION 'IDENTITY_CLAIMED';
  END IF;

  IF v_phone IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.event_passes
    WHERE edition_id = v_edition.id
      AND phone_normalized = v_phone
      AND pass_type = 'digital-free'
      AND status IN ('active', 'redeemed', 'transferred')
  ) THEN
    RAISE EXCEPTION 'IDENTITY_CLAIMED';
  END IF;

  v_code := 'AH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.event_passes (
    event_id, edition_id, user_id, pass_type, unique_code, qr_payload, status,
    claim_source, campaign, referrer, email_normalized, phone_normalized, metadata
  ) VALUES (
    p_event_id, v_edition.id, p_user_id, 'digital-free', v_code,
    'promorang://aftrhrs/redeem/' || v_code, 'active',
    COALESCE(p_source, 'landing'), p_campaign, p_referrer, v_email, v_phone,
    COALESCE(p_metadata, '{}'::jsonb)
  ) RETURNING * INTO v_pass;

  UPDATE public.event_editions
  SET digital_claimed = digital_claimed + 1, updated_at = now()
  WHERE id = v_edition.id
    AND digital_claimed < digital_allocation
  RETURNING * INTO v_edition;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SOLD_OUT';
  END IF;

  INSERT INTO public.event_moment_participations (user_id, event_id, state, source, referrer)
  VALUES (p_user_id, p_event_id, 'digital_pass_claimed', COALESCE(p_source, 'landing'), p_referrer)
  ON CONFLICT (user_id, event_id) DO UPDATE SET
    state = 'digital_pass_claimed',
    source = COALESCE(public.event_moment_participations.source, EXCLUDED.source),
    referrer = COALESCE(EXCLUDED.referrer, public.event_moment_participations.referrer),
    updated_at = now();

  RETURN jsonb_build_object(
    'pass', to_jsonb(v_pass),
    'remaining', v_edition.digital_allocation - v_edition.digital_claimed,
    'sold_out', v_edition.digital_claimed >= v_edition.digital_allocation
  );
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'ALREADY_CLAIMED';
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_aftrhrs_pass(
  p_actor_user_id uuid,
  p_code text,
  p_notes text DEFAULT NULL,
  p_device jsonb DEFAULT '{}'::jsonb
) RETURNS public.event_passes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_pass public.event_passes%ROWTYPE;
  v_code text;
BEGIN
  PERFORM public.ensure_aftrhrs_weekly_edition();

  v_code := upper(trim(COALESCE(p_code, '')));
  v_code := regexp_replace(v_code, '^PROMORANG://AFTRHRS/REDEEM/', '');

  SELECT * INTO v_pass
  FROM public.event_passes
  WHERE unique_code = v_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
  IF v_pass.status = 'redeemed' THEN
    RAISE EXCEPTION 'ALREADY_REDEEMED';
  END IF;
  IF v_pass.status <> 'active' THEN
    RAISE EXCEPTION 'NOT_REDEEMABLE';
  END IF;

  UPDATE public.event_passes
  SET status = 'redeemed',
      redeemed_at = now(),
      redeemed_by = p_actor_user_id,
      validation_metadata = COALESCE(p_device, '{}'::jsonb) || jsonb_build_object('notes', p_notes),
      updated_at = now()
  WHERE id = v_pass.id
  RETURNING * INTO v_pass;

  INSERT INTO public.event_moment_participations (user_id, event_id, state, source)
  VALUES (v_pass.user_id, v_pass.event_id, 'checked_in', 'door')
  ON CONFLICT (user_id, event_id) DO UPDATE SET
    state = 'checked_in',
    updated_at = now();

  RETURN v_pass;
END;
$$;

CREATE OR REPLACE FUNCTION public.fulfill_aftrhrs_invitation(
  p_ambassador_id uuid,
  p_event_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_request_id uuid DEFAULT NULL,
  p_unique_code text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_alloc public.event_ambassador_allocations%ROWTYPE;
  v_pass public.event_passes%ROWTYPE;
  v_edition public.event_editions%ROWTYPE;
  v_code text;
  v_phone text;
BEGIN
  v_edition := public.ensure_aftrhrs_weekly_edition();

  SELECT * INTO v_alloc
  FROM public.event_ambassador_allocations
  WHERE ambassador_user_id = p_ambassador_id AND event_id = p_event_id
  FOR UPDATE;

  IF NOT FOUND OR v_alloc.approved IS NOT TRUE OR v_alloc.active IS NOT TRUE THEN
    RAISE EXCEPTION 'AMBASSADOR_NOT_FOUND';
  END IF;
  IF v_alloc.distributed >= v_alloc.allocation THEN
    RAISE EXCEPTION 'ALLOCATION_EXHAUSTED';
  END IF;

  v_phone := NULLIF(regexp_replace(COALESCE(p_phone, ''), '\D', '', 'g'), '');
  IF v_phone IS NOT NULL AND length(v_phone) < 7 THEN
    v_phone := NULL;
  ELSIF v_phone IS NOT NULL AND length(v_phone) = 11 AND left(v_phone, 1) = '1' THEN
    v_phone := substr(v_phone, 2);
  END IF;
  v_code := COALESCE(NULLIF(upper(trim(p_unique_code)), ''), 'AH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

  INSERT INTO public.event_passes (
    event_id, edition_id, user_id, pass_type, unique_code, qr_payload, status,
    claim_source, campaign, referrer, ambassador_id, phone_normalized
  ) VALUES (
    p_event_id,
    v_edition.id,
    COALESCE(p_user_id, p_ambassador_id),
    'physical-invitation',
    v_code,
    'promorang://aftrhrs/redeem/' || v_code,
    'active',
    'ambassador',
    v_alloc.tracking_code,
    p_ambassador_id::text,
    p_ambassador_id,
    v_phone
  ) RETURNING * INTO v_pass;

  UPDATE public.event_ambassador_allocations
  SET distributed = distributed + 1, updated_at = now()
  WHERE id = v_alloc.id AND distributed < allocation
  RETURNING * INTO v_alloc;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ALLOCATION_EXHAUSTED';
  END IF;

  IF p_request_id IS NOT NULL THEN
    UPDATE public.event_ambassador_requests
    SET status = 'fulfilled', pass_id = v_pass.id, ambassador_id = p_ambassador_id, fulfilled_at = now(), updated_at = now()
    WHERE id = p_request_id;
  END IF;

  IF p_user_id IS NOT NULL THEN
    INSERT INTO public.event_moment_participations (user_id, event_id, state, source, referrer)
    VALUES (p_user_id, p_event_id, 'physical_invitation_secured', 'ambassador', p_ambassador_id::text)
    ON CONFLICT (user_id, event_id) DO UPDATE SET
      state = 'physical_invitation_secured',
      updated_at = now();
  END IF;

  RETURN jsonb_build_object(
    'pass', to_jsonb(v_pass),
    'remaining', v_alloc.allocation - v_alloc.distributed
  );
END;
$$;

REVOKE ALL ON FUNCTION public.aftrhrs_claim_friday(timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_aftrhrs_weekly_edition(timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_aftrhrs_digital_pass(uuid, uuid, boolean, text, text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.redeem_aftrhrs_pass(uuid, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fulfill_aftrhrs_invitation(uuid, uuid, uuid, text, uuid, text) FROM PUBLIC, anon, authenticated;
