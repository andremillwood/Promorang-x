-- Reusable order-based community partner commissions. Munchies is the first configured campaign.
-- Service-role only. Apply only after reviewing real merchant-native checkout and fulfillment.
create table if not exists public.community_partner_campaigns (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.users(id),
  name text not null,
  currency text not null check (currency ~ '^[A-Z]{3}
  active boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.community_partner_memberships (
  campaign_id uuid not null references public.community_partner_campaigns(id),
  partner_id uuid not null references public.users(id),
  approved_at timestamptz not null default now(),
  primary key (campaign_id, partner_id)
);
create table if not exists public.community_partner_commissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.community_partner_campaigns(id),
  order_id uuid not null references public.commerce_orders(id),
  partner_id uuid not null references public.users(id),
  merchant_id uuid not null references public.users(id),
  currency text not null check (currency ~ '^[A-Z]{3}
  eligible_net_amount numeric(12,2) not null check (eligible_net_amount >= 0),
  verified_margin_amount numeric(12,2) not null check (verified_margin_amount >= 0),
  rate_bps integer not null check (rate_bps between 0 and 1000),
  commission_amount numeric(12,2) not null check (commission_amount >= 0),
  status text not null default 'pending_review' check (status in ('pending_review','approved','paid','reversed')),
  payment_reference text,
  approved_at timestamptz,
  paid_at timestamptz,
  reversed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id)
);
create index if not exists community_partner_commissions_partner_idx
  on public.community_partner_commissions(partner_id, created_at desc);

alter table public.community_partner_campaigns enable row level security;
alter table public.community_partner_memberships enable row level security;
alter table public.community_partner_commissions enable row level security;
revoke all on public.community_partner_campaigns from public, anon, authenticated;
revoke all on public.community_partner_memberships from public, anon, authenticated;
revoke all on public.community_partner_commissions from public, anon, authenticated;
grant all on public.community_partner_campaigns to service_role;
grant all on public.community_partner_memberships to service_role;
grant all on public.community_partner_commissions to service_role;

-- The operator submits verified variable costs as a margin, but order totals,
-- payment, fulfillment and referral identity come from authoritative order data.
-- One order may earn at most one partner commission across campaigns.
create or replace function public.quote_community_partner_commission(
  p_campaign_id uuid, p_order_id uuid, p_verified_margin numeric
) returns public.community_partner_commissions
language plpgsql security definer set search_path = public as $$
declare
  v_campaign public.community_partner_campaigns%rowtype;
  v_order public.commerce_orders%rowtype;
  v_partner uuid;
  v_eligible numeric(12,2);
  v_commission public.community_partner_commissions%rowtype;
begin
  if auth.role() <> 'service_role' then raise exception 'Not authorized'; end if;
  select * into v_campaign from public.community_partner_campaigns
    where id=p_campaign_id and active=true;
  if not found then raise exception 'Campaign unavailable'; end if;
  select * into v_order from public.commerce_orders where id=p_order_id for update;
  if not found or v_order.merchant_id <> v_campaign.merchant_id then raise exception 'Order does not belong to campaign merchant'; end if;
  if v_order.currency <> v_campaign.currency or v_order.payment_status <> 'paid'
    or v_order.fulfillment_status not in ('delivered','redeemed') then
    raise exception 'A fully paid and fulfilled order in the campaign currency is required';
  end if;
  if v_order.payment_collection not in ('merchant','platform') then raise exception 'Unknown payment channel'; end if;
  if v_order.payment_collection='merchant' and
    (v_order.merchant_payment_confirmed_at is null or nullif(v_order.merchant_payment_reference,'') is null) then
    raise exception 'Merchant payment confirmation is missing';
  end if;
  if v_order.payment_collection='platform' and v_order.stripe_payment_intent_id is null then
    raise exception 'Verified online payment reference is missing';
  end if;
  v_partner := nullif(v_order.metadata->>'referrer_id','')::uuid;
  if v_partner is null or v_partner in (v_order.buyer_id,v_order.merchant_id) then raise exception 'Valid attributed partner required'; end if;
  if not exists(select 1 from public.community_partner_memberships
    where campaign_id=p_campaign_id and partner_id=v_partner) then raise exception 'Partner is not approved'; end if;
  if not exists(select 1 from public.referral_codes
    where user_id=v_partner and upper(code)=upper(v_order.metadata->>'referral_code')) then
    raise exception 'Order referral identity is not verified';
  end if;
  -- Exclude delivery/shipping, taxes and recorded discounts by using the
  -- discounted subtotal, not total_amount. Refunds are blocked above.
  v_eligible := v_order.subtotal;
  if v_eligible <= 0 or p_verified_margin is null or p_verified_margin < 0
    or p_verified_margin > v_eligible then raise exception 'Invalid verified contribution margin'; end if;
  insert into public.community_partner_commissions (
    campaign_id,order_id,partner_id,merchant_id,currency,eligible_net_amount,
    verified_margin_amount,rate_bps,commission_amount
  ) values (
    p_campaign_id,p_order_id,v_partner,v_order.merchant_id,v_order.currency,v_eligible,
    p_verified_margin,v_campaign.rate_bps,least(round(v_eligible*v_campaign.rate_bps/10000,2),round(p_verified_margin*v_campaign.margin_cap_bps/10000,2))
  ) on conflict (order_id) do nothing;
  select * into v_commission from public.community_partner_commissions where order_id=p_order_id;
  if v_commission.campaign_id <> p_campaign_id or v_commission.partner_id <> v_partner then raise exception 'Order already attributed to another campaign or partner'; end if;
  return v_commission;
end $$;
revoke all on function public.quote_community_partner_commission(uuid,uuid,numeric) from public,anon,authenticated;
grant execute on function public.quote_community_partner_commission(uuid,uuid,numeric) to service_role;

-- Fail closed if a paid/approved commission's order is later refunded or disputed.
-- This does not claw back money already paid; finance must reconcile that manually.
create or replace function public.reverse_community_partner_commission()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.payment_status in ('refunded','partially_refunded','disputed','cancelled')
    or new.fulfillment_status='cancelled' then
    update public.community_partner_commissions
      set status='reversed', reversed_at=now()
      where order_id=new.id and status in ('pending_review','approved');
  end if;
  return new;
end $$;
create trigger reverse_community_partner_commission_on_order
after update of payment_status,fulfillment_status on public.commerce_orders
for each row execute function public.reverse_community_partner_commission();
),
  rate_bps integer not null default 500 check (rate_bps between 0 and 1000),
  margin_cap_bps integer not null default 2500 check (margin_cap_bps between 0 and 10000),
  active boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.community_partner_memberships (
  campaign_id uuid not null references public.community_partner_campaigns(id),
  partner_id uuid not null references public.users(id),
  approved_at timestamptz not null default now(),
  primary key (campaign_id, partner_id)
);
create table if not exists public.community_partner_commissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.community_partner_campaigns(id),
  order_id uuid not null references public.commerce_orders(id),
  partner_id uuid not null references public.users(id),
  merchant_id uuid not null references public.users(id),
  currency text not null check (currency = 'JMD'),
  eligible_net_amount numeric(12,2) not null check (eligible_net_amount >= 0),
  verified_margin_amount numeric(12,2) not null check (verified_margin_amount >= 0),
  rate_bps integer not null default 500 check (rate_bps = 500),
  commission_amount numeric(12,2) not null check (commission_amount >= 0),
  status text not null default 'pending_review' check (status in ('pending_review','approved','paid','reversed')),
  payment_reference text,
  approved_at timestamptz,
  paid_at timestamptz,
  reversed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id)
);
create index if not exists community_partner_commissions_partner_idx
  on public.community_partner_commissions(partner_id, created_at desc);

