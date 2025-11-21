-- =====================================================
-- PROMORANG REFERRAL & AFFILIATE SYSTEM
-- Comprehensive multi-level referral tracking with commission engine
-- =====================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================
-- REFERRAL CODES TABLE
-- Manages unique referral codes for each user
-- =====================================================
create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  code text not null unique,
  display_name text, -- Optional friendly name for the code
  uses_count integer not null default 0,
  max_uses integer, -- NULL = unlimited uses
  expires_at timestamptz,
  is_active boolean not null default true,
  metadata jsonb default '{}'::jsonb, -- Store campaign info, source, etc.
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  constraint valid_max_uses check (max_uses is null or max_uses > 0),
  constraint valid_code_format check (code ~ '^[A-Z0-9-]{4,20}$')
);

-- Indexes for performance
create index if not exists idx_referral_codes_user on public.referral_codes(user_id);
create index if not exists idx_referral_codes_code on public.referral_codes(code) where is_active = true;
create index if not exists idx_referral_codes_active on public.referral_codes(is_active, expires_at);

-- =====================================================
-- USER REFERRALS TABLE
-- Tracks the referral relationship between users
-- =====================================================
create table if not exists public.user_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.users(id) on delete cascade,
  referred_id uuid not null references public.users(id) on delete cascade,
  referral_code_id uuid references public.referral_codes(id) on delete set null,
  referral_code text not null, -- Denormalized for historical tracking
  
  -- Status tracking
  status text not null default 'pending' check (status in ('pending', 'active', 'inactive', 'suspended')),
  activated_at timestamptz, -- When referred user completed activation requirements
  
  -- Financial tracking
  total_earnings_generated numeric(14,2) not null default 0,
  total_commission_paid numeric(14,2) not null default 0,
  total_gems_earned integer not null default 0,
  total_points_earned integer not null default 0,
  
  -- Engagement metrics
  referred_user_drops_completed integer not null default 0,
  referred_user_campaigns_created integer not null default 0,
  referred_user_purchases_made integer not null default 0,
  last_earning_at timestamptz,
  
  -- Metadata
  signup_metadata jsonb default '{}'::jsonb, -- UTM params, device info, etc.
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  -- Constraints
  constraint unique_referred_user unique(referred_id),
  constraint no_self_referral check (referrer_id != referred_id)
);

-- Indexes for performance
create index if not exists idx_user_referrals_referrer on public.user_referrals(referrer_id, status);
create index if not exists idx_user_referrals_referred on public.user_referrals(referred_id);
create index if not exists idx_user_referrals_status on public.user_referrals(status, activated_at);
create index if not exists idx_user_referrals_earnings on public.user_referrals(referrer_id, total_commission_paid desc);

-- =====================================================
-- REFERRAL COMMISSIONS TABLE
-- Detailed log of all commission transactions
-- =====================================================
create table if not exists public.referral_commissions (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.user_referrals(id) on delete cascade,
  referrer_id uuid not null references public.users(id) on delete cascade,
  referred_user_id uuid not null references public.users(id) on delete cascade,
  
  -- Transaction details
  earning_type text not null, -- 'drop_completion', 'campaign_spend', 'product_sale', 'subscription', etc.
  earning_amount numeric(14,2) not null,
  earning_currency text not null default 'usd', -- 'usd', 'gems', 'points'
  
  -- Commission calculation
  commission_rate numeric(5,4) not null default 0.0500, -- 5% default
  commission_amount numeric(14,2) not null,
  commission_currency text not null default 'gems', -- What currency the commission is paid in
  
  -- Status and processing
  status text not null default 'pending' check (status in ('pending', 'processed', 'paid', 'failed', 'reversed')),
  processed_at timestamptz,
  paid_at timestamptz,
  
  -- References
  source_transaction_id uuid, -- Link to original transaction (drop, order, etc.)
  source_table text, -- Table name of source transaction
  payout_transaction_id uuid, -- Link to payout transaction if applicable
  
  -- Metadata
  metadata jsonb default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  constraint valid_amounts check (earning_amount > 0 and commission_amount > 0),
  constraint valid_rate check (commission_rate > 0 and commission_rate <= 1)
);

