-- Telemetry schema and policies
create schema if not exists telemetry;

create table if not exists telemetry.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  session_id text not null,
  event_type text not null,
  payload jsonb not null,
  user_agent text null,
  ip inet null,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_type_created on telemetry.events (event_type, created_at);
create index if not exists idx_events_user_created on telemetry.events (user_id, created_at);

alter table telemetry.events enable row level security;

create policy if not exists telemetry_events_insert_any
  on telemetry.events
  for insert
  with check (true);

create policy if not exists telemetry_events_read_own
  on telemetry.events
  for select
  using (auth.uid() = user_id or user_id is null);
