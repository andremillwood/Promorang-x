-- Promorang Matrix MLM Subscription System
-- Timestamp: 2026-01-10
-- This migration creates the complete Matrix compensation system tables

-- ============================================================================
-- SUBSCRIPTION TIERS (extends existing users table)
-- ============================================================================

-- Matrix-eligible subscription tiers
create table if not exists public.matrix_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  tier text not null check (tier in ('user_50', 'user_100', 'user_200', 'user_500')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'paused', 'pending')),
  amount_cents integer not null,
  currency text not null default 'usd',
  start_at timestamptz not null default now(),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '1 month'),
  canceled_at timestamptz,
  provider text default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);
create index if not exists idx_matrix_subscriptions_user on public.matrix_subscriptions(user_id);
create index if not exists idx_matrix_subscriptions_status on public.matrix_subscriptions(status);

-- ============================================================================
-- SPONSOR RELATIONSHIPS (who recruited whom)
-- ============================================================================

create table if not exists public.matrix_sponsor_links (
  id uuid primary key default gen_random_uuid(),
  sponsor_user_id uuid not null references public.users(id) on delete cascade,
  recruit_user_id uuid not null references public.users(id) on delete cascade,
  source text not null default 'referral_link' check (source in ('referral_link', 'admin_assign', 'import', 'direct')),
  linked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(recruit_user_id) -- Each user can only have one sponsor
);
create index if not exists idx_matrix_sponsor_links_sponsor on public.matrix_sponsor_links(sponsor_user_id);
create index if not exists idx_matrix_sponsor_links_recruit on public.matrix_sponsor_links(recruit_user_id);

-- ============================================================================
-- MATRIX INSTANCES (allows seasons/versions)
-- ============================================================================

create table if not exists public.matrix_instances (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'archived', 'draft')),
  effective_from timestamptz default now(),
  effective_to timestamptz,
  config_json jsonb not null default '{
    "period_type": "weekly",
    "payout_delay_days": 7,
    "direct_commission": { "percent": 20, "eligible_tiers": ["user_50","user_100","user_200","user_500"] },
    "residual_commission": { "percent": 10, "eligible_tiers": ["user_50","user_100","user_200","user_500"] },
    "qualification": {
      "requires_active_subscription": true,
      "min_personal_active_recruits": 2,
      "support_actions_per_recruit_per_period": 1,
      "min_support_actions_total_per_period": 3,
      "unlock_depth_by_rank": true,
      "retention_thresholds": { "promoranger": 0.3, "entered_apprentice": 0.5, "presidential": 0.7, "diamond": 0.8, "blue_diamond": 0.9 }
    },
    "caps": {
      "weekly_cap_by_rank": { "promoranger": 5000, "entered_apprentice": 10000, "presidential": 25000, "diamond": 50000, "blue_diamond": 100000 }
    },
    "clawbacks": {
      "on_chargeback": true,
      "on_refund_within_days": 30
    }
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- MATRIX RANKS
-- ============================================================================

create table if not exists public.matrix_ranks (
  id uuid primary key default gen_random_uuid(),
  matrix_instance_id uuid not null references public.matrix_instances(id) on delete cascade,
  rank_key text not null,
  rank_name text not null,
  order_index integer not null,
  weekly_cap_cents integer not null default 500000, -- $5000 default
  eligible_depth integer not null default 1, -- How many levels deep can earn
  min_active_recruits integer not null default 0,
  min_team_size integer not null default 0,
  min_retention_rate numeric(5,2) not null default 0.00,
  commission_rate_direct numeric(5,2) not null default 20.00,
  commission_rate_residual numeric(5,2) not null default 10.00,
  rank_bonus_cents integer default 0,
  badge_icon text,
  badge_color text,
  created_at timestamptz not null default now(),
  unique(matrix_instance_id, rank_key)
);
create index if not exists idx_matrix_ranks_instance on public.matrix_ranks(matrix_instance_id);

-- ============================================================================
-- USER RANK STATUS
-- ============================================================================

