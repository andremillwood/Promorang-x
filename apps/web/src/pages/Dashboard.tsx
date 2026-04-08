import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ParticipantDashboard from "@/components/dashboards/ParticipantDashboard";
import HostDashboard from "@/components/dashboards/HostDashboard";
import BrandDashboard from "@/components/dashboards/BrandDashboard";
import MerchantDashboard from "@/components/dashboards/MerchantDashboard";

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

  switch (activeRole) {
    case "host":
      return <HostDashboard />;
    case "brand":
      return <BrandDashboard />;
    case "merchant":
      return <MerchantDashboard />;
    case "participant":
      return <ParticipantDashboard />;
    default:
      return <ParticipantDashboard />;
  }
};

export default Dashboard;
