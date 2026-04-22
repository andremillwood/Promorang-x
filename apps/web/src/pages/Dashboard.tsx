import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ParticipantDashboardV2 from "@/components/dashboards/ParticipantDashboardV2";
import CreatorDashboardV2 from "@/components/dashboards/CreatorDashboardV2";
import HostDashboardV2 from "@/components/dashboards/HostDashboardV2";
import BrandDashboardV2 from "@/components/dashboards/BrandDashboardV2";
import MerchantDashboardV2 from "@/components/dashboards/MerchantDashboardV2";
import AgencyDashboard from "@/components/dashboards/AgencyDashboard";

const Dashboard = () => {
  const { user, activeRole, loading, organizations, activeOrgId } = useAuth();
  const currentOrg = organizations.find((org) => org.id === activeOrgId);
  const isAgencyWorkspace = currentOrg?.type === "agency";
  
  // Enforce V2 dashboard universally
  const useV2Dashboard = true;

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

  switch (activeRole) {
    case "creator":
      return <CreatorDashboardV2 />;
    case "host":
      return <HostDashboardV2 />;
    case "agency":
      return <AgencyDashboard />;
    case "brand":
      if (isAgencyWorkspace) return <AgencyDashboard />;
      return <BrandDashboardV2 />;
    case "merchant":
      return <MerchantDashboardV2 />;
    case "participant":
      return <ParticipantDashboardV2 />;
    default:
      return <ParticipantDashboardV2 />;
  }
};

export default Dashboard;
