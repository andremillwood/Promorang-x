import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, usePlatformStats } from "@/hooks/useAdmin";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
  Zap,
  LifeBuoy,
  Activity,
  Megaphone,
  KeyRound,
  Target,
  Store,
  ShoppingBag,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminMomentsTab } from "@/components/admin/AdminMomentsTab";
import { AdminAnalyticsTab } from "@/components/admin/AdminAnalyticsTab";
import { AdminHostApplicationsTab } from "@/components/admin/AdminHostApplicationsTab";
import { AdminPayoutsTab } from "@/components/admin/AdminPayoutsTab";
import { AdminCreateMomentTab } from "@/components/admin/AdminCreateMomentTab";
import { AdminEconomyTab } from "@/components/admin/AdminEconomyTab";
import { AdminModerationTab } from "@/components/admin/AdminModerationTab";
import { AdminConfigTab } from "@/components/admin/AdminConfigTab";
import { AdminSupportTab } from "@/components/admin/AdminSupportTab";
import { AdminOperationsTab } from "@/components/admin/AdminOperationsTab";
import { AdminPromoPushTab } from "@/components/admin/AdminPromoPushTab";
import { AdminAccessRulesTab } from "@/components/admin/AdminAccessRulesTab";
import { AdminProofBuilderTab } from "@/components/admin/AdminProofBuilderTab";
import { AdminPioneerReviewTab } from "@/components/admin/AdminPioneerReviewTab";
import { AdminCommandCenter } from "@/components/admin/AdminCommandCenter";
import { AdminAuditTab } from "@/components/admin/AdminAuditTab";
import { AdminCatalogTab } from "@/components/admin/AdminCatalogTab";
import { AdminCommerceTab } from "@/components/admin/AdminCommerceTab";
import { AdminGrowthTab } from "@/components/admin/AdminGrowthTab";
import { AdminClaimablePagesTab } from "@/components/admin/AdminClaimablePagesTab";
import { PromoPilotCompiler } from "@/components/campaigns/PromoPilotCompiler";

const ADMIN_TABS = new Set([
  "command",
  "overview",
  "growth",
  "proof-builder",
  "pioneer",
  "operations",
  "promopush",
  "catalog",
  "commerce",
  "users",
  "moments",
  "applications",
  "payouts",
  "economy",
  "access",
  "audit",
  "moderation",
  "support",
  "config",
  "compiler",
  "create-moment",
  "claimable-pages",
]);

