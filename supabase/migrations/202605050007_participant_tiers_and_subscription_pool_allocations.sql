-- Participant tiers, earned Plus standing, and subscription-funded pool allocations.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.participant_tier_configs (
  tier_key text PRIMARY KEY,
  display_name text NOT NULL,
  tier_rank integer NOT NULL UNIQUE,
  monthly_price_cents integer NOT NULL DEFAULT 0 CHECK (monthly_price_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  is_paid boolean NOT NULL DEFAULT false,
  points_multiplier numeric(5,2) NOT NULL DEFAULT 1.00 CHECK (points_multiplier >= 0),
  key_cost_multiplier numeric(5,2) NOT NULL DEFAULT 1.00 CHECK (key_cost_multiplier >= 0),
  promoshare_ticket_multiplier numeric(5,2) NOT NULL DEFAULT 1.00 CHECK (promoshare_ticket_multiplier >= 0),
  promoshare_weight_multiplier numeric(5,2) NOT NULL DEFAULT 1.00 CHECK (promoshare_weight_multiplier >= 0),
  promoshare_cash_gem_eligible boolean NOT NULL DEFAULT false,
  monthly_cash_gem_cap numeric(12,2),
  monthly_key_unlock_threshold integer CHECK (monthly_key_unlock_threshold IS NULL OR monthly_key_unlock_threshold >= 0),
  earned_status_duration_days integer NOT NULL DEFAULT 30 CHECK (earned_status_duration_days > 0),
  promoshare_pool_percent numeric(5,4) NOT NULL DEFAULT 0 CHECK (promoshare_pool_percent >= 0 AND promoshare_pool_percent <= 1),
  liquidity_pool_percent numeric(5,4) NOT NULL DEFAULT 0 CHECK (liquidity_pool_percent >= 0 AND liquidity_pool_percent <= 1),
  local_impact_pool_percent numeric(5,4) NOT NULL DEFAULT 0 CHECK (local_impact_pool_percent >= 0 AND local_impact_pool_percent <= 1),
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((promoshare_pool_percent + liquidity_pool_percent + local_impact_pool_percent) <= 1)
);

INSERT INTO public.participant_tier_configs (
  tier_key,
  display_name,
  tier_rank,
  monthly_price_cents,
  is_paid,
  points_multiplier,
  key_cost_multiplier,
  promoshare_ticket_multiplier,
  promoshare_weight_multiplier,
  promoshare_cash_gem_eligible,
  monthly_cash_gem_cap,
  monthly_key_unlock_threshold,
  earned_status_duration_days,
  promoshare_pool_percent,
  liquidity_pool_percent,
  local_impact_pool_percent,
  benefits
) VALUES
  (
    'free',
    'Free',
    0,
    0,
    false,
    1.00,
    1.00,
    1.00,
    1.00,
    false,
    NULL,
    NULL,
    30,
    0.0000,
    0.0000,
    0.0000,
    '["points_and_keys", "non_cash_promoshare_entries", "basic_moment_access"]'::jsonb
  ),
  (
    'plus',
    'Plus',
    1,
    999,
    true,
    1.25,
    0.90,
    1.25,
    1.25,
    true,
    50.00,
    100,
    30,
    0.1000,
    0.0500,
    0.0000,
    '["cash_gem_promoshare_access", "higher_points", "reduced_key_costs", "boosted_promoshare_tickets"]'::jsonb
  ),
  (
    'pro',
    'Pro',
    2,
    2499,
    true,
    1.50,
    0.75,
    1.50,
    1.50,
    true,
    150.00,
    250,
    30,
    0.1250,
    0.0750,
    0.0000,
    '["plus_benefits", "higher_cash_gem_cap", "priority_access", "premium_missions"]'::jsonb
  ),
  (
    'elite',
    'Elite',
    3,
    4999,
    true,
    2.00,
    0.60,
    2.00,
    2.00,
    true,
    300.00,
    500,
    30,
    0.1500,
    0.1000,
    0.0250,
    '["pro_benefits", "premium_pool_access", "largest_ticket_boost", "local_impact_funding"]'::jsonb
  )
ON CONFLICT (tier_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  tier_rank = EXCLUDED.tier_rank,
  monthly_price_cents = EXCLUDED.monthly_price_cents,
  is_paid = EXCLUDED.is_paid,
  points_multiplier = EXCLUDED.points_multiplier,
  key_cost_multiplier = EXCLUDED.key_cost_multiplier,
  promoshare_ticket_multiplier = EXCLUDED.promoshare_ticket_multiplier,
  promoshare_weight_multiplier = EXCLUDED.promoshare_weight_multiplier,
  promoshare_cash_gem_eligible = EXCLUDED.promoshare_cash_gem_eligible,
  monthly_cash_gem_cap = EXCLUDED.monthly_cash_gem_cap,
  monthly_key_unlock_threshold = EXCLUDED.monthly_key_unlock_threshold,
  earned_status_duration_days = EXCLUDED.earned_status_duration_days,
  promoshare_pool_percent = EXCLUDED.promoshare_pool_percent,
  liquidity_pool_percent = EXCLUDED.liquidity_pool_percent,
  local_impact_pool_percent = EXCLUDED.local_impact_pool_percent,
  benefits = EXCLUDED.benefits,
  is_active = true,
  updated_at = now();

CREATE TABLE IF NOT EXISTS public.user_participant_tier_status (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  current_tier_key text NOT NULL REFERENCES public.participant_tier_configs(tier_key) DEFAULT 'free',
  status_source text NOT NULL DEFAULT 'free' CHECK (status_source IN ('free', 'paid', 'earned', 'admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'paused', 'canceled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  earned_from_period_start date,
  earned_from_period_end date,
  earned_keys integer NOT NULL DEFAULT 0,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_participant_tier_status_tier
  ON public.user_participant_tier_status(current_tier_key, status, current_period_end);

CREATE TABLE IF NOT EXISTS public.participant_key_monthly_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  keys_earned integer NOT NULL DEFAULT 0 CHECK (keys_earned >= 0),
  highest_earned_tier_key text REFERENCES public.participant_tier_configs(tier_key),
  last_source text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_participant_key_monthly_progress_user_period
  ON public.participant_key_monthly_progress(user_id, period_start DESC);

CREATE TABLE IF NOT EXISTS public.participant_subscription_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier_key text NOT NULL REFERENCES public.participant_tier_configs(tier_key),
  provider text NOT NULL DEFAULT 'stripe',
  provider_payment_id text,
  provider_subscription_id text,
  gross_amount numeric(12,2) NOT NULL CHECK (gross_amount >= 0),
  currency text NOT NULL DEFAULT 'USD',
  promoshare_pool_amount numeric(12,2) NOT NULL DEFAULT 0,
  liquidity_pool_amount numeric(12,2) NOT NULL DEFAULT 0,
  local_impact_pool_amount numeric(12,2) NOT NULL DEFAULT 0,
  platform_net_amount numeric(12,2) NOT NULL DEFAULT 0,
  allocation_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  allocated_cycle_id text,
  status text NOT NULL DEFAULT 'allocated' CHECK (status IN ('pending', 'allocated', 'reversed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_participant_subscription_allocations_provider_payment
  ON public.participant_subscription_allocations(provider, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_participant_subscription_allocations_user_created
  ON public.participant_subscription_allocations(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.ecosystem_pool_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_type text NOT NULL CHECK (pool_type IN ('promoshare', 'liquidity_reserve', 'local_impact', 'platform')),
  source_type text NOT NULL,
  source_id uuid,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'allocated', 'spent', 'reversed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ecosystem_pool_ledger_pool_created
  ON public.ecosystem_pool_ledger(pool_type, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ecosystem_pool_ledger_unique_source_pool
  ON public.ecosystem_pool_ledger(source_type, source_id, pool_type)
  WHERE source_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.promoshare_revenue_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_transaction_id uuid,
  source_allocation_id uuid,
  source_type text,
  total_amount numeric(15,2) NOT NULL,
  promoshare_amount numeric(15,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'allocated')),
  allocated_cycle_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_revenue_ledger_status
  ON public.promoshare_revenue_ledger(status, created_at DESC);

ALTER TABLE public.promoshare_revenue_ledger
  ADD COLUMN IF NOT EXISTS source_allocation_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_promoshare_revenue_ledger_source_allocation
  ON public.promoshare_revenue_ledger(source_type, source_allocation_id)
  WHERE source_allocation_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_effective_participant_tier(p_user_id uuid)
RETURNS TABLE (
  user_id uuid,
  tier_key text,
  display_name text,
  status_source text,
  points_multiplier numeric,
  key_cost_multiplier numeric,
  promoshare_ticket_multiplier numeric,
  promoshare_weight_multiplier numeric,
  promoshare_cash_gem_eligible boolean,
  monthly_cash_gem_cap numeric,
  current_period_end timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH raw_status AS (
    SELECT s.*
    FROM public.user_participant_tier_status s
    WHERE s.user_id = p_user_id
      AND s.status = 'active'
      AND (
        s.status_source = 'admin'
        OR s.current_period_end IS NULL
        OR s.current_period_end > now()
      )
    ORDER BY
      CASE s.status_source
        WHEN 'admin' THEN 3
        WHEN 'paid' THEN 2
        WHEN 'earned' THEN 1
        ELSE 0
      END DESC,
      s.current_period_end DESC NULLS LAST
    LIMIT 1
  ),
  effective_status AS (
    SELECT
      p_user_id AS user_id,
      COALESCE((SELECT current_tier_key FROM raw_status), 'free') AS tier_key,
      COALESCE((SELECT status_source FROM raw_status), 'free') AS status_source,
      (SELECT current_period_end FROM raw_status) AS current_period_end
  )
  SELECT
    effective_status.user_id,
    c.tier_key,
    c.display_name,
    effective_status.status_source,
    c.points_multiplier,
    c.key_cost_multiplier,
    c.promoshare_ticket_multiplier,
    c.promoshare_weight_multiplier,
    c.promoshare_cash_gem_eligible,
    c.monthly_cash_gem_cap,
    effective_status.current_period_end
  FROM effective_status
  JOIN public.participant_tier_configs c ON c.tier_key = effective_status.tier_key
  WHERE c.is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.record_participant_keys_earned(
  p_user_id uuid,
  p_keys integer,
  p_source text DEFAULT 'verified_activity',
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS public.user_participant_tier_status
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start date := date_trunc('month', now())::date;
  v_period_end date := (date_trunc('month', now()) + interval '1 month')::date;
  v_keys_earned integer;
  v_earned_tier public.participant_tier_configs;
  v_current_rank integer := 0;
  v_result public.user_participant_tier_status;
BEGIN
  IF p_keys IS NULL OR p_keys <= 0 THEN
    RAISE EXCEPTION 'p_keys must be positive';
  END IF;

  INSERT INTO public.participant_key_monthly_progress (
    user_id,
    period_start,
    period_end,
    keys_earned,
    last_source,
    metadata
  )
  VALUES (
    p_user_id,
    v_period_start,
    v_period_end,
    p_keys,
    p_source,
    p_metadata
  )
  ON CONFLICT (user_id, period_start) DO UPDATE SET
    keys_earned = public.participant_key_monthly_progress.keys_earned + EXCLUDED.keys_earned,
    last_source = EXCLUDED.last_source,
    metadata = public.participant_key_monthly_progress.metadata || EXCLUDED.metadata,
    updated_at = now()
  RETURNING keys_earned INTO v_keys_earned;

  SELECT *
  INTO v_earned_tier
  FROM public.participant_tier_configs
  WHERE is_active = true
    AND monthly_key_unlock_threshold IS NOT NULL
    AND monthly_key_unlock_threshold > 0
    AND monthly_key_unlock_threshold <= v_keys_earned
  ORDER BY tier_rank DESC
  LIMIT 1;

  IF v_earned_tier.tier_key IS NULL THEN
    SELECT *
    INTO v_result
    FROM public.user_participant_tier_status
    WHERE user_id = p_user_id;

    RETURN v_result;
  END IF;

  UPDATE public.participant_key_monthly_progress
  SET highest_earned_tier_key = v_earned_tier.tier_key,
      updated_at = now()
  WHERE user_id = p_user_id
    AND period_start = v_period_start;

  SELECT COALESCE(c.tier_rank, 0)
  INTO v_current_rank
  FROM public.user_participant_tier_status s
  LEFT JOIN public.participant_tier_configs c ON c.tier_key = s.current_tier_key
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND (s.current_period_end IS NULL OR s.current_period_end > now());

  v_current_rank := COALESCE(v_current_rank, 0);

  IF v_earned_tier.tier_rank >= v_current_rank THEN
    INSERT INTO public.user_participant_tier_status (
      user_id,
      current_tier_key,
      status_source,
      status,
      current_period_start,
      current_period_end,
      earned_from_period_start,
      earned_from_period_end,
      earned_keys,
      metadata
    )
    VALUES (
      p_user_id,
      v_earned_tier.tier_key,
      'earned',
      'active',
      now(),
      now() + make_interval(days => v_earned_tier.earned_status_duration_days),
      v_period_start,
      v_period_end,
      v_keys_earned,
      jsonb_build_object('source', p_source, 'threshold', v_earned_tier.monthly_key_unlock_threshold)
    )
    ON CONFLICT (user_id) DO UPDATE SET
      current_tier_key = EXCLUDED.current_tier_key,
      status_source = EXCLUDED.status_source,
      status = EXCLUDED.status,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      earned_from_period_start = EXCLUDED.earned_from_period_start,
      earned_from_period_end = EXCLUDED.earned_from_period_end,
      earned_keys = EXCLUDED.earned_keys,
      metadata = public.user_participant_tier_status.metadata || EXCLUDED.metadata,
      updated_at = now();
  END IF;

  SELECT *
  INTO v_result
  FROM public.user_participant_tier_status
  WHERE user_id = p_user_id;

  RETURN v_result;
END $$;

CREATE OR REPLACE FUNCTION public.apply_participant_subscription_payment(
  p_user_id uuid,
  p_tier_key text,
  p_amount numeric,
  p_currency text DEFAULT 'USD',
  p_provider text DEFAULT 'stripe',
  p_provider_payment_id text DEFAULT NULL,
  p_provider_subscription_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS public.participant_subscription_allocations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier public.participant_tier_configs;
  v_cycle_id text;
  v_promoshare_amount numeric(12,2);
  v_liquidity_amount numeric(12,2);
  v_local_impact_amount numeric(12,2);
  v_platform_amount numeric(12,2);
  v_allocation public.participant_subscription_allocations;
  v_existing_allocation_id uuid;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'p_amount must be positive';
  END IF;

  SELECT *
  INTO v_tier
  FROM public.participant_tier_configs
  WHERE tier_key = lower(p_tier_key)
    AND is_active = true
    AND is_paid = true;

  IF v_tier.tier_key IS NULL THEN
    RAISE EXCEPTION 'Unknown paid participant tier: %', p_tier_key;
  END IF;

  SELECT id::text
  INTO v_cycle_id
  FROM public.promoshare_cycles
  WHERE status = 'active'
    AND start_at <= now()
    AND end_at > now()
  ORDER BY
    CASE cycle_type
      WHEN 'monthly' THEN 1
      WHEN 'weekly' THEN 2
      WHEN 'daily' THEN 3
      ELSE 4
    END,
    end_at ASC
  LIMIT 1;

  v_promoshare_amount := round(p_amount * v_tier.promoshare_pool_percent, 2);
  v_liquidity_amount := round(p_amount * v_tier.liquidity_pool_percent, 2);
  v_local_impact_amount := round(p_amount * v_tier.local_impact_pool_percent, 2);
  v_platform_amount := round(p_amount - v_promoshare_amount - v_liquidity_amount - v_local_impact_amount, 2);

  IF p_provider_payment_id IS NOT NULL THEN
    SELECT id
    INTO v_existing_allocation_id
    FROM public.participant_subscription_allocations
    WHERE provider = COALESCE(p_provider, 'stripe')
      AND provider_payment_id = p_provider_payment_id
    LIMIT 1;
  END IF;

  INSERT INTO public.user_participant_tier_status (
    user_id,
    current_tier_key,
    status_source,
    status,
    current_period_start,
    current_period_end,
    provider,
    provider_subscription_id,
    metadata
  )
  VALUES (
    p_user_id,
    v_tier.tier_key,
    'paid',
    'active',
    now(),
    now() + interval '1 month',
    p_provider,
    p_provider_subscription_id,
    p_metadata
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_tier_key = EXCLUDED.current_tier_key,
    status_source = EXCLUDED.status_source,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    provider = EXCLUDED.provider,
    provider_subscription_id = EXCLUDED.provider_subscription_id,
    metadata = public.user_participant_tier_status.metadata || EXCLUDED.metadata,
    updated_at = now();

  UPDATE public.users
  SET user_tier = v_tier.tier_key,
      updated_at = now()
  WHERE id = p_user_id;

  INSERT INTO public.participant_subscription_allocations (
    user_id,
    tier_key,
    provider,
    provider_payment_id,
    provider_subscription_id,
    gross_amount,
    currency,
    promoshare_pool_amount,
    liquidity_pool_amount,
    local_impact_pool_amount,
    platform_net_amount,
    allocation_config,
    allocated_cycle_id,
    metadata
  )
  VALUES (
    p_user_id,
    v_tier.tier_key,
    COALESCE(p_provider, 'stripe'),
    p_provider_payment_id,
    p_provider_subscription_id,
    round(p_amount, 2),
    upper(COALESCE(p_currency, v_tier.currency, 'USD')),
    v_promoshare_amount,
    v_liquidity_amount,
    v_local_impact_amount,
    v_platform_amount,
    jsonb_build_object(
      'promoshare_pool_percent', v_tier.promoshare_pool_percent,
      'liquidity_pool_percent', v_tier.liquidity_pool_percent,
      'local_impact_pool_percent', v_tier.local_impact_pool_percent
    ),
    v_cycle_id,
    p_metadata
  )
  ON CONFLICT (provider, provider_payment_id) WHERE provider_payment_id IS NOT NULL DO UPDATE SET
    user_id = EXCLUDED.user_id,
    tier_key = EXCLUDED.tier_key,
    provider_subscription_id = EXCLUDED.provider_subscription_id,
    gross_amount = EXCLUDED.gross_amount,
    currency = EXCLUDED.currency,
    promoshare_pool_amount = EXCLUDED.promoshare_pool_amount,
    liquidity_pool_amount = EXCLUDED.liquidity_pool_amount,
    local_impact_pool_amount = EXCLUDED.local_impact_pool_amount,
    platform_net_amount = EXCLUDED.platform_net_amount,
    allocation_config = EXCLUDED.allocation_config,
    allocated_cycle_id = EXCLUDED.allocated_cycle_id,
    metadata = public.participant_subscription_allocations.metadata || EXCLUDED.metadata,
    updated_at = now()
  RETURNING * INTO v_allocation;

  INSERT INTO public.ecosystem_pool_ledger (pool_type, source_type, source_id, user_id, amount, currency, metadata)
  VALUES
    ('promoshare', 'participant_subscription', v_allocation.id, p_user_id, v_promoshare_amount, v_allocation.currency, p_metadata),
    ('liquidity_reserve', 'participant_subscription', v_allocation.id, p_user_id, v_liquidity_amount, v_allocation.currency, p_metadata),
    ('local_impact', 'participant_subscription', v_allocation.id, p_user_id, v_local_impact_amount, v_allocation.currency, p_metadata),
    ('platform', 'participant_subscription', v_allocation.id, p_user_id, v_platform_amount, v_allocation.currency, p_metadata)
  ON CONFLICT (source_type, source_id, pool_type) WHERE source_id IS NOT NULL DO UPDATE SET
    user_id = EXCLUDED.user_id,
    amount = EXCLUDED.amount,
    currency = EXCLUDED.currency,
    metadata = public.ecosystem_pool_ledger.metadata || EXCLUDED.metadata;

  IF v_cycle_id IS NOT NULL AND v_promoshare_amount > 0 AND v_existing_allocation_id IS NULL THEN
    UPDATE public.promoshare_cycles
    SET jackpot_amount = COALESCE(jackpot_amount, 0) + v_promoshare_amount,
        updated_at = now()
    WHERE id::text = v_cycle_id;

    INSERT INTO public.promoshare_revenue_ledger (
      source_transaction_id,
      source_allocation_id,
      source_type,
      total_amount,
      promoshare_amount,
      status,
      allocated_cycle_id,
      metadata
    )
    VALUES (
      NULL,
      v_allocation.id,
      'participant_subscription',
      round(p_amount, 2),
      v_promoshare_amount,
      'allocated',
      v_cycle_id,
      jsonb_build_object(
        'allocation_id', v_allocation.id,
        'provider_payment_id', p_provider_payment_id,
        'provider_subscription_id', p_provider_subscription_id,
        'tier_key', v_tier.tier_key
      ) || p_metadata
    )
    ON CONFLICT (source_type, source_allocation_id) WHERE source_allocation_id IS NOT NULL DO UPDATE SET
      total_amount = EXCLUDED.total_amount,
      promoshare_amount = EXCLUDED.promoshare_amount,
      status = EXCLUDED.status,
      allocated_cycle_id = EXCLUDED.allocated_cycle_id,
      metadata = public.promoshare_revenue_ledger.metadata || EXCLUDED.metadata;
  END IF;

  RETURN v_allocation;
END $$;

DO $$
BEGIN
  IF to_regclass('public.promoshare_tickets') IS NOT NULL THEN
    ALTER TABLE public.promoshare_tickets
      ADD COLUMN IF NOT EXISTS tier_key text REFERENCES public.participant_tier_configs(tier_key),
      ADD COLUMN IF NOT EXISTS tier_multiplier numeric(5,2) NOT NULL DEFAULT 1.00,
      ADD COLUMN IF NOT EXISTS cash_gem_eligible_at_issue boolean NOT NULL DEFAULT false;
  END IF;

  IF to_regclass('public.promoshare_entries') IS NOT NULL THEN
    ALTER TABLE public.promoshare_entries
      ADD COLUMN IF NOT EXISTS tier_key text REFERENCES public.participant_tier_configs(tier_key),
      ADD COLUMN IF NOT EXISTS tier_multiplier numeric(5,2) NOT NULL DEFAULT 1.00,
      ADD COLUMN IF NOT EXISTS cash_gem_eligible_at_issue boolean NOT NULL DEFAULT false;
  END IF;
END $$;

ALTER TABLE public.participant_tier_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_participant_tier_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_key_monthly_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_subscription_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecosystem_pool_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoshare_revenue_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participant tiers are readable" ON public.participant_tier_configs;
CREATE POLICY "Participant tiers are readable"
  ON public.participant_tier_configs FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Users can read own participant tier status" ON public.user_participant_tier_status;
CREATE POLICY "Users can read own participant tier status"
  ON public.user_participant_tier_status FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own participant key progress" ON public.participant_key_monthly_progress;
CREATE POLICY "Users can read own participant key progress"
  ON public.participant_key_monthly_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own subscription allocations" ON public.participant_subscription_allocations;
CREATE POLICY "Users can read own subscription allocations"
  ON public.participant_subscription_allocations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own ecosystem pool ledger rows" ON public.ecosystem_pool_ledger;
CREATE POLICY "Users can read own ecosystem pool ledger rows"
  ON public.ecosystem_pool_ledger FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read ecosystem pool ledger" ON public.ecosystem_pool_ledger;
CREATE POLICY "Admins can read ecosystem pool ledger"
  ON public.ecosystem_pool_ledger FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.user_type IN ('admin', 'master_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can read PromoShare revenue ledger" ON public.promoshare_revenue_ledger;
CREATE POLICY "Admins can read PromoShare revenue ledger"
  ON public.promoshare_revenue_ledger FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.user_type IN ('admin', 'master_admin')
    )
  );

NOTIFY pgrst, 'reload schema';
