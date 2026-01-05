-- Extended schema for advertiser, investor, and creator demo data
-- Timestamp: 2025-11-08

-- Advertiser profile storing company context for advertiser users
create table if not exists public.advertiser_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  company_name text not null,
  company_website text,
  company_description text,
  industry text,
  contact_email text,
  contact_phone text,
  monthly_budget numeric(14,2),
  preferred_platforms text[],
  goals text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Campaigns owned by advertisers
create table if not exists public.advertiser_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  objective text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed')),
  start_date date,
  end_date date,
  total_budget numeric(14,2),
  budget_spent numeric(14,2) default 0,
  target_audience jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_advertiser_campaigns_owner on public.advertiser_campaigns(advertiser_id, status);

-- Campaign day-level metrics for dashboards
create table if not exists public.advertiser_campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.advertiser_campaigns(id) on delete cascade,
  metric_date date not null,
  impressions bigint default 0,
  clicks bigint default 0,
  conversions integer default 0,
  spend numeric(14,2) default 0,
  revenue numeric(14,2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, metric_date)
);
create index if not exists idx_advertiser_campaign_metrics_campaign on public.advertiser_campaign_metrics(campaign_id);

-- Coupons created by advertisers
create table if not exists public.advertiser_coupons (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  reward_type text not null default 'coupon',
  value numeric(14,2) not null default 0,
  value_unit text not null default 'usd',
  quantity_total integer not null,
  quantity_remaining integer not null,
  start_date timestamptz not null,
  end_date timestamptz,
  status text not null default 'active' check (status in ('active', 'scheduled', 'expired', 'archived')),
  conditions jsonb not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_advertiser_coupons_owner on public.advertiser_coupons(advertiser_id, status);

-- Coupon targeting metadata
create table if not exists public.advertiser_coupon_assignments (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.advertiser_coupons(id) on delete cascade,
  target_type text not null,
  target_id text not null,
  target_label text,
  assigned_at timestamptz not null default timezone('utc', now()),
  status text not null default 'active' check (status in ('active', 'paused', 'completed'))
);
create index if not exists idx_advertiser_coupon_assignments_coupon on public.advertiser_coupon_assignments(coupon_id, status);

-- Coupon redemption ledger
create table if not exists public.advertiser_coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.advertiser_coupons(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  user_name text,
  redeemed_at timestamptz not null default timezone('utc', now()),
  reward_value numeric(14,2),
  reward_unit text,
  status text not null default 'completed' check (status in ('pending', 'completed', 'cancelled'))
);
create index if not exists idx_advertiser_coupon_redemptions_coupon on public.advertiser_coupon_redemptions(coupon_id, status);

-- Leaderboard snapshots for multiple periods
do $$
begin
  if to_regclass('public.leaderboard_entries') is not null then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'leaderboard_entries'
        and column_name = 'points'
    ) then
      alter table public.leaderboard_entries drop column if exists points;
    end if;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'leaderboard_entries'
        and column_name = 'total_earnings'
    ) then
      alter table public.leaderboard_entries drop column if exists total_earnings;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'leaderboard_entries'
        and column_name = 'points_earned'
    ) then
      alter table public.leaderboard_entries
        add column points_earned integer default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'leaderboard_entries'
        and column_name = 'gems_earned'
    ) then
      alter table public.leaderboard_entries
        add column gems_earned integer default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'leaderboard_entries'
        and column_name = 'keys_used'
    ) then
      alter table public.leaderboard_entries
        add column keys_used integer default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'leaderboard_entries'
        and column_name = 'gold_collected'
    ) then
      alter table public.leaderboard_entries
        add column gold_collected integer default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'leaderboard_entries'
        and column_name = 'composite_score'
    ) then
      alter table public.leaderboard_entries
        add column composite_score numeric(6,2) default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'leaderboard_entries'
        and column_name = 'trend'
    ) then
      alter table public.leaderboard_entries
        add column trend text;
    end if;
  end if;
