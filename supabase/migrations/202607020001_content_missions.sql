-- First-class content missions attached to Moments.
-- Keeps the participant contract explicit: one action, one proof, one reward.

create table if not exists public.content_missions (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  owner_id uuid not null,
  title text not null check (char_length(title) between 3 and 90),
  action_text text not null,
  publish_destination text not null default 'Submit through Promorang',
  qualification_text text not null,
  proof_type text not null check (proof_type in ('link', 'photo', 'video', 'qr', 'referral')),
  starts_at timestamptz,
  due_at timestamptz,
  reward_type text not null check (reward_type in ('pioneer_points', 'voucher', 'access', 'discount', 'recognition')),
  reward_value text not null,
  reward_points integer check (reward_points is null or reward_points > 0),
  participant_limit integer check (participant_limit is null or participant_limit > 0),
  status text not null default 'draft' check (status in ('draft', 'live', 'paused', 'closed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_at is null or starts_at is null or due_at > starts_at)
);

create table if not exists public.mission_participations (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.content_missions(id) on delete cascade,
  user_id uuid not null,
  status text not null default 'joined'
    check (status in ('joined', 'submitted', 'verified', 'rejected', 'rewarded')),
  joined_at timestamptz not null default now(),
  proof_submission_id uuid references public.proof_submissions(id) on delete set null,
  submitted_at timestamptz,
  verified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mission_id, user_id)
);

create index if not exists idx_content_missions_moment_live
  on public.content_missions(moment_id, status, due_at);
create index if not exists idx_mission_participations_user
  on public.mission_participations(user_id, updated_at desc);
create unique index if not exists uq_mission_proof_submission
  on public.mission_participations(proof_submission_id)
  where proof_submission_id is not null;

alter table public.content_missions enable row level security;
alter table public.mission_participations enable row level security;

drop policy if exists "Anyone reads live content missions" on public.content_missions;
create policy "Anyone reads live content missions" on public.content_missions
  for select using (status = 'live' or owner_id = auth.uid());

drop policy if exists "Owners manage content missions" on public.content_missions;
create policy "Owners manage content missions" on public.content_missions
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Users read own mission participation" on public.mission_participations;
create policy "Users read own mission participation" on public.mission_participations
  for select using (user_id = auth.uid());

comment on table public.content_missions is
  'Participant-facing action contracts attached to Moments: action, destination, deadline, proof and reward.';

-- Pioneer Points uses a controlled rule ledger. This rule makes verified
-- mission completion eligible while preserving caps and idempotency.
insert into public.pioneer_rules (
  season_id, event_type, contributor_type, base_points,
  daily_cap, season_cap, requires_verification, description
)
select
  s.id, 'content_mission', 'creator', 75,
  300, 5000, false, 'Complete a verified content mission'
from public.pioneer_seasons s
where s.status = 'active'
on conflict (season_id, event_type, contributor_type) do nothing;

notify pgrst, 'reload schema';
