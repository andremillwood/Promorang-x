-- PromoShare v2 foundation.
-- This extends the older ticket-based schema with the richer cycle, entry,
-- qualification, audit, and notification structures already expected by the backend.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.promoshare_cycles
  ADD COLUMN IF NOT EXISTS cycle_name text,
  ADD COLUMN IF NOT EXISTS eligibility_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS weight_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS selection_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS distribution_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sponsor_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS funding_model text NOT NULL DEFAULT 'platform',
  ADD COLUMN IF NOT EXISTS settled_at timestamptz;

ALTER TABLE public.promoshare_cycles
  DROP CONSTRAINT IF EXISTS promoshare_cycles_status_check;

ALTER TABLE public.promoshare_cycles
  ADD CONSTRAINT promoshare_cycles_status_check
  CHECK (status IN ('draft', 'active', 'settling', 'completed', 'cancelled', 'paused'));

ALTER TABLE public.promoshare_pool_items
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS distribution_bucket text;

ALTER TABLE public.promoshare_pool_items
  DROP CONSTRAINT IF EXISTS promoshare_pool_items_reward_type_check;

ALTER TABLE public.promoshare_pool_items
  ADD CONSTRAINT promoshare_pool_items_reward_type_check
  CHECK (reward_type IN ('gem', 'gems', 'key', 'keys', 'point', 'points', 'coupon', 'product', 'cash', 'other'));

ALTER TABLE public.promoshare_winners
  ADD COLUMN IF NOT EXISTS selection_bucket text,
  ADD COLUMN IF NOT EXISTS selection_method text,
  ADD COLUMN IF NOT EXISTS selection_reason text,
  ADD COLUMN IF NOT EXISTS final_weight_at_selection numeric,
  ADD COLUMN IF NOT EXISTS rank_at_selection integer,
  ADD COLUMN IF NOT EXISTS announced boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS claimed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'awarded',
  ADD COLUMN IF NOT EXISTS prize_gem_amount numeric;

DO $$
DECLARE
  pool_id_type text;
BEGIN
  SELECT format_type(a.atttypid, a.atttypmod)
  INTO pool_id_type
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'promoshare_pool_items'
    AND a.attname = 'id'
    AND a.attnum > 0
    AND NOT a.attisdropped;

  IF pool_id_type IS NULL THEN
    RAISE EXCEPTION 'public.promoshare_pool_items.id not found';
  END IF;

  EXECUTE format(
    'ALTER TABLE public.promoshare_winners ADD COLUMN IF NOT EXISTS pool_id %s',
    pool_id_type
  );

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'promoshare_winners_pool_id_fkey'
      AND conrelid = 'public.promoshare_winners'::regclass
  ) THEN
    EXECUTE format(
      'ALTER TABLE public.promoshare_winners ADD CONSTRAINT promoshare_winners_pool_id_fkey FOREIGN KEY (pool_id) REFERENCES public.promoshare_pool_items(id) ON DELETE SET NULL'
    );
  END IF;
END $$;

ALTER TABLE public.promoshare_sponsorships
  ADD COLUMN IF NOT EXISTS brand_message text,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_amount numeric,
  ADD COLUMN IF NOT EXISTS platform_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_to_prizes numeric NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.promoshare_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_action text NOT NULL,
  source_id text,
  entry_count integer NOT NULL DEFAULT 1 CHECK (entry_count >= 0),
  weight_value numeric NOT NULL DEFAULT 1 CHECK (weight_value >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_promoshare_entries_unique_source
  ON public.promoshare_entries(cycle_id, user_id, source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_promoshare_entries_cycle_user
  ON public.promoshare_entries(cycle_id, user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.promoshare_user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  eligible boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'not_qualified',
  verified_moves_count integer NOT NULL DEFAULT 0,
  moments_joined_count integer NOT NULL DEFAULT 0,
  proofs_submitted_count integer NOT NULL DEFAULT 0,
  referral_count integer NOT NULL DEFAULT 0,
  total_entries integer NOT NULL DEFAULT 0,
  base_entry_score numeric NOT NULL DEFAULT 0,
  activity_score numeric NOT NULL DEFAULT 0,
  referral_bonus numeric NOT NULL DEFAULT 0,
  tier_multiplier numeric NOT NULL DEFAULT 1,
  final_weight numeric NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  rank_at_selection integer,
  risk_score numeric NOT NULL DEFAULT 0,
  disqualified boolean NOT NULL DEFAULT false,
  disqualified_reason text,
  manual_review_required boolean NOT NULL DEFAULT false,
  first_activity_at timestamptz,
  last_activity_at timestamptz,
  last_computed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cycle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_promoshare_user_stats_cycle_eligible
  ON public.promoshare_user_stats(cycle_id, eligible, disqualified, final_weight DESC);

CREATE TABLE IF NOT EXISTS public.promoshare_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  actor_type text NOT NULL,
  actor_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_audit_log_cycle_created
  ON public.promoshare_audit_log(cycle_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.promoshare_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  channels text[] NOT NULL DEFAULT ARRAY['in_app']::text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_notifications_user_created
  ON public.promoshare_notifications(user_id, created_at DESC);

ALTER TABLE public.promoshare_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoshare_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoshare_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoshare_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own PromoShare entries" ON public.promoshare_entries;
CREATE POLICY "Users can view own PromoShare entries"
  ON public.promoshare_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own PromoShare stats" ON public.promoshare_user_stats;
CREATE POLICY "Users can view own PromoShare stats"
  ON public.promoshare_user_stats FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own PromoShare notifications" ON public.promoshare_notifications;
CREATE POLICY "Users can view own PromoShare notifications"
  ON public.promoshare_notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own PromoShare audit rows" ON public.promoshare_audit_log;
CREATE POLICY "Users can view own PromoShare audit rows"
  ON public.promoshare_audit_log FOR SELECT
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
