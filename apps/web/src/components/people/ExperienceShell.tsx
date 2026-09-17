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
    <section aria-label={title} className={cn("experience-shell participant-world pb-28 text-white", className)}>
      <SEO title={`${seoTitle || title} — PROMORANG`} description={description || title} />

      {hero ? (
        <div className="pr-world-wrap pr-world-header">
          {resolvedBack ? (
            <Link to={resolvedBack} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/50 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              {resolvedBackLabel}
            </Link>
          ) : null}
          {hero}
        </div>
      ) : (
        <header className="pr-world-wrap pr-world-header">
          {resolvedBack ? (
            <Link to={resolvedBack} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/50 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              {resolvedBackLabel}
            </Link>
          ) : null}

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              {eyebrow ? <p className="pr-world-kicker">{eyebrow}</p> : null}
              <h1 className="pr-world-display mt-4 max-w-4xl">{title}</h1>
              {description ? <p className="pr-world-copy mt-5 max-w-2xl">{description}</p> : null}
            </div>
            {actions ? <div className="lg:pb-1">{actions}</div> : null}
          </div>
          <div className="pr-world-rule mt-8" />
        </header>
      )}

      <div className="pr-world-canvas">{children}</div>
    </section>
  );
}

export function ExperienceLoading({ label }: { label?: string }) {
  const { t } = useI18n();
  const resolved = label || t("experience.loading");
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <p className="pr-world-kicker">{resolved}</p>
      <div aria-hidden="true" className="grid gap-4 motion-safe:animate-pulse md:grid-cols-[1.4fr_.6fr]">
        <div className="h-72 rounded-[2rem] border border-white/10 bg-white/[0.05]" />
        <div className="h-72 rounded-[2rem] border border-white/10 bg-white/[0.035]" />
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
    <div className="pr-world-ledger-item">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <p className="mt-1 text-xs leading-5 text-white/40">{hint}</p> : null}
    </div>
  );
}

export function QuietEmpty({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return (
    <div className="pr-world-empty px-6 py-10">
      <div>
        <p className="pr-world-kicker">Nothing invented</p>
        <h3 className="mt-3 font-serif text-3xl font-bold tracking-tight">{title}</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">{copy}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
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
    <section className="pr-world-panel pr-world-panel--signal overflow-hidden p-6 sm:p-8">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.72fr)] lg:items-end">
        <div>
          <p className="pr-world-kicker">How PROMORANG moves</p>
          <h2 className="mt-3 max-w-xl font-serif text-4xl font-bold leading-[.95] tracking-tight sm:text-5xl">{invitation.headline}</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">{invitation.why}</p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/45">{invitation.benefit}</p>
        </div>
        <ol className="space-y-2">
          {invitation.steps.map((step, index) => (
            <li key={step.title} className="grid grid-cols-[34px_1fr] gap-3 border-t border-white/10 py-3">
              <span className="font-mono text-xs font-black text-primary">0{index + 1}</span>
              <div>
                <p className="text-sm font-black">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-white/45">{step.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {invitation.formingLine ? <p className="mt-5 text-sm leading-6 text-white/45">{invitation.formingLine}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={to(invitation.nextHref)} className="pr-world-primary">
          {invitation.nextLabel}
        </Link>
        <Link to={to("/crews")} className="pr-world-chip">
          Form a Crew
        </Link>
      </div>
    </section>
  );
}
