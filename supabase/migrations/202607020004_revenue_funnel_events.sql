create table if not exists public.revenue_funnel_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  user_id uuid references public.users(id) on delete set null,
  session_id text,
  funnel text not null check (funnel in ('campaign', 'membership', 'marketplace', 'gems', 'sponsorship', 'featured')),
  stage text not null check (stage in ('captured', 'qualified', 'checkout_started', 'payment_succeeded', 'payment_failed', 'fulfilled', 'outcome_measured', 'follow_up_sent', 'repeat_conversion')),
  entity_type text,
  entity_id text,
  source text,
  provider text,
  provider_event_id text,
  amount numeric(14,2),
  currency text,
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now()
);

create unique index if not exists revenue_funnel_events_idempotency_idx
  on public.revenue_funnel_events(idempotency_key)
  where idempotency_key is not null;

create index if not exists revenue_funnel_events_funnel_stage_time_idx
  on public.revenue_funnel_events(funnel, stage, occurred_at desc);
create index if not exists revenue_funnel_events_user_time_idx
  on public.revenue_funnel_events(user_id, occurred_at desc);
create index if not exists revenue_funnel_events_entity_idx
  on public.revenue_funnel_events(entity_type, entity_id);

alter table public.revenue_funnel_events enable row level security;

drop policy if exists revenue_funnel_events_read_own on public.revenue_funnel_events;
create policy revenue_funnel_events_read_own
  on public.revenue_funnel_events for select
  using (auth.uid() = user_id);

comment on table public.revenue_funnel_events is
  'Canonical server-owned events for revenue conversion, fulfillment, outcomes, and repeat purchase reporting.';
