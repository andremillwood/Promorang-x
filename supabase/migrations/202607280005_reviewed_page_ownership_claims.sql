-- Page ownership is requested by the intended owner and granted only after
-- platform review. Approval and ownership transfer happen in one transaction.

alter table public.page_ownership_claims
  add column if not exists claimant_note text,
  add column if not exists claimant_evidence jsonb not null default '{}'::jsonb,
  add column if not exists requested_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_note text;

alter table public.page_ownership_claims
  drop constraint if exists page_ownership_claims_status_check;

alter table public.page_ownership_claims
  add constraint page_ownership_claims_status_check
  check (status in ('available', 'requested', 'approved', 'rejected', 'cancelled', 'claimed'));

create or replace function public.request_page_ownership(
  p_claim_id uuid,
  p_note text default null,
  p_evidence jsonb default '{}'::jsonb
)
returns jsonb
security definer
set search_path = public, auth
as $request_page_ownership$
declare
  v_user uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt()->>'email', ''));
  v_claim public.page_ownership_claims%rowtype;
begin
  if v_user is null then
    raise exception 'Sign in to request ownership';
  end if;

  select * into v_claim
  from public.page_ownership_claims
  where id = p_claim_id
  for update;

  if v_claim.id is null or v_claim.status not in ('available', 'rejected') then
    raise exception 'This page is not currently open for an ownership request';
  end if;
  if lower(v_claim.intended_owner_email) <> v_email then
    raise exception 'This page was prepared for a different email address';
  end if;
  if nullif(trim(p_note), '') is null then
    raise exception 'Explain your relationship to this page before submitting the claim';
  end if;
  if v_claim.entity_type = 'brand'
    and split_part(v_email, '@', 2) in ('gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com')
    and jsonb_array_length(coalesce(p_evidence->'supporting_links', '[]'::jsonb)) = 0 then
    raise exception 'Brand claims from a personal email require a supporting website, official social profile, or document link';
  end if;

  update public.page_ownership_claims
  set status = 'requested',
      claimed_by = v_user,
      claimant_note = nullif(trim(p_note), ''),
      claimant_evidence = coalesce(p_evidence, '{}'::jsonb),
      requested_at = now(),
      reviewed_by = null,
      reviewed_at = null,
      review_note = null,
      updated_at = now()
  where id = p_claim_id;

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, metadata)
  values (
    v_user, 'request_page_ownership', v_claim.entity_type, v_claim.entity_id::text,
    jsonb_build_object('claim_id', p_claim_id)
  );

  return jsonb_build_object('claim_id', p_claim_id, 'status', 'requested');
end;
$request_page_ownership$
language plpgsql;

create or replace function public.list_my_page_ownership_claims()
returns table (
  claim_id uuid,
  entity_type text,
  entity_id uuid,
  display_name text,
  status text,
  created_at timestamptz,
  requested_at timestamptz,
  review_note text
)
security definer
stable
set search_path = public, auth
as $list_my_page_ownership_claims$
  select c.id, c.entity_type, c.entity_id, c.display_name, c.status,
         c.created_at, c.requested_at, c.review_note
  from public.page_ownership_claims c
  where lower(c.intended_owner_email) = lower(coalesce(auth.jwt()->>'email', ''))
  order by c.created_at desc;
$list_my_page_ownership_claims$
language sql;

create or replace function public.admin_review_page_ownership(
  p_claim_id uuid,
  p_decision text,
  p_review_note text default null
)
returns jsonb
security definer
set search_path = public, auth
as $admin_review_page_ownership$
declare
  v_admin uuid := auth.uid();
  v_claim public.page_ownership_claims%rowtype;
begin
  if not public.is_claimable_page_admin(v_admin) then
    raise exception 'Admin access required';
  end if;
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Decision must be approved or rejected';
  end if;

  select * into v_claim
  from public.page_ownership_claims
  where id = p_claim_id
  for update;

  if v_claim.id is null or v_claim.status <> 'requested' then
    raise exception 'This ownership request is no longer awaiting review';
  end if;

  if p_decision = 'approved' then
    update public.scenes
    set owner_user_id = v_claim.claimed_by, updated_at = now()
    where id = v_claim.entity_id and v_claim.entity_type = 'scene';

    update public.moments
    set host_id = v_claim.claimed_by, updated_at = now()
    where id = v_claim.entity_id and v_claim.entity_type = 'moment';

    update public.venues
    set owner_id = v_claim.claimed_by, updated_at = now()
    where id = v_claim.entity_id and v_claim.entity_type = 'venue';

    insert into public.organization_members(organization_id, user_id, role)
    select v_claim.entity_id, v_claim.claimed_by, 'owner'
    where v_claim.entity_type = 'brand'
    on conflict (organization_id, user_id) do update set role = excluded.role;
  end if;

  update public.page_ownership_claims
  set status = p_decision,
      claimed_at = case when p_decision = 'approved' then now() else null end,
      reviewed_by = v_admin,
      reviewed_at = now(),
      review_note = nullif(trim(p_review_note), ''),
      updated_at = now()
  where id = p_claim_id;

  insert into public.admin_audit_log(actor_id, action, target_type, target_id, reason, metadata)
  values (
    v_admin, 'review_page_ownership', v_claim.entity_type, v_claim.entity_id::text,
    nullif(trim(p_review_note), ''),
    jsonb_build_object('claim_id', p_claim_id, 'decision', p_decision, 'claimant_id', v_claim.claimed_by)
  );

  return jsonb_build_object('claim_id', p_claim_id, 'status', p_decision);
end;
$admin_review_page_ownership$
language plpgsql;

-- Keep the original function name safe for already-deployed clients: it now
-- submits a request and never transfers ownership.
create or replace function public.claim_page_ownership(p_claim_id uuid)
returns jsonb
security definer
set search_path = public, auth
as $claim_page_ownership_compat$
  select public.request_page_ownership(p_claim_id, null, '{}'::jsonb);
$claim_page_ownership_compat$
language sql;

grant execute on function public.request_page_ownership(uuid, text, jsonb) to authenticated;
grant execute on function public.list_my_page_ownership_claims() to authenticated;
grant execute on function public.admin_review_page_ownership(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