alter table public.community_partner_campaigns enable row level security;
alter table public.community_partner_memberships enable row level security;
alter table public.community_partner_commissions enable row level security;
revoke all on public.community_partner_campaigns from public, anon, authenticated;
revoke all on public.community_partner_memberships from public, anon, authenticated;
revoke all on public.community_partner_commissions from public, anon, authenticated;
grant all on public.community_partner_campaigns to service_role;
grant all on public.community_partner_memberships to service_role;
grant all on public.community_partner_commissions to service_role;

-- The operator submits verified variable costs as a margin, but order totals,
-- payment, fulfillment and referral identity come from authoritative order data.
-- One order may earn at most one partner commission across campaigns.
create or replace function public.quote_community_partner_commission(
  p_campaign_id uuid, p_order_id uuid, p_verified_margin numeric
) returns public.community_partner_commissions
language plpgsql security definer set search_path = public as $$
declare
  v_campaign public.community_partner_campaigns%rowtype;
  v_order public.commerce_orders%rowtype;
  v_partner uuid;
  v_eligible numeric(12,2);
  v_commission public.community_partner_commissions%rowtype;
begin
  if auth.role() <> 'service_role' then raise exception 'Not authorized'; end if;
  select * into v_campaign from public.community_partner_campaigns
    where id=p_campaign_id and active=true;
  if not found then raise exception 'Campaign unavailable'; end if;
  select * into v_order from public.commerce_orders where id=p_order_id for update;
  if not found or v_order.merchant_id <> v_campaign.merchant_id then raise exception 'Order does not belong to campaign merchant'; end if;
  if v_order.currency <> 'JMD' or v_order.payment_status <> 'paid'
    or v_order.fulfillment_status not in ('delivered','redeemed') then
    raise exception 'A fully paid and fulfilled JMD order is required';
  end if;
  if v_order.payment_collection not in ('merchant','platform') then raise exception 'Unknown payment channel'; end if;
  if v_order.payment_collection='merchant' and
    (v_order.merchant_payment_confirmed_at is null or nullif(v_order.merchant_payment_reference,'') is null) then
    raise exception 'Merchant payment confirmation is missing';
  end if;
  if v_order.payment_collection='platform' and v_order.stripe_payment_intent_id is null then
    raise exception 'Verified online payment reference is missing';
  end if;
  v_partner := nullif(v_order.metadata->>'referrer_id','')::uuid;
  if v_partner is null or v_partner in (v_order.buyer_id,v_order.merchant_id) then raise exception 'Valid attributed partner required'; end if;
  if not exists(select 1 from public.community_partner_memberships
    where campaign_id=p_campaign_id and partner_id=v_partner) then raise exception 'Partner is not approved'; end if;
  if not exists(select 1 from public.referral_codes
    where user_id=v_partner and upper(code)=upper(v_order.metadata->>'referral_code')) then
    raise exception 'Order referral identity is not verified';
  end if;
  -- Exclude delivery/shipping, taxes and recorded discounts by using the
  -- discounted subtotal, not total_amount. Refunds are blocked above.
  v_eligible := v_order.subtotal;
  if v_eligible <= 0 or p_verified_margin is null or p_verified_margin < 0
    or p_verified_margin > v_eligible then raise exception 'Invalid verified contribution margin'; end if;
  insert into public.community_partner_commissions (
    campaign_id,order_id,partner_id,merchant_id,currency,eligible_net_amount,
    verified_margin_amount,commission_amount
  ) values (
    p_campaign_id,p_order_id,v_partner,v_order.merchant_id,'JMD',v_eligible,
    p_verified_margin,least(round(v_eligible*0.05,2),round(p_verified_margin*0.25,2))
  ) on conflict (order_id) do nothing;
  select * into v_commission from public.community_partner_commissions where order_id=p_order_id;
  if v_commission.campaign_id <> p_campaign_id then raise exception 'Order already attributed to another campaign'; end if;
  return v_commission;
