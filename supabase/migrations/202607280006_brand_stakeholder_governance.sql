-- Canonical brand workspace identity, provisioning, verification, and team governance.

alter table public.organizations
  add column if not exists owner_id uuid references auth.users(id) on delete set null,
  add column if not exists industry text,
  add column if not exists contact_email text,
  add column if not exists status text not null default 'active',
  add column if not exists claim_status text not null default 'unclaimed',
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references auth.users(id) on delete set null,
  add column if not exists verification_method text,
  add column if not exists ownership_claimed_at timestamptz,
  add column if not exists normalized_domain text;

alter table public.organizations drop constraint if exists organizations_status_check;
alter table public.organizations add constraint organizations_status_check
  check (status in ('active', 'suspended', 'archived'));
alter table public.organizations drop constraint if exists organizations_claim_status_check;
alter table public.organizations add constraint organizations_claim_status_check
  check (claim_status in ('unclaimed', 'pending', 'claimed', 'disputed'));
alter table public.organizations drop constraint if exists organizations_verification_status_check;
alter table public.organizations add constraint organizations_verification_status_check
  check (verification_status in ('unverified', 'pending', 'verified', 'rejected'));

update public.organizations
set contact_email = coalesce(contact_email, billing_email),
    owner_id = coalesce(owner_id, created_by),
    claim_status = case when owner_id is not null or created_by is not null then 'claimed' else claim_status end
where true;

create index if not exists idx_organizations_normalized_domain
  on public.organizations(normalized_domain) where normalized_domain is not null;
create index if not exists idx_organizations_claim_verification
  on public.organizations(type, claim_status, verification_status);

alter table public.campaigns
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;
create index if not exists idx_campaigns_organization_id on public.campaigns(organization_id);

