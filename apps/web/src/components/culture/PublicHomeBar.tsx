import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/promorang-logo-full.png";
import { MapPin, WalletCards } from "lucide-react";

export function PublicHomeBar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070707]/92 px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] text-white backdrop-blur-xl md:px-6 md:py-0">
      <div className="mx-auto flex h-12 max-w-[1440px] items-center justify-between gap-3 md:h-[4.5rem]">
        <Link to="/" className="flex min-w-0 items-center" aria-label="Promorang home">
          <img src={logo} alt="Promorang" className="h-7 w-auto md:h-8" />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 md:flex">
          {[
            ["Discover", "/discover"],
            ["Moments", "/discover/moments"],
            ["Rewards", "/discover/rewards"],
            ["For hosts", "/hosting"],
          ].map(([label, href]) => (
            <Link key={href} to={href} className="rounded-full px-4 py-2 text-sm font-bold text-white/62 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-2">
          <Link to="/how-it-works" className="text-[11px] font-black uppercase tracking-[0.12em] text-white/55">
            How it works
          </Link>
          <Link to="/shop" className="hidden min-h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 text-xs font-black text-white/75 transition hover:border-amber-300/40 hover:text-white md:inline-flex">
            <MapPin className="h-3.5 w-3.5 text-amber-300" /> Places
          </Link>
          <Link
            to={user ? "/wallet" : "/auth?mode=signup&next=/wallet"}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white shadow-[0_10px_25px_rgba(255,85,0,.22)] transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
          >
            <WalletCards className="hidden h-3.5 w-3.5 sm:block" />
            {user ? "My Card" : "Get PromoCard"}
          </Link>
        </div>
      </div>
    </header>
  );
}