create table if not exists public.matrix_user_rank_status (
  id uuid primary key default gen_random_uuid(),
  matrix_instance_id uuid not null references public.matrix_instances(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  rank_id uuid not null references public.matrix_ranks(id) on delete cascade,
  achieved_at timestamptz not null default now(),
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  unique(matrix_instance_id, user_id, rank_id)
);
create index if not exists idx_matrix_user_rank_status_user on public.matrix_user_rank_status(user_id);
create index if not exists idx_matrix_user_rank_status_current on public.matrix_user_rank_status(user_id, is_current) where is_current = true;

-- ============================================================================
-- QUALIFICATION PERIODS
-- ============================================================================

create table if not exists public.matrix_qualification_periods (
  id uuid primary key default gen_random_uuid(),
  matrix_instance_id uuid not null references public.matrix_instances(id) on delete cascade,
  period_type text not null default 'weekly' check (period_type in ('weekly', 'monthly')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  status text not null default 'open' check (status in ('open', 'closed', 'computing', 'paid')),
  created_at timestamptz not null default now(),
  unique(matrix_instance_id, period_start)
);
create index if not exists idx_matrix_qualification_periods_status on public.matrix_qualification_periods(status);

-- ============================================================================
-- QUALIFICATION STATUS (per user per period)
-- ============================================================================

create table if not exists public.matrix_qualification_status (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.matrix_qualification_periods(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pass', 'fail', 'hold', 'pending')),
  reasons_json jsonb not null default '[]'::jsonb,
  active_recruits_count integer not null default 0,
  total_team_size integer not null default 0,
  retention_rate numeric(5,2) not null default 0.00,
  support_actions_count integer not null default 0,
  computed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(period_id, user_id)
);
create index if not exists idx_matrix_qualification_status_user on public.matrix_qualification_status(user_id);
create index if not exists idx_matrix_qualification_status_period on public.matrix_qualification_status(period_id);

-- ============================================================================
-- SUPPORT LOGS (proof of sponsor support)
-- ============================================================================

create table if not exists public.matrix_support_logs (
  id uuid primary key default gen_random_uuid(),
  sponsor_user_id uuid not null references public.users(id) on delete cascade,
  recruit_user_id uuid not null references public.users(id) on delete cascade,
  period_id uuid references public.matrix_qualification_periods(id) on delete set null,
  action_type text not null check (action_type in (
    'onboarding_complete', 
    'check_in', 
    'training_attended', 
    'module_completed', 
    'activation_help', 
    'call_logged',
    'message_sent',
    'other'
  )),
  evidence_url text,
  notes text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_matrix_support_logs_sponsor on public.matrix_support_logs(sponsor_user_id);
create index if not exists idx_matrix_support_logs_recruit on public.matrix_support_logs(recruit_user_id);
create index if not exists idx_matrix_support_logs_period on public.matrix_support_logs(period_id);

-- ============================================================================
-- EARNINGS LEDGER (immutable journal)
-- ============================================================================

create table if not exists public.matrix_earnings_ledger (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.matrix_qualification_periods(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null check (source_type in (
    'direct_commission',
    'residual_commission', 
    'matrix_fill_bonus',
    'rank_bonus',
    'retention_bonus',
    'adjustment',
    'clawback'
  )),
  source_ref_type text check (source_ref_type in ('subscription', 'user', 'period', 'admin')),
  source_ref_id uuid,
  amount_cents integer not null, -- Can be negative for clawbacks
  status text not null default 'pending' check (status in ('pending', 'eligible', 'held', 'paid', 'void')),
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_matrix_earnings_ledger_user on public.matrix_earnings_ledger(user_id);
create index if not exists idx_matrix_earnings_ledger_period on public.matrix_earnings_ledger(period_id);
create index if not exists idx_matrix_earnings_ledger_status on public.matrix_earnings_ledger(status);

-- ============================================================================
-- PAYOUT ACCOUNTS
-- ============================================================================

create table if not exists public.matrix_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  method text not null check (method in ('bank', 'paypal', 'wallet', 'crypto', 'check')),
  details_json jsonb not null default '{}'::jsonb, -- Encrypted at rest
  is_default boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_matrix_payout_accounts_user on public.matrix_payout_accounts(user_id);

-- ============================================================================
-- PAYOUT REQUESTS
-- ============================================================================

create table if not exists public.matrix_payout_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  period_id uuid not null references public.matrix_qualification_periods(id) on delete cascade,
  payout_account_id uuid references public.matrix_payout_accounts(id) on delete set null,
  requested_amount_cents integer not null,
  approved_amount_cents integer,
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'paid', 'failed', 'canceled')),
  hold_reason text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_matrix_payout_requests_user on public.matrix_payout_requests(user_id);
create index if not exists idx_matrix_payout_requests_status on public.matrix_payout_requests(status);

-- ============================================================================
-- FRAUD FLAGS
-- ============================================================================

create table if not exists public.matrix_fraud_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  flag_type text not null check (flag_type in (
    'duplicate_device',
    'chargeback_risk',
    'rapid_cycling',
    'fake_support',
    'suspicious_pattern',
    'other'
  )),
  severity text not null default 'low' check (severity in ('low', 'med', 'high')),
  details_json jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'dismissed')),
  resolved_by uuid references public.users(id) on delete set null,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_matrix_fraud_flags_user on public.matrix_fraud_flags(user_id);
create index if not exists idx_matrix_fraud_flags_status on public.matrix_fraud_flags(status);

-- ============================================================================
-- SUBSCRIPTION EVENTS (for audit trail)
-- ============================================================================

create table if not exists public.matrix_subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.matrix_subscriptions(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'activated',
    'renewed',
    'upgraded',
    'downgraded',
    'failed',
    'canceled',
    'paused',
    'resumed',
    'refunded',
    'chargeback'
  )),
  amount_cents integer,
  metadata_json jsonb not null default '{}'::jsonb,
  provider_event_id text, -- For idempotency
  created_at timestamptz not null default now(),
  unique(provider_event_id)
);
create index if not exists idx_matrix_subscription_events_subscription on public.matrix_subscription_events(subscription_id);
create index if not exists idx_matrix_subscription_events_user on public.matrix_subscription_events(user_id);
create index if not exists idx_matrix_subscription_events_type on public.matrix_subscription_events(event_type);

