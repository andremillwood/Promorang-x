-- Growth Hub Schema v2 - Using pgcrypto for UUID generation
-- This is a complete replacement for 202510280001_growth_hub_schema.sql

-- Growth Hub ledger for all financial transactions
create table if not exists public.growth_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('stake', 'unstake', 'reward', 'funding', 'shield_purchase')),
  amount numeric(18, 8) not null,
  currency text not null default ('promo'),
  status text not null default ('pending') check (status in ('pending', 'completed', 'failed', 'refunded')),
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Staking channels (e.g., Foundation Growth, Creator Accelerator)
create table if not exists public.staking_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  lock_period_days integer not null,
  base_multiplier numeric(5, 2) not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  min_amount numeric(18, 8) not null,
  max_amount numeric(18, 8),
  expected_apr numeric(5, 2),
  is_active boolean default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- User staking positions
create table if not exists public.staking_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  channel_id uuid not null references public.staking_channels(id) on delete restrict,
  amount_staked numeric(18, 8) not null,
  amount_earned numeric(18, 8) default 0,
  multiplier numeric(5, 2) not null,
  start_date timestamptz not null default timezone('utc', now()),
  unlock_date timestamptz not null,
  status text not null default 'active' check (status in ('active', 'unlocked', 'withdrawn', 'sold')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Creator reward tiers
create table if not exists public.creator_reward_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  min_followers integer not null,
  max_followers integer,
  reward_multiplier numeric(5, 2) not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Creator rewards tracking
create table if not exists public.creator_rewards (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  reward_tier_id uuid not null references public.creator_reward_tiers(id) on delete cascade,
  metric text not null check (metric in ('views', 'paid_shares', 'free_shares', 'comments')),
  amount_earned numeric(18, 8) not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Funding projects
create table if not exists public.funding_projects (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text,
  funding_goal numeric(18, 8) not null,
  current_funding numeric(18, 8) default 0,
  backer_count integer default 0,
  days_left integer not null,
  min_pledge numeric(18, 8) not null,
  featured boolean default false,
  status text not null default 'active' check (status in ('active', 'funded', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Funding backers
create table if not exists public.funding_backers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.funding_projects(id) on delete cascade,
  backer_id uuid not null references public.users(id) on delete cascade,
  amount_pledged numeric(18, 8) not null,
  reward_tier text,
  status text not null default 'pledged' check (status in ('pledged', 'collected', 'refunded')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(project_id, backer_id)
);

-- Social shield policies
create table if not exists public.shield_policies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  coverage jsonb not null, -- JSON structure with coverage details
  monthly_premium numeric(18, 8) not null,
  max_coverage numeric(18, 8) not null,
  deductible numeric(18, 8) not null,
  platforms text[] not null,
  min_followers integer not null,
  is_active boolean default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Social shield subscriptions
create table if not exists public.shield_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  policy_id uuid not null references public.shield_policies(id) on delete restrict,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired', 'claimed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Shield claims
create table if not exists public.shield_claims (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.shield_subscriptions(id) on delete cascade,
  claim_amount numeric(18, 8) not null,
  status text not null default 'submitted' check (status in ('submitted', 'under_review', 'approved', 'rejected', 'paid')),
  reason text not null,
  evidence jsonb,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Update triggers for timestamps
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at before update on public.growth_ledger
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.staking_channels
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.staking_positions
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.funding_projects
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.funding_backers
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.shield_policies
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.shield_subscriptions
  for each row execute function public.touch_updated_at();

-- Add comments for documentation
comment on table public.growth_ledger is 'Tracks all financial transactions in the Growth Hub';
comment on table public.staking_channels is 'Available staking channels with their parameters';
comment on table public.staking_positions is 'User staking positions and their status';
comment on table public.creator_reward_tiers is 'Tiers for creator rewards based on follower count';
comment on table public.creator_rewards is 'Tracks rewards earned by creators for platform engagement';
comment on table public.funding_projects is 'Projects seeking funding from the community';
comment on table public.funding_backers is 'Backers who have pledged to fund projects';
comment on table public.shield_policies is 'Available social shield policies for purchase';
comment on table public.shield_subscriptions is 'User subscriptions to social shield policies';
comment on table public.shield_claims is 'Claims made against social shield policies';
