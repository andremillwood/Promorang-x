import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { BadgeCheck, ChevronRight, Gem, KeyRound, Sparkles, Ticket, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nContext";
import { cn } from "@/lib/utils";

export type RewardItem = {
  label: string;
  value: string;
  kind?: "points" | "entry" | "piece" | "gems" | "status";
  pending?: boolean;
};

const icons = { points: Sparkles, entry: Ticket, piece: Trophy, gems: Gem, status: BadgeCheck };

export function RewardStack({ items, dark = false }: { items: RewardItem[]; dark?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = icons[item.kind || "status"];
        return (
          <div key={`${item.label}-${item.value}`} className={cn("flex items-center gap-3 rounded-xl border p-3", dark ? "border-white/10 bg-white/[0.045]" : "border-border bg-muted/20")}>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
            <div className="min-w-0"><p className={cn("truncate text-sm font-semibold", dark && "text-white")}>{item.value}</p><p className={cn("text-[10px] uppercase tracking-wider", dark ? "text-white/40" : "text-muted-foreground")}>{item.pending ? t("valueJourney.pending", { label: item.label }) : item.label}</p></div>
          </div>
        );
      })}
    </div>
  );
}

export function NextUnlock({ current, target = 500, label, dark = false }: { current: number; target?: number; label?: string; dark?: boolean }) {
  const { t, formatNumber } = useI18n();
  const progress = Math.min(100, Math.max(0, (current / target) * 100));
  return (
    <div className={cn("rounded-xl border p-4", dark ? "border-white/10 bg-black/30" : "border-border bg-card")}>
      <div className="flex items-center justify-between gap-3 text-sm"><span className={cn("flex items-center gap-2 font-semibold", dark && "text-white")}><KeyRound className="h-4 w-4 text-primary" />{label ?? t("valueJourney.nextKey")}</span><span className={dark ? "text-white/45" : "text-muted-foreground"}>{t("valueJourney.toGo", { count: formatNumber(Math.max(0, target - current)) })}</span></div>
      <div className={cn("mt-3 h-2 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-muted")}><div className="h-full rounded-full bg-primary transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]" style={{ width: `${progress}%` }} /></div>
    </div>
  );
}

export function ProofReceipt({
  eyebrow, title, description, items, pending = false, nextHref, nextLabel, secondaryHref = "/vault", secondaryLabel,
}: {
  eyebrow?: string; title: string; description: string; items: RewardItem[]; pending?: boolean;
  nextHref: string; nextLabel: string; secondaryHref?: string; secondaryLabel?: string;
}) {
  const { t } = useI18n();
  return (
    <section aria-live="polite" className="relative overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-[#090b09] p-6 text-white shadow-2xl sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.62fr)] lg:items-end">
        <div>
          <div className="flex items-center gap-3"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-emerald-300/25 bg-emerald-400/10"><BadgeCheck className="h-6 w-6 text-emerald-300" /></div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">{pending ? t("valueJourney.received") : (eyebrow ?? t("valueJourney.eyebrow"))}</p></div>
          <h1 className="mt-7 max-w-2xl font-serif text-4xl font-semibold leading-[.95] tracking-[-0.045em] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/58">{description}</p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row"><Button asChild><Link to={nextHref}>{nextLabel}<ChevronRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Link to={secondaryHref}>{secondaryLabel ?? t("valueJourney.vault")}</Link></Button></div>
        </div>
        <div className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4 backdrop-blur">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{t("valueJourney.whatChanged")}</p>
          <RewardStack items={items} dark />
        </div>
      </div>
    </section>
  );
}

export function ValuePreview({ humanValue, proof, reward, className }: { humanValue: string; proof: string; reward: string; className?: string }) {
  return <div className={cn("rounded-xl border border-primary/20 bg-primary/[0.06] p-3", className)}><p className="text-sm font-semibold">{humanValue}</p><p className="mt-1 text-xs text-muted-foreground">{proof} · {reward}</p></div>;
}

export function ComplexityGate({ title, simple, children }: { title: string; simple: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-border bg-card">
      <summary className="cursor-pointer list-none p-4"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{simple}</p></div><ChevronRight className="h-5 w-5 text-muted-foreground transition group-open:rotate-90" /></div></summary>
      <div className="border-t border-border p-4">{children}</div>
    </details>
  );
}
