-- Authoritative configuration records created by queued PromoPilot execution jobs.

create table if not exists public.promopilot_publications (
  id uuid primary key default gen_random_uuid(),
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  surface text not null default 'pulse' check (surface in ('pulse', 'discover')),
  title text not null,
  promise text not null,
  public_type text not null,
  location text null,
  starts_at timestamptz null,
  ends_at timestamptz null,
  participant_limit integer null check (participant_limit is null or participant_limit > 0),
  public_path text not null,
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (demand_plan_id, surface)
);

create table if not exists public.promopilot_campaign_rules (
  id uuid primary key default gen_random_uuid(),
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  system_name text not null,
  trigger_event text not null,
  status text not null default 'active' check (status in ('draft', 'active', 'awaiting_funding', 'awaiting_approval', 'paused', 'completed', 'archived')),
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (demand_plan_id, system_name)
);

create table if not exists public.promopilot_partner_briefs (
  id uuid primary key default gen_random_uuid(),
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  partner_type text not null check (partner_type in ('creator', 'community')),
  title text not null,
  brief jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('draft', 'open', 'matched', 'accepted', 'closed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (demand_plan_id, partner_type)
);

create table if not exists public.promopilot_signed_links (
  id uuid primary key default gen_random_uuid(),
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  target_path text not null,
  action_type text not null,
  status text not null default 'active' check (status in ('active', 'paused', 'expired', 'revoked')),
  expires_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (demand_plan_id, action_type)
);

create table if not exists public.promopilot_message_journeys (
  id uuid primary key default gen_random_uuid(),
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'email', 'sms')),
  status text not null default 'awaiting_consent' check (status in ('draft', 'awaiting_consent', 'ready', 'active', 'paused', 'completed', 'cancelled')),
  audience_policy jsonb not null default '{}'::jsonb,
  templates jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (demand_plan_id, channel)
);

create table if not exists public.promopilot_execution_artifacts (
  id uuid primary key default gen_random_uuid(),
  execution_job_id uuid not null references public.promopilot_execution_jobs(id) on delete cascade,
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  artifact_type text not null,
  label text not null,
  status text not null default 'ready' check (status in ('draft', 'ready', 'active', 'expired', 'revoked')),
  reference_type text not null,
  reference_id text not null,
  public_url text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (execution_job_id, artifact_type)
);

create index if not exists idx_promopilot_publications_active on public.promopilot_publications(status, starts_at);
create index if not exists idx_promopilot_rules_campaign on public.promopilot_campaign_rules(campaign_id, status);
create index if not exists idx_promopilot_briefs_open on public.promopilot_partner_briefs(partner_type, status, created_at desc);
create index if not exists idx_promopilot_artifacts_job on public.promopilot_execution_artifacts(execution_job_id);

alter table public.promopilot_publications enable row level security;
alter table public.promopilot_campaign_rules enable row level security;
alter table public.promopilot_partner_briefs enable row level security;
alter table public.promopilot_signed_links enable row level security;
alter table public.promopilot_message_journeys enable row level security;
alter table public.promopilot_execution_artifacts enable row level security;

drop policy if exists "Public reads active PromoPilot publications" on public.promopilot_publications;
drop policy if exists "Owners read PromoPilot rules" on public.promopilot_campaign_rules;
drop policy if exists "Owners read PromoPilot briefs" on public.promopilot_partner_briefs;
drop policy if exists "Owners read PromoPilot signed links" on public.promopilot_signed_links;
drop policy if exists "Owners read PromoPilot message journeys" on public.promopilot_message_journeys;
drop policy if exists "Owners read PromoPilot artifacts" on public.promopilot_execution_artifacts;

create policy "Public reads active PromoPilot publications" on public.promopilot_publications for select using (status = 'active' or auth.uid() = owner_user_id);
create policy "Owners read PromoPilot rules" on public.promopilot_campaign_rules for select using (auth.uid() = owner_user_id);
create policy "Owners read PromoPilot briefs" on public.promopilot_partner_briefs for select using (auth.uid() = owner_user_id);
create policy "Owners read PromoPilot signed links" on public.promopilot_signed_links for select using (auth.uid() = owner_user_id);
create policy "Owners read PromoPilot message journeys" on public.promopilot_message_journeys for select using (auth.uid() = owner_user_id);
create policy "Owners read PromoPilot artifacts" on public.promopilot_execution_artifacts for select using (auth.uid() = owner_user_id);
