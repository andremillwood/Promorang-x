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
  ContactRound,
  ClipboardCheck,
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
import { AdminLeadsCRM } from "@/components/admin/AdminLeadsCRM";
import { AdminPresentsPanel } from "@/components/admin/AdminPresentsPanel";
import { AdminEnrichmentReviewTab } from "@/components/admin/AdminEnrichmentReviewTab";
import { AdminEventVerificationReviewTab } from "@/components/admin/AdminEventVerificationReviewTab";
import { PromoPilotCompiler } from "@/components/campaigns/PromoPilotCompiler";
import { useI18n } from "@/i18n/I18nContext";

const ADMIN_TABS = new Set([
  "command",
  "overview",
  "growth",
  "leads",
  "proof-builder",
  "pioneer",
  "operations",
  "enrichment-review",
  "event-review",
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
      { value: "leads", label: "Leads & CRM", icon: ContactRound },
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
      { value: "enrichment-review", label: "Scout Proof Review", icon: ClipboardCheck },
      { value: "event-review", label: "Event Evidence", icon: Calendar },
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
      { value: "proof-builder", label: "Proof Builder", icon: CheckCircle },
      { value: "config", label: "Config", icon: Settings },
    ],
  },
];

const AdminDashboard = () => {
  const { t, formatNumber } = useI18n();
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
      <div className="px-4 pb-12 pt-4 sm:pt-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5 shadow-soft">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-sm text-muted-foreground font-medium sm:text-base">
                Platform management and moderation tools
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleTabChange("compiler")}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/80 bg-card px-4 text-sm font-semibold text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-soft"
              >
                <Zap className="h-4 w-4 text-primary" />
                {t("adminDash.compiler")}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("claimable-pages")}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Sparkles className="h-4 w-4" />
                {t("adminDash.createOwner")}
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
            {statsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))
            ) : (
              [
                { label: t("adminDash.totalUsers"), value: stats?.totalUsers || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
                { label: t("adminDash.totalMoments"), value: stats?.totalMoments || 0, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: t("adminDash.participations"), value: stats?.totalParticipations || 0, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: t("adminDash.rewardsIssued"), value: stats?.totalRewards || 0, icon: Gift, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: t("adminDash.activations"), value: stats?.totalCampaigns || 0, icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
              ].map((stat, index) => (
                <div
                  key={index}
                  role="region"
                  aria-label={`${stat.label}: ${formatNumber(stat.value)}`}
                  className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-soft transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground sm:text-sm">{stat.label}</span>
                    <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-foreground sm:text-3xl">{formatNumber(stat.value)}</p>
                </div>
              ))
            )}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {statsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))
            ) : (
              [
                { label: t("adminDash.activeWeek"), value: stats?.activeUsersThisWeek || 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: t("adminDash.totalVenues"), value: stats?.totalVenues || 0, icon: MapPin, color: "text-orange-500", bg: "bg-orange-500/10" },
                { label: t("adminDash.userGrowth"), value: `${stats?.userGrowth || 0}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
              ].map((stat, index) => (
                <div
                  key={index}
                  role="region"
                  aria-label={`${stat.label}: ${stat.value}`}
                  className="rounded-xl border border-border/80 bg-card/60 p-4 shadow-soft transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-muted-foreground sm:text-sm">{stat.label}</p>
                    <div className={cn("h-6 w-6 rounded-md flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
                    </div>
                  </div>
                  <p className="text-lg font-black text-foreground sm:text-2xl">{stat.value}</p>
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
            <TabsContent value="leads">
              <AdminLeadsCRM />
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

            <TabsContent value="enrichment-review">
              <AdminEnrichmentReviewTab />
            </TabsContent>
            <TabsContent value="event-review">
              <AdminEventVerificationReviewTab />
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
              <AdminPresentsPanel />
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
