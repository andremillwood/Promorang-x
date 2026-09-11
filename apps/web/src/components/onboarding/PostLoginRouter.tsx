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
 * Intelligently routes users based on role + completion state
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
      const requestedNext = consumePostAuthNext()
        || (hasAftrHrsClaimPending() ? AFTRHRS_PATHS.claimReturn : null);
      const intendedRole =
        readIntendedStakeholderRole(sessionStorage) ||
        roleFromNext(requestedNext);
      const appliedRole = intendedRole ? await applyIntendedRole(user.id, intendedRole) : activeRole;
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

      if (appliedRole === "admin" || (roles.includes("admin") && !isConsumerPostAuthNext(requestedNext))) {
        navigate("/admin?tab=command", { replace: true });
        return;
      }

      // Onboarding is the only prerequisite. First actions belong on the
      // dashboard, not in a chain of forced redirects after every sign-in.
      const { data, error } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();

      navigate(resolvePostAuthPath({
        role: appliedRole || activeRole,
        onboardingCompleted: error ? true : Boolean(data?.onboarding_completed),
      }), { replace: true });
    };

    determineLandingPage();
  }, [user, activeRole, loading, navigate, roles, setActiveRole, applyIntendedRole]);

  // Show loading while determining route
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
