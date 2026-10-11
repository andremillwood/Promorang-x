import { Home, Search, ShoppingBag, Ticket, BriefcaseBusiness } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

export function PublicMobileNavigation() {
  const { t } = useI18n();
  const { pathname, search } = useLocation();
  const offers = (pathname === "/discover" && new URLSearchParams(search).get("tab") === "perks") || /^\/offers(\/|$)/.test(pathname);
  const items = [
    { href: "/", label: t("publicHome.navHome"), icon: Home, active: pathname === "/" },
    { href: "/discover", label: t("publicNav.discover"), icon: Search, active: !offers && /^\/(discover|discoveries|moments|scenes|venues|creators|live)(\/|$)/.test(pathname) },
    { href: "/shop", label: t("publicNav.shop"), icon: ShoppingBag, active: /^\/(shop|storefront)(\/|$)/.test(pathname) },
    { href: "/discover?tab=perks", label: t("publicNav.perks"), icon: Ticket, active: offers },
    { href: "/solutions", label: t("publicNav.business"), icon: BriefcaseBusiness, active: /^\/(solutions|business|pricing|for-brands|for-merchants|for-agencies|for-enterprise|hosting)(\/|$)/.test(pathname) },
  ];

  return (
    <nav className="public-mobile-navigation" aria-label={t("publicHome.mobileNavigation")}>
      {items.map(({ href, label, icon: Icon, active }) => (
        <Link key={href} to={href} aria-current={active ? "page" : undefined}>
          <Icon aria-hidden="true" size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
