import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHasCompletedOnboarding } from "@/hooks/useUserPreferences";
import OnboardingSurvey from "@/components/onboarding/OnboardingSurvey";

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

  const handleComplete = () => {
    navigate("/dashboard");
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
