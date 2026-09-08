import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import { useExperiencePath } from "@/hooks/useExperiencePath";

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
  backLabel = "Back",
  actions,
  hero,
  children,
  className,
}: ExperienceShellProps) {
  const location = useLocation();
  const resolvedBack = location.pathname.startsWith("/app-preview") && location.pathname !== "/app-preview"
    ? "/app-preview"
    : backTo;
  return (
    <section aria-label={title} className={cn("experience-shell relative isolate min-h-screen bg-[#0D0D0E] pb-28 text-white", className)}>
      <SEO title={`${seoTitle || title} — PROMORANG`} description={description || title} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_0%,rgba(255,85,0,.28),transparent_42%)]" />
      {hero ? (
        <div className="relative mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
          {resolvedBack ? (
            <Link to={resolvedBack} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-white/50 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          ) : null}
          {hero}
        </div>
      ) : (
        <header className="relative mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
          {resolvedBack ? (
            <Link to={resolvedBack} className="inline-flex min-h-11 items-center gap-2 text-sm text-white/50 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          ) : null}
          {eyebrow ? <p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-primary">{eyebrow}</p> : null}
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-4xl font-bold leading-[0.92] tracking-tight sm:text-5xl">{title}</h1>
              {description ? <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{description}</p> : null}
            </div>
            {actions}
          </div>
        </header>
      )}
      <div className="relative mx-auto mt-8 w-full max-w-3xl space-y-5 px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function ExperienceLoading({ label = "Loading your experience…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <p className="text-sm text-white/70">{label}</p>
      <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
        <div className="h-56 rounded-3xl border border-white/10 bg-white/[0.06]" />
        <div className="h-24 rounded-2xl bg-white/[0.04]" />
        <div className="h-24 rounded-2xl bg-white/[0.04]" />
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
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-white/45">{hint}</p> : null}
    </div>
  );
}

export function QuietEmpty({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return (
    <div className="rounded-[1.8rem] border border-dashed border-white/15 bg-white/[0.03] px-5 py-8 text-center">
      <h3 className="font-serif text-2xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/50">{copy}</p>
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
    <section className="rounded-[1.6rem] border border-primary/40 bg-primary/10 px-5 py-6">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">This is how Promorang works</p>
      <h2 className="mt-2 font-serif text-3xl font-bold">{invitation.headline}</h2>
      <p className="mt-3 text-sm leading-6 text-white/70">{invitation.why}</p>
      <p className="mt-2 text-sm leading-6 text-white/55">{invitation.benefit}</p>
      <ol className="mt-5 space-y-3">
        {invitation.steps.map((step) => (
          <li key={step.title} className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-sm font-bold">{step.title}</p>
            <p className="mt-1 text-xs leading-5 text-white/50">{step.line}</p>
          </li>
        ))}
      </ol>
      {invitation.formingLine ? (
        <p className="mt-4 text-sm leading-6 text-white/45">{invitation.formingLine}</p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-4">
        <Link to={to(invitation.nextHref)} className="text-sm font-bold text-primary">
          {invitation.nextLabel}
        </Link>
        <Link to={to("/crews")} className="text-sm font-bold text-primary">
          Form a Crew
        </Link>
      </div>
    </section>
  );
}