end $$;
revoke all on function public.quote_community_partner_commission(uuid,uuid,numeric) from public,anon,authenticated;
grant execute on function public.quote_community_partner_commission(uuid,uuid,numeric) to service_role;

-- Fail closed if a paid/approved commission's order is later refunded or disputed.
-- This does not claw back money already paid; finance must reconcile that manually.
create or replace function public.reverse_community_partner_commission()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.payment_status in ('refunded','partially_refunded','disputed','cancelled')
    or new.fulfillment_status='cancelled' then
    update public.community_partner_commissions
      set status='reversed', reversed_at=now()
      where order_id=new.id and status in ('pending_review','approved');
  end if;
  return new;
end $$;
create trigger reverse_community_partner_commission_on_order
after update of payment_status,fulfillment_status on public.commerce_orders
for each row execute function public.reverse_community_partner_commission();
),
  eligible_net_amount numeric(12,2) not null check (eligible_net_amount >= 0),
  verified_margin_amount numeric(12,2) not null check (verified_margin_amount >= 0),
  rate_bps integer not null default 500 check (rate_bps = 500),
  commission_amount numeric(12,2) not null check (commission_amount >= 0),
  status text not null default 'pending_review' check (status in ('pending_review','approved','paid','reversed')),
  payment_reference text,
  approved_at timestamptz,
  paid_at timestamptz,
  reversed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id)
);
create index if not exists community_partner_commissions_partner_idx
  on public.community_partner_commissions(partner_id, created_at desc);