end;
$$;

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  period_type text not null check (period_type in ('daily', 'weekly', 'monthly', 'overall')),
  period_start date not null,
  period_end date not null,
  rank integer,
  points_earned integer default 0,
  gems_earned integer default 0,
  keys_used integer default 0,
  gold_collected integer default 0,
  composite_score numeric(6,2) default 0,
  trend text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, period_type, period_start, period_end)
);
create index if not exists idx_leaderboard_entries_period on public.leaderboard_entries(period_type, period_start);

-- Investor content share activity
create table if not exists public.investor_content_shares (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.users(id) on delete cascade,
  content_id uuid references public.content_items(id) on delete set null,
  share_link text,
  platform text,
  campaign_id uuid references public.advertiser_campaigns(id) on delete set null,
  clicks integer default 0,
  impressions integer default 0,
  conversions integer default 0,
  reward_points integer default 0,
  reward_gems integer default 0,
  last_interaction_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_investor_content_shares_investor on public.investor_content_shares(investor_id);

-- Social forecasts for predictions (minimal schema if not already present)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public'
      and table_name = 'social_forecasts'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'content_id'
    ) then
      alter table public.social_forecasts
        add column content_id uuid references public.content_items(id) on delete set null;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'creator_id'
    ) then
      alter table public.social_forecasts
        add column creator_id uuid references public.users(id) on delete set null;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'platform'
    ) then
      alter table public.social_forecasts add column platform text;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'content_url'
    ) then
      alter table public.social_forecasts add column content_url text;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'content_title'
    ) then
      alter table public.social_forecasts add column content_title text;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'forecast_type'
    ) then
      alter table public.social_forecasts add column forecast_type text not null default 'views';
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'target_value'
    ) then
      alter table public.social_forecasts add column target_value numeric not null default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'current_value'
    ) then
      alter table public.social_forecasts add column current_value numeric default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'odds'
    ) then
      alter table public.social_forecasts add column odds numeric(6,3) not null default 1.0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'pool_size'
    ) then
      alter table public.social_forecasts add column pool_size numeric(14,2) default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'creator_initial_amount'
    ) then
      alter table public.social_forecasts add column creator_initial_amount numeric(14,2) default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'creator_side'
    ) then
      alter table public.social_forecasts add column creator_side text;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'expires_at'
    ) then
      alter table public.social_forecasts add column expires_at timestamptz;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'status'
    ) then
      alter table public.social_forecasts add column status text not null default 'active';
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'participants'
    ) then
      alter table public.social_forecasts add column participants integer default 0;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'created_at'
    ) then
      alter table public.social_forecasts add column created_at timestamptz not null default timezone('utc', now());
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'social_forecasts'
        and column_name = 'updated_at'
    ) then
      alter table public.social_forecasts add column updated_at timestamptz not null default timezone('utc', now());
    end if;
  end if;
end;
$$;

create table if not exists public.social_forecasts (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.content_items(id) on delete set null,
  creator_id uuid references public.users(id) on delete set null,
  platform text,
  content_url text,
  content_title text,
  forecast_type text not null,
  target_value numeric not null,
  current_value numeric default 0,
  odds numeric(6,3) not null,
  pool_size numeric(14,2) default 0,
  creator_initial_amount numeric(14,2) default 0,
  creator_side text,
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'settled', 'cancelled')),
  participants integer default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_social_forecasts_status on public.social_forecasts(status, expires_at);

