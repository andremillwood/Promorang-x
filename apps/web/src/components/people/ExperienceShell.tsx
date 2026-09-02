import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import SEO from "@/components/SEO";
import { TicketPass } from "@/components/promorang/SignatureObjects";

type ExperienceShellProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ExperienceShell({
  title,
  eyebrow,
  description,
  backTo,
  backLabel = "Back",
  actions,
  children,
  className,
}: ExperienceShellProps) {
  const location = useLocation();
  const resolvedBack = location.pathname.startsWith("/app-preview") && location.pathname !== "/app-preview"
    ? "/app-preview"
    : backTo;
  return (
    <main className={cn("min-h-screen bg-[#0D0D0E] pb-28 text-white", className)}>
      <SEO title={`${title} — PROMORANG`} description={description || title} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_20%_0%,rgba(255,85,0,.28),transparent_42%)]" />
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
      <div className="relative mx-auto mt-8 w-full max-w-3xl space-y-5 px-4 sm:px-6">{children}</div>
    </main>
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

export function QuietEmpty({
  title,
  copy,
  action,
  stub = "—",
  kicker = "Waiting",
}: {
  title: string;
  copy: string;
  action?: ReactNode;
  stub?: string;
  kicker?: string;
}) {
  return (
    <div className="space-y-4">
      <TicketPass kicker={kicker} title={title} detail={copy} stub={stub} stubLabel="Soon" />
      {action ? <div>{action}</div> : null}
    </div>
  );
}
