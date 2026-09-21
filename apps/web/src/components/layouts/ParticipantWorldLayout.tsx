import type { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Archive, BriefcaseBusiness, Check, ChevronDown, Coins, Compass, CreditCard, Gem, Home, KeyRound, LogOut, Settings, Store, UserRound, UserRoundPlus, Vault, WandSparkles } from "lucide-react";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useUserBalance } from "@/hooks/useEconomy";
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
import { firstGivenName } from "@promorang/shared";

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
  const { activeRole, roles, setActiveRole, signOut, profile, user } = useAuth();
  const { data: wallet } = useUserBalance();
  const currentRole = activeRole || "participant";
  const currentRoleLabel = roleLabels[currentRole]?.label || "Participant";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = firstGivenName({
    displayName: profile?.display_name,
    fullName: profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name,
    username: profile?.username,
    email: user?.email,
    fallback: "You",
  });
  const balances = {
    points: Number(wallet?.points ?? profile?.points ?? profile?.promo_points ?? profile?.points_balance ?? 0),
    keys: Number(wallet?.promokeys ?? profile?.keys ?? profile?.keys_balance ?? 0),
    gems: Number(wallet?.gems ?? profile?.gems ?? profile?.gems_balance ?? 0),
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Promorang Today"
          >
            <PromorangMark size={30} />
            <span className="hidden text-lg font-bold tracking-tight sm:inline">Promorang</span>
          </NavLink>

          <nav className="hidden min-w-0 items-center gap-0.5 md:flex lg:gap-1" aria-label="Participant navigation">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 lg:gap-2 lg:px-4",
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
            <NavLink
              to="/wallet"
              className="hidden items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] divide-x divide-white/10 transition-colors hover:border-orange-500/35 hover:bg-white/[0.07] xl:flex"
              aria-label={`${balances.points.toLocaleString()} points, ${balances.keys.toLocaleString()} keys, ${balances.gems.toLocaleString()} gems. Open wallet.`}
            >
              <BalanceItem icon={Coins} value={balances.points} label="Points" iconClass="text-amber-400" />
              <BalanceItem icon={KeyRound} value={balances.keys} label="Keys" iconClass="text-orange-400" />
              <BalanceItem icon={Gem} value={balances.gems} label="Gems" iconClass="text-violet-400" />
            </NavLink>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-stone-200 transition-colors hover:border-orange-500/35 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 2xl:flex"
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

            <LanguageSelector tone="marketing" className="h-10 border-white/10 bg-white/[0.04] text-stone-200 hover:bg-white/[0.07]" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center gap-1 rounded-full p-1 transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" aria-label={`Open account menu for ${displayName}`}>
                  <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-300 text-sm font-black text-black ring-1 ring-white/20">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : (user?.email || "?").charAt(0).toUpperCase()}
                  </span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-stone-500 sm:block" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 border-white/10 bg-[#11110f] p-2 text-stone-100">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-300 font-black text-black">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : (user?.email || "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0"><p className="truncate text-sm font-bold">{displayName}</p><p className="truncate text-xs text-stone-500">{user?.email}</p></div>
                </div>

                <NavLink to="/wallet" className="my-2 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/25 p-2" aria-label="Open wallet">
                  <MenuBalance value={balances.points} label="Points" className="text-amber-400" />
                  <MenuBalance value={balances.keys} label="Keys" className="text-orange-400" />
                  <MenuBalance value={balances.gems} label="Gems" className="text-violet-400" />
                </NavLink>

                <div className="2xl:hidden">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-stone-500">Switch workspace</DropdownMenuLabel>
                  {roles.map((role) => {
                    const roleInfo = roleLabels[role];
                    const RoleIcon = roleInfo?.icon || UserRound;
                    return <DropdownMenuItem key={role} onClick={() => switchRole(role)} className="flex items-center gap-2.5"><RoleIcon className="h-4 w-4 text-orange-400" aria-hidden="true" /><span>{roleInfo?.label || role}</span>{role === currentRole ? <Check className="ml-auto h-4 w-4 text-orange-500" aria-hidden="true" /> : null}</DropdownMenuItem>;
                  })}
                  <DropdownMenuSeparator className="bg-white/10" />
                </div>

                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-stone-500">Your account</DropdownMenuLabel>
                <DropdownMenuItem asChild><NavLink to="/profile" className="flex items-center gap-2.5"><UserRound className="h-4 w-4" />Profile</NavLink></DropdownMenuItem>
                <DropdownMenuItem asChild><NavLink to="/growth/referrals" className="flex items-center gap-2.5"><UserRoundPlus className="h-4 w-4 text-orange-400" /><span><strong className="block font-semibold">Invite &amp; earn</strong><span className="block text-[10px] text-stone-500">Referral links and commissions</span></span></NavLink></DropdownMenuItem>
                <DropdownMenuItem asChild><NavLink to="/vault" className="flex items-center gap-2.5"><Archive className="h-4 w-4" />Vault</NavLink></DropdownMenuItem>
                <DropdownMenuItem asChild><NavLink to="/dashboard/settings" className="flex items-center gap-2.5"><Settings className="h-4 w-4" />Settings</NavLink></DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2.5 text-rose-400 focus:text-rose-300"><LogOut className="h-4 w-4" />Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

function BalanceItem({ icon: Icon, value, label, iconClass }: { icon: typeof Coins; value: number; label: string; iconClass: string }) {
  return <span className="flex items-center gap-1.5 px-2.5 py-2 text-xs" title={label}><Icon className={cn("h-3.5 w-3.5", iconClass)} aria-hidden="true" /><strong className="font-mono text-stone-100">{value.toLocaleString()}</strong><span className="hidden text-stone-500 2xl:inline">{label}</span></span>;
}

function MenuBalance({ value, label, className }: { value: number; label: string; className: string }) {
  return <span className="min-w-0 rounded-lg px-1.5 py-1.5 text-center"><strong className={cn("block truncate font-mono text-sm", className)}>{value.toLocaleString()}</strong><span className="block text-[9px] uppercase tracking-wider text-stone-500">{label}</span></span>;
}
