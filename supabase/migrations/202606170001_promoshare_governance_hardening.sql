-- PromoShare governance hardening.
-- Adds explicit policy/rule/audit fields for pool matching, draw fairness,
-- ticket expiry, fraud controls, and platform-funded budget discipline.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.promoshare_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id bigint NOT NULL REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_promoshare_entries_unique_source ON public.promoshare_entries(cycle_id, user_id, source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_promoshare_entries_cycle_user ON public.promoshare_entries(cycle_id, user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.promoshare_user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id bigint NOT NULL REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  eligible boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'not_qualified',
  verified_moves_count integer NOT NULL DEFAULT 0,
  moments_joined_count integer NOT NULL DEFAULT 0,
  proofs_submitted_count integer NOT NULL DEFAULT 0,
  proofs_approved_count integer NOT NULL DEFAULT 0,
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

CREATE INDEX IF NOT EXISTS idx_promoshare_user_stats_cycle_eligible ON public.promoshare_user_stats(cycle_id, eligible, disqualified, final_weight DESC);

CREATE TABLE IF NOT EXISTS public.promoshare_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id bigint REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  actor_type text NOT NULL DEFAULT 'system',
  actor_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_audit_log_cycle_created ON public.promoshare_audit_log(cycle_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.promoshare_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id bigint REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_promoshare_notifications_user_created ON public.promoshare_notifications(user_id, created_at DESC);

ALTER TABLE public.promoshare_cycles ADD COLUMN IF NOT EXISTS pool_scope text NOT NULL DEFAULT 'global' CHECK (pool_scope IN ('global', 'platform', 'sponsor', 'moment', 'campaign', 'venue', 'creator', 'referral'));
ALTER TABLE public.promoshare_cycles ADD COLUMN IF NOT EXISTS pool_rule_config jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.promoshare_cycles ADD COLUMN IF NOT EXISTS draw_policy jsonb NOT NULL DEFAULT '{"selection_method":"random_weighted_by_entries","one_win_per_user_per_draw":true,"tickets_can_count_across_eligible_cycles":true,"leaderboard_prizes_are_separate":true}'::jsonb;
ALTER TABLE public.promoshare_cycles ADD COLUMN IF NOT EXISTS fraud_config jsonb NOT NULL DEFAULT '{"max_entries_per_user_per_day":10,"max_entries_per_user_per_cycle":50,"duplicate_source_blocked":true,"proof_required_for_reward_bearing_pools":true,"manual_review_threshold":75}'::jsonb;
ALTER TABLE public.promoshare_cycles ADD COLUMN IF NOT EXISTS legal_config jsonb NOT NULL DEFAULT '{"odds_depend_on_eligible_entries":true,"no_purchase_necessary_required":false,"reward_bearing_requires_funded_value":true}'::jsonb;
ALTER TABLE public.promoshare_cycles ADD COLUMN IF NOT EXISTS platform_budget_config jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.promoshare_entries ADD COLUMN IF NOT EXISTS proof_status text NOT NULL DEFAULT 'verified' CHECK (proof_status IN ('pending', 'verified', 'rejected', 'expired'));
ALTER TABLE public.promoshare_entries ADD COLUMN IF NOT EXISTS eligibility_expires_at timestamptz;
ALTER TABLE public.promoshare_entries ADD COLUMN IF NOT EXISTS pool_scope text;
ALTER TABLE public.promoshare_entries ADD COLUMN IF NOT EXISTS rule_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.promoshare_winners ADD COLUMN IF NOT EXISTS winning_entry_id uuid REFERENCES public.promoshare_entries(id) ON DELETE SET NULL;
ALTER TABLE public.promoshare_winners ADD COLUMN IF NOT EXISTS draw_audit_id uuid;
ALTER TABLE public.promoshare_winners ADD COLUMN IF NOT EXISTS duplicate_user_suppressed boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.promoshare_draw_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id bigint NOT NULL REFERENCES public.promoshare_cycles(id) ON DELETE CASCADE,
  draw_type text NOT NULL DEFAULT 'cycle',
  selection_method text NOT NULL DEFAULT 'random_weighted_by_entries',
  eligible_entries_count integer NOT NULL DEFAULT 0,
  eligible_users_count integer NOT NULL DEFAULT 0,
  requested_winner_count integer NOT NULL DEFAULT 0,
  selected_winner_count integer NOT NULL DEFAULT 0,
  one_win_per_user boolean NOT NULL DEFAULT true,
  excluded_user_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  selected_user_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  selected_entry_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  random_seed text,
  rules_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  executed_by uuid,
  executed_by_type text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promoshare_draw_audits_cycle_created ON public.promoshare_draw_audits(cycle_id, created_at DESC);

ALTER TABLE public.promoshare_draw_audits ENABLE ROW LEVEL SECURITY;
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

DROP POLICY IF EXISTS "Users can view own PromoShare audit rows" ON public.promoshare_audit_log;
CREATE POLICY "Users can view own PromoShare audit rows"
  ON public.promoshare_audit_log FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own PromoShare notifications" ON public.promoshare_notifications;
CREATE POLICY "Users can view own PromoShare notifications"
  ON public.promoshare_notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view draw audits for their wins" ON public.promoshare_draw_audits;
CREATE POLICY "Users can view draw audits for their wins"
  ON public.promoshare_draw_audits FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.promoshare_winners w
      WHERE w.cycle_id = promoshare_draw_audits.cycle_id
        AND w.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage PromoShare draw audits" ON public.promoshare_draw_audits;
CREATE POLICY "Admins can manage PromoShare draw audits"
  ON public.promoshare_draw_audits FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

COMMENT ON COLUMN public.promoshare_cycles.pool_rule_config IS
  'Rule snapshot used to match verified actions to this pool/cycle: actions, locations, moments, proof requirements, entry weights, caps.';
COMMENT ON COLUMN public.promoshare_cycles.draw_policy IS
  'Draw governance policy, including one-win-per-user and separation of random draws from leaderboard prizes.';
COMMENT ON TABLE public.promoshare_draw_audits IS
  'Immutable-ish audit rows for PromoShare winner selection, including eligible counts, selected users, and rule snapshots.';

NOTIFY pgrst, 'reload schema';
