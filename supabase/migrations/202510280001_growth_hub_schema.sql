-- Growth Hub Schema
-- Migration: 202510280001_growth_hub_schema

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp" with schema extensions;

-- Growth Hub ledger for all financial transactions
create table if not exists public.growth_ledger (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null check (source_type in (
    'staking', 'staking_claim', 'funding_pledge', 'shield_premium', 'creator_reward'
  )),
  source_id uuid not null, -- references channel/position/project/subscription
  amount numeric(14,2) not null, -- positive inflow, negative outflow
  currency text not null check (currency in ('gems', 'usd')),
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'reversed')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Staking channels
create table if not exists public.staking_channels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  min_stake numeric(14,2) not null default 0,
  max_stake numeric(14,2),
  base_apr numeric(5,2) not null, -- Annual Percentage Rate
  lock_period_days integer not null, -- 0 for flexible staking
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- User staking positions
create table if not exists public.staking_positions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  channel_id uuid not null references public.staking_channels(id) on delete cascade,
  amount numeric(14,2) not null,
  multiplier numeric(6,3) not null default 1.0,
  lock_until timestamptz,
  status text not null default 'active' check (status in ('active', 'completed', 'withdrawable')),
  earned_so_far numeric(14,2) not null default 0,
  last_claimed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Funding projects
create table if not exists public.funding_projects (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  target_amount numeric(14,2) not null,
  amount_raised numeric(14,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  start_date timestamptz,
  end_date timestamptz,
  rewards jsonb, -- Structured rewards for different pledge levels
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Funding pledges
create table if not exists public.funding_pledges (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.funding_projects(id) on delete cascade,
  backer_id uuid not null references public.users(id) on delete cascade,
  amount numeric(14,2) not null,
  reward_tier text,
  status text not null default 'pledged' check (status in ('pledged', 'collected', 'refunded', 'failed')),
  collected_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Creator reward tiers
create table if not exists public.creator_reward_tiers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  metric text not null check (metric in ('views', 'paid_shares', 'free_shares', 'comments')),
  threshold numeric not null,
  reward_type text not null check (reward_type in ('usd', 'gems', 'shares')),
  reward_value numeric(14,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (metric, threshold)
);

-- Creator performance rewards
create table if not exists public.creator_rewards (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid not null references public.users(id) on delete cascade,
  reward_tier_id uuid not null references public.creator_reward_tiers(id) on delete cascade,
  metric text not null check (metric in ('views', 'paid_shares', 'free_shares', 'comments')),
  period_start date not null,
  period_end date not null,
  threshold numeric not null,
  actual numeric not null,
  reward_amount numeric(14,2) not null,
  reward_currency text not null check (reward_currency in ('usd', 'gems', 'shares')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  metadata jsonb not null default '{}',
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Shield policies
create table if not exists public.shield_policies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  coverage_amount numeric(14,2) not null,
  premium_amount numeric(14,2) not null,
  duration_days integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- User shield subscriptions
create table if not exists public.shield_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  policy_id uuid not null references public.shield_policies(id) on delete cascade,
  premium_paid numeric(14,2) not null,
  coverage_amount numeric(14,2) not null,
  started_at timestamptz not null,
  expires_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled', 'claimed')),
  claimed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Create indexes for performance
create index if not exists idx_growth_ledger_user_id on public.growth_ledger(user_id);
create index if not exists idx_growth_ledger_source on public.growth_ledger(source_type, source_id);
create index if not exists idx_staking_positions_user on public.staking_positions(user_id, status);
create index if not exists idx_funding_pledges_project on public.funding_pledges(project_id, status);
create index if not exists idx_funding_pledges_backer on public.funding_pledges(backer_id);
create index if not exists idx_creator_rewards_creator on public.creator_rewards(creator_id, status);
create index if not exists idx_shield_subscriptions_user on public.shield_subscriptions(user_id, status);

-- Create RLS policies for security
alter table public.growth_ledger enable row level security;
alter table public.staking_channels enable row level security;
alter table public.staking_positions enable row level security;
alter table public.funding_projects enable row level security;
alter table public.funding_pledges enable row level security;
alter table public.creator_reward_tiers enable row level security;
alter table public.creator_rewards enable row level security;
alter table public.shield_policies enable row level security;
alter table public.shield_subscriptions enable row level security;

-- RLS policies will be added in a separate migration after authentication is set up

-- Create triggers for updated_at
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Apply triggers to all tables that need updated_at
create trigger handle_updated_at before update on public.growth_ledger
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.staking_channels
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.staking_positions
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.funding_projects
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.funding_pledges
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.creator_reward_tiers
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.creator_rewards
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.shield_policies
  for each row execute function public.touch_updated_at();

create trigger handle_updated_at before update on public.shield_subscriptions
  for each row execute function public.touch_updated_at();

-- Add comments for documentation
comment on table public.growth_ledger is 'Tracks all financial transactions in the Growth Hub';
comment on table public.staking_channels is 'Available staking channels with their terms';
comment on table public.staking_positions is 'User staking positions and their status';
comment on table public.funding_projects is 'Crowdfunding projects created by users';
comment on table public.funding_pledges is 'User pledges to funding projects';
comment on table public.creator_reward_tiers is 'Configuration for creator reward thresholds';
comment on table public.creator_rewards is 'Track performance-based rewards for creators';
comment on table public.shield_policies is 'Available shield protection policies';
comment on table public.shield_subscriptions is 'User subscriptions to shield policies';
