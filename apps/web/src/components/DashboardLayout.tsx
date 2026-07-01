import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/promorang-logo.png";
import {
  Home,
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
  ShoppingBag,
  Activity,
  Bell,
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
  MessageCircle,
  UserRound,
  Share2,
  Ticket,
  TrendingUp,
  CheckCircle,
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
  { match: "/momentum", label: "Momentum", description: "See how participation, content, rewards, and reputation connect across Promorang." },
  { match: "/pulse", label: "Pulse", description: "What is forming now and where real-world energy is already visible." },
  { match: "/content-drops", label: "Content Drops", description: "Creator content wrapped in attribution, distribution incentives, and contributor rank." },
  { match: "/scenes", label: "Scenes", description: "The rooms, rituals, creators, and places that turn moments into belonging." },
  { match: "/creators", label: "Creators", description: "Discover the people shaping culture and carrying its stories forward." },
  { match: "/discover", label: "Discover", description: "Browse moments, venues, rewards, and content worth acting on." },
  { match: "/create", label: "Create", description: "Launch a moment, mission, or campaign with clear goals and proof." },
  { match: "/vault", label: "Vault", description: "Memories, active perks, and the value that stays with the participant." },
  { match: "/wallet", label: "Wallet", description: "Balances, transactions, and advanced value tools." },
  { match: "/portfolio", label: "Pieces", description: "Your complementary piece positions, related value, and collectible exposure." },
  { match: "/liquidity", label: "Liquidity", description: "Pools, LP positions, and the layer that keeps value moving." },
  { match: "/promoshare", label: "PromoShare", description: "Qualified reward cycles, recurring relevance, and sponsor-funded upside." },
  { match: "/missions", label: "Missions", description: "Proof-bearing actions and linked creator or sponsor prompts." },
  { match: "/activity", label: "Activity", description: "Notifications, updates, and the recent pulse around your account." },
  { match: "/saved", label: "Saved", description: "Things worth returning to without having to rediscover them." },
  { match: "/dashboard/analytics", label: "Analytics", description: "Operational reporting for the active hub." },
  { match: "/dashboard/settings", label: "Settings", description: "Personal, role, and hub-level configuration." },
  { match: "/dashboard", label: "Home", description: "Your live moments, proof, rewards, and next moves in one place." },
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
  return pathname === itemPath || pathname.startsWith(itemPath + "/");
};

