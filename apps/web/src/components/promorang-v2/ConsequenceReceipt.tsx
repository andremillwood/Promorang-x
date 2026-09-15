import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ConsequenceReceiptLine {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}

export function ConsequenceReceipt({
  title = "What happened",
  event,
  occurredAt,
  lines,
  status = "Verified",
  next,
  className,
}: {
  title?: string;
  event: string;
  occurredAt?: string;
  lines: ConsequenceReceiptLine[];
  status?: string;
  next?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[var(--pr-v2-radius-object)] border border-[hsl(var(--pr-v2-stroke-strong))] bg-[#F2F0E9] text-[#111318] shadow-[var(--pr-v2-shadow-object)]",
        className,
      )}
      aria-label={`Consequence receipt: ${event}`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">PROMORANG · Consequence Receipt</p>
          <h3 className="mt-2 text-xl font-bold tracking-[-0.035em]">{title}</h3>
          <p className="mt-1 text-sm font-semibold">{event}</p>
          {occurredAt ? <p className="mt-1 text-xs text-black/55">{occurredAt}</p> : null}
        </div>
        <span className="shrink-0 rounded-full border border-emerald-800/20 bg-emerald-700/10 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
          {status}
        </span>
      </header>

      <dl className="divide-y divide-black/10 px-5">
        {lines.map((line) => (
          <div key={line.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-5 py-3.5">
            <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-black/48">{line.label}</dt>
            <dd className={cn("max-w-[16rem] text-right text-sm", line.emphasis ? "text-lg font-bold tracking-[-0.02em]" : "font-semibold")}>
              {line.value}
            </dd>
          </div>
        ))}
      </dl>

      {next ? (
        <footer className="border-t border-dashed border-black/20 bg-black/[0.035] px-5 py-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black/45">What happens next</p>
          <div className="text-sm font-medium">{next}</div>
        </footer>
      ) : null}
    </article>
  );
}

export default ConsequenceReceipt;