-- Indexes for performance and analytics
create index if not exists idx_referral_commissions_referral on public.referral_commissions(referral_id, status);
create index if not exists idx_referral_commissions_referrer on public.referral_commissions(referrer_id, created_at desc);
create index if not exists idx_referral_commissions_referred on public.referral_commissions(referred_user_id);
create index if not exists idx_referral_commissions_status on public.referral_commissions(status, processed_at);
create index if not exists idx_referral_commissions_type on public.referral_commissions(earning_type, created_at desc);
create index if not exists idx_referral_commissions_source on public.referral_commissions(source_transaction_id) where source_transaction_id is not null;

-- =====================================================
-- REFERRAL TIERS TABLE
-- Define commission rates for different user tiers/levels
-- =====================================================
create table if not exists public.referral_tiers (
  id uuid primary key default gen_random_uuid(),
  tier_name text not null unique,
  tier_level integer not null unique,
  min_referrals integer not null default 0,
  commission_rate numeric(5,4) not null default 0.0500,
  bonus_rate numeric(5,4) not null default 0, -- Additional bonus on top of base rate
  perks jsonb default '[]'::jsonb, -- Array of perk descriptions
  badge_icon text, -- Icon/emoji for the tier
  badge_color text, -- Hex color for UI
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  
  constraint valid_tier_level check (tier_level >= 0),
  constraint valid_commission_rate check (commission_rate >= 0 and commission_rate <= 1),
  constraint valid_bonus_rate check (bonus_rate >= 0 and bonus_rate <= 1)
);

-- Seed default tiers
insert into public.referral_tiers (tier_name, tier_level, min_referrals, commission_rate, bonus_rate, badge_icon, badge_color, perks) values
  ('Bronze', 1, 0, 0.0500, 0, '🥉', '#CD7F32', '["5% commission on referrals", "Basic referral dashboard"]'),
  ('Silver', 2, 10, 0.0600, 0.0100, '🥈', '#C0C0C0', '["6% commission on referrals", "Priority support", "Referral analytics"]'),
  ('Gold', 3, 50, 0.0750, 0.0250, '🥇', '#FFD700', '["7.5% commission on referrals", "VIP support", "Advanced analytics", "Custom referral codes"]'),
  ('Platinum', 4, 100, 0.1000, 0.0500, '💎', '#E5E4E2', '["10% commission on referrals", "Dedicated account manager", "API access", "Exclusive events"]')
on conflict (tier_name) do nothing;

-- =====================================================
-- EXTEND USERS TABLE
-- Add referral-related columns to users table
-- =====================================================
alter table public.users add column if not exists referred_by_id uuid references public.users(id) on delete set null;
alter table public.users add column if not exists primary_referral_code text;
alter table public.users add column if not exists referral_tier_id uuid references public.referral_tiers(id);
alter table public.users add column if not exists total_referrals integer not null default 0;
alter table public.users add column if not exists active_referrals integer not null default 0;
alter table public.users add column if not exists referral_earnings_usd numeric(14,2) not null default 0;
alter table public.users add column if not exists referral_earnings_gems integer not null default 0;
alter table public.users add column if not exists referral_earnings_points integer not null default 0;

-- Indexes on users table
create index if not exists idx_users_referred_by on public.users(referred_by_id) where referred_by_id is not null;
create index if not exists idx_users_referral_code on public.users(primary_referral_code) where primary_referral_code is not null;
create index if not exists idx_users_referral_tier on public.users(referral_tier_id) where referral_tier_id is not null;

-- =====================================================
-- TRIGGERS
-- Automatic updates and calculations
-- =====================================================

-- Update referral code uses count
create or replace function public.increment_referral_code_uses()
returns trigger as $$
begin
  update public.referral_codes
  set uses_count = uses_count + 1,
      updated_at = timezone('utc', now())
  where id = new.referral_code_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_increment_referral_code_uses on public.user_referrals;
