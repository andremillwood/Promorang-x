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
  Sparkles,
  Compass,
  Coins,
  UserRoundPlus,
  Radio,
  Layers,
  Gem,
  User as UserIcon,
  Archive,
  Bookmark,
  Settings,
  LogOut,
  ArrowUpRight,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { GlobalTicketBalancePill } from "@/components/promoshare/GlobalTicketBalancePill";
import { PrimaryDestinationNav } from "@/components/nav/PrimaryDestinationNav";
import { isCinematicPublicPath } from "@/lib/marketing-shell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  const isLeadMagnetPage = location.pathname.startsWith("/free/");
  const hasDarkHeader = isCinematicPublicPath(location.pathname) || isLeadMagnetPage;

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
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl transition-all duration-300 ${
        hasDarkHeader
          ? "border-b border-white/[0.08] bg-[#09090b]/80 text-white shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "border-b border-border/60 bg-background/85 text-foreground shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-14 gap-2 sm:h-16 sm:gap-3 lg:gap-6">
          {/* 1. Left Zone: Brand Logo & Desktop Nav */}
          <div className="flex items-center gap-3 xl:gap-6 shrink-0">
            <Link
              to={user ? "/today" : "/"}
              className="flex items-center gap-2 shrink-0 active:scale-95 transition-all group focus:outline-none"
            >
              <div className="h-8 w-8 rounded-xl p-0.5 flex items-center justify-center transition-transform group-hover:scale-105 sm:h-9 sm:w-9">
                <img src={logo} alt="Promorang" className="h-full w-full object-contain drop-shadow-md" />
              </div>
              <span className="font-black tracking-tight text-lg hidden sm:inline bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                Promorang
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            {user ? <PrimaryDestinationNav dark={hasDarkHeader} /> : null}
            <div className={user ? "hidden" : "hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-full px-1.5 py-1 shadow-inner"}>
              {/* 1. Explore Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all outline-none cursor-pointer ${
                    isActive(["/discover", "/live", "/scenes", "/creators", "/economy/moments"])
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  <span>{t("nav.explore")}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 transition-transform duration-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-72 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/98 backdrop-blur-xl text-white space-y-1 animate-in fade-in-50 zoom-in-95 duration-150"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span>{t("nav.exploreExperiences")}</span>
                    <span className="text-primary text-[10px] font-normal">{t("nav.whatsHappening")}</span>
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
                        <p className="text-xs font-bold text-white">{t("nav.discoverMoments")}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.discoverMomentsDesc")}</p>
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
                          {t("nav.liveNow")} <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        </p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.liveNowDesc")}</p>
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
                        <p className="text-xs font-bold text-white">{t("nav.scenesSpots")}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.scenesSpotsDesc")}</p>
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
                        <p className="text-xs font-bold text-white">{t("nav.creatorsHosts")}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.creatorsHostsDesc")}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 2. Deals & Rewards Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all outline-none cursor-pointer ${
                    isActive(["/rewards", "/shop", "/promoshare", "/wallet"])
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t("nav.rewardsDeals")}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 transition-transform duration-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-72 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/98 backdrop-blur-xl text-white space-y-1 animate-in fade-in-50 zoom-in-95 duration-150"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span>{t("nav.perksValue")}</span>
                    <span className="text-amber-400 text-[10px] font-normal">{t("nav.earnSave")}</span>
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
                        <p className="text-xs font-bold text-white">{t("nav.rewardsHub")}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.rewardsHubDesc")}</p>
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
                        <p className="text-xs font-bold text-white">{t("nav.localDealsShop")}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.localDealsShopDesc")}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/nodes"
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.08] transition cursor-pointer"
                    >
                      <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          Save &amp; Win Vaults <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/40">ZERO RISK</span>
                        </p>
                        <p className="text-[10px] text-white/50 leading-tight">100% Protected savings &amp; recurring cash pots</p>
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
                        <p className="text-xs font-bold text-white">{t("nav.shareEarn")}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.shareEarnDesc")}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 3. How It Works Direct Link */}
              <Link
                to="/how-it-works"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive(["/how-it-works"])
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {t("nav.howItWorks")}
              </Link>

              {/* 4. For Business & Hosts Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all outline-none cursor-pointer ${
                    isActive(["/for-", "/hosting", "/pricing", "/organizer"])
                      ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      : "text-white/80 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t("nav.forBusinessHosts")}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 transition-transform duration-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/98 backdrop-blur-xl text-white space-y-1 animate-in fade-in-50 zoom-in-95 duration-150"
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
                    <span>{t("nav.hostMerchantTools")}</span>
                    <span className="text-primary text-[10px] font-normal">{t("nav.growTraffic")}</span>
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
                        <p className="text-xs font-bold text-white">{t("nav.hostMoment")}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.hostMomentDesc")}</p>
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
                        <p className="text-xs font-bold text-white">{t("nav.brandsMerchants")}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.brandsMerchantsDesc")}</p>
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
                        <p className="text-xs font-bold text-white">{t("nav.pricingPlans")}</p>
                        <p className="text-[10px] text-white/50 leading-tight">{t("nav.pricingPlansDesc")}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 2. Center/Right Zone: Search & Location */}
          <div className="hidden items-center gap-2.5 flex-1 justify-end max-w-lg sm:flex">
            {/* City Quick Switcher */}
            <CityQuickSwitcher className="hidden md:inline-flex" />

            {/* Global Search Trigger */}
            <div className="w-full max-w-[200px] sm:max-w-[260px]">
              <HeaderSearchPreview />
            </div>
          </div>

          {/* 3. Right Zone: Utilities & Unified User Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                {/* Global Ticket & Balances Pill */}
                <GlobalTicketBalancePill className="hidden md:inline-flex" />

                {/* Activity Pulse Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative hidden p-2 rounded-full text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors outline-none cursor-pointer sm:flex">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#09090b] animate-pulse" />
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

                {/* Unified User Profile & Workspace Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="hidden items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all outline-none cursor-pointer group sm:flex">
                    <div className="relative h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shadow-sm overflow-hidden ring-1 ring-white/20 shrink-0">
                      {userAvatarUrl ? (
                        <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        userDisplayName.charAt(0).toUpperCase()
                      )}
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background bg-emerald-500" />
                    </div>
                    <span className="text-xs font-semibold text-white/90 hidden sm:inline max-w-[100px] truncate">
                      {userDisplayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80 transition-colors shrink-0" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-2xl border-white/10 bg-[#0e0e11]/98 backdrop-blur-2xl text-white space-y-1.5 animate-in fade-in-50 zoom-in-95 duration-150">
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
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold shrink-0">
                            {activeRole || "Member"}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50 truncate mt-0.5">{user?.email}</p>
                      </div>
                    </div>

                    {/* Integrated Workspace / Accounts Switcher for Agencies & Brands */}
                    {isAgencyMode && (
                      <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                          <span>Workspaces</span>
                          {activeOrg && <span className="text-primary truncate max-w-[120px] font-normal">{activeOrg.name}</span>}
                        </div>
                        {organizations?.map((org) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => {
                              setActiveOrgId(org.id);
                              navigate("/dashboard");
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition cursor-pointer text-xs ${
                              activeOrgId === org.id
                                ? "bg-primary/20 text-primary font-bold"
                                : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Building className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{org.name}</span>
                            </div>
                            {activeOrgId === org.id && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                          </button>
                        ))}

                        {agencyClients && agencyClients.length > 0 && (
                          <div className="pt-1 mt-1 border-t border-white/5 space-y-0.5">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-primary/70 px-1">Agency Clients</p>
                            {agencyClients.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => {
                                  setActiveOrgId(client.id);
                                  if (client.type === "brand") setActiveRole("brand");
                                  if (client.type === "merchant") setActiveRole("merchant");
                                  navigate("/dashboard");
                                }}
                                className="w-full flex items-center justify-between p-1.5 rounded-lg text-left text-white/70 hover:bg-white/[0.06] hover:text-white transition cursor-pointer text-xs"
                              >
                                <span className="truncate">{client.name}</span>
                                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/60">{client.type}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

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
                      <Link to="/portfolio" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-cyan-500/10 text-cyan-300 transition cursor-pointer font-semibold">
                        <Coins className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs">My Pieces Portfolio</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/marketplace" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition cursor-pointer">
                        <Gem className="w-4 h-4 text-violet-400" />
                        <span className="text-xs font-medium">Pieces Marketplace</span>
                      </Link>
                    </DropdownMenuItem>

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
                      <Link to="/hosting" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/[0.08] transition cursor-pointer">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium">Host a Moment</span>
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

                    {/* Preferences Row inside dropdown */}
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-[11px] text-white/50 font-medium">Preferences</span>
                      <div className="flex items-center gap-1.5">
                        <LanguageSelector />
                        <ThemeToggle />
                      </div>
                    </div>

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
            ) : (
              /* Public / Logged Out Controls */
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5">
                  <LanguageSelector />
                  <ThemeToggle />
                </div>
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
              className="rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/[0.08] transition lg:hidden cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-t border-white/10 py-4 lg:hidden px-3 bg-[#0a0a0c]/98 backdrop-blur-2xl text-white animate-in slide-in-from-top-4 duration-200 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
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

              {user ? <PrimaryDestinationNav variant="drawer" dark onNavigate={closeMobileMenu} /> : null}

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
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2">{t("nav.exploreExperiences")}</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    ["/discover", Compass, t("nav.discoverMoments")],
                    ["/live", Radio, t("nav.liveNow")],
                    ["/scenes", Layers, t("nav.scenesSpots")],
                    ["/creators", PlayCircle, t("nav.creatorsHosts")],
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
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2">{t("nav.rewardsDeals")}</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <Link
                    to="/rewards"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t("nav.rewardsHub")}</span>
                  </Link>
                  <Link
                    to="/shop"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition"
                  >
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t("nav.localDealsShop")}</span>
                  </Link>
                  <Link
                    to="/nodes"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium transition col-span-2"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Save &amp; Win Vaults</span>
                  </Link>
                </div>
              </div>

              {/* Section 3: For Business & Hosts */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2">{t("nav.forBusinessHosts")}</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <Link
                    to="/hosting"
                    onClick={closeMobileMenu}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition text-center"
                  >
                    {t("nav.hostMoment")}
                  </Link>
                  <Link
                    to="/for-brands"
                    onClick={closeMobileMenu}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition text-center"
                  >
                    {t("nav.brandsMerchants")}
                  </Link>
                  <Link
                    to="/how-it-works"
                    onClick={closeMobileMenu}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition text-center"
                  >
                    {t("nav.howItWorks")}
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={closeMobileMenu}
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 font-medium transition text-center"
                  >
                    {t("nav.pricingPlans")}
                  </Link>
                </div>
              </div>

              {/* Mobile Preferences (Language + Theme) */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10">
                <span className="text-xs text-white/60 font-medium">Preferences</span>
                <div className="flex items-center gap-2">
                  <LanguageSelector />
                  <ThemeToggle />
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
                      {t("nav.dashboard")}
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
