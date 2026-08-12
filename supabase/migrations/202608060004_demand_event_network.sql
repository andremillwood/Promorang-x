-- Normalized, append-only demand-event network.
-- Source ledgers remain authoritative; this table connects their outcomes into one journey.

create table if not exists public.demand_events (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  demand_plan_id uuid null references public.demand_plans(id) on delete set null,
  campaign_id uuid null,
  organization_id uuid null,
  actor_user_id uuid null references auth.users(id) on delete set null,
  anonymous_id text null,
  journey_id uuid not null default gen_random_uuid(),
  parent_event_id uuid null references public.demand_events(id) on delete set null,
  event_type text not null,
  stage text not null check (stage in ('discovery', 'interest', 'participation', 'conversion', 'review', 'referral', 'loyalty', 'advocacy', 'merchant_growth', 'community_growth')),
  source_system text not null,
  source_reference text null,
  channel text null,
  value_amount numeric(14,2) null check (value_amount is null or value_amount >= 0),
  value_currency text null,
  verified boolean not null default false,
  confidence numeric(4,3) not null default 1 check (confidence >= 0 and confidence <= 1),
  consent_basis text null,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  received_at timestamptz not null default now(),
  check (actor_user_id is not null or anonymous_id is not null or source_reference is not null)
);

create index if not exists idx_demand_events_campaign_time on public.demand_events(campaign_id, occurred_at desc);
create index if not exists idx_demand_events_plan_stage on public.demand_events(demand_plan_id, stage, occurred_at desc);
create index if not exists idx_demand_events_actor_time on public.demand_events(actor_user_id, occurred_at desc) where actor_user_id is not null;
create index if not exists idx_demand_events_journey on public.demand_events(journey_id, occurred_at);
create index if not exists idx_demand_events_source on public.demand_events(source_system, source_reference) where source_reference is not null;

alter table public.demand_events enable row level security;

drop policy if exists "Campaign owners read demand events" on public.demand_events;
create policy "Campaign owners read demand events" on public.demand_events for select using (
  actor_user_id = auth.uid()
  or exists (
    select 1 from public.demand_plans plan
    where plan.id = demand_events.demand_plan_id
      and plan.owner_user_id = auth.uid()
  )
);

comment on table public.demand_events is 'Normalized cross-system demand signals. Immutable source receipts, ledgers and proofs remain authoritative.';
comment on column public.demand_events.verified is 'True only when the authoritative source has accepted or settled the underlying action.';

