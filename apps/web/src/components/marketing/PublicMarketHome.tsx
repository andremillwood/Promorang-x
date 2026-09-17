import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, Search, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicHomeBar } from "@/components/culture/PublicHomeBar";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { NightTrail, PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import { discoveryHref } from "@/lib/discovery-path";

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "unlocked" as const;
  return closeness;
}

export default function PublicMarketHome() {
  const { city, country } = useMarket();
  const { inbox, recordAsk, isLoading } = useDiscoveryDemand(
    city.name,
    country.slug || "jamaica",
    city.id === "all-jamaica" ? undefined : city.id,
  );
  const [ask, setAsk] = useState("");
  const [submittedAsk, setSubmittedAsk] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const liveSignals = useMemo(() => inbox.questions.slice(0, 4), [inbox.questions]);
  const leadSignal = liveSignals[0];

  async function submitAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = ask.trim();
    if (!next || submitting) return;
    setSubmitting(true);
    try {
      await recordAsk(next);
      setSubmittedAsk(next);
      setAsk("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#070707] text-white selection:bg-orange-500 selection:text-black">
      <PublicHomeBar />

      <section className="relative border-b border-white/10 px-5 pb-16 pt-10 sm:px-6 md:pb-24 md:pt-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_5%,rgba(249,115,22,.18),transparent_34%),radial-gradient(circle_at_85%_22%,rgba(255,255,255,.05),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(520px,1.1fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border-b border-orange-400/40 pb-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              The market for action
            </div>
            <h1 className="mt-7 font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[5.6rem]">
              Make demand
              <br />
              <span className="text-orange-400">visible.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              Ask for a place, perk, event, product or experience. Join what other people want. When enough people move, businesses, creators, hosts and brands get a reason to respond.
            </p>

            <form onSubmit={submitAsk} className="mt-8 max-w-2xl">
              <label htmlFor="public-ask" className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
                What do you want {city.name === "All Jamaica" ? "in Jamaica" : `in ${city.name}`}?
              </label>
              <div className="flex flex-col gap-2 rounded-[1.35rem] border border-white/12 bg-white/[0.055] p-2 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                  <Search className="h-4 w-4 shrink-0 text-orange-400" />
                  <input
                    id="public-ask"
                    value={ask}
                    onChange={(event) => setAsk(event.target.value)}
                    placeholder="Live music on Sunday, a first-visit offer, a late-night cafe…"
                    className="min-h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!ask.trim() || submitting}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[1rem] bg-orange-500 px-5 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? "Adding…" : "Put it up"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/38">Your ask can count anonymously. PROMORANG shows aggregate demand, not your private identity.</p>
              {submittedAsk ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> “{submittedAsk}” is now part of the demand signal.
                </p>
              ) : null}
            </form>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-orange-500/10 blur-3xl" />
            {leadSignal ? (
              <DemandSignalObject
                city={inbox.city}
                title={leadSignal.poll.question}
                leadingOption={leadSignal.leading?.text}
                demandCount={leadSignal.poll.totalVotes || 0}
                threshold={leadSignal.poll.thresholdForMoment}
                matchedAsk={leadSignal.matchedAsks[0]}
                unlockLabel={leadSignal.poll.targetUnlockPerk}
                href={discoveryHref(leadSignal.poll)}
                actionLabel="Join this signal"
                state={signalState(leadSignal.votesRemaining, leadSignal.closeness)}
              />
            ) : (
              <TicketPass
                kicker="Signal opening"
                title="What should PROMORANG unlock next?"
                detail="The first public demand signals for this market are forming. Put something up and give other people a reason to join you."
                stub="ASK"
                stubLabel="Start"
              />
            )}
          </div>
        </div>
      </section>

      <section id="wanted" className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Wanted now · {inbox.city}</p>
              <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl md:text-6xl">See what people are trying to make happen.</h2>
            </div>
            <Link to="/discover" className="inline-flex items-center gap-2 text-sm font-black text-orange-300">
              Explore everything <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading && !liveSignals.length ? <p className="mt-10 text-sm text-white/45">Reading the market…</p> : null}

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {liveSignals.map((signal) => (
              <DemandSignalObject
                key={signal.poll.id}
                city={inbox.city}
                title={signal.poll.question}
                leadingOption={signal.leading?.text}
                demandCount={signal.poll.totalVotes || 0}
                threshold={signal.poll.thresholdForMoment}
                matchedAsk={signal.matchedAsks[0]}
                unlockLabel={signal.poll.targetUnlockPerk}
                href={discoveryHref(signal.poll)}
                state={signalState(signal.votesRemaining, signal.closeness)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <NightTrail
            eyebrow="One loop"
            title="Ask → rally → respond → prove"
            steps={[
              { label: "Ask", title: "Put the want into the market.", text: "A place, offer, experience or outcome becomes visible instead of staying inside one person's head." },
              { label: "Rally", title: "Other people join it.", text: "Votes, named asks and shares turn an opinion into a measurable signal." },
              { label: "Respond", title: "Someone gives the crowd a reason to move.", text: "A merchant, host, creator or brand can release inventory, access, funding or an activation." },
              { label: "Prove", title: "What happened leaves a receipt.", text: "Visits, claims, check-ins and verified actions show whether the signal turned into real movement." },
            ]}
          />

          <PaperReceipt
            heading={`${inbox.city} demand receipt`}
            lines={[
              { label: "Named asks", value: inbox.namedAskCount.toLocaleString(), strong: true },
              { label: "Live votes", value: inbox.liveVoteCount.toLocaleString(), strong: true },
              { label: "Open signals", value: inbox.questions.length.toLocaleString() },
              { label: "Still unanswered", value: inbox.misses.length.toLocaleString() },
              { label: "Put on PromoCards", value: inbox.onCards.toLocaleString(), strong: true },
            ]}
            footer="This is the market PROMORANG should sell from: visible demand first, response second."
          />
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Two sides of the same market</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">People say what they want. Operators decide what they want people to do.</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <TicketPass
              kicker="For people"
              title="Find something worth joining"
              detail="Ask, vote, show up, claim access and keep the proof of what you helped make happen."
              stub="JOIN"
              stubLabel="Participate"
            />
            <TicketPass
              kicker="For business"
              title="Put an outcome into the market"
              detail="Give people a reason to visit, try, attend, create, refer, return or buy — then see what actually moved."
              stub="MOVE"
              stubLabel="Activate"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/join" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400">
              Join PROMORANG <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/for-brands" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white transition hover:bg-white/[0.08]">
              <Building2 className="h-4 w-4 text-orange-300" /> For brands & businesses
            </Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Users className="h-4 w-4" /> Your participation has somewhere to live</p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">PromoCard is the record of what you joined, unlocked and helped move.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">The public market gets you into the action. PromoCard gives your participation memory, access and continuity once you decide to stay.</p>
          </div>
          <Link to="/auth?mode=signup&next=/wallet" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black transition hover:bg-orange-100">
            Get PromoCard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
