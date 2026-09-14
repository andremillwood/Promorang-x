BEGIN;
SELECT plan(12);

SELECT is((SELECT count(*) FROM public.admin_capabilities), 27::bigint, '27 capabilities are defined');
SELECT is((SELECT count(*) FROM public.admin_role_capabilities WHERE role = 'support'), 6::bigint, 'Support has six capabilities');
SELECT is((SELECT count(*) FROM public.admin_role_capabilities WHERE role = 'moderator'), 12::bigint, 'Reviewer has twelve capabilities');
SELECT is((SELECT count(*) FROM public.admin_role_capabilities WHERE role = 'admin'), 21::bigint, 'Operations Manager has twenty-one capabilities');
SELECT is((SELECT count(*) FROM public.admin_role_capabilities WHERE role = 'master_admin'), 27::bigint, 'Platform Owner has every capability');
SELECT is((SELECT count(*) FROM public.admin_role_capabilities WHERE role <> 'master_admin' AND capability = 'admin_access.manage'), 0::bigint, 'admin-access management remains owner-only');
SELECT is((SELECT count(*) FROM public.admin_role_capabilities WHERE role <> 'master_admin' AND capability = 'payouts.approve'), 0::bigint, 'payout approval remains owner-only');
SELECT is((SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname IN ('admin_capabilities','admin_role_capabilities','admin_user_capability_grants') AND c.relrowsecurity), 3::bigint, 'all capability tables have RLS');
SELECT is((SELECT count(*) FROM information_schema.role_table_grants WHERE table_schema = 'public'
  AND table_name IN ('admin_capabilities','admin_role_capabilities','admin_user_capability_grants')
  AND grantee IN ('anon','authenticated')), 0::bigint, 'client roles have no direct capability-table grants');
SELECT is((SELECT count(*) FROM information_schema.routine_privileges WHERE routine_schema = 'public'
  AND routine_name IN ('set_platform_admin_role','grant_admin_capability','revoke_admin_capability')
  AND grantee IN ('PUBLIC','anon','authenticated')), 0::bigint, 'client roles cannot call access-management functions');
SELECT is((SELECT count(*) FROM information_schema.routine_privileges WHERE routine_schema = 'public'
  AND routine_name IN ('set_platform_admin_role','grant_admin_capability','revoke_admin_capability')
  AND grantee = 'service_role'), 3::bigint, 'service role can call the three audited access functions');
SELECT ok(EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'protect_final_platform_owner' AND NOT tgisinternal), 'final-owner protection trigger exists');

SELECT * FROM finish();
ROLLBACK;
