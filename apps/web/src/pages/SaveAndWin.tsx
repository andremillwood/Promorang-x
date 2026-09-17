import { useQuery } from "@tanstack/react-query";
import SEO from "@/components/SEO";
import { VALUE_INSTRUMENTS, VALUE_STORY } from "@promorang/shared";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, ShieldCheck, Ticket } from "lucide-react";
import { PaperReceipt, PlainEnglish } from "@/components/promorang/SignatureObjects";
import { NoLossLotteryService } from "@/lib/nodes/noLossLotteryService";

function formatDrawTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Draw time not recorded";
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function SaveAndWin() {
  const pot = VALUE_INSTRUMENTS["save-and-win"];
  const pools = useQuery({
    queryKey: ["save-and-win", "active-pools"],
    queryFn: () => NoLossLotteryService.getActivePrizePools(),
  });

  return (
    <main data-canonical-family="retained-value" className="min-h-screen bg-[#090909] pb-24 pt-24 text-white">
      <SEO title={`${pot.name} · Promorang`} description={VALUE_STORY.saveAndWin} />

      <section className="container px-4 md:px-6">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">{pot.name}</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl font-bold leading-[.95] tracking-tight sm:text-7xl">
              Park Gems. Keep the principal. A named draw decides the extra.
            </h1>
            <div className="mt-6 max-w-2xl">
              <PlainEnglish>{VALUE_STORY.saveAndWin}</PlainEnglish>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">{pot.isNot}</p>
          </div>

          <PaperReceipt
            heading="Truth boundary"
            lines={[
              { label: "Parked Gems", value: "Retained principal", strong: true },
              { label: "Ticket", value: "Chance in one named draw" },
              { label: "Win", value: "Extra Gems from that draw" },
              { label: "Loss", value: "Does not mean principal loss" },
            ]}
            footer="A ticket is not money, a guarantee, or proof that a win occurred."
          />
        </div>
      </section>

      <section className="container px-4 py-12 md:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-300">Live source</p>
            <h2 className="mt-2 font-serif text-3xl font-bold">Active Save & Win pools</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              These cards come from the active prize-pool records. No sample balance, membership tier, streak, ticket count, or personal win is being invented on this page.
            </p>
          </div>
          <Link to="/promoshare" className="inline-flex items-center gap-2 text-sm font-bold text-amber-200 hover:text-white">
            Open PromoShare <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pools.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="h-56 animate-pulse rounded-[1.6rem] bg-white/[0.04]" />)}
          </div>
        ) : pools.isError ? (
          <div className="rounded-[1.6rem] border border-red-400/20 bg-red-400/5 p-6">
            <p className="font-bold">Save & Win pools could not be loaded.</p>
            <p className="mt-2 text-sm text-white/45">No demo pools are being substituted.</p>
          </div>
        ) : pools.data?.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {pools.data.map((pool: any) => (
              <article key={pool.id} className="rounded-[1.6rem] border border-white/10 bg-white/[0.025] p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-amber-200">
                    {pool.cadence || "Draw"}
                  </span>
                  <Ticket className="h-5 w-5 text-amber-300" />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-bold">{pool.pool_name}</h3>
                <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm text-white/55">
                  <p className="flex items-center justify-between gap-4"><span>Published pot</span><strong className="text-white">${Number(pool.current_prize_pot_usd || 0).toLocaleString()}</strong></p>
                  <p className="flex items-center justify-between gap-4"><span>Eligibility</span><strong className="text-white">{String(pool.tier_eligibility || "all").replaceAll("_", " ")}</strong></p>
                  <p className="flex items-start justify-between gap-4"><span className="inline-flex items-center gap-1.5"><CalendarClock className="mt-0.5 h-4 w-4" />Next draw</span><strong className="max-w-[11rem] text-right text-white">{formatDrawTime(pool.next_draw_at)}</strong></p>
                </div>
                <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-white/35"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />Published pool ≠ personal entry · entry ≠ win · win ≠ settlement until recorded.</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-white/10 p-8 text-center">
            <Ticket className="mx-auto h-7 w-7 text-amber-300" />
            <h3 className="mt-3 font-serif text-2xl font-bold">No active pools are published.</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/45">The production source is empty, so the page stays empty instead of manufacturing a jackpot.</p>
          </div>
        )}
      </section>

      <section className="container px-4 md:px-6">
        <div className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.02] p-6 sm:grid-cols-3">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Keep</p><p className="mt-2 font-serif text-xl font-bold">Vault records what remains yours.</p></div>
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Chance</p><p className="mt-2 font-serif text-xl font-bold">PromoShare records the named draw and entries.</p></div>
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/35">Outcome</p><p className="mt-2 font-serif text-xl font-bold">Only a draw/winner/settlement record advances the state.</p></div>
        </div>
      </section>
    </main>
  );
}
