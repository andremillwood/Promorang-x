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

    if (roles.length === 0 || !activeRole || routingStarted.current) return;
    routingStarted.current = true;

    const determineLandingPage = async () => {
      await flushMarketingIntent().catch(() => undefined);
      const requestedNext = peekPostAuthNext()
        || (hasAftrHrsClaimPending() ? AFTRHRS_PATHS.claimReturn : null);
      const intendedRole =
        readIntendedStakeholderRole(sessionStorage) ||
        roleFromNext(requestedNext);
      const appliedRole = intendedRole ? await applyIntendedRole(user.id, intendedRole) : activeRole;
      const effectiveRole = appliedRole || activeRole;

      if (appliedRole && appliedRole !== activeRole) {
        setActiveRole(appliedRole);
      }

      // `/home` is the generic first-run participant destination emitted by the
      // join funnel, not a task-specific deep link. Preserve it through required
      // onboarding instead of letting it silently bypass onboarding.
      const genericFirstRunHome = requestedNext === "/home" && effectiveRole === "participant";

      // Explicit job/claim intent remains higher priority than generic account
      // setup. Consume it only when we actually use it so interrupted auth can
      // still be resumed across tabs.
      if (requestedNext && !genericFirstRunHome) {
        const destination = peekPostAuthNext() ? (consumePostAuthNext() || requestedNext) : requestedNext;
        const aimed = promoCardAimFromNext(destination);
        if (aimed) writePromoCardAim(aimed);
        navigate(destination, { replace: true });
        return;
      }

      const demoSession = readDemoSession();
      if (demoSession) {
        navigate(getDemoLandingPath(demoSession.role), { replace: true });
        return;
      }

      // `onboarding_completed` is an account lifecycle state on public.users.
      // Discovery preferences are optional and cannot stand in for completion.
      let onboardingCompleted = effectiveRole === "admin";
      if (effectiveRole !== "admin") {
        const { data: userState, error: userStateError } = await supabase
          .from("users")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (!userStateError) {
          onboardingCompleted = Boolean(userState?.onboarding_completed);
        } else {
          const { data: legacyPreferences } = await supabase
            .from("user_preferences")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();
          onboardingCompleted = Boolean(legacyPreferences?.user_id);
        }
      }

      if (!onboardingCompleted) {
        navigate(resolvePostAuthPath({ role: effectiveRole, onboardingCompleted: false }), { replace: true });
        return;
      }

      if (genericFirstRunHome) {
        const destination = peekPostAuthNext() ? (consumePostAuthNext() || "/home") : "/home";
        navigate(destination, { replace: true });
        return;
      }

      // Account-level preference follows the user across browsers/devices. Only
      // enumerated internal destinations are accepted; invalid values fall back
      // to the active-role default.
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
