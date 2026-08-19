-- Canonical daily Master Key progress.
-- Legacy master_keys, master_key_status, and master_key_activations are retained
-- as historical sources but are no longer the current-state authority.

CREATE TABLE IF NOT EXISTS public.daily_master_key_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform_day date NOT NULL,
  tier_id text NOT NULL CHECK (tier_id IN ('starter', 'professional', 'power_user')),
  points_multiplier numeric(4,2) NOT NULL CHECK (points_multiplier IN (1, 1.5, 2)),
  proofs_required integer NOT NULL CHECK (proofs_required BETWEEN 1 AND 5),
  proofs_completed integer NOT NULL DEFAULT 0 CHECK (proofs_completed >= 0),
  activated_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform_day)
);

CREATE TABLE IF NOT EXISTS public.master_key_proof_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform_day date NOT NULL,
  source_type text NOT NULL,
  source_id text NOT NULL,
  credited_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_master_key_progress_user_day
  ON public.daily_master_key_progress(user_id, platform_day DESC);
CREATE INDEX IF NOT EXISTS idx_master_key_proof_credits_user_day
  ON public.master_key_proof_credits(user_id, platform_day);

ALTER TABLE public.daily_master_key_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_key_proof_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own daily Master Key progress" ON public.daily_master_key_progress;
CREATE POLICY "Users read own daily Master Key progress"
  ON public.daily_master_key_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own Master Key credits" ON public.master_key_proof_credits;
CREATE POLICY "Users read own Master Key credits"
  ON public.master_key_proof_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.credit_daily_master_key_proof(
  p_user_id uuid,
  p_platform_day date,
  p_tier_id text,
  p_points_multiplier numeric,
  p_proofs_required integer,
  p_expires_at timestamptz,
  p_source_type text,
  p_source_id text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS public.daily_master_key_progress
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_progress public.daily_master_key_progress;
  v_inserted integer;
  v_completed integer;
BEGIN
  IF p_tier_id NOT IN ('starter', 'professional', 'power_user')
     OR p_proofs_required NOT BETWEEN 1 AND 5
     OR p_source_type IS NULL OR p_source_id IS NULL THEN
    RAISE EXCEPTION 'Invalid daily Master Key credit';
  END IF;

  INSERT INTO public.master_key_proof_credits (
    user_id, platform_day, source_type, source_id, metadata
  ) VALUES (
    p_user_id, p_platform_day, p_source_type, p_source_id, COALESCE(p_metadata, '{}'::jsonb)
  ) ON CONFLICT (user_id, source_type, source_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  INSERT INTO public.daily_master_key_progress (
    user_id, platform_day, tier_id, points_multiplier, proofs_required, expires_at
  ) VALUES (
    p_user_id, p_platform_day, p_tier_id, p_points_multiplier, p_proofs_required, p_expires_at
  ) ON CONFLICT (user_id, platform_day) DO UPDATE SET
    tier_id = EXCLUDED.tier_id,
    points_multiplier = EXCLUDED.points_multiplier,
    proofs_required = EXCLUDED.proofs_required,
    expires_at = EXCLUDED.expires_at,
    updated_at = now();

  SELECT count(*)::integer INTO v_completed
  FROM public.master_key_proof_credits
  WHERE user_id = p_user_id AND platform_day = p_platform_day;

  UPDATE public.daily_master_key_progress
  SET proofs_completed = v_completed,
      activated_at = CASE
        WHEN v_completed >= proofs_required THEN COALESCE(activated_at, now())
        ELSE NULL
      END,
      updated_at = CASE WHEN v_inserted = 1 THEN now() ELSE updated_at END
  WHERE user_id = p_user_id AND platform_day = p_platform_day
  RETURNING * INTO v_progress;

  RETURN v_progress;
END;
$$;

REVOKE ALL ON FUNCTION public.credit_daily_master_key_proof(uuid, date, text, numeric, integer, timestamptz, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.credit_daily_master_key_proof(uuid, date, text, numeric, integer, timestamptz, text, text, jsonb) TO service_role;

COMMENT ON TABLE public.daily_master_key_progress IS
  'Current daily contribution gate. This is the sole Master Key status authority.';
COMMENT ON TABLE public.master_key_proof_credits IS
  'Idempotent verified free-Proof credits used to calculate daily Master Key progress.';
