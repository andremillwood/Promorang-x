import { Link, useLocation } from "react-router-dom";
import { Archive, Compass, Home, Plus, Radio } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  destinationHrefForSession,
  isPrimaryDestinationActive,
  PRIMARY_DESTINATIONS,
  type PrimaryDestinationId,
} from "@/lib/primary-destinations";
import { cn } from "@/lib/utils";

const ICONS: Record<PrimaryDestinationId, typeof Home> = {
  today: Home,
  discover: Compass,
  create: Plus,
  progress: Radio,
  vault: Archive,
};

type PrimaryDestinationNavProps = {
  variant?: "header" | "drawer" | "bar";
  dark?: boolean;
  preview?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function PrimaryDestinationNav({
  variant = "header",
  dark = false,
  preview = false,
  onNavigate,
  className,
}: PrimaryDestinationNavProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const signedIn = Boolean(user);
  const inPreview = preview || location.pathname.startsWith("/app-preview");

  if (variant === "drawer") {
    return (
      <div className={cn("space-y-2", className)}>
        <p className={cn("px-2 text-[10px] font-bold uppercase tracking-wider", dark ? "text-white/40" : "text-muted-foreground")}>
          {t("dest.map")}
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {PRIMARY_DESTINATIONS.map((dest) => {
            const Icon = ICONS[dest.id];
            const href = destinationHrefForSession(dest.href, signedIn, inPreview);
            const active = isPrimaryDestinationActive(location.pathname, dest.href, location.search);
            return (
              <Link
                key={dest.id}
                to={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition",
                  dark
                    ? active
                      ? "bg-primary/20 text-primary"
                      : "bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                    : active
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-foreground hover:bg-accent",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block">{t(dest.labelKey)}</span>
                  <span className={cn("block text-[11px] font-medium", dark ? "text-white/45" : "text-muted-foreground")}>
                    {t(dest.questionKey)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <nav
        aria-label={t("dest.map")}
        className={cn(
          "grid grid-cols-5 gap-1 rounded-[1.4rem] border border-white/10 bg-black/70 p-1 backdrop-blur-xl",
          className,
        )}
      >
        {PRIMARY_DESTINATIONS.map((dest) => {
          const Icon = ICONS[dest.id];
          const href = destinationHrefForSession(dest.href, signedIn, inPreview);
          const active = isPrimaryDestinationActive(location.pathname, dest.href, location.search);
          return (
            <Link
              key={dest.id}
              to={href}
              onClick={onNavigate}
              title={t(dest.questionKey)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-bold uppercase tracking-wide",
                active ? "bg-primary text-black" : "text-white/55 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(dest.labelKey)}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label={t("dest.map")}
      className={cn(
        "hidden items-center gap-0.5 rounded-full border px-1 py-1 lg:flex",
        dark ? "border-white/[0.08] bg-white/[0.03]" : "border-border bg-muted/70",
        className,
      )}
    >
      {PRIMARY_DESTINATIONS.map((dest) => {
        const Icon = ICONS[dest.id];
        const href = destinationHrefForSession(dest.href, signedIn, inPreview);
        const active = isPrimaryDestinationActive(location.pathname, dest.href, location.search);
        return (
          <Link
            key={dest.id}
            to={href}
            title={t(dest.questionKey)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition",
              dark
                ? active
                  ? "bg-white text-black"
                  : "text-white/70 hover:bg-white/[0.08] hover:text-white"
                : active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t(dest.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
