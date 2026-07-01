import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { BadgeCheck, ChevronRight, Gem, KeyRound, Sparkles, Ticket, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RewardItem = {
  label: string;
  value: string;
  kind?: "points" | "entry" | "piece" | "gems" | "status";
  pending?: boolean;
};

const icons = { points: Sparkles, entry: Ticket, piece: Trophy, gems: Gem, status: BadgeCheck };

export function RewardStack({ items, dark = false }: { items: RewardItem[]; dark?: boolean }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = icons[item.kind || "status"];
        return (
          <div key={`${item.label}-${item.value}`} className={cn("flex items-center gap-3 rounded-xl border p-3", dark ? "border-white/10 bg-white/[0.045]" : "border-border bg-muted/20")}>
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
            <div className="min-w-0"><p className={cn("truncate text-sm font-semibold", dark && "text-white")}>{item.value}</p><p className={cn("text-[10px] uppercase tracking-wider", dark ? "text-white/40" : "text-muted-foreground")}>{item.pending ? `${item.label} · pending` : item.label}</p></div>
          </div>
        );
      })}
    </div>
  );
}

export function NextUnlock({ current, target = 500, label = "Next PromoKey", dark = false }: { current: number; target?: number; label?: string; dark?: boolean }) {
  const progress = Math.min(100, Math.max(0, (current / target) * 100));
  return (
    <div className={cn("rounded-xl border p-4", dark ? "border-white/10 bg-black/30" : "border-border bg-card")}>
      <div className="flex items-center justify-between gap-3 text-sm"><span className={cn("flex items-center gap-2 font-semibold", dark && "text-white")}><KeyRound className="h-4 w-4 text-primary" />{label}</span><span className={dark ? "text-white/45" : "text-muted-foreground"}>{Math.max(0, target - current)} to go</span></div>
      <div className={cn("mt-3 h-2 overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-muted")}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
    </div>
  );
}

export function ProofReceipt({
  eyebrow = "Your participation counted", title, description, items, pending = false, nextHref, nextLabel, secondaryHref = "/vault", secondaryLabel = "Open Vault",
}: {
  eyebrow?: string; title: string; description: string; items: RewardItem[]; pending?: boolean;
  nextHref: string; nextLabel: string; secondaryHref?: string; secondaryLabel?: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-500/25 bg-[radial-gradient(circle_at_top,rgba(16,185,129,.18),transparent_42%),#0a0a0a] p-6 text-white shadow-2xl sm:p-8">
      <div className="flex items-start gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-emerald-500/12"><BadgeCheck className="h-7 w-7 text-emerald-400" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">{pending ? "Proof received" : eyebrow}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">{title}</h1><p className="mt-2 text-sm leading-6 text-white/55">{description}</p></div></div>
      <div className="mt-6"><RewardStack items={items} dark /></div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row"><Button asChild className="flex-1"><Link to={nextHref}>{nextLabel}<ChevronRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild variant="outline" className="flex-1 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"><Link to={secondaryHref}>{secondaryLabel}</Link></Button></div>
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