create table if not exists public.brand_accounts (
  id bigserial primary key,
  brand_id uuid,
  organization_id uuid references public.organizations(id) on delete cascade,
  account_balance_usd numeric(12,2) not null default 0,
  total_spent_usd numeric(12,2) not null default 0,
  total_refunded_usd numeric(12,2) not null default 0,
  moments_created integer not null default 0,
  successful_moments integer not null default 0,
  sku_unlock_status jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.brand_accounts
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade;
create unique index if not exists idx_brand_accounts_organization_unique
  on public.brand_accounts(organization_id) where organization_id is not null;

create or replace function public.sync_brand_claim_state()
returns trigger
security definer
set search_path = public
as $sync_brand_claim_state$
begin
  if new.entity_type = 'brand' and new.status is distinct from old.status then
    update public.organizations
    set claim_status = case
          when new.status = 'requested' then 'pending'
          when new.status = 'approved' then 'claimed'
          when new.status in ('rejected', 'cancelled') then 'unclaimed'
          else claim_status end,
        verification_status = case when new.status = 'requested' then 'pending' else verification_status end,
        updated_at = now()
    where id = new.entity_id;
  end if;
  return new;
end;
$sync_brand_claim_state$
language plpgsql;

drop trigger if exists trg_sync_brand_claim_state on public.page_ownership_claims;
create trigger trg_sync_brand_claim_state
after update of status on public.page_ownership_claims
for each row execute function public.sync_brand_claim_state();

create or replace function public.organization_role_rank(p_organization_id uuid, p_user_id uuid)
returns integer
security definer
stable
set search_path = public
as $organization_role_rank$
  select coalesce(max(case om.role::text
    when 'owner' then 40 when 'admin' then 30 when 'manager' then 20 when 'staff' then 10 else 0 end), 0)
  from public.organization_members om
  where om.organization_id = p_organization_id and om.user_id = p_user_id;
$organization_role_rank$
language sql;

create or replace function public.can_manage_organization(
  p_organization_id uuid,
  p_minimum_role text default 'manager'
)
returns boolean
security definer
stable
set search_path = public
as $can_manage_organization$
  select public.organization_role_rank(p_organization_id, auth.uid()) >=
    case p_minimum_role when 'owner' then 40 when 'admin' then 30 when 'manager' then 20 else 10 end;
$can_manage_organization$
language sql;

alter table public.campaigns enable row level security;
drop policy if exists "Organization members view campaigns" on public.campaigns;
create policy "Organization members view campaigns" on public.campaigns for select to authenticated
using (
  brand_id = auth.uid()
  or exists (
    select 1 from public.organization_members om
    where om.organization_id = campaigns.organization_id and om.user_id = auth.uid()
  )
);
drop policy if exists "Organization managers create campaigns" on public.campaigns;
create policy "Organization managers create campaigns" on public.campaigns for insert to authenticated
with check (
  brand_id = auth.uid()
  and (
    organization_id is null
    or public.can_manage_organization(organization_id, 'manager')
  )
);
drop policy if exists "Organization managers update campaigns" on public.campaigns;
create policy "Organization managers update campaigns" on public.campaigns for update to authenticated
using (brand_id = auth.uid() or public.can_manage_organization(organization_id, 'manager'))
with check (brand_id = auth.uid() or public.can_manage_organization(organization_id, 'manager'));
drop policy if exists "Organization admins delete campaigns" on public.campaigns;
create policy "Organization admins delete campaigns" on public.campaigns for delete to authenticated
using (brand_id = auth.uid() or public.can_manage_organization(organization_id, 'admin'));

create or replace function public.create_organization_workspace(
  p_name text,
  p_type text,
  p_industry text default null,
  p_website text default null,
  p_contact_email text default null
)
returns jsonb
security definer
set search_path = public, auth
as $create_organization_workspace$
declare
  v_user uuid := auth.uid();
  v_name text := nullif(trim(p_name), '');
  v_slug text;
  v_domain text;
  v_org uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if v_name is null then raise exception 'Organization name is required'; end if;
  if p_type not in ('brand', 'merchant', 'agency') then raise exception 'Unsupported organization type'; end if;

  v_domain := nullif(lower(regexp_replace(coalesce(p_website, ''), '^https?://(www\\.)?|/.*$', '', 'g')), '');
  if exists (
    select 1 from public.organizations o
    where o.type = p_type and (
      lower(trim(o.name)) = lower(v_name)
      or (v_domain is not null and o.normalized_domain = v_domain)
    )
  ) then
    raise exception 'An organization with this name or website already exists. Request access or submit an ownership claim instead.';
  end if;

  v_slug := trim(both '-' from regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g'))
    || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);

  insert into public.organizations(
    name, slug, type, billing_email, contact_email, website, industry,
    created_by, owner_id, status, claim_status, verification_status, normalized_domain
  ) values (
    v_name, v_slug, p_type, coalesce(nullif(trim(p_contact_email), ''), auth.jwt()->>'email'),
    coalesce(nullif(trim(p_contact_email), ''), auth.jwt()->>'email'), nullif(trim(p_website), ''),
    nullif(trim(p_industry), ''), v_user, v_user, 'active', 'claimed', 'pending', v_domain
  ) returning id into v_org;

  insert into public.organization_members(organization_id, user_id, role)
  values (v_org, v_user, 'owner')
  on conflict (organization_id, user_id) do update set role = 'owner';

  insert into public.user_roles(user_id, role)
  values (v_user, p_type::public.user_role)
  on conflict (user_id, role) do nothing;

  if p_type = 'brand' then
    insert into public.brand_accounts(organization_id) values (v_org)
    on conflict (organization_id) where organization_id is not null do nothing;
  end if;

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, metadata)
  values (v_user, 'organization.created', p_type, v_org::text, jsonb_build_object('name', v_name));

  return jsonb_build_object('id', v_org, 'name', v_name, 'slug', v_slug, 'type', p_type);
end;
$create_organization_workspace$
language plpgsql;

create or replace function public.admin_review_page_ownership(
  p_claim_id uuid,
  p_decision text,
  p_review_note text default null,
  p_verification_method text default null
)
returns jsonb
security definer
set search_path = public, auth
as $admin_review_page_ownership_v2$
declare
  v_admin uuid := auth.uid();
  v_claim public.page_ownership_claims%rowtype;
