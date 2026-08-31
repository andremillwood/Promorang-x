import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import logo from "@/assets/promorang-logo.png";
import { HeaderSearchPreview } from "@/components/HeaderSearchPreview";
import { GlobalTicketBalancePill } from "@/components/promoshare/GlobalTicketBalancePill";
import {
  Home,
  Compass,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Building2,
  Store,
  BarChart3,
  MapPin,
  ChevronDown,
  Building,
  Plus,
  Package,
  QrCode,
  ShoppingBag,
  Activity,
  Bell,
  Bookmark,
  Archive,
  PlayCircle,
  Search,
  WalletCards,
  Briefcase,
  Film,
  Layers,
  Megaphone,
  RadioTower,
  Route,
  Ticket,
  CheckCircle,
  CircleHelp,
  Gift,
  PanelLeftClose,
  PanelLeftOpen,
  Coins,
  ArrowUpRight,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { DemoExperienceBanner } from "@/components/demo/DemoExperienceBanner";
import { DemoCoachmark } from "@/components/demo/DemoCoachmark";
import { CityQuickSwitcher } from "@/components/location/CityQuickSwitcher";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { useMarket } from "@/contexts/MarketContext";

type Translate = (key: TranslationKey, variables?: Record<string, string | number>) => string;

type UserRole = "participant" | "creator" | "host" | "brand" | "merchant" | "agency" | "promoter" | "marketing" | "admin";


interface DashboardLayoutProps {
  children: ReactNode;
  currentRole: UserRole;
}

type NavItem = {
  icon: typeof Home;
  label: string;
  href: string;
  experimental?: boolean;
  group?: "primary" | "growth" | "manage" | "utility";
};

const showExperimentalEconomy =
  import.meta.env.VITE_SHOW_EXPERIMENTAL_ECONOMY === "true";

const filterReleaseNav = <T extends NavItem>(items: T[]) =>
  items.filter((item) => !item.experimental || showExperimentalEconomy);

const getPageLabels = (t: Translate): Array<{ match: string; label: string; description: string }> => [
  { match: "/how-it-works", label: t("dashPage.howItWorks"), description: t("dashPage.howItWorksDesc") },
  { match: "/momentum", label: t("dashPage.momentum"), description: t("dashPage.momentumDesc") },
  { match: "/pulse", label: t("dashPage.pulse"), description: t("dashPage.pulseDesc") },
  { match: "/content-drops", label: t("dashPage.contentDrops"), description: t("dashPage.contentDropsDesc") },
  { match: "/scenes", label: t("dashPage.scenes"), description: t("dashPage.scenesDesc") },
  { match: "/creators", label: t("dashPage.creators"), description: t("dashPage.creatorsDesc") },
  { match: "/discover", label: t("dashPage.discover"), description: t("dashPage.discoverDesc") },
  { match: "/shop", label: t("dashPage.shop"), description: t("dashPage.shopDesc") },
  { match: "/create", label: t("dashPage.create"), description: t("dashPage.createDesc") },
  { match: "/vault", label: t("dashPage.vault"), description: t("dashPage.vaultDesc") },
  { match: "/wallet", label: t("dashPage.wallet"), description: t("dashPage.walletDesc") },
  { match: "/nodes", label: t("dashPage.nodes"), description: t("dashPage.nodesDesc") },
  { match: "/portfolio", label: t("dashPage.portfolio"), description: t("dashPage.portfolioDesc") },
  { match: "/liquidity", label: t("dashPage.liquidity"), description: t("dashPage.liquidityDesc") },
  { match: "/promoshare", label: t("dashPage.promoshare"), description: t("dashPage.promoshareDesc") },
  { match: "/missions", label: t("dashPage.missions"), description: t("dashPage.missionsDesc") },
  { match: "/activity", label: t("dashPage.activity"), description: t("dashPage.activityDesc") },
  { match: "/saved", label: t("dashPage.saved"), description: t("dashPage.savedDesc") },
  { match: "/dashboard/analytics", label: t("dashPage.analytics"), description: t("dashPage.analyticsDesc") },
  { match: "/dashboard/settings", label: t("dashPage.settings"), description: t("dashPage.settingsDesc") },
  { match: "/dashboard", label: t("dashPage.home"), description: t("dashPage.homeDesc") },
  { match: "/admin", label: t("dashPage.admin"), description: t("dashPage.adminDesc") },
];

const getPageMeta = (pathname: string, search: string, role: UserRole, t: Translate) => {
  const pageLabels = getPageLabels(t);
  if (pathname === "/dashboard" && role === "creator") {
    const params = new URLSearchParams(search);
    const tab = params.get("tab");
    if (tab === "publish") {
      return { label: t("dashPage.publish"), description: t("dashPage.publishDesc") };
    }
    if (tab === "missions") {
      return { label: t("dashPage.createMission"), description: t("dashPage.createMissionDesc") };
    }
    if (tab === "content") {
      return { label: t("dashPage.myContent"), description: t("dashPage.myContentDesc") };
    }
  }

  return pageLabels.find((item) => pathname === item.match || pathname.startsWith(item.match + "/")) || pageLabels[pageLabels.length - 2];
};

const isNavItemActive = (pathname: string, href: string, search: string) => {
  const [itemPath, itemQuery] = href.split("?");
  if (itemQuery) {
    return pathname === itemPath && search.includes(itemQuery);
  }
  return pathname === itemPath || pathname.startsWith(itemPath + "/");
};

const getRoleNavItems = (t: Translate): Record<UserRole, NavItem[]> => ({
  participant: [
    { icon: Home, label: t("dashNav.today"), href: "/dashboard", group: "primary" },
    { icon: Compass, label: t("dashNav.exploreDiscover"), href: "/discover", group: "primary" },
    { icon: Gift, label: t("dashNav.rewardsDeals"), href: "/rewards", group: "primary" },
    { icon: Coins, label: t("dashNav.saveWinVaults"), href: "/nodes", group: "primary" },
    { icon: Plus, label: t("dashNav.hostMoment"), href: "/create/moment", group: "primary" },
    { icon: WalletCards, label: t("dashNav.myPassesWallet"), href: "/wallet", group: "utility" },
    { icon: Settings, label: t("dashNav.settings"), href: "/dashboard/settings", group: "utility" },
  ],
  creator: [
    { icon: Home, label: t("dashNav.creatorStudio"), href: "/dashboard", group: "primary" },
    { icon: Compass, label: t("dashNav.exploreScenes"), href: "/discover", group: "primary" },
    { icon: RadioTower, label: t("dashNav.contentDrops"), href: "/content-drops", group: "primary" },
    { icon: Gift, label: t("dashNav.promoShareEarnings"), href: "/promoshare", group: "primary" },
    { icon: Coins, label: t("dashNav.saveWinVaults"), href: "/nodes", group: "primary" },
    { icon: WalletCards, label: t("dashNav.walletPayouts"), href: "/wallet", group: "utility" },
    { icon: Settings, label: t("dashNav.settings"), href: "/dashboard/settings", group: "utility" },
  ],
  host: [
    { icon: Home, label: t("dashNav.hostOverview"), href: "/dashboard", group: "primary" },
    { icon: Plus, label: t("dashNav.createMoment"), href: "/create/moment", group: "primary" },
    { icon: CheckCircle, label: t("dashNav.doorCheckIns"), href: "/organizer/check-ins", group: "primary" },
    { icon: Compass, label: t("dashNav.discover"), href: "/discover", group: "primary" },
    { icon: WalletCards, label: t("dashNav.revenueWallet"), href: "/wallet", group: "utility" },
    { icon: Settings, label: t("dashNav.settings"), href: "/dashboard/settings", group: "utility" },
  ],
  merchant: [
    { icon: Home, label: t("dashNav.storefrontOverview"), href: "/dashboard", group: "primary" },
    { icon: Package, label: t("dashNav.productsDeals"), href: "/dashboard?tab=products", group: "primary" },
    { icon: QrCode, label: t("dashNav.qrRedemptions"), href: "/dashboard?tab=redemptions", group: "primary" },
    { icon: Coins, label: t("dashNav.communityVaults"), href: "/nodes", group: "primary" },
    { icon: Compass, label: t("dashNav.exploreMarket"), href: "/discover", group: "primary" },
    { icon: WalletCards, label: t("dashNav.earningsWallet"), href: "/wallet", group: "utility" },
    { icon: Settings, label: t("dashNav.settings"), href: "/dashboard/settings", group: "utility" },
  ],
  brand: [
    { icon: Home, label: t("dashNav.campaignCommand"), href: "/dashboard", group: "primary" },
    { icon: Plus, label: t("dashNav.newCampaign"), href: "/create/campaign", group: "primary" },
    { icon: RadioTower, label: t("dashNav.contentDrops"), href: "/content-drops", group: "primary" },
    { icon: Compass, label: t("dashNav.exploreVenues"), href: "/discover", group: "primary" },
    { icon: WalletCards, label: t("dashNav.budgetWallet"), href: "/wallet", group: "utility" },
    { icon: Settings, label: t("dashNav.settings"), href: "/dashboard/settings", group: "utility" },
  ],
  agency: [
    { icon: Home, label: t("dashNav.agencyOverview"), href: "/dashboard", group: "primary" },
    { icon: Briefcase, label: t("dashNav.clientAccounts"), href: "/dashboard?tab=clients", group: "primary" },
    { icon: Plus, label: t("dashNav.newActivation"), href: "/create/campaign", group: "primary" },
    { icon: Compass, label: t("dashNav.exploreVenues"), href: "/discover", group: "primary" },
    { icon: WalletCards, label: t("dashNav.treasuryWallet"), href: "/wallet", group: "utility" },
    { icon: Settings, label: t("dashNav.settings"), href: "/dashboard/settings", group: "utility" },
  ],
  promoter: [
    { icon: Home, label: t("dashNav.promoCommand"), href: "/dashboard", group: "primary" },
    { icon: Gift, label: t("dashNav.promoShareLinks"), href: "/promoshare", group: "primary" },
    { icon: Coins, label: t("dashNav.saveWinVaults"), href: "/nodes", group: "primary" },
    { icon: Compass, label: t("dashNav.discoverMoments"), href: "/discover", group: "primary" },
    { icon: WalletCards, label: t("dashNav.commissionsWallet"), href: "/wallet", group: "utility" },
    { icon: Settings, label: t("dashNav.settings"), href: "/dashboard/settings", group: "utility" },
  ],
  marketing: [
    { icon: Home, label: t("dashNav.growthCommand"), href: "/dashboard", group: "primary" },
    { icon: RadioTower, label: t("dashNav.contentDrops"), href: "/content-drops", group: "primary" },
    { icon: Compass, label: t("dashNav.discover"), href: "/discover", group: "primary" },
    { icon: WalletCards, label: t("dashNav.wallet"), href: "/wallet", group: "utility" },
    { icon: Settings, label: t("dashNav.settings"), href: "/dashboard/settings", group: "utility" },
  ],
  admin: [
    { icon: Home, label: t("dashNav.commandCenter"), href: "/admin?tab=command", group: "primary" },
    { icon: Users, label: t("dashNav.usersKyc"), href: "/admin?tab=users", group: "primary" },
    { icon: Calendar, label: t("dashNav.momentsVenues"), href: "/admin?tab=moments", group: "primary" },
    { icon: Coins, label: t("dashNav.communityVaults"), href: "/nodes", group: "primary" },
    { icon: Compass, label: t("dashNav.discover"), href: "/discover", group: "primary" },
    { icon: WalletCards, label: t("dashNav.platformWallet"), href: "/wallet", group: "utility" },
    { icon: Settings, label: t("dashNav.settings"), href: "/dashboard/settings", group: "utility" },
  ],
});

const roleLabelKeys: Record<UserRole, TranslationKey> = {
  participant: "dashRole.participant",
  creator: "dashRole.creator",
  host: "dashRole.host",
  brand: "dashRole.brand",
  merchant: "dashRole.merchant",
  agency: "dashRole.agency",
  promoter: "dashRole.promoter",
  marketing: "dashRole.marketing",
  admin: "dashRole.admin",
};

const roleVisuals: Record<UserRole, { icon: typeof Users; color: string }> = {
  participant: { icon: Users, color: "bg-blue-500" },
  creator: { icon: PlayCircle, color: "bg-fuchsia-500" },
  host: { icon: Sparkles, color: "bg-primary" },
  brand: { icon: Building2, color: "bg-primary" },
  merchant: { icon: Store, color: "bg-emerald-500" },
  agency: { icon: Briefcase, color: "bg-sky-600" },
  promoter: { icon: Megaphone, color: "bg-[#FF6A00]" },
  marketing: { icon: Megaphone, color: "bg-[#FFC300]" },
  admin: { icon: Settings, color: "bg-destructive" },
};

const safeRoleInfo = (role: string | undefined | null, t: Translate) => {
  const resolved = (role && roleVisuals[role as UserRole] ? role : "participant") as UserRole;
  const visual = roleVisuals[resolved];
  return { icon: visual.icon, color: visual.color, label: t(roleLabelKeys[resolved]) };
};

const DashboardLayout = ({ children, currentRole }: DashboardLayoutProps) => {
  const { t } = useI18n();
  const { user, roles, organizations, activeOrgId, setActiveOrgId, agencyClients, setActiveRole, signOut, profile } = useAuth();
  const { city } = useMarket();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("promorang_sidebar_collapsed") === "true"
  );

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      localStorage.setItem("promorang_sidebar_collapsed", String(next));
      return next;
    });
  };

  const activeOrg = organizations.find(o => o.id === activeOrgId);

  // Safe role resolution — never crashes, always falls back to participant
  const roleNavItems = getRoleNavItems(t);
  const safeRole = currentRole && roleNavItems[currentRole] ? currentRole : 'participant';
  const roleItems = roleNavItems[safeRole] || roleNavItems.participant;
  const navItems = filterReleaseNav(roleItems);
  const primaryNavItems = navItems.filter((item) => !item.group || item.group === "primary");
  const growthNavItems = navItems.filter((item) => item.group === "growth");
  const manageNavItems = navItems.filter((item) => item.group === "manage");
  const utilityNavItems = navItems.filter((item) => item.group === "utility");
  const roleInfo = safeRoleInfo(safeRole, t);
  const immersiveProductRoutes = ["/momentum", "/content-drops", "/scenes", "/creators", "/for-you", "/discover", "/search", "/saved", "/profile", "/vault", "/moments", "/events", "/checkin", "/create", "/shop", "/wallet", "/admin", "/organizer"];
  const isImmersiveProductRoute = immersiveProductRoutes.some((path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  const isCinematicCultureRoute = ["/scenes", "/creators", "/for-you", "/saved", "/profile", "/moments", "/events", "/checkin", "/create", "/shop", "/wallet"].some((path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  const isDashboardHome = location.pathname === "/dashboard";
  const hidePageHeader = isImmersiveProductRoute || location.pathname === "/dashboard";
  const showCompactDemoBanner = location.pathname !== "/dashboard" && !isImmersiveProductRoute;
  const pageMeta = getPageMeta(location.pathname, location.search, safeRole, t);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const mobileNavItems: Record<UserRole, (NavItem & { accent?: boolean })[]> = {
    participant: [
      { icon: Home, label: t("dashMobile.today"), href: "/dashboard" },
      { icon: Search, label: t("dashMobile.discover"), href: "/discover" },
      { icon: Gift, label: t("dashMobile.draws"), href: "/promoshare" },
      { icon: Users, label: t("dashMobile.scenes"), href: "/scenes" },
      { icon: Archive, label: t("dashMobile.vault"), href: "/vault" },
    ],
    creator: [
      { icon: Home, label: t("dashMobile.studio"), href: "/dashboard" },
      { icon: PlayCircle, label: t("dashMobile.missions"), href: "/missions" },
      { icon: Plus, label: t("dashMobile.publish"), href: "/dashboard?tab=publish", accent: true },
      { icon: Megaphone, label: t("dashMobile.promoPush"), href: "/promopush/creator" },
      { icon: Settings, label: t("dashMobile.settings"), href: "/dashboard/settings" },
    ],
    host: [
      { icon: Home, label: t("dashMobile.home"), href: "/dashboard" },
      { icon: Activity, label: t("dashMobile.pulse"), href: "/pulse" },
      { icon: Plus, label: t("dashMobile.create"), href: "/create/moment", accent: true },
      { icon: Archive, label: t("dashMobile.vault"), href: "/vault" },
      { icon: Settings, label: t("dashMobile.settings"), href: "/dashboard/settings" },
    ],
    brand: [
      { icon: Home, label: t("dashMobile.home"), href: "/dashboard" },
      { icon: Plus, label: t("dashMobile.create"), href: "/create/campaign", accent: true },
      { icon: BarChart3, label: t("dashMobile.analytics"), href: "/dashboard/analytics" },
      { icon: Settings, label: t("dashMobile.settings"), href: "/dashboard/settings" },
    ],
    merchant: [
      { icon: Home, label: t("dashMobile.home"), href: "/dashboard" },
      { icon: Store, label: t("dashMobile.store"), href: "/dashboard?tab=storefront" },
      { icon: Package, label: t("dashMobile.products"), href: "/dashboard?tab=products", accent: true },
      { icon: ShoppingBag, label: t("dashMobile.orders"), href: "/dashboard?tab=commerce" },
      { icon: QrCode, label: t("dashMobile.redeem"), href: "/dashboard?tab=redemptions" },
    ],
    agency: [
      { icon: Home, label: t("dashMobile.home"), href: "/dashboard" },
      { icon: Briefcase, label: t("dashMobile.clients"), href: "/dashboard", accent: true },
      { icon: Sparkles, label: t("dashMobile.create"), href: "/create/campaign" },
      { icon: BarChart3, label: t("dashMobile.stats"), href: "/dashboard/analytics" },
      { icon: Settings, label: t("dashMobile.settings"), href: "/dashboard/settings" },
    ],
    promoter: [
      { icon: Megaphone, label: t("dashMobile.promoPush"), href: "/promopush/promoter", accent: true },
      { icon: Search, label: t("dashMobile.discover"), href: "/discover" },
      { icon: Home, label: t("dashMobile.home"), href: "/dashboard" },
      { icon: Settings, label: t("dashMobile.settings"), href: "/dashboard/settings" },
    ],
    marketing: [
      { icon: Megaphone, label: t("dashMobile.promoPush"), href: "/promopush", accent: true },
      { icon: Home, label: t("dashMobile.home"), href: "/dashboard" },
      { icon: BarChart3, label: t("dashMobile.stats"), href: "/dashboard/analytics" },
      { icon: Settings, label: t("dashMobile.settings"), href: "/dashboard/settings" },
    ],
    admin: [
      { icon: Home, label: t("dashMobile.admin"), href: "/admin" },
      { icon: Users, label: t("dashMobile.users"), href: "/admin?tab=users" },
      { icon: Calendar, label: t("dashMobile.moments"), href: "/admin?tab=moments", accent: true },
      { icon: BarChart3, label: t("dashMobile.stats"), href: "/admin?tab=overview" },
      { icon: Settings, label: t("dashMobile.settings"), href: "/dashboard/settings" },
    ],
  };

  const currentMobileNav = safeRole === "participant"
    ? filterReleaseNav(mobileNavItems.participant).slice(0, 5)
    : [...filterReleaseNav(mobileNavItems[safeRole]).slice(0, 4), { icon: ShoppingBag, label: t("dashMobile.shop"), href: "/shop" }];

  return (
    <div className="app-shell-mobile relative flex min-h-screen min-h-dvh overflow-x-clip bg-background transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {t("common.skipToContent")}
      </a>
      {/* Ambient Background Washes */}
      <div className="pointer-events-none absolute right-0 top-0 h-[280px] w-[280px] rounded-full bg-primary/12 blur-[90px] opacity-60 sm:h-[500px] sm:w-[500px] sm:-mr-64 sm:-mt-64 sm:blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[240px] w-[240px] rounded-full bg-amber-500/10 blur-[80px] opacity-50 sm:h-[400px] sm:w-[400px] sm:-mb-48 sm:-ml-48 sm:blur-[100px]" />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border/80 bg-card/95 text-card-foreground shadow-[24px_0_80px_rgba(0,0,0,0.1)] dark:shadow-[24px_0_80px_rgba(0,0,0,0.45)] backdrop-blur-xl transform transition-[width,transform] duration-200 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] ${sidebarCollapsed ? "lg:w-24" : "lg:w-72"} ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full relative z-10">
          {/* Sidebar Header: Logo & Branding */}
          <div className={cn("relative flex h-20 items-center border-b border-border/70 px-8", sidebarCollapsed && "lg:justify-center lg:px-3")}>
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
              <div className="h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img src={logo} alt="Promorang" className="h-10 w-10 object-contain rounded-xl" />
              </div>
              <span className={cn("text-xl font-black tracking-tight text-foreground", sidebarCollapsed && "lg:hidden")}>Promorang</span>
            </Link>
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              aria-label={sidebarCollapsed ? t("common.expandNav") : t("common.collapseNav")}
              aria-expanded={!sidebarCollapsed}
              title={sidebarCollapsed ? t("common.expandMenu") : t("common.collapseMenu")}
              className={cn(
                "absolute -right-3 top-1/2 hidden h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:grid",
              )}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Navigation Section */}
          <div className={cn("dashboard-sidebar-scroll flex-1 space-y-7 overflow-y-auto px-4 pt-4", sidebarCollapsed && "lg:hidden")}>
            <div className="px-1">
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{safeRole === "participant" ? t("dashboard.yourPromorang") : t("dashboard.activeWorkspace")}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-2xl border border-primary/35 bg-primary px-4 py-3 text-left text-white shadow-[0_14px_38px_rgba(255,106,0,0.2)] transition hover:bg-orange-500">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20"><roleInfo.icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1"><span className="block text-[9px] font-bold uppercase tracking-widest text-white/80">{safeRole === "participant" ? t("dashboard.youAreHereAs") : t("dashboard.workingAs")}</span><span className="block text-sm font-black">{roleInfo.label}</span></span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>{t("dashboard.switchWorkspace")}</DropdownMenuLabel>
                  {roles.map((role) => {
                    const info = safeRoleInfo(role, t);
                    const RoleIcon = info.icon;
                    return (
                      <DropdownMenuItem key={role} onClick={() => { setActiveRole(role as UserRole); navigate("/dashboard"); }} className="flex items-center gap-3 py-3">
                        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", info.color)}><RoleIcon className="h-4 w-4 text-white" /></span>
                        <span className="font-semibold">{info.label}</span>
                        {role === safeRole ? <CheckCircle className="ml-auto h-4 w-4 text-primary" /> : null}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/help" className="flex items-center gap-2"><Plus className="h-4 w-4" /> {t("dashboard.howRoleAccessWorks")}</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="px-3 pt-2 text-[10px] leading-4 text-muted-foreground">{t("dashboard.workspaceHelp")}</p>
            </div>
            <div>
              <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5500] mb-3">
                {safeRole === "participant" ? t("dashboard.exploreAndDo") : t("dashboard.explore")}
              </p>
              <nav className="space-y-1">
                {primaryNavItems.map((item) => (
                  (() => {
                    const active = isNavItemActive(location.pathname, item.href, location.search);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200 group text-sm",
                          active
                            ? "border-primary/40 bg-primary/15 text-primary font-bold shadow-[inset_3px_0_0_hsl(var(--primary)),0_12px_30px_rgba(0,0,0,0.18)]"
                            : "border-transparent text-foreground/75 hover:border-border/60 hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          active
                            ? "bg-primary/20 text-primary"
                            : "bg-transparent text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                        )}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">{item.label}</span>
                      </Link>
                    );
                  })()
                ))}
              </nav>
            </div>

            {safeRole === "creator" && growthNavItems.length > 0 && (
              <div>
                <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("dashboard.createAndGrow")}</p>
                <nav className="space-y-1">
                  {growthNavItems.map((item) => {
                    const active = isNavItemActive(location.pathname, item.href, location.search);
                    return (
                      <Link key={item.href} to={item.href} className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                        active ? "bg-primary/15 text-primary font-bold" : "text-foreground/75 hover:bg-muted/50 hover:text-foreground",
                      )}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            {safeRole === "host" && manageNavItems.length > 0 && (
              <div>
                <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("dashboard.manage")}</p>
                <nav className="space-y-1">
                  {manageNavItems.map((item) => {
                    const active = isNavItemActive(location.pathname, item.href, location.search);
                    return (
                      <Link key={item.href} to={item.href} className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                        active ? "bg-primary/15 text-primary font-bold" : "text-foreground/75 hover:bg-muted/50 hover:text-foreground",
                      )}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            {utilityNavItems.length > 0 && (
              <div>
                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5500] mb-3">
                  {safeRole === "participant" ? t("dashboard.savedPerksWins") : t("dashboard.savedValue")}
                </p>
                <nav className="space-y-1">
                  {utilityNavItems.map((item) => (
                    (() => {
                      const active = isNavItemActive(location.pathname, item.href, location.search);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-200 group text-sm",
                            active
                              ? "border-primary/40 bg-primary/15 text-primary font-bold shadow-[inset_3px_0_0_hsl(var(--primary)),0_12px_30px_rgba(0,0,0,0.18)]"
                              : "border-transparent text-foreground/75 hover:border-border/60 hover:bg-muted/50 hover:text-foreground",
                          )}
                        >
                          <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            active
                              ? "bg-primary/20 text-primary"
                              : "bg-transparent text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                          )}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold">{item.label}</span>
                        </Link>
                      );
                    })()
                  ))}
                </nav>
              </div>
            )}

            <div>
              <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{t("dashboard.understand")}</p>
              <Link
                to="/how-it-works"
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]",
                  location.pathname === "/how-it-works"
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-transparent text-foreground/75 hover:border-border/60 hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span className="rounded-lg bg-primary/10 p-2 text-primary"><CircleHelp className="h-5 w-5" /></span>
                {t("dashboard.howWorks")}
              </Link>
            </div>

            {/* Organization Switcher (Only for non-participant roles) */}
            {safeRole !== "participant" && (
              <div className="pt-2">
                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  {t("dashOrg.organization")}
                </p>
                <div className="px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/70 bg-card text-left transition-colors hover:bg-muted/50 group">
                        <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                          {activeOrg?.avatar_url ? (
                            <img src={activeOrg.avatar_url} alt="" className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <Building className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground pr-4 relative">
                            {activeOrg?.name || t("dashOrg.myHub")}
                            <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 opacity-50" />
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">
                            {activeOrg?.type || t("dashOrg.personal")}
                          </p>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("dashOrg.myAccounts")}</DropdownMenuLabel>
                      {organizations.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          onClick={() => {
                            setActiveOrgId(org.id);
                            navigate("/dashboard");
                          }}
                          className={`flex items-center gap-3 py-3 ${activeOrgId === org.id ? "bg-muted font-bold" : ""}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Building className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm">{org.name}</span>
                            <span className="text-[10px] opacity-70 uppercase tracking-tighter">{org.type}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {agencyClients.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("dashOrg.agencyClients")}</DropdownMenuLabel>
                          {agencyClients.map((client) => (
                            <DropdownMenuItem
                              key={client.id}
                              onClick={() => {
                                // Impersonate logic: Switch to client org and change role to match client type
                                setActiveOrgId(client.id);
                                if (client.type === 'brand') setActiveRole('brand');
                                if (client.type === 'merchant') setActiveRole('merchant');
                                navigate("/dashboard");
                              }}
                              className="flex items-center gap-3 py-3 group/client"
                            >
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover/client:bg-accent/20 transition-colors">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{client.name}</span>
                                <span className="text-[10px] opacity-70 uppercase tracking-tighter">{t("dashOrg.manageAs", { type: client.type })}</span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center gap-3 py-3 text-primary group">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm">{t("dashOrg.addAccount")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>

          {/* Purpose-built desktop icon rail */}
          <div className={cn("dashboard-sidebar-scroll hidden min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto py-4", sidebarCollapsed && "lg:flex")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t("common.switchWorkspaceCurrent", { role: roleInfo.label })}
                  title={t("common.workingAsRole", { role: roleInfo.label })}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/35 bg-primary text-white shadow-[0_12px_30px_rgba(255,106,0,0.22)] transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <roleInfo.icon className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-64">
                <DropdownMenuLabel>{t("dashboard.switchWorkspace")}</DropdownMenuLabel>
                {roles.map((role) => {
                  const info = safeRoleInfo(role, t);
                  const RoleIcon = info.icon;
                  return <DropdownMenuItem key={role} onClick={() => { setActiveRole(role as UserRole); navigate("/dashboard"); }} className="flex items-center gap-3 py-3"><span className={cn("grid h-8 w-8 place-items-center rounded-lg", info.color)}><RoleIcon className="h-4 w-4 text-white" /></span><span className="font-semibold">{info.label}</span>{role === safeRole ? <CheckCircle className="ml-auto h-4 w-4 text-primary" /> : null}</DropdownMenuItem>;
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="my-1 h-px w-10 shrink-0 bg-border/70" />
            <nav aria-label={t("common.dashboardNav")} className="flex w-full flex-col items-center gap-1.5">
              {[...primaryNavItems, ...growthNavItems, ...manageNavItems, ...utilityNavItems].map((item) => {
                const active = isNavItemActive(location.pathname, item.href, location.search);
                return <Link key={`${item.group || "nav"}-${item.href}`} to={item.href} aria-label={item.label} title={item.label} className={cn("grid h-11 w-12 shrink-0 place-items-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", active ? "border-primary/40 bg-primary/15 text-primary shadow-[inset_3px_0_0_hsl(var(--primary))]" : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/50 hover:text-foreground")}><item.icon className="h-5 w-5" /></Link>;
              })}
              <Link to="/how-it-works" aria-label={t("dashboard.howWorks")} title={t("dashboard.howWorks")} className={cn("grid h-11 w-12 shrink-0 place-items-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", location.pathname === "/how-it-works" ? "border-primary/40 bg-primary/15 text-primary" : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/50 hover:text-foreground")}><CircleHelp className="h-5 w-5" /></Link>
            </nav>
          </div>

          {/* Clean Sidebar Footer */}
          <div className={cn("mt-auto p-4 border-t border-border/50", sidebarCollapsed && "lg:hidden")}>
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(false);
                void handleSignOut();
              }}
              className="mb-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 lg:hidden"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("nav.signOut")}</span>
            </button>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title={sidebarCollapsed ? t("dashboard.expand") : t("dashboard.collapseSidebar")}
              >
                <PanelLeftClose className="w-4 h-4" />
                <span>{t("dashboard.collapse")}</span>
              </button>

              <Link
                to="/how-it-works"
                className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title={t("common.helpGuides")}
              >
                <CircleHelp className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className={cn("mt-auto hidden flex-col items-center gap-2 border-t border-border/70 py-4", sidebarCollapsed && "lg:flex")}>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              aria-label={t("dashboard.expand")}
              title={t("dashboard.expand")}
              className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <Link
              to="/how-it-works"
              aria-label={t("dashboard.howWorks")}
              title={t("dashboard.howWorks")}
              className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <CircleHelp className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        id="main-content"
        className={cn(
          "relative flex min-h-screen min-h-dvh min-w-0 flex-1 flex-col overflow-x-clip transition-[padding] duration-200",
          sidebarCollapsed ? "lg:pl-24" : "lg:pl-72",
          isCinematicCultureRoute && "bg-black"
        )}
      >
        {/* Mobile Header */}
        <div className="pt-safe lg:hidden sticky top-0 z-30 border-b border-border/70 bg-card/95 p-4 text-foreground shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label={t("common.openDashboardNav")}
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-xl bg-muted/60 border border-border/70 flex items-center justify-center text-foreground shadow-soft active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex min-w-0 flex-1 items-center justify-center px-2">
              <CityQuickSwitcher tone="app" className="max-w-[180px]" />
            </div>
            <Link to="/profile" className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xs shadow-soft active:scale-95 transition-transform overflow-hidden">
              {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (user?.email || "?").charAt(0).toUpperCase()
              )}
            </Link>
          </div>
          {safeRole !== "participant" ? <div className="mt-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{roleInfo.label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{pageMeta.label}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{pageMeta.description}</p>
              </div>
              <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", roleInfo.color)} />
            </div>
          </div> : null}
        </div>

        {/* Desktop In-App Top Command Bar */}
        <div className="sticky top-0 z-30 hidden lg:flex items-center justify-between h-16 px-6 xl:px-8 border-b border-border/60 bg-background/80 backdrop-blur-xl transition-colors">
          {/* Left: Breadcrumb / Active Context */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold shrink-0">
              <roleInfo.icon className="h-3.5 w-3.5" />
              <span>{roleInfo.label}</span>
            </div>
            <CityQuickSwitcher tone="app" />
            <span className="text-border text-sm">/</span>
            <h2 className="text-sm font-black text-foreground uppercase tracking-wide truncate">
              {pageMeta.label}
            </h2>
          </div>

          {/* Right: Search Palette, Quick Create, Wallet Balance, Notifications, Theme, Profile */}
          <div className="flex items-center gap-2.5">
            {/* Global Search Palette */}
            <HeaderSearchPreview />

            {/* Quick + Create Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t("dashboard.create")}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-border/60 bg-popover text-popover-foreground">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("dashboard.quickActions")}
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/create/moment" className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer">
                    <div className="h-7 w-7 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center shrink-0">
                      <Ticket className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t("dashboard.newMoment")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("dashboard.newMomentDesc")}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/create/campaign" className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer">
                    <div className="h-7 w-7 rounded-lg bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t("dashboard.newActivation")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("dashboard.newActivationDesc")}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/content-drops" className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer">
                    <div className="h-7 w-7 rounded-lg bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
                      <PlayCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t("dashboard.contentDrop")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("dashboard.contentDropDesc")}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Global Ticket & Points Balance Pill */}
            <GlobalTicketBalancePill className="hidden sm:inline-flex" />

            {/* Notifications Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-muted/60 transition-colors outline-none cursor-pointer">
                <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-background animate-pulse" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl shadow-2xl border-border/60 bg-popover text-popover-foreground">
                <div className="p-2 pb-2 border-b border-border/40 flex items-center justify-between">
                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">{t("common.notifications")}</p>
                  <span className="text-[10px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded font-mono">{t("common.live")}</span>
                </div>
                <div className="flex flex-col gap-1 py-1">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-bold">S</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs leading-tight text-foreground">
                        {t("nav.demoHypeNotification", { name: "Sarah Drop" })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{t("nav.demoHypeTime")}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/activity")}
                    className="w-full text-xs text-muted-foreground hover:text-foreground h-7 rounded-lg"
                  >
                    {t("nav.viewAllActivity")}
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Avatar Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/60 transition-all outline-none cursor-pointer group">
                <div className="relative h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden ring-1 ring-border">
                  {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                    <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (user?.email || "?").charAt(0).toUpperCase()
                  )}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background bg-emerald-500" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-2xl border-border/60 bg-popover text-popover-foreground space-y-1.5 animate-in fade-in-50 zoom-in-95 duration-150">
                {/* Profile Identity Card */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/40 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-black shrink-0 overflow-hidden">
                    {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                      <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (user?.email || "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold truncate text-foreground">{profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || t("common.member")}</p>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono font-bold shrink-0">
                        {roleInfo.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
                  </div>
                </div>

                {/* Quick Balance / Rewards Pill */}
                <Link
                  to="/wallet"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-transparent border border-primary/20 hover:border-primary/40 transition group"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                      <Coins className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">{t("common.walletBalance")}</p>
                      <p className="text-xs font-black text-foreground mt-0.5">
                        {profile?.points ? t("common.pointsCount", { count: profile.points.toLocaleString() }) : t("common.zeroPoints")}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{t("common.publicProfile")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/vault" className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer">
                    <Archive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{t("dashboard.vaultMemories")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/saved" className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer">
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{t("dashboard.savedItems")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings" className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{t("dashboard.accountSettings")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2.5 p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer">
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-medium">{t("nav.signOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <div className={cn(
          "relative z-10 flex flex-1 flex-col w-full min-w-0 pb-28 lg:pb-12",
          (isCinematicCultureRoute || isDashboardHome) && "bg-black"
        )}>
          {!hidePageHeader && (
            <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
              <div className="mb-5 hidden overflow-hidden lg:flex items-start justify-between gap-6 rounded-[1.75rem] border border-border/70 bg-card/85 p-5 shadow-soft">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
                    <roleInfo.icon className="h-3.5 w-3.5" />
                    {roleInfo.label}
                  </div>
                  <h1 className="mt-3 font-sans text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground">{pageMeta.label}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{pageMeta.description}</p>
                </div>
                <div className="min-w-[240px] rounded-2xl border border-border/60 bg-background/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{t("common.activeHub")}</p>
                  <p className="mt-2 text-sm font-semibold text-foreground truncate">{city.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeOrg?.name ? `${activeOrg.name} · ${city.countryName}` : t("dashOrg.hubFollows")}
                  </p>
                </div>
              </div>
            </div>
          )}
          {showCompactDemoBanner ? (
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <DemoExperienceBanner role={safeRole === "admin" ? null : safeRole} variant="compact" />
            </div>
          ) : null}
          <div className={cn(
            "flex min-h-0 w-full min-w-0 flex-1 flex-col",
            !isImmersiveProductRoute && !isDashboardHome && "px-4 sm:px-6 lg:px-8"
          )}>
            {children}
          </div>
        </div>
      </main>

      <DemoCoachmark />

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 text-foreground backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1 px-2 pb-2 pt-2">
          {currentMobileNav.map((item) => {
            const isActive = isNavItemActive(location.pathname, item.href, location.search);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]",
                  item.accent
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : isActive
                      ? "bg-primary/15 text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", item.accent && "fill-current")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>


      {/* Mobile Close Button */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed right-4 top-4 z-50 rounded-xl bg-card/90 p-2 shadow-soft lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default DashboardLayout;
