import { useEffect, useState, useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, usePlatformStats } from "@/hooks/useAdmin";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
  Search,
  ShieldCheck,
  Radio,
  FileCheck,
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
import { AdminDiscoveryAcquisitionTab } from "@/components/admin/AdminDiscoveryAcquisitionTab";
import { PromoPilotCompiler } from "@/components/campaigns/PromoPilotCompiler";
import { AdminVerificationHub } from "@/components/admin/AdminVerificationHub";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const ADMIN_TABS = new Set([
  "command",
  "verification-hub",
  "overview",
  "growth",
  "discovery",
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
  labelKey: TranslationKey;
  icon: LucideIcon;
  badgeKey?: TranslationKey;
  badgeCount?: number;
};

type AdminNavGroup = {
  labelKey: TranslationKey;
  items: AdminNavItem[];
};

const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    labelKey: "adminDesk.gTelemetry",
    items: [
      { value: "command", labelKey: "adminDesk.iCommand", icon: Shield, badgeKey: "adminDesk.badgeLive" },
      { value: "verification-hub", labelKey: "adminDesk.iVerify", icon: ShieldCheck, badgeKey: "adminDesk.badgeNew", badgeCount: 3 },
      { value: "overview", labelKey: "adminDesk.iOverview", icon: BarChart3 },
      { value: "growth", labelKey: "adminDesk.iGrowth", icon: TrendingUp },
      { value: "discovery", labelKey: "adminDesk.iDiscovery", icon: Target },
      { value: "leads", labelKey: "adminDesk.iLeads", icon: ContactRound },
    ],
  },
  {
    labelKey: "adminDesk.gOps",
    items: [
      { value: "moments", labelKey: "adminDesk.iMoments", icon: Calendar },
      { value: "claimable-pages", labelKey: "adminDesk.iOwners", icon: UserPlus },
      { value: "users", labelKey: "adminDesk.iUsers", icon: Users },
      { value: "applications", labelKey: "adminDesk.iApps", icon: Sparkles },
      { value: "pioneer", labelKey: "adminDesk.iPioneer", icon: Target },
      { value: "enrichment-review", labelKey: "adminDesk.iScout", icon: ClipboardCheck },
      { value: "event-review", labelKey: "adminDesk.iEvent", icon: Calendar },
      { value: "operations", labelKey: "adminDesk.iOps", icon: Activity },
    ],
  },
  {
    labelKey: "adminDesk.gTrust",
    items: [
      { value: "moderation", labelKey: "adminDesk.iMod", icon: Scale },
      { value: "payouts", labelKey: "adminDesk.iPayouts", icon: DollarSign },
      { value: "economy", labelKey: "adminDesk.iEconomy", icon: Coins },
      { value: "access", labelKey: "adminDesk.iAccess", icon: KeyRound },
      { value: "audit", labelKey: "adminDesk.iAudit", icon: Shield },
    ],
  },
  {
    labelKey: "adminDesk.gServices",
    items: [
      { value: "promopush", labelKey: "adminDesk.iPromo", icon: Megaphone },
      { value: "catalog", labelKey: "adminDesk.iCatalog", icon: Store },
      { value: "commerce", labelKey: "adminDesk.iCommerce", icon: ShoppingBag },
      { value: "support", labelKey: "adminDesk.iSupport", icon: LifeBuoy },
    ],
  },
  {
    labelKey: "adminDesk.gSystem",
    items: [
      { value: "compiler", labelKey: "adminDesk.iCompiler", icon: Radio },
      { value: "proof-builder", labelKey: "adminDesk.iProof", icon: CheckCircle },
      { value: "config", labelKey: "adminDesk.iConfig", icon: Settings },
    ],
  },
];

