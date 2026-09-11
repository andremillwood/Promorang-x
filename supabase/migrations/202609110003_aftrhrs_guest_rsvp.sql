-- Public AftrHrs landing: Friday RSVP (weekly) and digital-pass drops (batches).
-- Guests give name, email, and telephone. No Promorang account required.

ALTER TABLE public.event_editions
  ADD COLUMN IF NOT EXISTS rsvp_allocation integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS rsvp_claimed integer NOT NULL DEFAULT 0;

UPDATE public.event_editions
SET rsvp_allocation = 30
WHERE moment_id = '00000000-0000-0000-0002-000000000080'
  AND (rsvp_allocation IS NULL OR rsvp_allocation < 30);

CREATE TABLE IF NOT EXISTS public.aftrhrs_digital_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key text NOT NULL,
  batch_index integer NOT NULL DEFAULT 1,
  allocation integer NOT NULL DEFAULT 50 CHECK (allocation >= 0),
  claimed integer NOT NULL DEFAULT 0 CHECK (claimed >= 0),
  claims_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT aftrhrs_digital_releases_claimed_within CHECK (claimed <= allocation)
);

CREATE UNIQUE INDEX IF NOT EXISTS aftrhrs_digital_releases_one_open
  ON public.aftrhrs_digital_releases ((true))
  WHERE claims_open = true;

CREATE TABLE IF NOT EXISTS public.aftrhrs_guest_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('rsvp', 'digital-pass')),
  full_name text NOT NULL,
  email text NOT NULL,
  email_normalized text NOT NULL,
  phone text NOT NULL,
  phone_normalized text NOT NULL,
  unique_code text NOT NULL UNIQUE,
  qr_payload text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'cancelled', 'expired', 'transferred')),
  edition_id uuid REFERENCES public.event_editions(id) ON DELETE SET NULL,
  week_friday date,
  release_id uuid REFERENCES public.aftrhrs_digital_releases(id) ON DELETE SET NULL,
  month_key text,
  terms_accepted_at timestamptz,
  source text,
  campaign text,
  referrer text,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  redeemed_at timestamptz,
  redeemed_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS aftrhrs_guest_one_rsvp_email_week
  ON public.aftrhrs_guest_entries(week_friday, email_normalized)
  WHERE kind = 'rsvp' AND status IN ('active', 'redeemed') AND week_friday IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS aftrhrs_guest_one_rsvp_phone_week
  ON public.aftrhrs_guest_entries(week_friday, phone_normalized)
  WHERE kind = 'rsvp' AND status IN ('active', 'redeemed') AND week_friday IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS aftrhrs_guest_one_pass_email_month
  ON public.aftrhrs_guest_entries(month_key, email_normalized)
  WHERE kind = 'digital-pass' AND status IN ('active', 'redeemed') AND month_key IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS aftrhrs_guest_one_pass_phone_month
  ON public.aftrhrs_guest_entries(month_key, phone_normalized)
  WHERE kind = 'digital-pass' AND status IN ('active', 'redeemed') AND month_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS aftrhrs_guest_entries_code_idx
  ON public.aftrhrs_guest_entries(unique_code);

CREATE INDEX IF NOT EXISTS aftrhrs_guest_entries_kind_status_idx
  ON public.aftrhrs_guest_entries(kind, status, claimed_at DESC);

INSERT INTO public.aftrhrs_digital_releases (month_key, batch_index, allocation, claimed, claims_open)
SELECT '2026-09', 1, 50, 0, true
WHERE NOT EXISTS (SELECT 1 FROM public.aftrhrs_digital_releases);

ALTER TABLE public.aftrhrs_digital_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aftrhrs_guest_entries ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.aftrhrs_month_key(p_now timestamptz DEFAULT now())
RETURNS text
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT to_char((p_now AT TIME ZONE 'America/Jamaica'), 'YYYY-MM');
$$;

CREATE OR REPLACE FUNCTION public.aftrhrs_expire_stale_guest_entries(p_now timestamptz DEFAULT now())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_friday date;
  v_month text;
BEGIN
  v_friday := public.aftrhrs_claim_friday(p_now);
  v_month := public.aftrhrs_month_key(p_now);

  UPDATE public.aftrhrs_guest_entries
  SET status = 'expired',
      updated_at = now()
  WHERE kind = 'rsvp'
    AND status = 'active'
    AND week_friday IS NOT NULL
    AND week_friday < v_friday;

  UPDATE public.aftrhrs_guest_entries
  SET status = 'expired',
      updated_at = now()
  WHERE kind = 'digital-pass'
    AND status = 'active'
    AND month_key IS NOT NULL
    AND month_key < v_month;
