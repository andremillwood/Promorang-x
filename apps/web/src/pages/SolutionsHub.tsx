import { Link } from "react-router-dom";
import { ArrowRight, Building2, Store, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import { discoveryHref } from "@/lib/discovery-path";

const sectors = [
  { icon: Store, title: "Retail + commerce", copy: "Read product, offer and place demand before deciding what inventory or access to put into market.", href: "/for-merchants" },
  { icon: Building2, title: "Brands", copy: "Use recorded market evidence to decide whether a funded response is worth testing, then measure verified consequences separately.", href: "/for-brands" },
  { icon: Ticket, title: "Events + experiences", copy: "Separate interest from an actual Moment, RSVP from attendance, and attendance from any downstream value claim.", href: "/hosting" },
  { icon: Users, title: "Communities + culture", copy: "Use Scenes and approved Discoveries to hold context before asking people to act or attend.", href: "/for-communities" },
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
      <SEO title="PROMORANG Solutions — Read demand, respond, prove" description="Use approved market knowledge and recorded demand to decide what response to put into market, then measure what actually happened." />

      <section className="border-b border-white/10 px-5 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-[1380px] gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">Solutions · one market system</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-bold leading-[.92] tracking-[-.055em] sm:text-7xl">Do not start with a campaign. Start with the market.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">PROMORANG helps an operator separate what already exists, what people are asking for, what you choose to put into market, and what can actually be verified afterward.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/demand" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-black">Open Opportunity Inbox <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/join" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">Choose what you are trying to do</Link>
            </div>
          </div>
          {signal ? (
            <DemandSignalObject city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text || null} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment || null} responseLabel={signal.poll.targetUnlockPerk || null} href={discoveryHref(signal.poll)} state={signalState(signal.votesRemaining, signal.closeness)} actionLabel="Inspect recorded signal" />
          ) : (
            <TicketPass kicker={isLoading ? "Reading production market" : "No recorded signal shown"} title={isLoading ? "Checking the market…" : "Empty is information."} detail={isLoading ? "PROMORANG is reading recorded Demand." : "No demand is being invented to make this solution page look more active."} stub="TRUTH" stubLabel="Market" />
          )}
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">The common operating model</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">The sector changes. The truth boundaries do not.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            <TicketPass kicker="01 · Discovery" title="What is already true?" detail="Approved knowledge about places, things, patterns and opportunities." stub="SEE" stubLabel="Know" />
            <TicketPass kicker="02 · Demand" title="What are people asking for?" detail="Recorded questions, votes and asks. Signal is evidence, not supply." stub="HEAR" stubLabel="Want" />
            <TicketPass kicker="03 · Response" title="What will you actually put in?" detail="A distinct Moment, offer, inventory, Discovery or other legitimate response." stub="DO" stubLabel="Respond" />
            <TicketPass kicker="04 · Proof" title="What really happened?" detail="Attendance, redemption, purchase, verification and retained history only when their source records exist." stub="PROVE" stubLabel="Outcome" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Sector lenses</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">Choose the context, not a guaranteed outcome.</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {sectors.map(({ icon: Icon, title, copy, href }) => (
              <Link key={title} to={href} className="group grid gap-4 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10"><Icon className="h-5 w-5 text-primary" /></div>
                <div><h3 className="font-serif text-2xl font-bold group-hover:text-primary">{title}</h3><p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">{copy}</p></div>
                <ArrowRight className="h-5 w-5 text-white/25 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">What you are buying</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">A governed response workflow, not a guaranteed result.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">Commercial spend can fund inventory, access, distribution, creator work, a Moment, or the operating service around those objects. It cannot turn interest into customers by definition. The useful output is the ability to distinguish the response from the evidence produced afterward.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/pricing" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-black">See commercial terms <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/how-it-works" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black">See how the loop works</Link>
            </div>
          </div>
          <PaperReceipt heading="Truth gates" lines={[
            { label: "Discovery", value: "≠ offer" },
            { label: "Demand", value: "≠ supply", strong: true },
            { label: "Threshold", value: "≠ response" },
            { label: "Response", value: "≠ purchase" },
            { label: "Proof", value: "requires source" },
          ]} footer="Read → decide → respond → prove." />
        </div>
      </section>
    </main>
  );
}
