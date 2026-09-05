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
  CreditCard,
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
import { useMarket } from "@/contexts/MarketContext";

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

const pageLabels: Array<{ match: string; label: string; description: string }> = [
  { match: "/how-it-works", label: "How Promorang Works", description: "The operating map for participation, commerce, value, Pieces, growth, and liquidity." },
  { match: "/momentum", label: "Momentum", description: "See how participation, content, Gems, access, and return connect across Promorang." },
  { match: "/pulse", label: "Pulse", description: "What is forming now and where real-world energy is already visible." },
  { match: "/content-drops", label: "Content Drops", description: "Creator content wrapped in attribution, distribution incentives, and contributor rank." },
  { match: "/scenes", label: "Scenes", description: "The rooms, rituals, creators, and places that turn moments into belonging." },
  { match: "/creators", label: "Creators", description: "Discover the people shaping culture and carrying its stories forward." },
  { match: "/discover", label: "Discover", description: "Name what you want, then answer one live question." },
  { match: "/shop", label: "Shop", description: "Browse verified merchant products, services, offers, and clearly separated sample previews." },
  { match: "/create", label: "Create", description: "Launch a Moment, contribution prompt, or activation with clear human and commercial return." },
  { match: "/vault", label: "Vault", description: "Memories, active perks, and the value that stays with the participant." },
  { match: "/wallet", label: "Wallet", description: "Balances, transactions, and advanced value tools." },
  { match: "/nodes", label: "Save & Win Vaults", description: "100% Protected savings bonuses and weekly/monthly community prize pots." },
  { match: "/portfolio", label: "Pieces", description: "Your complementary piece positions, related value, and collectible exposure." },
  { match: "/liquidity", label: "Liquidity", description: "Pools, LP positions, and the layer that keeps value moving." },
  { match: "/promoshare", label: "PromoShare", description: "Qualified actions, creator movement, Gems-funded value, and sponsor-backed return." },
  { match: "/missions", label: "Missions", description: "Contribution prompts linked to creator, host, or sponsor value." },
  { match: "/activity", label: "Activity", description: "Notifications, updates, and the recent pulse around your account." },
  { match: "/saved", label: "Saved", description: "Things worth returning to without having to rediscover them." },
  { match: "/dashboard/analytics", label: "Analytics", description: "Operational reporting for the active hub." },
  { match: "/dashboard/settings", label: "Settings", description: "Personal, role, and hub-level configuration." },
  { match: "/people", label: "People", description: "The network you built and the people helping you build it." },
  { match: "/give", label: "Give Something", description: "Drop a perk onto your people’s PromoCards." },
  { match: "/earn", label: "Earn", description: "Opportunities you can take and earn from." },
  { match: "/happened", label: "What Happened", description: "What your people actually did." },
  { match: "/card", label: "Card", description: "Hold, use, and recharge PromoCard." },
  { match: "/start", label: "Start a Community", description: "Name a community and give people something immediately." },
  { match: "/stock", label: "Put Something Up", description: "Open inventory so other people can move it." },
  { match: "/dashboard", label: "Today", description: "Your PromoCard, what’s happening, and what happened." },
  { match: "/admin", label: "Admin", description: "Platform-wide operations, moderation, and system controls." },
];

const getPageMeta = (pathname: string, search: string, role: UserRole) => {
  if (pathname === "/dashboard" && role === "creator") {
    const params = new URLSearchParams(search);
    const tab = params.get("tab");
    if (tab === "publish") {
      return {
        label: "Publish",
        description: "Upload creator content, add its preview asset, and prepare it for mission linking.",
      };
    }
    if (tab === "missions") {
      return {
        label: "Create Mission",
        description: "Link a creator story to a real-world moment and define the unlock path.",
      };
    }
    if (tab === "content") {
      return {
        label: "My Content",
        description: "Review the stories you have already published and reuse them in new mission loops.",
      };
    }
  }

  return pageLabels.find((item) => pathname === item.match || pathname.startsWith(item.match + "/")) || pageLabels[pageLabels.length - 2];
};

