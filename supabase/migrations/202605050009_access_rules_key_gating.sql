-- Reusable Key-gated access rules for moments, drops, rewards, and future surfaces.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.access_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_type text NOT NULL CHECK (object_type IN ('moment', 'drop', 'reward', 'campaign', 'promoshare_pool', 'event', 'content', 'offer')),
  object_id text NOT NULL,
  access_type text NOT NULL CHECK (access_type IN ('view', 'join', 'apply', 'redeem', 'boost', 'reserve', 'check_in', 'claim')),
  base_key_cost integer NOT NULL DEFAULT 0 CHECK (base_key_cost >= 0),
  min_tier_key text REFERENCES public.participant_tier_configs(tier_key),
  requires_cash_gem_eligible boolean NOT NULL DEFAULT false,
  capacity_limit integer CHECK (capacity_limit IS NULL OR capacity_limit >= 0),
  sponsor_subsidy_keys integer NOT NULL DEFAULT 0 CHECK (sponsor_subsidy_keys >= 0),
  pricing_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (object_type, object_id, access_type)
);

CREATE INDEX IF NOT EXISTS idx_access_rules_lookup
  ON public.access_rules(object_type, object_id, access_type, is_active);

CREATE TABLE IF NOT EXISTS public.access_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_rule_id uuid REFERENCES public.access_rules(id) ON DELETE SET NULL,
  object_type text NOT NULL,
  object_id text NOT NULL,
  access_type text NOT NULL,
  keys_spent integer NOT NULL DEFAULT 0 CHECK (keys_spent >= 0),
  tier_key text REFERENCES public.participant_tier_configs(tier_key),
  status text NOT NULL DEFAULT 'consumed' CHECK (status IN ('reserved', 'consumed', 'refunded', 'expired')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_access_unlocks_unique_consumed
  ON public.access_unlocks(user_id, object_type, object_id, access_type)
  WHERE status = 'consumed';

CREATE INDEX IF NOT EXISTS idx_access_unlocks_user_created
  ON public.access_unlocks(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.access_rule_presets (
  preset_key text PRIMARY KEY,
  display_name text NOT NULL,
  object_type text NOT NULL CHECK (object_type IN ('moment', 'drop', 'reward', 'campaign', 'promoshare_pool', 'event', 'content', 'offer')),
  access_type text NOT NULL CHECK (access_type IN ('view', 'join', 'apply', 'redeem', 'boost', 'reserve', 'check_in', 'claim')),
  base_key_cost integer NOT NULL DEFAULT 0 CHECK (base_key_cost >= 0),
  min_tier_key text REFERENCES public.participant_tier_configs(tier_key),
  requires_cash_gem_eligible boolean NOT NULL DEFAULT false,
  sponsor_subsidy_keys integer NOT NULL DEFAULT 0 CHECK (sponsor_subsidy_keys >= 0),
  pricing_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.access_rule_presets (
  preset_key,
  display_name,
  object_type,
  access_type,
  base_key_cost,
  min_tier_key,
  requires_cash_gem_eligible,
  sponsor_subsidy_keys,
  pricing_config,
  metadata
) VALUES
  (
    'moment_open_join',
    'Open Moment Join',
    'moment',
    'join',
    0,
    NULL,
    false,
    0,
    '{}'::jsonb,
    '{"use_case": "Default free participation Moment."}'::jsonb
  ),
  (
    'moment_limited_join',
    'Limited Moment Join',
    'moment',
    'join',
    3,
    NULL,
    false,
    0,
    '{"scarcity_cost": 1}'::jsonb,
    '{"use_case": "Small-cap or scarce local Moment."}'::jsonb
  ),
  (
    'moment_rewarded_join',
    'Rewarded Moment Join',
    'moment',
    'join',
    5,
    NULL,
    false,
    0,
    '{"reward_value_cost": 2}'::jsonb,
    '{"use_case": "Moment with meaningful reward or funded pool."}'::jsonb
  ),
  (
    'drop_content_clipping_apply',
    'Content Clipping Drop Apply',
    'drop',
    'apply',
    1,
    NULL,
    false,
    0,
    '{}'::jsonb,
    '{"drop_type": "content_clipping"}'::jsonb
  ),
  (
    'drop_review_apply',
    'Review Drop Apply',
    'drop',
    'apply',
    2,
    NULL,
    false,
    0,
    '{}'::jsonb,
    '{"drop_type": "review"}'::jsonb
  ),
  (
    'drop_ugc_creation_apply',
    'UGC Creation Drop Apply',
    'drop',
    'apply',
    3,
    NULL,
    false,
    0,
    '{}'::jsonb,
    '{"drop_type": "ugc_creation"}'::jsonb
  ),
  (
    'drop_affiliate_apply',
    'Affiliate Drop Apply',
    'drop',
    'apply',
    5,
    NULL,
    false,
    0,
    '{}'::jsonb,
    '{"drop_type": "affiliate"}'::jsonb
  ),
  (
    'drop_challenge_apply',
    'Challenge Drop Apply',
    'drop',
    'apply',
    10,
    NULL,
    false,
    0,
    '{}'::jsonb,
    '{"drop_type": "challenge"}'::jsonb
  ),
  (
    'reward_basic_redeem',
    'Basic Reward Redeem',
    'reward',
    'redeem',
    1,
    NULL,
    false,
    0,
    '{}'::jsonb,
    '{"use_case": "Low-value or abundant reward."}'::jsonb
  ),
  (
    'reward_premium_redeem',
    'Premium Reward Redeem',
    'reward',
    'redeem',
    5,
    NULL,
    false,
    0,
    '{"reward_value_cost": 3, "scarcity_cost": 2}'::jsonb,
    '{"use_case": "High-value, scarce, or sponsor-funded reward."}'::jsonb
  ),
  (
    'promoshare_cash_gem_claim',
    'Cash/Gem PromoShare Claim',
    'promoshare_pool',
    'claim',
    0,
    'plus',
    true,
    0,
    '{}'::jsonb,
    '{"use_case": "Cash and Gem PromoShare pools require Plus or earned Plus standing."}'::jsonb
  )
ON CONFLICT (preset_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  object_type = EXCLUDED.object_type,
  access_type = EXCLUDED.access_type,
  base_key_cost = EXCLUDED.base_key_cost,
  min_tier_key = EXCLUDED.min_tier_key,
  requires_cash_gem_eligible = EXCLUDED.requires_cash_gem_eligible,
  sponsor_subsidy_keys = EXCLUDED.sponsor_subsidy_keys,
  pricing_config = EXCLUDED.pricing_config,
  metadata = EXCLUDED.metadata,
  is_active = true,
  updated_at = now();

CREATE OR REPLACE FUNCTION public.calculate_access_key_cost(
  p_user_id uuid,
  p_object_type text,
  p_object_id text,
  p_access_type text DEFAULT 'join'
)
RETURNS TABLE (
  rule_id uuid,
  object_type text,
  object_id text,
  access_type text,
  tier_key text,
  base_key_cost integer,
  raw_key_cost integer,
  final_key_cost integer,
  key_cost_multiplier numeric,
  allowed boolean,
  denial_reason text,
  already_unlocked boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule public.access_rules;
  v_tier_key text := 'free';
  v_key_cost_multiplier numeric := 1.00;
  v_cash_gem_eligible boolean := false;
  v_user_tier_rank integer := 0;
  v_min_tier_rank integer := 0;
  v_existing_unlock boolean := false;
  v_consumed_count integer := 0;
  v_base integer := 0;
  v_raw integer := 0;
  v_final integer := 0;
  v_allowed boolean := true;
  v_denial_reason text := NULL;
BEGIN
  SELECT
    effective.tier_key,
    effective.key_cost_multiplier,
    effective.promoshare_cash_gem_eligible
  INTO
    v_tier_key,
    v_key_cost_multiplier,
    v_cash_gem_eligible
  FROM public.get_effective_participant_tier(p_user_id) effective
  LIMIT 1;

  v_tier_key := COALESCE(v_tier_key, 'free');
  v_key_cost_multiplier := COALESCE(v_key_cost_multiplier, 1.00);
  v_cash_gem_eligible := COALESCE(v_cash_gem_eligible, false);

  SELECT COALESCE(c.tier_rank, 0)
  INTO v_user_tier_rank
  FROM public.participant_tier_configs c
  WHERE c.tier_key = v_tier_key;

  SELECT *
  INTO v_rule
  FROM public.access_rules r
  WHERE r.object_type = lower(p_object_type)
    AND r.object_id = p_object_id
    AND r.access_type = lower(p_access_type)
    AND r.is_active = true
    AND (r.starts_at IS NULL OR r.starts_at <= now())
    AND (r.ends_at IS NULL OR r.ends_at > now())
  LIMIT 1;

  IF v_rule.id IS NULL THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.access_unlocks u
      WHERE u.user_id = p_user_id
        AND u.object_type = lower(p_object_type)
        AND u.object_id = p_object_id
        AND u.access_type = lower(p_access_type)
        AND u.status = 'consumed'
    )
    INTO v_existing_unlock;

    RETURN QUERY SELECT
      NULL::uuid,
      lower(p_object_type),
      p_object_id,
      lower(p_access_type),
      v_tier_key,
      0,
      0,
      0,
      v_key_cost_multiplier,
      true,
      NULL::text,
      v_existing_unlock;
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.access_unlocks u
    WHERE u.user_id = p_user_id
      AND u.object_type = v_rule.object_type
      AND u.object_id = v_rule.object_id
      AND u.access_type = v_rule.access_type
      AND u.status = 'consumed'
  )
  INTO v_existing_unlock;

  IF v_rule.min_tier_key IS NOT NULL THEN
    SELECT COALESCE(c.tier_rank, 0)
    INTO v_min_tier_rank
    FROM public.participant_tier_configs c
    WHERE c.tier_key = v_rule.min_tier_key;

    IF COALESCE(v_user_tier_rank, 0) < COALESCE(v_min_tier_rank, 0) THEN
      v_allowed := false;
      v_denial_reason := 'tier_required';
    END IF;
  END IF;

  IF v_allowed AND v_rule.requires_cash_gem_eligible AND NOT v_cash_gem_eligible THEN
    v_allowed := false;
    v_denial_reason := 'cash_gem_eligible_tier_required';
  END IF;

  IF v_allowed AND v_rule.capacity_limit IS NOT NULL AND NOT v_existing_unlock THEN
    SELECT COUNT(*)
    INTO v_consumed_count
    FROM public.access_unlocks u
    WHERE u.access_rule_id = v_rule.id
      AND u.status = 'consumed';

    IF v_consumed_count >= v_rule.capacity_limit THEN
      v_allowed := false;
      v_denial_reason := 'capacity_full';
    END IF;
  END IF;

  v_base := COALESCE(v_rule.base_key_cost, 0);
  v_raw := GREATEST(
    0,
    v_base
      + COALESCE((v_rule.pricing_config->>'scarcity_cost')::integer, 0)
      + COALESCE((v_rule.pricing_config->>'reward_value_cost')::integer, 0)
      + COALESCE((v_rule.pricing_config->>'demand_cost')::integer, 0)
      - COALESCE(v_rule.sponsor_subsidy_keys, 0)
  );
  v_final := CASE
    WHEN v_existing_unlock THEN 0
    ELSE CEIL(v_raw * v_key_cost_multiplier)::integer
  END;

  RETURN QUERY SELECT
    v_rule.id,
    v_rule.object_type,
    v_rule.object_id,
    v_rule.access_type,
    v_tier_key,
    v_base,
    v_raw,
    v_final,
    v_key_cost_multiplier,
    v_allowed,
    v_denial_reason,
    v_existing_unlock;
END $$;

CREATE OR REPLACE FUNCTION public.record_access_unlock(
  p_user_id uuid,
  p_object_type text,
  p_object_id text,
  p_access_type text DEFAULT 'join',
  p_keys_spent integer DEFAULT 0,
  p_tier_key text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS public.access_unlocks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule_id uuid;
  v_result public.access_unlocks;
BEGIN
  SELECT id
  INTO v_rule_id
  FROM public.access_rules
  WHERE object_type = lower(p_object_type)
    AND object_id = p_object_id
    AND access_type = lower(p_access_type)
    AND is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  LIMIT 1;

  INSERT INTO public.access_unlocks (
    user_id,
    access_rule_id,
    object_type,
    object_id,
    access_type,
    keys_spent,
    tier_key,
    status,
    metadata
  )
  VALUES (
    p_user_id,
    v_rule_id,
    lower(p_object_type),
    p_object_id,
    lower(p_access_type),
    GREATEST(COALESCE(p_keys_spent, 0), 0),
    p_tier_key,
    'consumed',
    p_metadata
  )
  ON CONFLICT (user_id, object_type, object_id, access_type) WHERE status = 'consumed' DO UPDATE SET
    access_rule_id = COALESCE(public.access_unlocks.access_rule_id, EXCLUDED.access_rule_id),
    tier_key = COALESCE(public.access_unlocks.tier_key, EXCLUDED.tier_key),
    metadata = public.access_unlocks.metadata || EXCLUDED.metadata,
    updated_at = now()
  RETURNING * INTO v_result;

  RETURN v_result;
END $$;

ALTER TABLE public.access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_rule_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active access rules are readable" ON public.access_rules;
CREATE POLICY "Active access rules are readable"
  ON public.access_rules FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

DROP POLICY IF EXISTS "Active access rule presets are readable" ON public.access_rule_presets;
CREATE POLICY "Active access rule presets are readable"
  ON public.access_rule_presets FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Users can read own access unlocks" ON public.access_unlocks;
CREATE POLICY "Users can read own access unlocks"
  ON public.access_unlocks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read access unlocks" ON public.access_unlocks;
CREATE POLICY "Admins can read access unlocks"
  ON public.access_unlocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.user_type IN ('admin', 'master_admin')
    )
  );

NOTIFY pgrst, 'reload schema';
