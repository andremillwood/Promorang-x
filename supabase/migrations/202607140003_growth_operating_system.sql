-- Canonical growth operating system.
-- Connects anonymous acquisition, activation, verified outcomes, referrals,
-- revenue, retention, and experiments without replacing domain event tables.

create table if not exists public.growth_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  anonymous_id text,
  session_id text,
  user_id uuid references public.users(id) on delete set null,
  event_name text not null check (event_name in (
    'page_view', 'cta_clicked', 'signup_started', 'signup_completed',
    'onboarding_completed', 'moment_joined', 'proof_submitted',
    'verified_outcome', 'share_created', 'referral_signup',
    'referral_activated', 'checkout_started', 'payment_succeeded',
    'repeat_outcome'
  )),
  journey text not null check (journey in ('participant', 'commercial', 'shared')),
  stage text not null check (stage in (
    'acquired', 'captured', 'activated', 'outcome', 'amplified', 'monetized', 'retained'
  )),
  source text,
  medium text,
  campaign text,
  content text,
  term text,
  referrer_url text,
  referral_code text,
  promopush_campaign_id uuid references public.promopush_campaigns(id) on delete set null,
  promopush_channel_id uuid references public.promopush_channels(id) on delete set null,
  moment_id uuid references public.moments(id) on delete set null,
  entity_type text,
  entity_id text,
  experiment_key text,
  experiment_variant text,
  value numeric(14,2) check (value is null or value >= 0),
  currency text,
  properties jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now(),
  check (anonymous_id is not null or user_id is not null)
);

create unique index if not exists growth_events_idempotency_idx
  on public.growth_events(idempotency_key)
  where idempotency_key is not null;
create index if not exists growth_events_funnel_idx
  on public.growth_events(journey, stage, occurred_at desc);
create index if not exists growth_events_user_idx
  on public.growth_events(user_id, occurred_at desc)
  where user_id is not null;
create index if not exists growth_events_anonymous_idx
  on public.growth_events(anonymous_id, occurred_at desc)
  where anonymous_id is not null;
create index if not exists growth_events_source_idx
  on public.growth_events(source, campaign, occurred_at desc);
create index if not exists growth_events_moment_idx
  on public.growth_events(moment_id, occurred_at desc)
  where moment_id is not null;

create table if not exists public.growth_identity_links (
  anonymous_id text primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  linked_at timestamptz not null default now(),
  first_touch jsonb not null default '{}'::jsonb,
  last_touch jsonb not null default '{}'::jsonb
);

create index if not exists growth_identity_links_user_idx
  on public.growth_identity_links(user_id);

create table if not exists public.growth_experiments (
  experiment_key text primary key,
  name text not null,
  hypothesis text not null,
  journey text not null check (journey in ('participant', 'commercial', 'shared')),
  primary_event text not null,
  guardrail_event text,
  variants jsonb not null check (jsonb_typeof(variants) = 'array'),
  allocation_percent integer not null default 100 check (allocation_percent between 0 and 100),
  status text not null default 'draft' check (status in ('draft', 'running', 'paused', 'completed')),
  starts_at timestamptz,
  ends_at timestamptz,
  decision text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.growth_experiment_assignments (
  id uuid primary key default gen_random_uuid(),
  experiment_key text not null references public.growth_experiments(experiment_key) on delete cascade,
  anonymous_id text,
  user_id uuid references public.users(id) on delete cascade,
  variant text not null,
  assigned_at timestamptz not null default now(),
  check (anonymous_id is not null or user_id is not null)
);

create unique index if not exists growth_experiment_anonymous_unique
  on public.growth_experiment_assignments(experiment_key, anonymous_id)
  where anonymous_id is not null;
create unique index if not exists growth_experiment_user_unique
  on public.growth_experiment_assignments(experiment_key, user_id)
  where user_id is not null;

-- A verified outcome becomes a retention signal when the same person has a
-- previous verified outcome at least seven days earlier.
create or replace function public.record_repeat_growth_outcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.event_name = 'verified_outcome' and new.user_id is not null and exists (
    select 1 from public.growth_events previous
    where previous.user_id = new.user_id
      and previous.event_name = 'verified_outcome'
      and previous.id <> new.id
      and previous.occurred_at <= new.occurred_at - interval '7 days'
  ) then
    insert into public.growth_events (
      occurred_at, anonymous_id, session_id, user_id, event_name, journey, stage,
      source, medium, campaign, referral_code, promopush_campaign_id,
      promopush_channel_id, moment_id, entity_type, entity_id, properties,
      idempotency_key
    ) values (
      new.occurred_at, new.anonymous_id, new.session_id, new.user_id,
      'repeat_outcome', new.journey, 'retained', new.source, new.medium,
      new.campaign, new.referral_code, new.promopush_campaign_id,
      new.promopush_channel_id, new.moment_id, new.entity_type, new.entity_id,
      jsonb_build_object('source_growth_event_id', new.id),
      'growth:repeat-outcome:' || new.id::text
    ) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_record_repeat_growth_outcome on public.growth_events;
create trigger trigger_record_repeat_growth_outcome
after insert on public.growth_events
for each row execute function public.record_repeat_growth_outcome();

alter table public.growth_events enable row level security;
alter table public.growth_identity_links enable row level security;
alter table public.growth_experiments enable row level security;
alter table public.growth_experiment_assignments enable row level security;

drop policy if exists growth_events_read_own on public.growth_events;
create policy growth_events_read_own on public.growth_events for select
  using (auth.uid() = user_id);

drop policy if exists growth_identity_links_read_own on public.growth_identity_links;
create policy growth_identity_links_read_own on public.growth_identity_links for select
  using (auth.uid() = user_id);

-- Canonical weekly north-star view: verified outcomes produced by active Moments.
create or replace view public.growth_weekly_scorecard as
select
  date_trunc('week', occurred_at) as week_start,
  journey,
  count(*) filter (where event_name = 'verified_outcome') as verified_outcomes,
  count(distinct moment_id) filter (where event_name = 'verified_outcome') as active_moments,
  count(distinct user_id) filter (where event_name = 'signup_completed') as signups,
  count(distinct user_id) filter (where stage = 'activated') as activated_users,
  count(distinct user_id) filter (where event_name = 'referral_activated') as activated_referrals,
  count(distinct user_id) filter (where stage = 'retained') as retained_users,
  coalesce(sum(value) filter (where event_name = 'payment_succeeded'), 0) as attributable_revenue
from public.growth_events
group by 1, 2;

comment on table public.growth_events is
  'Canonical cross-product growth events. Domain tables remain authoritative for proof, payments, referrals, and rewards.';
comment on view public.growth_weekly_scorecard is
  'Weekly north-star scorecard centered on verified outcomes per active Moment.';

notify pgrst, 'reload schema';
