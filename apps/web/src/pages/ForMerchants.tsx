import { useMemo } from "react";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { buildMerchantDemandOpening, merchantAuthHref, readMerchantDemand } from "@/lib/merchant-demand";
import { discoverPathHref } from "@/lib/discovery-path";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { NightTrail, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { ParticipationEconomy } from "@/components/promorang/ParticipationEconomy";
import { BUSINESS_OUTCOMES, PROGRAMMES } from "@/lib/business-outcomes";

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

const merchantOutcomeIds = ["bring-people-in", "quiet-period", "move-this", "bring-back", "launch", "learn-demand"];
const merchantProgrammeIds = ["first-50", "quiet-hours", "move-this", "bring-them-back", "what-do-they-want"];

export default function ForMerchants() {
  const { user } = useAuth();
  const { city, country } = useMarket();
  const [searchParams] = useSearchParams();
  const claimVenue = searchParams.get("claimVenue") || searchParams.get("venue");
  const demandAnswers = readMerchantDemand(searchParams);
  const demand = demandAnswers ? buildMerchantDemandOpening(demandAnswers) : null;
  const registerHref = merchantAuthHref(user, "/dashboard/venues/add");
  const { inbox, isLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const liveSignals = useMemo(() => inbox.questions.slice(0, 2), [inbox.questions]);
  const outcomes = BUSINESS_OUTCOMES.filter((item) => merchantOutcomeIds.includes(item.id));
  const programmes = PROGRAMMES.filter((item) => merchantProgrammeIds.includes(item.id));

  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO title={claimVenue ? `${claimVenue} on PROMORANG` : "PROMORANG for Merchants | Start with the business result"} description="More visits, stronger quiet periods, product movement and repeat business. Start with the outcome and let PROMORANG help shape the response." />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_.86fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300"><Store className="h-4 w-4" /> For merchants & places</p>
            <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-7xl">What would make this a better week for your business?</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">More people through the door. A busier slow period. Movement around one item. First-time customers coming back. Start there, not with campaign mechanics.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-black text-black">Choose a business outcome <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/#wanted" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">See what people nearby want</Link>
            </div>

            {claimVenue ? (
              <div className="mt-7 max-w-2xl rounded-[1.6rem] border border-amber-300/20 bg-amber-300/[0.07] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Is this your place?</p>
                <p className="mt-2 font-serif text-2xl font-bold">{claimVenue}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">Claim the place to manage how it appears and connect real offers, Moments and updates to the right location.</p>
                <Link to={`${registerHref}${registerHref.includes("?") ? "&" : "?"}name=${encodeURIComponent(claimVenue)}`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-black text-black">Claim this place <ArrowRight className="h-4 w-4" /></Link>
              </div>
            ) : null}

            {demand ? (
              <div className="mt-7 max-w-2xl rounded-[1.6rem] border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Your saved demand brief</p>
                <p className="mt-2 font-serif text-xl font-bold">{demand.window}</p>
                <p className="mt-3 text-sm leading-6 text-white/55">{demand.when} · {demand.who}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-emerald-300/15 bg-emerald-300/[0.055] p-6 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Say it the way you actually think it</p>
            <div className="mt-5 space-y-3">
              {["I need more customers.", "I want people in during a quiet time.", "I need to move this item.", "I want first-time customers to return.", "I do not know. Show me what people nearby want."].map((line) => <p key={line} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm font-bold">{line}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Start with an outcome</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">PROMORANG can translate the business problem into the operating route.</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((item) => <Link key={item.id} to={`/business/start?outcome=${item.id}`} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-300/35"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">{item.short}</p><h3 className="mt-3 font-serif text-2xl font-bold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{item.description}</p><ArrowRight className="mt-5 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-emerald-300" /></Link>)}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Merchant programmes</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.04em] sm:text-5xl">A route your team can understand.</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => <article key={programme.id} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"><Sparkles className="h-5 w-5 text-emerald-300" /><h3 className="mt-4 font-serif text-2xl font-bold">{programme.title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{programme.promise}</p><div className="mt-5 flex flex-wrap gap-2">{programme.path.map((step) => <span key={step} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-white/45">{step}</span>)}</div></article>)}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Local market</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em]">A request is not a customer. It is a reason to look closer.</h2>
            <p className="mt-4 text-sm leading-7 text-white/50">See where real interest is gathering, then put something on the table only when it can improve a business result — visits, purchases, product movement or repeat behavior.</p>
          </div>
          {isLoading && !liveSignals.length ? <div className="h-56 animate-pulse rounded-[1.6rem] bg-white/[0.04]" /> : liveSignals.length ? <div className="grid gap-4 xl:grid-cols-2">{liveSignals.map((signal) => <DemandSignalObject key={signal.poll.id} city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment} responseLabel={signal.poll.targetUnlockPerk} href={`/give?from=want&demand_id=${encodeURIComponent(signal.poll.id)}&want=${encodeURIComponent(signal.poll.question)}&city=${encodeURIComponent(inbox.city)}`} state={signalState(signal.votesRemaining, signal.closeness)} actionLabel="Put something on the table" />)}</div> : <TicketPass kicker="Right now" title="No strong Want nearby yet." detail="You can still start from your own business outcome, claim your place, or come back as interest forms." stub="0" stubLabel="Want" />}
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <NightTrail eyebrow="The merchant loop" title="Outcome → qualify → respond → verify" steps={[
            { label: "Outcome", title: "Name what would make the business better.", text: "Visits, purchases, repeat behavior, product movement or another measurable action." },
            { label: "Qualify", title: "Check whether the market and timing make sense.", text: "Look at Wants, location, volume and what the business can actually fulfill." },
            { label: "Respond", title: "Put up only what you can honor.", text: "Create an offer, access window, Moment or place update with clear terms and limits." },
            { label: "Verify", title: "See what really happened.", text: "Validated visits, purchases or other supported actions become evidence for the next decision." },
          ]} />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">PromoCard at the counter</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Make it obvious what this person can use now and what brings them back.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">Your staff should not need to understand the whole system. Valid access, terms and the next step should be clear.</p>
          </div>
          <PromoCardFace holder="Participant PromoCard" available="Use this here" limit="Issued offer · terms apply" places="Show the offer, the terms and the next step at a glance." action="Present this" interactive={false} />
        </div>
      </section>

      <ParticipationEconomy variant="operator" />

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Start with one business result</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Tell PROMORANG what needs to improve. Then shape the response around what your business can actually deliver.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-black text-black"><Store className="h-4 w-4" /> Build my route <ArrowRight className="h-4 w-4" /></Link>
            <Link to={registerHref} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><MapPin className="h-4 w-4" /> Register your place</Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Interest, offers, visits, purchases and fulfillment remain different parts of the journey.</p>
        </div>
      </section>
    </main>
  );
}
