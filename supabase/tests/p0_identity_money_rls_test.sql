BEGIN;
SELECT plan(22);

SELECT ok(
  (SELECT bool_and(c.relrowsecurity)
   FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = ANY (ARRAY[
     'users','user_roles','transactions','gem_ledger_entries','growth_ledger',
     'creator_earnings_ledger','representatives','representative_commissions',
     'piece_settlement_ledger','piece_escrow','piece_fee_reserves','staking_positions',
     'shield_subscriptions','funding_pledges','investor_content_shares','verified_actions'
   ])),
  'all P0 tables have row-level security enabled'
);

SELECT is(
  (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = ANY (ARRAY[
     'users','user_roles','transactions','gem_ledger_entries','growth_ledger',
     'creator_earnings_ledger','representatives','representative_commissions',
     'piece_settlement_ledger','piece_escrow','piece_fee_reserves','staking_positions',
     'shield_subscriptions','funding_pledges','investor_content_shares','verified_actions'
   ])), 16::bigint, 'all expected P0 tables exist');

SELECT ok(NOT has_table_privilege('anon', 'public.transactions', 'SELECT'), 'anon cannot read transactions');
SELECT ok(NOT has_table_privilege('anon', 'public.gem_ledger_entries', 'SELECT'), 'anon cannot read the Gem ledger');
SELECT ok(NOT has_table_privilege('anon', 'public.user_roles', 'INSERT'), 'anon cannot assign roles');
SELECT ok(NOT has_table_privilege('authenticated', 'public.transactions', 'INSERT'), 'members cannot insert transactions');
SELECT ok(NOT has_table_privilege('authenticated', 'public.transactions', 'UPDATE'), 'members cannot update transactions');
SELECT ok(NOT has_table_privilege('authenticated', 'public.transactions', 'DELETE'), 'members cannot delete transactions');
SELECT ok(NOT has_table_privilege('authenticated', 'public.piece_fee_reserves', 'SELECT'), 'Piece reserves are service-only');
SELECT ok(has_table_privilege('service_role', 'public.transactions', 'SELECT'), 'service role can read transactions');
SELECT ok(has_table_privilege('service_role', 'public.transactions', 'INSERT'), 'service role can write transactions');
SELECT ok(has_column_privilege('anon', 'public.users', 'display_name', 'SELECT'), 'public directory name is readable');
SELECT ok(NOT has_column_privilege('anon', 'public.users', 'email', 'SELECT'), 'email is not publicly readable');
SELECT ok(NOT has_column_privilege('authenticated', 'public.users', 'gems_balance', 'SELECT'), 'member cannot directly read balance columns');
SELECT ok(NOT has_column_privilege('authenticated', 'public.users', 'kyc_status', 'SELECT'), 'member cannot directly read KYC status');
SELECT ok(NOT has_column_privilege('authenticated', 'public.users', 'role', 'UPDATE'), 'member cannot update legacy role column');

INSERT INTO auth.users (id, email, aud, role)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'rls-owner@example.invalid', 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000002', 'rls-other@example.invalid', 'authenticated', 'authenticated');

INSERT INTO public.users (id, email, username, display_name)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'rls-owner@example.invalid', 'rls_owner', 'RLS Owner'),
  ('a0000000-0000-0000-0000-000000000002', 'rls-other@example.invalid', 'rls_other', 'RLS Other');

INSERT INTO public.transactions (id, user_id, amount, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 10, 'completed'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 20, 'completed');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);

SELECT is((SELECT count(*) FROM public.transactions), 1::bigint, 'member sees only own transaction');
SELECT is((SELECT amount FROM public.transactions), 10::numeric, 'member sees the correct own transaction');
SELECT lives_ok(
  $$INSERT INTO public.user_roles (user_id, role) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'creator')$$,
  'member may choose an approved non-privileged role'
);
SELECT throws_ok(
  $$INSERT INTO public.user_roles (user_id, role) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'master_admin')$$,
  '42501',
  'new row violates row-level security policy for table "user_roles"',
  'member cannot self-assign platform owner'
);
SELECT throws_ok(
  $$INSERT INTO public.user_roles (user_id, role) VALUES
    ('a0000000-0000-0000-0000-000000000002', 'creator')$$,
  '42501',
  'new row violates row-level security policy for table "user_roles"',
  'member cannot assign a role to another user'
);
SELECT is(
  (SELECT count(*) FROM public.user_roles WHERE role::text = 'master_admin'),
  0::bigint,
  'no platform-owner role was created by the member'
);

SELECT * FROM finish();
ROLLBACK;
