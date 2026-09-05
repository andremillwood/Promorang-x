import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getDemoLandingPath, readDemoSession } from "@/lib/demo-session";
import { flushMarketingIntent } from "@/lib/marketing-attribution";

/**
 * Post-Login Router
 * Intelligently routes users based on role + completion state
 */
export function PostLoginRouter() {
  const { user, activeRole, loading } = useAuth();
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

      if (activeRole === "admin") {
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

      if (!error && !data?.onboarding_completed) {
        navigate(activeRole === "brand" ? "/onboarding/brand" : "/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    };

    determineLandingPage();
  }, [user, activeRole, loading, navigate]);

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
