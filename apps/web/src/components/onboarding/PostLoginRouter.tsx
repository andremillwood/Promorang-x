import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Post-Login Router
 * Intelligently routes users based on role + completion state
 */
export function PostLoginRouter() {
  const { user, activeRole, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading || !user) return;

    const determineLandingPage = async () => {
      // Check if first-time user (no completed onboarding)
      const { data: onboardingCheck } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      const hasCompletedOnboarding = onboardingCheck?.onboarding_completed || false;

      // Check for profile completeness
      const profileComplete = !!(
        profile?.display_name && 
        (profile?.avatar_url || profile?.user_metadata?.avatar_url)
      );

      // Check for first actions based on role
      const { data: momentCount } = await supabase
        .from('moments')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', user.id);

      const { data: joinedCount } = await supabase
        .from('moment_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const hasCreatedContent = (momentCount || 0) > 0;
      const hasJoinedContent = (joinedCount || 0) > 0;

      // Role-specific routing
      switch (activeRole) {
        case "brand":
          if (!hasCompletedOnboarding) {
            navigate("/onboarding/brand", { replace: true });
          } else if (!hasCreatedContent) {
            navigate("/dashboard/brand/campaigns/create", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          break;

        case "merchant":
          if (!hasCompletedOnboarding) {
            navigate("/onboarding/merchant", { replace: true });
          } else if (!hasCreatedContent) {
            navigate("/dashboard/venues/add?firstTime=true", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          break;

        case "host":
          if (!hasCompletedOnboarding) {
            navigate("/onboarding", { replace: true });
          } else if (!hasCreatedContent) {
            navigate("/create-moment?firstTime=true", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          break;

        case "creator":
          if (!hasCompletedOnboarding) {
            navigate("/onboarding", { replace: true });
          } else if (!hasCreatedContent) {
            navigate("/watch-unlock", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          break;

        case "participant":
        default:
          if (!hasCompletedOnboarding) {
            navigate("/onboarding", { replace: true });
          } else if (!hasJoinedContent) {
            navigate("/discover?firstTime=true", { replace: true });
          } else if (!profileComplete) {
            navigate("/dashboard/settings?firstTime=true", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          break;
      }

      setChecking(false);
    };

    determineLandingPage();
  }, [user, activeRole, profile, loading, navigate]);

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
