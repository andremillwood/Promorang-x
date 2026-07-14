-- Gem-native activation economy.
-- Canonical rule: 1 Gem = 1 USD of platform value.
-- All internal funding, access, rewards, refunds, and payouts settle in Gems.

alter table public.proposals add column if not exists funding_goal_gems numeric(14,2) check (funding_goal_gems is null or funding_goal_gems >= 0);
update public.proposals set funding_goal_gems = budget where funding_goal_gems is null and budget is not null;

update public.activation_access_tiers set metadata = metadata || jsonb_build_object('legacy_currency', currency) where upper(currency) <> 'GEMS';
update public.activation_access_tiers set currency = 'GEMS';
alter table public.activation_access_tiers alter column currency set default 'GEMS';
alter table public.activation_access_tiers drop constraint if exists activation_access_tiers_currency_check;
alter table public.activation_access_tiers add constraint activation_access_tiers_currency_check check (upper(currency) = 'GEMS');

update public.activation_access_passes set metadata = metadata || jsonb_build_object('legacy_currency', currency) where upper(currency) <> 'GEMS';
update public.activation_access_passes set currency = 'GEMS';
alter table public.activation_access_passes alter column currency set default 'GEMS';
alter table public.activation_access_passes drop constraint if exists activation_access_passes_currency_check;
alter table public.activation_access_passes add constraint activation_access_passes_currency_check check (upper(currency) = 'GEMS');

update public.activation_contributions set metadata = metadata || jsonb_build_object('legacy_currency', currency) where amount is not null and upper(currency) <> 'GEMS';
update public.activation_contributions set currency = 'GEMS' where amount is not null;
alter table public.activation_contributions alter column currency set default 'GEMS';

update public.activation_payout_allocations set metadata = metadata || jsonb_build_object('legacy_currency', currency) where upper(currency) <> 'GEMS';
update public.activation_payout_allocations set currency = 'GEMS';
alter table public.activation_payout_allocations alter column currency set default 'GEMS';
alter table public.activation_payout_allocations drop constraint if exists activation_payout_allocations_currency_check;
alter table public.activation_payout_allocations add constraint activation_payout_allocations_currency_check check (upper(currency) = 'GEMS');

update public.activation_funding_events set metadata = metadata || jsonb_build_object('legacy_currency', currency) where upper(currency) <> 'GEMS';
update public.activation_funding_events set currency = 'GEMS';
alter table public.activation_funding_events alter column currency set default 'GEMS';
alter table public.activation_funding_events drop constraint if exists activation_funding_events_currency_check;
alter table public.activation_funding_events add constraint activation_funding_events_currency_check check (upper(currency) = 'GEMS');

create table if not exists public.activation_gem_reserves (
  proposal_id uuid primary key references public.proposals(id) on delete cascade,
  secured_gems numeric(18,2) not null default 0 check (secured_gems >= 0),
  released_gems numeric(18,2) not null default 0 check (released_gems >= 0),
  refunded_gems numeric(18,2) not null default 0 check (refunded_gems >= 0),
  updated_at timestamptz not null default now(),
  check (released_gems + refunded_gems <= secured_gems)
);

create table if not exists public.activation_gem_reservations (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  access_pass_id uuid references public.activation_access_passes(id) on delete set null,
  contribution_id uuid references public.activation_contributions(id) on delete set null,
  amount_gems numeric(18,2) not null check (amount_gems > 0),
  purpose text not null check (purpose in ('activation_funding', 'access_purchase', 'reward_pool', 'partner_contribution')),
  status text not null default 'secured' check (status in ('secured', 'partially_released', 'released', 'partially_refunded', 'refunded', 'disputed')),
  released_gems numeric(18,2) not null default 0 check (released_gems >= 0),
  refunded_gems numeric(18,2) not null default 0 check (refunded_gems >= 0),
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  secured_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (released_gems + refunded_gems <= amount_gems)
);

