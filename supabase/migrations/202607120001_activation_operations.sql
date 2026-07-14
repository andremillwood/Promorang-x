-- Operational activation layer: real Scenes, stakeholder invitations,
-- content responsibilities, contributions, lifecycle history, and return capture.

create extension if not exists pgcrypto;

alter table public.proposals
  add column if not exists scene_id uuid references public.scenes(id) on delete set null,
  add column if not exists lifecycle_state text not null default 'shaping',
  add column if not exists launched_at timestamptz,
  add column if not exists completed_at timestamptz;

alter table public.proposals drop constraint if exists proposals_lifecycle_state_check;
alter table public.proposals add constraint proposals_lifecycle_state_check check (lifecycle_state in (
  'shaping', 'inviting', 'awaiting_responses', 'aligned', 'funding',
  'funded', 'live', 'completed', 'reviewed', 'paused', 'cancelled'
));

create table if not exists public.activation_collaborators (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  role text not null check (role in ('host', 'creator', 'venue', 'merchant', 'brand', 'agency', 'scene_lead', 'supporter')),
  invited_user_id uuid references auth.users(id) on delete set null,
  invited_organization_id uuid references public.organizations(id) on delete set null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  display_name text,
  responsibility text,
  response_message text,
  status text not null default 'invited' check (status in ('suggested', 'invited', 'viewed', 'accepted', 'declined', 'changes_requested', 'removed')),
  invited_at timestamptz not null default now(),
  responded_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (invited_user_id is not null or invited_organization_id is not null or display_name is not null)
);

create unique index if not exists uq_activation_collaborator_user
  on public.activation_collaborators(proposal_id, role, invited_user_id)
  where invited_user_id is not null and status <> 'removed';
create unique index if not exists uq_activation_collaborator_org
  on public.activation_collaborators(proposal_id, role, invited_organization_id)
  where invited_organization_id is not null and status <> 'removed';

