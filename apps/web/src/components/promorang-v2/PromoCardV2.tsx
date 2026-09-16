import type { PromoCardFaceModel } from "@promorang/shared";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STATE_LABEL: Record<PromoCardFaceModel["state"], string> = {
  empty: "Ready when something useful is",
  nearby: "Available nearby",
  ready: "Ready now",
  returned: "Return recorded",
  used: "Verified use",
  expired: "Expired",
};

export function PromoCardV2({ model, className, compact = false }: { model: PromoCardFaceModel; className?: string; compact?: boolean }) {
  const isReady = model.state === "ready";
  const isUsed = model.state === "used";
  const statusTone = isReady
    ? "text-[#ffd58c] border-[#f3b85e]/30 bg-[#f3b85e]/10"
    : isUsed
      ? "text-sky-200 border-sky-300/20 bg-sky-300/10"
      : "text-white/60 border-white/10 bg-white/[0.04]";

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[var(--pr-v2-radius-object)] border border-[#d89545]/30 bg-[#0a0b0c] text-white shadow-[var(--pr-v2-shadow-card)]",
        compact ? "min-h-[278px]" : "min-h-[360px]",
        className,
      )}
      aria-label={`PromoCard for ${model.holder}. ${STATE_LABEL[model.state]}.`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_10%,rgba(255,107,53,.25),transparent_32%),radial-gradient(circle_at_12%_85%,rgba(216,149,69,.16),transparent_28%),linear-gradient(145deg,rgba(255,255,255,.06),transparent_38%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 opacity-[.16] [background-image:repeating-linear-gradient(115deg,transparent_0,transparent_3px,rgba(255,255,255,.08)_4px,transparent_5px)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-16 -top-10 size-52 rounded-full border border-[#e5a85b]/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-7 top-5 size-28 rounded-full border border-white/[0.055]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#ff6b35]/80 to-transparent shadow-[0_0_24px_rgba(255,107,53,.55)]" aria-hidden="true" />

      <div className={cn("relative flex h-full flex-col", compact ? "p-5 sm:p-6" : "p-6 sm:p-8")}>
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#ff6b35]">PROMORANG</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d6ad69]">Culture moves with you</p>
          </div>
          <span className={cn("rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em]", statusTone)}>
            {STATE_LABEL[model.state]}
          </span>
        </header>

        <div className={cn("flex-1", compact ? "pt-8" : "pt-12 sm:pt-16")}>
          <p className="max-w-[26rem] font-serif text-[clamp(1.75rem,4.5vw,2.7rem)] font-semibold leading-[.98] tracking-[-0.045em] text-white">
            {model.headline}
          </p>
          <p className="mt-3 max-w-[28rem] text-sm leading-6 text-white/58">{model.detail}</p>

          {model.credential ? (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#e5a85b]/25 bg-[#e5a85b]/10 px-4 py-2.5">
              <Sparkles className="h-3.5 w-3.5 text-[#f0bd72]" aria-hidden="true" />
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#f0bd72]">Use code</span>
              <span className="font-mono text-sm font-bold tracking-[0.18em] text-white">{model.credential}</span>
            </div>
          ) : null}
        </div>

        <footer className="mt-7 border-t border-white/10 pt-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/32">Member</p>
              <p className="mt-1 truncate text-sm font-semibold tracking-[0.02em]">{model.holder}</p>
              <p className="mt-2 text-[11px] leading-5 text-white/38">{model.footerCue}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/32">Access</p>
              <p className="mt-1 text-xs font-semibold text-white/72">{model.places}</p>
              {model.issuer ? <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#d6ad69]/70">{model.issuer}</p> : null}
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}

export default PromoCardV2;