-- Investor predictions tied to social forecasts
create table if not exists public.investor_predictions (
  id uuid primary key default gen_random_uuid(),
  forecast_id uuid not null references public.social_forecasts(id) on delete cascade,
  investor_id uuid not null references public.users(id) on delete cascade,
  prediction_amount numeric(14,2) not null,
  prediction_side text not null,
  potential_payout numeric(14,2),
  status text not null default 'active' check (status in ('active', 'won', 'lost', 'refunded')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_investor_predictions_investor on public.investor_predictions(investor_id, status);

-- Growth Hub ledger captures key financial interactions
create table if not exists public.growth_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  source_type text not null check (source_type in ('staking', 'staking_claim', 'funding_pledge', 'shield_premium', 'creator_reward')),
  source_id uuid not null,
  amount numeric(14,2) not null,
  currency text not null check (currency in ('gems', 'usd')),
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed', 'reversed')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_growth_ledger_user on public.growth_ledger(user_id, status);
create index if not exists idx_growth_ledger_source on public.growth_ledger(source_type, source_id);

-- Staking channels offered in the Growth Hub
create table if not exists public.staking_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  min_stake numeric(14,2) not null default 0,
  max_stake numeric(14,2),
  base_apr numeric(6,2) not null,
  lock_period_days integer not null,
  status text not null default 'active' check (status in ('active', 'paused', 'retired')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Creator staking positions
create table if not exists public.staking_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  channel_id uuid not null references public.staking_channels(id) on delete cascade,
  amount numeric(14,2) not null,
  multiplier numeric(6,3) not null default 1.0,
  lock_until timestamptz,
  status text not null default 'active' check (status in ('active', 'withdrawable', 'completed')),
  earned_so_far numeric(14,2) not null default 0,
  last_claimed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_staking_positions_user on public.staking_positions(user_id, status);

-- Growth Hub funding projects
create table if not exists public.funding_projects (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  target_amount numeric(14,2) not null,
  amount_raised numeric(14,2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  start_date timestamptz,
  end_date timestamptz,
  rewards jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index if not exists idx_funding_projects_creator on public.funding_projects(creator_id, status);

-- Funding pledges by investors into creator projects
create table if not exists public.funding_pledges (
  id uuid primary key default gen_random_uuid(),
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
create index if not exists idx_funding_pledges_project on public.funding_pledges(project_id, status);
create index if not exists idx_funding_pledges_backer on public.funding_pledges(backer_id);

-- Creator reward tiers configuration
create table if not exists public.creator_reward_tiers (
  id uuid primary key default gen_random_uuid(),
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

-- Creator rewards earned from tiers
create table if not exists public.creator_rewards (
  id uuid primary key default gen_random_uuid(),
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
create index if not exists idx_creator_rewards_creator on public.creator_rewards(creator_id, status);

-- Shield policies available in Growth Hub
create table if not exists public.shield_policies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  coverage_amount numeric(14,2) not null,
  premium_amount numeric(14,2) not null,
  duration_days integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Shield subscriptions for creators/investors
create table if not exists public.shield_subscriptions (
  id uuid primary key default gen_random_uuid(),
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
create index if not exists idx_shield_subscriptions_user on public.shield_subscriptions(user_id, status);

-- Helper function to keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to tables defined above
do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_advertiser_profiles_touch'
      and tgrelid = 'public.advertiser_profiles'::regclass
  ) then
    execute 'drop trigger trg_advertiser_profiles_touch on public.advertiser_profiles;';
  end if;

  execute '
    create trigger trg_advertiser_profiles_touch
      before update on public.advertiser_profiles
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_advertiser_campaigns_touch'
      and tgrelid = 'public.advertiser_campaigns'::regclass
  ) then
    execute 'drop trigger trg_advertiser_campaigns_touch on public.advertiser_campaigns;';
  end if;

  execute '
    create trigger trg_advertiser_campaigns_touch
      before update on public.advertiser_campaigns
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_advertiser_campaign_metrics_touch'
      and tgrelid = 'public.advertiser_campaign_metrics'::regclass
  ) then
    execute 'drop trigger trg_advertiser_campaign_metrics_touch on public.advertiser_campaign_metrics;';
  end if;

  execute '
    create trigger trg_advertiser_campaign_metrics_touch
      before update on public.advertiser_campaign_metrics
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_advertiser_coupons_touch'
      and tgrelid = 'public.advertiser_coupons'::regclass
  ) then
    execute 'drop trigger trg_advertiser_coupons_touch on public.advertiser_coupons;';
  end if;

  execute '
    create trigger trg_advertiser_coupons_touch
      before update on public.advertiser_coupons
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_leaderboard_entries_touch'
      and tgrelid = 'public.leaderboard_entries'::regclass
  ) then
    execute 'drop trigger trg_leaderboard_entries_touch on public.leaderboard_entries;';
  end if;

  execute '
    create trigger trg_leaderboard_entries_touch
      before update on public.leaderboard_entries
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_investor_content_shares_touch'
      and tgrelid = 'public.investor_content_shares'::regclass
  ) then
    execute 'drop trigger trg_investor_content_shares_touch on public.investor_content_shares;';
  end if;

  execute '
    create trigger trg_investor_content_shares_touch
      before update on public.investor_content_shares
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_social_forecasts_touch'
      and tgrelid = 'public.social_forecasts'::regclass
  ) then
    execute 'drop trigger trg_social_forecasts_touch on public.social_forecasts;';
  end if;

  execute '
    create trigger trg_social_forecasts_touch
      before update on public.social_forecasts
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_investor_predictions_touch'
      and tgrelid = 'public.investor_predictions'::regclass
  ) then
    execute 'drop trigger trg_investor_predictions_touch on public.investor_predictions;';
  end if;

  execute '
    create trigger trg_investor_predictions_touch
      before update on public.investor_predictions
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_growth_ledger_touch'
      and tgrelid = 'public.growth_ledger'::regclass
  ) then
    execute 'drop trigger trg_growth_ledger_touch on public.growth_ledger;';
  end if;

  execute '
    create trigger trg_growth_ledger_touch
      before update on public.growth_ledger
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_staking_channels_touch'
      and tgrelid = 'public.staking_channels'::regclass
  ) then
    execute 'drop trigger trg_staking_channels_touch on public.staking_channels;';
  end if;

  execute '
    create trigger trg_staking_channels_touch
      before update on public.staking_channels
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_staking_positions_touch'
      and tgrelid = 'public.staking_positions'::regclass
  ) then
    execute 'drop trigger trg_staking_positions_touch on public.staking_positions;';
  end if;

  execute '
    create trigger trg_staking_positions_touch
      before update on public.staking_positions
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_funding_projects_touch'
      and tgrelid = 'public.funding_projects'::regclass
  ) then
    execute 'drop trigger trg_funding_projects_touch on public.funding_projects;';
  end if;

  execute '
    create trigger trg_funding_projects_touch
      before update on public.funding_projects
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_funding_pledges_touch'
      and tgrelid = 'public.funding_pledges'::regclass
  ) then
    execute 'drop trigger trg_funding_pledges_touch on public.funding_pledges;';
  end if;

  execute '
    create trigger trg_funding_pledges_touch
      before update on public.funding_pledges
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_creator_reward_tiers_touch'
      and tgrelid = 'public.creator_reward_tiers'::regclass
  ) then
    execute 'drop trigger trg_creator_reward_tiers_touch on public.creator_reward_tiers;';
  end if;

  execute '
    create trigger trg_creator_reward_tiers_touch
      before update on public.creator_reward_tiers
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_creator_rewards_touch'
      and tgrelid = 'public.creator_rewards'::regclass
  ) then
    execute 'drop trigger trg_creator_rewards_touch on public.creator_rewards;';
  end if;

  execute '
    create trigger trg_creator_rewards_touch
      before update on public.creator_rewards
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_shield_policies_touch'
      and tgrelid = 'public.shield_policies'::regclass
  ) then
    execute 'drop trigger trg_shield_policies_touch on public.shield_policies;';
  end if;

  execute '
    create trigger trg_shield_policies_touch
      before update on public.shield_policies
      for each row execute procedure public.touch_updated_at();
  ';
end $$;

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'trg_shield_subscriptions_touch'
      and tgrelid = 'public.shield_subscriptions'::regclass
  ) then
    execute 'drop trigger trg_shield_subscriptions_touch on public.shield_subscriptions;';
  end if;

  execute '
    create trigger trg_shield_subscriptions_touch
      before update on public.shield_subscriptions
      for each row execute procedure public.touch_updated_at();
  ';
end $$;