create trigger trg_increment_referral_code_uses
  after insert on public.user_referrals
  for each row
  when (new.referral_code_id is not null)
  execute function public.increment_referral_code_uses();

-- Update referrer's total referrals count
create or replace function public.update_referrer_stats()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.users
    set total_referrals = total_referrals + 1,
        active_referrals = active_referrals + case when new.status = 'active' then 1 else 0 end
    where id = new.referrer_id;
  elsif tg_op = 'UPDATE' and old.status != new.status then
    update public.users
    set active_referrals = active_referrals + 
          case 
            when new.status = 'active' and old.status != 'active' then 1
            when new.status != 'active' and old.status = 'active' then -1
            else 0
          end
    where id = new.referrer_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_update_referrer_stats on public.user_referrals;
create trigger trg_update_referrer_stats
  after insert or update on public.user_referrals
  for each row
  execute function public.update_referrer_stats();

-- Update commission totals
create or replace function public.update_commission_totals()
returns trigger as $$
begin
  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and old.status != new.status and new.status = 'paid') then
    -- Update referral record
    update public.user_referrals
    set total_commission_paid = total_commission_paid + new.commission_amount,
        total_gems_earned = total_gems_earned + case when new.commission_currency = 'gems' then new.commission_amount::integer else 0 end,
        total_points_earned = total_points_earned + case when new.commission_currency = 'points' then new.commission_amount::integer else 0 end,
        last_earning_at = new.paid_at,
        updated_at = timezone('utc', now())
    where id = new.referral_id;
    
    -- Update user's earnings
    update public.users
    set referral_earnings_usd = referral_earnings_usd + case when new.commission_currency = 'usd' then new.commission_amount else 0 end,
        referral_earnings_gems = referral_earnings_gems + case when new.commission_currency = 'gems' then new.commission_amount::integer else 0 end,
        referral_earnings_points = referral_earnings_points + case when new.commission_currency = 'points' then new.commission_amount::integer else 0 end
    where id = new.referrer_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_update_commission_totals on public.referral_commissions;
create trigger trg_update_commission_totals
  after insert or update on public.referral_commissions
  for each row
  when (new.status = 'paid')
  execute function public.update_commission_totals();

-- Auto-update timestamps
create or replace function public.update_referral_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_referral_codes_timestamp on public.referral_codes;
create trigger trg_referral_codes_timestamp
  before update on public.referral_codes
  for each row execute function public.update_referral_timestamp();

drop trigger if exists trg_user_referrals_timestamp on public.user_referrals;
create trigger trg_user_referrals_timestamp
  before update on public.user_referrals
  for each row execute function public.update_referral_timestamp();

drop trigger if exists trg_referral_commissions_timestamp on public.referral_commissions;
create trigger trg_referral_commissions_timestamp
  before update on public.referral_commissions
  for each row execute function public.update_referral_timestamp();

drop trigger if exists trg_referral_tiers_timestamp on public.referral_tiers;
create trigger trg_referral_tiers_timestamp
  before update on public.referral_tiers
  for each row execute function public.update_referral_timestamp();

-- =====================================================
-- HELPER FUNCTIONS
-- Utility functions for referral operations
-- =====================================================

-- Generate unique referral code
create or replace function public.generate_referral_code(p_user_id uuid, p_prefix text default 'PROMO')
returns text as $$
declare
  v_code text;
  v_username text;
  v_random text;
  v_exists boolean;
begin
  -- Get username
  select username into v_username from public.users where id = p_user_id;
  
  -- Generate code
  loop
    v_random := upper(substring(md5(random()::text) from 1 for 4));
    v_code := p_prefix || '-' || upper(substring(v_username from 1 for 4)) || v_random;
    
    -- Check if code exists
    select exists(select 1 from public.referral_codes where code = v_code) into v_exists;
    exit when not v_exists;
  end loop;
  
  return v_code;
end;
$$ language plpgsql security definer;

