import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ResumeMomentumBanner } from "@/components/intent/ResumeMomentumBanner";
import { useUserIntentContinuity } from "@/hooks/useUserIntentContinuity";
import { MobileNotificationBridgeBanner } from "@/components/notifications/MobileNotificationBridgeBanner";

const ParticipantDashboardV2 = lazy(() => import("@/components/dashboards/CulturalCommandHome"));
const CreatorDashboardV2 = lazy(() => import("@/components/dashboards/CreatorDashboardV2"));
const HostDashboardV2 = lazy(() => import("@/components/dashboards/HostDashboardV2"));
const BrandDashboardV2 = lazy(() => import("@/components/dashboards/BrandDashboardV2"));
const MerchantDashboardV2 = lazy(() => import("@/components/dashboards/MerchantDashboardV2"));
const AgencyDashboard = lazy(() => import("@/components/dashboards/AgencyDashboard"));

const dashboardFallback = (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const dashboardByRole = {
  participant: ParticipantDashboardV2,
  creator: CreatorDashboardV2,
  host: HostDashboardV2,
  brand: BrandDashboardV2,
  merchant: MerchantDashboardV2,
  agency: AgencyDashboard,
} as const;

const Dashboard = () => {
  const { user, activeRole, loading } = useAuth();
  const { activeDraft, dismissDraft } = useUserIntentContinuity();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const resolvedRole = activeRole || "participant";
  const ResolvedDashboard = dashboardByRole[resolvedRole] || ParticipantDashboardV2;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <MobileNotificationBridgeBanner />
      {activeDraft && <ResumeMomentumBanner draft={activeDraft} onDismiss={dismissDraft} />}
      <Suspense fallback={dashboardFallback}>
        <ResolvedDashboard />
      </Suspense>
    </div>
  );
};

export default Dashboard;
