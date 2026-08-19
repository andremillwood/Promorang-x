-- Purchased Gems stay user-facing units while funding, merchant restriction,
-- redemption and settlement remain separately auditable.
create table if not exists public.gem_funding_balances (
  user_id uuid primary key references public.users(id) on delete cascade,
  purchased_available numeric(14,2) not null default 0 check (purchased_available >= 0),
  promotional_available numeric(14,2) not null default 0 check (promotional_available >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.gem_purchase_fulfillments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  stripe_payment_intent_id text not null unique,
  gems_amount numeric(14,2) not null check (gems_amount > 0),
  fiat_amount numeric(14,2) not null check (fiat_amount > 0),
  fiat_currency text not null default 'USD',
  livemode boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.merchant_gem_cards (
  id uuid primary key default gen_random_uuid(),
  card_number text not null unique,
  owner_user_id uuid not null references public.users(id) on delete restrict,
  merchant_id uuid not null references public.users(id) on delete restrict,
  order_id uuid references public.commerce_orders(id) on delete restrict unique,
  original_gems numeric(14,2) not null check (original_gems > 0),
  remaining_gems numeric(14,2) not null check (remaining_gems >= 0),
  status text not null default 'active' check (status in ('active','partially_redeemed','redeemed','cancelled','refunded','expired')),
  non_reloadable boolean not null default true,
  cash_redeemable boolean not null default false,
  expires_at timestamptz,
  redeemed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.merchant_gem_settlement_ledger (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.merchant_gem_cards(id) on delete restrict,
  order_id uuid not null references public.commerce_orders(id) on delete restrict,
  merchant_id uuid not null references public.users(id) on delete restrict,
  entry_type text not null check (entry_type in ('sale','refund','adjustment')),
  gross_gems numeric(14,2) not null,
  platform_fee_gems numeric(14,2) not null default 0,
  merchant_due_gems numeric(14,2) not null,
  settlement_currency text not null default 'USD',
  gem_to_settlement_rate numeric(14,6) not null default 1,
  settlement_amount numeric(14,2) not null,
  status text not null default 'pending_fulfillment' check (status in ('pending_fulfillment','payable','processing','paid','blocked','reversed','failed')),
  available_at timestamptz,
  payout_method text,
  payout_reference text,
  paid_at timestamptz,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.commerce_orders
  add column if not exists gem_card_id uuid references public.merchant_gem_cards(id),
  add column if not exists gems_paid numeric(14,2) not null default 0;
create index if not exists merchant_gem_cards_owner_idx on public.merchant_gem_cards(owner_user_id,created_at desc);
create index if not exists merchant_gem_cards_merchant_idx on public.merchant_gem_cards(merchant_id,status,created_at desc);
create index if not exists merchant_gem_settlement_queue_idx on public.merchant_gem_settlement_ledger(merchant_id,status,available_at);
alter table public.gem_funding_balances enable row level security;
alter table public.gem_purchase_fulfillments enable row level security;
alter table public.merchant_gem_cards enable row level security;
alter table public.merchant_gem_settlement_ledger enable row level security;
drop policy if exists "Users read own Gem funding balance" on public.gem_funding_balances;
create policy "Users read own Gem funding balance" on public.gem_funding_balances for select using (auth.uid()=user_id);
drop policy if exists "Users read own Gem purchases" on public.gem_purchase_fulfillments;
create policy "Users read own Gem purchases" on public.gem_purchase_fulfillments for select using (auth.uid()=user_id);
drop policy if exists "Owners and merchants read Gem Cards" on public.merchant_gem_cards;
create policy "Owners and merchants read Gem Cards" on public.merchant_gem_cards for select using (auth.uid()=owner_user_id or auth.uid()=merchant_id);
drop policy if exists "Merchants read own Gem settlements" on public.merchant_gem_settlement_ledger;
create policy "Merchants read own Gem settlements" on public.merchant_gem_settlement_ledger for select using (auth.uid()=merchant_id);

create or replace function public.fulfill_purchased_gems(
  p_user_id uuid,p_payment_intent_id text,p_gems_amount numeric,p_fiat_amount numeric,
  p_fiat_currency text,p_livemode boolean default false
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_f public.gem_purchase_fulfillments%rowtype; v_b public.gem_funding_balances%rowtype;
begin
  if p_gems_amount<=0 or p_fiat_amount<=0 then raise exception 'Gem and fiat amounts must be positive'; end if;
  insert into public.gem_purchase_fulfillments(user_id,stripe_payment_intent_id,gems_amount,fiat_amount,fiat_currency,livemode)
  values(p_user_id,p_payment_intent_id,round(p_gems_amount,2),round(p_fiat_amount,2),upper(p_fiat_currency),coalesce(p_livemode,false))
  on conflict(stripe_payment_intent_id) do nothing returning * into v_f;
  if v_f.id is null then
    select * into v_f from public.gem_purchase_fulfillments where stripe_payment_intent_id=p_payment_intent_id;
    if v_f.user_id<>p_user_id or v_f.gems_amount<>round(p_gems_amount,2) or v_f.fiat_amount<>round(p_fiat_amount,2)
      then raise exception 'Payment intent was already fulfilled with different values'; end if;
    select * into v_b from public.gem_funding_balances where user_id=p_user_id;
    return jsonb_build_object('idempotent',true,'transaction_id',v_f.id,'purchased_available',coalesce(v_b.purchased_available,0));
  end if;
  perform public.post_economy_transaction(p_user_id,'gems',round(p_gems_amount,2),'earn','stripe_gems_purchase',
    'stripe:gems:'||p_payment_intent_id,null,'stripe_payment_intents','Purchased Gems',
    jsonb_build_object('fiat_amount',round(p_fiat_amount,2),'fiat_currency',upper(p_fiat_currency),
      'stripe_payment_intent_id',p_payment_intent_id,'funding_type','purchased'));
  insert into public.gem_funding_balances(user_id,purchased_available) values(p_user_id,round(p_gems_amount,2))
  on conflict(user_id) do update set purchased_available=public.gem_funding_balances.purchased_available+excluded.purchased_available,updated_at=now()
  returning * into v_b;
  return jsonb_build_object('idempotent',false,'transaction_id',v_f.id,'purchased_available',v_b.purchased_available);
end $$;

create or replace function public.pay_commerce_order_with_gems(p_order_id uuid,p_buyer_id uuid,p_idempotency_key text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_o public.commerce_orders%rowtype; v_b public.gem_funding_balances%rowtype;
v_c public.merchant_gem_cards%rowtype; v_g numeric(14,2); v_fee numeric(14,2); v_due numeric(14,2);
begin
  select * into v_o from public.commerce_orders where id=p_order_id and buyer_id=p_buyer_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_o.payment_status='paid' and v_o.gem_card_id is not null then
    select * into v_c from public.merchant_gem_cards where id=v_o.gem_card_id;
    return jsonb_build_object('idempotent',true,'order_id',v_o.id,'card_id',v_c.id,'card_number',v_c.card_number,'gems_paid',v_o.gems_paid);
  end if;
  if v_o.payment_status not in ('requires_payment','processing') then raise exception 'Order cannot be paid'; end if;
  if v_o.reservation_expires_at<=now() then raise exception 'Inventory reservation expired'; end if;
  v_g:=round(v_o.total_amount,2);
  select * into v_b from public.gem_funding_balances where user_id=p_buyer_id for update;
  if not found or v_b.purchased_available<v_g then
    raise exception 'Insufficient purchased Gems. Required: %, available: %',v_g,coalesce(v_b.purchased_available,0);
  end if;
  update public.gem_funding_balances set purchased_available=purchased_available-v_g,updated_at=now() where user_id=p_buyer_id;
  perform public.post_economy_transaction(p_buyer_id,'gems',-v_g,'spend','merchant_gem_card_purchase',
    p_idempotency_key||':debit',v_o.id,'commerce_orders','Merchant purchase using purchased Gems',
    jsonb_build_object('merchant_id',v_o.merchant_id,'funding_type','purchased'));
  insert into public.merchant_gem_cards(card_number,owner_user_id,merchant_id,order_id,original_gems,remaining_gems,status,redeemed_at,metadata)
  values('GC-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),p_buyer_id,v_o.merchant_id,v_o.id,v_g,0,'redeemed',now(),
    jsonb_build_object('restriction','merchant_specific','purpose','commerce_order')) returning * into v_c;
  update public.commerce_inventory_reservations set status='consumed',updated_at=now() where order_id=v_o.id and status='held';
  update public.commerce_orders set payment_status='paid',payment_collection='platform',gems_paid=v_g,gem_card_id=v_c.id,
    paid_at=now(),fulfillment_status='unfulfilled',updated_at=now() where id=v_o.id returning * into v_o;
  v_fee:=round(v_g*.125,2); v_due:=v_g-v_fee;
  insert into public.merchant_gem_settlement_ledger(card_id,order_id,merchant_id,entry_type,gross_gems,platform_fee_gems,
    merchant_due_gems,settlement_currency,gem_to_settlement_rate,settlement_amount,status,idempotency_key,metadata)
  values(v_c.id,v_o.id,v_o.merchant_id,'sale',v_g,v_fee,v_due,v_o.currency,1,v_due,'pending_fulfillment',
    p_idempotency_key||':settlement',jsonb_build_object('fulfillment_responsibility','merchant','payout_rail','manual'))
  on conflict(idempotency_key) do nothing;
  return jsonb_build_object('idempotent',false,'order_id',v_o.id,'card_id',v_c.id,'card_number',v_c.card_number,'gems_paid',v_g);
end $$;

create or replace function public.release_gem_settlement_after_fulfillment(p_order_id uuid,p_merchant_id uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  if not exists(select 1 from public.commerce_orders where id=p_order_id and merchant_id=p_merchant_id
    and payment_status='paid' and fulfillment_status in ('delivered','redeemed'))
    then raise exception 'Completed merchant fulfillment is required'; end if;
  update public.merchant_gem_settlement_ledger set status='payable',available_at=now()+interval '2 days',updated_at=now()
    where order_id=p_order_id and merchant_id=p_merchant_id and status='pending_fulfillment';
  get diagnostics v_count=row_count; return v_count;
end $$;

create or replace function public.record_manual_gem_settlement(p_ledger_id uuid,p_merchant_id uuid,p_payout_method text,p_payout_reference text)
returns public.merchant_gem_settlement_ledger language plpgsql security definer set search_path=public as $$
declare v public.merchant_gem_settlement_ledger%rowtype;
begin
  if nullif(trim(p_payout_method),'') is null or nullif(trim(p_payout_reference),'') is null then raise exception 'Payout method and reference are required'; end if;
  select * into v from public.merchant_gem_settlement_ledger where id=p_ledger_id and merchant_id=p_merchant_id for update;
  if not found then raise exception 'Settlement not found'; end if;
  if v.status='paid' then return v; end if;
  if v.status<>'payable' or v.available_at>now() then raise exception 'Settlement is not available for payout'; end if;
  update public.merchant_gem_settlement_ledger set status='paid',payout_method=trim(p_payout_method),
    payout_reference=trim(p_payout_reference),paid_at=now(),updated_at=now() where id=p_ledger_id returning * into v;
  return v;
end $$;

revoke all on function public.fulfill_purchased_gems(uuid,text,numeric,numeric,text,boolean) from public, anon, authenticated;
revoke all on function public.pay_commerce_order_with_gems(uuid,uuid,text) from public, anon, authenticated;
revoke all on function public.release_gem_settlement_after_fulfillment(uuid,uuid) from public, anon, authenticated;
revoke all on function public.record_manual_gem_settlement(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.fulfill_purchased_gems(uuid,text,numeric,numeric,text,boolean) to service_role;
grant execute on function public.pay_commerce_order_with_gems(uuid,uuid,text) to service_role;
grant execute on function public.release_gem_settlement_after_fulfillment(uuid,uuid) to service_role;
grant execute on function public.record_manual_gem_settlement(uuid,uuid,text,text) to service_role;
