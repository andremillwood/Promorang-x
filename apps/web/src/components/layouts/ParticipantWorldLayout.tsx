import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Compass, CreditCard, Home, Settings, Vault } from "lucide-react";
import { PromorangMark } from "@/components/promorang/PromorangMark";
import { cn } from "@/lib/utils";

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

export function ParticipantWorldLayout({ children }: ParticipantWorldLayoutProps) {
  const { pathname } = useLocation();

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

          <NavLink
            to="/settings"
            className="rounded-full p-2.5 text-stone-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </NavLink>
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
