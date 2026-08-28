import type { LucideIcon } from "lucide-react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "amber" | "orange" | "violet" | "emerald";

const tones: Record<Tone, { icon: string; glow: string; progress: string }> = {
  amber: { icon: "border-amber-400/25 bg-amber-400/10 text-amber-300", glow: "bg-amber-400/10", progress: "bg-amber-400" },
  orange: { icon: "border-primary/25 bg-primary/10 text-primary", glow: "bg-primary/10", progress: "bg-primary" },
  violet: { icon: "border-violet-400/25 bg-violet-400/10 text-violet-300", glow: "bg-violet-400/10", progress: "bg-violet-400" },
  emerald: { icon: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", glow: "bg-emerald-400/10", progress: "bg-emerald-400" },
};

interface ValueInstrumentCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  meaning: string;
  status: string;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  progress?: number;
  progressLabel?: string;
  tone: Tone;
  loading?: boolean;
}

export function ValueInstrumentCard({ icon: Icon, label, value, meaning, status, actionLabel, onAction, disabled, disabledReason, progress, progressLabel, tone, loading }: ValueInstrumentCardProps) {
  const palette = tones[tone];
  return (
    <article className="group relative min-h-[270px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111113] p-5 shadow-[0_22px_70px_rgba(0,0,0,.24)] transition-transform duration-300 hover:-translate-y-1 sm:p-6">
      <div aria-hidden className={cn("absolute -right-10 -top-14 h-40 w-40 rounded-full blur-3xl transition-opacity group-hover:opacity-100", palette.glow)} />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className={cn("grid h-11 w-11 place-items-center rounded-2xl border", palette.icon)}><Icon className="h-5 w-5" /></div>
          <span className="rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.18em] text-white/48">{status}</span>
        </div>
        <div className="mt-7">
          <p className="text-[11px] font-black uppercase tracking-[.22em] text-white/45">{label}</p>
          <p className="mt-1 text-4xl font-black tracking-[-.05em] text-white">{loading ? "—" : value}</p>
          <p className="mt-2 min-h-10 text-sm leading-5 text-white/58">{meaning}</p>
        </div>
        {typeof progress === "number" && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] font-semibold text-white/50"><span>{progressLabel}</span><span>{Math.round(progress)}%</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8"><div className={cn("h-full rounded-full transition-[width] duration-500", palette.progress)} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div>
          </div>
        )}
        <div className="mt-auto pt-5">
          {actionLabel && (
            <button type="button" onClick={onAction} disabled={disabled} className="inline-flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[.045] px-4 py-3 text-left text-xs font-bold text-white transition-colors hover:bg-white/[.08] disabled:cursor-not-allowed disabled:opacity-45">
              <span className="flex items-center gap-2">{disabled && <LockKeyhole className="h-3.5 w-3.5" />}{disabled && disabledReason ? disabledReason : actionLabel}</span>
              {!disabled && <ArrowRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