const roleNavItems: Record<UserRole, NavItem[]> = {
  participant: [
    { icon: Home, label: "Home", href: "/dashboard", group: "primary" },
    { icon: Search, label: "Discover", href: "/discover", group: "primary" },
    { icon: Activity, label: "Live Now", href: "/pulse", group: "primary" },
    { icon: Users, label: "Scenes", href: "/scenes", group: "primary" },
    { icon: UserRound, label: "Creators", href: "/creators", group: "primary" },
    { icon: MessageCircle, label: "Inbox", href: "/activity", group: "primary" },
    { icon: RadioTower, label: "Content Drops", href: "/content-drops", group: "growth" },
    { icon: TrendingUp, label: "Growth Hub", href: "/growth", group: "growth" },
    { icon: Sparkles, label: "PromoShare", href: "/promoshare", group: "growth" },
    { icon: Share2, label: "Referrals", href: "/growth/referrals", group: "growth" },
    { icon: Layers, label: "Pieces", href: "/portfolio", group: "growth" },
    { icon: PlayCircle, label: "Missions", href: "/missions", group: "growth" },
    { icon: Building2, label: "Organizer Dashboard", href: "/organizer", group: "manage" },
    { icon: Calendar, label: "Events", href: "/organizer/events", group: "manage" },
    { icon: CheckCircle, label: "Check-ins", href: "/organizer/check-ins", group: "manage" },
    { icon: Ticket, label: "Tickets & Sales", href: "/organizer/tickets", group: "manage" },
    { icon: BarChart3, label: "Analytics", href: "/organizer/analytics", group: "manage" },
    { icon: WalletCards, label: "Wallet", href: "/wallet", group: "utility" },
    { icon: Archive, label: "Vault", href: "/vault", group: "utility" },
    { icon: Archive, label: "Saved", href: "/saved", group: "utility" },
    { icon: Bell, label: "Activity", href: "/activity", group: "utility" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
  ],
  creator: [
    { icon: Route, label: "Momentum", href: "/momentum", group: "primary" },
    { icon: Activity, label: "Pulse", href: "/pulse", group: "primary" },
    { icon: RadioTower, label: "Content Drops", href: "/content-drops", group: "primary" },
    { icon: Search, label: "Discover", href: "/discover", group: "primary" },
    { icon: Home, label: "Studio", href: "/dashboard", group: "primary" },
    { icon: Plus, label: "Publish", href: "/dashboard?tab=publish", group: "primary" },
    { icon: Sparkles, label: "Create Mission", href: "/dashboard?tab=missions", group: "primary" },
    { icon: Megaphone, label: "PromoPush", href: "/promopush/creator", group: "primary" },
    { icon: PlayCircle, label: "Missions", href: "/missions", group: "primary" },
    { icon: Archive, label: "Vault", href: "/vault", group: "utility" },
    { icon: WalletCards, label: "Wallet", href: "/wallet", group: "utility" },
    { icon: Layers, label: "Pieces", href: "/portfolio", group: "utility" },
    { icon: BarChart3, label: "Liquidity", href: "/liquidity", group: "utility" },
    { icon: Sparkles, label: "PromoShare", href: "/promoshare", group: "utility" },
    { icon: Film, label: "My Content", href: "/dashboard?tab=content", group: "utility" },
    { icon: Archive, label: "Saved", href: "/saved", group: "utility" },
    { icon: Bell, label: "Activity", href: "/activity", group: "utility" },
    { icon: ShoppingBag, label: "Marketplace", href: "/marketplace", experimental: true, group: "utility" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard?tab=earnings", group: "utility" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
  ],
  host: [
    { icon: Route, label: "Momentum", href: "/momentum", group: "primary" },
    { icon: Activity, label: "Pulse", href: "/pulse", group: "primary" },
    { icon: RadioTower, label: "Content Drops", href: "/content-drops", group: "primary" },
    { icon: Search, label: "Discover", href: "/discover", group: "primary" },
    { icon: Home, label: "Home", href: "/dashboard", group: "primary" },
    { icon: Sparkles, label: "Create", href: "/create/moment", group: "primary" },
    { icon: Megaphone, label: "PromoPush", href: "/promopush", group: "primary" },
    { icon: PlayCircle, label: "Missions", href: "/missions", group: "primary" },
    { icon: Archive, label: "Vault", href: "/vault", group: "utility" },
    { icon: WalletCards, label: "Wallet", href: "/wallet", group: "utility" },
    { icon: Layers, label: "Pieces", href: "/portfolio", group: "utility" },
    { icon: BarChart3, label: "Liquidity", href: "/liquidity", group: "utility" },
    { icon: Sparkles, label: "PromoShare", href: "/promoshare", group: "utility" },
    { icon: Archive, label: "Saved", href: "/saved", group: "utility" },
    { icon: Bell, label: "Activity", href: "/activity", group: "utility" },
    { icon: ShoppingBag, label: "Marketplace", href: "/marketplace", experimental: true, group: "utility" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", group: "utility" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
  ],
  brand: [
    { icon: Route, label: "Momentum", href: "/momentum", group: "primary" },
    { icon: Home, label: "Home", href: "/dashboard", group: "primary" },
    { icon: RadioTower, label: "Content Drops", href: "/content-drops", group: "primary" },
    { icon: Sparkles, label: "Create Campaign", href: "/create/campaign", group: "primary" },
    { icon: Megaphone, label: "PromoPush", href: "/promopush", group: "primary" },
    { icon: Building2, label: "Campaigns", href: "/dashboard/campaigns", group: "primary" },
    { icon: Archive, label: "Vault", href: "/vault", group: "utility" },
    { icon: WalletCards, label: "Wallet", href: "/wallet", group: "utility" },
    { icon: Layers, label: "Pieces", href: "/portfolio", group: "utility" },
    { icon: BarChart3, label: "Liquidity", href: "/liquidity", group: "utility" },
    { icon: Sparkles, label: "PromoShare", href: "/promoshare", group: "utility" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", group: "utility" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
  ],
  merchant: [
    { icon: Route, label: "Momentum", href: "/momentum", group: "primary" },
    { icon: Home, label: "Home", href: "/dashboard", group: "primary" },
    { icon: RadioTower, label: "Content Drops", href: "/content-drops", group: "primary" },
    { icon: Search, label: "Discover", href: "/discover", group: "primary" },
    { icon: Sparkles, label: "Create Moment", href: "/create/moment", group: "primary" },
    { icon: MapPin, label: "Venues", href: "/dashboard/venues", group: "primary" },
    { icon: WalletCards, label: "Wallet", href: "/wallet", group: "utility" },
    { icon: Layers, label: "Pieces", href: "/portfolio", group: "utility" },
    { icon: BarChart3, label: "Liquidity", href: "/liquidity", group: "utility" },
    { icon: Sparkles, label: "PromoShare", href: "/promoshare", group: "utility" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", group: "utility" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
  ],
  agency: [
    { icon: Route, label: "Momentum", href: "/momentum", group: "primary" },
    { icon: Home, label: "Home", href: "/dashboard", group: "primary" },
    { icon: RadioTower, label: "Content Drops", href: "/content-drops", group: "primary" },
    { icon: Briefcase, label: "Clients", href: "/dashboard", group: "primary" },
    { icon: Sparkles, label: "Create Campaign", href: "/create/campaign", group: "primary" },
    { icon: Megaphone, label: "PromoPush", href: "/promopush", group: "primary" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", group: "utility" },
    { icon: Sparkles, label: "PromoShare", href: "/promoshare", group: "utility" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
  ],
  promoter: [
    { icon: Route, label: "Momentum", href: "/momentum", group: "primary" },
    { icon: Megaphone, label: "PromoPush", href: "/promopush/promoter", group: "primary" },
    { icon: RadioTower, label: "Content Drops", href: "/content-drops", group: "primary" },
    { icon: Search, label: "Discover", href: "/discover", group: "primary" },
    { icon: Home, label: "Home", href: "/dashboard", group: "primary" },
    { icon: WalletCards, label: "Wallet", href: "/wallet", group: "utility" },
    { icon: Bell, label: "Activity", href: "/activity", group: "utility" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
  ],
  marketing: [
    { icon: Route, label: "Momentum", href: "/momentum", group: "primary" },
    { icon: Megaphone, label: "PromoPush", href: "/promopush", group: "primary" },
    { icon: RadioTower, label: "Content Drops", href: "/content-drops", group: "primary" },
    { icon: Home, label: "Home", href: "/dashboard", group: "primary" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", group: "utility" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
  ],
  admin: [
    { icon: Home, label: "Admin Dashboard", href: "/admin", group: "primary" },
    { icon: Search, label: "Search", href: "/search", group: "primary" },
    { icon: Users, label: "Users", href: "/admin?tab=users", group: "primary" },
    { icon: Calendar, label: "Moments", href: "/admin?tab=moments", group: "primary" },
    { icon: BarChart3, label: "Analytics", href: "/admin?tab=analytics", group: "utility" },
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
  const { user, roles, organizations, activeOrgId, setActiveOrgId, agencyClients, setActiveRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeOrg = organizations.find(o => o.id === activeOrgId);

  // Safe role resolution — never crashes, always falls back to participant
  const safeRole = currentRole && roleNavItems[currentRole] ? currentRole : 'participant';
  const navItems = filterReleaseNav(roleNavItems[safeRole] || FALLBACK_NAV);
  const primaryNavItems = navItems.filter((item) => !item.group || item.group === "primary");
  const growthNavItems = navItems.filter((item) => item.group === "growth");
  const manageNavItems = navItems.filter((item) => item.group === "manage");
  const utilityNavItems = navItems.filter((item) => item.group === "utility");
  const roleInfo = safeRoleInfo(safeRole);
  const immersiveProductRoutes = ["/momentum", "/content-drops", "/scenes", "/creators"];
  const isImmersiveProductRoute = immersiveProductRoutes.some((path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  const isCinematicCultureRoute = ["/scenes", "/creators"].some((path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
  );
  const hidePageHeader = isImmersiveProductRoute || location.pathname === "/dashboard";
  const showCompactDemoBanner = location.pathname !== "/dashboard" && !isImmersiveProductRoute;
  const pageMeta = getPageMeta(location.pathname, location.search, safeRole);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const mobileNavItems: Record<UserRole, (NavItem & { accent?: boolean })[]> = {
    participant: [
      { icon: Home, label: "Home", href: "/dashboard" },
      { icon: Activity, label: "Pulse", href: "/pulse" },
      { icon: Search, label: "Discover", href: "/discover", accent: true },
      { icon: Archive, label: "Vault", href: "/vault" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    creator: [
      { icon: Home, label: "Studio", href: "/dashboard" },
      { icon: PlayCircle, label: "Missions", href: "/missions" },
      { icon: Plus, label: "Publish", href: "/dashboard?tab=publish", accent: true },
      { icon: Megaphone, label: "PromoPush", href: "/promopush/creator" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    host: [
      { icon: Home, label: "Home", href: "/dashboard" },
      { icon: Activity, label: "Pulse", href: "/pulse" },
      { icon: Plus, label: "Create", href: "/create/moment", accent: true },
      { icon: Archive, label: "Vault", href: "/vault" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    brand: [
      { icon: Home, label: "Home", href: "/dashboard" },
      { icon: Plus, label: "Create", href: "/create/campaign", accent: true },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    merchant: [
      { icon: Home, label: "Home", href: "/dashboard" },
      { icon: Plus, label: "Add", href: "/dashboard/venues/add", accent: true },
      { icon: MapPin, label: "Venues", href: "/dashboard/venues" },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    agency: [
      { icon: Home, label: "Home", href: "/dashboard" },
      { icon: Briefcase, label: "Clients", href: "/dashboard", accent: true },
      { icon: Sparkles, label: "Create", href: "/create/campaign" },
      { icon: BarChart3, label: "Stats", href: "/dashboard/analytics" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    promoter: [
      { icon: Megaphone, label: "PromoPush", href: "/promopush/promoter", accent: true },
      { icon: Search, label: "Discover", href: "/discover" },
      { icon: Home, label: "Home", href: "/dashboard" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    marketing: [
      { icon: Megaphone, label: "PromoPush", href: "/promopush", accent: true },
      { icon: Home, label: "Home", href: "/dashboard" },
      { icon: BarChart3, label: "Stats", href: "/dashboard/analytics" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
    admin: [
      { icon: Home, label: "Admin", href: "/admin" },
      { icon: Users, label: "Users", href: "/admin?tab=users" },
      { icon: Calendar, label: "Moments", href: "/admin?tab=moments", accent: true },
      { icon: BarChart3, label: "Stats", href: "/admin?tab=overview" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
  };

  const currentMobileNav = filterReleaseNav(mobileNavItems[safeRole]);

  return (
    <div className="app-shell-mobile relative flex min-h-screen min-h-dvh overflow-x-clip bg-background transition-colors duration-300">
      {/* Ambient Background Washes */}
      <div className="pointer-events-none absolute right-0 top-0 h-[280px] w-[280px] rounded-full bg-primary/12 blur-[90px] opacity-60 sm:h-[500px] sm:w-[500px] sm:-mr-64 sm:-mt-64 sm:blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[240px] w-[240px] rounded-full bg-amber-500/10 blur-[80px] opacity-50 sm:h-[400px] sm:w-[400px] sm:-mb-48 sm:-ml-48 sm:blur-[100px]" />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-black/92 text-white shadow-[24px_0_80px_rgba(0,0,0,0.35)] backdrop-blur-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full relative z-10">
          {/* Sidebar Header: Logo & Branding */}
          <div className="h-20 flex items-center px-8 border-b border-white/10">
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
              <div className="h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img src={logo} alt="Promorang" className="h-10 w-10 object-contain rounded-xl" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">Promorang</span>
            </Link>
          </div>

          {/* Navigation Section */}
          <div className="dashboard-sidebar-scroll flex-1 space-y-7 overflow-y-auto px-4 pt-4">
            <div>
              <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/38 mb-4">
                {safeRole === "participant" ? "Start Here" : "Explore"}
              </p>
              <nav className="space-y-1.5">
                {primaryNavItems.map((item) => (
                  (() => {
                    const active = isNavItemActive(location.pathname, item.href, location.search);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 group",
                          active
                            ? "border-primary/40 bg-primary/15 text-primary shadow-[inset_3px_0_0_hsl(var(--primary)),0_12px_30px_rgba(0,0,0,0.18)]"
                            : "border-transparent text-white/72 hover:border-white/10 hover:bg-white/[0.07] hover:text-white",
                        )}
                      >
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      active
                        ? "bg-primary/15 text-primary"
                        : "bg-transparent text-white/60 group-hover:bg-white/10 group-hover:text-white",
                    )}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">{item.label}</span>
                      </Link>
                    );
                  })()
                ))}
              </nav>
            </div>

            {safeRole === "participant" && growthNavItems.length > 0 && (
              <div>
                <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">Create & Grow</p>
                <nav className="space-y-1">
                  {growthNavItems.map((item) => {
                    const active = isNavItemActive(location.pathname, item.href, location.search);
                    return (
                      <Link key={item.href} to={item.href} className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                        active ? "bg-primary/15 text-primary" : "text-white/72 hover:bg-white/[0.07] hover:text-white",
                      )}>
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            )}

            {safeRole === "participant" && manageNavItems.length > 0 && (
              <div>
                <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">Manage</p>
                <nav className="space-y-1">
                  {manageNavItems.map((item) => {
                    const active = isNavItemActive(location.pathname, item.href, location.search);
                    return (
                      <Link key={item.href} to={item.href} className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                        active ? "bg-primary/15 text-primary" : "text-white/72 hover:bg-white/[0.07] hover:text-white",
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
                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/38 mb-4">
                {safeRole === "participant" ? "Keep Value" : "Value"}
                </p>
                <nav className="space-y-1.5">
                  {utilityNavItems.map((item) => (
                    (() => {
                      const active = isNavItemActive(location.pathname, item.href, location.search);
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 group",
                            active
                              ? "border-primary/40 bg-primary/15 text-primary shadow-[inset_3px_0_0_hsl(var(--primary)),0_12px_30px_rgba(0,0,0,0.18)]"
                              : "border-transparent text-white/72 hover:border-white/10 hover:bg-white/[0.07] hover:text-white",
                          )}
                        >
                      <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        active
                          ? "bg-primary/15 text-primary"
                          : "bg-transparent text-white/60 group-hover:bg-white/10 group-hover:text-white",
                      )}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-sm">{item.label}</span>
                        </Link>
                      );
                    })()
                  ))}
                </nav>
              </div>
            )}

            {/* Quick Actions / Divider */}
            <div className="pt-2">
              <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/38 mb-4">
                Role
              </p>
              <div className="px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                  <button className="w-full min-w-0 flex items-center gap-3 p-4 rounded-2xl border border-primary/35 bg-primary text-white shadow-[0_18px_50px_rgba(255,106,0,0.24)] relative overflow-hidden group hover:scale-[1.02] transition-transform text-left">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-2xl -mr-8 -mt-8" />
                      <div className="relative z-10 h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                        <roleInfo.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="relative z-10 min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">Active Role</p>
                        <p className="flex items-center justify-between gap-2 text-sm font-semibold tracking-tight">
                          {roleInfo.label}
                          {roles.length > 1 && <ChevronDown className="w-3 h-3 ml-1 opacity-70" />}
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  {roles.length > 1 && (
                    <DropdownMenuContent align="start" className="w-64">
                      <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Switch Role</p>
                      {roles.map((role) => {
                        const info = safeRoleInfo(role);
                        const RoleIcon = info.icon;
                        return (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => {
                              setActiveRole(role as UserRole);
                              navigate("/dashboard");
                            }}
                            className="flex items-center gap-3 py-3"
                          >
                            <div className={`w-8 h-8 rounded-lg ${info.color} flex items-center justify-center`}>
                              <RoleIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold capitalize">{role}</span>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </div>
            </div>

            {/* Organization Switcher (Only for non-participant roles) */}
            {safeRole !== "participant" && (
              <div className="pt-2">
                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/38 mb-4">
                  Organization
                </p>
                <div className="px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.06] text-left transition-colors hover:bg-white/[0.1] group">
                        <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                          {activeOrg?.avatar_url ? (
                            <img src={activeOrg.avatar_url} alt="" className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <Building className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-white pr-4 relative">
                            {activeOrg?.name || "My Hub"}
                            <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 opacity-50" />
                          </p>
                          <p className="text-[10px] text-white/45 uppercase tracking-widest leading-tight">
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
                          onClick={() => setActiveOrgId(org.id)}
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

          {/* User Profile Card - Premium Redesign */}
          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-md">
              <Link to="/profile" className="flex items-center gap-3 mb-4 group/profile">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-soft group-hover/profile:rotate-3 transition-transform">
                    {user?.email?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover/profile:text-primary transition-colors">
                    {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">{roleInfo.label} Home</p>
                </div>
              </Link>

              <div className="mb-4 rounded-2xl border border-white/10 bg-black/35 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/42">Your Hub</p>
                <p className="mt-2 text-sm font-semibold text-white truncate">
                  {activeOrg?.name || "My Hub"}
                </p>
                <p className="mt-1 text-xs text-white/52">
                  {safeRole === "participant"
                    ? "Live moments, proof, saved items, rewards, and tools in one place."
                    : "Manage campaigns, reporting, account settings, and the work tied to this role."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Sign Out</span>
                </Button>
              </div>
            </div>
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
      <main className={cn(
        "relative flex min-h-screen min-h-dvh min-w-0 flex-1 flex-col overflow-x-clip lg:pl-72",
        isCinematicCultureRoute && "bg-black"
      )}>
        {/* Mobile Header */}
        <div className="pt-safe lg:hidden sticky top-0 z-30 border-b border-white/10 bg-black/90 p-4 text-white shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-soft active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
                <img src={logo} alt="" className="h-4 w-auto brightness-0 invert" />
              </div>
              <span className="text-lg font-black text-white">Promorang</span>
            </div>
            <Link to="/profile" className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xs shadow-soft active:scale-95 transition-transform">
              {(user?.email || "?").charAt(0).toUpperCase()}
            </Link>
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">{roleInfo.label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{pageMeta.label}</p>
                <p className="mt-1 line-clamp-2 text-xs text-white/58">{pageMeta.description}</p>
              </div>
              <div className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", roleInfo.color)} />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className={cn(
          "relative z-10 flex flex-1 flex-col p-4 pb-28 sm:p-6 sm:pb-32 md:p-8 lg:pb-14 lg:pt-8",
          isImmersiveProductRoute ? "lg:px-6 xl:px-8" : "lg:px-10 xl:px-12",
          isCinematicCultureRoute && "bg-black"
        )}>
          <div className={cn("mx-auto flex min-h-full w-full min-w-0 flex-1 flex-col", isImmersiveProductRoute ? "max-w-[1560px]" : "max-w-7xl")}>
            {!hidePageHeader && (
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
                <p className="mt-2 text-sm font-semibold text-foreground truncate">{activeOrg?.name || "My Hub"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {safeRole === "participant" ? "Your live moments, proof, and rewards stay together here." : "Your work, results, and account tools stay together here."}
                </p>
              </div>
            </div>
            )}
            {showCompactDemoBanner ? (
              <DemoExperienceBanner role={safeRole === "admin" ? null : safeRole} variant="compact" />
            ) : null}
            <div className="flex min-h-0 flex-1 flex-col pt-1 lg:pt-0">
              {children}
            </div>
          </div>
        </div>
      </main>

      <DemoCoachmark />

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/92 text-white backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1 px-2 pb-2 pt-2">
          {currentMobileNav.map((item) => {
            const isActive = isNavItemActive(location.pathname, item.href, location.search);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                  item.accent
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : isActive
                      ? "bg-primary/15 text-primary"
                      : "text-white/58 hover:bg-white/10 hover:text-white"
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