-- ============================================================================
-- MATRIX POSITIONS (for matrix-slot based systems with spillover)
-- ============================================================================

create table if not exists public.matrix_positions (
  id uuid primary key default gen_random_uuid(),
  matrix_instance_id uuid not null references public.matrix_instances(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  parent_position_id uuid references public.matrix_positions(id) on delete set null,
  position_level integer not null default 1,
  position_index integer not null default 0, -- Position within level (for width)
  filled_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(matrix_instance_id, user_id)
);
create index if not exists idx_matrix_positions_user on public.matrix_positions(user_id);
create index if not exists idx_matrix_positions_parent on public.matrix_positions(parent_position_id);
create index if not exists idx_matrix_positions_level on public.matrix_positions(matrix_instance_id, position_level);

-- ============================================================================
-- TRAINING MODULES (for support compliance)
-- ============================================================================

create table if not exists public.matrix_training_modules (
  id uuid primary key default gen_random_uuid(),
  matrix_instance_id uuid not null references public.matrix_instances(id) on delete cascade,
  title text not null,
  description text,
  content_url text,
  duration_minutes integer,
  required_for_rank text, -- rank_key or null for all
  order_index integer not null default 0,
  is_required boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.matrix_training_completions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.matrix_training_modules(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  score numeric(5,2),
  created_at timestamptz not null default now(),
  unique(module_id, user_id)
);
create index if not exists idx_matrix_training_completions_user on public.matrix_training_completions(user_id);

-- ============================================================================
-- ONBOARDING CHECKLISTS
-- ============================================================================

create table if not exists public.matrix_onboarding_items (
  id uuid primary key default gen_random_uuid(),
  matrix_instance_id uuid not null references public.matrix_instances(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.matrix_onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  item_id uuid not null references public.matrix_onboarding_items(id) on delete cascade,
  completed_at timestamptz,
  verified_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(user_id, item_id)
);
create index if not exists idx_matrix_onboarding_progress_user on public.matrix_onboarding_progress(user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get user's sponsor chain (upline)
create or replace function get_sponsor_chain(p_user_id uuid, p_max_depth integer default 10)
returns table(level integer, sponsor_id uuid, sponsor_username text)
language plpgsql
as $$
declare
  v_current_id uuid := p_user_id;
  v_level integer := 0;
begin
  while v_level < p_max_depth loop
    v_level := v_level + 1;
    
    select sl.sponsor_user_id into v_current_id
    from public.matrix_sponsor_links sl
    where sl.recruit_user_id = v_current_id;
    
    exit when v_current_id is null;
    
    return query
    select v_level, v_current_id, u.username
    from public.users u
    where u.id = v_current_id;
  end loop;
end;
$$;

-- Function to get user's direct recruits
create or replace function get_direct_recruits(p_sponsor_id uuid)
returns table(recruit_id uuid, recruit_username text, subscription_status text, linked_at timestamptz)
language sql
as $$
  select 
    sl.recruit_user_id,
    u.username,
    coalesce(ms.status, 'none'),
    sl.linked_at
  from public.matrix_sponsor_links sl
  join public.users u on u.id = sl.recruit_user_id
  left join public.matrix_subscriptions ms on ms.user_id = sl.recruit_user_id
  where sl.sponsor_user_id = p_sponsor_id
  order by sl.linked_at desc;
$$;

-- Function to count active recruits
create or replace function count_active_recruits(p_sponsor_id uuid)
returns integer
language sql
as $$
  select count(*)::integer
  from public.matrix_sponsor_links sl
  join public.matrix_subscriptions ms on ms.user_id = sl.recruit_user_id
  where sl.sponsor_user_id = p_sponsor_id
    and ms.status = 'active';
$$;

-- Function to calculate retention rate
create or replace function calculate_retention_rate(p_sponsor_id uuid)
returns numeric
language sql
as $$
  select 
    case 
      when count(*) = 0 then 0
      else (count(*) filter (where ms.status = 'active'))::numeric / count(*)::numeric
    end
  from public.matrix_sponsor_links sl
  left join public.matrix_subscriptions ms on ms.user_id = sl.recruit_user_id
  where sl.sponsor_user_id = p_sponsor_id;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at
create or replace function touch_matrix_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger matrix_subscriptions_updated_at
  before update on public.matrix_subscriptions
  for each row execute function touch_matrix_updated_at();

create trigger matrix_instances_updated_at
  before update on public.matrix_instances
  for each row execute function touch_matrix_updated_at();

create trigger matrix_payout_accounts_updated_at
  before update on public.matrix_payout_accounts
  for each row execute function touch_matrix_updated_at();

create trigger matrix_payout_requests_updated_at
  before update on public.matrix_payout_requests
  for each row execute function touch_matrix_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.matrix_subscriptions enable row level security;
alter table public.matrix_sponsor_links enable row level security;
alter table public.matrix_user_rank_status enable row level security;
alter table public.matrix_qualification_status enable row level security;
alter table public.matrix_support_logs enable row level security;
alter table public.matrix_earnings_ledger enable row level security;
alter table public.matrix_payout_accounts enable row level security;
alter table public.matrix_payout_requests enable row level security;
alter table public.matrix_fraud_flags enable row level security;
alter table public.matrix_training_completions enable row level security;
alter table public.matrix_onboarding_progress enable row level security;

-- Users can read their own data
create policy "Users can view own subscription" on public.matrix_subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can view own sponsor links" on public.matrix_sponsor_links
  for select using (auth.uid() = sponsor_user_id or auth.uid() = recruit_user_id);

create policy "Users can view own rank status" on public.matrix_user_rank_status
  for select using (auth.uid() = user_id);

create policy "Users can view own qualification" on public.matrix_qualification_status
  for select using (auth.uid() = user_id);

create policy "Users can view own support logs" on public.matrix_support_logs
  for select using (auth.uid() = sponsor_user_id or auth.uid() = recruit_user_id);

create policy "Users can insert support logs as sponsor" on public.matrix_support_logs
  for insert with check (auth.uid() = sponsor_user_id);

create policy "Users can view own earnings" on public.matrix_earnings_ledger
  for select using (auth.uid() = user_id);

create policy "Users can view own payout accounts" on public.matrix_payout_accounts
  for select using (auth.uid() = user_id);

create policy "Users can manage own payout accounts" on public.matrix_payout_accounts
  for all using (auth.uid() = user_id);

create policy "Users can view own payout requests" on public.matrix_payout_requests
  for select using (auth.uid() = user_id);

create policy "Users can create payout requests" on public.matrix_payout_requests
  for insert with check (auth.uid() = user_id);

create policy "Users can view own training completions" on public.matrix_training_completions
  for select using (auth.uid() = user_id);

create policy "Users can view own onboarding progress" on public.matrix_onboarding_progress
  for select using (auth.uid() = user_id);
