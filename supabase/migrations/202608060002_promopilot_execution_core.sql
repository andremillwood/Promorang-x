-- PromoPilot execution manifest and controlled launch queue.

create table if not exists public.promopilot_execution_jobs (
  id uuid primary key default gen_random_uuid(),
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  job_key text not null,
  job_type text not null check (job_type in ('distribution', 'value', 'relationship', 'measurement', 'fulfillment')),
  system_name text not null,
  label text not null,
  required boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'blocked', 'ready', 'queued', 'running', 'completed', 'failed', 'cancelled')),
  blocker text null,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  queued_at timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  failed_at timestamptz null,
  error_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (demand_plan_id, job_key),
  unique (idempotency_key)
);

create table if not exists public.promopilot_execution_history (
  id uuid primary key default gen_random_uuid(),
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid null,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('prepared', 'launch_queued', 'paused', 'resumed', 'cancelled', 'job_retried')),
  from_status text null,
  to_status text null,
  note text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_promopilot_jobs_plan_status on public.promopilot_execution_jobs(demand_plan_id, status);
create index if not exists idx_promopilot_jobs_queue on public.promopilot_execution_jobs(status, created_at) where status = 'queued';
create index if not exists idx_promopilot_history_plan on public.promopilot_execution_history(demand_plan_id, created_at desc);

alter table public.promopilot_execution_jobs enable row level security;
alter table public.promopilot_execution_history enable row level security;

drop policy if exists "PromoPilot owners read execution jobs" on public.promopilot_execution_jobs;
create policy "PromoPilot owners read execution jobs" on public.promopilot_execution_jobs for select using (auth.uid() = owner_user_id);

drop policy if exists "PromoPilot owners read execution history" on public.promopilot_execution_history;
create policy "PromoPilot owners read execution history" on public.promopilot_execution_history for select using (auth.uid() = actor_user_id or exists (
  select 1 from public.demand_plans dp where dp.id = promopilot_execution_history.demand_plan_id and dp.owner_user_id = auth.uid()
));

comment on table public.promopilot_execution_jobs is 'Auditable execution manifest generated from an approved Demand Plan. Workers adapt queued jobs into authoritative Promorang systems.';
comment on column public.promopilot_execution_jobs.idempotency_key is 'Stable key preventing repeated preparation or launch requests from duplicating side effects.';
