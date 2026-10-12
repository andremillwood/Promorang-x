import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import "./PublicHomeBar.css";
import logo from "@/assets/promorang-logo-full.png";
import { ArrowRight, WalletCards } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CityQuickSwitcher } from "@/components/location/CityQuickSwitcher";
import { useI18n } from "@/i18n/I18nContext";

export function PublicHomeBar() {
  const { t: webT } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (href: string) => {
    const [pathname, search = ""] = href.split("?");
    if (pathname === "/discover") {
      return location.pathname === pathname &&
        new URLSearchParams(location.search).get("tab") === new URLSearchParams(search).get("tab");
    }
    return location.pathname === pathname || location.pathname.startsWith(`${pathname}/`);
  };
  const { t } = useI18n();

  return (
    <header className="public-home-bar sticky top-0 z-50 border-b border-white/10 bg-black/95 px-4 pt-[max(0.25rem,env(safe-area-inset-top))] text-white backdrop-blur-xl md:px-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="public-home-bar-row flex min-h-14 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-1 md:h-[4.25rem] md:flex-nowrap md:py-0">
          <Link to="/" className="public-home-brand flex shrink-0 items-center" aria-label={webT("web.homeAlt")}>
            <img src={logo} alt="Promorang" className="h-6 w-auto max-w-[132px] md:h-7 md:max-w-none" />
          </Link>

          <nav aria-label={t("publicHome.mobileNavigation")} className="hidden h-full items-center lg:flex">
            {[
              [t("publicNav.discover"), "/discover"],
              [t("publicNav.shop"), "/shop"],
              [t("publicNav.moments"), "/discover?tab=moments"],
              [t("publicNav.perks"), "/discover?tab=perks"],
              [t("publicNav.business"), "/solutions"],
            ].map(([label, href]) => (
              <Link
                key={href}
                aria-current={isActive(href) ? "page" : undefined}
                to={href}
                className="inline-flex h-full items-center border-b-2 border-transparent aria-[current=page]:border-orange-400 aria-[current=page]:text-orange-300 px-3 text-[11px] font-black uppercase tracking-[0.11em] text-white/58 transition hover:border-orange-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:px-4"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="public-home-controls flex items-center gap-2">
            <div className="public-home-settings flex min-w-0 items-center gap-2">
              <CityQuickSwitcher className="min-h-11 max-w-[190px]" />
              <LanguageSelector tone="marketing" className="min-h-11" />
            </div>
            <Link
              to={user ? "/card" : "/auth?mode=login&role=participant"}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-orange-500 px-3.5 text-[10px] font-black uppercase tracking-[0.11em] text-black shadow-[0_10px_24px_rgba(255,85,0,.2)] transition hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
            >
              <WalletCards className="hidden h-3.5 w-3.5 sm:block" />
              <span className="hidden sm:inline">{user ? t("publicNav.myCard") : t("publicNav.signIn")}</span>
              <span className="sm:hidden">{user ? t("publicNav.card") : t("publicNav.signIn")}</span>
              <ArrowRight className="hidden h-3.5 w-3.5 sm:block" />
            </Link>
          </div>
        </div>
        <nav aria-label={t("publicHome.mobileNavigation")} className="hidden gap-5 overflow-x-auto border-t border-white/10 md:flex lg:hidden">
          {[[t("publicNav.discover"), "/discover"], [t("publicNav.shop"), "/shop"], [t("publicNav.perks"), "/discover?tab=perks"], [t("publicNav.business"), "/solutions"]].map(([label, href]) => (
            <Link key={href} to={href} aria-current={isActive(href) ? "page" : undefined} className="aria-[current=page]:text-orange-300 aria-[current=page]:underline underline-offset-8 inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-white/85 hover:text-orange-300 focus-visible:outline-orange-300">{label}</Link>
          ))}
        </nav>
      </div>
      <span className="marketing-current-nav-line" aria-hidden="true" />
    </header>
  );
}
