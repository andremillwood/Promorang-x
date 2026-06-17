import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DemoExperienceBanner } from "@/components/demo/DemoExperienceBanner";
import { Suspense, lazy } from "react";

const ParticipantDashboardV2 = lazy(() => import("@/components/dashboards/ParticipantDashboardV2"));
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
    <>
      <DemoExperienceBanner role={resolvedRole} />
      <Suspense fallback={dashboardFallback}>
        <ResolvedDashboard />
      </Suspense>
    </>
  );
};

export default Dashboard;
