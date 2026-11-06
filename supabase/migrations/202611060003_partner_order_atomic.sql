-- Atomic trusted order adapter. Service role only; no payout endpoint.
create or replace function public.record_verified_partner_order(
  p_campaign_id uuid, p_order_id uuid, p_margin numeric
) returns public.partner_outcomes
language plpgsql security invoker set search_path = public as $$
declare
  c public.partner_campaigns%rowtype;
  o public.commerce_orders%rowtype;
  v_partner uuid;
  v_outcome public.partner_outcomes%rowtype;
begin
  select * into c from public.partner_campaigns where id = p_campaign_id and active for update;
  if not found then raise exception 'Campaign unavailable'; end if;
  select * into o from public.commerce_orders where id = p_order_id for update;
  if not found then raise exception 'Order unavailable'; end if;
  if o.merchant_id <> c.merchant_id or o.currency <> c.currency then
    raise exception 'Merchant or currency mismatch';
  end if;
  if o.payment_status <> 'paid' or o.fulfillment_status not in ('delivered','redeemed') then
    raise exception 'Paid completed order required';
  end if;
  if o.payment_collection = 'merchant' then
    if o.merchant_payment_confirmed_at is null or nullif(o.merchant_payment_reference,'') is null then
      raise exception 'Direct payment not confirmed';
    end if;
  elsif o.payment_collection = 'platform' then
    if o.stripe_payment_intent_id is null then raise exception 'Online payment not confirmed'; end if;
  else raise exception 'Unknown payment method';
  end if;
  v_partner := nullif(o.metadata->>'referrer_id','')::uuid;
  if v_partner is null or v_partner = o.buyer_id or v_partner = o.merchant_id then
    raise exception 'Invalid partner attribution';
  end if;
  if not exists (
    select 1 from public.partner_campaign_members
    where campaign_id = c.id and partner_id = v_partner
  ) then raise exception 'Partner not approved'; end if;
  if not exists (
    select 1 from public.referral_codes
    where user_id = v_partner and upper(code) = upper(o.metadata->>'referral_code')
      and is_active = true
      and (expires_at is null or expires_at > now())
  ) then raise exception 'Invalid referral code'; end if;
  if o.subtotal <= 0 or p_margin is null or p_margin < 0 or p_margin > o.subtotal then
    raise exception 'Invalid verified margin';
  end if;
  insert into public.partner_outcomes(
    campaign_id,partner_id,outcome_type,source_system,source_id,currency,
    eligible_amount,verified_margin,status,verified_at
  ) values (
    c.id,v_partner,'order_fulfilled','commerce_orders',o.id::text,o.currency,
    o.subtotal,p_margin,'verified',now()
  ) on conflict (source_system,source_id,outcome_type) do nothing;
  select * into v_outcome from public.partner_outcomes
    where source_system='commerce_orders' and source_id=o.id::text and outcome_type='order_fulfilled';
  if v_outcome.campaign_id <> c.id or v_outcome.partner_id <> v_partner or v_outcome.status <> 'verified'
    or v_outcome.currency <> o.currency
    or v_outcome.eligible_amount <> o.subtotal
    or v_outcome.verified_margin <> p_margin then
    raise exception 'Existing outcome conflicts with attribution or status';
  end if;
  insert into public.partner_commissions(outcome_id,campaign_id,partner_id,currency,amount)
  values (
    v_outcome.id,c.id,v_partner,o.currency,
    least(round(o.subtotal*c.rate_bps/10000,2),round(p_margin*c.margin_cap_bps/10000,2))
  ) on conflict (outcome_id) do nothing;
  return v_outcome;
end;
$$;
revoke all on function public.record_verified_partner_order(uuid,uuid,numeric) from public,anon,authenticated;
grant execute on function public.record_verified_partner_order(uuid,uuid,numeric) to service_role;
