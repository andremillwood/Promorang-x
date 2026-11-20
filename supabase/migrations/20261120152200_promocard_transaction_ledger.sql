-- PromoCard transaction ledger (launch spec §2.1).
-- Append-only history of what changed a member's PromoCard.
-- Writes go through post_promocard_ledger, modeled on post_economy_transaction:
-- unique idempotency_key, balance_after, and an atomic available_balance update
-- under a row lock. Clients may only select their own rows.
--
-- This migration does not post invite payouts (§2.3) and does not add a
-- platform-funded benefit branch in checkout. payout_credit is a supported
-- entry type so a later job can call the same RPC.
--
-- A paid PromoCard benefit (finish_checkout_benefit) posts one spend row.
-- Reservation does not. Replacing the function here leaves the earlier
-- migration files untouched.

create table if not exists public.promocard_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  card_id uuid not null references public.user_promo_cards(id) on delete restrict,
  entry_type text not null check (entry_type in (
    'spend', 'payout_credit', 'recharge', 'cycle_reset', 'reversal_refund', 'admin_adjustment'
  )),
  amount numeric(12,2) not null check (amount <> 0),
  currency text not null default 'USD' check (currency = 'USD'),
  balance_after numeric(12,2) not null check (balance_after >= 0),
  order_id uuid references public.commerce_orders(id) on delete restrict,
  issuance_id uuid references public.offer_issuances(id) on delete set null,
  gross_order_amount numeric(12,2),
  platform_fee numeric(12,2),
  moment_id uuid references public.moments(id) on delete set null,
  venue_id uuid,
  business_night date,
  cycle_id text,
  related_entry_id uuid references public.promocard_ledger(id) on delete restrict,
  idempotency_key text not null unique,
  is_test boolean not null default false,
  created_by text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint promocard_ledger_amount_sign check (
    (entry_type = 'spend' and amount < 0)
    or (entry_type in ('payout_credit', 'recharge', 'reversal_refund') and amount > 0)
    or (entry_type in ('cycle_reset', 'admin_adjustment') and amount <> 0)
  ),
  constraint promocard_ledger_spend_order check (
    entry_type <> 'spend' or order_id is not null
  ),
  constraint promocard_ledger_spend_amounts check (
    entry_type <> 'spend'
    or (gross_order_amount is not null and gross_order_amount > 0 and platform_fee is not null and platform_fee >= 0)
  ),
  constraint promocard_ledger_cycle_id check (
    cycle_id is null or cycle_id ~ '^[0-9]{4}-[0-9]{2}$'
  ),
  constraint promocard_ledger_created_by check (char_length(btrim(created_by)) between 1 and 200)
);

create index if not exists promocard_ledger_user_created_idx
  on public.promocard_ledger (user_id, created_at desc);
create index if not exists promocard_ledger_card_cycle_idx
  on public.promocard_ledger (card_id, cycle_id)
  where is_test = false and entry_type in ('spend', 'reversal_refund');
create index if not exists promocard_ledger_business_night_idx
  on public.promocard_ledger (business_night)
  where entry_type = 'spend' and is_test = false;
create index if not exists promocard_ledger_order_idx
  on public.promocard_ledger (order_id)
  where order_id is not null;

comment on table public.promocard_ledger is
  'Append-only PromoCard history. Members select their own rows. Inserts happen only through post_promocard_ledger.';

create or replace function public.promocard_time_zone_ok(p_zone text)
returns boolean
language plpgsql
stable
set search_path = public
as $$
begin
  if p_zone is null or btrim(p_zone) = '' then
    return false;
  end if;
  perform now() at time zone btrim(p_zone);
  return true;
exception when invalid_parameter_value then
  return false;
end;
$$;

-- Business night uses the venue-local clock and a 6:00 AM cutoff.
-- A 1:30 AM Saturday purchase counts as Friday night. Exactly 6:00 AM starts the new night.
create or replace function public.promocard_business_night(p_at timestamptz, p_timezone text)
returns date
language sql
stable
set search_path = public
as $$
  select ((p_at at time zone case
    when public.promocard_time_zone_ok(p_timezone) then btrim(p_timezone)
    else 'America/Jamaica'
  end) - interval '6 hours')::date;
$$;

