-- Merchant-collected payment methods and unpaid inventory reservations.

create table if not exists public.merchant_direct_payment_methods (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.users(id) on delete cascade,
  method_type text not null check (method_type in (
    'cash_on_pickup','card_terminal_pickup','lynk_at_venue',
    'bank_transfer','merchant_payment_link','cash_on_delivery'
  )),
  display_name text not null,
  instructions text,
  payment_link text,
  account_details jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, method_type)
);

alter table public.commerce_orders
  add column if not exists payment_collection text not null default 'platform'
    check (payment_collection in ('platform','merchant')),
  add column if not exists merchant_payment_method_id uuid references public.merchant_direct_payment_methods(id),
  add column if not exists merchant_payment_reference text,
  add column if not exists merchant_payment_confirmed_at timestamptz,
  add column if not exists merchant_payment_confirmed_by uuid references public.users(id);

alter table public.merchant_direct_payment_methods enable row level security;
drop policy if exists "Public reads active direct payment methods" on public.merchant_direct_payment_methods;
create policy "Public reads active direct payment methods" on public.merchant_direct_payment_methods
  for select using (active = true or auth.uid() = merchant_id);
drop policy if exists "Merchants manage direct payment methods" on public.merchant_direct_payment_methods;
create policy "Merchants manage direct payment methods" on public.merchant_direct_payment_methods
  for all using (auth.uid() = merchant_id) with check (auth.uid() = merchant_id);

create index if not exists commerce_orders_merchant_payment_queue_idx
  on public.commerce_orders(merchant_id,payment_collection,payment_status,created_at desc);

create or replace function public.confirm_merchant_collected_payment(
  p_order_id uuid,
  p_merchant_id uuid,
  p_reference text
) returns public.commerce_orders
language plpgsql security definer set search_path = public as $$
declare v_order public.commerce_orders%rowtype;
begin
  if nullif(trim(p_reference),'') is null then raise exception 'Payment reference is required'; end if;
  select * into v_order from public.commerce_orders
    where id=p_order_id and merchant_id=p_merchant_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.payment_collection <> 'merchant' then raise exception 'Order is not merchant-collected'; end if;
  if v_order.payment_status='paid' then return v_order; end if;
  if v_order.payment_status not in ('requires_payment','processing') then
    raise exception 'Order cannot be confirmed from status %',v_order.payment_status;
  end if;
  if v_order.reservation_expires_at <= now() then raise exception 'Reservation has expired'; end if;
  update public.commerce_inventory_reservations set status='consumed',updated_at=now()
    where order_id=p_order_id and status='held';
  update public.commerce_orders set
    payment_status='paid',
    merchant_payment_reference=trim(p_reference),
    merchant_payment_confirmed_at=now(),
    merchant_payment_confirmed_by=p_merchant_id,
    paid_at=now(),updated_at=now()
  where id=p_order_id returning * into v_order;
  return v_order;
end;
$$;
