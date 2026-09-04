import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ImminentWrite, PromoCardMark } from "@/lib/promocard/life";

type LivingPromoCardProps = {
  holder: string;
  last4?: string;
  available?: number | null;
  limit?: number | null;
  marks?: PromoCardMark[];
  imminent?: ImminentWrite | null;
  writingMark?: PromoCardMark | null;
  href?: string;
  variant?: "face" | "pocket";
  caption?: string;
  className?: string;
};

function money(value?: number | null) {
  if (value == null) return "—";
  return `$${value.toFixed(2)}`;
}

function Stamp({ mark, ghost, writing }: { mark: { stamp: string; kind?: string }; ghost?: boolean; writing?: boolean }) {
  return (
    <span
      className={cn(
        "pr-card-stamp",
        ghost && "pr-card-stamp--ghost",
        writing && "pr-card-stamp--writing",
      )}
      aria-hidden
    >
      {mark.stamp}
    </span>
  );
}

export function LivingPromoCard({
  holder,
  last4 = "0842",
  available,
  limit,
  marks = [],
  imminent,
  writingMark,
  href = "/card",
  variant = "face",
  caption,
  className,
}: LivingPromoCardProps) {
  const [flipped, setFlipped] = useState(false);
  const visibleMarks = marks.slice(0, 4);
  const stripeLine = writingMark?.line || marks[0]?.line || (imminent ? imminent.line : "READY · CARRY THIS");
  const heat = Math.min(100, 28 + visibleMarks.length * 18);

  if (variant === "pocket") {
    return (
      <Link
        to={href}
        className={cn("pr-card-pocket", writingMark && "pr-card-pocket--writing", className)}
        aria-label={`PromoCard ${money(available)}`}
      >
        <span className="pr-card-pocket__chip" aria-hidden />
        <span className="min-w-0">
          <span className="block truncate text-[9px] font-black uppercase tracking-[0.18em] text-amber-200/80">PromoCard</span>
          <span className="block truncate font-serif text-sm font-bold leading-none text-amber-50">
            {writingMark ? writingMark.stamp : money(available)}
          </span>
        </span>
        <span className="font-mono text-[10px] tracking-widest text-white/45">PR {last4}</span>
      </Link>
    );
  }

  const inner = (
    <article
      className={cn("pr-plastic-card w-full max-w-md text-white", writingMark && "pr-plastic-card--writing", className)}
      aria-label="PromoCard"
    >
      <div className={cn("relative z-10 flex h-full flex-col justify-between p-5 sm:p-6", flipped && "hidden")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-amber-200/80">PROMORANG</p>
            <h3 className="mt-1 font-serif text-2xl font-bold tracking-tight">PromoCard</h3>
          </div>
          <span
            className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 shadow-inner"
            style={{ boxShadow: `inset 0 0 ${8 + heat / 8}px rgba(255, 196, 90, 0.55)` }}
            aria-hidden
          />
        </div>

        <div className="pr-card-stripe" aria-live="polite">
          <p className={cn("pr-card-stripe__line", writingMark && "pr-card-stripe__line--writing")}>{stripeLine}</p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-wide text-white/55">Available to spend</p>
            <p className="mt-0.5 font-serif text-4xl font-bold tracking-tight text-amber-100">{money(available)}</p>
            <p className="mt-1 text-xs text-white/50">
              {limit != null ? `of ${money(limit)} this cycle` : "Promotional spending value"}
            </p>
          </div>
          <div className="pr-card-passport" aria-label="Places this card has been">
            {imminent && !writingMark ? <Stamp mark={imminent} ghost /> : null}
            {writingMark ? <Stamp mark={writingMark} writing /> : null}
            {visibleMarks
              .filter((mark) => mark.id !== writingMark?.id)
              .slice(0, imminent || writingMark ? 3 : 4)
              .map((mark) => (
                <Stamp key={mark.id} mark={mark} />
              ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 text-[11px] text-white/60">
          <span className="truncate">{holder}</span>
          <span className="font-mono tracking-widest">PR · {last4}</span>
        </div>
      </div>

      <div className={cn("relative z-10 flex h-full flex-col justify-between p-5 sm:p-6", !flipped && "hidden")}>
        <p className="text-[10px] font-bold tracking-[0.22em] text-amber-200/80">PRESENT THIS</p>
        <div className="grid place-items-center rounded-xl bg-white py-6 text-black">
          <p className="font-mono text-2xl font-black tracking-[0.28em]">PR {last4}</p>
          <p className="mt-2 text-[11px] text-black/55">Show at the door or counter</p>
        </div>
        <p className="text-xs text-white/55">{holder} · {money(available)} ready</p>
      </div>
    </article>
  );

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="block w-full max-w-md text-left"
        aria-pressed={flipped}
      >
        {inner}
      </button>
      <div className="flex max-w-md items-center justify-between gap-3 px-1">
        <p className="text-xs leading-5 text-white/50">
          {caption ||
            (writingMark
              ? "The card just took the mark. That is the update."
              : imminent
                ? `Tonight would stamp ${imminent.stamp}.`
                : "Tap the plastic to present it. The world writes on this, not in a notification.")}
        </p>
        <Link to={href} className="shrink-0 text-xs font-bold text-amber-200/80 hover:text-amber-100">
          Open card
        </Link>
      </div>
    </div>
  );
}
