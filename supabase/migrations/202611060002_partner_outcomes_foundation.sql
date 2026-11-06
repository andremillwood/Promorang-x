-- Community outcomes foundation. Development-only migration.
create table if not exists public.partner_campaigns (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.users(id),
  name text not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  rate_bps integer not null default 500 check (rate_bps between 0 and 1000),
  margin_cap_bps integer not null default 2500 check (margin_cap_bps between 0 and 10000),
  active boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.partner_campaign_members (
  campaign_id uuid not null references public.partner_campaigns(id),
  partner_id uuid not null references public.users(id),
  primary key (campaign_id, partner_id)
);
create table if not exists public.partner_outcomes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.partner_campaigns(id),
  partner_id uuid not null references public.users(id),
  outcome_type text not null check (outcome_type in ('order_fulfilled','event_checked_in','lead_qualified','sale_closed','subscription_paid','shipment_completed')),
  source_system text not null,
  source_id text not null,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  eligible_amount numeric(12,2) not null check (eligible_amount >= 0),
  verified_margin numeric(12,2) check (verified_margin >= 0),
  status text not null default 'pending' check (status in ('pending','verified','rejected','reversed')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (source_system,source_id,outcome_type)
);
create table if not exists public.partner_commissions (
  id uuid primary key default gen_random_uuid(),
  outcome_id uuid not null unique references public.partner_outcomes(id),
  campaign_id uuid not null references public.partner_campaigns(id),
  partner_id uuid not null references public.users(id),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending_review' check (status in ('pending_review','approved','paid','reversed')),
  created_at timestamptz not null default now()
);
alter table public.partner_campaigns enable row level security;
alter table public.partner_campaign_members enable row level security;
alter table public.partner_outcomes enable row level security;
alter table public.partner_commissions enable row level security;
revoke all on public.partner_campaigns from public, anon, authenticated;
revoke all on public.partner_campaign_members from public, anon, authenticated;
revoke all on public.partner_outcomes from public, anon, authenticated;
revoke all on public.partner_commissions from public, anon, authenticated;
grant all on public.partner_campaigns to service_role;
grant all on public.partner_campaign_members to service_role;
grant all on public.partner_outcomes to service_role;
grant all on public.partner_commissions to service_role;
