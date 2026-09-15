import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PromorangV2Role =
  | "participant"
  | "creator"
  | "host"
  | "merchant"
  | "brand"
  | "agency"
  | "admin";

export type OutcomeStageStatus = "complete" | "current" | "upcoming";

export interface OutcomeStage {
  id: string;
  label: string;
  status: OutcomeStageStatus;
}

export interface WorkspaceOption {
  id: string;
  label: string;
  role: PromorangV2Role;
  detail?: string;
}

export function PageCanvas({
  role = "participant",
  children,
  className,
}: {
  role?: PromorangV2Role;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("pr-v2-canvas pr-v2-role-accent", className)} data-role={role}>
      <div className="pr-v2-page pr-v2-page-stack">{children}</div>
    </main>
  );
}

export function PageLead({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end", className)}>
      <div className="min-w-0 max-w-3xl space-y-3">
        {eyebrow ? <p className="pr-v2-eyebrow">{eyebrow}</p> : null}
        <h1 className="pr-v2-title text-[hsl(var(--pr-v2-text-1))]">{title}</h1>
        {description ? <p className="pr-v2-body max-w-2xl">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function OutcomeSurface({
  children,
  className,
  elevated = false,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <section className={cn(elevated ? "pr-v2-surface-elevated" : "pr-v2-surface", "p-5 md:p-6", className)}>
      {children}
    </section>
  );
}

export function NextMove({
  eyebrow = "Your next move",
  title,
  description,
  reason,
  action,
  aside,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  reason?: string;
  action: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[var(--pr-v2-radius-object)] border border-[hsl(var(--pr-v2-stroke-strong))] bg-[hsl(var(--pr-v2-surface-2))] p-5 shadow-[var(--pr-v2-shadow-object)] md:p-7",
        className,
      )}
      aria-labelledby="pr-v2-next-move-title"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[hsl(var(--pr-v2-active-role))]"
        aria-hidden="true"
      />
      <div className={cn("grid gap-6", aside ? "lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)] lg:items-stretch" : "")}>
        <div className="min-w-0 space-y-4">
          <p className="pr-v2-eyebrow pr-v2-accent-text">{eyebrow}</p>
          <div className="space-y-2">
            <h2 id="pr-v2-next-move-title" className="pr-v2-heading text-[hsl(var(--pr-v2-text-1))] md:text-[1.75rem]">
              {title}
            </h2>
            {description ? <p className="pr-v2-body max-w-2xl">{description}</p> : null}
            {reason ? <p className="text-sm text-[hsl(var(--pr-v2-text-3))]">{reason}</p> : null}
          </div>
          <div className="pt-1">{action}</div>
        </div>
        {aside ? <div className="min-w-0">{aside}</div> : null}
      </div>
    </section>
  );
}

export function OutcomeProgress({
  stages,
  label = "Outcome progress",
  className,
}: {
  stages: OutcomeStage[];
  label?: string;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)} aria-label={label}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="pr-v2-heading text-base text-[hsl(var(--pr-v2-text-1))]">{label}</h2>
        <span className="text-xs text-[hsl(var(--pr-v2-text-3))]">
          {stages.filter((stage) => stage.status === "complete").length}/{stages.length} complete
        </span>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-none lg:auto-cols-fr lg:grid-flow-col">
        {stages.map((stage, index) => {
          const complete = stage.status === "complete";
          const current = stage.status === "current";
          return (
            <li key={stage.id} className="relative min-w-0">
              <div className="flex min-h-11 items-center gap-3">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold",
                    complete && "border-[hsl(var(--pr-v2-active-role))] bg-[hsl(var(--pr-v2-active-role))] text-black",
                    current && "border-[hsl(var(--pr-v2-active-role))] text-[hsl(var(--pr-v2-active-role))]",
                    stage.status === "upcoming" && "border-[hsl(var(--pr-v2-stroke-strong))] text-[hsl(var(--pr-v2-text-3))]",
                  )}
                  aria-current={current ? "step" : undefined}
                >
                  {complete ? "✓" : index + 1}
                </span>
                <span
                  className={cn(
                    "min-w-0 text-sm font-medium",
                    current || complete ? "text-[hsl(var(--pr-v2-text-1))]" : "text-[hsl(var(--pr-v2-text-3))]",
                  )}
                >
                  {stage.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function EvidenceBlock({
  eyebrow,
  value,
  label,
  description,
  className,
}: {
  eyebrow: string;
  value?: ReactNode;
  label: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={cn("min-w-0 space-y-2", className)}>
      <p className="pr-v2-eyebrow">{eyebrow}</p>
      {value ? <div className="text-3xl font-semibold tracking-[-0.035em] text-[hsl(var(--pr-v2-text-1))]">{value}</div> : null}
      <h3 className="text-sm font-semibold text-[hsl(var(--pr-v2-text-1))]">{label}</h3>
      {description ? <p className="text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{description}</p> : null}
    </section>
  );
}

export function ProofBlock(props: Omit<Parameters<typeof EvidenceBlock>[0], "eyebrow">) {
  return <EvidenceBlock eyebrow="Proof" {...props} />;
}

export function ValueBlock(props: Omit<Parameters<typeof EvidenceBlock>[0], "eyebrow">) {
  return <EvidenceBlock eyebrow="Value" {...props} />;
}

export function EvidencePair({
  proof,
  value,
  className,
}: {
  proof: Parameters<typeof ProofBlock>[0];
  value: Parameters<typeof ValueBlock>[0];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-6 border-y border-[hsl(var(--pr-v2-stroke-soft))] py-6 md:grid-cols-2 md:divide-x md:divide-[hsl(var(--pr-v2-stroke-soft))]", className)}>
      <ProofBlock {...proof} />
      <ValueBlock {...value} className={cn("md:pl-6", value.className)} />
    </div>
  );
}

export function WorkspaceSwitcher({
  value,
  options,
  onChange,
  label = "Workspace",
  className,
}: {
  value: string;
  options: WorkspaceOption[];
  onChange: (workspaceId: string) => void;
  label?: string;
  className?: string;
}) {
  const current = options.find((option) => option.id === value);
  return (
    <label className={cn("inline-grid min-w-[13rem] gap-1.5", className)}>
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--pr-v2-text-3))]">{label}</span>
      <span className="relative">
        <select
          className="pr-v2-focusable min-h-11 w-full appearance-none rounded-[var(--pr-v2-radius-control)] border border-[hsl(var(--pr-v2-stroke-strong))] bg-[hsl(var(--pr-v2-surface-2))] px-3 pr-9 text-sm font-semibold text-[hsl(var(--pr-v2-text-1))]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}{option.detail ? ` — ${option.detail}` : ""}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-[hsl(var(--pr-v2-text-3))]" aria-hidden="true">
          ▾
        </span>
      </span>
      {current ? <span className="sr-only">Current role: {current.role}</span> : null}
    </label>
  );
}