END;
$$;

CREATE OR REPLACE FUNCTION public.aftrhrs_ensure_digital_release(p_now timestamptz DEFAULT now())
RETURNS public.aftrhrs_digital_releases
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_release public.aftrhrs_digital_releases%ROWTYPE;
  v_month text;
BEGIN
  SELECT * INTO v_release
  FROM public.aftrhrs_digital_releases
  WHERE claims_open = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN v_release;
  END IF;

  SELECT * INTO v_release
  FROM public.aftrhrs_digital_releases
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN v_release;
  END IF;

  v_month := public.aftrhrs_month_key(p_now);

  INSERT INTO public.aftrhrs_digital_releases (month_key, batch_index, allocation, claimed, claims_open)
  VALUES (v_month, 1, 50, 0, true)
  RETURNING * INTO v_release;

  RETURN v_release;
END;
$$;

CREATE OR REPLACE FUNCTION public.aftrhrs_guest_rsvp(
  p_kind text,
  p_name text,
  p_email text,
  p_phone text,
  p_terms_accepted boolean DEFAULT false,
  p_source text DEFAULT NULL,
  p_campaign text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_now timestamptz DEFAULT now()
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_kind text;
  v_name text;
  v_email text;
  v_phone text;
  v_digits text;
  v_edition public.event_editions%ROWTYPE;
  v_release public.aftrhrs_digital_releases%ROWTYPE;
  v_code text;
  v_entry public.aftrhrs_guest_entries%ROWTYPE;
  v_existing public.aftrhrs_guest_entries%ROWTYPE;
  v_remaining integer;
BEGIN
  v_kind := lower(trim(p_kind));
  IF v_kind NOT IN ('rsvp', 'digital-pass') THEN
    RAISE EXCEPTION 'TERMS_REQUIRED';
  END IF;

  v_name := trim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  IF char_length(v_name) < 2 THEN
    RAISE EXCEPTION 'TERMS_REQUIRED';
  END IF;

  v_email := lower(trim(coalesce(p_email, '')));
  IF v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'TERMS_REQUIRED';
  END IF;

  v_digits := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  IF char_length(v_digits) = 11 AND left(v_digits, 1) = '1' THEN
    v_digits := substr(v_digits, 2);
  END IF;
  IF char_length(v_digits) < 7 THEN
    RAISE EXCEPTION 'TERMS_REQUIRED';
  END IF;
  v_phone := v_digits;

  IF p_terms_accepted IS NOT TRUE THEN
    RAISE EXCEPTION 'TERMS_REQUIRED';
  END IF;

  PERFORM public.aftrhrs_expire_stale_guest_entries(p_now);
  v_edition := public.ensure_aftrhrs_weekly_edition(p_now);

  IF v_edition.published IS NOT TRUE THEN
    RAISE EXCEPTION 'UNPUBLISHED';
  END IF;

  IF v_kind = 'rsvp' THEN
    SELECT * INTO v_existing
    FROM public.aftrhrs_guest_entries
    WHERE kind = 'rsvp'
      AND week_friday = v_edition.week_friday
      AND status IN ('active', 'redeemed')
      AND (email_normalized = v_email OR phone_normalized = v_phone)
    LIMIT 1;
    IF FOUND THEN
      RAISE EXCEPTION 'ALREADY_CLAIMED';
    END IF;
    IF coalesce(v_edition.rsvp_allocation, 30) - coalesce(v_edition.rsvp_claimed, 0) <= 0 THEN
      RAISE EXCEPTION 'SOLD_OUT';
    END IF;
  ELSE
    v_release := public.aftrhrs_ensure_digital_release(p_now);
    IF v_release.claims_open IS NOT TRUE OR (v_release.allocation - v_release.claimed) <= 0 THEN
      RAISE EXCEPTION 'CLAIMS_CLOSED';
    END IF;
    SELECT * INTO v_existing
    FROM public.aftrhrs_guest_entries
    WHERE kind = 'digital-pass'
      AND month_key = v_release.month_key
      AND status IN ('active', 'redeemed')
      AND (email_normalized = v_email OR phone_normalized = v_phone)
    LIMIT 1;
    IF FOUND THEN
      RAISE EXCEPTION 'ALREADY_CLAIMED';
    END IF;
  END IF;

  v_code := 'AH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.aftrhrs_guest_entries (
    kind, full_name, email, email_normalized, phone, phone_normalized,
    unique_code, qr_payload, status, edition_id, week_friday, release_id, month_key,
    terms_accepted_at, source, campaign, referrer
  ) VALUES (
    v_kind,
    v_name,
    trim(p_email),
    v_email,
    trim(p_phone),
    v_phone,
    v_code,
    'promorang://aftrhrs/redeem/' || v_code,
    'active',
    CASE WHEN v_kind = 'rsvp' THEN v_edition.id ELSE NULL END,
    CASE WHEN v_kind = 'rsvp' THEN v_edition.week_friday ELSE NULL END,
    CASE WHEN v_kind = 'digital-pass' THEN v_release.id ELSE NULL END,
    CASE WHEN v_kind = 'digital-pass' THEN v_release.month_key ELSE NULL END,
    now(),
    p_source,
    p_campaign,
    p_referrer
  )
  RETURNING * INTO v_entry;

  IF v_kind = 'rsvp' THEN
    UPDATE public.event_editions
    SET rsvp_claimed = coalesce(rsvp_claimed, 0) + 1,
        updated_at = now()
    WHERE id = v_edition.id
    RETURNING * INTO v_edition;
    v_remaining := greatest(0, coalesce(v_edition.rsvp_allocation, 30) - coalesce(v_edition.rsvp_claimed, 0));
  ELSE
    UPDATE public.aftrhrs_digital_releases
    SET claimed = claimed + 1,
        claims_open = CASE WHEN claimed + 1 >= allocation THEN false ELSE claims_open END,
        closed_at = CASE WHEN claimed + 1 >= allocation THEN now() ELSE closed_at END,
        updated_at = now()
    WHERE id = v_release.id
    RETURNING * INTO v_release;
    v_remaining := greatest(0, v_release.allocation - v_release.claimed);
  END IF;

  RETURN jsonb_build_object(
    'entry', to_jsonb(v_entry),
    'kind', v_kind,
    'remaining', v_remaining
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_aftrhrs_guest_entry(
  p_actor_user_id uuid,
  p_code text,
  p_notes text DEFAULT NULL,
  p_device jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_code text;
  v_entry public.aftrhrs_guest_entries%ROWTYPE;
BEGIN
  PERFORM public.aftrhrs_expire_stale_guest_entries(now());
  v_code := upper(trim(p_code));
  IF v_code LIKE 'PROMORANG://AFTRHRS/REDEEM/%' THEN
    v_code := substr(v_code, 29);
  END IF;

  SELECT * INTO v_entry
  FROM public.aftrhrs_guest_entries
  WHERE unique_code = v_code
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND';
  END IF;
  IF v_entry.status = 'redeemed' THEN
    RAISE EXCEPTION 'ALREADY_REDEEMED';
  END IF;
  IF v_entry.status <> 'active' THEN
    RAISE EXCEPTION 'NOT_REDEEMABLE';
  END IF;

  UPDATE public.aftrhrs_guest_entries
  SET status = 'redeemed',
      redeemed_at = now(),
      redeemed_by = p_actor_user_id,
      metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('notes', p_notes, 'device', coalesce(p_device, '{}'::jsonb)),
      updated_at = now()
  WHERE id = v_entry.id
  RETURNING * INTO v_entry;

  RETURN to_jsonb(v_entry);
END;
$$;

CREATE OR REPLACE FUNCTION public.aftrhrs_close_digital_release()
RETURNS public.aftrhrs_digital_releases
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_release public.aftrhrs_digital_releases%ROWTYPE;
BEGIN
  SELECT * INTO v_release
  FROM public.aftrhrs_digital_releases
  WHERE claims_open = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CLAIMS_CLOSED';
  END IF;

  UPDATE public.aftrhrs_digital_releases
  SET claims_open = false,
      closed_at = now(),
      updated_at = now()
  WHERE id = v_release.id
  RETURNING * INTO v_release;

  RETURN v_release;
END;
$$;

CREATE OR REPLACE FUNCTION public.aftrhrs_open_digital_release(p_now timestamptz DEFAULT now())
RETURNS public.aftrhrs_digital_releases
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_month text;
  v_index integer;
  v_release public.aftrhrs_digital_releases%ROWTYPE;
BEGIN
  UPDATE public.aftrhrs_digital_releases
  SET claims_open = false,
      closed_at = coalesce(closed_at, now()),
      updated_at = now()
  WHERE claims_open = true;

  v_month := public.aftrhrs_month_key(p_now);
  SELECT COALESCE(MAX(batch_index), 0) + 1 INTO v_index
  FROM public.aftrhrs_digital_releases
  WHERE month_key = v_month;

  INSERT INTO public.aftrhrs_digital_releases (month_key, batch_index, allocation, claimed, claims_open)
  VALUES (v_month, GREATEST(v_index, 1), 50, 0, true)
  RETURNING * INTO v_release;

  RETURN v_release;
END;
$$;
