import { Compass, Home, Search, WalletCards } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/", icon: Home, match: (p: string) => p === "/" },
  { label: "Discover", href: "/discover", icon: Compass, match: (p: string) => p === "/discover" || p.startsWith("/discover/") || p.startsWith("/discoveries/") },
  { label: "Ask", href: "/search", icon: Search, match: (p: string) => p === "/search" },
];

export function PublicMobileNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const cardHref = user ? "/card" : "/auth?mode=signup&role=participant&next=/card";

  return (
    <nav className="public-pwa-nav md:hidden" aria-label="Promorang">
      <div className="public-pwa-nav__inner">
        {items.map(({ label, href, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link key={href} to={href} className={cn("public-pwa-nav__item", active && "is-active")} aria-current={active ? "page" : undefined}>
              <Icon className="h-[19px] w-[19px]" strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link to={cardHref} className={cn("public-pwa-nav__item", pathname === "/card" && "is-active")} aria-current={pathname === "/card" ? "page" : undefined}>
          <WalletCards className="h-[19px] w-[19px]" strokeWidth={pathname === "/card" ? 2.5 : 2} />
          <span>Card</span>
        </Link>
      </div>
    </nav>
  );
}
