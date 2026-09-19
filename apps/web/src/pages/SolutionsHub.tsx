import { Link } from "react-router-dom";
import { ArrowRight, Building2, Store, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import { discoveryHref } from "@/lib/discovery-path";

const sectors = [
  { icon: Store, title: "Retail + commerce", copy: "See what people want before deciding what products, offers or access your business should put up.", href: "/for-merchants" },
  { icon: Building2, title: "Brands", copy: "See where attention is forming, decide whether it is worth a brand response, and measure what people did next.", href: "/for-brands" },
  { icon: Ticket, title: "Events + experiences", copy: "See what people are interested in, create a Moment worth showing up for, and learn who actually came.", href: "/hosting" },
  { icon: Users, title: "Communities + culture", copy: "Use Scenes and Discoveries to understand what matters before asking people to act or attend.", href: "/for-communities" },
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
      <SEO title="PROMORANG Solutions — See what people want and decide how to respond" description="See what people want, choose the right response for your role, and understand what happened afterward." />

      <section className="border-b border-white/10 px-5 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-[1380px] gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">Solutions · one market system</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-bold leading-[.92] tracking-[-.055em] sm:text-7xl">Do not start with a campaign. Start with the market.</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">PROMORANG helps you see what is already happening, what people are asking for, what you could put into market, and what people did afterward.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/demand" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-black text-black">Open Opportunity Inbox <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/join" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">Choose what you are trying to do</Link>
            </div>
          </div>
          {signal ? (
            <DemandSignalObject city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text || null} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment || null} responseLabel={signal.poll.targetUnlockPerk || null} href={discoveryHref(signal.poll)} state={signalState(signal.votesRemaining, signal.closeness)} actionLabel="Open signal" />
          ) : (
            <TicketPass kicker={isLoading ? "Reading the market" : "Quiet here right now"} title={isLoading ? "Checking the market…" : "No strong signal yet."} detail={isLoading ? "Looking for live demand in this market." : "There isn’t a live demand signal here right now. Explore the market or come back as interest forms."} stub="NOW" stubLabel="Market" />
          )}
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">A simple way to work</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">Different sectors. The same basic questions.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            <TicketPass kicker="01 · Discovery" title="What is worth knowing?" detail="Places, people, patterns and opportunities already in the market." stub="SEE" stubLabel="Know" />
            <TicketPass kicker="02 · Demand" title="What are people asking for?" detail="Questions, votes and asks that show where interest is building." stub="HEAR" stubLabel="Want" />
            <TicketPass kicker="03 · Response" title="What will you put up?" detail="A Moment, offer, product, invitation or other response people can actually act on." stub="DO" stubLabel="Respond" />
            <TicketPass kicker="04 · Outcome" title="What happened next?" detail="Visits, attendance, redemptions, purchases and other actions that show how people responded." stub="LEARN" stubLabel="Outcome" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-primary">Sector lenses</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">Choose the context that fits what you need to make happen.</h2>
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
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">A clearer way to decide, activate and learn.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">Commercial spend can fund products, offers, access, distribution, creator work, Moments and the services around them. PROMORANG helps you connect that response to what people actually did afterward without promising a guaranteed result.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/pricing" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-black">See commercial terms <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/how-it-works" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black">See how the loop works</Link>
            </div>
          </div>
          <PaperReceipt heading="Keep these distinctions clear" lines={[
            { label: "Discovery", value: "What’s worth knowing" },
            { label: "Demand", value: "What people want", strong: true },
            { label: "Target", value: "A reason to look closer" },
            { label: "Response", value: "What you put up" },
            { label: "Outcome", value: "What people did" },
          ]} footer="See → decide → respond → learn." />
        </div>
      </section>
    </main>
  );
}
