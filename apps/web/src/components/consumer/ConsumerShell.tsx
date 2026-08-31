import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bookmark, Compass, Gift, Home, User } from "lucide-react";
import promorangLogo from "@/assets/promorang-logo-full.png";
import { CONSUMER_PRIMARY_NAV } from "@/lib/consumer-canonical";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const navIcons = {
  Home,
  Discover: Compass,
  Saved: Bookmark,
  Rewards: Gift,
  You: User,
} as const;

const NAV_LABEL_KEYS: Record<string, TranslationKey> = {
  Home: "consPrev.navHome",
  Discover: "consPrev.navDiscover",
  Saved: "consPrev.navSaved",
  Rewards: "consPrev.navRewards",
  You: "consPrev.navYou",
};

interface ConsumerShellProps {
  children: ReactNode;
  locationLabel?: string;
  actions?: ReactNode;
}

const ConsumerShell = ({ children, locationLabel = "Kingston", actions }: ConsumerShellProps) => {
  const location = useLocation();
  const { t } = useI18n();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="w-full flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <Link to="/" className="flex shrink-0 items-center gap-2" aria-label={t("consPrev.homeAria")}>
              <img src={promorangLogo} alt="Promorang" className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground sm:inline-flex"
            >
              {locationLabel} ▾
            </button>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label={t("consPrev.navAria")}>
            {CONSUMER_PRIMARY_NAV.map((item) => {
              const active = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {t(NAV_LABEL_KEYS[item.label])}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </header>

      <main className="w-full px-4 pb-28 pt-5 pb-safe-nav sm:px-6 md:pb-10 lg:px-8">{children}</main>

      <nav
        aria-label={t("consPrev.navMobileAria")}
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-50 grid grid-cols-5 rounded-2xl border border-border/80 bg-background/95 p-1.5 shadow-elevated backdrop-blur-xl md:hidden"
      >
        {CONSUMER_PRIMARY_NAV.map((item) => {
          const active = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
          const Icon = navIcons[item.label as keyof typeof navIcons];
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition ${
                active ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
              <span>{t(NAV_LABEL_KEYS[item.label])}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default ConsumerShell;
