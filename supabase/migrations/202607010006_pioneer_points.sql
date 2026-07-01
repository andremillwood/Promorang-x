-- Pioneer Points: a non-cash, seasonal record of verified platform contribution.
-- Points are non-transferable and do not create a right to cash, equity, or a token.

create table if not exists public.pioneer_seasons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  snapshot_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft','active','frozen','reviewing','completed','cancelled')),
  reward_pool_currency text,
  reward_pool_amount numeric(14,2),
  terms_version text not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (
    (reward_pool_currency is null and reward_pool_amount is null)
    or (reward_pool_currency in ('usd','jmd','gems') and reward_pool_amount >= 0)
  )
);

create unique index if not exists uq_one_active_pioneer_season
  on public.pioneer_seasons(status) where status = 'active';

create table if not exists public.pioneer_rules (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.pioneer_seasons(id) on delete cascade,
  event_type text not null,
  contributor_type text not null
    check (contributor_type in ('member','creator','host','venue','referrer','community_builder')),
  base_points numeric(12,2) not null check (base_points >= 0),
  daily_cap numeric(12,2),
  season_cap numeric(14,2),
  requires_verification boolean not null default true,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (season_id, event_type, contributor_type)
);

create table if not exists public.pioneer_point_events (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.pioneer_seasons(id) on delete cascade,
  beneficiary_type text not null
    check (beneficiary_type in ('user','venue')),
  beneficiary_id uuid not null,
  contributor_type text not null
    check (contributor_type in ('member','creator','host','venue','referrer','community_builder')),
  event_type text not null,
  points numeric(12,2) not null check (points >= 0),
  status text not null default 'pending'
    check (status in ('pending','verified','rejected','reversed')),
  source_type text not null,
  source_id text not null,
  idempotency_key text not null unique,
  occurred_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references public.users(id) on delete set null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_pioneer_events_beneficiary
  on public.pioneer_point_events(season_id, beneficiary_type, beneficiary_id, status);
create index if not exists idx_pioneer_events_leaderboard
  on public.pioneer_point_events(season_id, contributor_type, status, points desc);
create index if not exists idx_pioneer_events_source
  on public.pioneer_point_events(source_type, source_id);

create table if not exists public.pioneer_reward_allocations (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.pioneer_seasons(id) on delete cascade,
  beneficiary_type text not null check (beneficiary_type in ('user','venue')),
  beneficiary_id uuid not null,
  verified_points numeric(14,2) not null,
  pool_share numeric(12,10) not null check (pool_share between 0 and 1),
  reward_currency text not null check (reward_currency in ('usd','jmd','gems')),
  reward_amount numeric(14,2) not null check (reward_amount >= 0),
  status text not null default 'provisional'
    check (status in ('provisional','approved','paid','withheld','forfeited')),
  calculated_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (season_id, beneficiary_type, beneficiary_id)
);

create or replace view public.pioneer_scoreboard as
select
  e.season_id,
  e.beneficiary_type,
  e.beneficiary_id,
  e.contributor_type,
  coalesce(sum(e.points) filter (where e.status = 'verified'), 0) as verified_points,
  coalesce(sum(e.points) filter (where e.status = 'pending'), 0) as pending_points,
  count(*) filter (where e.status = 'verified') as verified_actions,
  max(e.occurred_at) as last_activity_at
from public.pioneer_point_events e
where e.status in ('verified','pending')
group by e.season_id, e.beneficiary_type, e.beneficiary_id, e.contributor_type;

-- Scoreboard is an operational aggregate exposed only through authenticated APIs.
revoke all on public.pioneer_scoreboard from anon, authenticated;
grant select on public.pioneer_scoreboard to service_role;

create or replace function public.record_pioneer_points(
  p_beneficiary_type text,
  p_beneficiary_id uuid,
  p_contributor_type text,
  p_event_type text,
  p_source_type text,
  p_source_id text,
  p_idempotency_key text,
  p_metadata jsonb default '{}'::jsonb
) returns public.pioneer_point_events
language plpgsql security definer set search_path = public as $$
declare
  v_season public.pioneer_seasons%rowtype;
  v_rule public.pioneer_rules%rowtype;
  v_event public.pioneer_point_events%rowtype;
  v_day_total numeric := 0;
  v_season_total numeric := 0;
  v_award numeric := 0;
begin
  if p_beneficiary_type not in ('user','venue') then raise exception 'Invalid beneficiary type'; end if;
  select * into v_season from public.pioneer_seasons
    where status='active' and now() between starts_at and ends_at limit 1;
  if not found then raise exception 'No active Pioneer season'; end if;

  select * into v_rule from public.pioneer_rules
    where season_id=v_season.id and event_type=p_event_type
      and contributor_type=p_contributor_type and is_active=true;
  if not found then raise exception 'No active Pioneer rule for this event'; end if;

  select coalesce(sum(points),0) into v_day_total
    from public.pioneer_point_events
    where season_id=v_season.id and beneficiary_type=p_beneficiary_type
      and beneficiary_id=p_beneficiary_id and event_type=p_event_type
      and status in ('pending','verified') and occurred_at >= date_trunc('day',now());
  select coalesce(sum(points),0) into v_season_total
    from public.pioneer_point_events
    where season_id=v_season.id and beneficiary_type=p_beneficiary_type
      and beneficiary_id=p_beneficiary_id and event_type=p_event_type
      and status in ('pending','verified');

  v_award := least(
    v_rule.base_points,
    case when v_rule.daily_cap is null then v_rule.base_points else greatest(0,v_rule.daily_cap-v_day_total) end,
    case when v_rule.season_cap is null then v_rule.base_points else greatest(0,v_rule.season_cap-v_season_total) end
  );
  if v_award <= 0 then raise exception 'Pioneer point cap reached'; end if;

  insert into public.pioneer_point_events(
    season_id,beneficiary_type,beneficiary_id,contributor_type,event_type,points,status,
    source_type,source_id,idempotency_key,verified_at,metadata
  ) values (
    v_season.id,p_beneficiary_type,p_beneficiary_id,p_contributor_type,p_event_type,v_award,
    case when v_rule.requires_verification then 'pending' else 'verified' end,
    p_source_type,p_source_id,p_idempotency_key,
    case when v_rule.requires_verification then null else now() end,p_metadata
  ) on conflict(idempotency_key) do update set idempotency_key=excluded.idempotency_key
  returning * into v_event;
  return v_event;
end $$;

alter table public.pioneer_seasons enable row level security;
alter table public.pioneer_rules enable row level security;
alter table public.pioneer_point_events enable row level security;
alter table public.pioneer_reward_allocations enable row level security;

drop policy if exists "Anyone reads published Pioneer seasons" on public.pioneer_seasons;
create policy "Anyone reads published Pioneer seasons" on public.pioneer_seasons
  for select using (status in ('active','frozen','reviewing','completed'));
drop policy if exists "Anyone reads active Pioneer rules" on public.pioneer_rules;
create policy "Anyone reads active Pioneer rules" on public.pioneer_rules
  for select using (is_active = true);
drop policy if exists "Users read own Pioneer events" on public.pioneer_point_events;
create policy "Users read own Pioneer events" on public.pioneer_point_events
  for select using (beneficiary_type='user' and beneficiary_id=auth.uid());
drop policy if exists "Venue owners read venue Pioneer events" on public.pioneer_point_events;
create policy "Venue owners read venue Pioneer events" on public.pioneer_point_events
  for select using (
    beneficiary_type='venue'
    and exists (
      select 1 from public.venues v
      where v.id=pioneer_point_events.beneficiary_id and v.owner_id=auth.uid()
    )
  );
drop policy if exists "Users read own Pioneer allocations" on public.pioneer_reward_allocations;
create policy "Users read own Pioneer allocations" on public.pioneer_reward_allocations
  for select using (beneficiary_type='user' and beneficiary_id=auth.uid());

revoke all on function public.record_pioneer_points(text,uuid,text,text,text,text,text,jsonb) from public;
grant execute on function public.record_pioneer_points(text,uuid,text,text,text,text,text,jsonb) to service_role;

create or replace function public.freeze_pioneer_season(p_season_id uuid)
returns public.pioneer_seasons
language plpgsql security definer set search_path=public as $$
declare v_season public.pioneer_seasons%rowtype;
begin
  update public.pioneer_seasons
    set status='frozen', snapshot_at=now()
    where id=p_season_id and status='active' and ends_at <= now()
    returning * into v_season;
  if not found then raise exception 'Season is not eligible to freeze'; end if;
  return v_season;
end $$;

revoke all on function public.freeze_pioneer_season(uuid) from public;
grant execute on function public.freeze_pioneer_season(uuid) to service_role;

create or replace function public.review_pioneer_event(
  p_event_id uuid,
  p_decision text,
  p_reviewer_id uuid,
  p_reason text default null
) returns public.pioneer_point_events
language plpgsql security definer set search_path=public as $$
declare v_event public.pioneer_point_events%rowtype;
begin
  if p_decision not in ('verified','rejected','reversed') then
    raise exception 'Invalid review decision';
  end if;
  select * into v_event from public.pioneer_point_events where id=p_event_id for update;
  if not found then raise exception 'Pioneer event not found'; end if;
  if p_decision in ('verified','rejected') and v_event.status <> 'pending' then
    raise exception 'Only pending events can be verified or rejected';
  end if;
  if p_decision='reversed' and v_event.status <> 'verified' then
    raise exception 'Only verified events can be reversed';
  end if;
  if p_decision in ('rejected','reversed') and nullif(trim(coalesce(p_reason,'')),'') is null then
    raise exception 'A reason is required';
  end if;
  update public.pioneer_point_events set
    status=p_decision,
    verified_at=case when p_decision='verified' then now() else verified_at end,
    verified_by=p_reviewer_id,
    reason=p_reason,
    metadata=metadata || jsonb_build_object(
      'reviewed_at',now(),
      'review_decision',p_decision,
      'reviewer_id',p_reviewer_id
    )
  where id=p_event_id returning * into v_event;
  return v_event;
end $$;

revoke all on function public.review_pioneer_event(uuid,text,uuid,text) from public;
grant execute on function public.review_pioneer_event(uuid,text,uuid,text) to service_role;

create or replace function public.record_venue_pioneer_onboarding()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  perform public.record_pioneer_points(
    'venue',new.id,'venue','venue_onboarded','venues',new.id::text,
    'venue:'||new.id::text||':onboarded',
    jsonb_build_object('owner_id',new.owner_id,'venue_name',new.name,'address',new.address)
  );
  return new;
exception
  when others then
    -- Venue creation must never fail because no season/rule is active.
    raise warning 'Pioneer venue receipt skipped for %: %',new.id,sqlerrm;
    return new;
end $$;

drop trigger if exists trg_record_venue_pioneer_onboarding on public.venues;
create trigger trg_record_venue_pioneer_onboarding
  after insert on public.venues for each row
  execute function public.record_venue_pioneer_onboarding();

insert into public.pioneer_seasons(
  slug,name,description,starts_at,ends_at,status,terms_version
) values (
  'genesis-2026','Genesis Season',
  'Records verified contributions from the members, creators, hosts, venues, and community builders establishing Promorang.',
  '2026-07-01T00:00:00Z','2026-12-31T23:59:59Z','active','2026-07-01'
) on conflict(slug) do nothing;

insert into public.pioneer_rules(season_id,event_type,contributor_type,base_points,daily_cap,season_cap,requires_verification,description)
select s.id, r.event_type, r.contributor_type, r.base_points, r.daily_cap, r.season_cap, r.requires_verification, r.description
from public.pioneer_seasons s
cross join (values
  ('daily_active','member',2::numeric,2::numeric,300::numeric,false,'Meaningful activity on a distinct day'),
  ('qualified_engagement','member',3,30,1500,true,'Authentic engagement that passes quality checks'),
  ('original_content','creator',25,100,5000,true,'Original published content with verified ownership'),
  ('moment_hosted','host',100,200,10000,true,'A completed Moment with verified participation'),
  ('moment_quality','host',50,150,7500,true,'Retention, attendance, and participant satisfaction'),
  ('venue_onboarded','venue',500,500,500,true,'A verified venue completes onboarding'),
  ('moment_facilitated','venue',125,500,15000,true,'A completed Moment is facilitated at the venue'),
  ('moment_hosted','venue',175,350,15000,true,'The venue also serves as the verified Moment host'),
  ('qualified_referral','referrer',50,500,10000,true,'A referred person verifies and becomes meaningfully active'),
  ('community_contribution','community_builder',20,100,5000,true,'Verified moderation, support, or community building')
) as r(event_type,contributor_type,base_points,daily_cap,season_cap,requires_verification,description)
where s.slug='genesis-2026'
on conflict(season_id,event_type,contributor_type) do nothing;

comment on table public.pioneer_point_events is
  'Non-cash contribution receipts. Pioneer Points are non-transferable and do not guarantee a reward, ownership, or future value.';