-- Calculate user's referral tier
create or replace function public.calculate_referral_tier(p_user_id uuid)
returns uuid as $$
declare
  v_total_referrals integer;
  v_tier_id uuid;
begin
  select total_referrals into v_total_referrals from public.users where id = p_user_id;
  
  select id into v_tier_id
  from public.referral_tiers
  where min_referrals <= v_total_referrals
    and is_active = true
  order by tier_level desc
  limit 1;
  
  return v_tier_id;
end;
$$ language plpgsql security definer;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- Secure access to referral data
-- =====================================================

alter table public.referral_codes enable row level security;
alter table public.user_referrals enable row level security;
alter table public.referral_commissions enable row level security;
alter table public.referral_tiers enable row level security;

-- Referral codes policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can view their own referral codes'
      and tablename = 'referral_codes'
  ) then
    execute 'DROP POLICY "Users can view their own referral codes" ON public.referral_codes;';
  end if;

  execute $policy$
    CREATE POLICY "Users can view their own referral codes"
      ON public.referral_codes FOR SELECT
      USING (auth.uid() = user_id);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can create their own referral codes'
      and tablename = 'referral_codes'
  ) then
    execute 'DROP POLICY "Users can create their own referral codes" ON public.referral_codes;';
  end if;

  execute $policy$
    CREATE POLICY "Users can create their own referral codes"
      ON public.referral_codes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  $policy$;
end $$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can update their own referral codes'
      and tablename = 'referral_codes'
  ) then
    execute 'DROP POLICY "Users can update their own referral codes" ON public.referral_codes;';
  end if;

  execute $policy$
    CREATE POLICY "Users can update their own referral codes"
      ON public.referral_codes FOR UPDATE
      USING (auth.uid() = user_id);
  $policy$;
end $$;

-- User referrals policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can view their referrals (as referrer)'
      and tablename = 'user_referrals'
  ) then
    execute 'DROP POLICY "Users can view their referrals (as referrer)" ON public.user_referrals;';
  end if;

  execute $policy$
    CREATE POLICY "Users can view their referrals (as referrer)"
      ON public.user_referrals FOR SELECT
      USING (auth.uid() = referrer_id or auth.uid() = referred_id);
  $policy$;
end $$;

-- Referral commissions policies
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Users can view their own commissions'
      and tablename = 'referral_commissions'
  ) then
    execute 'DROP POLICY "Users can view their own commissions" ON public.referral_commissions;';
  end if;

  execute $policy$
    CREATE POLICY "Users can view their own commissions"
      ON public.referral_commissions FOR SELECT
      USING (auth.uid() = referrer_id or auth.uid() = referred_user_id);
  $policy$;
end $$;

-- Referral tiers policies (public read)
do $$
begin
  if exists (
    select 1 from pg_policies
    where policyname = 'Anyone can view referral tiers'
      and tablename = 'referral_tiers'
  ) then
    execute 'DROP POLICY "Anyone can view referral tiers" ON public.referral_tiers;';
  end if;

  execute $policy$
    CREATE POLICY "Anyone can view referral tiers"
      ON public.referral_tiers FOR SELECT
      USING (true);
  $policy$;
end $$;

-- =====================================================
-- COMMENTS
-- Documentation for tables and columns
-- =====================================================

comment on table public.referral_codes is 'Stores unique referral codes for users to share';
comment on table public.user_referrals is 'Tracks referral relationships between users';
comment on table public.referral_commissions is 'Detailed log of all commission transactions';
comment on table public.referral_tiers is 'Defines commission rates and perks for different referral levels';

comment on column public.user_referrals.status is 'pending: signed up but not activated, active: completed activation requirements, inactive: churned, suspended: policy violation';
comment on column public.referral_commissions.earning_type is 'Type of activity that generated the earning: drop_completion, campaign_spend, product_sale, subscription, etc.';
comment on column public.referral_commissions.commission_rate is 'Percentage of earning paid as commission (0.05 = 5%)';
