import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, usePlatformStats } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  CheckCircle,
  Gift,
  Building2,
  MapPin,
  TrendingUp,
  Shield,
  BarChart3,
  Sparkles,
  DollarSign,
  Coins,
  Scale,
  Settings,
} from "lucide-react";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminMomentsTab } from "@/components/admin/AdminMomentsTab";
import { AdminAnalyticsTab } from "@/components/admin/AdminAnalyticsTab";
import { AdminHostApplicationsTab } from "@/components/admin/AdminHostApplicationsTab";
import { AdminPayoutsTab } from "@/components/admin/AdminPayoutsTab";
import { AdminCreateMomentTab } from "@/components/admin/AdminCreateMomentTab";
import { AdminEconomyTab } from "@/components/admin/AdminEconomyTab";
import { AdminModerationTab } from "@/components/admin/AdminModerationTab";
import { AdminConfigTab } from "@/components/admin/AdminConfigTab";
import { AdminCampaignCompiler } from "@/components/admin/AdminCampaignCompiler";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect non-admins
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (!authLoading && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Platform management and moderation tools
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {statsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))
            ) : (
              [
                { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-primary" },
                { label: "Total Moments", value: stats?.totalMoments || 0, icon: Calendar, color: "text-blue-500" },
                { label: "Participations", value: stats?.totalParticipations || 0, icon: CheckCircle, color: "text-emerald-500" },
                { label: "Rewards Issued", value: stats?.totalRewards || 0, icon: Gift, color: "text-accent" },
                { label: "Campaigns", value: stats?.totalCampaigns || 0, icon: Building2, color: "text-purple-500" },
              ].map((stat, index) => (
                <div key={index} className="bg-card rounded-xl p-5 border border-border">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))
            )}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))
            ) : (
              [
                { label: "Active This Week", value: stats?.activeUsersThisWeek || 0, icon: Users, color: "text-emerald-500" },
                { label: "Moments This Week", value: stats?.momentsThisWeek || 0, icon: Calendar, color: "text-blue-500" },
                { label: "Total Venues", value: stats?.totalVenues || 0, icon: MapPin, color: "text-orange-500" },
                { label: "User Growth", value: `${stats?.userGrowth || 0}%`, icon: TrendingUp, color: "text-primary" },
              ].map((stat, index) => (
                <div key={index} className="bg-secondary/30 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="moments" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Moments
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Host Apps
              </TabsTrigger>
              <TabsTrigger value="payouts" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Payouts
              </TabsTrigger>
              <TabsTrigger value="economy" className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Economy
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Moderation
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Config
              </TabsTrigger>
              <TabsTrigger value="compiler" className="flex items-center gap-2 text-primary font-bold">
                <Zap className="w-4 h-4 fill-primary" />
                Compiler
              </TabsTrigger>
              <TabsTrigger value="create-moment" className="flex items-center gap-2 text-primary font-bold">
                <Sparkles className="w-4 h-4" />
                Create Moment
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <AdminAnalyticsTab />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersTab />
            </TabsContent>

            <TabsContent value="moments">
              <AdminMomentsTab />
            </TabsContent>

            <TabsContent value="applications">
              <AdminHostApplicationsTab />
            </TabsContent>

            <TabsContent value="payouts">
              <AdminPayoutsTab />
            </TabsContent>

            <TabsContent value="economy">
              <AdminEconomyTab />
            </TabsContent>

            <TabsContent value="moderation">
              <AdminModerationTab />
            </TabsContent>

            <TabsContent value="config">
              <AdminConfigTab />
            </TabsContent>

            <TabsContent value="compiler">
              <AdminCampaignCompiler />
            </TabsContent>

            <TabsContent value="create-moment">
              <AdminCreateMomentTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