-- Timezone source: the Moment's recurrence_timezone, then a timezone column on the
-- venue or venue profile when one exists, then America/Jamaica.
create or replace function public.promocard_night_timezone(p_moment_id uuid, p_venue_id uuid)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  v_tz text;
begin
  if p_moment_id is not null then
    select nullif(btrim(recurrence_timezone), '') into v_tz
    from public.moments
    where id = p_moment_id;
    if public.promocard_time_zone_ok(v_tz) then
      return btrim(v_tz);
    end if;
  end if;

  if p_venue_id is not null then
    select nullif(btrim(coalesce(to_jsonb(v)->>'timezone', to_jsonb(v)->>'time_zone')), '')
      into v_tz
    from public.venues v
    where v.id = p_venue_id;
    if public.promocard_time_zone_ok(v_tz) then
      return btrim(v_tz);
    end if;

    select nullif(btrim(coalesce(to_jsonb(v)->>'timezone', to_jsonb(v)->>'time_zone')), '')
      into v_tz
    from public.venue_profiles v
    where v.id = p_venue_id;
    if public.promocard_time_zone_ok(v_tz) then
      return btrim(v_tz);
    end if;
  end if;

  return 'America/Jamaica';
end;
$$;

-- spent_this_cycle is a cache. The ledger wins: non-test spend and reversal_refund
-- rows in the platform cycle. cycle_resets_at is ignored until a reset job exists.
create or replace function public.promocard_spent_this_cycle(p_card_id uuid, p_cycle_id text)
returns numeric
language sql
stable
set search_path = public
as $$
  select coalesce(round(-sum(amount), 2), 0)
  from public.promocard_ledger
  where card_id = p_card_id
    and is_test = false
    and entry_type in ('spend', 'reversal_refund')
    and cycle_id = p_cycle_id;
$$;

create or replace function public.prevent_promocard_ledger_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'promocard_ledger is append-only; post a reversal_refund or admin_adjustment'
    using errcode = '55000';
end;
$$;

drop trigger if exists promocard_ledger_no_update on public.promocard_ledger;
create trigger promocard_ledger_no_update
  before update on public.promocard_ledger
  for each row execute function public.prevent_promocard_ledger_mutation();

drop trigger if exists promocard_ledger_no_delete on public.promocard_ledger;
create trigger promocard_ledger_no_delete
  before delete on public.promocard_ledger
  for each row execute function public.prevent_promocard_ledger_mutation();

drop trigger if exists promocard_ledger_no_truncate on public.promocard_ledger;
create trigger promocard_ledger_no_truncate
  before truncate on public.promocard_ledger
  for each statement execute function public.prevent_promocard_ledger_mutation();

create or replace function public.post_promocard_ledger(
  p_user_id uuid,
  p_entry_type text,
  p_amount numeric,
  p_idempotency_key text,
  p_order_id uuid default null,
  p_issuance_id uuid default null,
  p_gross_order_amount numeric default null,
  p_platform_fee numeric default null,
  p_moment_id uuid default null,
  p_venue_id uuid default null,
  p_business_night date default null,
  p_cycle_id text default null,
  p_related_entry_id uuid default null,
  p_is_test boolean default false,
  p_created_by text default 'system',
  p_metadata jsonb default '{}'::jsonb,
  p_occurred_at timestamptz default null
) returns public.promocard_ledger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card public.user_promo_cards%rowtype;
  v_existing public.promocard_ledger%rowtype;
  v_related public.promocard_ledger%rowtype;
  v_amount numeric(12,2);
  v_after numeric(12,2);
  v_gross numeric(12,2);
  v_fee numeric(12,2);
  v_moment_id uuid;
  v_venue_id uuid;
  v_order_id uuid;
  v_issuance_id uuid;
  v_related_id uuid;
  v_night date;
  v_cycle text;
  v_zone text;
  v_created_by text;
  v_already numeric(12,2);
  v_current_cycle text;
  v_tx public.promocard_ledger%rowtype;
