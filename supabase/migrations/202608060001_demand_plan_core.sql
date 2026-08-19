-- Canonical additive demand-plan layer.
-- Existing Moments, campaigns, PromoPoints, Pieces, PromoKeys, PromoShare,
-- PromoPush, Gems, and Memories remain authoritative in their own ledgers.

create table if not exists public.demand_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid null,
  campaign_id uuid null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  version text not null default '2026-08-06',
  status text not null default 'draft' check (status in ('draft', 'ready', 'active', 'paused', 'completed', 'archived')),
  title text not null,
  promise text not null,
  intent jsonb not null default '{}'::jsonb,
  people jsonb not null default '{}'::jsonb,
  experience jsonb not null default '{}'::jsonb,
  shared_value jsonb not null default '[]'::jsonb,
  distribution jsonb not null default '[]'::jsonb,
  return_path jsonb not null default '{}'::jsonb,
  measurement jsonb not null default '{}'::jsonb,
  readiness jsonb not null default '{}'::jsonb,
  source text not null default 'promopilot',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_demand_plans_owner on public.demand_plans(owner_user_id, created_at desc);
create index if not exists idx_demand_plans_campaign on public.demand_plans(campaign_id) where campaign_id is not null;
create index if not exists idx_demand_plans_organization on public.demand_plans(organization_id) where organization_id is not null;
create index if not exists idx_demand_plans_intent_goal on public.demand_plans((intent->>'goal'));

alter table public.demand_plans enable row level security;

drop policy if exists "demand plan owners can read" on public.demand_plans;
create policy "demand plan owners can read" on public.demand_plans for select using (auth.uid() = owner_user_id);

drop policy if exists "demand plan owners can create" on public.demand_plans;
create policy "demand plan owners can create" on public.demand_plans for insert with check (auth.uid() = owner_user_id);

drop policy if exists "demand plan owners can update" on public.demand_plans;
create policy "demand plan owners can update" on public.demand_plans for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

comment on table public.demand_plans is 'Versioned intent-to-execution plans connecting human demand goals to Promorang campaign systems.';
comment on column public.demand_plans.shared_value is 'Explicit roles for Gems, PromoPoints, Pieces, PromoKeys, Memories, and PromoShare; not a replacement for their authoritative ledgers.';
