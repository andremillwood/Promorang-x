import { Link } from "react-router-dom";
import { ArrowRight, Building2, Compass, Megaphone, Sparkles, Store, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import { discoveryHref } from "@/lib/discovery-path";
import { BUSINESS_OUTCOMES, PROGRAMMES } from "@/lib/business-outcomes";
import CommerceResponsibilityMap from "@/components/business/CommerceResponsibilityMap";

const sectors = [
  { icon: Store, title: "Places + merchants", copy: "Visits, quiet periods, product movement and repeat business.", href: "/for-merchants" },
  { icon: Building2, title: "Brands", copy: "Product trial, launches, customer action, demand learning and advocacy.", href: "/for-brands" },
  { icon: Ticket, title: "Events + experiences", copy: "Attendance, access, check-in and reasons to return.", href: "/hosting" },
  { icon: Users, title: "Communities + culture", copy: "Shared interest, participation, Scenes and Moments.", href: "/for-communities" },
];

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

export default function SolutionsHub() {
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const signal = inbox.questions[0];

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <SEO title="PROMORANG for Business — Start with the outcome" description="Tell PROMORANG what needs to change. Choose an outcome, get a recommended programme, customize the response, and measure what happened." />

      <section className="border-b border-white/10 px-5 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-[1380px] gap-12 lg:grid-cols-[1.04fr_.96fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">PROMORANG for business</p>
            <h1 className="mt-5 max-w-5xl font-serif text-5xl font-bold leading-[.92] tracking-[-.055em] sm:text-7xl">What do you need to make happen?</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">More visits. Product trial. A stronger launch. Repeat customers. Proof of demand. Start with the business change and let PROMORANG help construct the route.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">Choose an outcome <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/#wanted" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black"><Compass className="h-4 w-4" /> Show me what people want</Link>
              <Link to="/create/campaign" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black"><Megaphone className="h-4 w-4" /> I know what I want to run</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-orange-300/15 bg-orange-300/[0.05] p-6 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Three ways in</p>
            <div className="mt-5 space-y-4">
              {[
                ["01", "Outcome-led", "Tell us what needs to change. PROMORANG recommends a programme."],
                ["02", "Intent-led", "Already know the activation? Describe it and build directly."],
                ["03", "Market-led", "See what people want and decide whether your business can answer."],
              ].map(([n,title,copy]) => <div key={title} className="grid grid-cols-[42px_1fr] gap-4 border-t border-white/10 pt-4"><span className="font-mono text-xs font-black text-orange-300">{n}</span><div><h2 className="font-serif text-xl font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-white/45">{copy}</p></div></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Choose the change</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">You buy the outcome. PROMORANG helps shape the response.</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BUSINESS_OUTCOMES.map((item) => (
              <Link key={item.id} to={`/business/start?outcome=${item.id}`} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-orange-300/35">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-300">{item.short}</p>
                <h3 className="mt-3 font-serif text-2xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">{item.description}</p>
                <ArrowRight className="mt-5 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-orange-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Starting programmes</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.04em] sm:text-5xl">A considered route—not a pile of features.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">Programmes are configurable recipes. They help translate a business outcome into audience, action, value, distribution and evidence without pretending the result is guaranteed.</p>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PROGRAMMES.map((programme) => <article key={programme.id} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"><Sparkles className="h-5 w-5 text-orange-300" /><h3 className="mt-4 font-serif text-2xl font-bold">{programme.title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{programme.promise}</p><p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-white/25">{programme.designedFor}</p></article>)}
          </div>
        </div>
      </section>

      <section id="market" className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Or start from the market</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">People may already be telling you where to look.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">A Want is not a sale and a target is not supply. It is evidence that a question is worth investigating before you decide what to put into market.</p>
            <Link to="/#wanted" className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">Open market pulse <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {signal ? <DemandSignalObject city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text || null} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment || null} responseLabel={signal.poll.targetUnlockPerk || null} href={discoveryHref(signal.poll)} state={signalState(signal.votesRemaining, signal.closeness)} actionLabel="Open Want" /> : <TicketPass kicker={isLoading ? "Reading the market" : "Quiet here right now"} title={isLoading ? "Checking the market…" : "No strong Want yet."} detail={isLoading ? "Looking for live interest in this market." : "Nothing strong is gathering here right now. You can still start from your business outcome."} stub="NOW" stubLabel="Market" />}
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Commerce is a network, not a separate island</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.04em] sm:text-5xl">Brand, Creator, Host, Community and Agency can move commerce. Merchant owns the sale and fulfillment.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">A Programme can distribute a product through creators, place it inside a Moment, fund it through a Brand or contextualize it inside a Scene. That does not transfer price, stock, payment or fulfillment responsibility away from the seller.</p>
          <div className="mt-8"><CommerceResponsibilityMap /></div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Business context comes second</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">The same outcome means different things for different operators.</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {sectors.map(({icon:Icon,title,copy,href}) => <Link key={title} to={href} className="group grid gap-4 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"><div className="grid h-11 w-11 place-items-center rounded-full border border-white/10"><Icon className="h-5 w-5 text-orange-300" /></div><div><h3 className="font-serif text-2xl font-bold group-hover:text-orange-300">{title}</h3><p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">{copy}</p></div><ArrowRight className="h-5 w-5 text-white/25 group-hover:text-orange-300" /></Link>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Zero → Hero</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">The work is not finished when the campaign goes live.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">PROMORANG is designed to carry the business from problem → programme → response → participant action → evidence → next decision. Signup and dashboard entry are not success states.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link to="/business/start" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-400 px-5 text-xs font-black text-black">Start with my outcome <ArrowRight className="h-4 w-4" /></Link><Link to="/pricing" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black">See commercial scope</Link></div>
          </div>
          <PaperReceipt heading="The loop" lines={[
            {label:"Need",value:"What must change"},
            {label:"Programme",value:"Recommended route",strong:true},
            {label:"Response",value:"What goes live"},
            {label:"Evidence",value:"What people did",strong:true},
            {label:"Decision",value:"Repeat · change · stop"},
          ]} footer="Outcome → programme → evidence → next move." />
        </div>
      </section>
    </main>
  );
}