begin
  if p_user_id is null then
    raise exception 'A PromoCard owner is required';
  end if;
  if p_entry_type not in ('spend', 'payout_credit', 'recharge', 'cycle_reset', 'reversal_refund', 'admin_adjustment') then
    raise exception 'Unsupported PromoCard entry type: %', p_entry_type;
  end if;
  if p_idempotency_key is null or char_length(btrim(p_idempotency_key)) < 3 then
    raise exception 'A stable idempotency key is required';
  end if;
  v_created_by := coalesce(nullif(btrim(p_created_by), ''), 'system');
  if p_entry_type = 'admin_adjustment' and v_created_by !~ '^admin:' then
    raise exception 'admin_adjustment must record created_by as admin:<uid>';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(btrim(p_idempotency_key), 0::bigint));

  select * into v_existing
  from public.promocard_ledger
  where idempotency_key = btrim(p_idempotency_key);
  if found then
    return v_existing;
  end if;

  select * into v_card
  from public.user_promo_cards
  where user_id = p_user_id
  for update;
  if not found then
    raise exception 'PromoCard is not provisioned';
  end if;

  v_amount := round(p_amount, 2);
  if v_amount = 0 then
    raise exception 'Amount cannot be zero';
  end if;
  if p_entry_type = 'spend' and v_amount >= 0 then
    raise exception 'spend amount must be negative';
  end if;
  if p_entry_type in ('payout_credit', 'recharge', 'reversal_refund') and v_amount <= 0 then
    raise exception '% amount must be positive', p_entry_type;
  end if;

  v_moment_id := p_moment_id;
  v_venue_id := p_venue_id;
  v_order_id := p_order_id;
  v_issuance_id := p_issuance_id;
  v_related_id := p_related_entry_id;
  v_gross := case when p_gross_order_amount is null then null else round(p_gross_order_amount, 2) end;
  v_fee := case when p_platform_fee is null then null else round(p_platform_fee, 2) end;

  if p_entry_type = 'reversal_refund' then
    if v_related_id is null then
      raise exception 'A refund reversal must point at the spend it returns';
    end if;
    select * into v_related
    from public.promocard_ledger
    where id = v_related_id
    for update;
    if not found or v_related.user_id <> p_user_id or v_related.card_id <> v_card.id or v_related.entry_type <> 'spend' then
      raise exception 'Refund reversal must point at the member spend';
    end if;
    select coalesce(sum(amount), 0) into v_already
    from public.promocard_ledger
    where related_entry_id = v_related.id
      and entry_type = 'reversal_refund';
    if v_amount > abs(v_related.amount) - v_already then
      raise exception 'Refund reversal exceeds the original spend';
    end if;
    v_moment_id := coalesce(v_moment_id, v_related.moment_id);
    v_venue_id := coalesce(v_venue_id, v_related.venue_id);
    v_order_id := coalesce(v_order_id, v_related.order_id);
    v_issuance_id := coalesce(v_issuance_id, v_related.issuance_id);
  end if;

  if p_entry_type = 'spend' and v_order_id is null then
    raise exception 'spend requires an order';
  end if;

  if v_moment_id is not null and not exists (select 1 from public.moments where id = v_moment_id) then
    v_moment_id := null;
  end if;

  v_zone := public.promocard_night_timezone(v_moment_id, v_venue_id);
  v_night := coalesce(p_business_night, public.promocard_business_night(coalesce(p_occurred_at, now()), v_zone));
  if p_entry_type = 'reversal_refund' and p_business_night is null and v_related.business_night is not null then
    v_night := v_related.business_night;
  end if;
  v_cycle := coalesce(nullif(btrim(p_cycle_id), ''), to_char(v_night, 'YYYY-MM'));
  if p_entry_type = 'reversal_refund' and p_cycle_id is null and v_related.cycle_id is not null and p_business_night is null then
    v_cycle := v_related.cycle_id;
  end if;

  v_after := round(v_card.available_balance + v_amount, 2);
  if v_after < 0 then
    raise exception 'Insufficient PromoCard balance';
  end if;

  insert into public.promocard_ledger (
    user_id, card_id, entry_type, amount, currency, balance_after,
    order_id, issuance_id, gross_order_amount, platform_fee,
    moment_id, venue_id, business_night, cycle_id, related_entry_id,
    idempotency_key, is_test, created_by, metadata
  ) values (
    p_user_id, v_card.id, p_entry_type, v_amount, 'USD', v_after,
    v_order_id, v_issuance_id, v_gross, v_fee,
    v_moment_id, v_venue_id, v_night, v_cycle, v_related_id,
    btrim(p_idempotency_key), coalesce(p_is_test, false), v_created_by, coalesce(p_metadata, '{}'::jsonb)
  ) returning * into v_tx;

  v_current_cycle := to_char(public.promocard_business_night(now(), 'America/Jamaica'), 'YYYY-MM');
  update public.user_promo_cards
  set available_balance = v_after,
      spent_this_cycle = greatest(0, public.promocard_spent_this_cycle(v_card.id, v_current_cycle)),
      updated_at = now()
  where id = v_card.id;

  return v_tx;