create table if not exists public.activation_content_assignments (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  moment_id uuid references public.moments(id) on delete set null,
  collaborator_id uuid references public.activation_collaborators(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  phase text not null check (phase in ('invite', 'before', 'live', 'after', 'evergreen')),
  title text not null,
  direction text not null,
  format text,
  destination text,
  due_at timestamptz,
  compensation_amount numeric(14,2),
  currency text not null default 'JMD',
  rights_summary text,
  status text not null default 'open' check (status in ('open', 'assigned', 'accepted', 'in_progress', 'submitted', 'approved', 'published', 'declined', 'cancelled')),
  submission_url text,
  published_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activation_contributions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  collaborator_id uuid references public.activation_collaborators(id) on delete set null,
  contributor_user_id uuid references auth.users(id) on delete set null,
  contributor_organization_id uuid references public.organizations(id) on delete set null,
  contribution_type text not null check (contribution_type in ('cash', 'venue', 'product', 'service', 'access', 'media', 'talent', 'reward', 'transport', 'other')),
  description text not null,
  amount numeric(14,2),
  currency text not null default 'JMD',
  status text not null default 'offered' check (status in ('offered', 'requested', 'committed', 'received', 'fulfilled', 'declined', 'cancelled')),
  due_at timestamptz,
  fulfilled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activation_status_history (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  changed_by uuid references auth.users(id) on delete set null,
  from_state text,
  to_state text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_proposals_scene on public.proposals(scene_id, created_at desc);
create index if not exists idx_activation_collaborators_proposal on public.activation_collaborators(proposal_id, status, role);
create index if not exists idx_activation_collaborators_user on public.activation_collaborators(invited_user_id, status, invited_at desc);
create index if not exists idx_activation_content_proposal on public.activation_content_assignments(proposal_id, phase, status);
create index if not exists idx_activation_content_owner on public.activation_content_assignments(owner_user_id, status, due_at);
create index if not exists idx_activation_contributions_proposal on public.activation_contributions(proposal_id, status);
create index if not exists idx_activation_history_proposal on public.activation_status_history(proposal_id, created_at desc);

create or replace function public.can_manage_activation(p_proposal_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.proposals p
    where p.id = p_proposal_id and (
      p.planner_id = auth.uid()
      or exists (select 1 from public.organization_members om where om.organization_id = p.brand_id and om.user_id = auth.uid())
      or exists (select 1 from public.activation_collaborators ac where ac.proposal_id = p.id and ac.invited_user_id = auth.uid() and ac.status = 'accepted' and ac.role in ('host','brand','agency','scene_lead'))
    )
  );
$$;

create or replace function public.respond_to_activation_invitation(
  p_collaborator_id uuid, p_response text, p_message text default null
) returns public.activation_collaborators
language plpgsql security definer set search_path = public as $$
declare v_row public.activation_collaborators%rowtype;
begin
  if p_response not in ('accepted', 'declined', 'changes_requested') then raise exception 'Invalid response'; end if;
  update public.activation_collaborators
  set status = p_response, response_message = p_message, responded_at = now(), updated_at = now()
  where id = p_collaborator_id and (
    invited_user_id = auth.uid()
    or exists (select 1 from public.organization_members om where om.organization_id = invited_organization_id and om.user_id = auth.uid())
  ) returning * into v_row;
  if not found then raise exception 'Invitation not available'; end if;
  return v_row;
end $$;

create or replace function public.move_activation(
  p_proposal_id uuid, p_to_state text, p_note text default null
) returns public.proposals
language plpgsql security definer set search_path = public as $$
declare v_row public.proposals%rowtype; v_from text;
begin
  if not public.can_manage_activation(p_proposal_id) then raise exception 'Not authorized to move this activation'; end if;
  if p_to_state not in ('shaping','inviting','awaiting_responses','aligned','funding','funded','live','completed','reviewed','paused','cancelled') then raise exception 'Invalid activation state'; end if;
  select lifecycle_state into v_from from public.proposals where id = p_proposal_id for update;
  update public.proposals set lifecycle_state = p_to_state, updated_at = now(),
    launched_at = case when p_to_state = 'live' then coalesce(launched_at, now()) else launched_at end,
    completed_at = case when p_to_state = 'completed' then coalesce(completed_at, now()) else completed_at end
  where id = p_proposal_id returning * into v_row;
  insert into public.activation_status_history(proposal_id, changed_by, from_state, to_state, note)
    values (p_proposal_id, auth.uid(), v_from, p_to_state, p_note);
  return v_row;
end $$;

create or replace function public.link_activation_scene(
  p_proposal_id uuid, p_scene_id uuid
) returns public.proposals
language plpgsql security definer set search_path = public as $$
declare v_row public.proposals%rowtype;
begin
  if not public.can_manage_activation(p_proposal_id) then raise exception 'Not authorized to link this Scene'; end if;
  if not exists (select 1 from public.scenes where id = p_scene_id and (visibility = 'public' or owner_user_id = auth.uid())) then raise exception 'Scene not available'; end if;
  update public.proposals set scene_id = p_scene_id, updated_at = now() where id = p_proposal_id returning * into v_row;
  if v_row.target_moment_id is not null then
    insert into public.moment_scene_links(moment_id, scene_id, relationship)
      values(v_row.target_moment_id, p_scene_id, 'origin') on conflict do nothing;
  end if;
  return v_row;
end $$;

create or replace function public.link_activation_moment(
  p_proposal_id uuid, p_moment_id uuid
) returns public.proposals
language plpgsql security definer set search_path = public as $$
declare v_row public.proposals%rowtype;
begin
  if not public.can_manage_activation(p_proposal_id) then raise exception 'Not authorized to link this Moment'; end if;
  if not exists (select 1 from public.moments where id = p_moment_id and host_id = auth.uid()) then raise exception 'Only a Moment you host can be connected'; end if;
  update public.proposals set target_moment_id = p_moment_id, updated_at = now() where id = p_proposal_id returning * into v_row;
  if v_row.scene_id is not null then
    insert into public.moment_scene_links(moment_id, scene_id, relationship)
      values(p_moment_id, v_row.scene_id, 'origin') on conflict do nothing;
  end if;
  return v_row;
end $$;

alter table public.activation_collaborators enable row level security;
alter table public.activation_content_assignments enable row level security;
alter table public.activation_contributions enable row level security;
alter table public.activation_status_history enable row level security;

drop policy if exists "Stakeholders read activation collaborators" on public.activation_collaborators;
create policy "Stakeholders read activation collaborators" on public.activation_collaborators for select using (
  public.can_manage_activation(proposal_id) or invited_user_id = auth.uid()
  or exists (select 1 from public.organization_members om where om.organization_id = invited_organization_id and om.user_id = auth.uid())
);
drop policy if exists "Managers create activation collaborators" on public.activation_collaborators;
create policy "Managers create activation collaborators" on public.activation_collaborators for insert with check (public.can_manage_activation(proposal_id) and invited_by = auth.uid());
drop policy if exists "Managers update activation collaborators" on public.activation_collaborators;
create policy "Managers update activation collaborators" on public.activation_collaborators for update using (public.can_manage_activation(proposal_id));

drop policy if exists "Stakeholders read activation content" on public.activation_content_assignments;
create policy "Stakeholders read activation content" on public.activation_content_assignments for select using (public.can_manage_activation(proposal_id) or owner_user_id = auth.uid());
drop policy if exists "Managers create activation content" on public.activation_content_assignments;
create policy "Managers create activation content" on public.activation_content_assignments for insert with check (public.can_manage_activation(proposal_id));
drop policy if exists "Managers or owners update activation content" on public.activation_content_assignments;
create policy "Managers or owners update activation content" on public.activation_content_assignments for update using (public.can_manage_activation(proposal_id) or owner_user_id = auth.uid());

drop policy if exists "Stakeholders read activation contributions" on public.activation_contributions;
create policy "Stakeholders read activation contributions" on public.activation_contributions for select using (
  public.can_manage_activation(proposal_id) or contributor_user_id = auth.uid()
  or exists (select 1 from public.organization_members om where om.organization_id = contributor_organization_id and om.user_id = auth.uid())
);
drop policy if exists "Stakeholders create activation contributions" on public.activation_contributions;
create policy "Stakeholders create activation contributions" on public.activation_contributions for insert with check (public.can_manage_activation(proposal_id) or contributor_user_id = auth.uid());
drop policy if exists "Stakeholders update activation contributions" on public.activation_contributions;
create policy "Stakeholders update activation contributions" on public.activation_contributions for update using (public.can_manage_activation(proposal_id) or contributor_user_id = auth.uid());

drop policy if exists "Stakeholders read activation history" on public.activation_status_history;
create policy "Stakeholders read activation history" on public.activation_status_history for select using (public.can_manage_activation(proposal_id));

drop policy if exists "Planners and brands read proposals" on public.proposals;
create policy "Activation stakeholders read proposals" on public.proposals for select using (
  planner_id = auth.uid()
  or exists (select 1 from public.organization_members om where om.organization_id = brand_id and om.user_id = auth.uid())
  or exists (select 1 from public.activation_collaborators ac where ac.proposal_id = id and ac.invited_user_id = auth.uid())
);

grant execute on function public.can_manage_activation(uuid) to authenticated;
grant execute on function public.respond_to_activation_invitation(uuid, text, text) to authenticated;
grant execute on function public.move_activation(uuid, text, text) to authenticated;
grant execute on function public.link_activation_scene(uuid, uuid) to authenticated;
grant execute on function public.link_activation_moment(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
