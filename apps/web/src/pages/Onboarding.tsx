import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHasCompletedOnboarding } from "@/hooks/useUserPreferences";
import OnboardingSurvey from "@/components/onboarding/OnboardingSurvey";
import { getAnonymousId, trackGrowthEvent } from "@/lib/marketing-attribution";
import { useI18n } from "@/i18n/I18nContext";
import { landingPathForRole, promoCardAimPath } from "@promorang/shared";
import { readPromoCardAim } from "@/lib/promocard-aim";
import { consumePostAuthNext, defaultPostAuthPath } from "@/lib/post-auth-next";
import { API_BASE_URL } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

const Onboarding = () => {
  const { t } = useI18n();
  const { user, session, activeRole, loading: authLoading, applyIntendedRole } = useAuth();
  const { hasCompleted, isLoading: prefsLoading } = useHasCompletedOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!prefsLoading && hasCompleted) {
      navigate(consumePostAuthNext() || defaultPostAuthPath(activeRole), { replace: true });
    }
  }, [hasCompleted, prefsLoading, navigate, activeRole]);

  const markOnboardingComplete = async () => {
    if (!user) return;

    let completed = false;
    if (session?.access_token) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/onboarding/complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        completed = response.ok;
      } catch {
        completed = false;
      }
    }

    if (!completed) {
      // public.users is a legacy table not yet represented by generated types.
      const { error } = await (supabase as any)
        .from("users")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
      if (error) {
        console.warn("[Onboarding] Could not persist completion state:", error.message);
      }
    }
  };

  const handleComplete = async (personaChoice?: string) => {
    const roleMap: Record<string, string> = {
      explorer: "explorer",
      creator: "creator",
      mayor: "host",
      merchant: "merchant",
      brand: "brand",
      agency: "agency",
    };
    const roleId = (personaChoice && roleMap[personaChoice]) || "explorer";
    const workspaceRole = roleId === "explorer" ? "participant" : roleId;

    // The persona selected in onboarding is an access/workspace decision, not
    // just presentation state. Register it before leaving onboarding so a
    // refresh cannot collapse an agency, host, or creator back to participant.
    if (user) {
      await applyIntendedRole(user.id, workspaceRole);
    }
    await markOnboardingComplete();

    void trackGrowthEvent({
      eventName: "onboarding_completed",
      journey: workspaceRole === "participant" || workspaceRole === "creator" ? "participant" : "commercial",
      stage: "activated",
      entityType: "onboarding",
      entityId: "preferences",
      idempotencyKey: `growth:onboarding:${getAnonymousId()}`,
      properties: { persona: personaChoice || "explorer", role: workspaceRole },
    });

    sessionStorage.setItem("promorang_role_pilot_active", "true");
    sessionStorage.setItem("promorang_role_pilot_role", roleId);
    sessionStorage.setItem("promorang_role_pilot_step", "0");

    const next = consumePostAuthNext() || landingPathForRole(workspaceRole);
    navigate(next === "/card" ? promoCardAimPath(readPromoCardAim()) : next, { replace: true });
  };

  if (authLoading || prefsLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("onboarding.loading")}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <OnboardingSurvey onComplete={handleComplete} />;
};

export default Onboarding;
