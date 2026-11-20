-- Generic capped drops with a real remaining count.
-- AftrHrs is retired (20261009172522_retire_confirmed_aftrhrs_encore_series.sql).
-- This does not read or write AftrHrs / event_editions tables.
-- public.drops and community_drops keep their existing shapes.
--
-- LAUNCH_WINDOW_END is the shared launch-window config (2027-01-31).
-- packages/shared/src/launch-window.ts and backend/lib/launchWindow.js
-- must stay on this same date so the country/invites PR can reconcile.

CREATE TABLE IF NOT EXISTS public.capped_drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  moment_id uuid REFERENCES public.moments(id) ON DELETE SET NULL,
  cap integer NOT NULL DEFAULT 100 CHECK (cap > 0),
  claimed_count integer NOT NULL DEFAULT 0 CHECK (claimed_count >= 0),
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'live', 'full', 'closed')),
  opens_at timestamptz,
  closes_at timestamptz,
  requires_membership boolean NOT NULL DEFAULT false,
  sold_out_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT capped_drops_claimed_within_cap CHECK (claimed_count <= cap),
  CONSTRAINT capped_drops_window CHECK (closes_at IS NULL OR opens_at IS NULL OR closes_at > opens_at)
);

CREATE TABLE IF NOT EXISTS public.capped_drop_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id uuid NOT NULL REFERENCES public.capped_drops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT capped_drop_claims_one_per_user UNIQUE (drop_id, user_id)
);

-- Opt-in heads-up for a later drop. Not a waitlist and not a claim.
CREATE TABLE IF NOT EXISTS public.capped_drop_next_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_capped_drops_status_opens
  ON public.capped_drops(status, opens_at);
CREATE INDEX IF NOT EXISTS idx_capped_drop_claims_user
  ON public.capped_drop_claims(user_id, claimed_at DESC);

COMMENT ON TABLE public.capped_drops IS
  'Standalone capped drop. claimed_count is written only by claim_capped_drop.';
COMMENT ON COLUMN public.capped_drops.cap IS
  'Default 100 (CEO/Andre). Cannot be lowered below claimed_count.';

-- claimed_count changes only inside claim_capped_drop, which sets this flag
-- for the current transaction. Direct updates, including from the API, fail.
CREATE OR REPLACE FUNCTION public.guard_capped_drop_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.claimed_count IS DISTINCT FROM 0 THEN
      RAISE EXCEPTION 'claimed_count is owned by claim_capped_drop' USING ERRCODE = '23514';
    END IF;
  ELSIF NEW.claimed_count IS DISTINCT FROM OLD.claimed_count THEN
    IF current_setting('capped_drops.allow_count_write', true) IS DISTINCT FROM 'on' THEN
      RAISE EXCEPTION 'claimed_count is owned by claim_capped_drop' USING ERRCODE = '23514';
    END IF;
  END IF;

  IF NEW.cap < NEW.claimed_count THEN
    RAISE EXCEPTION 'cap cannot be lower than claimed_count' USING ERRCODE = '23514';
  END IF;

  IF NEW.status = 'live' AND NEW.claimed_count >= NEW.cap THEN
    RAISE EXCEPTION 'a full drop cannot be live' USING ERRCODE = '23514';
  END IF;

  IF NEW.status = 'full' AND NEW.sold_out_at IS NULL THEN
    NEW.sold_out_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_capped_drop_count ON public.capped_drops;
CREATE TRIGGER guard_capped_drop_count
  BEFORE INSERT OR UPDATE ON public.capped_drops
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_capped_drop_count();

