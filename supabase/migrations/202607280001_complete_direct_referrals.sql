-- Complete the direct-referral loop.
-- Policy: the person who made the invitation receives 5% of every canonical
-- points, gems, or USD earning made by their invitee. No multi-level payout.

create table if not exists public.referral_link_clicks (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid not null references public.referral_codes(id) on delete cascade,
  referrer_id uuid not null references public.users(id) on delete cascade,
  session_id text not null,
  anonymous_id text,
  landing_path text,
  referrer_url text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (referral_code_id, session_id)
);

create index if not exists idx_referral_link_clicks_referrer_created
  on public.referral_link_clicks(referrer_id, created_at desc);

alter table public.referral_link_clicks enable row level security;

create policy "Referrers read own link clicks"
  on public.referral_link_clicks for select
  using (auth.uid() = referrer_id);

-- The public API records clicks with the service role. Browsers cannot insert
-- directly, which keeps attribution validation server-side.
revoke insert, update, delete on public.referral_link_clicks from anon, authenticated;

-- Retire variable-rate copy. The paid policy is deliberately one transparent
-- direct rate until Promorang intentionally ships a funded tier program.
update public.referral_tiers
set commission_rate = 0.05,
    bonus_rate = 0,
    perks = jsonb_build_array(
      '5% direct commission on supported invitee earnings',
      'Referral dashboard and earning history'
    );

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
  if p_earning_amount <= 0 then return; end if;
  if p_earning_currency not in ('usd', 'gems', 'points') then return; end if;

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
    jsonb_build_object(
      'referred_user_id', p_referred_user_id,
      'earning_type', p_earning_type,
      'source_transaction_id', p_source_transaction_id
    )
  );

  return next v_commission;
end;
$$;

-- Every canonical earning now participates automatically. Referral commissions
-- are a different transaction type, so the trigger cannot recurse.
create or replace function public.award_referral_from_economy_transaction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.transaction_type = 'earn'
     and new.amount > 0
     and new.currency in ('points', 'gems', 'usd') then
    perform public.award_direct_referral_commission(
      new.user_id,
      new.source,
      new.amount,
      new.currency,
      new.id,
      'economy_transactions',
      new.metadata || jsonb_build_object(
        'origin_reference_id', new.reference_id,
        'origin_reference_table', new.reference_table,
        'origin_idempotency_key', new.idempotency_key
      )
    );

    -- A referred member becomes qualified once their canonical wallet reaches
    -- the existing 100-point activation threshold. This is ledger-driven, so it
    -- also works for earning paths that do not call the legacy JS tracker.
    update public.user_referrals r
    set status = 'active',
        activated_at = coalesce(r.activated_at, now())
    where r.referred_id = new.user_id
      and r.status = 'pending'
      and exists (
        select 1 from public.economy_wallets w
        where w.user_id = new.user_id and w.points >= 100
      );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_award_referral_from_economy_transaction
  on public.economy_transactions;
create trigger trg_award_referral_from_economy_transaction
  after insert on public.economy_transactions
  for each row execute function public.award_referral_from_economy_transaction();

-- This helper previously called the commission function itself. The ledger
-- trigger now owns that responsibility, preventing two payouts for one earning.
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
  return true;
end;
$$;

comment on table public.referral_link_clicks is
  'Deduplicated visits to Promorang referral links, captured before signup.';
comment on function public.award_referral_from_economy_transaction is
  'Pays the direct referrer 5% whenever an invitee receives a canonical points, gems, or USD earning.';
