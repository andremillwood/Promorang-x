import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, Gift, Home, User, WalletCards } from "lucide-react";
import promorangLogo from "@/assets/promorang-logo-full.png";
import { CONSUMER_PRIMARY_NAV } from "@/lib/consumer-canonical";
import { useAuth } from "@/contexts/AuthContext";

const navIcons = {
  Home,
  Discover: Compass,
  PromoCard: WalletCards,
  Rewards: Gift,
  You: User,
} as const;

interface ConsumerShellProps {
  children: ReactNode;
  locationLabel?: string;
  actions?: ReactNode;
}

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

const ConsumerShell = ({ children, locationLabel = "Kingston", actions }: ConsumerShellProps) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-dvh bg-[#0D0D0E] text-white">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#09090b]/80 text-white backdrop-blur-xl">
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Promorang home">
              <img src={promorangLogo} alt="Promorang" className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              className="hidden rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:text-white sm:inline-flex"
            >
              {locationLabel} ▾
            </button>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Consumer navigation">
            {CONSUMER_PRIMARY_NAV.map((item) => {
              const active = isActivePath(location.pathname, item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {actions || (
              <>
                <Link to="/how-it-works" className="text-sm font-semibold text-white/80 hover:text-white">
                  How it works
                </Link>
                {user ? (
                  <Link
                    to="/profile"
                    className="grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-black"
                    aria-label="Your profile"
                  >
                    You
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="rounded-full bg-white px-4 py-2 text-xs font-black text-black"
                  >
                    Log in
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="w-full px-4 pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] pt-5 sm:px-6 md:pb-16 lg:px-8">
        {children}
      </main>

      <nav
        aria-label="Mobile consumer navigation"
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-50 grid grid-cols-5 rounded-2xl border border-white/15 bg-[#0D0D0E]/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
      >
        {CONSUMER_PRIMARY_NAV.map((item) => {
          const active = isActivePath(location.pathname, item.href);
          const Icon = navIcons[item.label as keyof typeof navIcons];
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition ${
                active ? "bg-primary/15 text-primary" : "text-white/50"
              }`}
            >
              {Icon ? <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} /> : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default ConsumerShell;
