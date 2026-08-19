-- Evidence-gated campaign learning. Templates preserve structure; recommendations preserve their evidence.

create table if not exists public.demand_plan_templates (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid null,
  source_demand_plan_id uuid null references public.demand_plans(id) on delete set null,
  title text not null,
  slug text not null,
  description text null,
  goal text not null,
  visibility text not null default 'private' check (visibility in ('private', 'organization', 'public')),
  blueprint jsonb not null default '{}'::jsonb,
  evidence_summary jsonb not null default '{}'::jsonb,
  use_count integer not null default 0 check (use_count >= 0),
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, slug)
);

create table if not exists public.campaign_learning_snapshots (
  id uuid primary key default gen_random_uuid(),
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  event_watermark timestamptz null,
  summary jsonb not null default '{}'::jsonb,
  benchmark jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_recommendations (
  id uuid primary key default gen_random_uuid(),
  demand_plan_id uuid not null references public.demand_plans(id) on delete cascade,
  campaign_id uuid not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_key text not null,
  category text not null check (category in ('instrumentation', 'invitation', 'participation', 'conversion', 'review', 'referral', 'loyalty', 'distribution')),
  title text not null,
  rationale text not null,
  confidence text not null check (confidence in ('insufficient', 'low', 'medium', 'high')),
  evidence jsonb not null default '{}'::jsonb,
  suggested_patch jsonb not null default '{}'::jsonb,
  status text not null default 'proposed' check (status in ('proposed', 'accepted', 'rejected', 'applied', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (demand_plan_id, recommendation_key)
);

create index if not exists idx_demand_templates_goal on public.demand_plan_templates(goal, visibility, status);
create index if not exists idx_learning_snapshots_plan on public.campaign_learning_snapshots(demand_plan_id, created_at desc);
create index if not exists idx_campaign_recommendations_plan on public.campaign_recommendations(demand_plan_id, status, created_at desc);

alter table public.demand_plan_templates enable row level security;
alter table public.campaign_learning_snapshots enable row level security;
alter table public.campaign_recommendations enable row level security;

drop policy if exists "Owners read demand templates" on public.demand_plan_templates;
create policy "Owners read demand templates" on public.demand_plan_templates for select using (owner_user_id = auth.uid() or visibility = 'public');
drop policy if exists "Owners read learning snapshots" on public.campaign_learning_snapshots;
create policy "Owners read learning snapshots" on public.campaign_learning_snapshots for select using (owner_user_id = auth.uid());
drop policy if exists "Owners read campaign recommendations" on public.campaign_recommendations;
create policy "Owners read campaign recommendations" on public.campaign_recommendations for select using (owner_user_id = auth.uid());

comment on table public.demand_plan_templates is 'Reusable campaign structure without copying dates, locations, audiences or outcome claims as facts.';
comment on table public.campaign_recommendations is 'Evidence-backed proposed changes; never automatically applied by the learning service.';

