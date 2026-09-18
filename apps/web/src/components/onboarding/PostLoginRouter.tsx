import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { readIntendedStakeholderRole } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getDemoLandingPath, readDemoSession } from "@/lib/demo-session";
import { flushMarketingIntent } from "@/lib/marketing-attribution";
import { AFTRHRS_PATHS } from "@promorang/shared";
import { hasAftrHrsClaimPending } from "@/lib/aftrhrs-claim";
import { consumePostAuthNext, peekPostAuthNext, resolvePostAuthPath, roleFromNext } from "@/lib/post-auth-next";
import { promoCardAimFromNext, writePromoCardAim } from "@/lib/promocard-aim";
import { resolveSavedLandingPreference } from "@/lib/landing-page-preference";

/**
 * Post-Login Router
 * Routes only after authentication AND workspace-role hydration are complete.
 */
export function PostLoginRouter() {
  const { user, activeRole, roles, setActiveRole, loading, applyIntendedRole } = useAuth();
  const navigate = useNavigate();
  const routingStarted = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(peekPostAuthNext() || "/auth?mode=login", { replace: true });
      return;
    }

    // A fresh Supabase SIGNED_IN event exposes the user before AuthContext has
    // finished fetching user_roles and choosing activeRole. Routing during that
    // gap incorrectly treats commercial users as participants. Wait for the
    // workspace context instead of resolving a fallback destination too early.
    if (roles.length === 0 || !activeRole || routingStarted.current) return;
    routingStarted.current = true;

    const determineLandingPage = async () => {
      await flushMarketingIntent().catch(() => undefined);
      const requestedNext = consumePostAuthNext()
        || (hasAftrHrsClaimPending() ? AFTRHRS_PATHS.claimReturn : null);
      const intendedRole =
        readIntendedStakeholderRole(sessionStorage) ||
        roleFromNext(requestedNext);
      const appliedRole = intendedRole ? await applyIntendedRole(user.id, intendedRole) : activeRole;
      const effectiveRole = appliedRole || activeRole;

      // Explicit deep-link intent always wins. This preserves interrupted jobs
      // such as claim, proposal, card, campaign and RSVP flows.
      if (requestedNext) {
        const aimed = promoCardAimFromNext(requestedNext);
        if (aimed) writePromoCardAim(aimed);
        if (appliedRole && appliedRole !== activeRole) {
          setActiveRole(appliedRole);
        }
        navigate(requestedNext, { replace: true });
        return;
      }

      const demoSession = readDemoSession();
      if (demoSession) {
        navigate(getDemoLandingPath(demoSession.role), { replace: true });
        return;
      }

      // Onboarding remains the only prerequisite for non-admin accounts.
      let onboardingCompleted = true;
      if (effectiveRole !== "admin") {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        onboardingCompleted = !error && Boolean(data?.user_id);
      }

      if (!onboardingCompleted) {
        navigate(resolvePostAuthPath({ role: effectiveRole, onboardingCompleted: false }), { replace: true });
        return;
      }

      // Account-level preference is stored in auth metadata so it follows the
      // user across browsers/devices. Only enumerated internal destinations are
      // accepted; stale or unauthorized values fall back to the role default.
      const preferredLanding = resolveSavedLandingPreference({
        path: user.user_metadata?.preferred_landing_path,
        role: user.user_metadata?.preferred_landing_role,
        roles,
        activeRole: effectiveRole,
      });

      if (preferredLanding?.path) {
        if (preferredLanding.role && preferredLanding.role !== activeRole) {
          setActiveRole(preferredLanding.role);
        }
        navigate(preferredLanding.path, { replace: true });
        return;
      }

      navigate(resolvePostAuthPath({
        role: effectiveRole,
        onboardingCompleted: true,
      }), { replace: true });
    };

    determineLandingPage().catch((error) => {
      console.error("[PostLoginRouter] Failed to determine landing page:", error);
      navigate(resolvePostAuthPath({ role: activeRole, onboardingCompleted: true }), { replace: true });
    });
  }, [user, activeRole, loading, navigate, roles, setActiveRole, applyIntendedRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Preparing your experience...</p>
      </div>
    </div>
  );
}

export default PostLoginRouter;