const isNavItemActive = (pathname: string, href: string, search: string) => {
  const [itemPath, itemQuery] = href.split("?");
  if (itemQuery) {
    return pathname === itemPath && search.includes(itemQuery);
  }
  if (itemPath === "/dashboard") {
    return (pathname === "/dashboard" || pathname === "/home") && !search.includes("view=studio");
  }
  return pathname === itemPath || pathname.startsWith(itemPath + "/");
};

const peopleExperienceNav: NavItem[] = [
  { icon: Home, label: "Today", href: "/dashboard", group: "primary" },
  { icon: Users, label: "People", href: "/people", group: "primary" },
  { icon: Plus, label: "Create", href: "/create", group: "primary" },
  { icon: Sparkles, label: "Earn", href: "/earn", group: "primary" },
  { icon: CreditCard, label: "Card", href: "/card", group: "primary" },
  { icon: Compass, label: "Discover", href: "/discover", group: "primary" },
  { icon: WalletCards, label: "Wallet", href: "/wallet", group: "utility" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
];

const roleNavItems: Record<UserRole, NavItem[]> = {
  participant: peopleExperienceNav,
  creator: [
    ...peopleExperienceNav,
    { icon: Film, label: "Studio", href: "/dashboard?view=studio", group: "manage" },
  ],
  host: [
    ...peopleExperienceNav,
    { icon: CheckCircle, label: "Door Check-Ins", href: "/organizer/check-ins", group: "manage" },
  ],
  merchant: [
    ...peopleExperienceNav,
    { icon: Gift, label: "Put something up", href: "/stock", group: "manage" },
    { icon: Store, label: "Storefront", href: "/dashboard?view=studio&tab=storefront", group: "manage" },
    { icon: QrCode, label: "Redeem", href: "/dashboard?view=studio&tab=redemptions", group: "manage" },
  ],
  brand: [
    ...peopleExperienceNav,
    { icon: Gift, label: "Put something up", href: "/stock", group: "manage" },
    { icon: RadioTower, label: "Campaigns", href: "/dashboard?view=studio", group: "manage" },
  ],
  agency: [
    ...peopleExperienceNav,
    { icon: Briefcase, label: "Clients", href: "/dashboard?view=studio&tab=clients", group: "manage" },
  ],
  promoter: peopleExperienceNav,
  marketing: peopleExperienceNav,
  admin: [
    { icon: Home, label: "Command Center", href: "/admin?tab=command", group: "primary" },
    { icon: Users, label: "Users & KYC", href: "/admin?tab=users", group: "primary" },
    { icon: Calendar, label: "Moments & Venues", href: "/admin?tab=moments", group: "primary" },
    { icon: Coins, label: "Community Vaults", href: "/nodes", group: "primary" },
    { icon: Compass, label: "Discover", href: "/discover", group: "primary" },
    { icon: WalletCards, label: "Platform Wallet", href: "/wallet", group: "utility" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
  ],
};

const roleLabels: Record<UserRole, { icon: typeof Users; label: string; color: string }> = {
  participant: { icon: Users, label: "Participant", color: "bg-blue-500" },
  creator: { icon: PlayCircle, label: "Creator", color: "bg-fuchsia-500" },
  host: { icon: Sparkles, label: "Host", color: "bg-primary" },
  brand: { icon: Building2, label: "Brand", color: "bg-primary" },
  merchant: { icon: Store, label: "Merchant", color: "bg-emerald-500" },
  agency: { icon: Briefcase, label: "Agency", color: "bg-sky-600" },
  promoter: { icon: Megaphone, label: "Promoter", color: "bg-[#FF6A00]" },
  marketing: { icon: Megaphone, label: "Marketing", color: "bg-[#FFC300]" },
  admin: { icon: Settings, label: "Admin", color: "bg-destructive" },
};

// Version: 1.1.0-STABILIZED - Crash-Proof Role Resolution
const FALLBACK_ROLE_INFO = { icon: Users, label: "Participant", color: "bg-blue-500" };
const FALLBACK_NAV = roleNavItems.participant;

const safeRoleInfo = (role: string | undefined | null) => {
  if (!role) return FALLBACK_ROLE_INFO;
  return roleLabels[role as UserRole] || FALLBACK_ROLE_INFO;
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
  const safeRole = currentRole && roleNavItems[currentRole] ? currentRole : 'participant';
  const roleItems = roleNavItems[safeRole] || FALLBACK_NAV;
  const navItems = filterReleaseNav(roleItems);
  const primaryNavItems = navItems.filter((item) => !item.group || item.group === "primary");
  const growthNavItems = navItems.filter((item) => item.group === "growth");
  const manageNavItems = navItems.filter((item) => item.group === "manage");
  const utilityNavItems = navItems.filter((item) => item.group === "utility");
  const roleInfo = safeRoleInfo(safeRole);
  const immersiveProductRoutes = ["/momentum", "/content-drops", "/scenes", "/creators", "/for-you", "/discover", "/search", "/saved", "/profile", "/vault", "/moments", "/events", "/checkin", "/create", "/shop", "/wallet", "/admin", "/organizer", "/people", "/give", "/earn", "/happened", "/card", "/start", "/stock", "/drop"];
  const isImmersiveProductRoute = immersiveProductRoutes.some((path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  const isCinematicCultureRoute = ["/scenes", "/creators", "/for-you", "/saved", "/profile", "/moments", "/events", "/checkin", "/create", "/shop", "/wallet"].some((path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  const isDashboardHome = location.pathname === "/dashboard";
  const hidePageHeader = isImmersiveProductRoute || location.pathname === "/dashboard";
  const showCompactDemoBanner = location.pathname !== "/dashboard" && !isImmersiveProductRoute;
  const pageMeta = getPageMeta(location.pathname, location.search, safeRole);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const peopleMobileNav: (NavItem & { accent?: boolean })[] = [
    { icon: Home, label: "Today", href: "/dashboard" },
    { icon: Users, label: "People", href: "/people" },
    { icon: Plus, label: "Create", href: "/create", accent: true },
    { icon: Sparkles, label: "Earn", href: "/earn" },
    { icon: CreditCard, label: "Card", href: "/card" },
  ];

  const mobileNavItems: Record<UserRole, (NavItem & { accent?: boolean })[]> = {
    participant: peopleMobileNav,
    creator: peopleMobileNav,
    host: peopleMobileNav,
    brand: peopleMobileNav,
    merchant: peopleMobileNav,
    agency: peopleMobileNav,
    promoter: peopleMobileNav,
    marketing: peopleMobileNav,
    admin: [
      { icon: Home, label: "Admin", href: "/admin" },
      { icon: Users, label: "Users", href: "/admin?tab=users" },
      { icon: Calendar, label: "Moments", href: "/admin?tab=moments", accent: true },
      { icon: BarChart3, label: "Stats", href: "/admin?tab=overview" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
  };

  const currentMobileNav = safeRole === "admin"
    ? mobileNavItems.admin
    : peopleMobileNav;

  return (
    <div className="app-shell-mobile relative flex min-h-screen min-h-dvh overflow-x-clip bg-background transition-colors duration-300">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-primary-foreground focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
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
            <Link to="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform group">
              <div className="h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img src={logo} alt="Promorang" className="h-10 w-10 object-contain rounded-xl" />
              </div>
              <span className={cn("text-xl font-black tracking-tight text-foreground", sidebarCollapsed && "lg:hidden")}>Promorang</span>
            </Link>
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              aria-label={sidebarCollapsed ? "Expand dashboard navigation" : "Collapse dashboard navigation"}
              aria-expanded={!sidebarCollapsed}
              title={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
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
                    const info = safeRoleInfo(role);
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
                  Organization
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
                            {activeOrg?.name || "My Hub"}
                            <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 opacity-50" />
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">
                            {activeOrg?.type || "Personal"}
                          </p>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Accounts</DropdownMenuLabel>
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
                          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-primary">Agency Clients</DropdownMenuLabel>
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
                                <span className="text-[10px] opacity-70 uppercase tracking-tighter">Manage as {client.type}</span>
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
                        <span className="font-semibold text-sm">Add Account</span>
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
                  aria-label={`Switch workspace. Currently ${roleInfo.label}`}
                  title={`Working as ${roleInfo.label}`}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/35 bg-primary text-white shadow-[0_12px_30px_rgba(255,106,0,0.22)] transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <roleInfo.icon className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-64">
                <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
                {roles.map((role) => {
                  const info = safeRoleInfo(role);
                  const RoleIcon = info.icon;
                  return <DropdownMenuItem key={role} onClick={() => { setActiveRole(role as UserRole); navigate("/dashboard"); }} className="flex items-center gap-3 py-3"><span className={cn("grid h-8 w-8 place-items-center rounded-lg", info.color)}><RoleIcon className="h-4 w-4 text-white" /></span><span className="font-semibold">{info.label}</span>{role === safeRole ? <CheckCircle className="ml-auto h-4 w-4 text-primary" /> : null}</DropdownMenuItem>;
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="my-1 h-px w-10 shrink-0 bg-border/70" />
            <nav aria-label="Dashboard navigation" className="flex w-full flex-col items-center gap-1.5">
              {[...primaryNavItems, ...growthNavItems, ...manageNavItems, ...utilityNavItems].map((item) => {
                const active = isNavItemActive(location.pathname, item.href, location.search);
                return <Link key={`${item.group || "nav"}-${item.href}`} to={item.href} aria-label={item.label} title={item.label} className={cn("grid h-11 w-12 shrink-0 place-items-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", active ? "border-primary/40 bg-primary/15 text-primary shadow-[inset_3px_0_0_hsl(var(--primary))]" : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/50 hover:text-foreground")}><item.icon className="h-5 w-5" /></Link>;
              })}
              <Link to="/how-it-works" aria-label="How Promorang works" title="How Promorang works" className={cn("grid h-11 w-12 shrink-0 place-items-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", location.pathname === "/how-it-works" ? "border-primary/40 bg-primary/15 text-primary" : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/50 hover:text-foreground")}><CircleHelp className="h-5 w-5" /></Link>
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
                title="Help & Guides"
              >
                <CircleHelp className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className={cn("mt-auto hidden flex-col items-center gap-2 border-t border-border/70 py-4", sidebarCollapsed && "lg:flex")}>
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <Link
              to="/how-it-works"
              aria-label="How Promorang works"
              title="How Promorang works"
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
              aria-label="Open dashboard navigation"
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
                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Notifications</p>
                  <span className="text-[10px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded font-mono">Live</span>
                </div>
                <div className="flex flex-col gap-1 py-1">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-bold">S</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs leading-tight text-foreground">
                        <span className="font-bold">Sarah Drop</span> hyped your moment 🔥
                      </p>
                      <p className="text-[10px] text-muted-foreground">2m ago</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/40">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/activity")}
                    className="w-full text-xs text-muted-foreground hover:text-foreground h-7 rounded-lg"
                  >
                    View All Activity →
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
                      <p className="text-xs font-bold truncate text-foreground">{profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Member"}</p>
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
                      <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Wallet Balance</p>
                      <p className="text-xs font-black text-foreground mt-0.5">
                        {profile?.points ? `${profile.points.toLocaleString()} Points` : "0 Points"}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>

                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Public Profile</span>
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Active hub</p>
                  <p className="mt-2 text-sm font-semibold text-foreground truncate">{city.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {activeOrg?.name ? `${activeOrg.name} · ${city.countryName}` : "Discover, Pulse, and the map follow this city hub."}
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
