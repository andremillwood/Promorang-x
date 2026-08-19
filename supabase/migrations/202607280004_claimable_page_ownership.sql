-- CLEAN INSTALL: Admin-seeded public pages and self-service ownership claiming.
-- The claim email is never exposed through public table reads; owners discover
-- eligible pages through the security-definer function below.

create extension if not exists pgcrypto;

-- Keep this migration self-contained. Some environments do not have the
-- optional is_platform_staff(uuid) helper installed.
create or replace function public.is_claimable_page_admin(p_user_id uuid)
returns boolean
security definer
stable
set search_path = public
as $is_claimable_page_admin$
  select p_user_id is not null and (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = p_user_id
        and ur.role::text in ('admin', 'master_admin')
    )
    or exists (
      select 1
      from public.users u
      where u.id = p_user_id
        and (
          coalesce(u.role::text, '') in ('admin', 'master_admin')
          or coalesce(u.user_type::text, '') in ('admin', 'master_admin')
        )
    )
  );
$is_claimable_page_admin$
language sql;

-- Compatibility alias for the first draft of this migration and installations
-- that already reference this helper name in an RLS policy.
create or replace function public.is_platform_staff(p_user_id uuid)
returns boolean
security definer
stable
set search_path = public
as $is_platform_staff$
  select public.is_claimable_page_admin(p_user_id);
$is_platform_staff$
language sql;

create table if not exists public.page_ownership_claims (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('scene', 'moment', 'venue', 'brand')),
  entity_id uuid not null,
  display_name text not null,
  intended_owner_email text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  status text not null default 'available' check (status in ('available', 'claimed', 'cancelled')),
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id)
);

create index if not exists idx_page_ownership_claims_email_status
  on public.page_ownership_claims (lower(intended_owner_email), status);

alter table public.page_ownership_claims enable row level security;

drop policy if exists "Admins manage page ownership claims" on public.page_ownership_claims;
drop policy if exists "Admins read page ownership claims" on public.page_ownership_claims;
create policy "Admins read page ownership claims"
  on public.page_ownership_claims
  for select
  to authenticated
  using (public.is_claimable_page_admin(auth.uid()));

create or replace function public.admin_create_claimable_page(
  p_entity_type text,
  p_owner_email text,
  p_payload jsonb
)
returns jsonb
security definer
set search_path = public, auth
as $admin_create_claimable_page$
declare
  v_actor uuid := auth.uid();
  v_entity_id uuid;
  v_title text := nullif(trim(coalesce(p_payload->>'title', p_payload->>'name')), '');
  v_slug text;
  v_owner_email text := lower(trim(p_owner_email));
begin
  if not public.is_claimable_page_admin(v_actor) then
    raise exception 'Admin access required';
  end if;
  if p_entity_type not in ('scene', 'moment', 'venue', 'brand') then
    raise exception 'Unsupported page type';
  end if;
  if v_title is null then
    raise exception 'A page name is required';
  end if;
  if v_owner_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'A valid owner email is required';
  end if;

  v_slug := coalesce(
    nullif(trim(p_payload->>'slug'), ''),
    trim(both '-' from regexp_replace(lower(v_title), '[^a-z0-9]+', '-', 'g'))
      || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)
  );

  if p_entity_type = 'scene' then
    insert into public.scenes (
      owner_user_id, title, slug, description, city, country, image_url,
      visibility, status, metadata
    ) values (
      v_actor, v_title, v_slug, p_payload->>'description',
      p_payload->>'city', p_payload->>'country', p_payload->>'image_url',
      coalesce(nullif(p_payload->>'visibility', ''), 'public'), 'active',
      coalesce(p_payload->'metadata', '{}'::jsonb) || jsonb_build_object('admin_seeded', true)
    ) returning id into v_entity_id;
  elsif p_entity_type = 'venue' then
    insert into public.venues (
      owner_id, name, description, address, category, phone, website, image_url, is_active
    ) values (
      v_actor, v_title, p_payload->>'description',
      coalesce(nullif(p_payload->>'address', ''), 'Address to be confirmed'),
      coalesce(nullif(p_payload->>'category', ''), 'venue'),
      p_payload->>'phone', p_payload->>'website', p_payload->>'image_url', true
    ) returning id into v_entity_id;
  elsif p_entity_type = 'brand' then
    insert into public.organizations (
      name, slug, type, billing_email, avatar_url, website, created_by
    ) values (
      v_title, v_slug, 'brand', v_owner_email, p_payload->>'image_url',
      p_payload->>'website', v_actor
    ) returning id into v_entity_id;
  elsif p_entity_type = 'moment' then
    insert into public.moments (
      host_id, title, description, type, moment_type, category, location,
      venue_id, starts_at, ends_at, max_participants, is_active, status,
      visibility, proof_type, evidence_requirements
    ) values (
      v_actor, v_title, p_payload->>'description', 'community', 'community',
      coalesce(nullif(p_payload->>'category', ''), 'social'),
      coalesce(nullif(p_payload->>'location', ''), 'Location to be confirmed'),
      nullif(p_payload->>'venue_id', '')::uuid,
      coalesce(nullif(p_payload->>'starts_at', '')::timestamptz, now() + interval '7 days'),
      nullif(p_payload->>'ends_at', '')::timestamptz,
      nullif(p_payload->>'max_participants', '')::integer,
      true, 'joinable', coalesce(nullif(p_payload->>'visibility', ''), 'open'),
      'QR', '[]'::jsonb
    ) returning id into v_entity_id;
  end if;

  insert into public.page_ownership_claims (
    entity_type, entity_id, display_name, intended_owner_email, created_by, metadata
  ) values (
    p_entity_type, v_entity_id, v_title, v_owner_email, v_actor,
    jsonb_build_object('created_on_behalf_of', v_owner_email)
  );

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, metadata)
  values (v_actor, 'create_claimable_page', p_entity_type, v_entity_id::text,
    jsonb_build_object('display_name', v_title, 'intended_owner_email', v_owner_email));

  return jsonb_build_object('id', v_entity_id, 'type', p_entity_type, 'name', v_title);
