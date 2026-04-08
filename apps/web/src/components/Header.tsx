import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/promorang-logo.png";
import { Menu, X, ChevronDown, Building2, Store, Users, MapPin, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
            <div className="h-8 md:h-10 w-8 md:w-10 flex items-center justify-center">
              <img
                src={logo}
                alt="Promorang"
                className="h-full w-full object-contain rounded-xl"
              />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">Promorang</span>
          </Link>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/discover"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            >
              Moments
            </Link>

            <Link
              to="/strategies"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            >
              Strategies
            </Link>

            <Link
              to="/bounties"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
            >
              Bounties
            </Link>

            {/* Stakeholder Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm outline-none">
                Partnerships <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-elevated border-border/50">
                <DropdownMenuItem asChild>
                  <Link to="/for-brands" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">For Brands</p>
                      <p className="text-[10px] text-muted-foreground">Boost ROI & UGC</p>
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
                      <p className="text-[10px] text-muted-foreground">Drive Foot Traffic</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/for-communities" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">For Communities</p>
                      <p className="text-[10px] text-muted-foreground">Host & Earn</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Discover Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm outline-none">
                Discover <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-elevated border-border/50">
                <DropdownMenuItem asChild>
                  <Link to="/discover" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Browse All</p>
                      <p className="text-[10px] text-muted-foreground">Explore everything</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/discover?filter=nearby" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Near Me</p>
                      <p className="text-[10px] text-muted-foreground">Local experiences</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/discover?filter=trending" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Trending</p>
                      <p className="text-[10px] text-muted-foreground">Popular right now</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <div className="h-px bg-border/50 my-1 mx-2" />
                <DropdownMenuItem asChild>
                  <Link to="/brands" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Brand Directory</p>
                      <p className="text-[10px] text-muted-foreground">Find partners</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/merchants" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Merchant Directory</p>
                      <p className="text-[10px] text-muted-foreground">Discover venues</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/hosts" className="flex items-center gap-3 p-3 rounded-xl cursor-pointer">
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Host Directory</p>
                      <p className="text-[10px] text-muted-foreground">Local organizers</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
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
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                to="/discover"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Discover Moments
              </Link>
              <Link
                to="/strategies"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Strategies
              </Link>
              <Link
                to="/bounties"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm border-l-2 pl-3 border-transparent hover:border-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bounty Board
              </Link>
              <div className="h-px bg-border/50 my-1 ml-3" />
              <Link
                to="/brands"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm border-l-2 pl-3 border-transparent hover:border-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Brands Directory
              </Link>
              <Link
                to="/merchants"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm border-l-2 pl-3 border-transparent hover:border-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Merchants Directory
              </Link>
              <Link
                to="/hosts"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm border-l-2 pl-3 border-transparent hover:border-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Hosts Directory
              </Link>
              <Link
                to="/for-brands"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Brands
              </Link>
              <Link
                to="/for-merchants"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Merchants
              </Link>
              <Link
                to="/for-communities"
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                For Communities
              </Link>

              <div className="pt-4 border-t border-border flex flex-col gap-2">
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}>
                      Dashboard
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
