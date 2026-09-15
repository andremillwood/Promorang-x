import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Calendar,
  ChevronDown,
  CircleHelp,
  Coins,
  Home,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { stakeholderMobileNav, stakeholderNavItems, type StakeholderNavItem } from "@/config/stakeholderNav";
import { ADMIN_AFTRHRS_TAB_HREF } from "@/lib/admin-surface";
import { cn } from "@/lib/utils";
import logo from "@/assets/promorang-logo.png";
import { HeaderSearchPreview } from "@/components/HeaderSearchPreview";
import { CityQuickSwitcher } from "@/components/location/CityQuickSwitcher";
import { LanguageSelector } from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { firstGivenName, getStakeholderLens } from "@promorang/shared";

type UserRole = "participant" | "creator" | "host" | "brand" | "merchant" | "agency" | "promoter" | "marketing" | "admin";

const ADMIN_NAV: StakeholderNavItem[] = [
  { icon: Home, label: "Home", href: "/admin?tab=command", group: "primary" },
  { icon: Users, label: "People", href: "/admin?tab=users", group: "primary" },
  { icon: Calendar, label: "Operations", href: "/admin?tab=moments", group: "primary" },
  { icon: BarChart3, label: "Reports", href: "/admin?tab=overview", group: "primary" },
  { icon: Activity, label: "AftrHrs", href: ADMIN_AFTRHRS_TAB_HREF, group: "manage" },
  { icon: Coins, label: "Wallet", href: "/wallet", group: "utility" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", group: "utility" },
];

const ROLE_LABELS: Record<UserRole, string> = {
  participant: "Personal",
  creator: "Creator",
  host: "Host",
  merchant: "Merchant",
  brand: "Brand",
  agency: "Agency",
  promoter: "Promoter",
  marketing: "Marketing",
  admin: "Admin",
};

const roleDataValue = (role: UserRole) => {
  if (role === "promoter" || role === "marketing") return "participant";
  return role;
};

const isActive = (pathname: string, search: string, href: string) => {
  const [path, query] = href.split("?");
  if (query) {
    const expected = new URLSearchParams(query);
    const actual = new URLSearchParams(search);
    return pathname === path && [...expected.entries()].every(([key, value]) => actual.get(key) === value);
  }
  if (path === "/dashboard") return pathname === "/dashboard" || pathname === "/home";
  return pathname === path || pathname.startsWith(`${path}/`);
};

function WorkspaceMenu({ role }: { role: UserRole }) {
  const { roles, organizations, activeOrgId, setActiveOrgId, agencyClients, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const activeOrg = organizations.find((org) => org.id === activeOrgId);
  const currentLabel = activeOrg?.name || ROLE_LABELS[role];

  const switchRole = (nextRole: UserRole) => {
    setActiveRole(nextRole);
    navigate(nextRole === "admin" ? "/admin?tab=command" : "/dashboard");
  };

  const switchOrg = (org: any) => {
    setActiveOrgId(org.id);
    navigate("/dashboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="pr-v2-focusable flex min-h-11 w-full items-center gap-3 rounded-[var(--pr-v2-radius-control)] border border-[hsl(var(--pr-v2-stroke-strong))] bg-[hsl(var(--pr-v2-surface-2))] px-3 text-left text-[hsl(var(--pr-v2-text-1))]"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[hsl(var(--pr-v2-active-role)/0.14)] text-[hsl(var(--pr-v2-active-role))]">
            {ROLE_LABELS[role].slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{currentLabel}</span>
            <span className="block truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--pr-v2-text-3))]">
              {ROLE_LABELS[role]} workspace
            </span>
          </span>
          <ChevronDown className="h-4 w-4 text-[hsl(var(--pr-v2-text-3))]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {roles.map((availableRole) => (
          <DropdownMenuItem
            key={availableRole}
            onClick={() => switchRole(availableRole as UserRole)}
            className="flex min-h-11 items-center justify-between"
          >
            <span>{ROLE_LABELS[availableRole as UserRole] || availableRole}</span>
            {availableRole === role ? <span className="text-xs text-primary">Current</span> : null}
          </DropdownMenuItem>
        ))}
        {organizations.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem key={org.id} onClick={() => switchOrg(org)} className="min-h-11">
                <span className="min-w-0">
                  <span className="block truncate">{org.name}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{org.type}</span>
                </span>
                {activeOrgId === org.id ? <span className="ml-auto text-xs text-primary">Active</span> : null}
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
        {agencyClients.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Agency clients</DropdownMenuLabel>
            {agencyClients.map((client) => (
              <DropdownMenuItem key={client.id} onClick={() => switchOrg(client)} className="min-h-11">
                <span className="min-w-0">
                  <span className="block truncate">{client.name}</span>
                  <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Manage as {client.type}</span>
                </span>
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavigationList({ items, pathname, search, onNavigate }: { items: StakeholderNavItem[]; pathname: string; search: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Workspace navigation" className="space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, search, item.href);
        return (
          <Link
            key={`${item.group || "nav"}-${item.href}`}
            to={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "pr-v2-focusable flex min-h-11 items-center gap-3 rounded-[var(--pr-v2-radius-control)] px-3 text-sm font-semibold transition-colors",
              active
                ? "bg-[hsl(var(--pr-v2-active-role)/0.12)] text-[hsl(var(--pr-v2-text-1))]"
                : "text-[hsl(var(--pr-v2-text-2))] hover:bg-[hsl(var(--pr-v2-surface-2))] hover:text-[hsl(var(--pr-v2-text-1))]",
            )}
          >
            <item.icon className={cn("h-4 w-4 shrink-0", active && "text-[hsl(var(--pr-v2-active-role))]")} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function PromorangAppShell({ children, currentRole }: { children: ReactNode; currentRole: UserRole }) {
  const { user, profile, signOut } = useAuth();
  const { city } = useMarket();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = currentRole || "participant";
  const lens = getStakeholderLens(role);
  const navItems = role === "admin" ? ADMIN_NAV : stakeholderNavItems(role);
  const primaryItems = navItems.filter((item) => item.group === "primary" || !item.group);
  const secondaryItems = navItems.filter((item) => item.group !== "primary" && item.group);
  const mobileItems = (role === "admin" ? ADMIN_NAV.filter((item) => item.group === "primary") : stakeholderMobileNav(role)).slice(0, 5);
  const name = firstGivenName({
    displayName: profile?.display_name,
    fullName: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name,
    username: profile?.username,
    email: user?.email,
    fallback: "You",
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="pr-v2-role-accent min-h-dvh bg-[hsl(var(--pr-v2-canvas))] text-[hsl(var(--pr-v2-text-1))]" data-role={roleDataValue(role)}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black">
        Skip to main content
      </a>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[hsl(var(--pr-v2-stroke-soft))] bg-[hsl(var(--pr-v2-surface-1))] transition-transform lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--pr-v2-stroke-soft))] px-5">
            <Link to="/dashboard" className="pr-v2-focusable flex items-center gap-3 rounded-lg">
              <img src={logo} alt="Promorang" className="h-8 w-8 rounded-lg object-contain" />
              <span className="text-base font-bold tracking-[-0.025em]">PROMORANG</span>
            </Link>
          </div>

          <div className="border-b border-[hsl(var(--pr-v2-stroke-soft))] p-4">
            <WorkspaceMenu role={role} />
            <p className="mt-3 px-1 text-xs leading-5 text-[hsl(var(--pr-v2-text-3))]">{lens.promise}</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--pr-v2-text-3))]">Your work</p>
            <NavigationList items={primaryItems} pathname={location.pathname} search={location.search} onNavigate={() => setMobileOpen(false)} />
            {secondaryItems.length ? (
              <>
                <div className="my-4 h-px bg-[hsl(var(--pr-v2-stroke-soft))]" />
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[hsl(var(--pr-v2-text-3))]">More</p>
                <NavigationList items={secondaryItems} pathname={location.pathname} search={location.search} onNavigate={() => setMobileOpen(false)} />
              </>
            ) : null}
            <div className="my-4 h-px bg-[hsl(var(--pr-v2-stroke-soft))]" />
            <Link to="/how-it-works" className="pr-v2-focusable flex min-h-11 items-center gap-3 rounded-[var(--pr-v2-radius-control)] px-3 text-sm font-semibold text-[hsl(var(--pr-v2-text-2))] hover:bg-[hsl(var(--pr-v2-surface-2))] hover:text-[hsl(var(--pr-v2-text-1))]">
              <CircleHelp className="h-4 w-4" />
              How PROMORANG works
            </Link>
          </div>

          <div className="border-t border-[hsl(var(--pr-v2-stroke-soft))] p-4">
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[hsl(var(--pr-v2-surface-3))] text-xs font-bold">
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-[hsl(var(--pr-v2-text-3))]">{user?.email}</p>
              </div>
            </div>
            <button type="button" onClick={() => void handleSignOut()} className="pr-v2-focusable flex min-h-11 w-full items-center gap-3 rounded-[var(--pr-v2-radius-control)] px-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/10">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen ? <button type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/65 lg:hidden" /> : null}

      <div className="min-h-dvh lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[hsl(var(--pr-v2-stroke-soft))] bg-[hsl(var(--pr-v2-canvas)/0.9)] px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button type="button" aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="pr-v2-focusable grid size-10 place-items-center rounded-lg border border-[hsl(var(--pr-v2-stroke-soft))] lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden min-w-0 items-center gap-3 lg:flex">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[hsl(var(--pr-v2-active-role))]">{ROLE_LABELS[role]}</span>
            <span className="text-[hsl(var(--pr-v2-text-3))]">/</span>
            <CityQuickSwitcher tone="app" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <HeaderSearchPreview />
            <div className="hidden sm:block"><LanguageSelector tone="app" /></div>
            <div className="hidden sm:block"><ThemeToggle tone="app" /></div>
            <Link to="/profile" className="pr-v2-focusable grid size-10 place-items-center overflow-hidden rounded-full border border-[hsl(var(--pr-v2-stroke-strong))] bg-[hsl(var(--pr-v2-surface-2))] text-xs font-bold">
              {profile?.avatar_url || user?.user_metadata?.avatar_url ? <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>

        <main id="main-content" className="min-h-[calc(100dvh-4rem)] min-w-0 pb-24 lg:pb-0">
          {children}
        </main>
      </div>

      <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-[hsl(var(--pr-v2-stroke-soft))] bg-[hsl(var(--pr-v2-surface-1)/0.96)] px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {mobileItems.map((item) => {
            const active = isActive(location.pathname, location.search, item.href);
            return (
              <Link key={item.href} to={item.href} aria-current={active ? "page" : undefined} className={cn(
                "pr-v2-focusable flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold",
                active ? "bg-[hsl(var(--pr-v2-active-role)/0.12)] text-[hsl(var(--pr-v2-text-1))]" : "text-[hsl(var(--pr-v2-text-3))]",
              )}>
                <item.icon className={cn("h-4 w-4", active && "text-[hsl(var(--pr-v2-active-role))]")} />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {mobileOpen ? <button type="button" aria-label="Close navigation panel" onClick={() => setMobileOpen(false)} className="pr-v2-focusable fixed right-4 top-3 z-[60] grid size-10 place-items-center rounded-lg bg-[hsl(var(--pr-v2-surface-2))] lg:hidden"><X className="h-5 w-5" /></button> : null}
    </div>
  );
}
