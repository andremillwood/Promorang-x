import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Check, ChevronDown, Compass, CreditCard, Home, Settings, Store, UserRound, Vault, WandSparkles } from "lucide-react";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { WorkspaceRole } from "@/lib/auth-roles";

type ParticipantWorldLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Today", to: "/dashboard", icon: Home },
  { label: "Discover", to: "/discover", icon: Compass },
  { label: "Card", to: "/card", icon: CreditCard },
  { label: "Vault", to: "/vault", icon: Vault },
];

const discoveryRoots = ["/discover", "/discovery", "/discoveries", "/scenes", "/moments"];

const roleLabels: Partial<Record<WorkspaceRole, { label: string; icon: typeof UserRound }>> = {
  participant: { label: "Participant", icon: UserRound },
  creator: { label: "Creator", icon: WandSparkles },
  host: { label: "Host", icon: Home },
  merchant: { label: "Merchant", icon: Store },
  brand: { label: "Brand", icon: BriefcaseBusiness },
  agency: { label: "Agency", icon: BriefcaseBusiness },
  promoter: { label: "Promoter", icon: WandSparkles },
  marketing: { label: "Marketing", icon: BriefcaseBusiness },
  admin: { label: "Admin", icon: Settings },
};

export function ParticipantWorldLayout({ children }: ParticipantWorldLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { activeRole, roles, setActiveRole } = useAuth();
  const currentRole = activeRole || "participant";
  const currentRoleLabel = roleLabels[currentRole]?.label || "Participant";

  const switchRole = (role: WorkspaceRole) => {
    setActiveRole(role);
    navigate("/dashboard");
  };

  const isActive = (to: string) => {
    if (to === "/dashboard") return pathname === "/dashboard" || pathname === "/home";
    if (to === "/discover") {
      return discoveryRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
    }
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <div className="min-h-screen bg-[#070706] text-stone-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a09]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Promorang Today"
          >
            <PromorangMark size={30} />
            <span className="text-lg font-bold tracking-tight">Promorang</span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Participant navigation">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
                  isActive(to)
                    ? "bg-white/10 text-white"
                    : "text-stone-400 hover:bg-white/5 hover:text-white",
                )}
                aria-current={isActive(to) ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-stone-200 transition-colors hover:border-orange-500/35 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  aria-label={`Switch workspace. Currently ${currentRoleLabel}`}
                >
                  <UserRound className="h-4 w-4 text-orange-400" aria-hidden="true" />
                  <span className="hidden sm:inline">{currentRoleLabel}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
                {roles.map((role) => {
                  const roleInfo = roleLabels[role];
                  const RoleIcon = roleInfo?.icon || UserRound;
                  return (
                    <DropdownMenuItem key={role} onClick={() => switchRole(role)} className="flex items-center gap-3 py-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500/15 text-orange-400">
                        <RoleIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="font-semibold">{roleInfo?.label || role}</span>
                      {role === currentRole ? <Check className="ml-auto h-4 w-4 text-orange-500" aria-hidden="true" /> : null}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <NavLink to="/help" className="text-stone-500">How role access works</NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink
              to="/dashboard/settings"
              className="rounded-full p-2.5 text-stone-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </NavLink>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)] overflow-x-clip pb-20 md:pb-0">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-white/10 bg-[#0a0a09]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden"
        aria-label="Participant navigation"
      >
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500",
              isActive(to) ? "text-orange-400" : "text-stone-500",
            )}
            aria-current={isActive(to) ? "page" : undefined}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
