-- P0 security hardening for privileged role mutation RPCs and host analytics.
--
-- 1. Keep role grant/revoke RPCs backend-only. These functions are SECURITY
--    DEFINER and intentionally used by the server-side role service, which
--    authenticates to Supabase with the service-role credential.
-- 2. Keep organization-management RPCs available to signed-in users, but stop
--    exposing them to anonymous callers. Their bodies already enforce
--    organization membership/ownership authorization.
-- 3. Remove the host analytics dependency on auth.users, execute the view with
--    the caller's privileges, and expose it only to the backend service role.

-- Privileged global role mutations: backend/service-role only.
REVOKE ALL ON FUNCTION public.grant_user_role(uuid, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_user_role(uuid, text, uuid) TO service_role;
ALTER FUNCTION public.grant_user_role(uuid, text, uuid) SET search_path = pg_catalog, public;

REVOKE ALL ON FUNCTION public.revoke_user_role(uuid, character varying, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_user_role(uuid, character varying, text) TO service_role;
ALTER FUNCTION public.revoke_user_role(uuid, character varying, text) SET search_path = pg_catalog, public;

-- Organization RPCs are legitimate authenticated client actions, but anonymous
-- execution is unnecessary and expands the exposed SECURITY DEFINER surface.
REVOKE ALL ON FUNCTION public.create_organization_workspace(text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organization_workspace(text, text, text, text, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.set_organization_member_role(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_organization_member_role(uuid, uuid, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.remove_organization_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_organization_member(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.transfer_organization_ownership(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transfer_organization_ownership(uuid, uuid) TO authenticated, service_role;

-- Host analytics previously selected directly from auth.users and exposed the
-- resulting host_email through an anonymously accessible definer view. The
-- application already maintains the same identity in public.users, so there is
-- no reason for this aggregate to cross the auth schema boundary.
CREATE OR REPLACE VIEW public.host_earnings_analytics
WITH (security_invoker = true)
AS
SELECT
  u.id AS host_id,
  u.email::character varying(255) AS host_email,
  count(DISTINCT m.id) AS total_moments,
  sum(mep.total_amount_usd) AS total_rewards_distributed,
  count(DISTINCT r.user_id) AS total_participants,
  CASE
    WHEN count(DISTINCT m.id) > 0
      THEN count(DISTINCT r.user_id)::numeric / count(DISTINCT m.id)::numeric
    ELSE 0::numeric
  END AS avg_participants_per_moment,
  count(DISTINCT cs.campaign_id) AS campaigns_participated,
  sum(cs.sponsorship_amount) AS total_sponsorship_received,
  max(m.created_at) AS last_moment_date,
  count(CASE WHEN m.status = 'active'::public.moment_status THEN 1 ELSE NULL::integer END) AS active_moments,
  count(CASE WHEN m.status = 'closed'::public.moment_status THEN 1 ELSE NULL::integer END) AS completed_moments
FROM public.users u
LEFT JOIN public.moments m ON u.id = m.organizer_id
LEFT JOIN public.redemptions r ON m.id = r.moment_id
LEFT JOIN public.campaign_sponsorships cs ON m.id = cs.moment_id
LEFT JOIN public.moment_escrow_pools mep ON m.id = mep.moment_id
GROUP BY u.id, u.email;

REVOKE ALL ON TABLE public.host_earnings_analytics FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.host_earnings_analytics TO service_role;

COMMENT ON VIEW public.host_earnings_analytics IS
  'Backend-only earnings and performance metrics for hosts; security-invoker and independent of auth.users.';
