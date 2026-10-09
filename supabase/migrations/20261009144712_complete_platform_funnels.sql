-- Three journeys, recorded from durable business records rather than browser clicks.
-- Contacts remain in crm_leads. This table contains evidence, never names, phone
-- numbers, email addresses, guest management tokens, or arbitrary client payloads.
create table if not exists public.platform_funnel_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  funnel text not null check (funnel in ('participant','operator','brand')),
  stage text not null,
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_id text,
  entity_type text not null,
  entity_id text not null,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  check (user_id is not null or anonymous_id is not null),
  check (
    (funnel = 'participant' and stage in ('reserved','verified','account','invited','returned')) or
    (funnel = 'operator' and stage in ('brief_captured','published','first_customer','repeat_activation')) or
    (funnel = 'brand' and stage in ('brief_captured','pilot_scoped','funded','outcome_report','renewed'))
  )
);
alter table public.platform_funnel_events enable row level security;
revoke all on public.platform_funnel_events from public, anon, authenticated;
grant select, insert, update, delete on public.platform_funnel_events to service_role;
create index if not exists platform_funnel_user_stage_idx
  on public.platform_funnel_events(user_id,funnel,stage,occurred_at);
create index if not exists platform_funnel_anon_idx
  on public.platform_funnel_events(anonymous_id) where anonymous_id is not null;

-- Trigger helpers are deliberately outside the exposed public schema and cannot
-- be invoked by browser roles to manufacture verified outcomes or funding.
create schema if not exists promorang_internal;
revoke all on schema promorang_internal from public, anon, authenticated;

