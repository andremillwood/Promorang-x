import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Banknote, Gem, Gift, MousePointerClick, Ticket, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type ValueOutcomeKind = "money" | "reward" | "access" | "reputation" | "piece";

export type ValueOutcome = {
  kind: ValueOutcomeKind;
  label: string;
  detail?: string;
};

const outcomeStyles: Record<ValueOutcomeKind, { icon: LucideIcon; className: string; label: string }> = {
  money: { icon: Banknote, label: "Earn", className: "border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300" },
  reward: { icon: Gift, label: "Reward", className: "border-amber-500/25 bg-amber-500/[0.08] text-amber-700 dark:text-amber-300" },
  access: { icon: Ticket, label: "Access", className: "border-sky-500/25 bg-sky-500/[0.08] text-sky-700 dark:text-sky-300" },
  reputation: { icon: Trophy, label: "Reputation", className: "border-violet-500/25 bg-violet-500/[0.08] text-violet-700 dark:text-violet-300" },
  piece: { icon: Gem, label: "Piece", className: "border-orange-500/25 bg-orange-500/[0.08] text-orange-700 dark:text-orange-300" },
};

export function ValueOutcomeChips({ outcomes, className }: { outcomes: ValueOutcome[]; className?: string }) {
  if (outcomes.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} aria-label="Value outcomes">
      {outcomes.map((outcome, index) => {
        const config = outcomeStyles[outcome.kind];
        const Icon = config.icon;
        return (
          <span
            key={`${outcome.kind}-${outcome.label}-${index}`}
            title={outcome.detail}
            className={cn("inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em]", config.className)}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span className="opacity-65">{config.label}</span>
            <span className="normal-case tracking-normal">{outcome.label}</span>
          </span>
        );
      })}
    </div>
  );
}

export function ValueExchangeSummary({
  action,
  proof,
  outcomes,
  className,
  dark = false,
}: {
  action: string;
  proof: string;
  outcomes: ValueOutcome[];
  className?: string;
  dark?: boolean;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border", dark ? "border-white/10 bg-white/[0.04]" : "border-border/70 bg-muted/20", className)} aria-label="Value exchange">
      <div className="grid md:grid-cols-[0.75fr_0.75fr_1.5fr]">
        <div className={cn("p-3.5 md:border-r", dark ? "border-white/10" : "border-border/60")}>
          <div className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.17em]", dark ? "text-white/38" : "text-muted-foreground")}><MousePointerClick className="h-3.5 w-3.5" />Your move</div>
          <p className={cn("mt-2 text-sm font-bold", dark ? "text-white/85" : "text-foreground")}>{action}</p>
        </div>
        <div className={cn("border-t p-3.5 md:border-r md:border-t-0", dark ? "border-white/10" : "border-border/60")}>
          <div className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.17em]", dark ? "text-white/38" : "text-muted-foreground")}><BadgeCheck className="h-3.5 w-3.5" />What counts</div>
          <p className={cn("mt-2 text-sm font-bold", dark ? "text-white/85" : "text-foreground")}>{proof}</p>
        </div>
        <div className={cn("border-t p-3.5 md:border-t-0", dark ? "border-white/10" : "border-border/60")}>
          <p className={cn("text-[9px] font-black uppercase tracking-[0.17em]", dark ? "text-white/38" : "text-muted-foreground")}>What you keep</p>
          {outcomes.length > 0 ? <ValueOutcomeChips outcomes={outcomes} className="mt-2" /> : <p className={cn("mt-2 text-sm", dark ? "text-white/55" : "text-muted-foreground")}>No additional outcome has been disclosed.</p>}
        </div>
      </div>
    </section>
  );
}
