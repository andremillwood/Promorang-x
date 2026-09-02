import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getDemoLandingPath, readDemoSession } from "@/lib/demo-session";
import { flushMarketingIntent } from "@/lib/marketing-attribution";
import { hasCompletedOnboarding, postLoginPath } from "@promorang/shared";

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

      const { data: onboardingCheck } = await supabase
        .from('user_preferences')
        .select('preferred_categories')
        .eq('user_id', user.id)
        .maybeSingle();

      const finishedOnboarding = hasCompletedOnboarding(onboardingCheck);

      // Check for profile completeness
      const profileComplete = !!(
        profile?.display_name && 
        (profile?.avatar_url || profile?.user_metadata?.avatar_url)
      );

      // Check for first actions based on role
      const { count: momentCount } = await supabase
        .from('moments')
        .select('id', { count: 'exact', head: true })
        .eq('host_id', user.id);

      const { count: joinedCount } = await supabase
        .from('moment_participants')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

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

      navigate(
        postLoginPath({
          role: activeRole,
          finishedOnboarding,
          hostedMomentCount: momentCount || 0,
          joinedMomentCount: joinedCount || 0,
          campaignCount: campaignCount || 0,
          venueCount: venueCount || 0,
          offerCount: offerCount || 0,
          creatorContentCount: creatorContentCount || 0,
          profileComplete,
        }),
        { replace: true },
      );
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