create or replace function promorang_internal.funnel_receipt(
  p_funnel text, p_stage text, p_user uuid, p_anonymous text,
  p_type text, p_id text, p_at timestamptz default now(), p_metadata jsonb default '{}'::jsonb
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if p_user is null and p_anonymous is null then return; end if;
  insert into public.platform_funnel_events(event_key,funnel,stage,user_id,anonymous_id,entity_type,entity_id,occurred_at,metadata)
  values (p_funnel||':'||p_stage||':'||p_type||':'||p_id||':'||coalesce(p_anonymous,p_user::text),
    p_funnel,p_stage,p_user,p_anonymous,p_type,p_id,coalesce(p_at,now()),p_metadata)
  on conflict(event_key) do update set user_id = coalesce(platform_funnel_events.user_id,excluded.user_id);
end;
$$;

create or replace function promorang_internal.funnel_outcome(
  p_user uuid, p_anonymous text, p_type text, p_id text, p_owner uuid, p_at timestamptz
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform promorang_internal.funnel_receipt('participant','verified',p_user,p_anonymous,p_type,p_id,p_at);
  -- Another resource is a return. Retries at the same door never count twice.
  if p_user is not null and exists (
    select 1 from public.platform_funnel_events where user_id=p_user and funnel='participant' and stage='verified'
    and (entity_type<>p_type or entity_id<>p_id) and occurred_at<=p_at
  ) then
    perform promorang_internal.funnel_receipt('participant','returned',p_user,null,p_type,p_id,p_at);
  end if;
  if p_owner is not null and p_owner is distinct from p_user then
    perform promorang_internal.funnel_receipt('operator','first_customer',p_owner,null,p_type,p_id,p_at);
  end if;
end;
$$;

create or replace function promorang_internal.funnel_publication(p_user uuid,p_type text,p_id text,p_at timestamptz)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform promorang_internal.funnel_receipt('operator','published',p_user,null,p_type,p_id,p_at);
  if exists (
    select 1 from public.platform_funnel_events where user_id=p_user and funnel='operator' and stage='first_customer'
    and occurred_at<=p_at and (entity_type<>p_type or entity_id<>p_id)
  ) then
    perform promorang_internal.funnel_receipt('operator','repeat_activation',p_user,null,p_type,p_id,p_at);
  end if;
end;
$$;

create or replace function promorang_internal.funnel_funding(p_proposal uuid,p_at timestamptz)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare c record;
begin
  if not exists (select 1 from public.activation_gem_reserves where proposal_id=p_proposal and secured_gems>refunded_gems) then return; end if;
  for c in select id,brand_id from public.campaigns where activation_proposal_id=p_proposal loop
    perform promorang_internal.funnel_receipt('brand','funded',c.brand_id,null,'campaign',c.id::text,p_at);
    if exists (
      select 1 from public.platform_funnel_events where user_id=c.brand_id and funnel='brand' and stage='outcome_report'
      and entity_type='campaign' and entity_id<>c.id::text and occurred_at<=p_at
    ) then
      perform promorang_internal.funnel_receipt('brand','renewed',c.brand_id,null,'campaign',c.id::text,p_at);
    end if;
  end loop;
end;
$$;

create or replace function promorang_internal.track_platform_funnel()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid; anon text; at_time timestamptz;
begin
  if tg_table_name='crm_leads' then
    if new.funnel_key in ('demand','moment','sponsor') then
      anon := 'lead:'||new.id;
      perform promorang_internal.funnel_receipt(case when new.funnel_key='sponsor' then 'brand' else 'operator' end,
        'brief_captured',new.user_id,anon,'lead',new.id::text,new.first_captured_at);
      if new.user_id is not null then
        update public.platform_funnel_events set user_id=new.user_id where anonymous_id=anon and user_id is null;
      end if;
    end if;
  elsif tg_table_name='guest_moment_rsvps' then
    anon := 'guest-rsvp:'||new.id;
    if new.status in ('confirmed','checked_in') then
      perform promorang_internal.funnel_receipt('participant','reserved',new.user_id,anon,'moment',new.moment_id::text,new.created_at);
    end if;
    if new.user_id is not null then
      update public.platform_funnel_events set user_id=new.user_id where anonymous_id=anon and user_id is null;
      if new.status in ('confirmed','checked_in') then
        perform promorang_internal.funnel_receipt('participant','account',new.user_id,anon,'moment',new.moment_id::text,new.claimed_at);
      end if;
    end if;
  elsif tg_table_name='guest_attendance_receipts' then
    anon := 'guest-rsvp:'||new.rsvp_id;
    select coalesce(host_id,organizer_id) into owner_id from public.moments where id=new.moment_id;
    perform promorang_internal.funnel_outcome(new.user_id,anon,'moment',new.moment_id::text,owner_id,new.verified_at);
    if new.user_id is not null then
      update public.platform_funnel_events set user_id=new.user_id where anonymous_id=anon and user_id is null;
    end if;
  elsif tg_table_name='offer_issuances' then
    if new.status in ('issued','claimed','fulfillment_pending','redeemed') then
      perform promorang_internal.funnel_receipt('participant','reserved',new.user_id,null,'offer',new.offer_id::text,new.issued_at);
      perform promorang_internal.funnel_receipt('participant','account',new.user_id,null,'offer',new.offer_id::text,new.claimed_at);
    end if;
    if new.status='redeemed' then
      select owner_user_id into owner_id from public.offers where id=new.offer_id;
      perform promorang_internal.funnel_outcome(new.user_id,null,'offer',new.offer_id::text,owner_id,new.redeemed_at);
    end if;
  elsif tg_table_name='moment_participants' then
    if new.status in ('joined','going','confirmed','checked_in','attended') then
      perform promorang_internal.funnel_receipt('participant','reserved',new.user_id,null,'moment',new.moment_id::text,new.joined_at);
      perform promorang_internal.funnel_receipt('participant','account',new.user_id,null,'moment',new.moment_id::text,new.joined_at);
    end if;
    -- Pending proof stays joined. Only the accepted participation transition
    -- with a recorded check-in time advances the verified checkpoint.
    if new.status in ('checked_in','attended') and new.checked_in_at is not null
      and coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb->>'role' is distinct from 'authenticated'
      and coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb->>'role' is distinct from 'anon' then
      select coalesce(host_id,organizer_id) into owner_id from public.moments where id=new.moment_id;
      perform promorang_internal.funnel_outcome(new.user_id,null,'moment',new.moment_id::text,owner_id,new.checked_in_at);
    end if;
  elsif tg_table_name='offers' then
    if new.status='active' and (tg_op='INSERT' or old.status is distinct from new.status) then
      perform promorang_internal.funnel_publication(new.owner_user_id,'offer',new.id::text,now());
    end if;
  elsif tg_table_name='moments' then
    if new.status::text in ('active','live','scheduled','joinable','funded') and (tg_op='INSERT' or old.status is distinct from new.status) then
      perform promorang_internal.funnel_publication(coalesce(new.host_id,new.organizer_id),'moment',new.id::text,now());
    end if;
  elsif tg_table_name='campaigns' then
    perform promorang_internal.funnel_receipt('brand','pilot_scoped',new.brand_id,null,'campaign',new.id::text,new.created_at);
    if new.activation_proposal_id is not null then perform promorang_internal.funnel_funding(new.activation_proposal_id,now()); end if;
  elsif tg_table_name='activation_gem_reserves' then
    perform promorang_internal.funnel_funding(new.proposal_id,now());
  end if;
  return new;
end;
$$;

revoke all on all functions in schema promorang_internal from public, anon, authenticated;

do $$ declare t text; begin
  foreach t in array array['crm_leads','guest_moment_rsvps','guest_attendance_receipts','moment_participants','offer_issuances','offers','moments','campaigns','activation_gem_reserves'] loop
    execute format('drop trigger if exists track_platform_funnel on public.%I',t);
    execute format('create trigger track_platform_funnel after insert or update on public.%I for each row execute function promorang_internal.track_platform_funnel()',t);
  end loop;
end; $$;

-- Backfill historical evidence without updating source records or reissuing value.
select promorang_internal.funnel_receipt(case when funnel_key='sponsor' then 'brand' else 'operator' end,
  'brief_captured',user_id,'lead:'||id,'lead',id::text,first_captured_at)
from public.crm_leads where funnel_key in ('demand','moment','sponsor');
select promorang_internal.funnel_receipt('participant','reserved',user_id,'guest-rsvp:'||id,'moment',moment_id::text,created_at)
from public.guest_moment_rsvps where status in ('confirmed','checked_in');
select promorang_internal.funnel_receipt('participant','account',user_id,'guest-rsvp:'||id,'moment',moment_id::text,claimed_at)
from public.guest_moment_rsvps where user_id is not null and status in ('confirmed','checked_in');
select promorang_internal.funnel_outcome(r.user_id,'guest-rsvp:'||r.rsvp_id,'moment',r.moment_id::text,coalesce(m.host_id,m.organizer_id),r.verified_at)
from public.guest_attendance_receipts r join public.moments m on m.id=r.moment_id order by r.verified_at;
select promorang_internal.funnel_receipt('participant','reserved',user_id,null,'offer',offer_id::text,issued_at)
from public.offer_issuances where status in ('issued','claimed','fulfillment_pending','redeemed');
select promorang_internal.funnel_receipt('participant','account',user_id,null,'offer',offer_id::text,claimed_at)
from public.offer_issuances where status in ('issued','claimed','fulfillment_pending','redeemed');
select promorang_internal.funnel_outcome(i.user_id,null,'offer',i.offer_id::text,o.owner_user_id,i.redeemed_at)
from public.offer_issuances i join public.offers o on o.id=i.offer_id where i.status='redeemed' order by i.redeemed_at;
select promorang_internal.funnel_publication(owner_user_id,'offer',id::text,created_at) from public.offers where status='active';
select promorang_internal.funnel_publication(coalesce(host_id,organizer_id),'moment',id::text,created_at)
from public.moments where status::text in ('active','live','scheduled','joinable','funded');
select promorang_internal.funnel_receipt('participant','reserved',user_id,null,'moment',moment_id::text,joined_at)
from public.moment_participants where status in ('joined','going','confirmed','checked_in','attended');
select promorang_internal.funnel_receipt('participant','account',user_id,null,'moment',moment_id::text,joined_at)
from public.moment_participants where status in ('joined','going','confirmed','checked_in','attended');
select promorang_internal.funnel_outcome(p.user_id,null,'moment',p.moment_id::text,coalesce(m.host_id,m.organizer_id),p.checked_in_at)
from public.moment_participants p join public.moments m on m.id=p.moment_id
where p.status in ('checked_in','attended') and p.checked_in_at is not null and (
  exists(select 1 from public.proof_submissions s where s.user_id=p.user_id and s.moment_id=p.moment_id and s.submission_state='verified')
  or exists(select 1 from public.verified_actions a where a.user_id=p.user_id and a.moment_id=p.moment_id
    and a.action_type::text in ('MOMENT_ATTENDANCE','check_in','moment_join_verified') and a.verified_at is not null)
) order by p.checked_in_at;
select promorang_internal.funnel_receipt('brand','pilot_scoped',brand_id,null,'campaign',id::text,created_at) from public.campaigns;
select promorang_internal.funnel_funding(proposal_id,updated_at) from public.activation_gem_reserves;

-- Reconcile returns across both the guest and account ledgers, regardless of
-- which historical source was replayed first.
select promorang_internal.funnel_receipt('participant','returned',e.user_id,null,e.entity_type,e.entity_id,e.occurred_at)
from public.platform_funnel_events e
where e.funnel='participant' and e.stage='verified' and e.user_id is not null
  and exists(select 1 from public.platform_funnel_events prior where prior.user_id=e.user_id
    and prior.funnel='participant' and prior.stage='verified' and prior.occurred_at<=e.occurred_at
    and (prior.entity_type<>e.entity_type or prior.entity_id<>e.entity_id));
