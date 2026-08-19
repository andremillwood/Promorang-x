-- Promorang first-party lead and CRM operating layer.
create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  organization_name text,
  phone text,
  stakeholder_type text not null check (stakeholder_type in ('participant','host','merchant','creator','brand','agency')),
  funnel_key text not null check (funnel_key in ('scene','moment','demand','creator','sponsor')),
  lifecycle_stage text not null default 'new' check (lifecycle_stage in ('new','qualified','contacted','discovery','proposal','won','lost','nurture')),
  qualification_score integer not null default 0 check (qualification_score between 0 and 100),
  diagnostic_score integer check (diagnostic_score between 0 and 100),
  result_name text,
  result_insight text,
  answers jsonb not null default '{}'::jsonb,
  recommended_moves jsonb not null default '[]'::jsonb,
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  landing_path text,
  referrer_url text,
  anonymous_id text,
  user_id uuid references auth.users(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  estimated_value numeric(14,2),
  realized_value numeric(14,2),
  currency text not null default 'USD',
  next_follow_up_at timestamptz,
  last_contacted_at timestamptz,
  converted_at timestamptz,
  lost_reason text,
  marketing_consent boolean not null default false,
  consent_text text,
  consent_at timestamptz,
  capture_count integer not null default 1,
  first_captured_at timestamptz not null default now(),
  last_captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, funnel_key)
);

create table if not exists public.crm_lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  activity_type text not null check (activity_type in ('captured','stage_changed','assigned','note','task_created','task_completed','contacted','conversion','email_sent','email_failed')),
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_lead_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open','complete','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  due_at timestamptz,
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_leads_stage_idx on public.crm_leads(lifecycle_stage, updated_at desc);
create index if not exists crm_leads_stakeholder_idx on public.crm_leads(stakeholder_type, qualification_score desc);
create index if not exists crm_leads_assignee_idx on public.crm_leads(assigned_to, next_follow_up_at);
create index if not exists crm_leads_attribution_idx on public.crm_leads(source, campaign, first_captured_at desc);
create index if not exists crm_lead_activities_lead_idx on public.crm_lead_activities(lead_id, created_at desc);
create index if not exists crm_lead_tasks_due_idx on public.crm_lead_tasks(status, due_at);

alter table public.crm_leads enable row level security;
alter table public.crm_lead_activities enable row level security;
alter table public.crm_lead_tasks enable row level security;

-- No client policies by design. Public capture and admin access pass through the
-- validated backend using the service role; personal lead data is never exposed to anon.

create or replace function public.touch_crm_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists touch_crm_leads_updated_at on public.crm_leads;
create trigger touch_crm_leads_updated_at before update on public.crm_leads
for each row execute function public.touch_crm_updated_at();
drop trigger if exists touch_crm_tasks_updated_at on public.crm_lead_tasks;
create trigger touch_crm_tasks_updated_at before update on public.crm_lead_tasks
for each row execute function public.touch_crm_updated_at();

