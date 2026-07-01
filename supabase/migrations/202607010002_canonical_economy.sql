-- Canonical Promorang economy.
-- Deliberately avoids the legacy `user_balances` name, which has two incompatible schemas.

create table if not exists public.economy_wallets (
  user_id uuid primary key references public.users(id) on delete cascade,
  points numeric(18,2) not null default 0 check (points >= 0),
  promokeys numeric(18,2) not null default 0 check (promokeys >= 0),
  gems numeric(18,2) not null default 0 check (gems >= 0),
  gold numeric(18,2) not null default 0 check (gold >= 0),
  usd numeric(18,2) not null default 0 check (usd >= 0),
  master_key_unlocked boolean not null default false,
  master_key_expires_at timestamptz,
  daily_promokey_conversions integer not null default 0,
  conversion_day date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.economy_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  currency text not null check (currency in ('points','promokeys','gems','gold','usd')),
  amount numeric(18,2) not null check (amount <> 0),
  balance_after numeric(18,2) not null check (balance_after >= 0),
  transaction_type text not null check (transaction_type in (
    'earn','spend','refund','conversion_debit','conversion_credit',
    'referral_commission','admin_adjustment','migration','reversal'
  )),
  source text not null,
  reference_id uuid,
  reference_table text,
  idempotency_key text not null unique,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_economy_transactions_user_created
  on public.economy_transactions(user_id, created_at desc);
create index if not exists idx_economy_transactions_reference
  on public.economy_transactions(reference_table, reference_id);

insert into public.economy_wallets (user_id, points, promokeys, gems, gold, usd)
select
  u.id,
  greatest(coalesce(nullif(to_jsonb(u)->>'points_balance', '')::numeric, 0), 0),
  greatest(coalesce(
    nullif(to_jsonb(u)->>'keys_balance', '')::numeric,
    nullif(to_jsonb(u)->>'promokeys', '')::numeric,
    0
  ), 0),
  greatest(coalesce(nullif(to_jsonb(u)->>'gems_balance', '')::numeric, 0), 0),
  greatest(coalesce(
    nullif(to_jsonb(u)->>'gold_collected', '')::numeric,
    nullif(to_jsonb(u)->>'gold_balance', '')::numeric,
    0
  ), 0),
  greatest(coalesce(
    nullif(to_jsonb(u)->>'total_earnings_usd', '')::numeric,
    nullif(to_jsonb(u)->>'usd_balance', '')::numeric,
    0
  ), 0)
from public.users u
on conflict (user_id) do nothing;

insert into public.economy_transactions(
  user_id,currency,amount,balance_after,transaction_type,source,idempotency_key,description
)
select w.user_id, c.currency, c.amount, c.amount, 'migration', 'legacy_opening_balance',
  'legacy-opening:' || w.user_id::text || ':' || c.currency, 'Opening balance migrated from legacy wallet'
from public.economy_wallets w
cross join lateral (values
  ('points',w.points),('promokeys',w.promokeys),('gems',w.gems),('gold',w.gold),('usd',w.usd)
) c(currency,amount)
where c.amount > 0
on conflict (idempotency_key) do nothing;

create or replace function public.create_economy_wallet()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.economy_wallets(user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_create_economy_wallet on public.users;
create trigger trg_create_economy_wallet
after insert on public.users for each row execute function public.create_economy_wallet();

create or replace function public.post_economy_transaction(
  p_user_id uuid,
  p_currency text,
  p_amount numeric,
  p_transaction_type text,
  p_source text,
  p_idempotency_key text,
  p_reference_id uuid default null,
  p_reference_table text default null,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb
) returns public.economy_transactions
language plpgsql security definer set search_path = public as $$
declare
  v_wallet public.economy_wallets%rowtype;
  v_existing public.economy_transactions%rowtype;
  v_after numeric(18,2);
  v_tx public.economy_transactions%rowtype;
begin
  if p_currency not in ('points','promokeys','gems','gold','usd') then
    raise exception 'Unsupported currency: %', p_currency;
  end if;
  if p_amount = 0 then raise exception 'Amount cannot be zero'; end if;
  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 3 then
    raise exception 'A stable idempotency key is required';
  end if;

  select * into v_existing from public.economy_transactions
    where idempotency_key = p_idempotency_key;
  if found then return v_existing; end if;

  insert into public.economy_wallets(user_id) values (p_user_id) on conflict do nothing;
  select * into v_wallet from public.economy_wallets where user_id = p_user_id for update;

  v_after := case p_currency
    when 'points' then v_wallet.points
    when 'promokeys' then v_wallet.promokeys
    when 'gems' then v_wallet.gems
    when 'gold' then v_wallet.gold
    when 'usd' then v_wallet.usd
  end + round(p_amount, 2);

  if v_after < 0 then raise exception 'Insufficient % balance', p_currency; end if;

  update public.economy_wallets set
    points = case when p_currency='points' then v_after else points end,
    promokeys = case when p_currency='promokeys' then v_after else promokeys end,
    gems = case when p_currency='gems' then v_after else gems end,
    gold = case when p_currency='gold' then v_after else gold end,
    usd = case when p_currency='usd' then v_after else usd end,
    updated_at = now()
  where user_id = p_user_id;

  insert into public.economy_transactions(
    user_id,currency,amount,balance_after,transaction_type,source,
    reference_id,reference_table,idempotency_key,description,metadata
  ) values (
    p_user_id,p_currency,round(p_amount,2),v_after,p_transaction_type,p_source,
    p_reference_id,p_reference_table,p_idempotency_key,p_description,
    coalesce(p_metadata,'{}'::jsonb)
  ) returning * into v_tx;
  return v_tx;
exception when unique_violation then
  select * into v_existing from public.economy_transactions
    where idempotency_key = p_idempotency_key;
  return v_existing;
end;
$$;

create or replace function public.convert_points_to_promokeys(
  p_user_id uuid,
  p_quantity integer,
  p_idempotency_key text
) returns public.economy_wallets
language plpgsql security definer set search_path = public as $$
declare
  v_wallet public.economy_wallets%rowtype;
  v_cost numeric := p_quantity * 500;
begin
  if p_quantity <= 0 then raise exception 'Quantity must be positive'; end if;
  insert into public.economy_wallets(user_id) values(p_user_id) on conflict do nothing;
  select * into v_wallet from public.economy_wallets where user_id=p_user_id for update;

  if v_wallet.conversion_day <> current_date then
    update public.economy_wallets set conversion_day=current_date, daily_promokey_conversions=0
      where user_id=p_user_id returning * into v_wallet;
  end if;
  if v_wallet.daily_promokey_conversions + p_quantity > 3 then
    raise exception 'Daily PromoKey conversion limit reached';
  end if;

  perform public.post_economy_transaction(
    p_user_id,'points',-v_cost,'conversion_debit','points_to_promokeys',
    p_idempotency_key || ':points',null,null,'Convert points to PromoKeys',
    jsonb_build_object('quantity',p_quantity,'rate',500)
  );
  perform public.post_economy_transaction(
    p_user_id,'promokeys',p_quantity,'conversion_credit','points_to_promokeys',
    p_idempotency_key || ':promokeys',null,null,'Convert points to PromoKeys',
    jsonb_build_object('quantity',p_quantity,'rate',500)
  );
  update public.economy_wallets
    set daily_promokey_conversions=daily_promokey_conversions+p_quantity, updated_at=now()
    where user_id=p_user_id returning * into v_wallet;
  return v_wallet;
end;
$$;

alter table public.economy_wallets enable row level security;
alter table public.economy_transactions enable row level security;
create policy "Users read own economy wallet" on public.economy_wallets
  for select using (auth.uid() = user_id);
create policy "Users read own economy transactions" on public.economy_transactions
  for select using (auth.uid() = user_id);

revoke all on function public.post_economy_transaction(uuid,text,numeric,text,text,text,uuid,text,text,jsonb) from public;
revoke all on function public.convert_points_to_promokeys(uuid,integer,text) from public;
grant execute on function public.post_economy_transaction(uuid,text,numeric,text,text,text,uuid,text,text,jsonb) to service_role;
grant execute on function public.convert_points_to_promokeys(uuid,integer,text) to service_role;

create or replace view public.economy_reconciliation as
select
  w.user_id,
  c.currency,
  c.wallet_balance,
  coalesce(sum(t.amount), 0) as ledger_balance,
  c.wallet_balance - coalesce(sum(t.amount), 0) as difference
from public.economy_wallets w
cross join lateral (values
  ('points', w.points), ('promokeys', w.promokeys), ('gems', w.gems),
  ('gold', w.gold), ('usd', w.usd)
) as c(currency, wallet_balance)
left join public.economy_transactions t
  on t.user_id=w.user_id and t.currency=c.currency
group by w.user_id, c.currency, c.wallet_balance;

comment on view public.economy_reconciliation is
  'Operations check: non-zero differences identify balances not fully represented in the canonical ledger.';