create table if not exists public.gem_purchase_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gems_amount numeric(18,2) not null check (gems_amount > 0),
  usd_amount numeric(18,2) not null check (usd_amount > 0),
  provider text not null,
  provider_reference text not null,
  status text not null default 'credited' check (status in ('credited', 'reversed', 'chargeback')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(provider, provider_reference),
  check (gems_amount = usd_amount)
);

create table if not exists public.gem_withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gems_amount numeric(18,2) not null check (gems_amount > 0),
  usd_amount numeric(18,2) not null check (usd_amount > 0),
  fee_gems numeric(18,2) not null default 0 check (fee_gems >= 0),
  status text not null default 'requested' check (status in ('requested', 'reviewing', 'approved', 'paid', 'declined', 'cancelled', 'reversed')),
  payout_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (gems_amount = usd_amount)
);

create index if not exists idx_activation_gem_reservations_proposal on public.activation_gem_reservations(proposal_id, status, secured_at desc);
create index if not exists idx_activation_gem_reservations_user on public.activation_gem_reservations(user_id, status, secured_at desc);
create index if not exists idx_gem_purchase_receipts_user on public.gem_purchase_receipts(user_id, created_at desc);
create index if not exists idx_gem_withdrawals_user on public.gem_withdrawal_requests(user_id, status, created_at desc);

create or replace function public.secure_activation_gems(p_proposal_id uuid, p_amount_gems numeric, p_idempotency_key text)
returns public.activation_gem_reservations
language plpgsql security definer set search_path = public as $$
declare v_row public.activation_gem_reservations%rowtype; v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Sign in to secure Gems'; end if;
  if p_amount_gems <= 0 then raise exception 'Gem amount must be positive'; end if;
  if length(trim(p_idempotency_key)) < 8 then raise exception 'A stable request key is required'; end if;
  select * into v_row from public.activation_gem_reservations where idempotency_key = p_idempotency_key;
  if found then return v_row; end if;
  if not exists (select 1 from public.proposals where id = p_proposal_id and lifecycle_state in ('aligned','funding','funded')) then raise exception 'This activation is not accepting Gem funding'; end if;
  perform public.post_economy_transaction(v_user, 'gems', -p_amount_gems, 'spend', 'activation_gem_secured', p_idempotency_key || ':debit', p_proposal_id, 'proposals', 'Secure Gems for activation', jsonb_build_object('usd_equivalent', p_amount_gems));
  insert into public.activation_gem_reservations(proposal_id,user_id,amount_gems,purpose,idempotency_key)
    values(p_proposal_id,v_user,p_amount_gems,'activation_funding',p_idempotency_key) returning * into v_row;
  insert into public.activation_gem_reserves(proposal_id,secured_gems) values(p_proposal_id,p_amount_gems)
    on conflict(proposal_id) do update set secured_gems=public.activation_gem_reserves.secured_gems+excluded.secured_gems,updated_at=now();
  insert into public.activation_funding_events(proposal_id,payer_user_id,amount,currency,event_type,provider,provider_reference,verified_by,metadata)
    values(p_proposal_id,v_user,p_amount_gems,'GEMS','captured','gem_wallet',p_idempotency_key,'ledger',jsonb_build_object('reservation_id',v_row.id,'usd_equivalent',p_amount_gems));
  return v_row;
end $$;

