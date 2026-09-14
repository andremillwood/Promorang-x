import { useEffect, useState, useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAccessProfile, useIsAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { canAccessAdminTab, firstAdminTab } from "@/lib/admin-access";
import {
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  Shield,
  BarChart3,
  Sparkles,
  DollarSign,
  Coins,
  Scale,
  Settings,
  LifeBuoy,
  Activity,
  Megaphone,
  KeyRound,
  Target,
  Store,
  ShoppingBag,
  UserPlus,
  ContactRound,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Radio,
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
import { AdminEnrichmentReviewTab } from "@/components/admin/AdminEnrichmentReviewTab";
import { AdminEventVerificationReviewTab } from "@/components/admin/AdminEventVerificationReviewTab";
import { AdminDiscoveryAcquisitionTab } from "@/components/admin/AdminDiscoveryAcquisitionTab";
import { PromoPilotCompiler } from "@/components/campaigns/PromoPilotCompiler";
import { AdminVerificationHub } from "@/components/admin/AdminVerificationHub";
import { AdminTeamAccessTab } from "@/components/admin/AdminTeamAccessTab";
import { AdminMobileToolSwitch } from "@/components/admin/AdminMobileToolSwitch";
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
  "team-access",
  "aftrhrs",
]);

type AdminNavItem = {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

const ADMIN_NAV_GROUPS: Array<{ label: string; items: AdminNavItem[] }> = [
  {
    label: "Home & reports",
    items: [
      { value: "command", label: "Home", description: "See priorities and work requiring attention", icon: Shield, badge: "Live" },
      { value: "overview", label: "Platform report", description: "Understand activity and results across Promorang", icon: BarChart3 },
      { value: "growth", label: "Growth report", description: "Review acquisition and participation trends", icon: TrendingUp },
      { value: "discovery", label: "Discovery performance", description: "See how people find and act on opportunities", icon: Target },
      { value: "leads", label: "Prospective customers", description: "Follow organizations interested in Promorang", icon: ContactRound },
    ],
  },
  {
    label: "People & reviews",
    items: [
      { value: "verification-hub", label: "Reviews", description: "Work through identity, proof, and evidence checks", icon: ShieldCheck, badge: "New" },
      { value: "users", label: "People", description: "Find accounts and understand a person's activity", icon: Users },
      { value: "applications", label: "Host applications", description: "Review people applying to host Moments", icon: Sparkles },
      { value: "moderation", label: "Content reviews", description: "Review reported or pending content", icon: Scale },
      { value: "pioneer", label: "Pioneer contributions", description: "Review credited early contributions", icon: Target },
      { value: "enrichment-review", label: "Place information reviews", description: "Check submitted place details and evidence", icon: ClipboardCheck },
      { value: "event-review", label: "Event evidence", description: "Check submitted evidence for events", icon: Calendar },
      { value: "support", label: "Support", description: "Help people resolve account and product questions", icon: LifeBuoy },
    ],
  },
  {
    label: "Experiences & commerce",
    items: [
      { value: "moments", label: "Moments & venues", description: "Find and manage live experiences and places", icon: Calendar },
      { value: "claimable-pages", label: "Pages awaiting owners", description: "Prepare pages that an owner can claim", icon: UserPlus },
      { value: "operations", label: "Operations", description: "Monitor active work and service exceptions", icon: Activity },
      { value: "aftrhrs", label: "AftrHrs", description: "Manage RSVPs and the live night desk", icon: Music2 },
      { value: "catalog", label: "Catalog", description: "Manage items and offers available to people", icon: Store },
      { value: "commerce", label: "Orders", description: "Review orders, redemptions, and exceptions", icon: ShoppingBag },
      { value: "compiler", label: "Activation setup", description: "Configure and prepare an Activation", icon: Radio },
      { value: "proof-builder", label: "Proof requirements", description: "Define what participants need to submit", icon: CheckCircle },
      { value: "create-moment", label: "Create a Moment", description: "Set up a new Moment for the platform", icon: Calendar },
    ],
  },
  {
    label: "Money & communications",
    items: [
      { value: "promopush", label: "Announcements", description: "Send approved messages to selected audiences", icon: Megaphone },
      { value: "payouts", label: "Payouts", description: "Review and approve money owed", icon: DollarSign },
      { value: "economy", label: "Rewards & balances", description: "Review issued, committed, and available value", icon: Coins },
    ],
  },
  {
    label: "Administration",
    items: [
      { value: "team-access", label: "Admin team & access", description: "Invite, change, and revoke administrator responsibilities", icon: Users },
      { value: "access", label: "Participation rules", description: "Define who can view, join, claim, or redeem", icon: KeyRound },
      { value: "audit", label: "Admin activity", description: "Review important actions taken by administrators", icon: Shield },
      { value: "config", label: "Platform settings", description: "Manage owner-only platform behavior and safeguards", icon: Settings },
    ],
  },
];

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const { data: accessProfile, isLoading: accessLoading } = useAdminAccessProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab = requestedTab && ADMIN_TABS.has(requestedTab) ? requestedTab : "command";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [navSearch, setNavSearch] = useState("");

  const allowedNavGroups = useMemo(() => {
    if (!accessProfile) return [];
    return ADMIN_NAV_GROUPS
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => canAccessAdminTab(accessProfile.level, item.value, accessProfile.capabilities)),
      }))
      .filter((group) => group.items.length > 0);
  }, [accessProfile]);

  useEffect(() => {
    if (!accessProfile) return;
    const nextTab = requestedTab
      && ADMIN_TABS.has(requestedTab)
      && canAccessAdminTab(accessProfile.level, requestedTab, accessProfile.capabilities)
      ? requestedTab
      : firstAdminTab(accessProfile.level);

    setActiveTab(nextTab);
    if (requestedTab !== nextTab) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", nextTab);
        return next;
      }, { replace: true });
    }
  }, [accessProfile, requestedTab, setSearchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", value);
      return next;
    });
  };

  const allNavItems = useMemo(() => {
    return allowedNavGroups.flatMap((g) => g.items);
  }, [allowedNavGroups]);

  const activeItem = allNavItems.find((item) => item.value === activeTab) || allNavItems[0];

  // Find which group contains the activeTab
  const currentGroupIndex = allowedNavGroups.findIndex((g) =>
    g.items.some((item) => item.value === activeTab)
  );
  const selectedGroup = currentGroupIndex !== -1 ? allowedNavGroups[currentGroupIndex] : allowedNavGroups[0];

  if (authLoading || accessLoading || isAdmin === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin || !accessProfile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div data-admin-surface className="w-full space-y-6 pb-20 text-white animate-in fade-in-50 duration-300">
      <AdminMobileToolSwitch
        groups={allowedNavGroups}
        activeTab={activeTab}
        onChange={handleTabChange}
        search={navSearch}
        onSearch={setNavSearch}
      />
      {/* Role-aware admin header and task navigation */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-950/20 via-[#0e1218] to-[#0a0d12] backdrop-blur-xl p-5 shadow-2xl space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/20 shrink-0">
              <Shield className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Platform Administration</h1>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold tracking-wide uppercase">
                  {accessProfile.label}
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">
                {accessProfile.purpose} You are viewing <span className="text-white/70">{activeItem.label}</span>.
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
                placeholder="What do you need to do?"
                aria-label="Find an admin task"
                className="h-8 pl-8 rounded-lg border-white/10 bg-white/5 text-white text-xs placeholder:text-white/40 focus:border-cyan-500/50"
              />
            </div>

            {canAccessAdminTab(accessProfile.level, "verification-hub", accessProfile.capabilities) && (
              <Button
                size="sm"
                onClick={() => handleTabChange("verification-hub")}
                className="h-8 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-500 text-black font-extrabold text-xs shadow-md shadow-cyan-400/20"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                Open reviews
              </Button>
            )}

            {canAccessAdminTab(accessProfile.level, "support", accessProfile.capabilities) && (
              <Button
                size="sm"
                onClick={() => handleTabChange("support")}
                className="h-8 px-3 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
              >
                <LifeBuoy className="h-3 w-3 mr-1 text-primary" />
                Open support
              </Button>
            )}
          </div>
        </div>

        {/* Category Navigation Pills (Groups) */}
        <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {allowedNavGroups.map((group) => {
            const isGroupActive = group.items.some((item) => item.value === activeTab);

            return (
              <button
                key={group.label}
                onClick={() => handleTabChange(group.items[0].value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isGroupActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {group.label}
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
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 text-[9px] font-mono font-bold">
                    {item.badge}
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
              .filter((item) => {
                const query = navSearch.toLowerCase();
                return item.label.toLowerCase().includes(query)
                  || item.description.toLowerCase().includes(query);
              })
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
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{item.label}</span>
                      <span className="block truncate text-[10px] text-white/45">{item.description}</span>
                    </span>
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
            <AdminCommandCenter accessProfile={accessProfile} />
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

            <TabsContent value="aftrhrs" className="mt-0">
              <AftrHrsAdmin />
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

            <TabsContent value="team-access" className="mt-0">
              <AdminTeamAccessTab />
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
