import { useAuth } from "@/contexts/AuthContext";
import { MerchantAnalyticsDashboard } from "@/components/analytics/MerchantAnalyticsDashboard";
import { BrandAnalyticsDashboard } from "@/components/analytics/BrandAnalyticsDashboard";
import { HostAnalyticsDashboard } from "@/components/analytics/HostAnalyticsDashboard";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Main Analytics page - routes to role-specific dashboards
 */
const Analytics = () => {
  const { user, roles } = useAuth();
  const primaryRole = roles[0] || "participant";

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please sign in to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {(primaryRole === "host" || primaryRole === "participant") && (
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analytics readiness</AlertTitle>
          <AlertDescription>
            Host and participant analytics are still being aligned to production data contracts. This view currently favors a safe empty state over unreliable metrics when the backing dataset is unavailable.
          </AlertDescription>
        </Alert>
      )}
      {primaryRole === "merchant" && <MerchantAnalyticsDashboard userId={user.id} />}
      {primaryRole === "brand" && <BrandAnalyticsDashboard userId={user.id} />}
      {(primaryRole === "host" || primaryRole === "participant") && <HostAnalyticsDashboard userId={user.id} />}
    </div>
  );
};

export default Analytics;