alter table public.community_partner_campaigns enable row level security;
alter table public.community_partner_memberships enable row level security;
alter table public.community_partner_commissions enable row level security;
revoke all on public.community_partner_campaigns from public, anon, authenticated;
revoke all on public.community_partner_memberships from public, anon, authenticated;
revoke all on public.community_partner_commissions from public, anon, authenticated;
grant all on public.community_partner_campaigns to service_role;
grant all on public.community_partner_memberships to service_role;
grant all on public.community_partner_commissions to service_role;

-- The operator submits verified variable costs as a margin, but order totals,
-- payment, fulfillment and referral identity come from authoritative order data.
-- One order may earn at most one partner commission across campaigns.
create or replace function public.quote_community_partner_commission(
  p_campaign_id uuid, p_order_id uuid, p_verified_margin numeric
) returns public.community_partner_commissions
language plpgsql security definer set search_path = public as $$
declare
  v_campaign public.community_partner_campaigns%rowtype;
  v_order public.commerce_orders%rowtype;
  v_partner uuid;
  v_eligible numeric(12,2);
  v_commission public.community_partner_commissions%rowtype;
begin
  if auth.role() <> 'service_role' then raise exception 'Not authorized'; end if;
  select * into v_campaign from public.community_partner_campaigns
    where id=p_campaign_id and active=true;
  if not found then raise exception 'Campaign unavailable'; end if;
  select * into v_order from public.commerce_orders where id=p_order_id for update;
  if not found or v_order.merchant_id <> v_campaign.merchant_id then raise exception 'Order does not belong to campaign merchant'; end if;
  if v_order.currency <> 'JMD' or v_order.payment_status <> 'paid'
    or v_order.fulfillment_status not in ('delivered','redeemed') then
    raise exception 'A fully paid and fulfilled JMD order is required';
  end if;
  if v_order.payment_collection not in ('merchant','platform') then raise exception 'Unknown payment channel'; end if;
  if v_order.payment_collection='merchant' and
    (v_order.merchant_payment_confirmed_at is null or nullif(v_order.merchant_payment_reference,'') is null) then
    raise exception 'Merchant payment confirmation is missing';
  end if;
  if v_order.payment_collection='platform' and v_order.stripe_payment_intent_id is null then
    raise exception 'Verified online payment reference is missing';
  end if;
  v_partner := nullif(v_order.metadata->>'referrer_id','')::uuid;
  if v_partner is null or v_partner in (v_order.buyer_id,v_order.merchant_id) then raise exception 'Valid attributed partner required'; end if;
  if not exists(select 1 from public.community_partner_memberships
    where campaign_id=p_campaign_id and partner_id=v_partner) then raise exception 'Partner is not approved'; end if;
  if not exists(select 1 from public.referral_codes
    where user_id=v_partner and upper(code)=upper(v_order.metadata->>'referral_code')) then
    raise exception 'Order referral identity is not verified';
  end if;
  -- Exclude delivery/shipping, taxes and recorded discounts by using the
  -- discounted subtotal, not total_amount. Refunds are blocked above.
  v_eligible := v_order.subtotal;
  if v_eligible <= 0 or p_verified_margin is null or p_verified_margin < 0
    or p_verified_margin > v_eligible then raise exception 'Invalid verified contribution margin'; end if;
  insert into public.community_partner_commissions (
    campaign_id,order_id,partner_id,merchant_id,currency,eligible_net_amount,
    verified_margin_amount,commission_amount
  ) values (
    p_campaign_id,p_order_id,v_partner,v_order.merchant_id,'JMD',v_eligible,
    p_verified_margin,least(round(v_eligible*0.05,2),round(p_verified_margin*0.25,2))
  ) on conflict (order_id) do nothing;
  select * into v_commission from public.community_partner_commissions where order_id=p_order_id;
  if v_commission.campaign_id <> p_campaign_id then raise exception 'Order already attributed to another campaign'; end if;
  return v_commission;
