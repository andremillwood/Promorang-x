-- People-first Moments: origin, here-now, claims, social Plans, perks, and activity ledger.
-- Extends existing moments / moment_participants / content_missions / moment_media.
-- Does not replace hosted stakeholder Moments.

-- ---------------------------------------------------------------------------
-- 1. Extend moments
-- ---------------------------------------------------------------------------
alter table public.moments
  add column if not exists origin_type text not null default 'community',
  add column if not exists here_now boolean not null default false,
  add column if not exists claim_status text not null default 'unclaimed',
  add column if not exists claimed_by_stakeholder_id uuid,
  add column if not exists plan_id uuid,
  add column if not exists creator_user_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'moments_origin_type_check'
  ) then
    alter table public.moments
      add constraint moments_origin_type_check
      check (origin_type in ('hosted', 'community', 'crew', 'emergent'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'moments_claim_status_check'
  ) then
    alter table public.moments
      add constraint moments_claim_status_check
      check (claim_status in ('unclaimed', 'claim_requested', 'verified', 'disputed'));
  end if;
end $$;

update public.moments
set creator_user_id = coalesce(creative_owner_id, host_id)
where creator_user_id is null;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'moments' and column_name = 'organization_id'
  ) then
    execute $sql$
      update public.moments
      set origin_type = 'hosted'
      where origin_type = 'community'
        and (organization_id is not null or venue_id is not null)
    $sql$;
  else
    update public.moments
    set origin_type = 'hosted'
    where origin_type = 'community'
      and venue_id is not null;
  end if;
end $$;

create index if not exists idx_moments_origin_type_status
  on public.moments(origin_type, status, is_active, starts_at desc);

create index if not exists idx_moments_here_now
  on public.moments(here_now, starts_at desc)
  where here_now = true and is_active = true;

create index if not exists idx_moments_claim_status
  on public.moments(claim_status, claimed_by_stakeholder_id);

-- ---------------------------------------------------------------------------
-- 2. Participation attribution (reuse moment_participants)
-- ---------------------------------------------------------------------------
alter table public.moment_participants
  add column if not exists invited_by_user_id uuid,
  add column if not exists referral_code text,
  add column if not exists source text,
  add column if not exists campaign text,
  add column if not exists plan_id uuid;

create index if not exists idx_moment_participants_invited_by
  on public.moment_participants(invited_by_user_id)
  where invited_by_user_id is not null;

