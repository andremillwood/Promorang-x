import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Sparkles, Ticket } from "lucide-react";
import { discoverHrefForAim, type PromoCardAim } from "@promorang/shared";
import { cn } from "@/lib/utils";

type PromoCardActionsProps = {
  useThis?: { title?: string; redemption?: { code?: string | null } } | null;
  nearbyCount?: number;
  nextBenefit?: { title?: string } | null;
  aim?: PromoCardAim | null;
  onUseThis?: () => void;
};

const secondaryClass =
  "pr-v2-focusable group flex min-h-[92px] items-start gap-3 border-t border-[hsl(var(--pr-v2-stroke-soft))] py-4 text-left first:border-t-0";

export function PromoCardActions({ useThis, nearbyCount = 0, nextBenefit, aim, onUseThis }: PromoCardActionsProps) {
  const discoverHref = discoverHrefForAim(aim);

  return (
    <nav aria-label="PromoCard actions" className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
      {onUseThis ? (
        <button
          type="button"
          onClick={onUseThis}
          className="pr-v2-focusable flex min-h-[170px] flex-col justify-between rounded-[var(--pr-v2-radius-module)] bg-[hsl(var(--pr-v2-active-role))] p-5 text-left text-black sm:p-6"
        >
          <span className="grid size-10 place-items-center rounded-full bg-black/10"><Ticket className="h-5 w-5" /></span>
          <span>
            <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-black/60">Use now</span>
            <span className="mt-2 block text-2xl font-bold tracking-[-0.035em]">{useThis?.title || "Show your PromoCard"}</span>
            <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-black/70">Open credential <ArrowRight className="h-4 w-4" /></span>
          </span>
        </button>
      ) : (
        <a
          href="#use-this"
          className="pr-v2-focusable flex min-h-[170px] flex-col justify-between rounded-[var(--pr-v2-radius-module)] bg-[hsl(var(--pr-v2-active-role))] p-5 text-black sm:p-6"
        >
          <span className="grid size-10 place-items-center rounded-full bg-black/10"><Ticket className="h-5 w-5" /></span>
          <span>
            <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-black/60">{useThis ? "Ready" : "Your card"}</span>
            <span className="mt-2 block text-2xl font-bold tracking-[-0.035em]">{useThis?.title || "Put something useful on it"}</span>
            <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-black/70">{useThis ? "Show this" : "See how to fill it"} <ArrowRight className="h-4 w-4" /></span>
          </span>
        </a>
      )}

      <div className="border-y border-[hsl(var(--pr-v2-stroke-soft))]">
        <Link to={discoverHref} className={secondaryClass}>
          <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--pr-v2-surface-3))] text-[hsl(var(--pr-v2-active-role))]"><MapPin className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[hsl(var(--pr-v2-text-1))]">Available nearby</span>
            <span className="mt-1 block text-sm leading-5 text-[hsl(var(--pr-v2-text-3))]">{nearbyCount ? `${nearbyCount} participating now` : "See participating places and live benefits."}</span>
          </span>
          <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-[hsl(var(--pr-v2-text-3))] transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link to={nextBenefit ? discoverHref : "/give"} className={cn(secondaryClass, "border-t")}>
          <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-[hsl(var(--pr-v2-surface-3))] text-[hsl(var(--pr-v2-active-role))]"><Sparkles className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[hsl(var(--pr-v2-text-1))]">What comes next</span>
            <span className="mt-1 block text-sm leading-5 text-[hsl(var(--pr-v2-text-3))]">{nextBenefit?.title || "Your next benefit appears after this one creates a verified result."}</span>
          </span>
          <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-[hsl(var(--pr-v2-text-3))] transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </nav>
  );
}
