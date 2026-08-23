import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/promorang-logo-full.png";
import { HeaderSearchPreview } from "@/components/HeaderSearchPreview";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CityQuickSwitcher } from "@/components/location/CityQuickSwitcher";
import { useI18n } from "@/i18n/I18nContext";
import {
  Menu,
  X,
  ChevronDown,
  Building2,
  Store,
  Users,
  Bell,
  Check,
  Building,
  PlayCircle,
  KeyRound,
  Sparkles,
  Compass,
  Coins,
  Ticket,
  ShieldCheck,
  UserRoundPlus,
  Globe2,
  Heart,
  Bot,
  Radio,
  Layers,
  TrendingUp,
  Gem,
  User as UserIcon,
  WalletCards,
  Archive,
  Bookmark,
  Settings,
  LogOut,
  ArrowUpRight,
  Target,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { t } = useI18n();
  const {
    user,
    signOut,
    activeOrgId,
    agencyClients,
    organizations,
    setActiveOrgId,
    roles,
    activeRole,
    setActiveRole,
    profile,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeOrg = organizations?.find((o) => o.id === activeOrgId);
  const isAgencyMode = roles?.includes("brand") || roles?.includes("merchant") || roles?.includes("admin");

  const isPublicHome = location.pathname === "/";
  const isCinematicPublicPage =
    isPublicHome ||
    location.pathname === "/how-it-works" ||
    location.pathname.startsWith("/economy") ||
    location.pathname === "/growth" ||
    location.pathname === "/pioneers" ||
    location.pathname === "/organizer" ||
    location.pathname === "/live" ||
    location.pathname.startsWith("/radar") ||
    location.pathname.startsWith("/opportunity-radar") ||
    location.pathname.startsWith("/scenes") ||
    location.pathname.startsWith("/communities") ||
    location.pathname.startsWith("/creators") ||
    location.pathname.startsWith("/events");
  const isLeadMagnetPage = location.pathname.startsWith("/free/");
  const hasDarkHeader = isCinematicPublicPage || isLeadMagnetPage;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (paths: string[]) => {
    return paths.some((p) => (p === "/" ? location.pathname === "/" : location.pathname.startsWith(p)));
  };

  const userDisplayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Pioneer";

  const userAvatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-300 ${
        hasDarkHeader
          ? "border-b border-white/[0.08] bg-black/40 text-white shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "border-b border-border/60 bg-background/85 text-foreground shadow-sm"
      }`}
    >
      <div className="container mx-auto px-3 sm:px-6">
        <nav className="flex items-center justify-between h-16 md:h-18 gap-2 md:gap-4">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 active:scale-95 transition-all group focus:outline-none"
          >
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl p-1 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src={logo} alt="Promorang" className="h-full w-full object-contain drop-shadow-md" />
            </div>
            <span className="font-black tracking-tight text-base sm:text-lg hidden xs:inline bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Promorang
            </span>
          </Link>

          {/* Desktop Navigation Links - Humanized Floating Glass Bar */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full p-1.5 border border-white/[0.08] bg-white/[0.03] backdrop-blur-md shadow-inner">
            {/* 1. Explore Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all outline-none cursor-pointer ${
                  isActive(["/discover", "/live", "/scenes", "/creators", "/economy/moments"])
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    : hasDarkHeader
                    ? "text-white/80 hover:text-white hover:bg-white/[0.08]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t("nav.explore")}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 transition-transform duration-200" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-72 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/95 backdrop-blur-xl text-white space-y-1 animate-in fade-in-50 zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span>Explore Experiences</span>
                  <span className="text-primary text-[10px] font-normal">What's happening</span>
                </div>

                <DropdownMenuItem asChild>
                  <Link
                    to="/discover"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Discover Moments</p>
                      <p className="text-[10px] text-white/50 leading-tight">Trending events, meetups & gatherings</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/live"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        Live Now <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      </p>
                      <p className="text-[10px] text-white/50 leading-tight">Real-time activities happening today</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/scenes"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Local Scenes & Spots</p>
                      <p className="text-[10px] text-white/50 leading-tight">Neighborhood hubs & community rooms</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/creators"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Creators & Hosts</p>
                      <p className="text-[10px] text-white/50 leading-tight">Local tastemakers and curators</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 2. Deals & Rewards Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all outline-none cursor-pointer ${
                  isActive(["/rewards", "/shop", "/promoshare", "/wallet"])
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    : hasDarkHeader
                    ? "text-white/80 hover:text-white hover:bg-white/[0.08]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Rewards & Deals</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 transition-transform duration-200" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-72 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/95 backdrop-blur-xl text-white space-y-1 animate-in fade-in-50 zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span>Perks & Member Value</span>
                  <span className="text-amber-400 text-[10px] font-normal">Earn & Save</span>
                </div>

                <DropdownMenuItem asChild>
                  <Link
                    to="/rewards"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Rewards Hub</p>
                      <p className="text-[10px] text-white/50 leading-tight">Claim points, gems & attendance badges</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/shop"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Local Deals & Shop</p>
                      <p className="text-[10px] text-white/50 leading-tight">Exclusive discounts from neighborhood merchants</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/promoshare"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Gem className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Share & Earn (PromoShare)</p>
                      <p className="text-[10px] text-white/50 leading-tight">Get cash rewards for bringing people together</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 3. How It Works (Direct Link) */}
            <Link
              to="/how-it-works"
              className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                isActive(["/how-it-works"])
                  ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                  : hasDarkHeader
                  ? "text-white/80 hover:text-white hover:bg-white/[0.08]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              How It Works
            </Link>

            {/* 4. For Business & Hosts Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all outline-none cursor-pointer ${
                  isActive(["/for-", "/hosting", "/pricing", "/organizer"])
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    : hasDarkHeader
                    ? "text-white/80 hover:text-white hover:bg-white/[0.08]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>For Business & Hosts</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 transition-transform duration-200" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/95 backdrop-blur-xl text-white space-y-1 animate-in fade-in-50 zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
                  <span>Host & Merchant Tools</span>
                  <span className="text-primary text-[10px] font-normal">Grow Foot Traffic</span>
                </div>

                <DropdownMenuItem asChild>
                  <Link
                    to="/hosting"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Host a Moment</p>
                      <p className="text-[10px] text-white/50 leading-tight">Create events, sell passes, verify attendance</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/for-brands"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">For Brands & Merchants</p>
                      <p className="text-[10px] text-white/50 leading-tight">Fund customer actions with zero ad waste</p>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/pricing"
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Pricing & Plans</p>
                      <p className="text-[10px] text-white/50 leading-tight">Flexible tiers for venues, brands & hosts</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* City / Location Quick Switcher */}
            <CityQuickSwitcher className="hidden md:inline-flex" />

            {/* Global Search Command-K Trigger */}
            <HeaderSearchPreview />

            {/* Quick Intent Goal Trigger */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('promorang:open-intent-modal'))}
              title="What do you want to accomplish? (Cmd+K)"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Target className="w-3.5 h-3.5" />
              <span>{t("nav.goals")}</span>
            </button>

            {/* Authenticated User Controls */}
            {user && (
              <>
                {/* Agency Switcher (for agencies/brands) */}
                {isAgencyMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] transition-all outline-none cursor-pointer text-xs font-medium text-white/90">
                      <div className="h-4 w-4 rounded bg-primary/20 flex items-center justify-center text-primary">
                        <Building className="w-2.5 h-2.5" />
                      </div>
                      <span className="max-w-[90px] truncate">{activeOrg?.name || "Account"}</span>
                      <ChevronDown className="w-3 h-3 text-white/40" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11] text-white">
                      <div className="p-2 pb-2 border-b border-white/10">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">My Accounts</p>
                      </div>
                      {organizations?.map((org) => (
                        <DropdownMenuItem
                          key={org.id}
                          onClick={() => {
                            setActiveOrgId(org.id);
                            navigate("/dashboard");
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-white/[0.08] ${
                            activeOrgId === org.id ? "bg-primary/10 font-bold text-primary" : "text-white/80"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Building className="w-3.5 h-3.5" />
                            <span className="text-xs">{org.name}</span>
                          </div>
                          {activeOrgId === org.id && <Check className="w-3.5 h-3.5" />}
                        </DropdownMenuItem>
                      ))}

                      {agencyClients && agencyClients.length > 0 && (
                        <>
                          <div className="p-2 pb-2 mt-2 pt-2 border-t border-white/10">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Agency Clients</p>
                          </div>
                          {agencyClients.map((client) => (
                            <DropdownMenuItem
                              key={client.id}
                              onClick={() => {
                                setActiveOrgId(client.id);
                                if (client.type === "brand") setActiveRole("brand");
                                if (client.type === "merchant") setActiveRole("merchant");
                                navigate("/dashboard");
                              }}
                              className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-white/[0.08] text-white/80"
                            >
                              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                                <Building2 className="w-3 h-3" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs">{client.name}</span>
                                <span className="text-[9px] uppercase tracking-wider text-white/40">{client.type}</span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Activity Pulse Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-white/[0.08] transition-colors outline-none cursor-pointer">
                    <Bell className="w-4 h-4 text-white/70 hover:text-white transition-colors" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-background animate-pulse" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11] text-white">
                    <div className="p-2 pb-2 border-b border-white/10 flex items-center justify-between">
                      <p className="font-bold text-xs uppercase tracking-wider text-white/70">Activity Pulse</p>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono">Live</span>
                    </div>
                    <div className="flex flex-col gap-1 py-1">
                      <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition cursor-pointer">
                        <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">S</span>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs leading-tight text-white">
                            <span className="font-bold">Sarah Drop</span> hyped your moment 🔥
                          </p>
                          <p className="text-[10px] text-white/40">2m ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <Button
                        variant="ghost"
                        onClick={() => navigate("/activity")}
                        className="w-full text-xs text-white/60 hover:text-white h-7 rounded-lg"
                      >
                        View All Activity →
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile Avatar Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] transition-all outline-none cursor-pointer group">
                    <div className="relative h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden ring-1 ring-white/20">
                      {userAvatarUrl ? (
                        <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        userDisplayName.charAt(0).toUpperCase()
                      )}
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background bg-emerald-500" />
                    </div>
                    <span className="text-xs font-bold text-white/90 hidden sm:inline max-w-[100px] truncate">
                      {userDisplayName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/40 group-hover:text-white/80 transition-colors" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11] text-white space-y-1 animate-in fade-in-50 zoom-in-95 duration-150">
                    {/* User Identity Header Card */}
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-black shrink-0 overflow-hidden shadow-inner">
                        {userAvatarUrl ? (
                          <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          userDisplayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold">
                            {activeRole || "Member"}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50 truncate mt-0.5">{user?.email}</p>
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
                          <p className="text-[10px] uppercase font-bold text-white/60 leading-none">Wallet Balance</p>
                          <p className="text-xs font-black text-white mt-0.5">
                            {profile?.points ? `${profile.points.toLocaleString()} Points` : "0 Points"}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>

                    <DropdownMenuSeparator className="bg-white/10" />

                    {/* Core Navigation Items */}
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition cursor-pointer">
                        <Compass className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium">Dashboard & Workspace</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition cursor-pointer">
                        <UserIcon className="w-4 h-4 text-white/60" />
                        <span className="text-xs font-medium">Public Profile</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/vault" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition cursor-pointer">
                        <Archive className="w-4 h-4 text-white/60" />
                        <span className="text-xs font-medium">Vault & Memories</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/saved" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition cursor-pointer">
                        <Bookmark className="w-4 h-4 text-white/60" />
                        <span className="text-xs font-medium">Saved Items</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/settings" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition cursor-pointer">
                        <Settings className="w-4 h-4 text-white/60" />
                        <span className="text-xs font-medium">Account Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-white/10" />

                    {/* Sign Out */}
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-xs font-medium">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Theme Toggle */}
            <div className="shrink-0">
              <ThemeToggle />
            </div>

            <LanguageSelector />

            {/* Public Auth Buttons */}
            {!user && (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/[0.08]"
                >
                  {t("nav.login")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="rounded-full text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98] px-4"
                >
                  {t("nav.getStarted")}
                </Button>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              aria-expanded={mobileMenuOpen}
              className="rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/[0.08] transition lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-white/10 py-5 lg:hidden px-3 bg-[#0a0a0c]/98 backdrop-blur-2xl text-white animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-5 pb-6">
              {/* Logged in User Mobile Quick Profile */}
              {user && (
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-black shrink-0 overflow-hidden">
                      {userAvatarUrl ? (
                        <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        userDisplayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
                      <p className="text-[10px] text-white/50 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30 shrink-0"
                  >
                    {t("nav.dashboard")}
                  </Link>
                </div>
              )}

              {/* Mobile City Quick Switcher */}
              <div className="px-1">
                <CityQuickSwitcher className="w-full justify-between py-2.5 px-4" />
              </div>

              {/* Quick Action Pill Row */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/discover"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-primary/40 text-xs font-bold"
                >
                  <Compass className="w-4 h-4 text-primary" />
                  <span>{t("nav.discoverHub")}</span>
                </Link>
                <Link
                  to="/promoshare"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-primary/10 border border-primary/30 text-xs font-bold text-primary"
                >
                  <Gem className="w-4 h-4" />
                  <span>PromoShare</span>
                </Link>
              </div>

              {/* Section 1: Explore Experiences */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2">Explore Experiences</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    ["/discover", Compass, "Discover Moments"],
                    ["/live", Radio, "Live Now"],
                    ["/scenes", Layers, "Local Scenes"],
                    ["/creators", PlayCircle, "Creators & Hosts"],
                  ].map(([href, Icon, label]) => {
                    const ItemIcon = Icon as typeof Radio;
                    return (
                      <Link
                        key={href as string}
                        to={href as string}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition"
                      >
                        <ItemIcon className="w-3.5 h-3.5 text-primary/80" />
                        <span>{label as string}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Rewards & Deals */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2">Rewards & Deals</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <Link
                    to="/rewards"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rewards Hub</span>
                  </Link>
                  <Link
                    to="/shop"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition"
                  >
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Local Deals</span>
                  </Link>
                </div>
              </div>

              {/* Section 3: For Business & Hosts */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2">For Business & Hosts</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <Link
                    to="/hosting"
                    onClick={closeMobileMenu}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition text-center"
                  >
                    Host a Moment
                  </Link>
                  <Link
                    to="/for-brands"
                    onClick={closeMobileMenu}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition text-center"
                  >
                    Brands & Merchants
                  </Link>
                  <Link
                    to="/how-it-works"
                    onClick={closeMobileMenu}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition text-center"
                  >
                    How It Works
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={closeMobileMenu}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition text-center"
                  >
                    Pricing & Plans
                  </Link>
                </div>
              </div>

              {/* Bottom Auth / User Row */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to="/growth/referrals"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-3.5"
                    >
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
                        <UserRoundPlus className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-white">Invite Friends & Earn</p>
                        <p className="text-[10px] text-white/60">Share your link and earn referral rewards</p>
                      </div>
                    </Link>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        navigate("/dashboard");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl bg-primary text-xs font-bold"
                    >
                      Open Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-xl border-white/10 text-xs text-white/70"
                    >
                      {t("nav.signOut")}
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 rounded-xl border-white/15 text-xs text-white hover:bg-white/10"
                    >
                      {t("nav.login")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        navigate("/auth");
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 rounded-xl bg-primary text-xs font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                    >
                      {t("nav.getStarted")}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
