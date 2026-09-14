import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { readIntendedStakeholderRole } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isConsumerPostAuthNext } from "@/lib/auth-roles";
import { getDemoLandingPath, readDemoSession } from "@/lib/demo-session";
import { flushMarketingIntent } from "@/lib/marketing-attribution";
import { AFTRHRS_PATHS } from "@promorang/shared";
import { hasAftrHrsClaimPending } from "@/lib/aftrhrs-claim";
import { consumePostAuthNext, peekPostAuthNext, resolvePostAuthPath, roleFromNext } from "@/lib/post-auth-next";
import { promoCardAimFromNext, writePromoCardAim } from "@/lib/promocard-aim";

/**
 * Post-Login Router
 *
 * Invariants:
 * - explicit intent survives authentication and onboarding
 * - role intent is applied before selecting a workspace
 * - onboarding completion comes from the canonical users state
 * - acquisition flows never silently fall back to the public homepage
 */
export function PostLoginRouter() {
  const { user, activeRole, roles, setActiveRole, loading, applyIntendedRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate(peekPostAuthNext() || "/auth?mode=login", { replace: true });
      return;
    }

    const determineLandingPage = async () => {
      await flushMarketingIntent().catch(() => undefined);

      // Do not consume the stored destination until we know onboarding is done.
      // Onboarding itself consumes it after completion so the original job is
      // resumed instead of being lost.
      const storedNext = peekPostAuthNext();
      const aftrHrsClaimReturn = hasAftrHrsClaimPending() ? AFTRHRS_PATHS.claimReturn : null;
      const requestedNext = storedNext || aftrHrsClaimReturn;
      const intendedRole =
        readIntendedStakeholderRole(sessionStorage) ||
        roleFromNext(requestedNext);
      const appliedRole = intendedRole ? await applyIntendedRole(user.id, intendedRole) : activeRole;

      if (appliedRole && appliedRole !== activeRole) {
        setActiveRole(appliedRole);
      }

      const demoSession = readDemoSession();
      if (demoSession) {
        navigate(getDemoLandingPath(demoSession.role), { replace: true });
        return;
      }

      if (appliedRole === "admin" || (roles.includes("admin") && !isConsumerPostAuthNext(requestedNext))) {
        navigate("/admin?tab=command", { replace: true });
        return;
      }

      // Door/pass acquisition is intentionally low-friction: a guest who came
      // to claim access should finish that claim before a general onboarding
      // survey. All other first-run intents are preserved through onboarding.
      if (aftrHrsClaimReturn && !storedNext) {
        navigate(aftrHrsClaimReturn, { replace: true });
        return;
      }

      // `onboarding_completed` is canonical on public.users. Older accounts may
      // predate that flag, so if the users lookup itself fails we only use the
      // existence of a preferences row as a compatibility fallback. We never
      // interpret a database error as "completed" by default.
      const { data: userState, error: userStateError } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      let onboardingCompleted = Boolean(userState?.onboarding_completed);
      if (userStateError) {
        const { data: legacyPreferences } = await supabase
          .from("user_preferences")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        onboardingCompleted = Boolean(legacyPreferences?.user_id);
      }

      if (!onboardingCompleted) {
        navigate("/onboarding", { replace: true });
        return;
      }

      if (requestedNext) {
        const destination = storedNext ? (consumePostAuthNext() || requestedNext) : requestedNext;
        const aimed = promoCardAimFromNext(destination);
        if (aimed) writePromoCardAim(aimed);
        navigate(destination, { replace: true });
        return;
      }

      navigate(resolvePostAuthPath({
        role: appliedRole || activeRole,
        onboardingCompleted: true,
      }), { replace: true });
    };

    determineLandingPage();
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