CREATE OR REPLACE FUNCTION public.claim_capped_drop(
  p_drop_id uuid,
  p_user_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid;
  v_drop public.capped_drops%ROWTYPE;
  v_claim public.capped_drop_claims%ROWTYPE;
  v_country text;
  v_dob date;
  v_has_country boolean := false;
  v_has_dob boolean := false;
  v_member boolean := false;
  v_remaining integer;
BEGIN
  IF auth.role() = 'service_role' THEN
    v_user := p_user_id;
  ELSE
    v_user := auth.uid();
  END IF;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_drop
  FROM public.capped_drops
  WHERE id = p_drop_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'DROP_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_claim
  FROM public.capped_drop_claims
  WHERE drop_id = v_drop.id AND user_id = v_user;

  IF FOUND THEN
    v_remaining := GREATEST(v_drop.cap - v_drop.claimed_count, 0);
    RETURN jsonb_build_object(
      'already_claimed', true,
      'message', 'already yours',
      'claim_id', v_claim.id,
      'cap', v_drop.cap,
      'claimed_count', v_drop.claimed_count,
      'remaining', v_remaining,
      'sold_out', v_drop.claimed_count >= v_drop.cap OR v_drop.status = 'full',
      'status', v_drop.status,
      'sold_out_at', v_drop.sold_out_at
    );
  END IF;

  IF v_drop.status = 'full' OR v_drop.claimed_count >= v_drop.cap THEN
    RAISE EXCEPTION 'SOLD_OUT' USING ERRCODE = 'P0001';
  END IF;
  IF v_drop.status = 'closed' OR (v_drop.closes_at IS NOT NULL AND now() >= v_drop.closes_at) THEN
    RAISE EXCEPTION 'DROP_CLOSED' USING ERRCODE = 'P0001';
  END IF;
  IF v_drop.status <> 'live' OR (v_drop.opens_at IS NOT NULL AND now() < v_drop.opens_at) THEN
    RAISE EXCEPTION 'DROP_NOT_LIVE' USING ERRCODE = 'P0001';
  END IF;

  -- 18+ and country turn on when the signup columns from §2.4 exist.
  -- Until then the drop still claims; a present column with a missing value fails closed.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'country_code'
  ) THEN
    v_has_country := true;
    EXECUTE 'SELECT NULLIF(upper(btrim(country_code)), '''') FROM public.profiles WHERE user_id = $1'
      INTO v_country USING v_user;
  ELSIF to_regclass('public.user_preferences') IS NOT NULL AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_preferences' AND column_name = 'country'
  ) THEN
    v_has_country := true;
    EXECUTE 'SELECT NULLIF(btrim(country), '''') FROM public.user_preferences WHERE user_id = $1'
      INTO v_country USING v_user;
  END IF;

  IF v_has_country AND (v_country IS NULL OR (
    EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'country_code'
    ) AND v_country !~ '^[A-Z]{2}$'
  )) THEN
    RAISE EXCEPTION 'COUNTRY_REQUIRED' USING ERRCODE = 'P0001';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'dob'
  ) THEN
    v_has_dob := true;
    EXECUTE 'SELECT dob FROM public.users WHERE id = $1' INTO v_dob USING v_user;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'dob'
  ) THEN
    v_has_dob := true;
    EXECUTE 'SELECT dob FROM public.profiles WHERE user_id = $1' INTO v_dob USING v_user;
  END IF;

  IF v_has_dob AND (v_dob IS NULL OR v_dob > (CURRENT_DATE - INTERVAL '18 years')) THEN
    RAISE EXCEPTION 'AGE_REQUIRED' USING ERRCODE = 'P0001';
  END IF;

  IF v_drop.requires_membership THEN
    IF to_regclass('public.presents_memberships') IS NULL THEN
      RAISE EXCEPTION 'MEMBERSHIP_REQUIRED' USING ERRCODE = 'P0001';
    END IF;
    EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.presents_memberships WHERE user_id = $1 AND status = ''active'')'
      INTO v_member USING v_user;
    IF NOT v_member THEN
      RAISE EXCEPTION 'MEMBERSHIP_REQUIRED' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  INSERT INTO public.capped_drop_claims (drop_id, user_id)
  VALUES (v_drop.id, v_user)
  RETURNING * INTO v_claim;

  PERFORM set_config('capped_drops.allow_count_write', 'on', true);

  UPDATE public.capped_drops
  SET claimed_count = claimed_count + 1,
      status = CASE WHEN claimed_count + 1 >= cap THEN 'full' ELSE status END,
      sold_out_at = CASE
        WHEN claimed_count + 1 >= cap THEN COALESCE(sold_out_at, now())
        ELSE sold_out_at
      END,
      updated_at = now()
  WHERE id = v_drop.id
    AND claimed_count < cap
  RETURNING * INTO v_drop;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SOLD_OUT' USING ERRCODE = 'P0001';
  END IF;

  v_remaining := GREATEST(v_drop.cap - v_drop.claimed_count, 0);
  RETURN jsonb_build_object(
    'already_claimed', false,
    'claim_id', v_claim.id,
    'cap', v_drop.cap,
    'claimed_count', v_drop.claimed_count,
    'remaining', v_remaining,
    'sold_out', v_remaining = 0 OR v_drop.status = 'full',
    'status', v_drop.status,
    'sold_out_at', v_drop.sold_out_at
  );