create or replace function public.purchase_activation_access_with_gems(p_tier_id uuid, p_idempotency_key text)
returns public.activation_access_passes
language plpgsql security definer set search_path = public as $$
declare v_tier public.activation_access_tiers%rowtype; v_pass public.activation_access_passes%rowtype; v_res public.activation_gem_reservations%rowtype; v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception 'Sign in to use Gems'; end if;
  select * into v_tier from public.activation_access_tiers where id=p_tier_id and status='open' and access_type='paid' for update;
  if not found then raise exception 'This paid access option is not available'; end if;
  if v_tier.capacity is not null and v_tier.issued_count >= v_tier.capacity then raise exception 'This access option is full'; end if;
  if exists(select 1 from public.activation_access_passes where tier_id=p_tier_id and user_id=v_user and status in ('reserved','active','used')) then raise exception 'You already have this access'; end if;
  perform public.post_economy_transaction(v_user,'gems',-v_tier.price,'spend','activation_access_purchase',p_idempotency_key||':debit',v_tier.id,'activation_access_tiers','Purchase Moment access with Gems',jsonb_build_object('usd_equivalent',v_tier.price));
  insert into public.activation_access_passes(tier_id,proposal_id,moment_id,user_id,status,amount_paid,currency,source,activated_at)
    values(v_tier.id,v_tier.proposal_id,v_tier.moment_id,v_user,'active',v_tier.price,'GEMS','purchase',now()) returning * into v_pass;
  insert into public.activation_gem_reservations(proposal_id,user_id,access_pass_id,amount_gems,purpose,idempotency_key)
    values(v_tier.proposal_id,v_user,v_pass.id,v_tier.price,'access_purchase',p_idempotency_key) returning * into v_res;
  insert into public.activation_gem_reserves(proposal_id,secured_gems) values(v_tier.proposal_id,v_tier.price)
    on conflict(proposal_id) do update set secured_gems=public.activation_gem_reserves.secured_gems+excluded.secured_gems,updated_at=now();
  update public.activation_access_tiers set issued_count=issued_count+1,status=case when capacity is not null and issued_count+1>=capacity then 'sold_out' else status end,updated_at=now() where id=v_tier.id;
  return v_pass;
end $$;

create or replace function public.release_activation_payout_gems(p_allocation_id uuid, p_idempotency_key text)
returns public.activation_payout_allocations
language plpgsql security definer set search_path = public as $$
declare v_pay public.activation_payout_allocations%rowtype; v_reserve public.activation_gem_reserves%rowtype;
begin
  select * into v_pay from public.activation_payout_allocations where id=p_allocation_id and status='earned' for update;
  if not found then raise exception 'This payout has not been earned'; end if;
  if not public.can_manage_activation(v_pay.proposal_id) then raise exception 'Not authorized'; end if;
  select * into v_reserve from public.activation_gem_reserves where proposal_id=v_pay.proposal_id for update;
  if not found or v_reserve.secured_gems-v_reserve.released_gems-v_reserve.refunded_gems < v_pay.amount then raise exception 'Insufficient secured Gems'; end if;
  perform public.post_economy_transaction(v_pay.recipient_user_id,'gems',v_pay.amount,'earn','activation_payout',p_idempotency_key,v_pay.id,'activation_payout_allocations',v_pay.purpose,jsonb_build_object('usd_equivalent',v_pay.amount));
  update public.activation_gem_reserves set released_gems=released_gems+v_pay.amount,updated_at=now() where proposal_id=v_pay.proposal_id;
  update public.activation_payout_allocations set status='paid',paid_at=now(),currency='GEMS',updated_at=now() where id=v_pay.id returning * into v_pay;
  return v_pay;
end $$;

create or replace function public.refund_activation_gem_reservation(p_reservation_id uuid, p_idempotency_key text)
returns public.activation_gem_reservations
language plpgsql security definer set search_path = public as $$
declare v_row public.activation_gem_reservations%rowtype; v_refund numeric;
begin
  select * into v_row from public.activation_gem_reservations where id=p_reservation_id and status in ('secured','partially_released','partially_refunded','disputed') for update;
  if not found then raise exception 'This Gem reservation is not refundable'; end if;
  if not public.can_manage_activation(v_row.proposal_id) then raise exception 'Not authorized to refund this reservation'; end if;
  v_refund:=v_row.amount_gems-v_row.released_gems-v_row.refunded_gems;
  if v_refund<=0 then raise exception 'No Gems remain to refund'; end if;
  perform public.post_economy_transaction(v_row.user_id,'gems',v_refund,'refund','activation_gem_refund',p_idempotency_key,v_row.id,'activation_gem_reservations','Return secured activation Gems',jsonb_build_object('usd_equivalent',v_refund));
  update public.activation_gem_reserves set refunded_gems=refunded_gems+v_refund,updated_at=now() where proposal_id=v_row.proposal_id;
  update public.activation_gem_reservations set refunded_gems=refunded_gems+v_refund,status='refunded',updated_at=now() where id=v_row.id returning * into v_row;
  if v_row.access_pass_id is not null then update public.activation_access_passes set status='refunded',cancelled_at=now() where id=v_row.access_pass_id; end if;
  return v_row;
