import { BadgeCheck, Clock3, KeyRound, Landmark, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type OpportunityTermsProps = {
  cost: string;
  reward: string;
  funding: string;
  proof: string;
  settlement: string;
  dark?: boolean;
  compact?: boolean;
  className?: string;
};

export function OpportunityTerms({
  cost,
  reward,
  funding,
  proof,
  settlement,
  dark = false,
  compact = false,
  className,
}: OpportunityTermsProps) {
  const terms = [
    { label: "Entry", value: cost, icon: KeyRound },
    { label: "Potential reward", value: reward, icon: Trophy },
    { label: "Funded by", value: funding, icon: Landmark },
    { label: "Proof", value: proof, icon: BadgeCheck },
    { label: "Settlement", value: settlement, icon: Clock3 },
  ];

  return (
    <div className={cn(
      "overflow-hidden rounded-xl border",
      dark ? "border-white/10 bg-black/25" : "border-border/70 bg-muted/20",
      className
    )}>
      <div className={cn("grid", compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-5")}>
        {terms.map((term, index) => (
          <div
            key={term.label}
            className={cn(
              "min-w-0 p-2.5",
              index < terms.length - 1 && (dark ? "border-white/10" : "border-border/60"),
              compact ? "border-b last:border-b-0 odd:border-r" : "border-b sm:border-b-0 sm:border-r last:border-r-0",
              compact && index === terms.length - 1 && "col-span-2"
            )}
          >
            <div className={cn("flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.14em]", dark ? "text-white/35" : "text-muted-foreground")}>
              <term.icon className="h-3 w-3" />
              {term.label}
            </div>
            <div className={cn("mt-1 truncate text-[11px] font-semibold", dark ? "text-white/85" : "text-foreground")} title={term.value}>
              {term.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
