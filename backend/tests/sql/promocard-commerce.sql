-- Run against an isolated database with the commerce and offer migrations applied.
begin;
insert into public.users(id) values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002'),('00000000-0000-0000-0000-000000000003'),('00000000-0000-0000-0000-000000000004');
insert into public.merchant_products(id,merchant_id,name,price,currency,category,is_active,inventory_quantity,inventory_count) values
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','Coffee',10,'USD','Food',true,100,100),
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Shirt',30,'USD','Apparel',true,100,100),
('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004','Other store',30,'USD','Food',true,100,100);
insert into public.referral_codes(user_id,code,is_active) values ('00000000-0000-0000-0000-000000000003','FRIEND',true),('00000000-0000-0000-0000-000000000001','SELF',true);
insert into public.offers(id,owner_user_id,title,reward_type,value_amount,value_currency,status,quantity_reserved,quantity_total,metadata) values
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','Food half off','coupon',50,'USD','active',2,10,'{"checkout_discount":{"kind":"percentage","category":"Food","minimum_spend":20}}');
insert into public.offer_issuances(id,offer_id,user_id,status,source_event_id) values
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','claimed','event1'),
('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','claimed','event2');
create function pg_temp.must_fail(query text) returns void language plpgsql as $$
begin
  begin execute query; exception when others then return; end;
  raise exception 'Expected rejection: %',query;
end $$;
do $$
declare o public.commerce_orders; again public.commerce_orders; before_stock integer; b constant uuid := '00000000-0000-0000-0000-000000000001'; i constant uuid := '30000000-0000-0000-0000-000000000001'; cart constant jsonb := '[{"product_id":"10000000-0000-0000-0000-000000000001","quantity":2},{"product_id":"10000000-0000-0000-0000-000000000002","quantity":1}]';
begin
  assert not has_function_privilege('authenticated','public.reserve_promocard_cart(uuid,jsonb,uuid,text)','execute'), 'Only trusted server may reserve';
  perform pg_temp.must_fail(format('select public.reserve_promocard_cart(%L,%L,%L,%L)',b,cart,i,'SELF'));
  perform pg_temp.must_fail(format('select public.reserve_promocard_cart(%L,%L,%L,%L)',b,cart,i,'UNKNOWN'));
  perform pg_temp.must_fail(format('select public.reserve_promocard_cart(%L,%L,%L)', '00000000-0000-0000-0000-000000000004',cart,i));
  perform pg_temp.must_fail(format('select public.reserve_promocard_cart(%L,%L)',b,'[{"product_id":"10000000-0000-0000-0000-000000000001","quantity":1},{"product_id":"10000000-0000-0000-0000-000000000003","quantity":1}]'));
  assert (select inventory_quantity=100 from merchant_products where id='10000000-0000-0000-0000-000000000001'), 'Failed carts roll back stock';
  perform pg_temp.must_fail(format('select public.reserve_promocard_cart(%L,%L,%L)',b,'[{"product_id":"10000000-0000-0000-0000-000000000001","quantity":1}]',i));
  update merchant_products set currency='JMD' where id='10000000-0000-0000-0000-000000000001';
  perform pg_temp.must_fail(format('select public.reserve_promocard_cart(%L,%L,%L)',b,cart,i));
  update merchant_products set currency='USD' where id='10000000-0000-0000-0000-000000000001';
  update offer_issuances set expires_at=now()-interval '1 day' where id=i;
  perform pg_temp.must_fail(format('select public.reserve_promocard_cart(%L,%L,%L)',b,cart,i));
  update offer_issuances set expires_at=null where id=i;
  o := public.reserve_promocard_cart(b,cart,i,'FRIEND');
  assert o.subtotal=40 and (o.metadata->>'discount_amount')::numeric=10, 'Discount applies only to Food, not whole cart';
  assert o.metadata->>'referrer_id'='00000000-0000-0000-0000-000000000003', 'Referral persists';
  perform pg_temp.must_fail(format('select public.reserve_promocard_cart(%L,%L,%L)',b,cart,i));
  perform pg_temp.must_fail(format('update public.offer_issuances set status=''redeemed'' where id=%L',i));
  o := public.capture_direct_commerce_order(o.id,'pi_test',null,'cs_test','acct_test',2,3,null);
  assert o.total_amount=45, 'Capture includes discounted subtotal plus tax and delivery';
  o := public.capture_direct_commerce_order(o.id,'pi_test',null,'cs_test','acct_test',2,3,null);
  assert (select quantity_redeemed=1 from offers where id='20000000-0000-0000-0000-000000000001'), 'Retry consumes benefit once';
  assert (select status='redeemed' from offer_issuances where id=i), 'Paid capture redeems';
  perform pg_temp.must_fail(format('select public.reserve_promocard_cart(%L,%L,%L)',b,cart,i));
  update offers set value_amount=5, metadata='{"checkout_discount":{"kind":"fixed","category":"Food"}}' where id='20000000-0000-0000-0000-000000000001';
  again := public.reserve_promocard_cart(b,cart,'30000000-0000-0000-0000-000000000002');
  assert again.subtotal=45, 'Fixed credit subtracts its currency amount';
  perform public.release_commerce_order(again.id,'expired_session');
  assert (select status='claimed' from offer_issuances where id='30000000-0000-0000-0000-000000000002'), 'Cancellation retains claimed benefit';
  again := public.reserve_promocard_cart(b,cart,'30000000-0000-0000-0000-000000000002');
  update commerce_orders set payment_status='processing',reservation_expires_at=now()-interval '1 hour' where id=again.id;
  update commerce_inventory_reservations set expires_at=now()-interval '1 hour' where order_id=again.id;
  perform public.release_expired_commerce_reservations();
  assert (select bool_and(status='held') from commerce_inventory_reservations where order_id=again.id), 'Async payments retain stock until terminal webhook';
  raise notice 'PASS: ownership, currency-ready cart, scoped discount, rollback, referral, exclusivity, capture retry, cancellation and async hold checks';
end $$;
rollback;
