import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/promorang-logo-full.png";
import { Menu, X, ChevronDown, Building2, Store, Users, Search, Bell, Check, Building, PlayCircle, KeyRound, Sparkles } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeOrg = organizations?.find(o => o.id === activeOrgId);
  const isAgencyMode = roles?.includes('brand') || roles?.includes('merchant') || roles?.includes('admin');

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
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
          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/explore/moments"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            >
              Moments
            </Link>
            <Link
              to="/discover"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            >
              Discover
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm outline-none">
                How it works <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl shadow-elevated border-border/50">
                <DropdownMenuItem asChild>
                  <Link to="/economy/keys" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Keys</p>
                      <p className="text-[10px] text-muted-foreground">How limited access opens</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/economy/pieces" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Pieces</p>
                      <p className="text-[10px] text-muted-foreground">When participation lives on</p>
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
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              to="/promoshare"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            >
              PromoShare
            </Link>
            <Link
              to="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            >
              Pricing
            </Link>
            {user ? (
              <>
                <Link
                  to="/vault"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                  Vault
                </Link>
                <Link
                  to="/saved"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                  Saved
                </Link>
                <Link
                  to="/activity"
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
                >
                  Activity
                </Link>
              </>
            ) : null}

            {/* Stakeholder Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm outline-none">
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
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Icon */}
            <Link
              to="/search"
              className="p-2 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <>
                {/* Agency Workspace Switcher */}
                {isAgencyMode && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted/50 transition-colors outline-none cursor-pointer">
                      <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <Building className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-bold text-foreground max-w-[100px] truncate">
                        {activeOrg?.name || "Workspace"}
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-elevated border-border/50">
                      <div className="p-2 pb-3 mb-2 border-b border-border/50">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Workspaces</p>
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
              className="rounded-xl p-2 transition-colors hover:bg-muted md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border py-4 md:hidden px-4">
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
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">How it works</h4>
                <div className="flex flex-col gap-2">
                  <Link to="/economy/keys" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    Keys
                  </Link>
                  <Link to="/economy/pieces" className="text-foreground transition-colors font-medium" onClick={closeMobileMenu}>
                    Pieces
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
