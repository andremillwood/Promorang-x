-- Production wiring for Pioneer Points. Requires 202607010006_pioneer_points.sql.

create table if not exists public.pioneer_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_id uuid not null references public.pioneer_point_events(id) on delete cascade,
  notification_type text not null check(notification_type in ('pending','verified','rejected','reversed')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id,event_id,notification_type)
);

create table if not exists public.pioneer_fraud_flags (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.pioneer_point_events(id) on delete cascade,
  beneficiary_type text not null,
  beneficiary_id uuid not null,
  signal_type text not null,
  severity text not null check(severity in ('low','medium','high','critical')),
  details jsonb not null default '{}'::jsonb,
  status text not null default 'open' check(status in ('open','reviewing','cleared','confirmed')),
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(event_id,signal_type)
);

create table if not exists public.pioneer_marketing_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text,
  user_id uuid references public.users(id) on delete set null,
  event_name text not null check(event_name in ('landing_view','role_selected','signup_started','signup_completed','first_receipt','first_verified')),
  role_path text,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_pioneer_marketing_funnel on public.pioneer_marketing_events(event_name,created_at desc);

alter table public.pioneer_seasons
  add column if not exists category_allocations jsonb not null default
    '{"creator":0.25,"member":0.10,"host":0.25,"venue":0.20,"referrer":0.15,"community_builder":0.05}'::jsonb,
  add column if not exists allocations_enabled boolean not null default false;

create or replace function public.pioneer_event_owner(p_event public.pioneer_point_events)
returns uuid language sql stable set search_path=public as $$
  select case when p_event.beneficiary_type='user' then p_event.beneficiary_id
    else (select owner_id from public.venues where id=p_event.beneficiary_id) end;
$$;

create or replace function public.notify_pioneer_event()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_user uuid; v_title text; v_body text;
begin
  if tg_op='UPDATE' and old.status=new.status then return new; end if;
  v_user:=public.pioneer_event_owner(new);
  if v_user is null then return new; end if;
  v_title:=case new.status
    when 'pending' then 'Pioneer receipt pending'
    when 'verified' then 'Pioneer contribution verified'
    when 'rejected' then 'Pioneer receipt not verified'
    else 'Pioneer receipt reversed' end;
  v_body:=case new.status
    when 'pending' then '+'||new.points::text||' Pioneer Points are awaiting verification.'
    when 'verified' then '+'||new.points::text||' Pioneer Points joined your Genesis record.'
    else new.points::text||' Pioneer Points · '||coalesce(new.reason,'Review required.') end;
  insert into public.pioneer_notifications(user_id,event_id,notification_type,title,body)
    values(v_user,new.id,new.status,v_title,v_body) on conflict do nothing;
  return new;
end $$;
drop trigger if exists trg_notify_pioneer_event on public.pioneer_point_events;
create trigger trg_notify_pioneer_event after insert or update of status on public.pioneer_point_events
  for each row execute function public.notify_pioneer_event();

create or replace function public.record_closed_moment_pioneer()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_host uuid; v_count integer;
begin
  if new.status::text <> 'closed' or old.status::text='closed' then return new; end if;
  v_host:=coalesce(new.host_id,new.organizer_id);
  select count(*) into v_count from public.moment_participants where moment_id=new.id;
  if v_host is not null and v_count>0 then
    perform public.record_pioneer_points('user',v_host,'host','moment_hosted','moments',new.id::text,
      'moment:'||new.id::text||':host-completed',jsonb_build_object('participant_count',v_count,'venue_id',new.venue_id));
  end if;
  if new.venue_id is not null and v_count>0 then
    perform public.record_pioneer_points('venue',new.venue_id,'venue','moment_facilitated','moments',new.id::text,
      'moment:'||new.id::text||':venue-facilitated',jsonb_build_object('participant_count',v_count,'host_id',v_host));
  end if;
  return new;
exception when others then raise warning 'Pioneer Moment receipt skipped: %',sqlerrm; return new;
end $$;
drop trigger if exists trg_record_closed_moment_pioneer on public.moments;
create trigger trg_record_closed_moment_pioneer after update of status on public.moments
  for each row execute function public.record_closed_moment_pioneer();

create or replace function public.record_published_content_pioneer()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.creator_id is null or lower(coalesce(new.status,'')) not in ('published','active','approved') then return new; end if;
  if tg_op='UPDATE' and lower(coalesce(old.status,'')) in ('published','active','approved') then return new; end if;
  perform public.record_pioneer_points('user',new.creator_id,'creator','original_content','content_items',new.id::text,
    'content:'||new.id::text||':published',jsonb_build_object('title',new.title,'platform',new.platform));
  return new;
exception when others then raise warning 'Pioneer content receipt skipped: %',sqlerrm; return new;
end $$;
drop trigger if exists trg_record_published_content_pioneer on public.content_items;
create trigger trg_record_published_content_pioneer after insert or update on public.content_items
  for each row execute function public.record_published_content_pioneer();

create or replace function public.record_qualified_referral_pioneer()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status <> 'active' or (tg_op='UPDATE' and old.status='active') then return new; end if;
  perform public.record_pioneer_points('user',new.referrer_id,'referrer','qualified_referral','user_referrals',new.id::text,
    'referral:'||new.id::text||':qualified',jsonb_build_object('referred_id',new.referred_id,'activated_at',new.activated_at));
  return new;
