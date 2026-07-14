-- Idempotent automation ledger for proof-triggered experiential commerce.
create table if not exists public.experience_automation_runs (
  id uuid primary key default gen_random_uuid(),
  automation_key text not null unique,
  trigger_type text not null check (trigger_type in ('proof_verified','mission_verified','manual_retry')),
  trigger_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  link_id uuid references public.experience_commerce_links(id) on delete set null,
  source_type text,
  source_id uuid,
  target_type text,
  target_id uuid,
  action text not null,
  status text not null default 'processing' check (status in ('processing','completed','skipped','failed')),
  result jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists experience_automation_runs_trigger_idx
  on public.experience_automation_runs(trigger_type, trigger_id, created_at);
create index if not exists experience_automation_runs_user_idx
  on public.experience_automation_runs(user_id, created_at desc);

alter table public.experience_automation_runs enable row level security;
drop policy if exists "People read own experience automations" on public.experience_automation_runs;
create policy "People read own experience automations"
  on public.experience_automation_runs for select using (user_id = auth.uid());

comment on table public.experience_automation_runs is
  'Idempotent audit ledger for proof-triggered rewards, offer unlocks, eligibility and commerce attribution.';

notify pgrst, 'reload schema';
