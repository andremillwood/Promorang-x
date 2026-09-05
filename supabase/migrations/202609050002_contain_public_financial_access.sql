-- Contain confirmed production access risks without changing application data.

ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Financial writes belong to the service role. Authenticated users retain only
-- the row-scoped SELECT policies already defined on these tables.
REVOKE ALL ON TABLE public.payments FROM anon, authenticated;
REVOKE ALL ON TABLE public.payment_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.subscriptions FROM anon, authenticated;
GRANT SELECT ON TABLE public.payments TO authenticated;
GRANT SELECT ON TABLE public.payment_events TO authenticated;
GRANT SELECT ON TABLE public.subscriptions TO authenticated;
GRANT ALL ON TABLE public.payments TO service_role;
GRANT ALL ON TABLE public.payment_events TO service_role;
GRANT ALL ON TABLE public.subscriptions TO service_role;

-- Remove the explicitly temporary whole-users anonymous policy and grants.
DROP POLICY IF EXISTS users_read_all_for_anon_testing ON public.users;
REVOKE ALL ON TABLE public.users FROM anon;

-- Anonymous discovery only needs public identity fields. Column grants prevent
-- the broad profile-read policy from exposing email, Stripe ids, or balances.
REVOKE ALL ON TABLE public.profiles FROM anon;
GRANT SELECT (id, user_id, username, display_name, user_type, avatar_url,
              instagram_username, follower_count, instagram_verified,
              influence_tier, created_at, updated_at)
ON public.profiles TO anon;
