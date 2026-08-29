import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";
import { getNearestSwipeIndex, getSwipeOverflowState } from "@/lib/swipe-overflow";

const collapseChrome = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
} as const;

const collapseScroller = {
  sm: "sm:overflow-visible sm:pr-0",
  md: "md:overflow-visible md:pr-0",
  lg: "lg:overflow-visible lg:pr-0",
  xl: "xl:overflow-visible xl:pr-0",
} as const;

function isLightSurface(fadeFrom: string) {
  return fadeFrom.includes("from-background") || fadeFrom.includes("from-white") || fadeFrom.includes("f3efe6");
}

type SwipeRailProps = {
  children: ReactNode;
  label?: string;
  className?: string;
  scrollerClassName?: string;
  fadeFrom?: string;
  showDots?: boolean;
  showChevrons?: boolean;
  compact?: boolean;
  collapseAt?: keyof typeof collapseChrome;
};

export function SwipeRail({
  children,
  label,
  className = "",
  scrollerClassName = "",
  fadeFrom = "from-black",
  showDots = true,
  showChevrons = true,
  compact = false,
  collapseAt,
}: SwipeRailProps) {
  const { t } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const chromeHide = collapseAt ? collapseChrome[collapseAt] : "";
  const light = isLightSurface(fadeFrom);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = getSwipeOverflowState(el.scrollLeft, el.clientWidth, el.scrollWidth);
    setCanScrollLeft(next.canScrollLeft);
    setCanScrollRight(next.canScrollRight);
    setOverflows(next.overflows);

    const cards = Array.from(el.children).filter((node): node is HTMLElement => node instanceof HTMLElement);
    setItemCount(cards.length);
    if (!cards.length) return;
    setActiveIndex(getNearestSwipeIndex(
      cards.map((card) => card.offsetLeft + card.offsetWidth / 2),
      el.scrollLeft + el.clientWidth / 2,
    ));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>("[aria-current='page'], [aria-selected='true']");
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
  }, [updateScrollState, children]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = Array.from(el.children).find((node): node is HTMLElement => node instanceof HTMLElement);
    const amount = card ? card.getBoundingClientRect().width + 8 : 168;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    const card = Array.from(el?.children ?? []).filter((node): node is HTMLElement => node instanceof HTMLElement)[index];
    if (!el || !card) return;
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  };

  return (
    <div className={cn("w-full min-w-0", className)}>
      {(label || overflows) && (
        <div className={cn("mb-2 flex items-center justify-between gap-3 px-0.5", compact && "mb-1.5", chromeHide)}>
          {label ? (
            <span className={cn("text-[10px] font-black uppercase tracking-[0.18em]", light ? "text-muted-foreground" : "text-white/45")}>{label}</span>
          ) : (
            <span />
          )}
          {overflows && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
              {canScrollRight ? (
                <>
                  {t("swipe.more")} <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </>
              ) : (
                t("swipe.position", { current: String(activeIndex + 1), total: String(Math.max(itemCount, 1)) })
              )}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {showChevrons && canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className={cn(
              "absolute left-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-lg sm:flex",
              light ? "border border-border bg-background/90 text-foreground" : "border border-white/15 bg-black/70 text-white",
              chromeHide,
            )}
            aria-label={t("swipe.previous")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {showChevrons && canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className={cn(
              "absolute right-0 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-lg sm:flex",
              light ? "border border-border bg-background/90 text-foreground" : "border border-white/15 bg-black/70 text-white",
              chromeHide,
            )}
            aria-label={t("swipe.next")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {canScrollLeft && (
          <div aria-hidden="true" className={cn("pointer-events-none absolute inset-y-0 left-0 z-[5] w-8 bg-gradient-to-r to-transparent", fadeFrom, chromeHide)} />
        )}
        {canScrollRight && (
          <div aria-hidden="true" className={cn("pointer-events-none absolute inset-y-0 right-0 z-[5] w-10 bg-gradient-to-l to-transparent", fadeFrom, chromeHide)} />
        )}

        <div
          ref={scrollerRef}
          className={cn(
            "flex snap-x snap-mandatory gap-2 overflow-x-auto touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            overflows && "pr-8",
            collapseAt && collapseScroller[collapseAt],
            scrollerClassName,
          )}
        >
          {children}
        </div>
      </div>

      {showDots && overflows && itemCount > 1 && (
        <div className={cn("flex items-center justify-center gap-1.5 pt-2", chromeHide)} aria-hidden="true">
          {Array.from({ length: itemCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeIndex ? "w-5 bg-primary" : light ? "w-1.5 bg-foreground/20" : "w-1.5 bg-white/25",
              )}
              tabIndex={-1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
