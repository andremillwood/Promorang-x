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
  Music2,
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
import { AdminMobileToolSwitch } from "@/components/admin/AdminMobileToolSwitch";
import { useI18n } from "@/i18n/I18nContext";
import AftrHrsAdmin from "@/pages/admin/AftrHrsAdmin";

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
  "aftrhrs",
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
      { value: "command", label: "Master Command", icon: Shield },
      { value: "verification-hub", label: "Verification Hub", icon: ShieldCheck },
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
      { value: "aftrhrs", label: "AftrHrs", icon: Music2 },
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
    <div data-admin-surface className="w-full space-y-6 pb-20 text-white animate-in fade-in-50 duration-300">
      <AdminMobileToolSwitch
        groups={ADMIN_NAV_GROUPS}
        activeTab={activeTab}
        onChange={handleTabChange}
        search={navSearch}
        onSearch={setNavSearch}
      />

      {/* Admin operating header: job-first. The complete subsystem map stays available,
          but no longer occupies the default working surface. */}
      <div className="admin-content-frame pt-5 sm:pt-7 lg:pt-8">
        <section className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,101,0,.08),rgba(255,255,255,.02)_34%,rgba(255,255,255,.015))] p-4 shadow-[0_24px_70px_rgba(0,0,0,.22)] sm:p-5 lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#ff6500]/25 bg-[#ff6500]/10 text-[#ff7a35]">
                  <Shield className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#ff7a35]">Admin workspace</p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h1 className="text-lg font-black text-white sm:text-xl">Platform Administration</h1>
                    <span className="truncate text-xs text-white/40">{activeItem.label}</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 max-w-2xl text-xs leading-5 text-white/45">
                Start from the job that needs attention. Open the full tool map only when you need a specialist control.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Find an admin tool..."
                  className="h-11 rounded-xl border-white/10 bg-black/30 pl-9 text-sm text-white placeholder:text-white/30 focus:border-[#ff6500]/45"
                />
              </div>
              <Button onClick={() => handleTabChange("verification-hub")} className="h-11 rounded-xl bg-[#ff6500] px-4 font-black text-black hover:bg-[#ff7a20]">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Review proof
              </Button>
            </div>
          </div>

          <nav aria-label="Admin primary jobs" className="mt-5 grid gap-2 border-t border-white/8 pt-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { value: "command", label: "Today", icon: Activity },
              { value: "moments", label: "Moments", icon: Calendar },
              { value: "users", label: "People", icon: Users },
              { value: "verification-hub", label: "Trust", icon: ShieldCheck },
              { value: "payouts", label: "Money", icon: DollarSign },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleTabChange(item.value)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-xl border px-3 text-left text-xs font-black transition",
                    active
                      ? "border-[#ff6500]/45 bg-[#ff6500]/12 text-[#ff9a5d]"
                      : "border-white/8 bg-white/[.025] text-white/55 hover:border-white/15 hover:bg-white/[.05] hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <details className="mt-4 border-t border-white/8 pt-4">
            <summary className="cursor-pointer list-none text-xs font-black text-white/45 transition hover:text-white">
              All admin tools
              <span className="ml-2 text-[10px] font-normal text-white/25">specialist controls and system surfaces</span>
            </summary>
            <div className="mt-4 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {ADMIN_NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#ff7a35]">{group.label}</p>
                  <div className="mt-2 grid gap-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = activeTab === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleTabChange(item.value)}
                          className={cn(
                            "flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-xs transition",
                            active ? "bg-white/[.08] text-white" : "text-white/48 hover:bg-white/[.04] hover:text-white/80",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.badge ? <span className="text-[9px] text-[#ff9a5d]">{item.badge}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </details>

          {navSearch.trim().length > 0 ? (
            <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-black/30 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {allNavItems
                .filter((item) => item.label.toLowerCase().includes(navSearch.toLowerCase()))
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        handleTabChange(item.value);
                        setNavSearch("");
                      }}
                      className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-left text-xs text-white/65 transition hover:bg-white/[.05] hover:text-white"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#ff7a35]" />
                      {item.label}
                    </button>
                  );
                })}
            </div>
          ) : null}
        </section>
      </div>

      {/* 2. Admin Main Viewport: same canonical frame as the operating header. */}
      <div className="admin-content-frame min-w-0 pb-16 pt-2 sm:pt-4 lg:pt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
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

            <TabsContent value="aftrhrs" className="mt-0">
              <AftrHrsAdmin />
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
