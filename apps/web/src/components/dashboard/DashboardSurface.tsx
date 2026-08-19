import type { LucideIcon } from "lucide-react";
import { ArrowRight, Command, Radio, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardHeroAction =
  | {
      label: string;
      icon: LucideIcon;
      href: string;
      onClick?: never;
    }
  | {
      label: string;
      icon: LucideIcon;
      onClick: () => void;
      href?: never;
    };

type DashboardHeroStat = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  accentClass?: string;
};

type DashboardQuickRoute =
  | {
      label: string;
      icon: LucideIcon;
      href: string;
      onClick?: never;
    }
  | {
      label: string;
      icon: LucideIcon;
      onClick: () => void;
      href?: never;
    };

interface DashboardHeroProps {
  badge: string;
  title: string;
  description: string;
  actions: DashboardHeroAction[];
  stats?: DashboardHeroStat[];
  isLoading?: boolean;
  glowClassName?: string;
  imageSrc?: string;
}

export const DashboardHero = ({
  badge,
  title,
  description,
  actions,
  stats = [],
  isLoading = false,
  glowClassName,
  imageSrc,
}: DashboardHeroProps) => {
  const primaryAction = actions[0];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#080808] text-white shadow-[0_32px_110px_rgba(0,0,0,0.42)]">
      {imageSrc ? (
        <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      ) : null}
      <div
        className={cn(
          "absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,106,0,0.28),transparent_32%),radial-gradient(circle_at_86%_80%,rgba(255,195,0,0.12),transparent_28%)]",
          glowClassName,
        )}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.72)_48%,rgba(0,0,0,0.46)_100%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.55))]" />
      <div className="relative grid lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.65fr)]">
        <div className="flex min-h-[390px] flex-col justify-between p-6 sm:p-9 lg:min-h-[440px] lg:p-11 xl:p-12">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="secondary" className="w-fit rounded-full border border-orange-500/30 bg-black/50 px-3 py-1 text-orange-300 backdrop-blur">
              <Radio className="mr-1.5 h-3.5 w-3.5" /> {badge}
            </Badge>
            <span className="hidden items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/35 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live workspace
            </span>
          </div>

          <div className="max-w-3xl py-10">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
              <Sparkles className="h-3.5 w-3.5" /> Your focus today
            </p>
            <h1 className="font-serif text-5xl font-bold leading-[0.92] tracking-[-.045em] sm:text-6xl xl:text-7xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">{description}</p>
          </div>

          {primaryAction ? (
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">Recommended next move</p>
              {primaryAction.href ? (
                <Button asChild size="lg" className="rounded-full bg-orange-500 px-6 font-black text-black shadow-[0_14px_40px_rgba(249,115,22,0.25)] hover:bg-orange-400">
                  <Link to={primaryAction.href}>{primaryAction.label}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              ) : (
                <Button size="lg" onClick={primaryAction.onClick} className="rounded-full bg-orange-500 px-6 font-black text-black shadow-[0_14px_40px_rgba(249,115,22,0.25)] hover:bg-orange-400">
                  {primaryAction.label}<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          ) : null}
        </div>

        <aside className="border-t border-white/10 bg-black/55 p-6 backdrop-blur-md sm:p-8 lg:border-l lg:border-t-0" aria-label={`${badge} command suite`}>
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">Command suite</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold">Make progress now</h2>
            </div>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-orange-500/25 bg-orange-500/10 text-orange-400">
              <Command className="h-5 w-5" />
            </div>
          </div>

          <nav className="mt-5 space-y-2" aria-label="Quick commands">
            {actions.map((action, index) => {
              const classes = cn(
                "group flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
                index === 0 ? "border-orange-500/35 bg-orange-500/10 text-white hover:bg-orange-500/15" : "border-white/10 bg-white/[0.035] text-white/75 hover:border-white/20 hover:bg-white/[0.07] hover:text-white",
              );
              const content = <><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.06]"><action.icon className="h-4 w-4 text-orange-400" /></span><span className="min-w-0 flex-1">{action.label}</span><ArrowRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-orange-400" /></>;
              return action.href ? <Link key={action.label} to={action.href} className={classes}>{content}</Link> : <button key={action.label} type="button" onClick={action.onClick} className={classes}>{content}</button>;
            })}
          </nav>

          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">At a glance</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(isLoading ? stats.slice(0, 2) : stats.slice(0, 2)).map((stat, index) => (
                <div key={stat?.label || index} className="rounded-xl border border-white/10 bg-black/35 p-3">
                  {isLoading ? <Skeleton className="h-8 w-16 bg-white/10" /> : <p className="font-serif text-2xl font-semibold">{stat.value}</p>}
                  <p className="mt-1 truncate text-[10px] uppercase tracking-[0.14em] text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {stats.length > 0 ? (
          <div className="grid border-t border-white/15 bg-black/70 backdrop-blur-md [grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr))] lg:col-span-2">
            {(isLoading ? Array.from({ length: stats.length || 4 }) : stats).map((stat, index) => (
              <div key={index} className="border-b border-white/10 px-6 py-5 text-white last:border-b-0 sm:border-r xl:border-b-0 xl:px-8">
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-20 bg-white/10" />
                      <Skeleton className="h-8 w-24 bg-white/10" />
                      <Skeleton className="h-3 w-28 bg-white/10" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.2em] text-white/60">{stat.label}</span>
                        <stat.icon className={cn("h-4 w-4", stat.accentClass || "text-primary-light")} />
                      </div>
                      <div className="font-serif text-4xl font-semibold tracking-tight">{stat.value}</div>
                      <div className="mt-1 text-xs text-white/65">{stat.helper}</div>
                    </>
                  )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

interface DashboardQuickRoutesCardProps {
  title?: string;
  description: string;
  routes: DashboardQuickRoute[];
}

export const DashboardQuickRoutesCard = ({
  title = "Elsewhere in your studio",
  description,
  routes,
}: DashboardQuickRoutesCardProps) => {
  return (
    <aside className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b0b0b] text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      <div className="bg-[radial-gradient(circle_at_15%_0%,rgba(255,106,0,0.2),transparent_42%)] p-6 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">Studio index</p>
        <h3 className="mt-3 font-serif text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
      </div>
      <nav aria-label={title} className="border-t border-white/10">
          {routes.map((route, index) =>
            route.href ? (
              <Link key={route.label} to={route.href} className="group flex min-h-16 items-center gap-4 border-b border-white/10 px-6 py-4 text-left last:border-b-0 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400">
                  <span className="font-serif text-sm text-white/25">0{index + 1}</span>
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <route.icon className="h-4 w-4 text-orange-400" />
                    {route.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-orange-400" />
              </Link>
            ) : (
              <button key={route.label} type="button" className="group flex min-h-16 w-full items-center gap-4 border-b border-white/10 px-6 py-4 text-left last:border-b-0 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400" onClick={route.onClick}>
                <span className="font-serif text-sm text-white/25">0{index + 1}</span>
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <route.icon className="h-4 w-4 text-orange-400" />
                  {route.label}
                </span>
                <ArrowRight className="h-4 w-4 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-orange-400" />
              </button>
            ),
          )}
      </nav>
    </aside>
  );
};

type DashboardNextStepItem =
  | {
      title: string;
      description: string;
      cta: string;
      href: string;
      onClick?: never;
    }
  | {
      title: string;
      description: string;
      cta: string;
      onClick: () => void;
      href?: never;
    };

interface DashboardNextStepsSectionProps {
  title?: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
  items: DashboardNextStepItem[];
}

export const DashboardNextStepsSection = ({
  title = "What's next",
  description,
  ctaLabel,
  ctaHref,
  ctaOnClick,
  items,
}: DashboardNextStepsSectionProps) => {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/55">
      <div className="p-6 sm:p-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0 flex-1 basis-64">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Decision sequence</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {ctaLabel ? (
            ctaHref ? (
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <Link to={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="rounded-full" onClick={ctaOnClick}>
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )
          ) : null}
        </div>

        <div className="border-t border-border/60">
          {items.map((item, index) =>
            item.href ? (
              <Link
                key={item.title}
                to={item.href}
                className="group grid min-w-0 gap-4 border-b border-border/60 py-6 text-left last:border-b-0 sm:grid-cols-[3rem_minmax(0,0.7fr)_minmax(0,1fr)_auto] sm:items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                  <span className="font-serif text-xl text-muted-foreground/40">0{index + 1}</span>
                  <h3 className="font-serif text-xl font-semibold leading-tight transition-colors group-hover:text-primary">{item.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                  <div className="inline-flex items-center text-sm font-bold text-primary">
                    {item.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
              </Link>
            ) : (
              <button
                key={item.title}
                type="button"
                onClick={item.onClick}
                className="group grid w-full min-w-0 gap-4 border-b border-border/60 py-6 text-left last:border-b-0 sm:grid-cols-[3rem_minmax(0,0.7fr)_minmax(0,1fr)_auto] sm:items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="font-serif text-xl text-muted-foreground/40">0{index + 1}</span>
                <h3 className="font-serif text-xl font-semibold leading-tight transition-colors group-hover:text-primary">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                <div className="inline-flex items-center text-sm font-bold text-primary">
                  {item.cta}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ),
          )}
        </div>
      </div>
    </section>
  );
};
