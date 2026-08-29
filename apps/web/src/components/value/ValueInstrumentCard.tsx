import type { LucideIcon } from "lucide-react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "amber" | "orange" | "violet" | "emerald";

const tones: Record<Tone, { icon: string; glow: string; progress: string; foil: string }> = {
  amber: { icon: "border-amber-400/25 bg-amber-400/10 text-amber-300", glow: "bg-amber-400/10", progress: "bg-amber-400", foil: "from-amber-200 to-amber-500" },
  orange: { icon: "border-primary/25 bg-primary/10 text-primary", glow: "bg-primary/10", progress: "bg-primary", foil: "from-orange-300 to-orange-600" },
  violet: { icon: "border-violet-400/25 bg-violet-400/10 text-violet-300", glow: "bg-violet-400/10", progress: "bg-violet-400", foil: "from-violet-300 to-fuchsia-500" },
  emerald: { icon: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300", glow: "bg-emerald-400/10", progress: "bg-emerald-400", foil: "from-emerald-200 to-teal-500" },
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

export function ValueInstrumentCard({
  icon: Icon,
  label,
  value,
  meaning,
  status,
  actionLabel,
  onAction,
  disabled,
  disabledReason,
  progress,
  progressLabel,
  tone,
  loading,
}: ValueInstrumentCardProps) {
  const palette = tones[tone];
  const objectClass =
    tone === "orange"
      ? "pr-ticket"
      : tone === "violet"
        ? "pr-plastic-card"
        : tone === "emerald"
          ? "pr-receipt"
          : "";

  return (
    <article
      className={cn(
        "group relative min-h-[270px] overflow-hidden p-5 shadow-[0_22px_70px_rgba(0,0,0,.24)] transition-transform duration-300 hover:-translate-y-1 sm:p-6",
        tone === "amber" && "rounded-[28px] border border-amber-400/20 bg-[#14110d]",
        tone === "orange" && "rounded-2xl",
        tone === "violet" && "rounded-[1.6rem] text-white",
        tone === "emerald" && "rounded-sm",
        objectClass,
      )}
    >
      {tone === "amber" && (
        <div aria-hidden className="absolute right-5 top-5 h-16 w-16 rounded-full border-[6px] border-amber-700/40 bg-[#1c160f] shadow-inner">
          <div
            className="absolute inset-x-1 bottom-1 rounded-b-full bg-gradient-to-t from-amber-500 to-amber-300/80 transition-all duration-500"
            style={{ height: `${Math.min(100, Math.max(12, progress ?? 18))}%` }}
          />
        </div>
      )}
      {tone === "violet" && (
        <span className="absolute right-5 top-5 h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 shadow-inner" aria-hidden />
      )}
      <div aria-hidden className={cn("absolute -right-10 -top-14 h-40 w-40 rounded-full blur-3xl transition-opacity group-hover:opacity-100", palette.glow)} />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className={cn("grid h-11 w-11 place-items-center rounded-2xl border", palette.icon)}>
            <Icon className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[.18em]",
              tone === "emerald" ? "border-[#1a120c]/15 bg-[#1a120c]/5 text-[#5c4a3c]" : "border-white/10 bg-white/[.035] text-white/48",
            )}
          >
            {status}
          </span>
        </div>
        <div className="mt-7">
          <p className={cn("text-[11px] font-black uppercase tracking-[.22em]", tone === "emerald" ? "text-[#7a6554]" : "text-white/45")}>{label}</p>
          <p className={cn("mt-1 text-4xl font-black tracking-[-.05em]", tone === "emerald" ? "font-serif text-[#1a120c]" : "text-white")}>
            {loading ? "—" : value}
          </p>
          <p className={cn("mt-2 min-h-10 text-sm leading-5", tone === "emerald" ? "text-[#5c4a3c]" : "text-white/58")}>{meaning}</p>
        </div>
        {typeof progress === "number" && (
          <div className="mt-4">
            <div className={cn("mb-1.5 flex justify-between text-[11px] font-semibold", tone === "emerald" ? "text-[#6a5646]" : "text-white/50")}>
              <span>{progressLabel}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className={cn("h-1.5 overflow-hidden rounded-full", tone === "emerald" ? "bg-[#1a120c]/10" : "bg-white/8")}>
              <div className={cn("h-full rounded-full transition-[width] duration-500", palette.progress)} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
            </div>
          </div>
        )}
        <div className="mt-auto pt-5">
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              disabled={disabled}
              className={cn(
                "inline-flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                tone === "emerald"
                  ? "border-[#1a120c]/15 bg-[#1a120c]/5 text-[#1a120c] hover:bg-[#1a120c]/10"
                  : "border-white/10 bg-white/[.045] text-white hover:bg-white/[.08]",
              )}
            >
              <span className="flex items-center gap-2">
                {disabled && <LockKeyhole className="h-3.5 w-3.5" />}
                {disabled && disabledReason ? disabledReason : actionLabel}
              </span>
              {!disabled && <ArrowRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
