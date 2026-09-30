-- Community control room, open participation, product-led network pilot, and
-- first-party Business Engine foundation.
--
-- This migration deliberately keeps browser roles away from these tables. The
-- API authenticates the caller, then uses the service role to call narrowly
-- scoped operations. Network compensation remains a ledger/event workflow;
-- this migration does not create an automatic payout or an income promise.

alter table public.community_memberships
  add column if not exists member_kind text;

update public.community_memberships
set member_kind = 'participant'
where member_kind is null;

alter table public.community_memberships
  alter column member_kind set default 'participant',
  alter column member_kind set not null;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'community_memberships_member_kind_check'
      and conrelid = 'public.community_memberships'::regclass
  ) then
    alter table public.community_memberships
      add constraint community_memberships_member_kind_check
      check (member_kind in ('participant', 'builder'));
  end if;
end $$;

create table if not exists public.community_program_settings (
  id smallint primary key default 1 check (id = 1),
  participant_access_enabled boolean not null default true,
  matrix_program_enabled boolean not null default false,
  business_engine_enabled boolean not null default true,
  matrix_mode text not null default 'pilot'
    check (matrix_mode in ('pilot', 'active', 'paused')),
  updated_by uuid references public.users(id),
  updated_at timestamptz not null default now()
);

insert into public.community_program_settings(id)
values (1)
on conflict (id) do nothing;

