-- A claimed benefit is held for one checkout and consumed only by paid capture.
create table public.commerce_benefit_holds (
  order_id uuid primary key references public.commerce_orders(id),
  issuance_id uuid not null references public.offer_issuances(id),
  status text not null default 'held' check (status in ('held','consumed','released')),
  discount_amount numeric(12,2) not null check (discount_amount > 0),
  created_at timestamptz not null default now()
);
create unique index commerce_benefit_once on public.commerce_benefit_holds(issuance_id) where status in ('held','consumed');
alter table public.commerce_benefit_holds enable row level security;
revoke all on public.commerce_benefit_holds from anon, authenticated;
grant all on public.commerce_benefit_holds to service_role;

create or replace function public.reserve_promocard_cart(p_buyer_id uuid, p_items jsonb, p_issuance_id uuid default null, p_referral_code text default null)
returns public.commerce_orders language plpgsql security invoker set search_path=public as $$
declare
  o public.commerce_orders; i public.offer_issuances; benefit public.offers;
  r record; eligible numeric := 0; discount numeric := 0; rule jsonb; referrer uuid; eligible_products jsonb;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then raise exception 'Choose between 1 and 50 products'; end if;
  if exists(select 1 from jsonb_array_elements(p_items) x where (x->>'quantity')::numeric <> trunc((x->>'quantity')::numeric) or (x->>'quantity')::numeric not between 1 and 99 or x->>'quantity' is null) then raise exception 'Quantities must be whole numbers from 1 to 99'; end if;
  if (select count(distinct x->>'product_id') from jsonb_array_elements(p_items) x) <> jsonb_array_length(p_items) then raise exception 'Combine duplicate products'; end if;
  -- Lock in a stable order, check the authoritative product currency before reserving.
  for r in select p.* from public.merchant_products p join jsonb_array_elements(p_items) x on p.id=(x->>'product_id')::uuid order by p.id for update of p loop
    if upper(coalesce(r.currency,'USD')) <> 'USD' then raise exception 'Card checkout currently supports USD products only'; end if;
  end loop;
  o := public.reserve_commerce_order(p_buyer_id,p_items,'USD',30);
  if nullif(trim(p_referral_code),'') is not null then
    select user_id into referrer from public.referral_codes where upper(code)=upper(trim(p_referral_code)) and is_active=true and (expires_at is null or expires_at>now());
    if referrer is null then raise exception 'Referral code is unavailable'; end if;
    if referrer in (p_buyer_id,o.merchant_id) then raise exception 'Self referrals do not qualify'; end if;
    o.metadata := o.metadata || jsonb_build_object('referral_code',upper(trim(p_referral_code)),'referrer_id',referrer);
  end if;
  if p_issuance_id is not null then
    select * into i from public.offer_issuances where id=p_issuance_id for update;
    if not found or i.user_id<>p_buyer_id or i.status<>'claimed' or (i.expires_at is not null and i.expires_at<=now()) then raise exception 'This PromoCard benefit is not ready to use'; end if;
    select * into benefit from public.offers where id=i.offer_id for update;
    rule := benefit.metadata->'checkout_discount';
    if benefit.owner_user_id<>o.merchant_id or benefit.status<>'active' or benefit.starts_at>now() or (benefit.ends_at is not null and benefit.ends_at<=now()) or benefit.reward_type not in ('coupon','voucher') or rule is null or coalesce(rule->>'kind','') not in ('fixed','percentage') then raise exception 'This benefit cannot be used at this store checkout'; end if;
    if o.subtotal < coalesce((rule->>'minimum_spend')::numeric,0) then raise exception 'Minimum spend for this benefit has not been reached'; end if;
    select coalesce(sum(oi.line_total),0),coalesce(jsonb_agg(oi.product_id),'[]'::jsonb) into eligible,eligible_products from public.commerce_order_items oi join public.merchant_products p on p.id=oi.product_id where oi.order_id=o.id
      and (benefit.merchant_product_id is null or p.id=benefit.merchant_product_id)
      and (nullif(rule->>'category','') is null or lower(p.category)=lower(rule->>'category'));
    if rule->>'kind'='percentage' then
      if coalesce(benefit.value_amount,0) not between 0.01 and 100 then raise exception 'Invalid percentage benefit'; end if;
      discount := round(eligible*benefit.value_amount/100,2);
    else
      if upper(coalesce(benefit.value_currency,''))<>o.currency or coalesce(benefit.value_amount,0)<=0 then raise exception 'Benefit currency or value does not match this cart'; end if;
      discount := least(eligible,benefit.value_amount);
    end if;
    if discount<=0 then raise exception 'No products in your cart qualify for this benefit'; end if;
    if discount>=o.subtotal then raise exception 'This card checkout requires a positive balance after discount'; end if;
    if exists(select 1 from public.commerce_benefit_holds where issuance_id=i.id and status in ('held','consumed')) then raise exception 'This benefit is already reserved. Finish its checkout or wait for it to expire'; end if;
    insert into public.commerce_benefit_holds(order_id,issuance_id,discount_amount) values(o.id,i.id,discount);
    o.metadata := o.metadata || jsonb_build_object('promocard_issuance_id',i.id,'promocard_offer_id',benefit.id,'promocard_title',benefit.title,'discount_amount',discount,'original_subtotal',o.subtotal,'discount_product_ids',eligible_products);
    o.subtotal := o.subtotal-discount;
    o.total_amount := o.subtotal;
    o.platform_fee := round(o.subtotal*.125,2);
    o.merchant_net := o.subtotal-o.platform_fee;
  end if;
  update public.commerce_orders set metadata=o.metadata,subtotal=o.subtotal,total_amount=o.total_amount,platform_fee=o.platform_fee,merchant_net=o.merchant_net where id=o.id returning * into o;
  return o;