end $$;
revoke all on function public.quote_community_partner_commission(uuid,uuid,numeric) from public,anon,authenticated;
grant execute on function public.quote_community_partner_commission(uuid,uuid,numeric) to service_role;

-- Fail closed if a paid/approved commission's order is later refunded or disputed.
-- This does not claw back money already paid; finance must reconcile that manually.
create or replace function public.reverse_community_partner_commission()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.payment_status in ('refunded','partially_refunded','disputed','cancelled')
    or new.fulfillment_status='cancelled' then
    update public.community_partner_commissions
      set status='reversed', reversed_at=now()
      where order_id=new.id and status in ('pending_review','approved');
  end if;
  return new;
end $$;
create trigger reverse_community_partner_commission_on_order
after update of payment_status,fulfillment_status on public.commerce_orders
for each row execute function public.reverse_community_partner_commission();
),
  rate_bps integer not null default 500 check (rate_bps between 0 and 1000),
  margin_cap_bps integer not null default 2500 check (margin_cap_bps between 0 and 10000),
  active boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.community_partner_memberships (
  campaign_id uuid not null references public.community_partner_campaigns(id),
  partner_id uuid not null references public.users(id),
  approved_at timestamptz not null default now(),
  primary key (campaign_id, partner_id)
);
create table if not exists public.community_partner_commissions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.community_partner_campaigns(id),
  order_id uuid not null references public.commerce_orders(id),
  partner_id uuid not null references public.users(id),
  merchant_id uuid not null references public.users(id),
  currency text not null check (currency = 'JMD'),
  eligible_net_amount numeric(12,2) not null check (eligible_net_amount >= 0),
  verified_margin_amount numeric(12,2) not null check (verified_margin_amount >= 0),
  rate_bps integer not null default 500 check (rate_bps = 500),
  commission_amount numeric(12,2) not null check (commission_amount >= 0),
  status text not null default 'pending_review' check (status in ('pending_review','approved','paid','reversed')),
  payment_reference text,
  approved_at timestamptz,
  paid_at timestamptz,
  reversed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id)
);
create index if not exists community_partner_commissions_partner_idx
  on public.community_partner_commissions(partner_id, created_at desc);

alter table public.community_partner_campaigns enable row level security;
alter table public.community_partner_memberships enable row level security;
alter table public.community_partner_commissions enable row level security;
revoke all on public.community_partner_campaigns from public, anon, authenticated;
revoke all on public.community_partner_memberships from public, anon, authenticated;
revoke all on public.community_partner_commissions from public, anon, authenticated;
grant all on public.community_partner_campaigns to service_role;
grant all on public.community_partner_memberships to service_role;
grant all on public.community_partner_commissions to service_role;