begin
  if not public.is_claimable_page_admin(v_admin) then raise exception 'Admin access required'; end if;
  if p_decision not in ('approved', 'rejected') then raise exception 'Decision must be approved or rejected'; end if;
  if p_decision = 'rejected' and nullif(trim(p_review_note), '') is null then
    raise exception 'A rejection reason is required';
  end if;

  select * into v_claim from public.page_ownership_claims where id = p_claim_id for update;
  if v_claim.id is null or v_claim.status <> 'requested' then
    raise exception 'This ownership request is no longer awaiting review';
  end if;
  if v_claim.claimed_by is null then raise exception 'Claimant account is missing'; end if;

  if p_decision = 'approved' then
    if exists (
      select 1 from public.page_ownership_claims c
      where c.entity_type = v_claim.entity_type and c.entity_id = v_claim.entity_id
        and c.status = 'approved' and c.id <> v_claim.id
    ) then raise exception 'This page already has an approved ownership claim'; end if;

    update public.scenes set owner_user_id = v_claim.claimed_by, updated_at = now()
      where id = v_claim.entity_id and v_claim.entity_type = 'scene';
    update public.moments set host_id = v_claim.claimed_by, updated_at = now()
      where id = v_claim.entity_id and v_claim.entity_type = 'moment';
    update public.venues set owner_id = v_claim.claimed_by, updated_at = now()
      where id = v_claim.entity_id and v_claim.entity_type = 'venue';

    insert into public.organization_members(organization_id, user_id, role)
      select v_claim.entity_id, v_claim.claimed_by, 'owner'
      where v_claim.entity_type = 'brand'
      on conflict (organization_id, user_id) do update set role = excluded.role;

    update public.organizations
    set owner_id = v_claim.claimed_by, claim_status = 'claimed',
        ownership_claimed_at = now(),
        verification_status = case when nullif(trim(p_verification_method), '') is null then 'pending' else 'verified' end,
        verified_at = case when nullif(trim(p_verification_method), '') is null then null else now() end,
        verified_by = case when nullif(trim(p_verification_method), '') is null then null else v_admin end,
        verification_method = nullif(trim(p_verification_method), ''),
        updated_at = now()
    where id = v_claim.entity_id and v_claim.entity_type = 'brand';

    insert into public.user_roles(user_id, role)
      select v_claim.claimed_by, 'brand'::public.user_role where v_claim.entity_type = 'brand'
      on conflict (user_id, role) do nothing;
    insert into public.brand_accounts(organization_id)
      select v_claim.entity_id where v_claim.entity_type = 'brand'
      on conflict (organization_id) where organization_id is not null do nothing;
  end if;

  update public.page_ownership_claims
  set status = p_decision, claimed_at = case when p_decision = 'approved' then now() else null end,
      reviewed_by = v_admin, reviewed_at = now(), review_note = nullif(trim(p_review_note), ''), updated_at = now()
  where id = p_claim_id;

  insert into public.notifications(user_id, type, title, message, related_id, is_read, dedupe_key)
  select v_claim.claimed_by, 'page_ownership_' || p_decision,
    case when p_decision = 'approved' then 'Your page ownership was approved' else 'Your page ownership needs another look' end,
    case when p_decision = 'approved' then v_claim.display_name || ' is now available in your workspace.'
      else coalesce(nullif(trim(p_review_note), ''), 'Review the request and submit stronger verification.') end,
    v_claim.entity_id, false, 'page-ownership-review:' || p_claim_id::text || ':' || p_decision
  where exists (select 1 from public.users u where u.id = v_claim.claimed_by)
  on conflict (dedupe_key) do nothing;

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, reason, metadata)
  values (v_admin, 'review_page_ownership', v_claim.entity_type, v_claim.entity_id::text,
    nullif(trim(p_review_note), ''), jsonb_build_object('claim_id', p_claim_id, 'decision', p_decision, 'claimant_id', v_claim.claimed_by));

  return jsonb_build_object('claim_id', p_claim_id, 'status', p_decision, 'entity_id', v_claim.entity_id);
end;
$admin_review_page_ownership_v2$
language plpgsql;

