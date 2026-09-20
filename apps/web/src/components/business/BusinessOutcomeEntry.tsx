import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { BUSINESS_OUTCOMES, PROGRAMMES } from "@/lib/business-outcomes";

export function BusinessOutcomeEntry({ role }: { role: "brand" | "merchant" }) {
  const visible = role === "merchant"
    ? BUSINESS_OUTCOMES.filter((item) => ["bring-people-in", "quiet-period", "move-this", "bring-back"].includes(item.id))
    : BUSINESS_OUTCOMES.filter((item) => ["launch", "try-it", "move-this", "learn-demand"].includes(item.id));

  return (
    <section className="rounded-3xl border border-orange-300/15 bg-gradient-to-br from-orange-300/[0.08] via-black to-black p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Start from the outcome</p>
          <h2 className="mt-2 max-w-3xl text-2xl font-black sm:text-3xl">What do you need to make happen?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Choose the business change. PROMORANG can shape the programme and then hand you the operating tools.</p>
        </div>
        <Link to="/business/start" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-400 px-5 text-xs font-black text-black">Build a programme <Sparkles className="h-4 w-4" /></Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((item) => (
          <Link key={item.id} to={`/business/start?outcome=${item.id}`} className="group rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-orange-300/35">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-300">{item.short}</p>
            <h3 className="mt-2 text-sm font-black">{item.title}</h3>
            <ArrowRight className="mt-4 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-orange-300" />
          </Link>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-white/30">{PROGRAMMES.length} starting programme recipes available. Every route remains customizable before launch.</p>
    </section>
  );
}

export default BusinessOutcomeEntry;