exception when unique_violation then
  select * into v_existing
  from public.promocard_ledger
  where idempotency_key = btrim(p_idempotency_key);
  if found then
    return v_existing;
  end if;
  raise;
end;
$$;

comment on function public.post_promocard_ledger(uuid, text, numeric, text, uuid, uuid, numeric, numeric, uuid, uuid, date, text, uuid, boolean, text, jsonb, timestamptz) is
  'Posts one PromoCard ledger row and updates available_balance under a row lock. Idempotent on idempotency_key. Not granted to member roles.';

revoke all on function public.promocard_time_zone_ok(text) from public, anon, authenticated;
revoke all on function public.promocard_business_night(timestamptz, text) from public, anon, authenticated;
revoke all on function public.promocard_night_timezone(uuid, uuid) from public, anon, authenticated;
revoke all on function public.promocard_spent_this_cycle(uuid, text) from public, anon, authenticated;
revoke all on function public.prevent_promocard_ledger_mutation() from public, anon, authenticated;
revoke all on function public.post_promocard_ledger(uuid, text, numeric, text, uuid, uuid, numeric, numeric, uuid, uuid, date, text, uuid, boolean, text, jsonb, timestamptz) from public, anon, authenticated;
grant execute on function public.post_promocard_ledger(uuid, text, numeric, text, uuid, uuid, numeric, numeric, uuid, uuid, date, text, uuid, boolean, text, jsonb, timestamptz) to service_role;

alter table public.promocard_ledger enable row level security;
drop policy if exists "Members read own promocard ledger" on public.promocard_ledger;
create policy "Members read own promocard ledger"
  on public.promocard_ledger
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.promocard_ledger from public, anon, authenticated, service_role;
grant select on table public.promocard_ledger to authenticated;
grant select on table public.promocard_ledger to service_role;

create or replace view public.promocard_spend_by_business_night
with (security_invoker = true) as
select
  business_night,
  currency,
  count(*)::bigint as spend_count,
  coalesce(sum(-amount), 0)::numeric(12,2) as spend_amount,
  coalesce(sum(platform_fee), 0)::numeric(12,2) as platform_fee
from public.promocard_ledger
where entry_type = 'spend'
  and is_test = false
group by business_night, currency;

comment on view public.promocard_spend_by_business_night is
  'Real non-test PromoCard spend grouped by business night. Service role only.';

revoke all on table public.promocard_spend_by_business_night from public, anon, authenticated;
grant select on table public.promocard_spend_by_business_night to service_role;

-- Optional moment_id is stored on the commerce order and copied onto the spend row.
drop function if exists public.reserve_promocard_cart(uuid, jsonb, uuid, text);

create or replace function public.reserve_promocard_cart(
  p_buyer_id uuid,
  p_items jsonb,
  p_issuance_id uuid default null,
  p_referral_code text default null,
  p_moment_id uuid default null
) returns public.commerce_orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  o public.commerce_orders;
  i public.offer_issuances;
  benefit public.offers;
  r record;
  eligible numeric := 0;
  discount numeric := 0;
  rule jsonb;
  referrer uuid;
  eligible_products jsonb;
  v_moment_id uuid;
  v_venue_id uuid;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then raise exception 'Choose between 1 and 50 products'; end if;
  if exists(select 1 from jsonb_array_elements(p_items) x where (x->>'quantity')::numeric <> trunc((x->>'quantity')::numeric) or (x->>'quantity')::numeric not between 1 and 99 or x->>'quantity' is null) then raise exception 'Quantities must be whole numbers from 1 to 99'; end if;
  if (select count(distinct x->>'product_id') from jsonb_array_elements(p_items) x) <> jsonb_array_length(p_items) then raise exception 'Combine duplicate products'; end if;
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
  if p_moment_id is not null then
    select id, venue_id into v_moment_id, v_venue_id from public.moments where id = p_moment_id;
    if v_moment_id is null then raise exception 'Moment is unavailable'; end if;
    o.metadata := o.metadata || jsonb_build_object('moment_id', v_moment_id);
    if v_venue_id is not null then
      o.metadata := o.metadata || jsonb_build_object('venue_id', v_venue_id);
    end if;
  end if;
  update public.commerce_orders set metadata=o.metadata,subtotal=o.subtotal,total_amount=o.total_amount,platform_fee=o.platform_fee,merchant_net=o.merchant_net where id=o.id returning * into o;
  return o;