create or replace function public.transfer_organization_ownership(
  p_organization_id uuid,
  p_new_owner_id uuid
)
returns void
security definer
set search_path = public, auth
as $transfer_organization_ownership$
begin
  if not public.can_manage_organization(p_organization_id, 'owner') then raise exception 'Owner access required'; end if;
  if not exists (select 1 from public.organization_members where organization_id = p_organization_id and user_id = p_new_owner_id)
    then raise exception 'The new owner must already be an organization member'; end if;
  update public.organization_members set role = 'admin'
    where organization_id = p_organization_id and user_id = auth.uid();
  update public.organization_members set role = 'owner'
    where organization_id = p_organization_id and user_id = p_new_owner_id;
  update public.organizations set owner_id = p_new_owner_id, updated_at = now() where id = p_organization_id;
end;
$transfer_organization_ownership$
language plpgsql;

create or replace function public.set_organization_member_role(
  p_organization_id uuid,
  p_member_id uuid,
  p_role text
)
returns void
security definer
set search_path = public, auth
as $set_organization_member_role$
begin
  if not public.can_manage_organization(p_organization_id, 'admin') then raise exception 'Organization admin access required'; end if;
  if p_role not in ('owner', 'admin', 'manager', 'staff') then raise exception 'Unsupported member role'; end if;
  if p_role = 'owner' and not public.can_manage_organization(p_organization_id, 'owner') then raise exception 'Only an owner can appoint another owner'; end if;
  if p_member_id = auth.uid() and public.organization_role_rank(p_organization_id, p_member_id) = 40 and p_role <> 'owner'
    and (select count(*) from public.organization_members where organization_id = p_organization_id and role::text = 'owner') <= 1
    then raise exception 'Transfer ownership before changing the final owner role'; end if;
  update public.organization_members set role = p_role::public.org_member_role
    where organization_id = p_organization_id and user_id = p_member_id;
  if not found then raise exception 'Organization member not found'; end if;
end;
$set_organization_member_role$
language plpgsql;

create or replace function public.remove_organization_member(
  p_organization_id uuid,
  p_member_id uuid
)
returns void
security definer
set search_path = public, auth
as $remove_organization_member$
declare
  v_target_rank integer := public.organization_role_rank(p_organization_id, p_member_id);
begin
  if p_member_id <> auth.uid() and not public.can_manage_organization(p_organization_id, 'admin') then
    raise exception 'Organization admin access required';
  end if;
  if v_target_rank = 40 and (select count(*) from public.organization_members where organization_id = p_organization_id and role::text = 'owner') <= 1
    then raise exception 'The organization must retain at least one owner'; end if;
  if v_target_rank >= public.organization_role_rank(p_organization_id, auth.uid()) and p_member_id <> auth.uid()
    then raise exception 'You cannot remove a member with an equal or higher role'; end if;
  delete from public.organization_members where organization_id = p_organization_id and user_id = p_member_id;
end;
$remove_organization_member$
language plpgsql;

create or replace view public.view_public_brand_directory as
select
  o.id,
  o.slug,
  o.name,
  o.avatar_url as logo_url,
  o.website as website_url,
  o.created_at,
  (
    select count(*)::integer from public.campaigns c
    where c.brand_id = o.id and c.is_active = true
  ) as active_campaigns_count,
  (
    select count(distinct mba.moment_id)::integer
    from public.view_moment_brand_associations mba where mba.brand_id = o.id
  ) as associated_moments_count,
  o.claim_status,
  o.verification_status
from public.organizations o
where o.type = 'brand' and o.status = 'active';

grant select on public.view_public_brand_directory to anon, authenticated;
grant execute on function public.organization_role_rank(uuid, uuid) to authenticated;
grant execute on function public.can_manage_organization(uuid, text) to authenticated;
grant execute on function public.create_organization_workspace(text, text, text, text, text) to authenticated;
grant execute on function public.admin_review_page_ownership(uuid, text, text, text) to authenticated;
grant execute on function public.transfer_organization_ownership(uuid, uuid) to authenticated;
grant execute on function public.set_organization_member_role(uuid, uuid, text) to authenticated;
grant execute on function public.remove_organization_member(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';
