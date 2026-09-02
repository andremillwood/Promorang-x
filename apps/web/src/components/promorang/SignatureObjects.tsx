import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { TactileButton } from "@/components/ui/TactileButton";
import { cn } from "@/lib/utils";

export function PlainEnglish({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-2xl border border-amber-300/25 bg-amber-300/[0.08] px-4 py-3.5 sm:px-5">
      <p className="text-[11px] font-bold tracking-[0.16em] text-amber-200">In plain English</p>
      <p className="mt-1.5 text-sm leading-6 text-zinc-100 sm:text-base">{children}</p>
    </aside>
  );
}

type PromoCardFaceProps = {
  available?: string;
  limit?: string;
  holder?: string;
  places?: string;
  caption?: string;
  serial?: string;
  className?: string;
};

export function PromoCardFace({
  available = "$24.00",
  limit = "$40.00",
  holder = "Member card",
  places = "Partner shops nearby",
  caption = "Available to spend",
  serial = "PR · 0842",
  className,
}: PromoCardFaceProps) {
  return (
    <article className={cn("pr-plastic-card w-full max-w-md p-5 text-white sm:p-6", className)} aria-label="PromoCard">
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-amber-200/80">PROMORANG</p>
            <h3 className="mt-1 font-serif text-2xl font-bold tracking-tight">PromoCard</h3>
          </div>
          <span className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 shadow-inner" aria-hidden />
        </div>
        <div>
          <p className="text-[11px] tracking-wide text-white/55">{caption}</p>
          <p className="mt-0.5 font-serif text-4xl font-bold tracking-tight text-amber-100">{available}</p>
          <p className="mt-1 text-xs text-white/50">{limit ? `of ${limit} this cycle · ${places}` : places}</p>
        </div>
        <div className="flex items-end justify-between gap-3 text-[11px] text-white/60">
          <span>{holder}</span>
          <span className="font-mono tracking-widest">{serial}</span>
        </div>
      </div>
    </article>
  );
}

type TicketPassProps = {
  kicker: string;
  title: string;
  detail: string;
  stub: string;
  stubLabel?: string;
  className?: string;
};

export function TicketPass({ kicker, title, detail, stub, stubLabel = "Keep", className }: TicketPassProps) {
  return (
    <article className={cn("pr-ticket min-h-[148px] rounded-2xl", className)}>
      <div className="p-4 sm:p-5">
        <p className="text-[10px] font-bold tracking-[0.18em] text-orange-700">{kicker}</p>
        <h3 className="mt-1 font-serif text-xl font-bold leading-tight text-[#1a120c]">{title}</h3>
        <p className="mt-2 text-sm leading-5 text-[#4a3b2f]">{detail}</p>
      </div>
      <div className="pr-ticket-stub">
        <p className="rotate-180 text-[9px] font-bold tracking-[0.18em] text-[#7a6554]" style={{ writingMode: "vertical-rl" }}>
          {stubLabel}
        </p>
        <p className="mt-2 font-mono text-xs font-bold text-[#1a120c]">{stub}</p>
      </div>
    </article>
  );
}

type PaperReceiptProps = {
  heading: string;
  lines: Array<{ label: string; value: string; strong?: boolean }>;
  footer?: string;
  className?: string;
};

export function PaperReceipt({ heading, lines, footer, className }: PaperReceiptProps) {
  return (
    <article className={cn("pr-receipt px-5 py-7 font-mono", className)}>
      <p className="text-center text-[10px] font-bold tracking-[0.22em] text-[#7a6554]">PROMORANG</p>
      <h3 className="mt-1 text-center font-serif text-lg font-bold text-[#1a120c]">{heading}</h3>
      <div className="mt-4 space-y-2 border-t border-dashed border-[#1a120c]/20 pt-3 text-[12px]">
        {lines.map((line) => (
          <div key={line.label} className="flex items-start justify-between gap-3">
            <span className="text-[#5c4a3c]">{line.label}</span>
            <span className={cn("text-right", line.strong ? "font-bold text-[#1a120c]" : "text-[#1a120c]")}>{line.value}</span>
          </div>
        ))}
      </div>
      {footer ? <p className="mt-4 text-center text-[11px] leading-5 text-[#6a5646]">{footer}</p> : null}
    </article>
  );
}

type RelicProps = {
  serial: string;
  title: string;
  origin: string;
  perk: string;
  className?: string;
};

