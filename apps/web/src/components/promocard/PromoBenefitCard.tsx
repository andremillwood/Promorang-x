import { Link } from "react-router-dom";
import { ArrowRight, MapPin, WalletCards } from "lucide-react";
import type { PromoBenefitPresentation } from "@promorang/shared";

type PromoBenefitCardProps = {
  presentation: PromoBenefitPresentation;
  moreCount?: number;
  moreHref?: string;
  showLoopLine?: boolean;
};

export function PromoBenefitCard({
  presentation,
  moreCount = 0,
  moreHref = "/discover",
  showLoopLine = true,
}: PromoBenefitCardProps) {
  const meta = [presentation.locationLabel, presentation.scarcityLabel].filter(Boolean).join(" · ");

  return (
    <article
      className="relative overflow-hidden rounded-[1.5rem] border border-amber-200/20 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black p-5 shadow-[0_32px_100px_rgba(0,0,0,0.65)] sm:rounded-[1.75rem] sm:p-7"
      aria-label={presentation.empty ? "PromoCard" : `${presentation.headline} at ${presentation.merchantName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-200 to-amber-500 text-black">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">PromoCard</p>
            <p className="text-sm font-bold text-white">{presentation.merchantName}</p>
          </div>
        </div>
      </div>

      <div className="my-5 sm:my-7">
        <h3 className="font-serif text-[clamp(2.35rem,11vw,4.4rem)] font-black uppercase leading-[0.86] tracking-[-0.05em] text-amber-200">
          {presentation.headline}
        </h3>
        {presentation.description ? (
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70 sm:text-base">{presentation.description}</p>
        ) : null}
      </div>

      {meta ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-white/55">
          {presentation.locationLabel ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-amber-300" />
              {presentation.locationLabel}
            </span>
          ) : null}
          {presentation.locationLabel && presentation.scarcityLabel ? <span aria-hidden="true">·</span> : null}
          {presentation.scarcityLabel ? <span>{presentation.scarcityLabel}</span> : null}
        </p>
      ) : null}

      <Link
        to={presentation.href}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-[0_18px_50px_rgba(255,85,0,0.28)] transition hover:bg-orange-600 active:scale-[0.98] sm:w-auto"
      >
        {presentation.ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>

      {moreCount > 0 ? (
        <Link to={moreHref} className="mt-3 block text-xs font-bold text-amber-200/80 hover:text-amber-100">
          {moreCount === 1 ? "1 more nearby" : `${moreCount} more nearby`}
        </Link>
      ) : null}

      {showLoopLine ? (
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
          Use it. More comes back.
        </p>
      ) : null}
    </article>
  );
}
