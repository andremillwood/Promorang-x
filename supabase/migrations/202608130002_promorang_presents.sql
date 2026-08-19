-- Promorang Presents: invitation-only access, inventory and redemption.
-- Reuses auth.users, public.users, moments, growth_events and existing referral infrastructure.

create extension if not exists pgcrypto;

create table if not exists public.presents_programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null default 'Kingston',
  description text,
  status text not null default 'draft' check (status in ('draft','live','paused','archived')),
  capacity integer check (capacity is null or capacity > 0),
  starts_at timestamptz,
  ends_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.presents_invite_codes (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.presents_programs(id) on delete cascade,
  code text not null,
  issuer_user_id uuid references auth.users(id) on delete set null,
  source_type text not null default 'member' check (source_type in ('founding','member','host','partner','ambassador','campaign','admin')),
  source_label text,
  parent_code_id uuid references public.presents_invite_codes(id) on delete set null,
  max_uses integer not null default 1 check (max_uses > 0 and max_uses <= 10000),
  used_count integer not null default 0 check (used_count >= 0),
  child_allowance integer not null default 3 check (child_allowance between 0 and 20),
  status text not null default 'active' check (status in ('active','paused','exhausted','revoked')),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(program_id, code)
);

create unique index if not exists presents_invite_codes_code_upper_idx
  on public.presents_invite_codes (upper(code));

create table if not exists public.presents_memberships (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.presents_programs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_id text,
  admitted_by_code_id uuid references public.presents_invite_codes(id) on delete set null,
  status text not null default 'active' check (status in ('active','waitlist','paused','revoked')),
  tier text not null default 'insider' check (tier in ('guest','insider','vip','tastemaker','steward')),
  admitted_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (user_id is not null or anonymous_id is not null)
);

create unique index if not exists presents_memberships_program_user_idx
  on public.presents_memberships(program_id, user_id) where user_id is not null;
create unique index if not exists presents_memberships_program_anon_idx
  on public.presents_memberships(program_id, anonymous_id) where anonymous_id is not null;

