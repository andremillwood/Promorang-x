-- Capability-based platform administration foundation.
-- UI visibility remains advisory; backend middleware and database grants are
-- authoritative. Authorization records are intentionally not exposed to anon
-- or authenticated Data API roles.

alter type public.user_role add value if not exists 'support';

alter table public.user_roles drop constraint if exists user_roles_role_check;
alter table public.user_roles
  add constraint user_roles_role_check
  check (
    role::text in (
      'participant', 'creator', 'host', 'brand', 'merchant', 'agency',
      'promoter', 'marketing', 'support', 'moderator', 'admin', 'master_admin'
    )
  );

create table if not exists public.admin_capabilities (
  capability text primary key,
  display_name text not null,
  description text not null,
  risk_level text not null default 'standard'
    check (risk_level in ('standard', 'sensitive', 'critical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_role_capabilities (
  role text not null,
  capability text not null references public.admin_capabilities(capability) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role, capability),
  check (role in ('support', 'support_agent', 'moderator', 'admin', 'administrator', 'platform_admin', 'master_admin'))
);

create table if not exists public.admin_user_capability_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  capability text not null references public.admin_capabilities(capability) on delete restrict,
  scope jsonb not null default '{}'::jsonb,
  reason text not null check (length(trim(reason)) >= 3),
  granted_by uuid not null references auth.users(id) on delete restrict,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete restrict,
  revoke_reason text,
  check (expires_at is null or expires_at > granted_at),
  check (
    (revoked_at is null and revoked_by is null and revoke_reason is null)
    or
    (revoked_at is not null and revoked_by is not null and length(trim(revoke_reason)) >= 3)
  )
);

create index if not exists admin_capability_grants_active_user_idx
  on public.admin_user_capability_grants(user_id, capability)
  where revoked_at is null;

alter table public.admin_capabilities enable row level security;
alter table public.admin_role_capabilities enable row level security;
alter table public.admin_user_capability_grants enable row level security;

revoke all on table public.admin_capabilities from anon, authenticated;
revoke all on table public.admin_role_capabilities from anon, authenticated;
revoke all on table public.admin_user_capability_grants from anon, authenticated;

grant select, insert, update, delete on table public.admin_capabilities to service_role;
grant select, insert, update, delete on table public.admin_role_capabilities to service_role;
grant select, insert, update, delete on table public.admin_user_capability_grants to service_role;

insert into public.admin_capabilities(capability, display_name, description, risk_level)
values
  ('admin_access.manage', 'Manage admin access', 'Invite, change, and revoke platform administrator access.', 'critical'),
  ('audit.read', 'Read admin activity', 'Review important actions taken by platform administrators.', 'critical'),
  ('users.read', 'View people', 'Find accounts and view the context required for support.', 'standard'),
  ('users.restrict', 'Restrict accounts', 'Suspend or restore a person account according to policy.', 'sensitive'),
  ('support.read', 'View support cases', 'Read support cases and their relevant account context.', 'standard'),
  ('support.respond', 'Respond to support', 'Reply to and progress support cases.', 'standard'),
  ('identity.read', 'View identity checks', 'View identity-check status and submitted evidence.', 'sensitive'),
  ('identity.review', 'Decide identity checks', 'Approve or reject an identity check according to policy.', 'sensitive'),
  ('content.review', 'Review content', 'Approve, reject, or escalate submitted content.', 'sensitive'),
  ('proof.review', 'Review evidence', 'Approve, reject, or escalate participation evidence.', 'sensitive'),
  ('applications.review', 'Review applications', 'Review applications to operate platform experiences.', 'sensitive'),
  ('moments.read', 'View Moments', 'View Moments, venues, and operational context.', 'standard'),
  ('moments.manage', 'Manage Moments', 'Create and change platform-managed Moments and venues.', 'sensitive'),
  ('campaigns.manage', 'Manage Activations', 'Configure and launch platform-managed Activations.', 'sensitive'),
  ('catalog.read', 'View catalog', 'View catalog items and offers.', 'standard'),
  ('catalog.manage', 'Manage catalog', 'Create, change, or remove catalog items and offers.', 'sensitive'),
  ('orders.read', 'View orders', 'View orders, redemptions, and related support context.', 'sensitive'),
  ('orders.manage', 'Manage orders', 'Resolve order, redemption, and commerce exceptions.', 'sensitive'),
  ('broadcasts.manage', 'Send announcements', 'Create and send approved platform announcements.', 'critical'),
  ('reports.read', 'View reports', 'View platform growth, activity, and outcome reporting.', 'standard'),
  ('operations.read', 'View operations', 'View active work, queues, and service exceptions.', 'standard'),
  ('payouts.read', 'View payouts', 'View pending and completed payout obligations.', 'sensitive'),
  ('payouts.approve', 'Approve payouts', 'Approve or reject movement of money owed.', 'critical'),
  ('economy.read', 'View rewards and balances', 'View issued, committed, available, and settled value.', 'sensitive'),
  ('economy.manage', 'Manage rewards and balances', 'Change balance or value-system configuration.', 'critical'),
  ('access_rules.manage', 'Manage participation rules', 'Change who can view, join, claim, or redeem.', 'critical'),
  ('system_config.manage', 'Manage platform settings', 'Change owner-only platform behavior and safeguards.', 'critical')
