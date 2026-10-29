import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";
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
  headingAs?: "h1" | "h2";
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
  headingAs: Heading = "h1",
}: DashboardHeroProps) => {
  const { t } = useI18n();
  const primaryAction = actions[0];
  const secondaryActions = actions.slice(1);
  const ActionsHeading = Heading === "h1" ? "h2" : "h3";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808] text-white">
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
      <div className={cn("relative grid", secondaryActions.length > 0 && "lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.65fr)]")}>
        <div className="min-w-0 p-5 sm:p-7 lg:p-8">
          <p className="text-sm font-medium text-orange-300">{badge}</p>
          <div className="max-w-3xl py-5 sm:py-6">
            <Heading className="break-words font-sans text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl xl:text-5xl">{title}</Heading>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">{description}</p>
          </div>

          {primaryAction ? (
            <div>
              {primaryAction.href ? (
                <Button asChild size="lg" className="h-auto min-h-12 rounded-lg bg-orange-500 px-5 py-3 font-semibold text-black shadow-none hover:bg-orange-400 sm:whitespace-normal">
                  <Link to={primaryAction.href}>{primaryAction.label}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              ) : (
                <Button size="lg" onClick={primaryAction.onClick} className="h-auto min-h-12 rounded-lg bg-orange-500 px-5 py-3 font-semibold text-black shadow-none hover:bg-orange-400 sm:whitespace-normal">
                  {primaryAction.label}<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {secondaryActions.length > 0 ? (
          <aside className="min-w-0 border-t border-white/10 bg-black/35 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
            <ActionsHeading className="font-sans text-base font-semibold">{t("dashboard.quickActions")}</ActionsHeading>
            <nav className="mt-4 space-y-1" aria-label={`${badge}: ${t("dashboard.quickActions")}`}>
              {secondaryActions.map((action) => {
                const classes = "group flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";
                const content = <><action.icon className="h-4 w-4 shrink-0 text-white/50" aria-hidden="true" /><span className="min-w-0 flex-1 break-words">{action.label}</span><ArrowRight className="h-4 w-4 shrink-0 text-white/40" aria-hidden="true" /></>;
                return action.href ? <Link key={action.label} to={action.href} className={classes}>{content}</Link> : <button key={action.label} type="button" onClick={action.onClick} className={classes}>{content}</button>;
              })}
            </nav>
          </aside>
        ) : null}

        {stats.length > 0 ? (
          <div className="grid border-t border-white/15 bg-black/70 backdrop-blur-md [grid-template-columns:repeat(auto-fit,minmax(min(100%,8rem),1fr))] lg:col-span-full">
            {isLoading ? <p role="status" className="sr-only">{t("common.loading")}</p> : null}
            {stats.map((stat, index) => (
              <div key={index} className="min-w-0 border-b border-white/10 px-4 py-5 text-white last:border-b-0 sm:border-r xl:border-b-0 xl:px-8">
                  {isLoading ? (
                    <div aria-hidden="true" className="space-y-3">
                      <Skeleton className="h-4 w-20 bg-white/10" />
                      <Skeleton className="h-8 w-24 bg-white/10" />
                      <Skeleton className="h-3 w-28 bg-white/10" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-white/65">{stat.label}</span>
                        <stat.icon className={cn("h-4 w-4", stat.accentClass || "text-white/45")} />
                      </div>
                      <div className="break-words font-sans text-3xl font-semibold tracking-tight tabular-nums">{stat.value}</div>
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
    <aside className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] text-white">
      <div className="p-5 sm:p-6">
        <h3 className="font-sans text-xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
      </div>
      <nav aria-label={title} className="border-t border-white/10">
          {routes.map((route) =>
            route.href ? (
              <Link key={route.label} to={route.href} className="group flex min-h-16 items-center gap-4 border-b border-white/10 px-6 py-4 text-left last:border-b-0 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400">
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <route.icon className="h-4 w-4 text-orange-400" />
                    {route.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-orange-400" />
              </Link>
            ) : (
              <button key={route.label} type="button" className="group flex min-h-16 w-full items-center gap-4 border-b border-white/10 px-6 py-4 text-left last:border-b-0 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400" onClick={route.onClick}>
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