create table if not exists public.presents_invite_redemptions (
  id uuid primary key default gen_random_uuid(),
  invite_code_id uuid not null references public.presents_invite_codes(id) on delete restrict,
  membership_id uuid not null references public.presents_memberships(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_id text,
  ip_hash text,
  user_agent_hash text,
  redeemed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.presents_experiences (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.presents_programs(id) on delete cascade,
  moment_id uuid,
  slug text not null,
  title text not null,
  event_name text not null,
  event_date timestamptz,
  venue_name text,
  category text not null default 'secret',
  description text,
  unlock_label text,
  image_url text,
  quantity integer not null default 1 check (quantity >= 0),
  claimed_count integer not null default 0 check (claimed_count >= 0),
  redeemed_count integer not null default 0 check (redeemed_count >= 0),
  promo_keys_required integer not null default 0 check (promo_keys_required >= 0),
  promo_points_required integer not null default 0 check (promo_points_required >= 0),
  referrals_required integer not null default 0 check (referrals_required >= 0),
  mission_requirements jsonb not null default '[]'::jsonb,
  redemption_rules text,
  approval_required boolean not null default false,
  status text not null default 'draft' check (status in ('draft','live','sold_out','paused','archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(program_id, slug),
  check (claimed_count <= quantity),
  check (redeemed_count <= claimed_count)
);

create table if not exists public.presents_access_claims (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.presents_experiences(id) on delete restrict,
  membership_id uuid not null references public.presents_memberships(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  credential_code text not null unique,
  status text not null default 'pending' check (status in ('pending','approved','redeemed','expired','cancelled','rejected')),
  claimed_at timestamptz not null default now(),
  approved_at timestamptz,
  redeemed_at timestamptz,
  redeemed_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  unique(experience_id, membership_id)
);

create index if not exists presents_codes_program_status_idx on public.presents_invite_codes(program_id,status);
create index if not exists presents_experiences_program_status_idx on public.presents_experiences(program_id,status,event_date);
create index if not exists presents_claims_experience_status_idx on public.presents_access_claims(experience_id,status);

alter table public.presents_programs enable row level security;
alter table public.presents_invite_codes enable row level security;
alter table public.presents_memberships enable row level security;
alter table public.presents_invite_redemptions enable row level security;
alter table public.presents_experiences enable row level security;
alter table public.presents_access_claims enable row level security;

drop policy if exists "Live Presents programs are public" on public.presents_programs;
create policy "Live Presents programs are public" on public.presents_programs for select using (status = 'live');
drop policy if exists "Live Presents experiences are public" on public.presents_experiences;
create policy "Live Presents experiences are public" on public.presents_experiences for select using (status in ('live','sold_out'));
drop policy if exists "Members read own Presents membership" on public.presents_memberships;
create policy "Members read own Presents membership" on public.presents_memberships for select using (auth.uid() = user_id);
drop policy if exists "Members read issued Presents codes" on public.presents_invite_codes;
create policy "Members read issued Presents codes" on public.presents_invite_codes for select using (auth.uid() = issuer_user_id);
drop policy if exists "Members read own Presents claims" on public.presents_access_claims;
create policy "Members read own Presents claims" on public.presents_access_claims for select using (auth.uid() = user_id);

create or replace function public.redeem_presents_invite(
  p_code text,
  p_user_id uuid default null,
  p_anonymous_id text default null,
  p_ip_hash text default null,
  p_user_agent_hash text default null,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code public.presents_invite_codes%rowtype;
  v_program public.presents_programs%rowtype;
  v_membership public.presents_memberships%rowtype;
  v_existing_count integer;
  v_child_codes jsonb := '[]'::jsonb;
  v_child_code text;
  i integer;
begin
  if nullif(trim(p_code),'') is null or (p_user_id is null and nullif(trim(p_anonymous_id),'') is null) then
    raise exception 'INVALID_REQUEST';
  end if;

  select * into v_code from public.presents_invite_codes
   where upper(code)=upper(trim(p_code)) for update;
  if not found then raise exception 'INVALID_CODE'; end if;
  if v_code.status <> 'active' then raise exception 'CODE_UNAVAILABLE'; end if;
  if v_code.expires_at is not null and v_code.expires_at <= now() then raise exception 'CODE_EXPIRED'; end if;
  if v_code.used_count >= v_code.max_uses then raise exception 'CODE_EXHAUSTED'; end if;

  select * into v_program from public.presents_programs where id=v_code.program_id and status='live';
  if not found then raise exception 'PROGRAM_UNAVAILABLE'; end if;
  if v_program.capacity is not null then
    select count(*) into v_existing_count from public.presents_memberships where program_id=v_program.id and status='active';
    if v_existing_count >= v_program.capacity then raise exception 'PROGRAM_FULL'; end if;
  end if;

  select * into v_membership from public.presents_memberships
   where program_id=v_program.id and ((p_user_id is not null and user_id=p_user_id) or (p_user_id is null and anonymous_id=p_anonymous_id))
   limit 1;
  if found then
    return jsonb_build_object('membership_id',v_membership.id,'program_slug',v_program.slug,'tier',v_membership.tier,'already_member',true,'invite_codes','[]'::jsonb);
  end if;

  insert into public.presents_memberships(program_id,user_id,anonymous_id,admitted_by_code_id,metadata)
  values(v_program.id,p_user_id,case when p_user_id is null then p_anonymous_id else null end,v_code.id,p_metadata)
  returning * into v_membership;

  update public.presents_invite_codes set used_count=used_count+1,
    status=case when used_count+1>=max_uses then 'exhausted' else status end, updated_at=now()
  where id=v_code.id;

  insert into public.presents_invite_redemptions(invite_code_id,membership_id,user_id,anonymous_id,ip_hash,user_agent_hash,metadata)
  values(v_code.id,v_membership.id,p_user_id,p_anonymous_id,p_ip_hash,p_user_agent_hash,p_metadata);

  for i in 1..v_code.child_allowance loop
    loop
      v_child_code := 'PR-' || upper(substr(encode(gen_random_bytes(6),'hex'),1,6));
      begin
        insert into public.presents_invite_codes(program_id,code,issuer_user_id,source_type,parent_code_id,max_uses,child_allowance,metadata)
        values(v_program.id,v_child_code,p_user_id,'member',v_code.id,1,case when p_user_id is null then 0 else 3 end,jsonb_build_object('issuer_membership_id',v_membership.id));
        exit;
      exception when unique_violation then null;
      end;
    end loop;
    v_child_codes := v_child_codes || jsonb_build_array(v_child_code);
  end loop;

  return jsonb_build_object('membership_id',v_membership.id,'program_slug',v_program.slug,'tier',v_membership.tier,'already_member',false,'invite_codes',v_child_codes);
end;
$$;

revoke all on function public.redeem_presents_invite(text,uuid,text,text,text,jsonb) from public, anon, authenticated;

create or replace function public.claim_presents_experience(p_experience_id uuid,p_membership_id uuid,p_user_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_exp public.presents_experiences%rowtype; v_membership public.presents_memberships%rowtype; v_claim public.presents_access_claims%rowtype; v_credential text;
begin
  select * into v_exp from public.presents_experiences where id=p_experience_id for update;
  if not found or v_exp.status <> 'live' then raise exception 'EXPERIENCE_UNAVAILABLE'; end if;
  if v_exp.claimed_count >= v_exp.quantity then raise exception 'SOLD_OUT'; end if;
  select * into v_membership from public.presents_memberships where id=p_membership_id and program_id=v_exp.program_id and status='active';
  if not found or (v_membership.user_id is not null and v_membership.user_id<>p_user_id) then raise exception 'NOT_ELIGIBLE'; end if;
  v_credential := 'PP-' || upper(substr(encode(gen_random_bytes(8),'hex'),1,10));
  insert into public.presents_access_claims(experience_id,membership_id,user_id,credential_code,status)
  values(v_exp.id,v_membership.id,p_user_id,v_credential,case when v_exp.approval_required then 'pending' else 'approved' end)
  returning * into v_claim;
  update public.presents_experiences set claimed_count=claimed_count+1,updated_at=now(),status=case when claimed_count+1>=quantity then 'sold_out' else status end where id=v_exp.id;
  return jsonb_build_object('claim_id',v_claim.id,'credential_code',v_claim.credential_code,'status',v_claim.status);
exception when unique_violation then raise exception 'ALREADY_CLAIMED';
end; $$;

revoke all on function public.claim_presents_experience(uuid,uuid,uuid) from public, anon, authenticated;

insert into public.presents_programs(slug,name,description,status,capacity,settings)
values('founding-season','Promorang Presents — Founding Season','Invitation-only access to the rooms, sounds and moments shaping Kingston.','live',100,'{"member_invites":3,"city":"Kingston"}'::jsonb)
on conflict(slug) do update set name=excluded.name,description=excluded.description,status=excluded.status,capacity=excluded.capacity,settings=excluded.settings,updated_at=now();

insert into public.presents_invite_codes(program_id,code,source_type,source_label,max_uses,child_allowance,metadata)
select id,v.code,'founding','Founding release',v.max_uses,3,'{"seed":true}'::jsonb from public.presents_programs
cross join (values ('PRESENTS',25),('ILHH',25),('ENCORE',25),('FIRST100',25)) as v(code,max_uses)
where slug='founding-season'
on conflict(program_id,code) do update set max_uses=excluded.max_uses,status='active',updated_at=now();

insert into public.presents_experiences(program_id,slug,title,event_name,venue_name,category,description,unlock_label,quantity,referrals_required,mission_requirements,redemption_rules,status,metadata)
select id,v.slug,v.title,v.event_name,'Kingston',v.category,v.description,v.unlock_label,v.quantity,v.referrals,v.missions::jsonb,v.rules,'live',v.metadata::jsonb
from public.presents_programs cross join (values
 ('encore-secret-table','Secret Table','Encore','tables','A table that never appears on the floor plan. Built for the crew that moves together.','Bring the crew',2,3,'[]','Show the live claim credential to the Promorang host before midnight.','{"day":"Wednesday","badge":"Limited"}'),
 ('encore-fast-lane','Skip The Line','Encore','vip','Arrive together and move straight into the night.','Priority entry',20,1,'[]','Credential is valid for the named holder and one arrival window.','{"day":"Wednesday","badge":"This week"}'),
 ('ilhh-dj-booth','Inside the DJ Booth','I Luv Hip Hop','music','See the room from the selector’s side and help shape one moment in the set.','DJ booth access',3,3,'["pick-the-track"]','Present credential to the Promorang host during the announced access window.','{"day":"Thursday","badge":"Rare"}'),
 ('ilhh-pick-track','Pick The Track','I Luv Hip Hop','music','Vote on the record you want to hear when the room peaks.','Your vote counts',100,0,'[]','Voting closes at 10 PM Thursday.','{"day":"Thursday","badge":"Open"}')
) as v(slug,title,event_name,category,description,unlock_label,quantity,referrals,missions,rules,metadata)
where public.presents_programs.slug='founding-season'
on conflict(program_id,slug) do update set title=excluded.title,description=excluded.description,unlock_label=excluded.unlock_label,quantity=excluded.quantity,referrals_required=excluded.referrals_required,mission_requirements=excluded.mission_requirements,redemption_rules=excluded.redemption_rules,status='live',metadata=excluded.metadata,updated_at=now();
