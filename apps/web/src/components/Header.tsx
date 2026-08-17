import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/promorang-logo-full.png";
import { HeaderSearchPreview } from "@/components/HeaderSearchPreview";
import { Menu, X, ChevronDown, Building2, Store, Users, Search, Bell, Check, Building, PlayCircle, KeyRound, Sparkles, Compass, Coins, FileText, Gem, Ticket, ShieldCheck, UserRoundPlus, Globe2, Heart, Bot } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut, activeOrgId, agencyClients, organizations, setActiveOrgId, roles, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeOrg = organizations?.find(o => o.id === activeOrgId);
  const isAgencyMode = roles?.includes('brand') || roles?.includes('merchant') || roles?.includes('admin');
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg transition-colors ${
      hasDarkHeader
        ? "border-b border-white/10 bg-black/25 text-white"
        : "border-b border-border bg-background/80"
    }`}>
      <div className="container mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
            <div className="h-10 md:h-12 w-10 md:w-12 flex items-center justify-center">
              <img
                src={logo}
                alt="Promorang"
                className="h-full w-full object-contain"
              />
            </div>
          </Link>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-5 shrink-0 whitespace-nowrap">
            <Link
              to="/"
              className={`${hasDarkHeader ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition-colors font-medium text-sm whitespace-nowrap shrink-0`}
            >
              Home
            </Link>
            <Link
              to="/discover"
              className={`${hasDarkHeader ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition-colors font-medium text-sm whitespace-nowrap shrink-0`}
            >
              Discover
            </Link>
            <Link
              to="/live"
              className={`${hasDarkHeader ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition-colors font-medium text-sm whitespace-nowrap shrink-0`}
            >
              Live
            </Link>
            <Link
              to="/scenes"
              className={`${hasDarkHeader ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition-colors font-medium text-sm whitespace-nowrap shrink-0`}
            >
              Scenes
            </Link>
            <Link
              to="/creators"
              className={`${hasDarkHeader ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition-colors font-medium text-sm whitespace-nowrap shrink-0`}
            >
              Creators
            </Link>
            <Link
              to="/promoshare"
              className={`${hasDarkHeader ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-foreground"} transition-colors font-medium text-sm whitespace-nowrap shrink-0`}
            >
              PromoShare
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 transition-colors font-medium text-sm outline-none whitespace-nowrap shrink-0 ${hasDarkHeader ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>
                Free tools <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[25rem] p-2 rounded-2xl shadow-elevated border-border/50">
                {[
                  ["/free/scene", Compass, "Find Your Scene", "Find the room and Moment that fits"],
                  ["/free/moment", Users, "Score Your Moment", "Test attendance and repeat potential"],
                  ["/free/demand", Store, "Reveal Nearby Demand", "Find a valuable quiet-hours opening"],
                  ["/free/creator", PlayCircle, "Audit Your Influence", "See what your taste can move"],
                  ["/free/sponsor", Building2, "Build an Activation Brief", "Turn budget into measurable action"],
                ].map(([href, Icon, title, description]) => {
                  const ToolIcon = Icon as typeof Compass;
                  return <DropdownMenuItem asChild key={href as string}><Link to={href as string} className="flex items-center gap-3 rounded-xl p-3 cursor-pointer"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><ToolIcon className="h-4 w-4" /></div><div><p className="text-sm font-bold">{title as string}</p><p className="text-[10px] text-muted-foreground">{description as string}</p></div></Link></DropdownMenuItem>;
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 transition-colors font-medium text-sm outline-none whitespace-nowrap shrink-0 ${hasDarkHeader ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>
                More <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[34rem] p-2 rounded-2xl shadow-elevated border-border/50">
                <DropdownMenuItem asChild>
                  <Link to="/how-it-works" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Overview</p>
                      <p className="text-[10px] text-muted-foreground">How the whole value loop works</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <div className="grid grid-cols-2 gap-1 border-b border-border/60 pb-2">
                  <DropdownMenuItem asChild>
                    <Link to="/pioneers" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Genesis Season</p>
                        <p className="text-[10px] text-muted-foreground">Build your Pioneer record</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/growth" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Growth Hub</p>
                        <p className="text-[10px] text-muted-foreground">Create, promote, earn, and prove outcomes</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/organizer" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Organizer Workspace</p>
                        <p className="text-[10px] text-muted-foreground">Manage moments, check-ins, revenue, and proof</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/campaign-intelligence" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Campaign Intelligence</p>
                        <p className="text-[10px] text-muted-foreground">AI Operator campaign planning & drafts</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <DropdownMenuItem asChild>
                    <Link to="/economy/moments" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Moments</p>
                        <p className="text-[10px] text-muted-foreground">Where participation starts</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/economy/points" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Points</p>
                        <p className="text-[10px] text-muted-foreground">Organic progress and conversion</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/economy/keys" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">PromoKeys</p>
                        <p className="text-[10px] text-muted-foreground">Per-opportunity access</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/economy/master-key" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><ShieldCheck className="w-4 h-4" /></div>
                      <div><p className="font-bold text-sm">Master Key</p><p className="text-[10px] text-muted-foreground">Daily contribution gate</p></div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/portfolio" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Co-Ownership Pieces</p>
                        <p className="text-[10px] text-muted-foreground">Own a stake in viral moments & creator drops</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/economy/content" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Content</p>
                        <p className="text-[10px] text-muted-foreground">Proof and media connected to moments</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/promoshare" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                        <Gem className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">PromoShare Draws</p>
                        <p className="text-[10px] text-muted-foreground">Win prizes & jackpots with action tickets ($1 Gem = $1 USD)</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/economy/network" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Network value</p>
                        <p className="text-[10px] text-muted-foreground">How people make moments stronger</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <>
                <Link
                  to="/vault"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm whitespace-nowrap shrink-0"
                >
                  Vault
                </Link>
                <Link
                  to="/saved"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm whitespace-nowrap shrink-0"
                >
                  Saved
                </Link>
                <Link
                  to="/activity"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm whitespace-nowrap shrink-0"
                >
                  Activity
                </Link>
              </>
            ) : null}

            {/* Stakeholder Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 transition-colors font-medium text-sm outline-none whitespace-nowrap shrink-0 ${hasDarkHeader ? "text-white/75 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}>
                For partners <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-elevated border-border/50">
                <DropdownMenuItem asChild>
                  <Link to="/for-brands" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">For Brands</p>
                      <p className="text-[10px] text-muted-foreground">Fund moments people remember</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/for-creators" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">For Creators</p>
                      <p className="text-[10px] text-muted-foreground">Turn stories into movement</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/for-merchants" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">For Merchants</p>
                      <p className="text-[10px] text-muted-foreground">Welcome verified visits</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/for-communities" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">For Hosts</p>
                      <p className="text-[10px] text-muted-foreground">Build rooms people return to</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/for-enterprise" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600">
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">For Enterprise</p>
                      <p className="text-[10px] text-muted-foreground">Scaled brand activation</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/for-causes" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">For Causes</p>
                      <p className="text-[10px] text-muted-foreground">Action-backed impact</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Command Palette & Instant Search */}
            <HeaderSearchPreview />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <>
                {/* Agency Account Switcher */}
                {isAgencyMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted/50 transition-colors outline-none cursor-pointer">
                      <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <Building className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-bold text-foreground max-w-[100px] truncate">
                        {activeOrg?.name || "Account"}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-elevated border-border/50">
                      <div className="p-2 pb-3 mb-2 border-b border-border/50">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Accounts</p>
                      </div>
                      {organizations?.map((org) => (
                        <DropdownMenuItem 
                          key={org.id}
                          onClick={() => {
                            setActiveOrgId(org.id);
                            navigate('/dashboard');
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${activeOrgId === org.id ? 'bg-primary/5 font-bold text-primary' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <Building className="w-4 h-4" />
                            <span>{org.name}</span>
                          </div>
                          {activeOrgId === org.id && <Check className="w-4 h-4" />}
                        </DropdownMenuItem>
                      ))}
                      
                      {agencyClients && agencyClients.length > 0 && (
                        <>
                          <div className="p-2 pb-2 mt-2 pt-3 border-t border-border/50">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Agency Clients</p>
                          </div>
                          {agencyClients.map((client) => (
                            <DropdownMenuItem 
                              key={client.id}
                              onClick={() => {
                                setActiveOrgId(client.id);
                                if (client.type === 'brand') setActiveRole('brand');
                                if (client.type === 'merchant') setActiveRole('merchant');
                                navigate('/dashboard');
                              }}
                              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                            >
                              <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center text-accent">
                                <Building2 className="w-3 h-3" />
                              </div>
                              <div className="flex flex-col">
                                <span>{client.name}</span>
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{client.type}</span>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Digital Afterparty Notification Bell */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-muted/50 transition-colors outline-none cursor-pointer">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-background animate-pulse"></span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl shadow-elevated border-border/50">
                    <div className="p-2 pb-3 mb-2 border-b border-border/50">
                      <p className="font-bold text-sm">Notifications</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm leading-tight text-foreground"><span className="font-bold">Sarah Drop</span> and 5 others hyped your photo from <span className="font-semibold text-primary cursor-pointer hover:underline">The Art Show</span> 🔥</p>
                          <p className="text-xs text-muted-foreground">2m ago</p>
                        </div>
                      </div>
                      {isAgencyMode && (
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0 text-accent">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm leading-tight text-foreground"><span className="font-bold">Nike</span> posted a new sponsored bounty in your area.</p>
                            <p className="text-xs text-muted-foreground">1h ago</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="pt-2 mt-2 border-t border-border/50">
                      <Button variant="ghost" className="w-full text-xs text-muted-foreground h-8">View All Activity</Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="hidden sm:flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/growth/referrals")}
                    className="gap-2 font-bold text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <UserRoundPlus className="h-4 w-4" />
                    Invite friends
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </Button>
                </div>
              </>
            )}

            <ThemeToggle />

            {!user && (
              <div className="hidden sm:flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Log in
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="rounded-xl p-2 transition-colors hover:bg-muted lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border py-4 lg:hidden px-4">
            <div className="flex flex-col gap-6 pb-2">
              
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Explore</h4>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/explore/moments"
                    className="text-foreground transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    Moments
                  </Link>
                  <Link
                    to="/discover"
                    className="text-foreground transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    Discover
                  </Link>
                  <Link
                    to="/promoshare"
                    className="text-foreground transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    PromoShare
                  </Link>
                  <Link
                    to="/pricing"
                    className="text-foreground transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    Pricing
                  </Link>
                  {user ? (
                    <Link
                      to="/vault"
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                      onClick={closeMobileMenu}
                    >
                      Vault
                    </Link>
                  ) : null}
                  {user ? (
                    <>
                      <Link
                        to="/saved"
                        className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                        onClick={closeMobileMenu}
                      >
                        Saved
                      </Link>
                      <Link
                        to="/activity"
                        className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                        onClick={closeMobileMenu}
                      >
                        Activity
                      </Link>
                    </>
                  ) : null}
                  <Link
                    to="/search"
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                    onClick={closeMobileMenu}
                  >
                    Search
                  </Link>
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Start with a free result</h4>
                <div className="grid gap-2">
                  {[["/free/scene","Find Your Scene"],["/free/moment","Score Your Moment"],["/free/demand","Reveal Nearby Demand"],["/free/creator","Audit Your Influence"],["/free/sponsor","Build an Activation Brief"]].map(([href,label])=><Link key={href} to={href} className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>{label}</Link>)}
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">How it works</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/how-it-works" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    Overview
                  </Link>
                  <Link to="/economy/moments" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    Moments
                  </Link>
                  <Link to="/economy/points" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    Points
                  </Link>
                  <Link to="/economy/keys" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    PromoKeys
                  </Link>
                  <Link to="/economy/master-key" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>Master Key</Link>
                  <Link to="/economy/pieces" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    Pieces
                  </Link>
                  <Link to="/economy/content" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    Content
                  </Link>
                  <Link to="/economy/promoshare-gems" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    Tickets & Gems
                  </Link>
                  <Link to="/economy/network" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    Network value
                  </Link>
                </div>
              </div>

              <div className="h-px bg-border/50" />

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Partner with us</h4>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/for-brands"
                    className="text-foreground transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    For Brands
                  </Link>
                  <Link
                    to="/for-creators"
                    className="text-foreground transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    For Creators
                  </Link>
                  <Link
                    to="/for-merchants"
                    className="text-foreground transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    For Merchants
                  </Link>
                  <Link
                    to="/for-communities"
                    className="text-foreground transition-colors font-medium"
                    onClick={closeMobileMenu}
                  >
                    For Hosts
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to="/growth/referrals"
                      onClick={closeMobileMenu}
                      className="group mb-2 flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-4"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                        <UserRoundPlus className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-black text-foreground">Invite friends</span>
                        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">Share your link and track who joins through you.</span>
                      </span>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}>
                      My Moments
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}>
                      Log in
                    </Button>
                    <Button variant="default" size="sm" onClick={() => { navigate("/auth"); setMobileMenuOpen(false); }}>
                      Get Started
                    </Button>
                  </>
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