const AdminDashboard = () => {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = requestedTab && ADMIN_TABS.has(requestedTab) ? requestedTab : "command";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [navSearch, setNavSearch] = useState("");

  useEffect(() => {
    if (requestedTab && ADMIN_TABS.has(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", value);
      return next;
    });
  };

  const allNavItems = useMemo(() => {
    return ADMIN_NAV_GROUPS.flatMap((g) => g.items);
  }, []);

  const activeItem = allNavItems.find((item) => item.value === activeTab) || allNavItems[0];

  // Find which group contains the activeTab
  const currentGroupIndex = ADMIN_NAV_GROUPS.findIndex((g) =>
    g.items.some((item) => item.value === activeTab)
  );
  const selectedGroup = currentGroupIndex !== -1 ? ADMIN_NAV_GROUPS[currentGroupIndex] : ADMIN_NAV_GROUPS[0];

  if (authLoading || isAdmin === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full space-y-6 pb-20 text-white animate-in fade-in-50 duration-300">
      {/* 1. Master Admin Command Header & Category Strip */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/20 via-[#0e1218] to-[#0a0d12] backdrop-blur-xl p-5 shadow-2xl space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/20 shrink-0">
              <Shield className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">{t("adminDesk.title")}</h1>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold tracking-wide uppercase">
                  {t("adminDesk.root", { label: t(activeItem.labelKey) })}
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">
                {t("adminDesk.subtitle")}
              </p>
            </div>
          </div>

          {/* Header Quick Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="relative w-48 hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <Input
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder={t("adminDesk.search")}
                className="h-8 pl-8 rounded-lg border-white/10 bg-white/5 text-white text-xs placeholder:text-white/40 focus:border-cyan-500/50"
              />
            </div>

            <Button
              size="sm"
              onClick={() => handleTabChange("verification-hub")}
              className="h-8 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-500 text-black font-extrabold text-xs shadow-md shadow-cyan-400/20"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {t("adminDesk.proofHub")}
            </Button>

            <Button
              size="sm"
              onClick={() => handleTabChange("promopush")}
              className="h-8 px-3 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
            >
              <Megaphone className="h-3 w-3 mr-1 text-primary" />
              {t("adminDesk.promoPush")}
            </Button>
          </div>
        </div>

        {/* Category Navigation Pills (Groups) */}
        <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {ADMIN_NAV_GROUPS.map((group) => {
            const isGroupActive = group.items.some((item) => item.value === activeTab);

            return (
              <button
                key={group.labelKey}
                onClick={() => handleTabChange(group.items[0].value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isGroupActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {t(group.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Sub-item Pills for Selected Category */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-black/30 p-1.5 rounded-xl border border-white/5">
          {selectedGroup.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;

            return (
              <button
                key={item.value}
                onClick={() => handleTabChange(item.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  isActive
                    ? "bg-white/15 text-white shadow-sm border border-white/20"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : "text-white/40"}`} />
                <span>{t(item.labelKey)}</span>
                {item.badgeKey && (
                  <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[9px] font-mono font-bold">
                    {item.badgeCount != null ? t(item.badgeKey, { count: item.badgeCount }) : t(item.badgeKey)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Results Dropdown (if user searches) */}
        {navSearch.trim().length > 0 && (
          <div className="p-2 rounded-xl bg-[#141822] border border-cyan-500/30 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {allNavItems
              .filter((item) => t(item.labelKey).toLowerCase().includes(navSearch.toLowerCase()))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    onClick={() => {
                      handleTabChange(item.value);
                      setNavSearch("");
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg text-left text-xs text-white/80 hover:bg-cyan-500/10 hover:text-cyan-300 transition"
                  >
                    <Icon className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{t(item.labelKey)}</span>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* 2. Admin Main Viewport (Full 12-col Canvas) */}
      <div className="w-full min-w-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsContent value="command" className="mt-0">
            <AdminCommandCenter />
          </TabsContent>

          <TabsContent value="verification-hub" className="mt-0">
            <AdminVerificationHub />
            </TabsContent>

            <TabsContent value="overview" className="mt-0">
              <AdminAnalyticsTab />
            </TabsContent>

            <TabsContent value="growth" className="mt-0">
              <AdminGrowthTab />
            </TabsContent>

            <TabsContent value="discovery" className="mt-0">
              <AdminDiscoveryAcquisitionTab />
            </TabsContent>

            <TabsContent value="leads" className="mt-0">
              <AdminLeadsCRM />
            </TabsContent>

            <TabsContent value="moments" className="mt-0">
              <AdminMomentsTab />
            </TabsContent>

            <TabsContent value="claimable-pages" className="mt-0">
              <AdminClaimablePagesTab />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <AdminUsersTab />
            </TabsContent>

            <TabsContent value="applications" className="mt-0">
              <AdminHostApplicationsTab />
            </TabsContent>

            <TabsContent value="pioneer" className="mt-0">
              <AdminPioneerReviewTab />
            </TabsContent>

            <TabsContent value="enrichment-review" className="mt-0">
              <AdminEnrichmentReviewTab />
            </TabsContent>

            <TabsContent value="event-review" className="mt-0">
              <AdminEventVerificationReviewTab />
            </TabsContent>

            <TabsContent value="operations" className="mt-0">
              <AdminOperationsTab />
            </TabsContent>

            <TabsContent value="moderation" className="mt-0">
              <AdminModerationTab />
            </TabsContent>

            <TabsContent value="payouts" className="mt-0">
              <AdminPayoutsTab />
            </TabsContent>

            <TabsContent value="economy" className="mt-0">
              <AdminEconomyTab />
            </TabsContent>

            <TabsContent value="access" className="mt-0">
              <AdminAccessRulesTab />
            </TabsContent>

            <TabsContent value="audit" className="mt-0">
              <AdminAuditTab />
            </TabsContent>

            <TabsContent value="promopush" className="mt-0">
              <AdminPromoPushTab />
            </TabsContent>

            <TabsContent value="catalog" className="mt-0">
              <AdminCatalogTab />
            </TabsContent>

            <TabsContent value="commerce" className="mt-0">
              <AdminCommerceTab />
            </TabsContent>

            <TabsContent value="support" className="mt-0">
              <AdminSupportTab />
            </TabsContent>

            <TabsContent value="compiler" className="mt-0">
              <PromoPilotCompiler />
            </TabsContent>

            <TabsContent value="proof-builder" className="mt-0">
              <AdminProofBuilderTab />
            </TabsContent>

            <TabsContent value="config" className="mt-0">
              <AdminConfigTab />
            </TabsContent>

            <TabsContent value="create-moment" className="mt-0">
              <AdminCreateMomentTab />
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
};

export default AdminDashboard;