export function CollectibleRelic({ serial, title, origin, perk, className }: RelicProps) {
  return (
    <article className={cn("pr-relic rounded-3xl border border-purple-300/20 p-5 text-white", className)}>
      <p className="font-mono text-[10px] tracking-[0.2em] text-purple-200/80">{serial}</p>
      <h3 className="mt-3 font-serif text-2xl font-bold leading-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/65">{origin}</p>
      <p className="mt-4 border-t border-white/10 pt-3 text-sm text-purple-100">{perk}</p>
    </article>
  );
}

type TrailStep = {
  label: string;
  title: string;
  text: string;
};

export function NightTrail({
  eyebrow,
  title,
  steps,
}: {
  eyebrow: string;
  title: string;
  steps: TrailStep[];
}) {
  return (
    <section aria-labelledby="night-trail-heading">
      <p className="text-xs font-bold tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 id="night-trail-heading" className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">
        {title}
      </h2>
      <ol className="mt-8 grid gap-0 md:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.label} className="relative border-l border-white/10 px-5 py-4 md:border-l-0 md:border-t md:px-4 md:pt-8">
            <span className="absolute -left-2 top-4 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-black md:-top-2 md:left-4">
              {index + 1}
            </span>
            <p className="text-[11px] font-bold tracking-[0.16em] text-amber-200/80">{step.label}</p>
            <h3 className="mt-2 font-serif text-lg font-bold text-white">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

type MoneyPot = {
  label: string;
  detail: string;
  mark: string;
};

export function MoneyPots({ pots }: { pots: MoneyPot[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {pots.map((pot, index) => (
        <article key={pot.label} className="rounded-[1.6rem] border border-emerald-400/20 bg-[radial-gradient(circle_at_top,#14532d33,transparent_42%),#0c0c0c] p-5">
          <p className="font-mono text-[11px] text-emerald-300">Pot {index + 1}</p>
          <h3 className="mt-2 font-serif text-xl font-bold text-white">{pot.label}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{pot.detail}</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            {pot.mark}
          </p>
        </article>
      ))}
    </div>
  );
}

type RoleOption = {
  role: string;
  why: string;
  outcome: string;
  action: string;
  href: string;
};

export function RoleLens({
  roles,
  selectedIndex,
  onSelect,
}: {
  roles: RoleOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const active = roles[selectedIndex] ?? roles[0];

  return (
    <div>
      <div role="tablist" aria-label="Who you are" className="flex flex-wrap gap-2">
        {roles.map((role, index) => (
          <button
            key={role.role}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            onClick={() => onSelect(index)}
            className={cn(
              "min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selectedIndex === index
                ? "bg-white text-black"
                : "border border-white/15 bg-white/[0.04] text-zinc-300 hover:text-white",
            )}
          >
            {role.role}
          </button>
        ))}
      </div>
      <article className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 md:p-8" role="tabpanel">
        <h3 className="font-serif text-2xl font-bold text-white md:text-3xl">{active.why}</h3>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">{active.outcome}</p>
        <div className="mt-6">
          <TactileButton variant="primary" size="lg" asChild>
            <Link to={active.href}>
              {active.action}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </TactileButton>
        </div>
      </article>
    </div>
  );
}

export function ObjectShelf({
  items,
}: {
  items: Array<{
    href: string;
    name: string;
    like: string;
    use: string;
    active?: boolean;
  }>;
}) {
  const marks: Record<string, string> = {
    PromoCard: "from-amber-200 to-amber-500",
    Points: "from-amber-400 to-orange-600",
    Keys: "from-orange-300 to-orange-600",
    "Daily streak": "from-amber-300 to-red-500",
    Pieces: "from-purple-300 to-fuchsia-600",
    Gems: "from-cyan-300 to-teal-500",
  };

  return (
    <ul className="flex gap-4 overflow-x-auto pb-2 pr-scroll-rail">
      {items.map((item) => (
        <li key={item.name} className="min-w-[240px] max-w-[260px] shrink-0">
          <Link
            to={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "block h-full overflow-hidden rounded-[1.4rem] border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              item.active ? "border-primary/50 bg-primary/10" : "border-white/10 bg-white/[0.03] hover:border-white/25",
            )}
          >
            <span className={cn("block h-2 bg-gradient-to-r", marks[item.name] ?? "from-primary to-amber-400")} />
            <span className="block p-5">
              <p className="font-serif text-xl font-bold text-white">{item.name}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{item.like}</p>
              <p className="mt-4 text-xs leading-5 text-amber-200/90">{item.use}</p>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function StatusChip({ ok, children }: { ok?: boolean; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-zinc-200">
      {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : null}
      {children}
    </span>
  );
}
