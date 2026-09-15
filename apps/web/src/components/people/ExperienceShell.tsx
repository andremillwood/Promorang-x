import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { useI18n } from "@/i18n/I18nContext";

type ExperienceShellProps = {
  title: string;
  seoTitle?: string;
  eyebrow?: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  hero?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ExperienceShell({
  title,
  seoTitle,
  eyebrow,
  description,
  backTo,
  backLabel,
  actions,
  hero,
  children,
  className,
}: ExperienceShellProps) {
  const { t } = useI18n();
  const location = useLocation();
  const resolvedBackLabel = backLabel || t("common.back");
  const resolvedBack = location.pathname.startsWith("/app-preview") && location.pathname !== "/app-preview"
    ? "/app-preview"
    : backTo;

  return (
    <section
      aria-label={title}
      className={cn(
        "experience-shell relative isolate min-h-screen bg-[hsl(var(--pr-v2-canvas))] pb-28 text-[hsl(var(--pr-v2-text-1))]",
        className,
      )}
    >
      <SEO title={`${seoTitle || title} — PROMORANG`} description={description || title} />

      {hero ? (
        <div className="relative mx-auto w-full max-w-5xl px-4 pt-5 sm:px-6 lg:px-8">
          {resolvedBack ? (
            <Link
              to={resolvedBack}
              className="pr-v2-focusable mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[hsl(var(--pr-v2-text-3))] hover:text-[hsl(var(--pr-v2-text-1))]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {resolvedBackLabel}
            </Link>
          ) : null}
          {hero}
        </div>
      ) : (
        <header className="relative mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
          {resolvedBack ? (
            <Link
              to={resolvedBack}
              className="pr-v2-focusable inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[hsl(var(--pr-v2-text-3))] hover:text-[hsl(var(--pr-v2-text-1))]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {resolvedBackLabel}
            </Link>
          ) : null}
          {eyebrow ? <p className="pr-v2-eyebrow mt-5">{eyebrow}</p> : null}
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="pr-v2-title text-[hsl(var(--pr-v2-text-1))]">{title}</h1>
              {description ? <p className="pr-v2-body mt-3 max-w-2xl">{description}</p> : null}
            </div>
            {actions}
          </div>
        </header>
      )}

      <div className="relative mx-auto mt-8 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

export function ExperienceLoading({ label }: { label?: string }) {
  const { t } = useI18n();
  const resolved = label || t("experience.loading");
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <p className="text-sm text-[hsl(var(--pr-v2-text-2))]">{resolved}</p>
      <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
        <div className="h-48 rounded-[var(--pr-v2-radius-object)] border border-white/10 bg-white/[0.04]" />
        <div className="h-20 rounded-[var(--pr-v2-radius-module)] bg-white/[0.03]" />
        <div className="h-20 rounded-[var(--pr-v2-radius-module)] bg-white/[0.03]" />
      </div>
    </div>
  );
}

export function StatPile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border-y border-white/10 py-4">
      <p className="pr-v2-eyebrow">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[hsl(var(--pr-v2-text-1))]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[hsl(var(--pr-v2-text-3))]">{hint}</p> : null}
    </div>
  );
}

export function QuietEmpty({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--pr-v2-radius-module)] border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center">
      <h3 className="pr-v2-heading text-[hsl(var(--pr-v2-text-1))]">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{copy}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export type WorldInvitationCopy = {
  headline: string;
  why: string;
  benefit: string;
  nextLabel: string;
  nextHref: string;
  formingLine: string | null;
  steps: Array<{ title: string; line: string }>;
};

/** Loud about what to do and why it pays. Quiet about invented scores. */
export function WorldInvitationCard({ invitation }: { invitation: WorldInvitationCopy }) {
  const to = useExperiencePath();
  return (
    <section className="rounded-[var(--pr-v2-radius-module)] border border-white/10 bg-[hsl(var(--pr-v2-surface-1))] px-5 py-6">
      <p className="pr-v2-eyebrow">How PROMORANG works here</p>
      <h2 className="pr-v2-heading mt-2 text-[hsl(var(--pr-v2-text-1))]">{invitation.headline}</h2>
      <p className="mt-3 text-sm leading-6 text-[hsl(var(--pr-v2-text-2))]">{invitation.why}</p>
      <p className="mt-2 text-sm leading-6 text-[hsl(var(--pr-v2-text-3))]">{invitation.benefit}</p>
      <ol className="mt-5 divide-y divide-white/10 border-y border-white/10">
        {invitation.steps.map((step) => (
          <li key={step.title} className="py-3">
            <p className="text-sm font-semibold text-[hsl(var(--pr-v2-text-1))]">{step.title}</p>
            <p className="mt-1 text-xs leading-5 text-[hsl(var(--pr-v2-text-3))]">{step.line}</p>
          </li>
        ))}
      </ol>
      {invitation.formingLine ? (
        <p className="mt-4 text-sm leading-6 text-[hsl(var(--pr-v2-text-3))]">{invitation.formingLine}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-4">
        <Link to={to(invitation.nextHref)} className="pr-v2-focusable min-h-11 py-3 text-sm font-bold text-[hsl(var(--pr-v2-brand))]">
          {invitation.nextLabel}
        </Link>
        <Link to={to("/crews")} className="pr-v2-focusable min-h-11 py-3 text-sm font-bold text-[hsl(var(--pr-v2-brand))]">
          Form a Crew
        </Link>
      </div>
    </section>
  );
}
