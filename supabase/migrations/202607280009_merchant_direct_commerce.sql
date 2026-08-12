-- Merchant-owned payments, tax and fulfillment.
-- Product sales are direct charges on the merchant's connected Stripe account.

create table if not exists public.merchant_commerce_profiles (
  merchant_id uuid primary key references public.users(id) on delete cascade,
  legal_business_name text,
  support_email text,
  shipping_origin jsonb not null default '{}'::jsonb,
  return_policy text,
  fulfillment_terms text,
  tax_enabled boolean not null default true,
  allowed_countries text[] not null default array['US']::text[],
  default_currency text not null default 'USD',
  processing_days integer not null default 2 check (processing_days between 0 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.merchant_shipping_rates (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.users(id) on delete cascade,
  display_name text not null,
  fulfillment_type text not null
    check (fulfillment_type in ('shipping','local_delivery','pickup')),
  amount numeric(12,2) not null default 0 check (amount >= 0),
  currency text not null default 'USD',
  min_delivery_days integer check (min_delivery_days is null or min_delivery_days >= 0),
  max_delivery_days integer check (max_delivery_days is null or max_delivery_days >= min_delivery_days),
  countries text[] not null default array['US']::text[],
  active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.merchant_products
  add column if not exists requires_shipping boolean not null default false,
  add column if not exists weight_grams integer,
  add column if not exists tax_code text,
  add column if not exists fulfillment_lead_days integer,
  add column if not exists allowed_fulfillment_types text[] not null default array['pickup']::text[];

alter table public.commerce_orders
  add column if not exists stripe_connected_account_id text,
  add column if not exists stripe_checkout_session_id text unique,
  add column if not exists shipping_rate_id uuid references public.merchant_shipping_rates(id),
  add column if not exists shipping_address jsonb,
  add column if not exists tax_calculation_id text,
  add column if not exists tracking_number text,
  add column if not exists tracking_url text,
  add column if not exists carrier text,
  add column if not exists fulfilled_at timestamptz;

alter table public.merchant_commerce_profiles enable row level security;
alter table public.merchant_shipping_rates enable row level security;

drop policy if exists "Public reads merchant commerce profiles" on public.merchant_commerce_profiles;
create policy "Public reads merchant commerce profiles" on public.merchant_commerce_profiles
  for select using (true);
drop policy if exists "Merchants manage own commerce profile" on public.merchant_commerce_profiles;
create policy "Merchants manage own commerce profile" on public.merchant_commerce_profiles
  for all using (auth.uid() = merchant_id) with check (auth.uid() = merchant_id);

drop policy if exists "Public reads active merchant shipping rates" on public.merchant_shipping_rates;
create policy "Public reads active merchant shipping rates" on public.merchant_shipping_rates
  for select using (active = true or auth.uid() = merchant_id);
drop policy if exists "Merchants manage own shipping rates" on public.merchant_shipping_rates;
create policy "Merchants manage own shipping rates" on public.merchant_shipping_rates
  for all using (auth.uid() = merchant_id) with check (auth.uid() = merchant_id);

create index if not exists merchant_shipping_rates_merchant_idx
  on public.merchant_shipping_rates(merchant_id, active, sort_order);
create index if not exists commerce_orders_connected_account_idx
  on public.commerce_orders(stripe_connected_account_id, payment_status);

-- Direct charges settle in the connected account. This capture function records
-- the sale for reporting but intentionally creates no platform payout liability.
create or replace function public.capture_direct_commerce_order(
  p_order_id uuid,
  p_payment_intent_id text,
  p_charge_id text default null,
  p_checkout_session_id text default null,
  p_connected_account_id text default null,
  p_tax_amount numeric default 0,
  p_shipping_amount numeric default 0,
  p_shipping_address jsonb default null
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
  update public.commerce_inventory_reservations set status='consumed',updated_at=now()
    where order_id=p_order_id and status='held';
  update public.commerce_orders set
    payment_status='paid',
    stripe_payment_intent_id=p_payment_intent_id,
    stripe_charge_id=p_charge_id,
    stripe_checkout_session_id=coalesce(p_checkout_session_id,stripe_checkout_session_id),
    stripe_connected_account_id=coalesce(p_connected_account_id,stripe_connected_account_id),
    tax_amount=greatest(0,coalesce(p_tax_amount,0)),
    shipping_amount=greatest(0,coalesce(p_shipping_amount,0)),
    total_amount=subtotal+greatest(0,coalesce(p_tax_amount,0))+greatest(0,coalesce(p_shipping_amount,0)),
    merchant_net=subtotal+greatest(0,coalesce(p_tax_amount,0))+greatest(0,coalesce(p_shipping_amount,0))-platform_fee,
    shipping_address=coalesce(p_shipping_address,shipping_address),
    paid_at=now(),updated_at=now()
  where id=p_order_id returning * into v_order;
  return v_order;
end;
$$;