create table if not exists public.community_network_plans (
  plan_key text primary key,
  name text not null,
  description text not null,
  monthly_fee_cents integer not null default 0 check (monthly_fee_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'draft'
    check (status in ('draft', 'available', 'retired')),
  features jsonb not null default '[]'::jsonb,
  requires_disclosure boolean not null default true,
  requires_legal_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.community_network_plans
  (plan_key, name, description, monthly_fee_cents, status, features)
values
  ('participant', 'Community participant',
    'Join the General Room, shared sessions, public community moves, and Moments without joining the business-builder track.',
    0, 'available', '["General Room", "Community rhythm", "Public moves", "PromoCard-connected access"]'::jsonb),
  ('builder', 'Business Builder (pilot)',
    'A product-led track for members who want business tools, approved offers, training, and verified commercial activity.',
    9900, 'draft', '["Business Engine pilot", "Offer and campaign training", "Product-led network pilot", "Verified activity records"]'::jsonb),
  ('studio', 'Business Studio (pilot)',
    'A future higher-capacity workspace for operators managing multiple funnels, collaborators, and customer pipelines.',
    19900, 'draft', '["Multiple workspaces", "Advanced automation", "Team seats", "Operator reporting"]'::jsonb)
on conflict (plan_key) do nothing;

create table if not exists public.community_network_enrollments (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.community_spaces(id) on delete cascade,
  membership_id uuid not null references public.community_memberships(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  sponsor_user_id uuid references public.users(id) on delete set null,
  plan_key text not null references public.community_network_plans(plan_key),
  status text not null default 'interest'
    check (status in ('interest', 'pending', 'active', 'paused', 'withdrawn')),
  joined_at timestamptz not null default now(),
  activated_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (space_id, user_id),
  check (sponsor_user_id is null or sponsor_user_id <> user_id)
);

create table if not exists public.community_network_events (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.community_network_enrollments(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'customer_sale', 'campaign_delivery', 'affiliate_sale', 'support_action',
    'referral_conversion', 'training_complete', 'community_contribution'
  )),
  source_ref text,
  value_cents integer not null default 0 check (value_cents >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'paid', 'void')),
  notes text,
  verified_by uuid references public.users(id) on delete set null,
  verified_at timestamptz,
  idempotency_key text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.community_engine_workspaces (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.community_memberships(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  plan_key text not null default 'participant'
    references public.community_network_plans(plan_key),
  status text not null default 'pilot' check (status in ('pilot', 'active', 'paused')),
  timezone text not null default 'America/Jamaica',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

create table if not exists public.community_engine_stages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.community_engine_workspaces(id) on delete cascade,
  stage_key text not null,
  name text not null,
  sort_order integer not null default 0,
  color text not null default 'slate',
  is_won boolean not null default false,
  is_lost boolean not null default false,
  unique (workspace_id, stage_key)
);

create table if not exists public.community_engine_contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.community_engine_workspaces(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  display_name text not null,
  email text,
  phone text,
  organization text,
  source text not null default 'manual',
  lifecycle_stage text not null default 'new',
  consent_status text not null default 'unknown'
    check (consent_status in ('unknown', 'operational', 'marketing')),
  next_action_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_engine_deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.community_engine_workspaces(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  contact_id uuid references public.community_engine_contacts(id) on delete set null,
  stage_id uuid not null references public.community_engine_stages(id) on delete restrict,
  title text not null,
  value_cents integer not null default 0 check (value_cents >= 0),
  source text not null default 'manual',
  expected_close_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_engine_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.community_engine_workspaces(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  contact_id uuid references public.community_engine_contacts(id) on delete set null,
  deal_id uuid references public.community_engine_deals(id) on delete set null,
  title text not null,
  status text not null default 'open' check (status in ('open', 'complete', 'snoozed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.community_engine_automations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.community_engine_workspaces(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  trigger_key text not null,
  action_key text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  config jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_engine_forms (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.community_engine_workspaces(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  slug text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  fields jsonb not null default '[]'::jsonb,
  submission_count integer not null default 0 check (submission_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

-- Keep operational timestamps truthful when records change outside the API.
create or replace function public.community_touch_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

revoke all on function public.community_touch_updated_at() from public, anon, authenticated;
grant execute on function public.community_touch_updated_at() to service_role;

drop trigger if exists community_program_settings_updated_at on public.community_program_settings;
create trigger community_program_settings_updated_at before update on public.community_program_settings
for each row execute function public.community_touch_updated_at();
drop trigger if exists community_network_plans_updated_at on public.community_network_plans;
create trigger community_network_plans_updated_at before update on public.community_network_plans
for each row execute function public.community_touch_updated_at();
drop trigger if exists community_network_enrollments_updated_at on public.community_network_enrollments;
create trigger community_network_enrollments_updated_at before update on public.community_network_enrollments
for each row execute function public.community_touch_updated_at();
drop trigger if exists community_engine_workspaces_updated_at on public.community_engine_workspaces;
create trigger community_engine_workspaces_updated_at before update on public.community_engine_workspaces
for each row execute function public.community_touch_updated_at();
drop trigger if exists community_engine_contacts_updated_at on public.community_engine_contacts;
create trigger community_engine_contacts_updated_at before update on public.community_engine_contacts
for each row execute function public.community_touch_updated_at();
drop trigger if exists community_engine_deals_updated_at on public.community_engine_deals;
create trigger community_engine_deals_updated_at before update on public.community_engine_deals
for each row execute function public.community_touch_updated_at();
drop trigger if exists community_engine_automations_updated_at on public.community_engine_automations;
create trigger community_engine_automations_updated_at before update on public.community_engine_automations
for each row execute function public.community_touch_updated_at();
drop trigger if exists community_engine_forms_updated_at on public.community_engine_forms;
create trigger community_engine_forms_updated_at before update on public.community_engine_forms
for each row execute function public.community_touch_updated_at();

create index if not exists idx_community_memberships_kind
  on public.community_memberships(space_id, member_kind, status);
create index if not exists idx_community_network_enrollments_status
  on public.community_network_enrollments(space_id, status, updated_at desc);
create index if not exists idx_community_network_events_status
  on public.community_network_events(enrollment_id, status, created_at desc);
create index if not exists idx_community_engine_contacts_workspace
  on public.community_engine_contacts(workspace_id, lifecycle_stage, updated_at desc);
create index if not exists idx_community_engine_deals_workspace
  on public.community_engine_deals(workspace_id, stage_id, updated_at desc);
create index if not exists idx_community_engine_tasks_owner
  on public.community_engine_tasks(owner_id, status, due_at);
create index if not exists idx_community_engine_automations_workspace
  on public.community_engine_automations(workspace_id, status);

do $$ declare t text; begin
  foreach t in array array[
    'community_program_settings', 'community_network_plans', 'community_network_enrollments',
    'community_network_events', 'community_engine_workspaces', 'community_engine_stages',
    'community_engine_contacts', 'community_engine_deals', 'community_engine_tasks',
    'community_engine_automations', 'community_engine_forms'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant all on table public.%I to service_role', t);
  end loop;
end $$;

create or replace function public.community_join(
  p_actor uuid, p_display_name text, p_career_path text, p_personal_goal text
)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_space uuid := 'b8ca4dba-f067-4daf-9206-b2908ff7aa11';
  m public.community_memberships%rowtype;
begin
  if not exists (
    select 1 from public.community_program_settings
    where id = 1 and participant_access_enabled
  ) then
    raise exception 'Participant access is temporarily closed' using errcode = '42501';
  end if;

  select * into m from public.community_memberships
  where space_id = v_space and user_id = p_actor for update;

  if found then
    if m.status in ('removed', 'paused') then
      raise exception 'A community lead must restore this membership' using errcode = '42501';
    end if;
    if m.status = 'active' then return to_jsonb(m); end if;

    update public.community_memberships
    set status = 'active', member_kind = 'participant', tier = 'free',
      display_name = left(trim(p_display_name), 120),
      career_path = left(trim(p_career_path), 120),
      personal_goal = left(trim(p_personal_goal), 1000),
      joined_at = coalesce(joined_at, now())
    where id = m.id
    returning * into m;
  else
    insert into public.community_memberships(
      space_id, user_id, status, tier, member_kind, display_name,
      career_path, personal_goal, joined_at
    ) values (
      v_space, p_actor, 'active', 'free', 'participant',
      left(trim(p_display_name), 120), left(trim(p_career_path), 120),
      left(trim(p_personal_goal), 1000), now()
    ) returning * into m;
  end if;

  insert into public.community_audit(space_id, actor_id, action, record_id, detail)
  values (v_space, p_actor, 'join', m.id, jsonb_build_object('member_kind', 'participant'));
  return to_jsonb(m);
end $$;

create or replace function public.community_apply_builder(
  p_actor uuid, p_display_name text, p_career_path text, p_personal_goal text
)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_space uuid := 'b8ca4dba-f067-4daf-9206-b2908ff7aa11';
  m public.community_memberships%rowtype;
begin
  select * into m from public.community_memberships
  where space_id = v_space and user_id = p_actor for update;
  if found then
    -- A participant can ask for the Builder track without losing access to
    -- the General Room. The enrollment is the pending application; the
    -- membership becomes a builder only after an administrator activates it.
    if m.status = 'active' and m.member_kind = 'participant' then
      insert into public.community_network_enrollments(
        space_id, membership_id, user_id, plan_key, status
      ) values (
        v_space, m.id, p_actor, 'builder', 'pending'
      ) on conflict (space_id, user_id) do update
        set plan_key = 'builder',
            status = case when public.community_network_enrollments.status = 'active'
                          then public.community_network_enrollments.status else 'pending' end,
            updated_at = now();
      insert into public.community_audit(space_id, actor_id, action, record_id, detail)
      values (v_space, p_actor, 'apply_builder', m.id, jsonb_build_object('member_kind', 'participant', 'status', 'pending'));
      return to_jsonb(m) || jsonb_build_object('builder_application', 'pending');
    end if;
    if m.status = 'active' then return to_jsonb(m); end if;
    if m.status = 'removed' then
      raise exception 'A community lead must review this membership' using errcode = '42501';
    end if;
    update public.community_memberships
    set status = 'pending', member_kind = 'builder',
      display_name = left(trim(p_display_name), 120),
      career_path = left(trim(p_career_path), 120),
      personal_goal = left(trim(p_personal_goal), 1000)
    where id = m.id returning * into m;
  else
    insert into public.community_memberships(
      space_id, user_id, status, tier, member_kind, display_name,
      career_path, personal_goal
    ) values (
      v_space, p_actor, 'pending', 'free', 'builder',
      left(trim(p_display_name), 120), left(trim(p_career_path), 120),
      left(trim(p_personal_goal), 1000)
    ) returning * into m;
  end if;
  insert into public.community_audit(space_id, actor_id, action, record_id, detail)
  values (v_space, p_actor, 'apply_builder', m.id, jsonb_build_object('member_kind', 'builder'));
  return to_jsonb(m);
end $$;

revoke all on function public.community_join(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.community_apply_builder(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.community_join(uuid, text, text, text) to service_role;
grant execute on function public.community_apply_builder(uuid, text, text, text) to service_role;