exception when others then raise warning 'Pioneer referral receipt skipped: %',sqlerrm; return new;
end $$;
drop trigger if exists trg_record_qualified_referral_pioneer on public.user_referrals;
create trigger trg_record_qualified_referral_pioneer after insert or update on public.user_referrals
  for each row execute function public.record_qualified_referral_pioneer();

create or replace function public.record_verified_engagement_pioneer()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not new.verified then return new; end if;
  perform public.record_pioneer_points('user',new.user_id,'member',
    case when new.action_type='view' then 'daily_active' else 'qualified_engagement' end,
    'engagement_reward_events',new.id::text,
    case when new.action_type='view' then 'active:'||new.user_id::text||':'||new.created_at::date::text
      else 'engagement:'||new.id::text end,
    jsonb_build_object('action_type',new.action_type,'reference_type',new.reference_type,'reference_id',new.reference_id));
  return new;
exception when others then raise warning 'Pioneer engagement receipt skipped: %',sqlerrm; return new;
end $$;
drop trigger if exists trg_record_verified_engagement_pioneer on public.engagement_reward_events;
create trigger trg_record_verified_engagement_pioneer after insert or update on public.engagement_reward_events
  for each row execute function public.record_verified_engagement_pioneer();

create or replace function public.flag_suspicious_pioneer_event()
returns trigger language plpgsql security definer set search_path=public as $$
declare v_today integer;
begin
  select count(*) into v_today from public.pioneer_point_events
    where beneficiary_type=new.beneficiary_type and beneficiary_id=new.beneficiary_id
      and created_at>=date_trunc('day',now());
  if v_today>=25 then
    insert into public.pioneer_fraud_flags(event_id,beneficiary_type,beneficiary_id,signal_type,severity,details)
      values(new.id,new.beneficiary_type,new.beneficiary_id,'high_velocity','high',jsonb_build_object('events_today',v_today+1))
      on conflict do nothing;
  end if;
  if new.event_type='qualified_referral' and (new.metadata->>'referred_id')=new.beneficiary_id::text then
    insert into public.pioneer_fraud_flags(event_id,beneficiary_type,beneficiary_id,signal_type,severity,details)
      values(new.id,new.beneficiary_type,new.beneficiary_id,'self_referral','critical',new.metadata) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists trg_flag_suspicious_pioneer_event on public.pioneer_point_events;
create trigger trg_flag_suspicious_pioneer_event after insert on public.pioneer_point_events
  for each row execute function public.flag_suspicious_pioneer_event();

create or replace function public.allocate_pioneer_season(p_season_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_season public.pioneer_seasons%rowtype; v_type text; v_percent numeric; v_total numeric; v_count integer:=0; v_rows integer;
begin
  select * into v_season from public.pioneer_seasons where id=p_season_id for update;
  if not found or v_season.status not in ('frozen','reviewing') then raise exception 'Season must be frozen'; end if;
  if not v_season.allocations_enabled or v_season.reward_pool_amount is null or v_season.reward_pool_currency is null then
    raise exception 'Allocations are disabled or unfunded';
  end if;
  delete from public.pioneer_reward_allocations where season_id=p_season_id and status='provisional';
  for v_type,v_percent in select key,value::numeric from jsonb_each(v_season.category_allocations) loop
    select coalesce(sum(verified_points),0) into v_total from public.pioneer_scoreboard
      where season_id=p_season_id and contributor_type=v_type;
    if v_total>0 then
      insert into public.pioneer_reward_allocations(season_id,beneficiary_type,beneficiary_id,verified_points,pool_share,reward_currency,reward_amount)
      select p_season_id,beneficiary_type,beneficiary_id,verified_points,
        (verified_points/v_total)*v_percent,v_season.reward_pool_currency,
        round(v_season.reward_pool_amount*v_percent*(verified_points/v_total),2)
      from public.pioneer_scoreboard where season_id=p_season_id and contributor_type=v_type and verified_points>0
      on conflict(season_id,beneficiary_type,beneficiary_id) do update set
        verified_points=excluded.verified_points,pool_share=pioneer_reward_allocations.pool_share+excluded.pool_share,
        reward_amount=pioneer_reward_allocations.reward_amount+excluded.reward_amount,calculated_at=now();
      get diagnostics v_rows=row_count;
      v_count:=v_count+v_rows;
    end if;
  end loop;
  update public.pioneer_seasons set status='reviewing' where id=p_season_id;
  return v_count;
end $$;

alter table public.pioneer_notifications enable row level security;
alter table public.pioneer_fraud_flags enable row level security;
alter table public.pioneer_marketing_events enable row level security;
drop policy if exists "Users read own Pioneer notifications" on public.pioneer_notifications;
create policy "Users read own Pioneer notifications" on public.pioneer_notifications for select using(auth.uid()=user_id);
drop policy if exists "Anyone records Pioneer funnel events" on public.pioneer_marketing_events;
create policy "Anyone records Pioneer funnel events" on public.pioneer_marketing_events for insert with check(user_id is null or user_id=auth.uid());
revoke all on function public.allocate_pioneer_season(uuid) from public;
grant execute on function public.allocate_pioneer_season(uuid) to service_role;
