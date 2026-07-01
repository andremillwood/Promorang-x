import { ReactNode } from 'react';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface SurfaceSignal {
  label: string;
  value: string | number;
  detail?: string;
}

interface OpportunitySurfaceProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  signals?: SurfaceSignal[];
  children?: ReactNode;
}

export function OpportunitySurface({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  signals = [],
  children
}: OpportunitySurfaceProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-slate-950 text-white shadow-xl shadow-slate-950/10">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{description}</p>
          {(primaryAction || secondaryAction) && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {primaryAction && (
                <button
                  onClick={primaryAction.onClick}
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              )}
              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white transition hover:border-white/35"
                >
                  {secondaryAction.label}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="rounded-[1.35rem] bg-white/8 p-4 ring-1 ring-white/10">
          <div className="grid grid-cols-2 gap-3">
            {signals.map((signal) => (
              <div key={signal.label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{signal.label}</p>
                <p className="mt-2 text-2xl font-black">{signal.value}</p>
                {signal.detail && <p className="mt-1 text-xs font-bold text-orange-200">{signal.detail}</p>}
              </div>
            ))}
          </div>
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}

interface ReceiptCardProps {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
  tone?: 'orange' | 'green' | 'blue' | 'purple' | 'slate';
}

const toneClasses = {
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200'
};

export function ReceiptCard({ icon: Icon, label, title, description, tone = 'slate' }: ReceiptCardProps) {
  return (
    <article className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <Icon className="h-5 w-5" />
        <span className="text-[11px] font-black uppercase tracking-[0.16em] opacity-75">{label}</span>
      </div>
      <h3 className="text-base font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-5 text-slate-700">{description}</p>
    </article>
  );
}

