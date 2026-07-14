import { Link } from "react-router-dom";
import { CalendarDays, Crown, Gift, ShieldCheck, Ticket, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PromoShareEligibilityPanelProps = {
  variant?: "compact" | "detail";
  className?: string;
  actionLabel?: string;
  proofLabel?: string;
  poolLabel?: string;
  funded?: boolean;
};

export function PromoShareEligibilityPanel({
  variant = "detail",
  className,
  actionLabel = "counted check-in",
  proofLabel = "review requirement",
  poolLabel = "matching pools",
  funded = false,
}: PromoShareEligibilityPanelProps) {
  if (variant === "compact") {
    return (
      <div className={cn("rounded-2xl border border-primary/20 bg-primary/5 p-3", className)}>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary">
            <Ticket className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">PromoShare value eligible</p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
              Counted actions can open funded value, Gems-backed rewards, or possible reward chances when this Moment matches an active pool.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={cn("overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-amber-500/10", className)}>
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="w-fit">PromoShare</Badge>
            <Badge variant={funded ? "default" : "outline"}>{funded ? "Funded reward mode" : "Progress mode"}</Badge>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">Funded value follows the pool rules.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Complete the {actionLabel}, satisfy the {proofLabel}, and Promorang checks which active pools this Moment matches. If a pool accepts the action, value can open through Gems, perks, access, or possible reward chances.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <CalendarDays className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-bold text-foreground">Today</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Actions counted today can open today's value.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <Trophy className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-bold text-foreground">Weekly</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Eligible weekly actions can build reward chances.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <Crown className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-bold text-foreground">Activation</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Activation-period actions stay eligible until close.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 bg-background/65 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-bold text-foreground">Fair reward chances</p>
                <p className="mt-1 text-sm text-muted-foreground">More eligible actions can improve reward chances, but pool rules protect fairness once someone wins.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4">
              <Ticket className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-foreground">Matched to {poolLabel}</p>
                <p className="mt-1 text-sm text-muted-foreground">Pool assignment is rule-based. Any random selection only happens among eligible counted actions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4">
              <Gift className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-bold text-foreground">Rewards need backing</p>
                <p className="mt-1 text-sm text-muted-foreground">Gems, perks, and prizes only come from funded or committed value. Marks, Keys, access, and contribution records can run continuously.</p>
              </div>
            </div>
          </div>
          <Button asChild className="mt-5 w-full" variant="outline">
            <Link to="/promoshare">Open PromoShare</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default PromoShareEligibilityPanel;