-- The operator submits verified variable costs as a margin, but order totals,
-- payment, fulfillment and referral identity come from authoritative order data.
-- One order may earn at most one partner commission across campaigns.
create or replace function public.quote_community_partner_commission(
  p_campaign_id uuid, p_order_id uuid, p_verified_margin numeric
) returns public.community_partner_commissions
language plpgsql security definer set search_path = public as $$
declare
  v_campaign public.community_partner_campaigns%rowtype;
  v_order public.commerce_orders%rowtype;
  v_partner uuid;
  v_eligible numeric(12,2);
  v_commission public.community_partner_commissions%rowtype;
begin
  if auth.role() <> 'service_role' then raise exception 'Not authorized'; end if;
  select * into v_campaign from public.community_partner_campaigns
    where id=p_campaign_id and active=true;
  if not found then raise exception 'Campaign unavailable'; end if;
  select * into v_order from public.commerce_orders where id=p_order_id for update;
  if not found or v_order.merchant_id <> v_campaign.merchant_id then raise exception 'Order does not belong to campaign merchant'; end if;
  if v_order.currency <> 'JMD' or v_order.payment_status <> 'paid'
    or v_order.fulfillment_status not in ('delivered','redeemed') then
    raise exception 'A fully paid and fulfilled JMD order is required';
  end if;
  if v_order.payment_collection not in ('merchant','platform') then raise exception 'Unknown payment channel'; end if;
  if v_order.payment_collection='merchant' and
    (v_order.merchant_payment_confirmed_at is null or nullif(v_order.merchant_payment_reference,'') is null) then
    raise exception 'Merchant payment confirmation is missing';
  end if;
  if v_order.payment_collection='platform' and v_order.stripe_payment_intent_id is null then
    raise exception 'Verified online payment reference is missing';
  end if;
  v_partner := nullif(v_order.metadata->>'referrer_id','')::uuid;
  if v_partner is null or v_partner in (v_order.buyer_id,v_order.merchant_id) then raise exception 'Valid attributed partner required'; end if;
  if not exists(select 1 from public.community_partner_memberships
    where campaign_id=p_campaign_id and partner_id=v_partner) then raise exception 'Partner is not approved'; end if;
  if not exists(select 1 from public.referral_codes
    where user_id=v_partner and upper(code)=upper(v_order.metadata->>'referral_code')) then
    raise exception 'Order referral identity is not verified';
  end if;
  -- Exclude delivery/shipping, taxes and recorded discounts by using the
  -- discounted subtotal, not total_amount. Refunds are blocked above.
  v_eligible := v_order.subtotal;
  if v_eligible <= 0 or p_verified_margin is null or p_verified_margin < 0
    or p_verified_margin > v_eligible then raise exception 'Invalid verified contribution margin'; end if;
  insert into public.community_partner_commissions (
    campaign_id,order_id,partner_id,merchant_id,currency,eligible_net_amount,
    verified_margin_amount,commission_amount
  ) values (
    p_campaign_id,p_order_id,v_partner,v_order.merchant_id,'JMD',v_eligible,
    p_verified_margin,least(round(v_eligible*0.05,2),round(p_verified_margin*0.25,2))
  ) on conflict (order_id) do nothing;
  select * into v_commission from public.community_partner_commissions where order_id=p_order_id;
  if v_commission.campaign_id <> p_campaign_id then raise exception 'Order already attributed to another campaign'; end if;
  return v_commission;
end $$;
revoke all on function public.quote_community_partner_commission(uuid,uuid,numeric) from public,anon,authenticated;
grant execute on function public.quote_community_partner_commission(uuid,uuid,numeric) to service_role;

-- Fail closed if a paid/approved commission's order is later refunded or disputed.
-- This does not claw back money already paid; finance must reconcile that manually.
create or replace function public.reverse_community_partner_commission()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.payment_status in ('refunded','partially_refunded','disputed','cancelled')
    or new.fulfillment_status='cancelled' then
    update public.community_partner_commissions
      set status='reversed', reversed_at=now()
      where order_id=new.id and status in ('pending_review','approved');
  end if;
  return new;
end $$;
create trigger reverse_community_partner_commission_on_order
after update of payment_status,fulfillment_status on public.commerce_orders
for each row execute function public.reverse_community_partner_commission();
