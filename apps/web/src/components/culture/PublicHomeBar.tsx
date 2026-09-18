import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/promorang-logo-full.png";
import { ArrowRight, WalletCards } from "lucide-react";

export function PublicHomeBar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 px-4 pt-[max(0.25rem,env(safe-area-inset-top))] text-white backdrop-blur-xl md:px-6">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 md:h-[4.25rem]">
        <Link to="/" className="flex min-w-0 items-center" aria-label="Promorang home">
          <img src={logo} alt="Promorang" className="h-6 w-auto md:h-7" />
        </Link>

        <nav aria-label="Primary navigation" className="hidden h-full items-center md:flex">
          {[
            ["Discover", "/discover"],
            ["Wanted", "/#wanted"],
            ["Moments", "/discover/moments"],
            ["For business", "/for-brands"],
            ["Build", "/join"],
          ].map(([label, href]) => (
            <Link
              key={href}
              to={href}
              className="inline-flex h-full items-center border-b-2 border-transparent px-4 text-[11px] font-black uppercase tracking-[0.11em] text-white/58 transition hover:border-orange-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <Link to="/auth?mode=login" className="hidden min-h-10 items-center px-3 text-[10px] font-black uppercase tracking-[0.14em] text-white/58 transition hover:text-white sm:inline-flex">
              Sign in
            </Link>
          ) : null}
          <Link
            to={user ? "/wallet" : "/auth?mode=signup&next=/wallet"}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-orange-500 px-3.5 text-[10px] font-black uppercase tracking-[0.11em] text-black shadow-[0_10px_24px_rgba(255,85,0,.2)] transition hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            <WalletCards className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">{user ? "My Card" : "PromoCard"}</span>
            <span className="xs:hidden">{user ? "Card" : "Join"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
