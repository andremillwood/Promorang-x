import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHasCompletedOnboarding } from "@/hooks/useUserPreferences";
import OnboardingSurvey from "@/components/onboarding/OnboardingSurvey";
import { landingPathForNeed, resolveNeedFromPersona } from "@promorang/shared";
import { getAnonymousId, trackGrowthEvent } from "@/lib/marketing-attribution";
import { useI18n } from "@/i18n/I18nContext";

const Onboarding = () => {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const { hasCompleted, isLoading: prefsLoading } = useHasCompletedOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // If user has already completed onboarding, redirect to dashboard
    if (!prefsLoading && hasCompleted) {
      navigate("/dashboard");
    }
  }, [hasCompleted, prefsLoading, navigate]);

  const handleComplete = (personaChoice?: string) => {
    const need = resolveNeedFromPersona(personaChoice);
    void trackGrowthEvent({
      eventName: "onboarding_completed",
      journey: need?.role || "participant",
      stage: "activated",
      entityType: "onboarding",
      entityId: need?.id || "preferences",
      idempotencyKey: `growth:onboarding:${getAnonymousId()}`,
    });

    const roleId = need?.role || "participant";
    sessionStorage.setItem("promorang_role_pilot_active", "true");
    sessionStorage.setItem("promorang_role_pilot_role", roleId);
    sessionStorage.setItem("promorang_role_pilot_step", "0");

    navigate(need ? landingPathForNeed(need) : "/?firstNight=true");
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
