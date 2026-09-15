import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type OpportunityCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  imageAlt?: string;
  status?: string;
  meta?: ReactNode;
  value?: ReactNode;
  proof?: ReactNode;
  actionLabel: string;
  action: ReactNode;
  className?: string;
};

export function OpportunityCard({
  eyebrow = "Opportunity",
  title,
  description,
  imageUrl,
  imageAlt = "",
  status,
  meta,
  value,
  proof,
  actionLabel,
  action,
  className,
}: OpportunityCardProps) {
  return (
    <article className={cn("overflow-hidden border-y border-[hsl(var(--pr-v2-stroke-soft))] py-5", className)}>
      <div className={cn("grid gap-5", imageUrl && "sm:grid-cols-[180px_minmax(0,1fr)]")}>
        {imageUrl ? (
          <div className="aspect-[4/3] overflow-hidden rounded-[var(--pr-v2-radius-control)] bg-[hsl(var(--pr-v2-surface-2))] sm:aspect-auto sm:min-h-[150px]">
            <img src={imageUrl} alt={imageAlt} className="h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="pr-v2-eyebrow">{eyebrow}</p>
            {status ? <span className="rounded-full border border-[hsl(var(--pr-v2-stroke-soft))] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[hsl(var(--pr-v2-text-3))]">{status}</span> : null}
          </div>
          <h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.03em] text-[hsl(var(--pr-v2-text-1))]">{title}</h3>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{description}</p> : null}
          {meta ? <div className="mt-3 text-xs text-[hsl(var(--pr-v2-text-3))]">{meta}</div> : null}
          {(value || proof) ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {value ? <div><dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--pr-v2-text-3))]">Value</dt><dd className="mt-1 text-sm font-semibold text-[hsl(var(--pr-v2-text-1))]">{value}</dd></div> : null}
              {proof ? <div><dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--pr-v2-text-3))]">Proof</dt><dd className="mt-1 text-sm font-semibold text-[hsl(var(--pr-v2-text-1))]">{proof}</dd></div> : null}
            </dl>
          ) : null}
          <div className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[hsl(var(--pr-v2-active-role))]">
            {action}
            <span className="sr-only">{actionLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
      </div>
    </article>
  );
}

export default OpportunityCard;
