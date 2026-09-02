import * as React from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  actionVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  unlock?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  actionVariant = "default",
  unlock,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-label={title}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 p-8 text-center sm:p-12",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-soft">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground sm:text-xl">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {unlock ? (
        <p className="mt-3 max-w-md text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {unlock}
        </p>
      ) : null}
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <Button asChild variant={actionVariant} className="rounded-xl font-bold">
              <Link to={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button
              variant={actionVariant}
              onClick={onAction}
              className="rounded-xl font-bold"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export default EmptyState;