type AdminNavItem = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const ADMIN_NAV_GROUPS: Array<{ label: string; items: AdminNavItem[] }> = [
  {
    label: "Overview",
    items: [
      { value: "command", label: "Command Center", icon: Shield },
      { value: "overview", label: "Analytics", icon: BarChart3 },
      { value: "growth", label: "Growth", icon: TrendingUp },
    ],
  },
  {
    label: "Operations",
    items: [
      { value: "moments", label: "Moments", icon: Calendar },
      { value: "claimable-pages", label: "Create for Owners", icon: UserPlus },
      { value: "users", label: "Users", icon: Users },
      { value: "applications", label: "Host Applications", icon: Sparkles },
      { value: "pioneer", label: "Pioneer Review", icon: Target },
      { value: "operations", label: "Platform Operations", icon: Activity },
    ],
  },
  {
    label: "Trust & finance",
    items: [
      { value: "moderation", label: "Moderation", icon: Scale },
      { value: "payouts", label: "Payouts", icon: DollarSign },
      { value: "economy", label: "Economy", icon: Coins },
      { value: "access", label: "Access", icon: KeyRound },
      { value: "audit", label: "Audit", icon: Shield },
    ],
  },
  {
    label: "Platform",
    items: [
      { value: "promopush", label: "PromoPush", icon: Megaphone },
      { value: "catalog", label: "Catalog", icon: Store },
      { value: "commerce", label: "Commerce", icon: ShoppingBag },
      { value: "support", label: "Support", icon: LifeBuoy },
    ],
  },
  {
    label: "System",
    items: [
      { value: "proof-builder", label: "Contribution Rules", icon: Target },
      { value: "config", label: "Configuration", icon: Settings },
    ],
  },
];

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = requestedTab && ADMIN_TABS.has(requestedTab) ? requestedTab : "command";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    if (requestedTab && ADMIN_TABS.has(requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab, activeTab]);

  // Redirect non-admins
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (!authLoading && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pb-12 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground">
                Platform management and moderation tools
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleTabChange("compiler")}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Zap className="h-4 w-4 text-primary" />
                Campaign Compiler
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("claimable-pages")}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Sparkles className="h-4 w-4" />
                Create for Owner
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
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
                { label: "Activations", value: stats?.totalCampaigns || 0, icon: Building2, color: "text-purple-500" },
              ].map((stat, index) => (
                <div key={index} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <p className="text-xl font-bold text-foreground sm:text-2xl">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                </div>
              ))
            )}
          </div>

          {/* Secondary Stats */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))
            ) : (
              [
                { label: "Active This Week", value: stats?.activeUsersThisWeek || 0, icon: Users, color: "text-emerald-500" },
                { label: "Total Venues", value: stats?.totalVenues || 0, icon: MapPin, color: "text-orange-500" },
                { label: "User Growth", value: `${stats?.userGrowth || 0}%`, icon: TrendingUp, color: "text-primary" },
              ].map((stat, index) => (
                <div key={index} className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                  </div>
                  <p className="text-lg font-bold text-foreground sm:text-xl">{stat.value}</p>
                </div>
              ))
            )}
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="relative mb-6 lg:hidden">
              <label htmlFor="admin-section" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Admin section
              </label>
              <select
                id="admin-section"
                value={activeTab}
                onChange={(event) => handleTabChange(event.target.value)}
                className="h-12 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {ADMIN_NAV_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.items.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </optgroup>
                ))}
                <optgroup label="Create">
                  <option value="compiler">Campaign Compiler</option>
                  <option value="create-moment">Create Moment</option>
                </optgroup>
              </select>
              <ChevronDown className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 text-muted-foreground" />
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside aria-label="Admin navigation" className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-sm lg:block">
                {ADMIN_NAV_GROUPS.map((group, groupIndex) => (
                  <div key={group.label} className={groupIndex === 0 ? "" : "mt-5"}>
                    <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => handleTabChange(item.value)}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="font-medium">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </aside>

              <main className="min-w-0">

            <TabsContent value="command">
              <AdminCommandCenter />
            </TabsContent>

            <TabsContent value="overview">
              <AdminAnalyticsTab />
            </TabsContent>

            <TabsContent value="growth">
              <AdminGrowthTab />
            </TabsContent>

            <TabsContent value="proof-builder">
              <AdminProofBuilderTab />
            </TabsContent>
            <TabsContent value="pioneer">
              <AdminPioneerReviewTab />
            </TabsContent>

            <TabsContent value="operations">
              <AdminOperationsTab />
            </TabsContent>

            <TabsContent value="promopush">
              <AdminPromoPushTab />
            </TabsContent>

            <TabsContent value="catalog">
              <AdminCatalogTab />
            </TabsContent>

            <TabsContent value="commerce">
              <AdminCommerceTab />
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

            <TabsContent value="access">
              <AdminAccessRulesTab />
            </TabsContent>

            <TabsContent value="audit">
              <AdminAuditTab />
            </TabsContent>

            <TabsContent value="moderation">
              <AdminModerationTab />
            </TabsContent>

            <TabsContent value="support">
              <AdminSupportTab />
            </TabsContent>

            <TabsContent value="config">
              <AdminConfigTab />
            </TabsContent>

            <TabsContent value="compiler">
              <PromoPilotCompiler adminMode={true} />
            </TabsContent>

            <TabsContent value="create-moment">
              <AdminCreateMomentTab />
            </TabsContent>
            <TabsContent value="claimable-pages">
              <AdminClaimablePagesTab />
            </TabsContent>
              </main>
            </div>
          </Tabs>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