end;
$$;

revoke all on function public.reserve_promocard_cart(uuid, jsonb, uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.reserve_promocard_cart(uuid, jsonb, uuid, text, uuid) to service_role;

create or replace function public.finish_checkout_benefit()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  h public.commerce_benefit_holds;
  i public.offer_issuances;
  v_moment_id uuid;
  v_venue_id uuid;
  v_moment_text text;
  v_venue_text text;
  v_gross numeric(12,2);
begin
  if new.payment_status is not distinct from old.payment_status then return new; end if;
  select * into h from public.commerce_benefit_holds where order_id=new.id and status='held' for update;
  if not found then return new; end if;
  if new.payment_status='paid' then
    select * into i from public.offer_issuances where id=h.issuance_id for update;
    update public.commerce_benefit_holds set status='consumed' where order_id=new.id;
    update public.offer_issuances set status='redeemed',redeemed_at=now(),redeemed_by=new.buyer_id where id=i.id;
    update public.offers set quantity_reserved=greatest(0,quantity_reserved-1),quantity_redeemed=quantity_redeemed+1 where id=i.offer_id;
    insert into public.offer_redemption_events(issuance_id,event_type,actor_user_id,metadata)
      values(i.id,'redeemed',new.buyer_id,jsonb_build_object('commerce_order_id',new.id,'discount_amount',h.discount_amount));

    -- Spend is recorded when the benefit is redeemed, not when the cart is reserved.
    -- A buyer with no PromoCard (isolated commerce fixtures, or a provisioning miss)
    -- does not roll back a captured payment. Every signup is provisioned a card.
    if not exists (select 1 from public.user_promo_cards where user_id = new.buyer_id) then
      raise warning 'promocard_ledger spend skipped for order % because buyer % has no PromoCard', new.id, new.buyer_id;
    else
      v_moment_text := nullif(btrim(new.metadata->>'moment_id'), '');
      if v_moment_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        v_moment_id := v_moment_text::uuid;
        if exists (select 1 from public.moments where id = v_moment_id) then
          select venue_id into v_venue_id from public.moments where id = v_moment_id;
        else
          v_moment_id := null;
        end if;
      end if;
      if v_venue_id is null then
        v_venue_text := nullif(btrim(new.metadata->>'venue_id'), '');
        if v_venue_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
          v_venue_id := v_venue_text::uuid;
        end if;
      end if;
      if v_venue_id is null then
        select case when count(distinct p.venue_id) = 1 then min(p.venue_id) else null end
          into v_venue_id
        from public.commerce_order_items oi
        join public.merchant_products p on p.id = oi.product_id
        where oi.order_id = new.id
          and p.venue_id is not null;
      end if;
      v_gross := round(coalesce(nullif(new.metadata->>'original_subtotal', '')::numeric, new.subtotal + h.discount_amount), 2);
      perform public.post_promocard_ledger(
        p_user_id => new.buyer_id,
        p_entry_type => 'spend',
        p_amount => -h.discount_amount,
        p_idempotency_key => 'spend:' || new.id::text,
        p_order_id => new.id,
        p_issuance_id => h.issuance_id,
        p_gross_order_amount => v_gross,
        p_platform_fee => new.platform_fee,
        p_moment_id => v_moment_id,
        p_venue_id => v_venue_id,
        p_occurred_at => coalesce(new.paid_at, now()),
        p_is_test => lower(coalesce(new.metadata->>'is_test', '')) in ('true', 't', '1'),
        p_created_by => 'system',
        p_metadata => jsonb_strip_nulls(jsonb_build_object(
          'promocard_title', new.metadata->>'promocard_title',
          'discount_amount', h.discount_amount,
          'payment_status', new.payment_status,
          'buyer_is_merchant', new.buyer_id = new.merchant_id
        ))
      );
    end if;
  elsif new.payment_status in ('cancelled','failed') then
    update public.commerce_benefit_holds set status='released' where order_id=new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.finish_checkout_benefit() from public, anon, authenticated;

notify pgrst, 'reload schema';
