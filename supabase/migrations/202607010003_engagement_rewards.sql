-- Canonical engagement rewards and anti-farming controls.

create table if not exists public.engagement_reward_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  action_type text not null check (action_type in ('view','like','comment','save','share')),
  reference_type text not null,
  reference_id text not null,
  points_awarded numeric(14,2) not null default 0,
  promoshare_entries integer not null default 0,
  verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, action_type, reference_type, reference_id)
);

create index if not exists idx_engagement_rewards_user_day
  on public.engagement_reward_events(user_id, created_at desc);

delete from public.content_distribution_actions older
using public.content_distribution_actions newer
where older.user_id is not null
  and older.campaign_id = newer.campaign_id
  and older.user_id = newer.user_id
  and older.action_type = newer.action_type
  and coalesce(older.asset_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(newer.asset_id, '00000000-0000-0000-0000-000000000000'::uuid)
  and (older.created_at > newer.created_at
    or (older.created_at = newer.created_at and older.id::text > newer.id::text));

create unique index if not exists uq_content_distribution_rewarded_action
  on public.content_distribution_actions(
    campaign_id, user_id, action_type, coalesce(asset_id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) where user_id is not null;

alter table public.content_distribution_campaigns
  add column if not exists gems_budget_spent numeric(14,2) not null default 0
  check (gems_budget_spent >= 0);

alter table public.content_distribution_actions
  drop constraint if exists content_distribution_actions_action_type_check;
alter table public.content_distribution_actions
  add constraint content_distribution_actions_action_type_check check (action_type in (
    'impression','view','click','like','engage','share','repost','comment','save',
    'signup','conversion','purchase','ugc_creation','content_clipping','proof_verified'
  ));

alter table public.engagement_reward_events enable row level security;
create policy "Users read own engagement rewards" on public.engagement_reward_events
  for select using (auth.uid() = user_id);

comment on table public.engagement_reward_events is
  'One rewarded organic engagement per user/action/content target; used for daily caps and audit receipts.';

create or replace function public.award_funded_campaign_gems(
  p_campaign_id uuid,
  p_action_id uuid,
  p_user_id uuid,
  p_amount numeric
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_campaign public.content_distribution_campaigns%rowtype;
begin
  if p_amount <= 0 then return false; end if;
  select * into v_campaign from public.content_distribution_campaigns
    where id=p_campaign_id and status='active' for update;
  if not found or lower(v_campaign.budget_currency) <> 'gems' then return false; end if;
  if v_campaign.gems_budget_spent + p_amount > v_campaign.budget_amount then return false; end if;

  update public.content_distribution_campaigns
    set gems_budget_spent=gems_budget_spent+p_amount, updated_at=now()
    where id=p_campaign_id;
  perform public.credit_user_earning(
    p_user_id,'funded_content_action',p_amount,'gems',
    'content_distribution_actions',p_action_id,
    jsonb_build_object('campaign_id',p_campaign_id)
  );
  return true;
end;
$$;

revoke all on function public.award_funded_campaign_gems(uuid,uuid,uuid,numeric) from public;
grant execute on function public.award_funded_campaign_gems(uuid,uuid,uuid,numeric) to service_role;
