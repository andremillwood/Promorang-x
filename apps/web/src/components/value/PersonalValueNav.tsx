import { useCallback, useEffect, useRef, useState } from "react";
import { Archive, ChevronLeft, ChevronRight, Coins, Gem, Gift, Layers, Rocket, WalletCards } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n/I18nContext";

const valueDestinations = [
  { href: "/wallet", label: "Wallet", detail: "Balances & receipts", icon: WalletCards },
  { href: "/portfolio", label: "Pieces", detail: "Equity & dividends", icon: Layers },
  { href: "/marketplace", label: "Market", detail: "Trade syndicates", icon: Gem },
  { href: "/nodes", label: "Save & Win", detail: "Protected pots & bonus", icon: Coins },
  { href: "/vault", label: "Vault", detail: "Memories & perks", icon: Archive },
  { href: "/rewards", label: "Rewards", detail: "Claims & unlocks", icon: Gift },
  { href: "/growth", label: "Growth Hub", detail: "Fund, build & compound", icon: Rocket },
];

type PersonalValueNavProps = {
  className?: string;
};

export function PersonalValueNav({ className = "" }: PersonalValueNavProps) {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(maxScroll - el.scrollLeft > 8);

    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-value-nav-item]"));
    if (!cards.length) return;
    const midpoint = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(center - midpoint);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });
    setActiveIndex(nearest);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>("[aria-current='page']");
    if (active) {
      const left = active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, left) });
    }
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, pathname]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-value-nav-item]");
    const amount = card ? card.getBoundingClientRect().width + 8 : 168;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    const card = el?.querySelectorAll<HTMLElement>("[data-value-nav-item]")[index];
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <nav
      aria-label={t("valueNav.label")}
      className={`w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111111]/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center justify-between gap-3 px-2 pb-2 pt-1">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
          {t("valueNav.label")}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
          {canScrollRight ? (
            <>
              {t("valueNav.swipe")} <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </>
          ) : (
            t("valueNav.position", { current: String(activeIndex + 1), total: String(valueDestinations.length) })
          )}
        </span>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white shadow-lg sm:flex"
            aria-label={t("valueNav.previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white shadow-lg sm:flex"
            aria-label={t("valueNav.next")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {canScrollLeft && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-8 bg-gradient-to-r from-[#111111] to-transparent" />
        )}
        {canScrollRight && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-10 bg-gradient-to-l from-[#111111] to-transparent" />
        )}

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-2 overflow-x-auto touch-pan-x pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {valueDestinations.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                to={item.href}
                data-value-nav-item
                aria-current={isActive ? "page" : undefined}
                className={`group flex w-[9.75rem] shrink-0 snap-start items-center gap-3 rounded-[1.25rem] border px-4 py-3 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] ${
                  isActive
                    ? "border-primary/60 bg-primary text-primary-foreground shadow-[0_10px_32px_rgba(255,107,0,0.22)]"
                    : "border-transparent bg-white/[0.035] text-white hover:border-white/10 hover:bg-white/[0.07]"
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isActive ? "bg-black/15" : "bg-white/[0.07] text-primary"}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black">{item.label}</span>
                  <span className={`block truncate text-[10px] ${isActive ? "text-primary-foreground/70" : "text-white/40"}`}>{item.detail}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 px-2 pb-1 pt-2" aria-hidden="true">
        {valueDestinations.map((item, index) => (
          <button
            key={item.href}
            type="button"
            onClick={() => scrollToIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-white/25"
            }`}
            aria-label={item.label}
          />
        ))}
      </div>
    </nav>
  );
}