EXCEPTION
  WHEN unique_violation THEN
    SELECT * INTO v_claim
    FROM public.capped_drop_claims
    WHERE drop_id = p_drop_id AND user_id = v_user;
    SELECT * INTO v_drop FROM public.capped_drops WHERE id = p_drop_id;
    v_remaining := GREATEST(COALESCE(v_drop.cap, 0) - COALESCE(v_drop.claimed_count, 0), 0);
    RETURN jsonb_build_object(
      'already_claimed', true,
      'message', 'already yours',
      'claim_id', v_claim.id,
      'cap', v_drop.cap,
      'claimed_count', v_drop.claimed_count,
      'remaining', v_remaining,
      'sold_out', COALESCE(v_drop.claimed_count, 0) >= COALESCE(v_drop.cap, 0) OR v_drop.status = 'full',
      'status', v_drop.status,
      'sold_out_at', v_drop.sold_out_at
    );
END;
$$;

-- Anon-safe counter. Counts, status, and the sold-out time only.
-- Title and claimer ids stay off this function.
CREATE OR REPLACE FUNCTION public.get_capped_drop_remaining(p_slug text)
RETURNS TABLE (
  slug text,
  cap integer,
  claimed_count integer,
  remaining integer,
  status text,
  sold_out_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    d.slug,
    d.cap,
    d.claimed_count,
    GREATEST(d.cap - d.claimed_count, 0) AS remaining,
    d.status,
    d.sold_out_at
  FROM public.capped_drops d
  WHERE d.slug = p_slug;
$$;

CREATE OR REPLACE VIEW public.capped_drop_public_counts
WITH (security_invoker = false) AS
SELECT
  slug,
  cap,
  claimed_count,
  GREATEST(cap - claimed_count, 0) AS remaining,
  status,
  sold_out_at
FROM public.capped_drops;

COMMENT ON VIEW public.capped_drop_public_counts IS
  'Public remaining count. No claimer ids, no titles beyond the slug lookup on the function.';

-- Nightly check: claimed_count must equal the claim rows. Raises when it does not.
CREATE OR REPLACE FUNCTION public.assert_capped_drop_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_mismatch_count integer;
BEGIN
  SELECT count(*) INTO v_mismatch_count
  FROM public.capped_drops d
  WHERE d.claimed_count IS DISTINCT FROM (
    SELECT count(*)::integer FROM public.capped_drop_claims c WHERE c.drop_id = d.id
  );

  IF v_mismatch_count > 0 THEN
    RAISE EXCEPTION 'capped drop claimed_count drifted from claim rows (% drops)', v_mismatch_count
      USING ERRCODE = '23514';
  END IF;
END;
$$;

ALTER TABLE public.capped_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capped_drop_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capped_drop_next_notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS capped_drop_claims_select_own ON public.capped_drop_claims;
CREATE POLICY capped_drop_claims_select_own ON public.capped_drop_claims
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS capped_drop_next_notices_select_own ON public.capped_drop_next_notices;
CREATE POLICY capped_drop_next_notices_select_own ON public.capped_drop_next_notices
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

REVOKE ALL ON public.capped_drops FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.capped_drop_claims FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.capped_drop_next_notices FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.capped_drop_public_counts TO anon, authenticated;

REVOKE ALL ON FUNCTION public.claim_capped_drop(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_capped_drop(uuid, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_capped_drop_remaining(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_capped_drop_remaining(text) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.assert_capped_drop_counts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assert_capped_drop_counts() TO service_role;
REVOKE ALL ON FUNCTION public.guard_capped_drop_count() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF to_regclass('public.system_settings') IS NOT NULL THEN
    INSERT INTO public.system_settings (key, value, description)
    VALUES (
      'LAUNCH_WINDOW_END',
      jsonb_build_object('date', '2027-01-31'),
      'PromoRang launch window end (America/Jamaica calendar date). Shared with packages/shared LAUNCH_WINDOW_END and backend/lib/launchWindow.js. Country/invites work should read this same value.'
    )
    ON CONFLICT (key) DO NOTHING;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
