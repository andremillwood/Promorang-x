import type { PromoCardFaceModel } from "@promorang/shared";
import { cn } from "@/lib/utils";

const STATE_LABEL: Record<PromoCardFaceModel["state"], string> = {
  empty: "Ready when something useful is",
  nearby: "Available nearby",
  ready: "Ready to use",
  returned: "Return recorded",
  used: "Verified use",
  expired: "Expired",
};

export function PromoCardV2({ model, className, compact = false }: { model: PromoCardFaceModel; className?: string; compact?: boolean }) {
  const isReady = model.state === "ready";
  const isUsed = model.state === "used";
  const statusTone = isReady
    ? "text-emerald-200 border-emerald-300/20 bg-emerald-300/10"
    : isUsed
      ? "text-sky-200 border-sky-300/20 bg-sky-300/10"
      : "text-white/60 border-white/10 bg-white/[0.04]";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[var(--pr-v2-radius-object)] border border-white/12 bg-[#0B0D10] text-white shadow-[var(--pr-v2-shadow-object)]",
        compact ? "min-h-[248px]" : "min-h-[320px]",
        className,
      )}
      aria-label={`PromoCard for ${model.holder}. ${STATE_LABEL[model.state]}.`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_92%_10%,rgba(255,91,53,.20),transparent_34%),linear-gradient(145deg,rgba(255,255,255,.035),transparent_40%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-10 -top-8 size-40 rounded-full border border-white/[0.06]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-4 top-2 size-24 rounded-full border border-white/[0.05]" aria-hidden="true" />

      <div className={cn("relative flex h-full flex-col", compact ? "p-5" : "p-6 sm:p-7")}>
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#FF6848]">PROMORANG</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">PromoCard</p>
          </div>
          <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]", statusTone)}>
            {STATE_LABEL[model.state]}
          </span>
        </header>

        <div className={cn("flex-1", compact ? "pt-8" : "pt-10 sm:pt-14")}>
          <p className="max-w-[28rem] text-[clamp(1.5rem,4vw,2.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
            {model.headline}
          </p>
          <p className="mt-3 max-w-[30rem] text-sm leading-6 text-white/58">{model.detail}</p>

          {model.credential ? (
            <div className="mt-5 inline-flex items-baseline gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Use code</span>
              <span className="font-mono text-base font-bold tracking-[0.16em] text-white">{model.credential}</span>
            </div>
          ) : null}
        </div>

        <footer className="mt-6 border-t border-white/10 pt-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Holder</p>
              <p className="mt-1 truncate text-sm font-semibold">{model.holder}</p>
              <p className="mt-2 text-xs leading-5 text-white/38">{model.footerCue}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">Context</p>
              <p className="mt-1 text-xs font-semibold text-white/70">{model.places}</p>
              {model.issuer ? <p className="mt-1 text-[11px] text-white/38">{model.issuer}</p> : null}
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}

export default PromoCardV2;