on conflict (capability) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  risk_level = excluded.risk_level,
  updated_at = now();

with role_grants(role, capability) as (
  values
    ('support', 'users.read'), ('support', 'support.read'), ('support', 'support.respond'),
    ('support', 'identity.read'), ('support', 'catalog.read'), ('support', 'orders.read'),
    ('support_agent', 'users.read'), ('support_agent', 'support.read'), ('support_agent', 'support.respond'),
    ('support_agent', 'identity.read'), ('support_agent', 'catalog.read'), ('support_agent', 'orders.read'),
    ('moderator', 'users.read'), ('moderator', 'support.read'), ('moderator', 'support.respond'),
    ('moderator', 'identity.read'), ('moderator', 'catalog.read'), ('moderator', 'orders.read'),
    ('moderator', 'identity.review'), ('moderator', 'content.review'), ('moderator', 'proof.review'),
    ('moderator', 'applications.review'), ('moderator', 'moments.read'), ('moderator', 'operations.read'),
    ('admin', 'users.read'), ('admin', 'support.read'), ('admin', 'support.respond'),
    ('admin', 'identity.read'), ('admin', 'catalog.read'), ('admin', 'orders.read'),
    ('admin', 'identity.review'), ('admin', 'content.review'), ('admin', 'proof.review'),
    ('admin', 'applications.review'), ('admin', 'moments.read'), ('admin', 'operations.read'),
    ('admin', 'users.restrict'), ('admin', 'moments.manage'), ('admin', 'campaigns.manage'),
    ('admin', 'catalog.manage'), ('admin', 'orders.manage'), ('admin', 'broadcasts.manage'),
    ('admin', 'reports.read'), ('admin', 'payouts.read'), ('admin', 'economy.read'),
    ('administrator', 'users.read'), ('administrator', 'support.read'), ('administrator', 'support.respond'),
    ('administrator', 'identity.read'), ('administrator', 'catalog.read'), ('administrator', 'orders.read'),
    ('administrator', 'identity.review'), ('administrator', 'content.review'), ('administrator', 'proof.review'),
    ('administrator', 'applications.review'), ('administrator', 'moments.read'), ('administrator', 'operations.read'),
    ('administrator', 'users.restrict'), ('administrator', 'moments.manage'), ('administrator', 'campaigns.manage'),
    ('administrator', 'catalog.manage'), ('administrator', 'orders.manage'), ('administrator', 'broadcasts.manage'),
    ('administrator', 'reports.read'), ('administrator', 'payouts.read'), ('administrator', 'economy.read'),
    ('platform_admin', 'users.read'), ('platform_admin', 'support.read'), ('platform_admin', 'support.respond'),
    ('platform_admin', 'identity.read'), ('platform_admin', 'catalog.read'), ('platform_admin', 'orders.read'),
    ('platform_admin', 'identity.review'), ('platform_admin', 'content.review'), ('platform_admin', 'proof.review'),
    ('platform_admin', 'applications.review'), ('platform_admin', 'moments.read'), ('platform_admin', 'operations.read'),
    ('platform_admin', 'users.restrict'), ('platform_admin', 'moments.manage'), ('platform_admin', 'campaigns.manage'),
    ('platform_admin', 'catalog.manage'), ('platform_admin', 'orders.manage'), ('platform_admin', 'broadcasts.manage'),
    ('platform_admin', 'reports.read'), ('platform_admin', 'payouts.read'), ('platform_admin', 'economy.read')
)
insert into public.admin_role_capabilities(role, capability)
select role, capability from role_grants
on conflict (role, capability) do nothing;

insert into public.admin_role_capabilities(role, capability)
select 'master_admin', capability from public.admin_capabilities
on conflict (role, capability) do nothing;

create schema if not exists private;

