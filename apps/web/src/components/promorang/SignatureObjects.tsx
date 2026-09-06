import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Coins, Gem, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { TactileButton } from "@/components/ui/TactileButton";
import { TiltCard3D } from "@/components/ui/TiltCard3D";
import { cn } from "@/lib/utils";

export function formatPromoPassId(userId?: string | null) {
  const passIdRaw = (userId || "876049210038").replace(/[^a-zA-Z0-9]/g, "").padEnd(12, "0").toUpperCase();
  return `PROMO • ${passIdRaw.slice(0, 4)} • ${passIdRaw.slice(4, 8)} • ${passIdRaw.slice(8, 12)}`;
}

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
  className?: string;
  userId?: string | null;
  userTier?: string;
  points?: number;
  promoKeys?: number;
  gems?: number;
  status?: string;
  tilt?: boolean;
};

export function PromoCardFace({
  available = "$24.00",
  limit = "$40.00",
  holder = "Member card",
  places = "Partner shops nearby",
  className,
  userId,
  userTier = "Starter",
  points,
  promoKeys,
  gems,
  status = "Active",
  tilt = false,
}: PromoCardFaceProps) {
  const showBalances = points != null || promoKeys != null || gems != null;
  const card = (
    <article
      className={cn(
        "pr-plastic-card relative aspect-[1.586/1] w-full select-none overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-neutral-900 via-[#16121a] to-[#0a080c] p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-2xl",
        className,
      )}
      aria-label="PromoCard"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,106,0,0.28),transparent_42%),radial-gradient(circle_at_20%_85%,rgba(168,85,247,0.22),transparent_48%),linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_50%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-9 items-center justify-center rounded-md border border-amber-400/40 bg-gradient-to-tr from-amber-500/30 via-yellow-400/20 to-amber-600/40 shadow-inner">
              <div className="h-4 w-6 rounded border border-amber-300/30 bg-amber-400/10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
              Promorang Pass
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
            <ShieldCheck className="h-3 w-3" />
            {status}
          </div>
        </div>

        <div className="my-4 space-y-3">
          <p className="font-mono text-xs tracking-widest text-white/50">{formatPromoPassId(userId)}</p>
          {showBalances ? (
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/40 p-2.5 backdrop-blur-md">
              <div className="text-left">
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                  <Coins className="h-2.5 w-2.5" />
                  Pts
                </div>
                <p className="mt-0.5 text-sm font-black text-white">{Number(points || 0).toLocaleString()}</p>
              </div>
              <div className="text-left border-l border-white/10 pl-2.5">
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary">
                  <KeyRound className="h-2.5 w-2.5" />
                  Keys
                </div>
                <p className="mt-0.5 text-sm font-black text-white">{Number(promoKeys || 0).toLocaleString()}</p>
              </div>
              <div className="text-left border-l border-white/10 pl-2.5">
                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-violet-400">
                  <Gem className="h-2.5 w-2.5" />
                  Gems
                </div>
                <p className="mt-0.5 text-sm font-black text-white">{Number(gems || 0).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/40 p-2.5 backdrop-blur-md">
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Available to spend</p>
              <p className="mt-0.5 text-xl font-black tracking-tight text-white">{available}</p>
              <p className="mt-1 text-[10px] text-white/50">of {limit} this cycle · {places}</p>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between border-t border-white/10 pt-2.5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">Cardholder</p>
            <p className="text-xs font-black uppercase tracking-wider text-white line-clamp-1">{holder}</p>
          </div>
          <div className="flex items-center gap-1.5 text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">{userTier}</span>
          </div>
        </div>
      </div>
    </article>
  );

  if (!tilt) return card;

  return (
    <TiltCard3D maxTilt={14} perspective={1200} scaleOnHover={1.03} className="w-full">
      {card}
    </TiltCard3D>
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
