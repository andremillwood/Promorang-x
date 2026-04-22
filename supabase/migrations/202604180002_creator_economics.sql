create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'creator_tier') then
    create type public.creator_tier as enum ('starter', 'rising', 'signature', 'icon');
  end if;

  if not exists (select 1 from pg_type where typname = 'creator_payout_schedule') then
    create type public.creator_payout_schedule as enum ('manual', 'weekly', 'biweekly', 'monthly');
  end if;

  if not exists (select 1 from pg_type where typname = 'creator_revenue_source') then
    create type public.creator_revenue_source as enum ('mission_join', 'mission_verification', 'memory_issuance', 'sponsored_boost', 'catalyst_conversion');
  end if;

  if not exists (select 1 from pg_type where typname = 'creator_ledger_status') then
    create type public.creator_ledger_status as enum ('pending', 'approved', 'settled', 'reversed');
  end if;
end $$;

create table if not exists public.creator_economic_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  tier public.creator_tier not null default 'starter',
  payout_schedule public.creator_payout_schedule not null default 'manual',
  default_revshare_percent numeric(6,2) not null default 10.00,
  minimum_payout_amount numeric(12,2) not null default 25.00,
  lifetime_momentum_value numeric(12,2) not null default 0,
  lifetime_verified_unlocks integer not null default 0,
  lifetime_memories_issued integer not null default 0,
  lifetime_catalyst_conversions integer not null default 0,
  next_payout_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_revenue_share_rules (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid null references public.users(id) on delete cascade,
  content_item_id uuid null references public.content_items(id) on delete cascade,
  mission_link_id uuid null references public.content_moment_links(id) on delete cascade,
  brand_id uuid null,
  source_type public.creator_revenue_source not null,
  revshare_percent numeric(6,2) not null,
  fixed_amount numeric(12,2) null,
  is_active boolean not null default true,
  starts_at timestamptz null,
  expires_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_earnings_ledger (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  mission_attribution_id uuid null references public.mission_attributions(id) on delete set null,
  mission_link_id uuid null references public.content_moment_links(id) on delete set null,
  content_item_id uuid null references public.content_items(id) on delete set null,
  moment_id uuid null references public.moments(id) on delete set null,
  brand_id uuid null,
  source_type public.creator_revenue_source not null,
  status public.creator_ledger_status not null default 'pending',
  currency text not null default 'usd',
  unit_count integer not null default 1,
  unit_amount numeric(12,2) not null default 0,
  gross_amount numeric(12,2) not null default 0,
  creator_share_percent numeric(6,2) not null default 0,
  creator_share_amount numeric(12,2) not null default 0,
  settled_at timestamptz null,
  payout_request_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creator_economic_profiles_tier on public.creator_economic_profiles(tier);
create index if not exists idx_creator_revenue_share_rules_creator on public.creator_revenue_share_rules(creator_id, is_active);
create index if not exists idx_creator_revenue_share_rules_mission_link on public.creator_revenue_share_rules(mission_link_id, is_active);
create index if not exists idx_creator_earnings_ledger_creator on public.creator_earnings_ledger(creator_id, status, created_at desc);
create index if not exists idx_creator_earnings_ledger_mission on public.creator_earnings_ledger(mission_attribution_id);
create unique index if not exists idx_creator_earnings_ledger_unique_event
  on public.creator_earnings_ledger(creator_id, mission_attribution_id, source_type)
  where mission_attribution_id is not null;

create or replace function public.set_creator_economic_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_creator_economic_profiles_updated_at on public.creator_economic_profiles;
create trigger trg_creator_economic_profiles_updated_at
before update on public.creator_economic_profiles
for each row execute function public.set_creator_economic_profiles_updated_at();

drop trigger if exists trg_creator_revenue_share_rules_updated_at on public.creator_revenue_share_rules;
create trigger trg_creator_revenue_share_rules_updated_at
before update on public.creator_revenue_share_rules
for each row execute function public.set_creator_economic_profiles_updated_at();

drop trigger if exists trg_creator_earnings_ledger_updated_at on public.creator_earnings_ledger;
create trigger trg_creator_earnings_ledger_updated_at
before update on public.creator_earnings_ledger
for each row execute function public.set_creator_economic_profiles_updated_at();

notify pgrst, 'reload schema';
