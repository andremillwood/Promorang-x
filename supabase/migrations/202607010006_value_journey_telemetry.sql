create table if not exists public.value_journey_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  event_name text not null,
  journey_stage text not null check(journey_stage in ('orientation','first_value','proof','unlock','mastery')),
  object_type text,
  object_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_value_journey_events_stage_created on public.value_journey_events(journey_stage,created_at desc);
alter table public.value_journey_events enable row level security;
