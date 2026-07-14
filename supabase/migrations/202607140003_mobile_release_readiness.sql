-- Mobile store release readiness: deletion requests and UGC safety controls.

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  source text not null default 'mobile' check (source in ('mobile', 'web', 'support')),
  reason text,
  status text not null default 'pending' check (status in ('pending', 'verifying', 'processing', 'completed', 'cancelled', 'rejected')),
  requested_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  completed_at timestamptz,
  retention_notes text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_account_deletion_requests_email
  on public.account_deletion_requests (lower(email), requested_at desc);
create index if not exists idx_account_deletion_requests_status
  on public.account_deletion_requests (status, requested_at);

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('moment', 'content', 'product', 'offer', 'piece', 'user')),
  target_id text not null,
  reported_user_id uuid references auth.users(id) on delete set null,
  reason text not null check (reason in ('spam', 'harassment', 'hate', 'nudity', 'violence', 'dangerous', 'fraud', 'intellectual_property', 'other')),
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'actioned', 'dismissed')),
  source text not null default 'mobile_feed',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  resolution_notes text
);

create index if not exists idx_content_reports_review_queue
  on public.content_reports (status, created_at);
create index if not exists idx_content_reports_target
  on public.content_reports (target_type, target_id);

create table if not exists public.user_blocks (
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_user_id, blocked_user_id),
  constraint user_blocks_not_self check (blocker_user_id <> blocked_user_id)
);

alter table public.account_deletion_requests enable row level security;
alter table public.content_reports enable row level security;
alter table public.user_blocks enable row level security;

drop policy if exists "Users can read own deletion requests" on public.account_deletion_requests;
create policy "Users can read own deletion requests"
  on public.account_deletion_requests for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own deletion requests" on public.account_deletion_requests;
create policy "Users can create own deletion requests"
  on public.account_deletion_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can create reports" on public.content_reports;
create policy "Users can create reports"
  on public.content_reports for insert
  with check (auth.uid() = reporter_user_id);

drop policy if exists "Users can read own reports" on public.content_reports;
create policy "Users can read own reports"
  on public.content_reports for select
  using (auth.uid() = reporter_user_id);

drop policy if exists "Users manage own blocks" on public.user_blocks;
create policy "Users manage own blocks"
  on public.user_blocks for all
  using (auth.uid() = blocker_user_id)
  with check (auth.uid() = blocker_user_id);

comment on table public.account_deletion_requests is 'Auditable account and associated-data deletion requests from app, web, or support.';
comment on table public.content_reports is 'User-submitted UGC safety reports for the moderation queue.';
comment on table public.user_blocks is 'User-level blocks used to remove abusive accounts from personalized surfaces.';
