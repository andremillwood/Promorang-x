-- Keep organization membership and workspace capability aligned.
-- Organization member roles (owner/admin/manager/staff) describe authority
-- inside an organization; user_roles describes which Promorang workspace the
-- account can enter. Existing code can create these records independently, so
-- reconcile them additively without revoking explicit workspace grants.

insert into public.user_roles (user_id, role)
select distinct
  om.user_id,
  o.type::public.user_role
from public.organization_members om
join public.organizations o on o.id = om.organization_id
where o.type in ('brand', 'merchant', 'agency')
on conflict (user_id, role) do nothing;

create or replace function private.sync_organization_member_workspace_role()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $function$
declare
  v_type text;
begin
  select o.type
  into v_type
  from public.organizations o
  where o.id = new.organization_id;

  if v_type in ('brand', 'merchant', 'agency') then
    insert into public.user_roles (user_id, role)
    values (new.user_id, v_type::public.user_role)
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$function$;

revoke all on function private.sync_organization_member_workspace_role() from public, anon, authenticated;

drop trigger if exists trg_sync_organization_member_workspace_role on public.organization_members;
create trigger trg_sync_organization_member_workspace_role
after insert or update of organization_id, user_id on public.organization_members
for each row execute function private.sync_organization_member_workspace_role();

create or replace function private.sync_organization_type_workspace_roles()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $function$
begin
  if new.type in ('brand', 'merchant', 'agency')
     and new.type is distinct from old.type then
    insert into public.user_roles (user_id, role)
    select distinct om.user_id, new.type::public.user_role
    from public.organization_members om
    where om.organization_id = new.id
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$function$;

revoke all on function private.sync_organization_type_workspace_roles() from public, anon, authenticated;

drop trigger if exists trg_sync_organization_type_workspace_roles on public.organizations;
create trigger trg_sync_organization_type_workspace_roles
after update of type on public.organizations
for each row execute function private.sync_organization_type_workspace_roles();

comment on function private.sync_organization_member_workspace_role() is
  'Add the canonical brand/merchant/agency workspace role when organization membership is granted. Roles are not auto-revoked because user_roles has no provenance and may contain an independent explicit grant.';

comment on function private.sync_organization_type_workspace_roles() is
  'Add workspace roles for existing members if an organization changes to a canonical brand/merchant/agency type.';
