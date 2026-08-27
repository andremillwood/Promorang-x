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
  label: string;
  icon: LucideIcon;
  badge?: string;
};

const ADMIN_NAV_GROUPS: Array<{ label: string; items: AdminNavItem[] }> = [
  {
    label: "Master Telemetry",
    items: [
      { value: "command", label: "Master Command", icon: Shield, badge: "Live" },
      { value: "verification-hub", label: "Verification Hub", icon: ShieldCheck, badge: "3 New" },
      { value: "overview", label: "Analytics & ROI", icon: BarChart3 },
      { value: "growth", label: "Growth Radar", icon: TrendingUp },
      { value: "discovery", label: "Discovery Loop", icon: Target },
      { value: "leads", label: "Leads & CRM", icon: ContactRound },
    ],
  },
  {
    label: "Operations & Supply",
    items: [
      { value: "moments", label: "Moments Directory", icon: Calendar },
      { value: "claimable-pages", label: "Create for Owners", icon: UserPlus },
      { value: "users", label: "User Accounts", icon: Users },
      { value: "applications", label: "Host Applications", icon: Sparkles },
      { value: "pioneer", label: "Pioneer Audit", icon: Target },
      { value: "enrichment-review", label: "Scout Proof Review", icon: ClipboardCheck },
      { value: "event-review", label: "Event Evidence", icon: Calendar },
      { value: "operations", label: "Live Operations", icon: Activity },
    ],
  },
  {
    label: "Trust, Nodes & Treasury",
    items: [
      { value: "moderation", label: "Moderation Queue", icon: Scale },
      { value: "payouts", label: "Payouts & Escrow", icon: DollarSign },
      { value: "economy", label: "Gem Node Economy", icon: Coins },
      { value: "access", label: "Access & PromoKeys", icon: KeyRound },
      { value: "audit", label: "Audit Ledger", icon: Shield },
    ],
  },
  {
    label: "Platform Services",
    items: [
      { value: "promopush", label: "PromoPush Broadcast", icon: Megaphone },
      { value: "catalog", label: "Catalog Manager", icon: Store },
      { value: "commerce", label: "Commerce & Orders", icon: ShoppingBag },
      { value: "support", label: "Support Desk", icon: LifeBuoy },
    ],
  },
  {
    label: "System & Engine",
    items: [
      { value: "compiler", label: "Campaign Compiler", icon: Radio },
      { value: "proof-builder", label: "Proof Builder", icon: CheckCircle },
      { value: "config", label: "System Config", icon: Settings },
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
      {/* 1. Header & Live Admin Telemetry Shell */}
      <div className="p-6 rounded-3xl border border-white/15 bg-gradient-to-r from-cyan-950/30 via-[#0e1015] to-black backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/20 shrink-0">
            <Shield className="h-7 w-7 text-black" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-white">Platform Administration</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider">
                Root Access • {activeItem.label}
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1">
              Global system control, verification triaging, node liquidity, and master operational state.
            </p>
          </div>
        </div>

        {/* Global Quick Action Pills */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          <Button
            size="sm"
            onClick={() => handleTabChange("verification-hub")}
            className="h-10 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-500 text-black font-extrabold text-xs shadow-md shadow-cyan-400/20"
          >
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            Proof Hub
          </Button>

          <Button
            size="sm"
            onClick={() => handleTabChange("promopush")}
            className="h-10 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
          >
            <Megaphone className="h-3.5 w-3.5 mr-1.5 text-primary" />
            PromoPush
          </Button>
        </div>
      </div>

      {/* 2. Admin Command Shell (Left Navigation Bar + Right Viewport) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar Navigation (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#0e1015] p-4 space-y-4 sticky top-6 shadow-xl">
            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <Input
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search admin consoles..."
                className="h-9 pl-8.5 rounded-xl border-white/10 bg-white/5 text-white text-xs"
              />
            </div>

            {/* Nav Groups List */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {ADMIN_NAV_GROUPS.map((group) => {
                const visibleItems = group.items.filter((item) =>
                  item.label.toLowerCase().includes(navSearch.toLowerCase())
                );
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.label} className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 px-2.5">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.value;

                        return (
                          <button
                            key={item.value}
                            onClick={() => handleTabChange(item.value)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition text-left group ${
                              isActive
                                ? "bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-cyan-400" : "text-white/40 group-hover:text-white/70"}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 text-[9px] font-extrabold shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Console Viewport (9 cols) */}
        <div className="lg:col-span-9 min-w-0">
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
    </div>
  );
};

export default AdminDashboard;