end $$;
revoke all on function public.reserve_promocard_cart(uuid,jsonb,uuid,text) from public,anon,authenticated;
grant execute on function public.reserve_promocard_cart(uuid,jsonb,uuid,text) to service_role;

create or replace function public.guard_checkout_benefit() returns trigger language plpgsql security invoker set search_path=public as $$
begin
  if new.status is distinct from old.status and exists(select 1 from public.commerce_benefit_holds where issuance_id=old.id and status='held') then
    raise exception 'This benefit is reserved for a checkout. Finish or cancel that checkout first';
  end if;
  return new;
end $$;
create trigger guard_checkout_benefit before update on public.offer_issuances for each row execute function public.guard_checkout_benefit();

create or replace function public.finish_checkout_benefit() returns trigger language plpgsql security invoker set search_path=public as $$
declare h public.commerce_benefit_holds; i public.offer_issuances;
begin
  if new.payment_status is not distinct from old.payment_status then return new; end if;
  select * into h from public.commerce_benefit_holds where order_id=new.id and status='held' for update;
  if not found then return new; end if;
  if new.payment_status='paid' then
    select * into i from public.offer_issuances where id=h.issuance_id for update;
    update public.commerce_benefit_holds set status='consumed' where order_id=new.id;
    update public.offer_issuances set status='redeemed',redeemed_at=now(),redeemed_by=new.buyer_id where id=i.id;
    update public.offers set quantity_reserved=greatest(0,quantity_reserved-1),quantity_redeemed=quantity_redeemed+1 where id=i.offer_id;
    insert into public.offer_redemption_events(issuance_id,event_type,actor_user_id,metadata) values(i.id,'redeemed',new.buyer_id,jsonb_build_object('commerce_order_id',new.id,'discount_amount',h.discount_amount));
  elsif new.payment_status in ('cancelled','failed') then
    update public.commerce_benefit_holds set status='released' where order_id=new.id;
  end if;
  return new;
end $$;
create trigger finish_checkout_benefit after update on public.commerce_orders for each row execute function public.finish_checkout_benefit();

-- Confirmed receipts must survive concurrent webhook deliveries without duplication.
create unique index if not exists commerce_purchase_order_receipt_once
on public.commerce_receipts(sale_id)
where receipt_type='purchase' and attribution->>'source'='stripe_commerce_order';

-- Stripe sessions own the lifetime of processing holds, including delayed payments.
create or replace function public.release_expired_commerce_reservations()
returns integer language plpgsql security definer set search_path = public as $$
declare v_row record; v_count integer := 0;
begin
  for v_row in
    select r.* from public.commerce_inventory_reservations r
    join public.commerce_orders o on o.id=r.order_id
    where r.status='held' and r.expires_at <= now() and o.payment_status in ('requires_payment','failed','cancelled')
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

