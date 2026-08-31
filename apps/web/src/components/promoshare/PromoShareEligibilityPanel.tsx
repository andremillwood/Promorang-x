import { Link } from "react-router-dom";
import { CalendarDays, Crown, Gift, ShieldCheck, Ticket, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nContext";
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
  actionLabel,
  proofLabel,
  poolLabel,
  funded = false,
}: PromoShareEligibilityPanelProps) {
  const { t } = useI18n();
  const action = actionLabel || t("psElig.actionDefault");
  const proof = proofLabel || t("psElig.proofDefault");
  const pool = poolLabel || t("psElig.poolDefault");

  if (variant === "compact") {
    return (
      <div className={cn("rounded-2xl border border-primary/20 bg-primary/5 p-3", className)}>
        <div className="flex items-start gap-2">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary">
            <Ticket className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">{t("psElig.compactTitle")}</p>
            <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
              {t("psElig.compactCopy")}
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
            <Badge variant={funded ? "default" : "outline"}>{funded ? t("psElig.funded") : t("psElig.progress")}</Badge>
          </div>
          <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">{t("psElig.title")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("psElig.copy", { action, proof })}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <CalendarDays className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-bold text-foreground">{t("psElig.today")}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("psElig.todayCopy")}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <Trophy className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-bold text-foreground">{t("psElig.weekly")}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("psElig.weeklyCopy")}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/75 p-4">
              <Crown className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-bold text-foreground">{t("psElig.activation")}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{t("psElig.activationCopy")}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 bg-background/65 p-5 sm:p-6 lg:border-l lg:border-t-0">
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-bold text-foreground">{t("psElig.fair")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("psElig.fairCopy")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4">
              <Ticket className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-foreground">{t("psElig.matched", { pool })}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("psElig.matchedCopy")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/80 p-4">
              <Gift className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-bold text-foreground">{t("psElig.backing")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("psElig.backingCopy")}</p>
              </div>
            </div>
          </div>
          <Button asChild className="mt-5 w-full" variant="outline">
            <Link to="/promoshare">{t("psElig.open")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default PromoShareEligibilityPanel;