end;
$admin_create_claimable_page$
language plpgsql;

create or replace function public.list_my_claimable_pages()
returns table (
  claim_id uuid,
  entity_type text,
  entity_id uuid,
  display_name text,
  created_at timestamptz
)
security definer
stable
set search_path = public, auth
as $list_my_claimable_pages$
  select c.id, c.entity_type, c.entity_id, c.display_name, c.created_at
  from public.page_ownership_claims c
  where c.status = 'available'
    and lower(c.intended_owner_email) = lower(coalesce(auth.jwt()->>'email', ''))
  order by c.created_at desc;
$list_my_claimable_pages$
language sql;

create or replace function public.claim_page_ownership(p_claim_id uuid)
returns jsonb
security definer
set search_path = public, auth
as $claim_page_ownership$
declare
  v_user uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt()->>'email', ''));
  v_claim public.page_ownership_claims%rowtype;
begin
  if v_user is null then
    raise exception 'Sign in to claim this page';
  end if;

  select * into v_claim
  from public.page_ownership_claims
  where id = p_claim_id
  for update;

  if v_claim.id is null then
    raise exception 'This page is no longer available to claim';
  end if;
  if v_claim.status <> 'available' then
    raise exception 'This page is no longer available to claim';
  end if;
  if lower(v_claim.intended_owner_email) <> v_email then
    raise exception 'This page was prepared for a different email address';
  end if;

  update public.scenes
  set owner_user_id = v_user, updated_at = now()
  where id = v_claim.entity_id and v_claim.entity_type = 'scene';

  update public.moments
  set host_id = v_user, updated_at = now()
  where id = v_claim.entity_id and v_claim.entity_type = 'moment';

  update public.venues
  set owner_id = v_user, updated_at = now()
  where id = v_claim.entity_id and v_claim.entity_type = 'venue';

  insert into public.organization_members(organization_id, user_id, role)
  select v_claim.entity_id, v_user, 'owner'
  where v_claim.entity_type = 'brand'
  on conflict (organization_id, user_id) do update set role = excluded.role;

  update public.page_ownership_claims
  set status = 'claimed', claimed_by = v_user, claimed_at = now(), updated_at = now()
  where id = p_claim_id;

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, metadata)
  values (v_user, 'claim_page_ownership', v_claim.entity_type, v_claim.entity_id::text,
    jsonb_build_object('claim_id', p_claim_id));

  return jsonb_build_object('id', v_claim.entity_id, 'type', v_claim.entity_type, 'name', v_claim.display_name);
end;
$claim_page_ownership$
language plpgsql;

revoke all on function public.admin_create_claimable_page(text, text, jsonb) from public;
revoke all on function public.is_claimable_page_admin(uuid) from public;
revoke all on function public.is_platform_staff(uuid) from public;
grant execute on function public.is_claimable_page_admin(uuid) to authenticated;
grant execute on function public.is_platform_staff(uuid) to authenticated;
grant execute on function public.admin_create_claimable_page(text, text, jsonb) to authenticated;
grant execute on function public.list_my_claimable_pages() to authenticated;
grant execute on function public.claim_page_ownership(uuid) to authenticated;

notify pgrst, 'reload schema';
