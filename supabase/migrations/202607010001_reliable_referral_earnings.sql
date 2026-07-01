-- Pay the direct referrer 5% of every points, gems, or USD earning.
-- The RPC owns the insert and balance credit so application retries cannot double-pay.

alter table public.users
  alter column points_balance type numeric(14,2) using points_balance::numeric,
  alter column gems_balance type numeric(14,2) using gems_balance::numeric,
  alter column referral_earnings_gems type numeric(14,2) using referral_earnings_gems::numeric,
  alter column referral_earnings_points type numeric(14,2) using referral_earnings_points::numeric;

alter table public.user_referrals
  alter column total_gems_earned type numeric(14,2) using total_gems_earned::numeric,
  alter column total_points_earned type numeric(14,2) using total_points_earned::numeric;

create unique index if not exists uq_referral_commission_source
  on public.referral_commissions
    (referrer_id, referred_user_id, earning_type, source_table, source_transaction_id)
  where source_transaction_id is not null and status <> 'reversed';

create or replace function public.award_direct_referral_commission(
  p_referred_user_id uuid,
  p_earning_type text,
  p_earning_amount numeric,
  p_earning_currency text,
  p_source_transaction_id uuid default null,
  p_source_table text default null,
  p_metadata jsonb default '{}'::jsonb
) returns setof public.referral_commissions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referral public.user_referrals%rowtype;
  v_commission public.referral_commissions%rowtype;
  v_amount numeric(14,2);
begin
  if p_earning_amount <= 0 then
    raise exception 'Earning amount must be positive';
  end if;
  if p_earning_currency not in ('usd', 'gems', 'points') then
    raise exception 'Unsupported earning currency: %', p_earning_currency;
  end if;

  select * into v_referral
  from public.user_referrals
  where referred_id = p_referred_user_id
    and status in ('pending', 'active')
  limit 1;

  if not found then return; end if;
  v_amount := round(p_earning_amount * 0.05, 2);
  if v_amount <= 0 then return; end if;

  insert into public.referral_commissions (
    referral_id, referrer_id, referred_user_id, earning_type,
    earning_amount, earning_currency, commission_rate, commission_amount,
    commission_currency, status, source_transaction_id, source_table,
    metadata, processed_at, paid_at
  ) values (
    v_referral.id, v_referral.referrer_id, p_referred_user_id, p_earning_type,
    p_earning_amount, p_earning_currency, 0.05, v_amount,
    p_earning_currency, 'paid', p_source_transaction_id, p_source_table,
    coalesce(p_metadata, '{}'::jsonb), now(), now()
  )
  on conflict (referrer_id, referred_user_id, earning_type, source_table, source_transaction_id)
    where source_transaction_id is not null and status <> 'reversed'
  do nothing
  returning * into v_commission;

  if not found then return; end if;

  perform public.post_economy_transaction(
    v_referral.referrer_id,
    p_earning_currency,
    v_amount,
    'referral_commission',
    'direct_referral',
    'referral:' || v_commission.id::text,
    v_commission.id,
    'referral_commissions',
    '5% direct referral earning',
    jsonb_build_object('referred_user_id', p_referred_user_id, 'earning_type', p_earning_type)
  );

  return next v_commission;
end;
$$;

revoke all on function public.award_direct_referral_commission(uuid,text,numeric,text,uuid,text,jsonb) from public;
grant execute on function public.award_direct_referral_commission(uuid,text,numeric,text,uuid,text,jsonb) to service_role;

comment on function public.award_direct_referral_commission is
  'Atomically records and pays a 5% direct-referrer commission in the currency earned.';

create table if not exists public.user_earning_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  earning_type text not null,
  amount numeric(14,2) not null check (amount > 0),
  currency text not null check (currency in ('usd', 'gems', 'points')),
  source_table text not null,
  source_transaction_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, earning_type, source_table, source_transaction_id)
);

create or replace function public.credit_user_earning(
  p_user_id uuid,
  p_earning_type text,
  p_amount numeric,
  p_currency text,
  p_source_table text,
  p_source_transaction_id uuid,
  p_metadata jsonb default '{}'::jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted uuid;
begin
  if p_amount <= 0 or p_currency not in ('usd', 'gems', 'points') then
    raise exception 'Invalid earning';
  end if;

  insert into public.user_earning_credits (
    user_id, earning_type, amount, currency, source_table,
    source_transaction_id, metadata
  ) values (
    p_user_id, p_earning_type, round(p_amount, 2), p_currency, p_source_table,
    p_source_transaction_id, coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict do nothing
  returning id into v_inserted;

  if v_inserted is null then return false; end if;

  perform public.post_economy_transaction(
    p_user_id,
    p_currency,
    round(p_amount, 2),
    'earn',
    p_earning_type,
    'earning:' || v_inserted::text,
    p_source_transaction_id,
    p_source_table,
    p_earning_type,
    p_metadata
  );

  perform public.award_direct_referral_commission(
    p_user_id, p_earning_type, p_amount, p_currency,
    p_source_transaction_id, p_source_table, p_metadata
  );
  return true;
end;
$$;

revoke all on function public.credit_user_earning(uuid,text,numeric,text,text,uuid,jsonb) from public;
grant execute on function public.credit_user_earning(uuid,text,numeric,text,text,uuid,jsonb) to service_role;

alter table public.user_earning_credits enable row level security;
