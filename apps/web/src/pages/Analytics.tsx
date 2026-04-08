import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { MerchantAnalyticsDashboard } from "@/components/analytics/MerchantAnalyticsDashboard";
import { BrandAnalyticsDashboard } from "@/components/analytics/BrandAnalyticsDashboard";
import { HostAnalyticsDashboard } from "@/components/analytics/HostAnalyticsDashboard";
import { AlertCircle } from "lucide-react";

/**
 * Main Analytics page - routes to role-specific dashboards
 */
const Analytics = () => {
  const { user, roles } = useAuth();
  const primaryRole = roles[0] || "participant";

  if (!user) {
    return (
      <DashboardLayout currentRole={primaryRole}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please sign in to view analytics</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentRole={primaryRole}>
      <div className="max-w-7xl mx-auto">
        {primaryRole === "merchant" && <MerchantAnalyticsDashboard userId={user.id} />}
        {primaryRole === "brand" && <BrandAnalyticsDashboard userId={user.id} />}
        {(primaryRole === "host" || primaryRole === "participant") && <HostAnalyticsDashboard userId={user.id} />}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
