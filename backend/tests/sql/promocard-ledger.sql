-- Run against an isolated database after 20261120152200_promocard_transaction_ledger.sql.
-- Does not target a live Supabase project. Rolls the fixture back.
begin;

-- Saturday 1:30 AM in Jamaica is Friday night. Exactly 6:00 AM starts the new night.
-- 2026-11-21 06:30+00 = 01:30 America/Jamaica. 2026-11-21 11:00+00 = 06:00 America/Jamaica.
do $$
begin
  assert public.promocard_business_night('2026-11-21 06:30:00+00', 'America/Jamaica') = date '2026-11-20',
    '1:30 AM Saturday stays on Friday night';
  assert public.promocard_business_night('2026-11-21 11:00:00+00', 'America/Jamaica') = date '2026-11-21',
    '6:00 AM is the new business night';
  assert public.promocard_business_night('2026-11-21 06:30:00+00', 'Not/A_Zone') = public.promocard_business_night('2026-11-21 06:30:00+00', 'America/Jamaica'),
    'An unknown zone falls back to America/Jamaica';
  assert public.promocard_night_timezone(null, null) = 'America/Jamaica', 'Default night zone is Jamaica';
end $$;

-- Member roles can read their own rows and cannot post or execute the writer.
do $$
begin
  assert not has_function_privilege(
    'authenticated',
    'public.post_promocard_ledger(uuid,text,numeric,text,uuid,uuid,numeric,numeric,uuid,uuid,date,text,uuid,boolean,text,jsonb,timestamptz)',
    'execute'
  ), 'Members cannot post PromoCard ledger rows';
  assert not has_function_privilege(
    'anon',
    'public.post_promocard_ledger(uuid,text,numeric,text,uuid,uuid,numeric,numeric,uuid,uuid,date,text,uuid,boolean,text,jsonb,timestamptz)',
    'execute'
  ), 'Anonymous clients cannot post PromoCard ledger rows';
  assert has_function_privilege(
    'service_role',
    'public.post_promocard_ledger(uuid,text,numeric,text,uuid,uuid,numeric,numeric,uuid,uuid,date,text,uuid,boolean,text,jsonb,timestamptz)',
    'execute'
  ), 'The trusted server posts through the RPC';
  assert not has_table_privilege('authenticated', 'public.promocard_ledger', 'insert'), 'Members cannot insert ledger rows';
  assert not has_table_privilege('authenticated', 'public.promocard_ledger', 'update'), 'Members cannot update ledger rows';
  assert not has_table_privilege('authenticated', 'public.promocard_ledger', 'delete'), 'Members cannot delete ledger rows';
  assert has_table_privilege('authenticated', 'public.promocard_ledger', 'select'), 'Members can select, and RLS limits that to their rows';
end $$;

-- Balance movement, idempotency, append-only, and the spend cache.
-- Requires auth.users plus the signup card trigger, or an existing card for the buyer.
do $$
declare
  v_buyer uuid := '00000000-0000-0000-0000-000000000091';
  v_first public.promocard_ledger;
  v_again public.promocard_ledger;
  v_balance numeric;
  v_spent numeric;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) values (
    '00000000-0000-0000-0000-000000000000', v_buyer, 'authenticated', 'authenticated',
    'ledger-buyer@promorang.test', '', now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', ''
  ) on conflict (id) do nothing;
  insert into public.user_promo_cards (user_id, available_balance, spent_this_cycle)
  values (v_buyer, 45.00, 0)
  on conflict (user_id) do update set available_balance = 45.00, spent_this_cycle = 0;

  v_first := public.post_promocard_ledger(
    v_buyer, 'recharge', 5, 'recharge:test-ledger',
    null, null, null, null, null, null, null, null, null, false, 'system', '{}'::jsonb,
    '2026-11-21 06:30:00+00'
  );
  assert v_first.amount = 5 and v_first.balance_after = 50, 'Recharge adds to the locked balance';
  assert v_first.business_night = date '2026-11-20', 'Posted night uses the 6:00 AM cutoff';
  assert v_first.cycle_id = '2026-11', 'cycle_id is the business night month';
  select available_balance, spent_this_cycle into v_balance, v_spent
  from public.user_promo_cards where user_id = v_buyer;
  assert v_balance = 50, 'available_balance matches balance_after';
  assert v_spent = 0, 'A recharge is not spend';

  v_again := public.post_promocard_ledger(v_buyer, 'recharge', 5, 'recharge:test-ledger');
  assert v_again.id = v_first.id, 'Replaying the same key adds no row';
  assert (select count(*) from public.promocard_ledger where idempotency_key = 'recharge:test-ledger') = 1, 'Idempotency key stays unique';
  assert (select available_balance from public.user_promo_cards where user_id = v_buyer) = 50, 'Replay does not move the balance again';

  begin
    update public.promocard_ledger set amount = amount where id = v_first.id;
    raise exception 'UPDATE should have failed';
  exception when others then
    if sqlerrm not like '%append-only%' then raise; end if;
  end;
  begin
    delete from public.promocard_ledger where id = v_first.id;
    raise exception 'DELETE should have failed';
  exception when others then
    if sqlerrm not like '%append-only%' then raise; end if;
  end;
end $$;

rollback;
