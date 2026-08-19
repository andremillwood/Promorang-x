import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHasCompletedOnboarding } from "@/hooks/useUserPreferences";
import OnboardingSurvey from "@/components/onboarding/OnboardingSurvey";
import { getAnonymousId, trackGrowthEvent } from "@/lib/marketing-attribution";

const Onboarding = () => {
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
    void trackGrowthEvent({
      eventName: "onboarding_completed", journey: "participant", stage: "activated",
      entityType: "onboarding", entityId: "preferences",
      idempotencyKey: `growth:onboarding:${getAnonymousId()}`,
    });
    
    // Automatically trigger role pilot HUD co-pilot for the user's chosen persona
    const roleMap: Record<string, string> = {
      explorer: 'explorer',
      creator: 'creator',
      mayor: 'host',
      merchant: 'merchant',
      brand: 'brand',
      agency: 'brand'
    };
    const roleId = (personaChoice && roleMap[personaChoice]) || 'explorer';
    sessionStorage.setItem('promorang_role_pilot_active', 'true');
    sessionStorage.setItem('promorang_role_pilot_role', roleId);
    sessionStorage.setItem('promorang_role_pilot_step', '0');
    
    // Redirect directly to first step of the guided tour
    navigate(`/discover?pilot=${roleId}&step=1`);
  };

  if (authLoading || prefsLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <OnboardingSurvey onComplete={handleComplete} />;
};

export default Onboarding;
