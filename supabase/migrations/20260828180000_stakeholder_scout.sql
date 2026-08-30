-- Stakeholder scout: research and steward queue only. No automated outreach.
-- Contact fields stay off public reads. Service role + admin/steward RPCs only.

create table if not exists public.stakeholder_scout_candidates (
  id uuid primary key default gen_random_uuid(),
  candidate_key text not null unique,
  kind text not null check (kind in ('venue', 'merchant', 'brand', 'product')),
  display_name text not null,
  hub_id text not null,
  city_slug text,
  neighborhood text,
  category_clusters text[] not null default '{}',
  job text,
  source_kind text not null check (source_kind in (
    'founding_catalog', 'cultural_calendar', 'weekly_moment', 'existing_place', 'steward_nomination'
  )),
  source_name text,
  source_url text,
  website text,
  public_contact_email text,
  status text not null default 'sourced' check (status in (
    'sourced', 'scored', 'watch', 'queued', 'approved', 'invite_ready',
    'sent_by_human', 'rejected', 'suppressed'
  )),
  recommendation text check (recommendation in ('shortlist', 'watch', 'reject')),
  score integer not null default 0 check (score between 0 and 100),
  score_breakdown jsonb not null default '{}'::jsonb,
  reasons jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  preferred_channel text not null default 'walk_in' check (preferred_channel in (
    'walk_in', 'steward_intro', 'claim_page', 'email'
  )),
  moment_id text,
  moment_title text,
  moment_starts_at timestamptz,
  invite_subject text,
  invite_body text,
  claim_path text,
  auto_send boolean not null default false,
  send_allowed boolean not null default false,
  queued_week_start date,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamptz,
  sent_channel text,
  nominated_by uuid references auth.users(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stakeholder_scout_never_auto_send check (auto_send = false and send_allowed = false)
);

create table if not exists public.stakeholder_scout_reviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.stakeholder_scout_candidates(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  from_status text,
  to_status text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.stakeholder_scout_suppressions (
  id uuid primary key default gen_random_uuid(),
  match_key text not null,
  match_type text not null default 'candidate_key' check (match_type in (
    'candidate_key', 'display_name', 'email', 'website'
  )),
  reason text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (match_type, match_key)
);

create index if not exists stakeholder_scout_hub_status_idx
  on public.stakeholder_scout_candidates (hub_id, status, score desc);
create index if not exists stakeholder_scout_week_idx
  on public.stakeholder_scout_candidates (hub_id, queued_week_start, status);
create index if not exists stakeholder_scout_reviews_candidate_idx
  on public.stakeholder_scout_reviews (candidate_id, created_at desc);

alter table public.stakeholder_scout_candidates enable row level security;
alter table public.stakeholder_scout_reviews enable row level security;
alter table public.stakeholder_scout_suppressions enable row level security;

-- No client policies. Admin and steward access go through the authenticated API
-- using the service role so harvested or steward-entered contacts never leak.

create or replace function public.touch_stakeholder_scout_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  new.auto_send = false;
  new.send_allowed = false;
  return new;
end;
$$;

drop trigger if exists touch_stakeholder_scout_updated_at on public.stakeholder_scout_candidates;
create trigger touch_stakeholder_scout_updated_at
before insert or update on public.stakeholder_scout_candidates
for each row execute function public.touch_stakeholder_scout_updated_at();
