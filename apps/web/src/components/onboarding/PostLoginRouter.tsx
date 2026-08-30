import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPersonSignInPath, isOperatorRole } from "@promorang/shared";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getDemoLandingPath, readDemoSession } from "@/lib/demo-session";
import { flushMarketingIntent } from "@/lib/marketing-attribution";

/**
 * Post-Login Router
 * Intelligently routes users based on role + completion state
 */
export function PostLoginRouter() {
  const { user, activeRole, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;

    const determineLandingPage = async () => {
      await flushMarketingIntent().catch(() => undefined);
      const requestedNext = sessionStorage.getItem("promorang_post_auth_next");
      if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
        sessionStorage.removeItem("promorang_post_auth_next");
        navigate(requestedNext, { replace: true });
        return;
      }
      const demoSession = readDemoSession();
      if (demoSession) {
        navigate(getDemoLandingPath(demoSession.role), { replace: true });
        return;
      }

      // Check if first-time user (no completed onboarding)
      const { data: onboardingCheck } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();

      const hasCompletedOnboarding = onboardingCheck?.onboarding_completed || false;

      // Check for first actions based on role
      const { count: momentCount } = await supabase
        .from('moments')
        .select('id', { count: 'exact', head: true })
        .eq('host_id', user.id);

      const { count: campaignCount } = await supabase
        .from('campaigns')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', user.id);

      const { count: venueCount } = await supabase
        .from('venues')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      const { count: offerCount } = await supabase
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .eq('owner_user_id', user.id);

      // Content ownership is keyed by the authenticated user. Avoid building a
      // PostgREST expression from display names or email addresses: punctuation
      // in those values can make the entire request invalid.
      const { count: creatorContentCount } = await supabase
        .from('content_pieces')
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', user.id);

      const hasCreatedContent = (momentCount || 0) > 0;
      const hasCreatedCampaign = (campaignCount || 0) > 0;
      const hasRegisteredVenue = (venueCount || 0) > 0;
      const hasCreatedFundedActivation = (offerCount || 0) > 0;
      const hasPublishedCreatorContent = (creatorContentCount || 0) > 0;

      // Role-specific routing
      switch (activeRole) {
        case "admin":
          navigate("/admin?tab=command", { replace: true });
          break;

        case "brand":
          if (!hasCompletedOnboarding) {
            navigate("/onboarding/brand", { replace: true });
          } else if (!hasCreatedFundedActivation) {
            navigate("/offers?template=promoshare-funded-cycle", { replace: true });
          } else if (!hasCreatedCampaign) {
            navigate("/create/campaign", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          break;

        case "merchant":
          if (!hasCompletedOnboarding) {
            navigate("/onboarding", { replace: true });
          } else if (!hasRegisteredVenue) {
            navigate("/dashboard/venues/add?firstTime=true", { replace: true });
          } else if (!hasCreatedFundedActivation) {
            navigate("/offers?template=slow-hour-checkin", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          break;

        case "host":
          if (!hasCompletedOnboarding) {
            navigate("/onboarding", { replace: true });
          } else if (!hasCreatedFundedActivation) {
            navigate("/offers?template=slow-hour-checkin", { replace: true });
          } else if (!hasCreatedContent) {
            navigate("/create/moment?firstTime=true", { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
          break;

        case "creator":
          if (!hasCompletedOnboarding) {
            navigate("/onboarding", { replace: true });
          } else if (!hasCreatedFundedActivation) {
            navigate("/offers?template=content-mission", { replace: true });
          } else if (!hasPublishedCreatorContent) {
            navigate("/dashboard?tab=publish", { replace: true });
          } else {
            navigate("/dashboard?tab=missions", { replace: true });
          }
          break;

        case "participant":
        default:
          if (isOperatorRole(activeRole)) {
            navigate("/today", { replace: true });
            break;
          }
          navigate(getPersonSignInPath({
            role: activeRole || "participant",
            hasCompletedOnboarding,
          }), { replace: true });
          break;
      }
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
