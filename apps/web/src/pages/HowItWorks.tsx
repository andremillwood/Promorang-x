import { ArrowRight, Compass, Search, ShieldCheck, Sparkles, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { NightTrail, PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

export default function HowItWorks() {
  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO
        title="How PROMORANG works — From discovery to demand to proof"
        description="See how PROMORANG helps you discover something, show what you want, act when something opens, and keep what matters on PromoCard."
      />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(249,115,22,.2),transparent_38%),radial-gradient(circle_at_82%_52%,rgba(255,255,255,.05),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Sparkles className="h-4 w-4" /> How PROMORANG works</p>
          <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            From
            <span className="text-orange-400"> “that looks interesting” </span>
            to something real.
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">Start by exploring, asking for something, or joining what other people are already into. PromoCard keeps the things you care about close as the city and market change.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black"><Compass className="h-4 w-4" /> Start by exploring</Link>
            <Link to="/#ask" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white"><Search className="h-4 w-4" /> I know what I want</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <NightTrail eyebrow="Participant journey" title="See → feel → signal → keep → act → return" steps={[
            { label: "See", title: "Encounter something worth knowing.", text: "Discovery gives you places, products, experiences, people or possibilities you may not have known to ask for." },
            { label: "Feel", title: "Recognize that you care.", text: "You might save it, want it, ask for more like it, or realize something is missing." },
            { label: "Signal", title: "Show what you want.", text: "Join an existing signal or tell PROMORANG what you are still looking for. You do not need to know what comes next yet." },
            { label: "Keep", title: "PromoCard remembers your place.", text: "Instead of losing the thread, PROMORANG can bring you back when something relevant changes or something new opens up." },
          ]} />
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <TicketPass kicker="Then" title="Act when something opens." detail="When a merchant, brand, host or creator puts something up, you can decide whether to claim it, join it or go." stub="ACT" stubLabel="Response" />
            <TicketPass kicker="After" title="Know what happened." detail="Check-ins, redemptions and other confirmed actions can become part of your PROMORANG history." stub="PROVE" stubLabel="Outcome" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Why PromoCard sits in the middle</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">The card is what turns a one-time reaction into continuity.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">Without PromoCard, a person can react to a Discovery or join a signal and then disappear. PromoCard gives PROMORANG a personal place to keep what the user is watching, what they are behind, what opened for them, and what they actually did.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <TicketPass kicker="Watching" title="Things I care about" detail="Discoveries and wants can stay connected to me without pretending they are rewards." stub="WATCH" stubLabel="Interest" />
              <TicketPass kicker="Open" title="Things I can use now" detail="When you get access, PromoCard shows what you have and what to do next." stub="USE" stubLabel="Access" />
            </div>
          </div>
          <PromoCardFace holder="Your PromoCard" available="Keep the thread" limit="Interest → access → proof" places="One identity across the things you discover, back, receive and actually do." action="See what changed" variant="membership" interactive={false} />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">What if the market is empty?</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Being early should still feel useful.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">If there is nothing useful to see yet, PROMORANG can still ask good questions, let people start a signal, invite others, and surface Discoveries as they are found.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            <TicketPass kicker="PROMORANG can ask" title="Market prompts" detail="Questions can help people recognize preferences without pretending those prompts are existing demand." stub="ASK" stubLabel="Prompt" />
            <TicketPass kicker="A person can start" title="Be the first" detail="A legitimate first ask can remain small and honest until other people independently join it." stub="1" stubLabel="Early" />
            <TicketPass kicker="The market can learn" title="Go find it" detail="An unresolved want can guide what PROMORANG, contributors or operators should investigate and publish as approved Discovery." stub="FIND" stubLabel="Scout" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <NightTrail eyebrow="Operator journey" title="Observe → qualify → respond → verify" steps={[
            { label: "Observe", title: "See what people are showing you.", text: "Discoveries and demand can reveal where attention is forming without being treated as guaranteed sales." },
            { label: "Qualify", title: "Decide whether it is relevant.", text: "Volume, location, timing and stronger commitment can help an operator decide whether a signal deserves action." },
            { label: "Respond", title: "Put something useful into market.", text: "An offer, Moment, access window or other response should have clear terms and availability." },
            { label: "Verify", title: "See what happened next.", text: "Use confirmed actions to understand what people actually did after the response." },
          ]} />
          <PaperReceipt heading="State boundaries" lines={[
            { label: "Discovery", value: "Knowledge", strong: true },
            { label: "Demand", value: "Interest", strong: true },
            { label: "Response", value: "Supply", strong: true },
            { label: "Proof", value: "Outcome", strong: true },
          ]} footer="Each stage tells you something different: what people noticed, wanted, received and actually did." />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Choose your next move</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Enter through the job you are trying to get done.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black"><Users className="h-4 w-4" /> I want to participate</Link>
            <Link to="/for-merchants" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Store className="h-4 w-4" /> I run a business</Link>
            <Link to="/join" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80">See every path <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-3.5 w-3.5 text-orange-300" /> One PROMORANG, different ways in.</p>
        </div>
      </section>
    </main>
  );
}