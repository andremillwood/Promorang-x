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
}

export const DashboardHero = ({
  badge,
  title,
  description,
  actions,
  stats = [],
  isLoading = false,
  glowClassName,
}: DashboardHeroProps) => {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-charcoal p-6 text-white sm:p-8">
      <div
        className={cn(
          "absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,167,38,0.20),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(244,81,30,0.16),_transparent_34%)]",
          glowClassName,
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/25" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary" className="w-fit rounded-full border-0 bg-white/10 px-3 py-1 text-white/90">
              {badge}
            </Badge>
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-bold sm:text-4xl">{title}</h1>
              <p className="max-w-xl text-sm text-white/75 sm:text-base">{description}</p>
            </div>
          </div>

          <div className={cn("grid grid-cols-1 gap-3", actions.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
            {actions.map((action) =>
              action.href ? (
                <Button
                  key={action.label}
                  asChild
                  variant="secondary"
                  className="justify-between rounded-2xl border-0 bg-white/10 px-4 text-white hover:bg-white/15"
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
                  variant="secondary"
                  className="justify-between rounded-2xl border-0 bg-white/10 px-4 text-white hover:bg-white/15"
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(isLoading ? Array.from({ length: stats.length || 4 }) : stats).map((stat, index) => (
              <Card key={index} className="border-white/10 bg-white/5 text-white shadow-none">
                <CardContent className="p-4">
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
                      <div className="text-3xl font-semibold">{stat.value}</div>
                      <div className="mt-1 text-xs text-white/65">{stat.helper}</div>
                    </>
                  )}
                </CardContent>
              </Card>
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
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold">{title}</h3>
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
    <Card className="border-border/60">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold">{title}</h2>
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
              <Button key={item.title} variant="outline" className="h-auto justify-start rounded-3xl p-0" asChild>
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
                className="rounded-3xl border border-border/60 bg-muted/20 p-5 text-left transition-all hover:border-primary/30 hover:shadow-soft"
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
