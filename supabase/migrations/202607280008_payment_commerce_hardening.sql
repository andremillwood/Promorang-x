-- Payment, subscription, inventory, fulfillment, and merchant-settlement state.

create table if not exists public.stripe_event_processing (
  stripe_event_id text primary key,
  event_type text not null,
  status text not null default 'processing'
    check (status in ('processing','processed','failed')),
  attempts integer not null default 1,
  last_error text,
  payload jsonb not null default '{}'::jsonb,
  first_received_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.stakeholder_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stakeholder_role text not null
    check (stakeholder_role in ('participant','host','merchant','brand')),
  plan_key text not null,
  status text not null default 'pending'
    check (status in ('pending','trialing','active','past_due','paused','cancelled','unpaid')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, stakeholder_role)
);

create index if not exists stakeholder_subscriptions_status_idx
  on public.stakeholder_subscriptions(status, current_period_end);

create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.users(id) on delete restrict,
  merchant_id uuid not null references public.users(id) on delete restrict,
  currency text not null,
  payment_status text not null default 'requires_payment'
    check (payment_status in ('requires_payment','processing','paid','failed','cancelled','partially_refunded','refunded','disputed')),
  fulfillment_status text not null default 'unfulfilled'
    check (fulfillment_status in ('unfulfilled','preparing','ready','shipped','delivered','redeemed','cancelled')),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  platform_fee numeric(12,2) not null default 0 check (platform_fee >= 0),
  merchant_net numeric(12,2) not null default 0 check (merchant_net >= 0),
  stripe_payment_intent_id text unique,
  stripe_charge_id text,
  reservation_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  product_id uuid not null references public.merchant_products(id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.commerce_inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  product_id uuid not null references public.merchant_products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  status text not null default 'held'
    check (status in ('held','consumed','released','expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create table if not exists public.merchant_settlement_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete restrict,
  merchant_id uuid not null references public.users(id) on delete restrict,
  entry_type text not null check (entry_type in ('sale','refund','dispute','chargeback','adjustment')),
  gross_amount numeric(12,2) not null,
  platform_fee numeric(12,2) not null default 0,
  net_amount numeric(12,2) not null,
  currency text not null,
  status text not null default 'pending'
    check (status in ('pending','blocked','transferring','paid','reversed','failed')),
  available_at timestamptz not null default (now() + interval '2 days'),
  stripe_connected_account_id text,
  stripe_transfer_id text,
  stripe_transfer_reversal_id text,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists merchant_settlement_due_idx
  on public.merchant_settlement_ledger(status, available_at);

alter table public.stripe_event_processing enable row level security;
alter table public.stakeholder_subscriptions enable row level security;
alter table public.commerce_orders enable row level security;
alter table public.commerce_order_items enable row level security;
alter table public.commerce_inventory_reservations enable row level security;
alter table public.merchant_settlement_ledger enable row level security;

drop policy if exists "Users read own subscriptions" on public.stakeholder_subscriptions;
create policy "Users read own subscriptions" on public.stakeholder_subscriptions
  for select using (auth.uid() = user_id);
drop policy if exists "Buyers read own commerce orders" on public.commerce_orders;
create policy "Buyers read own commerce orders" on public.commerce_orders
  for select using (auth.uid() = buyer_id);
drop policy if exists "Buyers read own commerce items" on public.commerce_order_items;
create policy "Buyers read own commerce items" on public.commerce_order_items
  for select using (exists (
    select 1 from public.commerce_orders o where o.id = order_id and o.buyer_id = auth.uid()
  ));

create or replace function public.reserve_commerce_order(
  p_buyer_id uuid,
  p_items jsonb,
  p_currency text default 'USD',
  p_hold_minutes integer default 30
) returns public.commerce_orders
language plpgsql security definer set search_path = public as $$
declare
  v_order public.commerce_orders%rowtype;
  v_item jsonb;
  v_product public.merchant_products%rowtype;
  v_merchant uuid;
  v_subtotal numeric(12,2) := 0;
  v_quantity integer;
  v_price numeric(12,2);
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one item is required';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := greatest(1, (v_item->>'quantity')::integer);
    select * into v_product from public.merchant_products
      where id = (v_item->>'product_id')::uuid and is_active = true for update;
    if not found then raise exception 'Product is unavailable'; end if;
    if v_merchant is null then v_merchant := v_product.merchant_id;
    elsif v_merchant <> v_product.merchant_id then
      raise exception 'A checkout can only contain items from one merchant';
    end if;
    if coalesce(v_product.inventory_quantity, v_product.inventory_count) is not null
       and coalesce(v_product.inventory_quantity, v_product.inventory_count) < v_quantity then
      raise exception 'Insufficient inventory for %', v_product.name;
    end if;
    v_price := coalesce(v_product.price, v_product.price_usd, 0);
    if v_price <= 0 then raise exception 'Product does not have a cash price'; end if;
    v_subtotal := v_subtotal + (v_price * v_quantity);
  end loop;

  insert into public.commerce_orders(
    buyer_id,merchant_id,currency,subtotal,total_amount,platform_fee,merchant_net,reservation_expires_at
  ) values (
    p_buyer_id,v_merchant,upper(p_currency),v_subtotal,v_subtotal,
    round(v_subtotal * .125,2),v_subtotal-round(v_subtotal * .125,2),
    now() + make_interval(mins => greatest(5, least(p_hold_minutes, 60)))
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := greatest(1, (v_item->>'quantity')::integer);
    select * into v_product from public.merchant_products
      where id = (v_item->>'product_id')::uuid for update;
    v_price := coalesce(v_product.price, v_product.price_usd, 0);
    insert into public.commerce_order_items(order_id,product_id,product_name,quantity,unit_price,line_total)
      values(v_order.id,v_product.id,v_product.name,v_quantity,v_price,v_price*v_quantity);
    insert into public.commerce_inventory_reservations(order_id,product_id,quantity,expires_at)
      values(v_order.id,v_product.id,v_quantity,v_order.reservation_expires_at);
    if coalesce(v_product.inventory_quantity, v_product.inventory_count) is not null then
      update public.merchant_products set
        inventory_quantity = coalesce(v_product.inventory_quantity, v_product.inventory_count)-v_quantity,
        inventory_count = coalesce(v_product.inventory_quantity, v_product.inventory_count)-v_quantity
      where id=v_product.id;
    end if;
  end loop;
  return v_order;
end;
$$;

create or replace function public.release_expired_commerce_reservations()
returns integer language plpgsql security definer set search_path = public as $$
declare v_row record; v_count integer := 0;
begin
  for v_row in
    select r.* from public.commerce_inventory_reservations r
    join public.commerce_orders o on o.id=r.order_id
    where r.status='held' and r.expires_at <= now() and o.payment_status <> 'paid'
    for update of r skip locked
  loop
    update public.merchant_products set
      inventory_quantity = coalesce(inventory_quantity,inventory_count,0)+v_row.quantity,
      inventory_count = coalesce(inventory_quantity,inventory_count,0)+v_row.quantity
    where id=v_row.product_id;
    update public.commerce_inventory_reservations set status='expired',updated_at=now()
      where id=v_row.id;
    update public.commerce_orders set payment_status='cancelled',updated_at=now()
      where id=v_row.order_id and payment_status='requires_payment';
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.release_commerce_order(p_order_id uuid, p_reason text default 'cancelled')
returns public.commerce_orders
language plpgsql security definer set search_path = public as $$
declare v_order public.commerce_orders%rowtype; v_row record;
begin
  select * into v_order from public.commerce_orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.payment_status='paid' then raise exception 'A paid order cannot release its reservation'; end if;
  for v_row in select * from public.commerce_inventory_reservations
    where order_id=p_order_id and status='held' for update
  loop
    update public.merchant_products set
      inventory_quantity=coalesce(inventory_quantity,inventory_count,0)+v_row.quantity,
      inventory_count=coalesce(inventory_quantity,inventory_count,0)+v_row.quantity
    where id=v_row.product_id;
    update public.commerce_inventory_reservations set status='released',updated_at=now()
      where id=v_row.id;
  end loop;
  update public.commerce_orders set
    payment_status='cancelled',
    metadata=metadata||jsonb_build_object('cancellation_reason',p_reason),
    updated_at=now()
  where id=p_order_id returning * into v_order;
  return v_order;
end;
$$;

create or replace function public.capture_commerce_order(
  p_order_id uuid,
  p_payment_intent_id text,
  p_charge_id text default null
) returns public.commerce_orders
language plpgsql security definer set search_path = public as $$
declare v_order public.commerce_orders%rowtype;
begin
  select * into v_order from public.commerce_orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.payment_status='paid' then return v_order; end if;
  if v_order.payment_status not in ('requires_payment','processing') then
    raise exception 'Order cannot be captured from status %',v_order.payment_status;
  end if;
  if v_order.reservation_expires_at <= now() then raise exception 'Inventory reservation expired'; end if;
  update public.commerce_inventory_reservations set status='consumed',updated_at=now()
    where order_id=p_order_id and status='held';
  update public.commerce_orders set
    payment_status='paid',stripe_payment_intent_id=p_payment_intent_id,
    stripe_charge_id=p_charge_id,paid_at=now(),updated_at=now()
    where id=p_order_id returning * into v_order;
  insert into public.merchant_settlement_ledger(
    order_id,merchant_id,entry_type,gross_amount,platform_fee,net_amount,currency,
    status,available_at,idempotency_key
  ) values(
    v_order.id,v_order.merchant_id,'sale',v_order.total_amount,v_order.platform_fee,
    v_order.merchant_net,v_order.currency,'blocked',now()+interval '2 days',
    'commerce-order:'||v_order.id::text||':sale'
  ) on conflict(idempotency_key) do nothing;
  return v_order;
end;
$$;
