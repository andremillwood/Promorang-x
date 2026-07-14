-- Human social return and Scene continuity.
-- Existing attendance, proof, attribution, offer, referral, and economy tables
-- remain the source ledgers. These tables provide the relationship and outcome
-- layer used by human-facing Progress, Scene, and stakeholder result surfaces.

create extension if not exists pgcrypto;

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid references auth.users(id) on delete set null,
  brand_id uuid references public.organizations(id) on delete set null,
  title text not null,
  description text,
  budget numeric(14,2),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  target_moment_id uuid references public.moments(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.proposals
  add column if not exists planner_id uuid references auth.users(id) on delete set null,
  add column if not exists brand_id uuid references public.organizations(id) on delete set null,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists budget numeric(14,2),
  add column if not exists status text not null default 'draft',
  add column if not exists target_moment_id uuid references public.moments(id) on delete set null,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.scenes (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  city text,
  country text,
  image_url text,
  visibility text not null default 'public' check (visibility in ('public', 'invite', 'private')),
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scene_memberships (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid not null references public.scenes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  relationship text not null default 'participant' check (relationship in ('participant', 'creator', 'host', 'venue', 'merchant', 'brand', 'agency', 'supporter')),
  membership_state text not null default 'active' check (membership_state in ('invited', 'active', 'paused', 'left', 'removed')),
  first_joined_at timestamptz not null default now(),
  last_seen_at timestamptz,
  moments_joined integer not null default 0,
  moments_returned integer not null default 0,
  people_brought integer not null default 0,
  stories_shared integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(scene_id, user_id, relationship)
);

create table if not exists public.moment_scene_links (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid not null references public.moments(id) on delete cascade,
  scene_id uuid not null references public.scenes(id) on delete cascade,
  relationship text not null default 'featured' check (relationship in ('origin', 'featured', 'partner', 'hosted_by')),
  created_at timestamptz not null default now(),
  unique(moment_id, scene_id, relationship)
);

create table if not exists public.social_return_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scene_id uuid references public.scenes(id) on delete cascade,
  moment_id uuid references public.moments(id) on delete cascade,
  source_user_id uuid references auth.users(id) on delete set null,
  source_type text not null,
  source_id text,
  return_type text not null check (return_type in (
    'showed_up', 'returned', 'met_someone', 'followed_after_moment',
    'invited', 'invitation_accepted', 'collaboration_started',
    'booking_opened', 'creator_discovered', 'customer_returned',
    'story_moved_person', 'scene_joined', 'access_opened', 'memory_kept'
  )),
  value_count integer not null default 1 check (value_count > 0),
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_openings (
  id uuid primary key default gen_random_uuid(),
  beneficiary_user_id uuid not null references auth.users(id) on delete cascade,
  opened_by_user_id uuid references auth.users(id) on delete set null,
  scene_id uuid references public.scenes(id) on delete set null,
  moment_id uuid references public.moments(id) on delete set null,
  opportunity_type text not null check (opportunity_type in ('invitation', 'collaboration', 'booking', 'creator_brief', 'host_request', 'brand_partnership', 'merchant_offer', 'access')),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'accepted', 'declined', 'expired', 'completed')),
  destination_url text,
  opened_at timestamptz not null default now(),
  responded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activation_outcome_snapshots (
  id uuid primary key default gen_random_uuid(),
  moment_id uuid references public.moments(id) on delete cascade,
  scene_id uuid references public.scenes(id) on delete set null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  stakeholder_type text not null check (stakeholder_type in ('creator', 'host', 'venue', 'merchant', 'brand', 'agency', 'scene')),
  captured_at timestamptz not null default now(),
  people_reached integer not null default 0,
  people_joined integer not null default 0,
  people_showed_up integer not null default 0,
  people_returned integer not null default 0,
  stories_created integer not null default 0,
  creator_driven_visits integer not null default 0,
  invitations_opened integer not null default 0,
  collaborations_opened integer not null default 0,
  redemptions integer not null default 0,
  purchases integer not null default 0,
  gross_value numeric(14,2) not null default 0,
  funded_value numeric(14,2) not null default 0,
  currency text not null default 'JMD',
  human_return_summary text,
  commercial_return_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_scene_memberships_user on public.scene_memberships(user_id, membership_state, last_seen_at desc);
create index if not exists idx_proposals_planner on public.proposals(planner_id, created_at desc);
create index if not exists idx_proposals_brand on public.proposals(brand_id, created_at desc);
create index if not exists idx_proposals_status on public.proposals(status, created_at desc);
create index if not exists idx_moment_scene_links_moment on public.moment_scene_links(moment_id);
create index if not exists idx_social_return_events_user on public.social_return_events(user_id, occurred_at desc);
create index if not exists idx_social_return_events_scene on public.social_return_events(scene_id, occurred_at desc);
create unique index if not exists idx_social_return_events_source_once on public.social_return_events(user_id, return_type, source_type, source_id) where source_id is not null;
create index if not exists idx_opportunity_openings_beneficiary on public.opportunity_openings(beneficiary_user_id, status, opened_at desc);
create index if not exists idx_activation_outcomes_owner on public.activation_outcome_snapshots(owner_user_id, captured_at desc);

alter table public.proposals enable row level security;
alter table public.scenes enable row level security;
alter table public.scene_memberships enable row level security;
alter table public.moment_scene_links enable row level security;
alter table public.social_return_events enable row level security;
alter table public.opportunity_openings enable row level security;
alter table public.activation_outcome_snapshots enable row level security;

drop policy if exists "Planners and brands read proposals" on public.proposals;
create policy "Planners and brands read proposals" on public.proposals for select using (
  planner_id = auth.uid()
  or exists (
    select 1
    from public.organization_members om
    where om.organization_id = brand_id
      and om.user_id = auth.uid()
  )
);
drop policy if exists "Users create proposals" on public.proposals;
create policy "Users create proposals" on public.proposals for insert with check (planner_id = auth.uid());
drop policy if exists "Planners update proposals" on public.proposals;
create policy "Planners update proposals" on public.proposals for update using (planner_id = auth.uid()) with check (planner_id = auth.uid());

drop policy if exists "Public reads active scenes" on public.scenes;
create policy "Public reads active scenes" on public.scenes for select using (status = 'active' and visibility = 'public' or owner_user_id = auth.uid());
drop policy if exists "Owners manage scenes" on public.scenes;
create policy "Owners manage scenes" on public.scenes for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

drop policy if exists "Members read scene memberships" on public.scene_memberships;
create policy "Members read scene memberships" on public.scene_memberships for select using (user_id = auth.uid() or exists (select 1 from public.scenes s where s.id = scene_id and s.owner_user_id = auth.uid()));
drop policy if exists "Users join scenes" on public.scene_memberships;
create policy "Users join scenes" on public.scene_memberships for insert with check (user_id = auth.uid());
drop policy if exists "Users update scene membership" on public.scene_memberships;
create policy "Users update scene membership" on public.scene_memberships for update using (user_id = auth.uid());

drop policy if exists "Public reads moment scene links" on public.moment_scene_links;
create policy "Public reads moment scene links" on public.moment_scene_links for select using (true);
drop policy if exists "Scene owners manage moment links" on public.moment_scene_links;
create policy "Scene owners manage moment links" on public.moment_scene_links for all using (exists (select 1 from public.scenes s where s.id = scene_id and s.owner_user_id = auth.uid())) with check (exists (select 1 from public.scenes s where s.id = scene_id and s.owner_user_id = auth.uid()));

drop policy if exists "Users read own social returns" on public.social_return_events;
create policy "Users read own social returns" on public.social_return_events for select using (user_id = auth.uid() or source_user_id = auth.uid());
drop policy if exists "Service writes social returns" on public.social_return_events;
create policy "Service writes social returns" on public.social_return_events for insert with check (user_id = auth.uid() or source_user_id = auth.uid());

drop policy if exists "Users read own opportunities" on public.opportunity_openings;
create policy "Users read own opportunities" on public.opportunity_openings for select using (beneficiary_user_id = auth.uid() or opened_by_user_id = auth.uid());
drop policy if exists "Users open opportunities" on public.opportunity_openings;
create policy "Users open opportunities" on public.opportunity_openings for insert with check (opened_by_user_id = auth.uid());
drop policy if exists "Beneficiaries respond to opportunities" on public.opportunity_openings;
create policy "Beneficiaries respond to opportunities" on public.opportunity_openings for update using (beneficiary_user_id = auth.uid() or opened_by_user_id = auth.uid());

drop policy if exists "Stakeholders read outcome snapshots" on public.activation_outcome_snapshots;
create policy "Stakeholders read outcome snapshots" on public.activation_outcome_snapshots for select using (owner_user_id = auth.uid());
drop policy if exists "Stakeholders write outcome snapshots" on public.activation_outcome_snapshots;
create policy "Stakeholders write outcome snapshots" on public.activation_outcome_snapshots for insert with check (owner_user_id = auth.uid());

create or replace function public.get_my_social_return()
returns jsonb
language sql
security invoker
stable
as $$
  select jsonb_build_object(
    'scenes', (select count(distinct scene_id) from public.scene_memberships where user_id = auth.uid() and membership_state = 'active'),
    'moments', (select coalesce(sum(value_count), 0) from public.social_return_events where user_id = auth.uid() and return_type = 'showed_up'),
    'returns', (select coalesce(sum(value_count), 0) from public.social_return_events where user_id = auth.uid() and return_type in ('returned', 'customer_returned')),
    'people_brought', (select coalesce(sum(value_count), 0) from public.social_return_events where user_id = auth.uid() and return_type = 'story_moved_person'),
    'connections', (select coalesce(sum(value_count), 0) from public.social_return_events where user_id = auth.uid() and return_type in ('met_someone', 'followed_after_moment', 'collaboration_started')),
    'invitations', (select count(*) from public.opportunity_openings where beneficiary_user_id = auth.uid() and opportunity_type = 'invitation'),
    'open_doors', (select count(*) from public.opportunity_openings where beneficiary_user_id = auth.uid() and status = 'open'),
    'memories', (select count(*) from public.memories where user_id = auth.uid()),
    'recent_openings', coalesce((
      select jsonb_agg(jsonb_build_object('id', id, 'type', opportunity_type, 'title', title, 'status', status, 'destination_url', destination_url, 'opened_at', opened_at) order by opened_at desc)
      from (select * from public.opportunity_openings where beneficiary_user_id = auth.uid() order by opened_at desc limit 5) recent
    ), '[]'::jsonb)
  );
$$;

create or replace function public.get_my_stakeholder_return()
returns jsonb
language sql
security invoker
stable
as $$
  select coalesce(jsonb_build_object(
    'people_reached', sum(people_reached),
    'people_joined', sum(people_joined),
    'people_showed_up', sum(people_showed_up),
    'people_returned', sum(people_returned),
    'stories_created', sum(stories_created),
    'creator_driven_visits', sum(creator_driven_visits),
    'invitations_opened', sum(invitations_opened),
    'collaborations_opened', sum(collaborations_opened),
    'redemptions', sum(redemptions),
    'purchases', sum(purchases),
    'gross_value', sum(gross_value),
    'funded_value', sum(funded_value),
    'currency', max(currency),
    'latest_human_return', (array_agg(human_return_summary order by captured_at desc) filter (where human_return_summary is not null))[1],
    'latest_commercial_return', (array_agg(commercial_return_summary order by captured_at desc) filter (where commercial_return_summary is not null))[1]
  ), '{}'::jsonb)
  from public.activation_outcome_snapshots
  where owner_user_id = auth.uid();
$$;

grant execute on function public.get_my_social_return() to authenticated;
grant execute on function public.get_my_stakeholder_return() to authenticated;

-- Translate existing source ledgers into the human-return layer. These triggers
-- do not replace the source rows; they create idempotent relationship events.

create or replace function public.record_scene_return_from_participation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_scene record;
  prior_count integer;
begin
  if new.status not in ('checked_in', 'completed') then
    return new;
  end if;

  for linked_scene in select scene_id from public.moment_scene_links where moment_id = new.moment_id loop
    select count(*) into prior_count
    from public.social_return_events e
    where e.user_id = new.user_id
      and e.scene_id = linked_scene.scene_id
      and e.return_type = 'showed_up';

    insert into public.scene_memberships (scene_id, user_id, relationship, membership_state, last_seen_at, moments_joined, moments_returned)
    values (linked_scene.scene_id, new.user_id, 'participant', 'active', coalesce(new.checked_in_at, now()), 1, case when prior_count > 0 then 1 else 0 end)
    on conflict (scene_id, user_id, relationship) do update set
      membership_state = 'active',
      last_seen_at = excluded.last_seen_at,
      moments_joined = public.scene_memberships.moments_joined + 1,
      moments_returned = public.scene_memberships.moments_returned + case when prior_count > 0 then 1 else 0 end,
      updated_at = now();

    insert into public.social_return_events (user_id, scene_id, moment_id, source_type, source_id, return_type, metadata)
    values (new.user_id, linked_scene.scene_id, new.moment_id, 'moment_participation', new.id::text, 'showed_up', jsonb_build_object('status', new.status))
    on conflict do nothing;

    if prior_count > 0 then
      insert into public.social_return_events (user_id, scene_id, moment_id, source_type, source_id, return_type)
      values (new.user_id, linked_scene.scene_id, new.moment_id, 'moment_return', new.id::text, 'returned')
      on conflict do nothing;
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_record_scene_return_from_participation on public.moment_participants;
create trigger trg_record_scene_return_from_participation
after insert or update of status, checked_in_at on public.moment_participants
for each row execute function public.record_scene_return_from_participation();

create or replace function public.record_return_from_memory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_scene_id uuid;
begin
  select scene_id into linked_scene_id from public.moment_scene_links where moment_id = new.moment_id order by case relationship when 'origin' then 0 else 1 end limit 1;
  insert into public.social_return_events (user_id, scene_id, moment_id, source_type, source_id, return_type, metadata)
  values (new.user_id, linked_scene_id, new.moment_id, 'memory', new.id::text, 'memory_kept', jsonb_build_object('title', new.title, 'rarity', new.rarity))
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_record_return_from_memory on public.memories;
create trigger trg_record_return_from_memory after insert on public.memories for each row execute function public.record_return_from_memory();

create or replace function public.record_return_from_impact_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_scene_id uuid;
begin
  select scene_id into linked_scene_id from public.moment_scene_links where moment_id = new.moment_id order by case relationship when 'origin' then 0 else 1 end limit 1;
  insert into public.social_return_events (user_id, scene_id, moment_id, source_user_id, source_type, source_id, return_type, metadata)
  values (new.source_user_id, linked_scene_id, new.moment_id, new.downstream_user_id, 'impact_event', new.id::text, 'story_moved_person', coalesce(new.metadata, '{}'::jsonb) || jsonb_build_object('event_type', new.event_type))
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_record_return_from_impact_event on public.impact_events;
create trigger trg_record_return_from_impact_event after insert on public.impact_events for each row execute function public.record_return_from_impact_event();