create or replace function private.protect_final_platform_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role::text = 'master_admin'
     and (tg_op = 'DELETE' or new.role::text <> 'master_admin')
     and not exists (
       select 1
       from public.user_roles
       where role::text = 'master_admin'
         and id <> old.id
     )
  then
    raise exception 'The final Platform Owner cannot be removed';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function private.protect_final_platform_owner() from public;

drop trigger if exists protect_final_platform_owner on public.user_roles;
create trigger protect_final_platform_owner
before update of role or delete on public.user_roles
for each row
execute function private.protect_final_platform_owner();

create or replace function public.set_platform_admin_role(
  p_actor_id uuid,
  p_user_id uuid,
  p_role text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := nullif(lower(trim(p_role)), 'none');
begin
  if not exists (
    select 1 from public.user_roles
    where user_id = p_actor_id and role::text = 'master_admin'
  ) then
    raise exception 'Platform Owner access required';
  end if;
  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'The selected person does not exist';
  end if;
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A clear reason is required';
  end if;
  if v_role is not null and v_role not in ('support', 'moderator', 'admin', 'master_admin') then
    raise exception 'Unsupported platform admin role';
  end if;

  delete from public.user_roles
  where user_id = p_user_id
    and role::text in ('support', 'moderator', 'admin', 'master_admin')
    and role::text is distinct from v_role;

  if v_role is not null then
    insert into public.user_roles(user_id, role)
    values (p_user_id, v_role::public.user_role)
    on conflict (user_id, role) do nothing;
  end if;

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, reason, metadata)
  values (
    p_actor_id,
    case when v_role is null then 'admin_access.revoked' else 'admin_access.role_changed' end,
    'user',
    p_user_id::text,
    trim(p_reason),
    jsonb_build_object('role', coalesce(v_role, 'none'))
  );

  return jsonb_build_object('user_id', p_user_id, 'role', coalesce(v_role, 'none'));
end;
$$;

create or replace function public.grant_admin_capability(
  p_actor_id uuid,
  p_user_id uuid,
  p_capability text,
  p_reason text,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_grant_id uuid;
begin
  if not exists (
    select 1 from public.user_roles
    where user_id = p_actor_id and role::text = 'master_admin'
  ) then
    raise exception 'Platform Owner access required';
  end if;
  if not exists (select 1 from public.admin_capabilities where capability = p_capability) then
    raise exception 'Unknown admin capability';
  end if;
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A clear reason is required';
  end if;
  if p_expires_at is null or p_expires_at <= now() then
    raise exception 'Temporary access requires a future expiry';
  end if;

  insert into public.admin_user_capability_grants(
    user_id, capability, reason, granted_by, expires_at
  ) values (
    p_user_id, p_capability, trim(p_reason), p_actor_id, p_expires_at
  ) returning id into v_grant_id;

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, reason, metadata)
  values (
    p_actor_id, 'admin_access.capability_granted', 'admin_capability_grant',
    v_grant_id::text, trim(p_reason),
    jsonb_build_object('user_id', p_user_id, 'capability', p_capability, 'expires_at', p_expires_at)
  );

  return v_grant_id;
end;
$$;

create or replace function public.revoke_admin_capability(
  p_actor_id uuid,
  p_grant_id uuid,
  p_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_grant public.admin_user_capability_grants%rowtype;
begin
  if not exists (
    select 1 from public.user_roles
    where user_id = p_actor_id and role::text = 'master_admin'
  ) then
    raise exception 'Platform Owner access required';
  end if;
  if length(trim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A clear reason is required';
  end if;

  update public.admin_user_capability_grants
  set revoked_at = now(), revoked_by = p_actor_id, revoke_reason = trim(p_reason)
  where id = p_grant_id and revoked_at is null
  returning * into v_grant;

  if v_grant.id is null then
    raise exception 'Active capability grant not found';
  end if;

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, reason, metadata)
  values (
    p_actor_id, 'admin_access.capability_revoked', 'admin_capability_grant',
    p_grant_id::text, trim(p_reason),
    jsonb_build_object('user_id', v_grant.user_id, 'capability', v_grant.capability)
  );

  return true;
end;
$$;

revoke all on function public.set_platform_admin_role(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.grant_admin_capability(uuid, uuid, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.revoke_admin_capability(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.set_platform_admin_role(uuid, uuid, text, text) to service_role;
grant execute on function public.grant_admin_capability(uuid, uuid, text, text, timestamptz) to service_role;
grant execute on function public.revoke_admin_capability(uuid, uuid, text) to service_role;

notify pgrst, 'reload schema';
