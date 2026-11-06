-- Reversal of unpaid commissions when authoritative order state changes.
create or replace function public.reverse_partner_order_rewards()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.payment_status in ('refunded','partially_refunded','disputed','cancelled')
     or new.fulfillment_status = 'cancelled' then
    update public.partner_outcomes set status='reversed'
      where source_system='commerce_orders' and source_id=new.id::text
        and outcome_type='order_fulfilled' and status='verified';
    update public.partner_commissions set status='reversed'
      where outcome_id in (
        select id from public.partner_outcomes
        where source_system='commerce_orders' and source_id=new.id::text
          and outcome_type='order_fulfilled'
      ) and status in ('pending_review','approved');
  end if;
  return new;
end;
$$;
revoke all on function public.reverse_partner_order_rewards() from public,anon,authenticated;
drop trigger if exists partner_order_refund_reversal on public.commerce_orders;
create trigger partner_order_refund_reversal
after update of payment_status,fulfillment_status on public.commerce_orders
for each row execute function public.reverse_partner_order_rewards();