-- ---------------------------------------------------------------------------
-- 3. Social Plans (lightweight intent before a Moment)
-- Named social_plans to avoid colliding with demand_plans / proposals.
-- ---------------------------------------------------------------------------
create table if not exists public.social_plans (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null,
  scene_id uuid,
  title text not null check (char_length(title) between 1 and 140),
  description text,
  window_starts_at timestamptz,
  window_ends_at timestamptz,
  location_hint text,
  privacy text not null default 'invite_only'
    check (privacy in ('public', 'invite_only', 'unlisted')),
  status text not null default 'open'
    check (status in ('open', 'voting', 'decided', 'converted', 'cancelled')),
  decided_option_id uuid,
  converted_moment_id uuid references public.moments(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_plan_members (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.social_plans(id) on delete cascade,
  user_id uuid,
  invited_by_user_id uuid,
  display_name text,
  invite_contact text,
  referral_code text,
  source text,
  role text not null default 'member'
    check (role in ('creator', 'member', 'invitee')),
  status text not null default 'invited'
    check (status in ('invited', 'joined', 'declined', 'left')),
  created_at timestamptz not null default now(),
  unique (plan_id, user_id)
);

create table if not exists public.social_plan_options (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.social_plans(id) on delete cascade,
  suggested_by_user_id uuid,
  title text not null check (char_length(title) between 1 and 120),
  note text,
  related_moment_id uuid references public.moments(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.social_plan_votes (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.social_plans(id) on delete cascade,
  option_id uuid not null references public.social_plan_options(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (plan_id, user_id)
);

create index if not exists idx_social_plans_creator
  on public.social_plans(creator_user_id, created_at desc);
create index if not exists idx_social_plan_members_user
  on public.social_plan_members(user_id, status);
create index if not exists idx_social_plan_options_plan
  on public.social_plan_options(plan_id, sort_order);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'moments_plan_id_fkey'
  ) then
    alter table public.moments
      add constraint moments_plan_id_fkey
      foreign key (plan_id) references public.social_plans(id) on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Invites (Plans + Moments + Missions)
-- ---------------------------------------------------------------------------
create table if not exists public.moment_invites (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('moment', 'plan', 'mission')),
  moment_id uuid references public.moments(id) on delete cascade,
  plan_id uuid references public.social_plans(id) on delete cascade,
  mission_id uuid,
  invited_by_user_id uuid not null,
  invited_user_id uuid,
  invitee_contact text,
  referral_code text,
  source text,
  campaign text,
  token text not null default encode(gen_random_bytes(12), 'hex'),
  status text not null default 'sent'
    check (status in ('sent', 'opened', 'accepted', 'declined')),
  opened_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (token)
);

create index if not exists idx_moment_invites_moment
  on public.moment_invites(moment_id, status);
create index if not exists idx_moment_invites_plan
  on public.moment_invites(plan_id, status);
create index if not exists idx_moment_invites_inviter
  on public.moment_invites(invited_by_user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 5. Claims (stakeholder relationship, not content ownership)
-- ---------------------------------------------------------------------------
create table if not exists public.moment_claims (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  requested_by_user_id uuid not null,
  stakeholder_id uuid,
  note text,
  status text not null default 'claim_requested'
    check (status in ('claim_requested', 'verified', 'disputed', 'withdrawn')),
  reviewed_by_user_id uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_moment_claims_moment
  on public.moment_claims(moment_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- 6. Lightweight Moment perks (stakeholder attach after claim/host)
-- ---------------------------------------------------------------------------
create table if not exists public.moment_perks (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  created_by_user_id uuid not null,
  stakeholder_id uuid,
  title text not null check (char_length(title) between 1 and 80),
  description text,
  perk_kind text not null default 'offer'
    check (perk_kind in (
      'offer', 'discount', 'freebie', 'access', 'promokey',
      'points', 'gems', 'giveaway', 'other'
    )),
  value_label text,
  quantity_limit integer,
  claimed_count integer not null default 0,
  status text not null default 'live'
    check (status in ('draft', 'live', 'paused', 'closed')),
  offer_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.moment_perk_claims (
  id uuid primary key default gen_random_uuid(),
  perk_id uuid not null references public.moment_perks(id) on delete cascade,
  moment_id uuid not null references public.moments(id) on delete cascade,
  user_id uuid not null,
  status text not null default 'claimed'
    check (status in ('claimed', 'redeemed', 'expired', 'cancelled')),
  redemption_code text,
  claimed_at timestamptz not null default now(),
  redeemed_at timestamptz,
  unique (perk_id, user_id)
);

create index if not exists idx_moment_perks_moment
  on public.moment_perks(moment_id, status);

-- ---------------------------------------------------------------------------
-- 7. Generic activity ledger
-- ---------------------------------------------------------------------------
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  actor_user_id uuid,
  moment_id uuid references public.moments(id) on delete set null,
  plan_id uuid references public.social_plans(id) on delete set null,
  mission_id uuid,
  perk_id uuid,
  invite_id uuid,
  stakeholder_id uuid,
  invited_by_user_id uuid,
  referral_code text,
  source text,
  campaign text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_events_name_created
  on public.activity_events(event_name, created_at desc);
create index if not exists idx_activity_events_moment
  on public.activity_events(moment_id, created_at desc);
create index if not exists idx_activity_events_actor
  on public.activity_events(actor_user_id, created_at desc);
create index if not exists idx_activity_events_plan
  on public.activity_events(plan_id, created_at desc);

create or replace function public.record_activity_event(
  p_event_name text,
  p_actor_user_id uuid default null,
  p_moment_id uuid default null,
  p_plan_id uuid default null,
  p_mission_id uuid default null,
  p_perk_id uuid default null,
  p_invite_id uuid default null,
  p_stakeholder_id uuid default null,
  p_invited_by_user_id uuid default null,
  p_referral_code text default null,
  p_source text default null,
  p_campaign text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns public.activity_events
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_row public.activity_events;
begin
  insert into public.activity_events (
    event_name, actor_user_id, moment_id, plan_id, mission_id, perk_id,
    invite_id, stakeholder_id, invited_by_user_id, referral_code, source, campaign, metadata
  ) values (
    p_event_name, p_actor_user_id, p_moment_id, p_plan_id, p_mission_id, p_perk_id,
    p_invite_id, p_stakeholder_id, p_invited_by_user_id, p_referral_code, p_source, p_campaign,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning * into v_row;
  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Demand snapshot for merchant acquisition (Test C)
-- ---------------------------------------------------------------------------
create or replace view public.view_moment_demand_snapshot
with (security_invoker = true)
as
select
  m.id as moment_id,
  m.title,
  m.origin_type,
  m.claim_status,
  m.claimed_by_stakeholder_id,
  m.venue_name,
  m.location,
  m.here_now,
  m.status,
  m.starts_at,
  (select count(*) from public.moment_participants mp where mp.moment_id = m.id and mp.status <> 'cancelled') as participant_count,
  (select count(*) from public.moment_invites mi where mi.moment_id = m.id) as invite_count,
  (select count(*) from public.moment_invites mi where mi.moment_id = m.id and mi.status = 'accepted') as invite_accepted_count,
  (select count(*) from public.moment_media mm where mm.moment_id = m.id) as submission_count,
  (select count(*) from public.mission_participations mpart
     join public.content_missions cm on cm.id = mpart.mission_id
    where cm.moment_id = m.id and mpart.status in ('submitted', 'verified', 'rewarded')) as mission_completion_count,
  (select count(*) from public.moment_perk_claims mpc where mpc.moment_id = m.id) as perk_claim_count,
  (select count(*) from public.activity_events ae where ae.moment_id = m.id and ae.event_name = 'moment.joined') as join_event_count
from public.moments m;

-- ---------------------------------------------------------------------------
-- 9. Default participation prompts
-- ---------------------------------------------------------------------------
create or replace function public.seed_people_moment_prompts(
  p_moment_id uuid,
  p_owner_id uuid
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count integer := 0;
begin
  if exists (select 1 from public.content_missions where moment_id = p_moment_id) then
    return 0;
  end if;

  insert into public.content_missions (
    moment_id, owner_id, title, action_text, publish_destination,
    qualification_text, proof_type, reward_type, reward_value, reward_points, status, metadata
  ) values
    (
      p_moment_id, p_owner_id,
      'Show us your crew',
      'Take a group photo of who showed up.',
      'Submit through Promorang',
      'A photo with at least one other person at the Moment.',
      'photo', 'recognition', 'Crew shout-out', 10, 'live',
      jsonb_build_object('prompt_kind', 'crew', 'optional', true)
    ),
    (
      p_moment_id, p_owner_id,
      'Fit check',
      'Show what you wore out.',
      'Submit through Promorang',
      'A photo or short clip of your fit at the Moment.',
      'photo', 'recognition', 'Fit check mention', 10, 'live',
      jsonb_build_object('prompt_kind', 'fit_check', 'optional', true)
    ),
    (
      p_moment_id, p_owner_id,
      'Rate the energy',
      'How does it feel right now?',
      'Submit through Promorang',
      'A short note or photo that captures the vibe.',
      'photo', 'pioneer_points', 'Energy note', 10, 'live',
      jsonb_build_object('prompt_kind', 'energy', 'optional', true)
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- 10. RLS
-- ---------------------------------------------------------------------------
alter table public.social_plans enable row level security;
alter table public.social_plan_members enable row level security;
alter table public.social_plan_options enable row level security;
alter table public.social_plan_votes enable row level security;
alter table public.moment_invites enable row level security;
alter table public.moment_claims enable row level security;
alter table public.moment_perks enable row level security;
alter table public.moment_perk_claims enable row level security;
alter table public.activity_events enable row level security;

drop policy if exists "social_plans_select" on public.social_plans;
create policy "social_plans_select" on public.social_plans
  for select using (
    privacy = 'public'
    or creator_user_id = auth.uid()
    or exists (
      select 1 from public.social_plan_members m
      where m.plan_id = social_plans.id
        and m.user_id = auth.uid()
        and m.status in ('invited', 'joined')
    )
  );

drop policy if exists "social_plans_insert" on public.social_plans;
create policy "social_plans_insert" on public.social_plans
  for insert with check (creator_user_id = auth.uid());

drop policy if exists "social_plans_update" on public.social_plans;
create policy "social_plans_update" on public.social_plans
  for update using (creator_user_id = auth.uid())
  with check (creator_user_id = auth.uid());

drop policy if exists "social_plan_members_select" on public.social_plan_members;
create policy "social_plan_members_select" on public.social_plan_members
  for select using (
    user_id = auth.uid()
    or invited_by_user_id = auth.uid()
    or exists (
      select 1 from public.social_plans p
      where p.id = social_plan_members.plan_id
        and (p.creator_user_id = auth.uid() or p.privacy = 'public')
    )
  );

drop policy if exists "social_plan_members_write" on public.social_plan_members;
create policy "social_plan_members_write" on public.social_plan_members
  for all using (
    user_id = auth.uid()
    or exists (
      select 1 from public.social_plans p
      where p.id = social_plan_members.plan_id and p.creator_user_id = auth.uid()
    )
  ) with check (
    user_id = auth.uid()
    or invited_by_user_id = auth.uid()
    or exists (
      select 1 from public.social_plans p
      where p.id = social_plan_members.plan_id and p.creator_user_id = auth.uid()
    )
  );

drop policy if exists "social_plan_options_select" on public.social_plan_options;
create policy "social_plan_options_select" on public.social_plan_options
  for select using (
    exists (
      select 1 from public.social_plans p
      where p.id = social_plan_options.plan_id
        and (
          p.privacy = 'public'
          or p.creator_user_id = auth.uid()
          or exists (
            select 1 from public.social_plan_members m
            where m.plan_id = p.id and m.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "social_plan_options_write" on public.social_plan_options;
create policy "social_plan_options_write" on public.social_plan_options
  for all using (
    exists (
      select 1 from public.social_plans p
      where p.id = social_plan_options.plan_id
        and (
          p.creator_user_id = auth.uid()
          or exists (
            select 1 from public.social_plan_members m
            where m.plan_id = p.id and m.user_id = auth.uid() and m.status = 'joined'
          )
        )
    )
  ) with check (
    exists (
      select 1 from public.social_plans p
      where p.id = social_plan_options.plan_id
        and (
          p.creator_user_id = auth.uid()
          or exists (
            select 1 from public.social_plan_members m
            where m.plan_id = p.id and m.user_id = auth.uid() and m.status = 'joined'
          )
        )
    )
  );

drop policy if exists "social_plan_votes_select" on public.social_plan_votes;
create policy "social_plan_votes_select" on public.social_plan_votes
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.social_plans p
      where p.id = social_plan_votes.plan_id and p.creator_user_id = auth.uid()
    )
  );

drop policy if exists "social_plan_votes_write" on public.social_plan_votes;
create policy "social_plan_votes_write" on public.social_plan_votes
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "moment_invites_select" on public.moment_invites;
create policy "moment_invites_select" on public.moment_invites
  for select using (
    invited_by_user_id = auth.uid()
    or invited_user_id = auth.uid()
  );

drop policy if exists "moment_invites_insert" on public.moment_invites;
create policy "moment_invites_insert" on public.moment_invites
  for insert with check (invited_by_user_id = auth.uid());

drop policy if exists "moment_invites_update" on public.moment_invites;
create policy "moment_invites_update" on public.moment_invites
  for update using (
    invited_by_user_id = auth.uid() or invited_user_id = auth.uid()
  );

drop policy if exists "moment_claims_select" on public.moment_claims;
create policy "moment_claims_select" on public.moment_claims
  for select using (
    requested_by_user_id = auth.uid()
    or exists (
      select 1 from public.moments m
      where m.id = moment_claims.moment_id
        and (m.host_id = auth.uid() or m.creator_user_id = auth.uid())
    )
  );

drop policy if exists "moment_claims_insert" on public.moment_claims;
create policy "moment_claims_insert" on public.moment_claims
  for insert with check (requested_by_user_id = auth.uid());

drop policy if exists "moment_perks_select" on public.moment_perks;
create policy "moment_perks_select" on public.moment_perks
  for select using (
    status = 'live'
    or created_by_user_id = auth.uid()
  );

drop policy if exists "moment_perks_write" on public.moment_perks;
create policy "moment_perks_write" on public.moment_perks
  for all using (
    created_by_user_id = auth.uid()
    or exists (
      select 1 from public.moments m
      where m.id = moment_perks.moment_id
        and (
          m.host_id = auth.uid()
          or m.creator_user_id = auth.uid()
          or m.claimed_by_stakeholder_id is not null
        )
    )
  ) with check (created_by_user_id = auth.uid());

drop policy if exists "moment_perk_claims_select" on public.moment_perk_claims;
create policy "moment_perk_claims_select" on public.moment_perk_claims
  for select using (user_id = auth.uid());

drop policy if exists "moment_perk_claims_insert" on public.moment_perk_claims;
create policy "moment_perk_claims_insert" on public.moment_perk_claims
  for insert with check (user_id = auth.uid());

drop policy if exists "activity_events_select" on public.activity_events;
create policy "activity_events_select" on public.activity_events
  for select using (
    actor_user_id = auth.uid()
    or invited_by_user_id = auth.uid()
    or exists (
      select 1 from public.moments m
      where m.id = activity_events.moment_id
        and (m.visibility = 'open' or m.host_id = auth.uid() or m.creator_user_id = auth.uid())
    )
  );

drop policy if exists "activity_events_insert" on public.activity_events;
create policy "activity_events_insert" on public.activity_events
  for insert with check (
    actor_user_id = auth.uid() or actor_user_id is null
  );

grant select, insert, update, delete on public.social_plans to authenticated;
grant select, insert, update, delete on public.social_plan_members to authenticated;
grant select, insert, update, delete on public.social_plan_options to authenticated;
grant select, insert, update, delete on public.social_plan_votes to authenticated;
grant select, insert, update on public.moment_invites to authenticated;
grant select, insert on public.moment_claims to authenticated;
grant select, insert, update on public.moment_perks to authenticated;
grant select, insert, update on public.moment_perk_claims to authenticated;
grant select, insert on public.activity_events to authenticated;
grant select on public.view_moment_demand_snapshot to authenticated, anon;
grant execute on function public.record_activity_event(
  text, uuid, uuid, uuid, uuid, uuid, uuid, uuid, uuid, text, text, text, jsonb
) to authenticated;
grant execute on function public.seed_people_moment_prompts(uuid, uuid) to authenticated;

comment on column public.moments.origin_type is
  'People-first origin: hosted | community | crew | emergent. Independent of moment_type economy enum.';
comment on column public.moments.claim_status is
  'Stakeholder relationship to the Moment, not ownership of participant content.';
comment on table public.social_plans is
  'Lightweight group intent before a Moment is chosen. Not a full event planner.';
comment on table public.activity_events is
  'Database-backed activity ledger for analytics, rewards, and anti-abuse.';
