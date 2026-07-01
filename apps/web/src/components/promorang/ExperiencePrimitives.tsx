import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SurfaceHeroProps = {
  eyebrow: string;
  title: string;
  body: string;
  meta?: string[];
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  aside?: ReactNode;
  className?: string;
};

export function SurfaceHero({
  eyebrow,
  title,
  body,
  meta = [],
  primary,
  secondary,
  aside,
  className,
}: SurfaceHeroProps) {
  return (
    <section className={cn("pr-app-canvas p-5 sm:p-7 lg:p-8", className)}>
      <div className="relative grid gap-6 lg:grid-cols-[1fr_0.48fr] lg:items-end">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-primary text-primary-foreground">{eyebrow}</Badge>
            {meta.map((item) => (
              <Badge key={item} variant="outline">{item}</Badge>
            ))}
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-[0.95] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            {body}
          </p>
          {(primary || secondary) && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {primary && (
                <Button asChild>
                  <Link to={primary.href}>
                    {primary.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              {secondary && (
                <Button asChild variant="outline">
                  <Link to={secondary.href}>{secondary.label}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}

type OpportunityStat = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
};

export function OpportunityStats({ stats }: { stats: OpportunityStat[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="pr-value-ticket">
          {stat.icon ? <stat.icon className="mb-3 h-5 w-5 text-primary" /> : null}
          <p className="text-2xl font-black">{stat.value}</p>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

type StakeholderRailItem = {
  label: string;
  body: string;
  value?: string;
};

export function StakeholderRail({ items }: { items: StakeholderRailItem[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div key={item.label} className="pr-exchange-row flex items-start gap-3 sm:grid-cols-none">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-primary text-sm font-black text-primary-foreground">
            {index + 1}
          </div>
          <div>
            <p className="font-black">{item.label}</p>
            <p className="text-sm leading-5 text-muted-foreground">{item.body}</p>
            {item.value ? <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-primary">{item.value}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

type StakeholderValue = {
  role: string;
  value: string;
  proof: string;
  primary?: boolean;
};

export function StakeholderValueMap({ values }: { values: StakeholderValue[] }) {
  return (
    <div className="pr-feed-surface p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-black">Stakeholder value map</p>
          <p className="text-sm text-muted-foreground">Who benefits, and what Promorang proves.</p>
        </div>
        <Badge variant="outline">multi-sided</Badge>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {values.map((item) => (
          <div
            key={item.role}
            className={cn(
              "rounded-[10px] border p-3",
              item.primary ? "border-primary/50 bg-primary/[0.07]" : "border-border/70 bg-background/80"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-black">{item.role}</p>
              {item.primary ? <span className="pr-action-chip bg-primary text-primary-foreground">primary</span> : null}
            </div>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">{item.value}</p>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-primary">{item.proof}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type MomentumStep = {
  label: string;
  detail: string;
  active?: boolean;
  icon?: LucideIcon;
};

export function MomentumTrail({ steps }: { steps: MomentumStep[] }) {
  return (
    <div className="pr-feed-surface pr-momentum-trail p-4">
      <div className="grid gap-3 lg:grid-cols-5">
        {steps.map((step) => (
          <div
            key={step.label}
            className={cn(
              "relative min-h-[132px] rounded-[10px] border p-4",
              step.active ? "border-primary/60 bg-primary/[0.08]" : "border-border/70 bg-background/80"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              {step.icon ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                  <step.icon className="h-4 w-4" />
                </span>
              ) : null}
              {step.active ? <span className="pr-action-chip bg-primary text-primary-foreground">live</span> : null}
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{step.label}</p>
            <p className="mt-1 text-sm font-black leading-tight">{step.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type ReceiptItem = {
  label: string;
  detail: string;
  value: string;
};

export function ContributionReceipt({
  title = "Contribution receipt",
  items,
}: {
  title?: string;
  items: ReceiptItem[];
}) {
  return (
    <div className="pr-feed-surface border-primary/30 bg-primary/[0.06] p-4">
      <p className="font-black">{title}</p>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="pr-exchange-row">
            <div>
              <p className="font-semibold leading-tight">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <Badge>{item.value}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
