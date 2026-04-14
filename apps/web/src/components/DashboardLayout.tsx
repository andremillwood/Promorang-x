import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/promorang-logo.png";
import {
  Home,
  Calendar,
  Users,
  Gift,
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

type UserRole = "participant" | "host" | "brand" | "merchant" | "admin";

interface DashboardLayoutProps {
  children: ReactNode;
  currentRole: UserRole;
}

const roleNavItems: Record<UserRole, { icon: typeof Home; label: string; href: string }[]> = {
  participant: [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Calendar, label: "My Moments", href: "/momentsapp" },
    { icon: Store, label: "Shop", href: "/shop" },
    { icon: Gift, label: "Rewards", href: "/dashboard/rewards" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
  host: [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Sparkles, label: "My Moments", href: "/dashboard/moments" },
    { icon: Store, label: "Catalog", href: "/dashboard/catalog" },
    { icon: Users, label: "Participants", href: "/dashboard/participants" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
  brand: [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Building2, label: "Campaigns", href: "/dashboard/campaigns" },
    { icon: Store, label: "Catalog", href: "/dashboard/catalog" },
    { icon: ShoppingBag, label: "Marketplace", href: "/shop" },
    { icon: Users, label: "Find Hosts", href: "/hosts" },
    { icon: MapPin, label: "Find Venues", href: "/merchants" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Gift, label: "Rewards", href: "/dashboard/rewards" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
  merchant: [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Store, label: "Marketplace", href: "/shop" },
    { icon: MapPin, label: "My Venues", href: "/dashboard/venues" },
    { icon: Calendar, label: "Moments", href: "/dashboard/moments" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
  admin: [
    { icon: Home, label: "Admin Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin?tab=users" },
    { icon: Calendar, label: "Moments", href: "/admin?tab=moments" },
    { icon: BarChart3, label: "Analytics", href: "/admin?tab=analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
};

const roleLabels: Record<UserRole, { icon: typeof Users; label: string; color: string }> = {
  participant: { icon: Users, label: "Participant", color: "bg-blue-500" },
  host: { icon: Sparkles, label: "Host", color: "bg-primary" },
  brand: { icon: Building2, label: "Brand", color: "bg-accent" },
  merchant: { icon: Store, label: "Merchant", color: "bg-emerald-500" },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeOrg = organizations.find(o => o.id === activeOrgId);

  // Safe role resolution — never crashes, always falls back to participant
  const safeRole = currentRole && roleNavItems[currentRole] ? currentRole : 'participant';
  const navItems = roleNavItems[safeRole] || FALLBACK_NAV;
  const roleInfo = safeRoleInfo(safeRole);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden transition-colors duration-300">
      {/* Ambient Background Washes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none opacity-50 dark:opacity-20" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none opacity-50 dark:opacity-20" />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card/40 backdrop-blur-xl border-r border-border/50 shadow-soft transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full relative z-10">
          {/* Sidebar Header: Logo & Branding */}
          <div className="h-20 flex items-center px-8 border-b border-border/40">
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
              <div className="h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img src={logo} alt="Promorang" className="h-10 w-10 object-contain rounded-xl" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-foreground">Promorang</span>
              <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-primary/10 text-primary border border-primary/20 animate-pulse">v1.1.0-STABILIZED</span>
            </Link>
          </div>

          {/* Navigation Section */}
          <div className="flex-1 px-4 space-y-8 overflow-y-auto pt-4">
            <div>
              <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 mb-4">
                Main Menu
              </p>
              <nav className="space-y-1.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/80 hover:text-primary hover:bg-primary/5 hover:shadow-sm transition-all duration-200 group"
                  >
                    <div className="p-2 rounded-lg bg-transparent text-foreground/70 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Quick Actions / Divider */}
            <div className="pt-2">
              <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 mb-4">
                Workspace
              </p>
              <div className="px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`w-full flex items-center gap-3 p-4 rounded-2xl ${roleInfo.color} text-white shadow-soft relative overflow-hidden group hover:scale-[1.02] transition-transform text-left`}>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-2xl -mr-8 -mt-8" />
                      <div className="relative z-10 h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                        <roleInfo.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="relative z-10 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">Active Role</p>
                        <p className="font-semibold text-sm tracking-tight flex items-center justify-between">
                          {roleInfo.label}
                          {roles.length > 1 && <ChevronDown className="w-3 h-3 ml-1 opacity-70" />}
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  {roles.length > 1 && (
                    <DropdownMenuContent align="start" className="w-64">
                      <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Switch Context</p>
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
            {currentRole !== "participant" && (
              <div className="pt-2">
                <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 mb-4">
                  Organization
                </p>
                <div className="px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-card/60 border border-border/40 hover:bg-muted/50 transition-colors text-left group">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                          {activeOrg?.avatar_url ? (
                            <img src={activeOrg.avatar_url} alt="" className="h-full w-full object-cover rounded-lg" />
                          ) : (
                            <Building className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground pr-4 relative">
                            {activeOrg?.name || "Personal Workspace"}
                            <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 opacity-50" />
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">
                            {activeOrg?.type || "Personal"}
                          </p>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">My Workspaces</DropdownMenuLabel>
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
                        <span className="font-semibold text-sm">Create New Org</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card - Premium Redesign */}
          <div className="p-6 mt-auto">
            <div className="bg-card/80 backdrop-blur-md rounded-3xl p-5 border border-border/40 shadow-soft-xl dark:border-white/5">
              <Link to="/profile" className="flex items-center gap-3 mb-4 group/profile">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-soft group-hover/profile:rotate-3 transition-transform">
                    {user?.email?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Consistency Rank 3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate group-hover/profile:text-primary transition-colors">
                    {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                  </p>
                  <p className="text-[10px] font-semibold text-foreground/70 uppercase tracking-wider">Level 3 Pioneer</p>
                </div>
              </Link>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center p-2 rounded-xl bg-muted/50">
                  <p className="text-xs font-bold text-foreground">1,240</p>
                  <p className="text-[10px] text-foreground/60 uppercase">Points</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-muted/50">
                  <p className="text-xs font-bold text-foreground">12</p>
                  <p className="text-[10px] text-foreground/60 uppercase">Days</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
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
      <main className="flex-1 lg:pl-72 relative min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="h-10 w-10 rounded-xl bg-muted/80 flex items-center justify-center text-foreground shadow-soft active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
                <img src={logo} alt="" className="h-4 w-auto brightness-0 invert" />
              </div>
              <span className="font-serif text-lg font-bold text-foreground">Promorang</span>
            </div>
            <Link to="/profile" className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xs shadow-soft active:scale-95 transition-transform">
              {(user?.email || "?").charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 md:p-10 lg:p-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>


      {/* Mobile Close Button */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 left-56 z-50 p-2 lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default DashboardLayout;
