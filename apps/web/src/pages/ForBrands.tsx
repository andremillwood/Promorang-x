import { useMemo } from "react";
import { ArrowRight, Building2, Eye, Handshake, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { NightTrail, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { discoveryHref } from "@/lib/discovery-path";
import { BUSINESS_OUTCOMES, PROGRAMMES } from "@/lib/business-outcomes";

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

const brandOutcomeIds = ["launch", "try-it", "move-this", "learn-demand", "word-of-mouth", "bring-back"];
const brandProgrammeIds = ["first-50", "try-this", "move-this", "what-do-they-want", "tell-somebody", "bring-them-back"];

export default function ForBrands() {
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const liveSignals = useMemo(() => inbox.questions.slice(0, 2), [inbox.questions]);
  const outcomes = BUSINESS_OUTCOMES.filter((item) => brandOutcomeIds.includes(item.id));
  const programmes = PROGRAMMES.filter((item) => brandProgrammeIds.includes(item.id));

  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO title="PROMORANG for Brands — Start with the customer movement" description="Choose the customer action your brand needs, get a recommended programme, and measure what people actually did." />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_.82fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Building2 className="h-4 w-4" /> For brands</p>
            <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-7xl">What do you need people to do?</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">Try this product. Choose between options. Visit somewhere. Buy. Register. Review. Refer. Come back. Start with the customer movement, then let PROMORANG help shape the route.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">Choose a brand outcome <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/demand" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">See what people want</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-orange-300/15 bg-orange-300/[0.055] p-6 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">The brand question</p>
            <p className="mt-4 font-serif text-3xl font-bold leading-tight">What customer action would actually prove the investment moved something?</p>
            <p className="mt-4 text-sm leading-7 text-white/50">PROMORANG keeps awareness, interest, claims, visits, attendance, purchase and repeat behavior distinct so the result pack can say what really happened.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Start with an outcome</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">No campaign vocabulary required.</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((item) => <Link key={item.id} to={`/business/start?outcome=${item.id}`} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-orange-300/35"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-300">{item.short}</p><h3 className="mt-3 font-serif text-2xl font-bold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{item.description}</p><ArrowRight className="mt-5 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-orange-300" /></Link>)}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Brand programmes</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.04em] sm:text-5xl">Choose a route, then customize it.</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => <article key={programme.id} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"><Sparkles className="h-5 w-5 text-orange-300" /><h3 className="mt-4 font-serif text-2xl font-bold">{programme.title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{programme.promise}</p><div className="mt-5 flex flex-wrap gap-2">{programme.path.map((step) => <span key={step} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-white/45">{step}</span>)}</div></article>)}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Read the market too</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.045em]">A business goal and a market signal can meet in the same plan.</h2>
            <p className="mt-4 text-sm leading-7 text-white/50">You can start from the brand outcome, or start from a live Want and ask whether the brand should answer it.</p>
          </div>
          {isLoading && !liveSignals.length ? <div className="h-56 animate-pulse rounded-[1.6rem] bg-white/[0.04]" /> : liveSignals.length ? <div className="grid gap-4 xl:grid-cols-2">{liveSignals.map((signal) => <DemandSignalObject key={signal.poll.id} city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment} responseLabel={signal.poll.targetUnlockPerk} href={discoveryHref(signal.poll)} state={signalState(signal.votesRemaining, signal.closeness)} />)}</div> : <TicketPass kicker="Right now" title="Quiet here right now." detail="There is no strong Want here yet. A brand can still begin with its own measurable outcome." stub="0" stubLabel="Now" />}
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <NightTrail eyebrow="The brand loop" title="Outcome → market → response → evidence → decision" steps={[
            { label: "Outcome", title: "Name the customer movement.", text: "Start with the behavior that would matter to the business." },
            { label: "Market", title: "Read what people are already showing you.", text: "Use Discoveries and Wants to sharpen the brief, not to manufacture certainty." },
            { label: "Response", title: "Put something real into market.", text: "Configure the offer, access, Moment, content or other response with clear terms." },
            { label: "Evidence", title: "See what people did next.", text: "Track the selected action using the strongest available authoritative record." },
          ]} />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Why PromoCard matters</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Do not just win an action. Give people a reason to return.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">When someone saves, claims, attends or earns access, PromoCard can carry the relationship forward without pretending every interaction is a loyalty member or a sale.</p>
          </div>
          <PromoCardFace holder="Participant PromoCard" available="A response is open" limit="Issued access only" places="The card can carry access or a return path when something has actually opened for that person." action="Use this" interactive={false} />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Start from the change</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">What do you want people to do—and what evidence would actually prove it happened?</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black"><Handshake className="h-4 w-4" /> Build my route <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/what-is-promorang" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Eye className="h-4 w-4" /> Understand PROMORANG</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
