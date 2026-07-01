import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  return (
    <section className="relative overflow-hidden rounded-lg border border-white/10 bg-black text-white shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
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
      <div className="relative">
        <div className="flex min-h-[300px] flex-col justify-end gap-7 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary" className="w-fit rounded-full border border-orange-500/30 bg-black/40 px-3 py-1 text-orange-300">
              {badge}
            </Badge>
            <div className="space-y-2">
              <h1 className="font-sans text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">{title}</h1>
              <p className="max-w-xl text-sm leading-6 text-white/65 sm:text-base">{description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) =>
              action.href ? (
                <Button
                  key={action.label}
                  asChild
                  variant={index === 0 ? "default" : "secondary"}
                  className={cn("justify-between rounded-md px-4 font-bold", index === 0 ? "bg-orange-500 text-black hover:bg-orange-400" : "border border-white/10 bg-white/10 text-white hover:bg-white/15")}
                >
                  <Link to={action.href}>
                    <span className="flex items-center gap-2">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  key={action.label}
                  variant={index === 0 ? "default" : "secondary"}
                  className={cn("justify-between rounded-md px-4 font-bold", index === 0 ? "bg-orange-500 text-black hover:bg-orange-400" : "border border-white/10 bg-white/10 text-white hover:bg-white/15")}
                  onClick={action.onClick}
                >
                  <span className="flex items-center gap-2">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ),
            )}
          </div>
        </div>

        {stats.length > 0 ? (
          <div className="grid border-t border-white/10 bg-black/55 sm:grid-cols-2 xl:grid-cols-4">
            {(isLoading ? Array.from({ length: stats.length || 4 }) : stats).map((stat, index) => (
              <div key={index} className="border-b border-white/10 p-5 text-white last:border-b-0 sm:border-r xl:border-b-0">
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
                      <div className="text-3xl font-black tracking-tight">{stat.value}</div>
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
  title = "Quick routes",
  description,
  routes,
}: DashboardQuickRoutesCardProps) => {
  return (
    <Card className="overflow-hidden rounded-lg border-border/60 bg-card/80 shadow-soft">
      <CardContent className="p-6">
        <h3 className="text-xl font-black tracking-[-0.03em]">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 space-y-2">
          {routes.map((route) =>
            route.href ? (
              <Button key={route.label} variant="ghost" className="w-full justify-between" asChild>
                <Link to={route.href}>
                  <span className="flex items-center gap-2">
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button key={route.label} variant="ghost" className="w-full justify-between" onClick={route.onClick}>
                <span className="flex items-center gap-2">
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ),
          )}
        </div>
      </CardContent>
    </Card>
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
    <Card className="rounded-lg border-border/60">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.04em]">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {ctaLabel ? (
            ctaHref ? (
              <Button variant="ghost" size="sm" asChild>
                <Link to={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={ctaOnClick}>
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {items.map((item) =>
            item.href ? (
              <Button key={item.title} variant="outline" className="h-auto justify-start rounded-lg p-0" asChild>
                <Link to={item.href} className="block w-full p-5 text-left">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                    {item.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Link>
              </Button>
            ) : (
              <button
                key={item.title}
                type="button"
                onClick={item.onClick}
                className="rounded-lg border border-border/60 bg-muted/20 p-5 text-left transition-all hover:border-primary/30 hover:shadow-soft"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                <div className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                  {item.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </button>
            ),
          )}
        </div>
      </CardContent>
    </Card>
  );
};
