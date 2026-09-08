import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  getValueInstrumentsByLayer,
  VALUE_STORY,
  type ValueInstrument,
  type ValueLayerId,
} from "@promorang/shared";
import { PlainEnglish } from "@/components/promorang/SignatureObjects";
import { cn } from "@/lib/utils";

const layerMark: Record<ValueLayerId, string> = {
  everyday: "from-amber-200 to-amber-500",
  value: "from-cyan-300 to-teal-500",
  access: "from-orange-300 to-orange-600",
  chances: "from-sky-300 to-indigo-500",
  parked: "from-emerald-300 to-emerald-600",
};

function InstrumentSlip({ instrument, compact }: { instrument: ValueInstrument; compact?: boolean }) {
  return (
    <Link
      to={instrument.href}
      className="block rounded-[1.3rem] border border-white/10 bg-black/30 p-4 transition hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-serif text-xl font-bold text-white">{instrument.name}</p>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200/80">
          {instrument.layer === "everyday" ? "Use" : instrument.layer === "value" ? "Hold" : instrument.layer === "access" ? "Open" : instrument.layer === "chances" ? "Chance" : "Park"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-200">{instrument.like}</p>
      {compact ? (
        <p className="mt-3 text-xs leading-5 text-amber-100/90">{instrument.shelfUse}</p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-zinc-300">{instrument.is}</p>
          <p className="mt-2 text-xs leading-5 text-white/45">{instrument.isNot}</p>
        </>
      )}
    </Link>
  );
}

export function WhatIsWhatMap({
  compact = false,
  showStory = true,
  homeLink = true,
}: {
  compact?: boolean;
  showStory?: boolean;
  homeLink?: boolean;
}) {
  const layers = getValueInstrumentsByLayer();

  return (
    <section aria-labelledby="what-is-what-title" className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-[0.2em] text-primary">What is what</p>
        <h2 id="what-is-what-title" className="mt-2 font-serif text-3xl font-bold md:text-4xl">
          Eight names. Five jobs.
        </h2>
        <p className="mt-3 text-base leading-7 text-zinc-300">
          {VALUE_STORY.loop}
        </p>
      </div>

      {showStory ? (
        <div className="grid gap-3 md:grid-cols-3">
          <PlainEnglish>{VALUE_STORY.gemsPay}</PlainEnglish>
          <PlainEnglish>{VALUE_STORY.gemsBuyBenefits}</PlainEnglish>
          <PlainEnglish>{VALUE_STORY.gemsEarn}</PlainEnglish>
        </div>
      ) : null}

      <ol className="space-y-6">
        {layers.map((layer, index) => (
          <li key={layer.id} className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#110f0d]">
            <span className={cn("block h-1.5 bg-gradient-to-r", layerMark[layer.id])} />
            <div className="p-5 md:p-6">
              <p className="font-mono text-[11px] text-amber-200/80">
                {String(index + 1).padStart(2, "0")} · {layer.label}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">{layer.meaning}</p>
              <div className={cn("mt-4 grid gap-3", layer.instruments.length > 1 ? "md:grid-cols-3" : "md:grid-cols-1")}>
                {layer.instruments.map((instrument) => (
                  <InstrumentSlip key={instrument.id} instrument={instrument} compact={compact} />
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {homeLink ? (
        <p className="text-center">
          <Link
            to="/economy"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-white"
          >
            Open the full map
            <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      ) : null}
    </section>
  );
}

export function GemSpendBenefits({ className }: { className?: string }) {
  return (
    <aside className={cn("rounded-[1.5rem] border border-cyan-300/25 bg-cyan-300/[0.07] p-5", className)}>
      <p className="text-[11px] font-bold tracking-[0.16em] text-cyan-200">Why spend Gems</p>
      <p className="mt-2 text-sm leading-6 text-zinc-100">{VALUE_STORY.gemsBuyBenefits}</p>
      <p className="mt-3 text-sm leading-6 text-zinc-300">{VALUE_STORY.gemsEarn}</p>
      <Link to="/economy/gems" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-200 hover:text-white">
        How Gems work <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}