end $$;

create or replace function public.credit_purchased_gems(p_user_id uuid,p_usd_amount numeric,p_provider text,p_provider_reference text,p_metadata jsonb default '{}'::jsonb)
returns public.gem_purchase_receipts
language plpgsql security definer set search_path = public as $$
declare v_row public.gem_purchase_receipts%rowtype;
begin
  if p_usd_amount <= 0 then raise exception 'Purchase amount must be positive'; end if;
  insert into public.gem_purchase_receipts(user_id,gems_amount,usd_amount,provider,provider_reference,metadata)
    values(p_user_id,p_usd_amount,p_usd_amount,p_provider,p_provider_reference,coalesce(p_metadata,'{}')) returning * into v_row;
  perform public.post_economy_transaction(p_user_id,'gems',p_usd_amount,'earn','gem_purchase','gem-purchase:'||p_provider||':'||p_provider_reference,v_row.id,'gem_purchase_receipts','Gems purchased at 1 Gem = 1 USD',jsonb_build_object('usd_amount',p_usd_amount));
  return v_row;
end $$;

alter table public.activation_gem_reserves enable row level security;
alter table public.activation_gem_reservations enable row level security;
alter table public.gem_purchase_receipts enable row level security;
alter table public.gem_withdrawal_requests enable row level security;
drop policy if exists "Stakeholders read activation Gem reserve" on public.activation_gem_reserves;
create policy "Stakeholders read activation Gem reserve" on public.activation_gem_reserves for select using(public.can_manage_activation(proposal_id) or exists(select 1 from public.activation_gem_reservations r where r.proposal_id=activation_gem_reserves.proposal_id and r.user_id=auth.uid()));
drop policy if exists "Users read own Gem reservations" on public.activation_gem_reservations;
create policy "Users read own Gem reservations" on public.activation_gem_reservations for select using(user_id=auth.uid() or public.can_manage_activation(proposal_id));
drop policy if exists "Users read own Gem purchases" on public.gem_purchase_receipts;
create policy "Users read own Gem purchases" on public.gem_purchase_receipts for select using(user_id=auth.uid());
drop policy if exists "Users read own Gem withdrawals" on public.gem_withdrawal_requests;
create policy "Users read own Gem withdrawals" on public.gem_withdrawal_requests for select using(user_id=auth.uid());

grant execute on function public.secure_activation_gems(uuid,numeric,text) to authenticated;
grant execute on function public.purchase_activation_access_with_gems(uuid,text) to authenticated;
grant execute on function public.release_activation_payout_gems(uuid,text) to authenticated;
grant execute on function public.refund_activation_gem_reservation(uuid,text) to authenticated;
revoke all on function public.queue_activation_payout(uuid) from public,anon,authenticated;
revoke all on function public.record_verified_activation_funding(uuid,uuid,uuid,uuid,numeric,text,text,text) from public,anon,authenticated,service_role;
revoke all on function public.credit_purchased_gems(uuid,numeric,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.credit_purchased_gems(uuid,numeric,text,text,jsonb) to service_role;

comment on column public.proposals.funding_goal_gems is 'Activation funding target in Gems. 1 Gem equals 1 USD of platform value.';
comment on table public.activation_gem_reserves is 'Gems secured against an activation before release or refund; prevents double spending.';
notify pgrst,'reload schema';
