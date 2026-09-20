import { ArrowRight, Search, ShieldCheck, Sparkles, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { NightTrail, PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

export default function HowItWorks() {
  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO
        title="How PROMORANG works — Start with PromoCard"
        description="Get a PromoCard, show PROMORANG what you want, see what opens, act when it makes sense, and keep the parts of your participation worth carrying forward."
      />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(249,115,22,.2),transparent_38%),radial-gradient(circle_at_82%_52%,rgba(255,255,255,.05),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Sparkles className="h-4 w-4" /> How PROMORANG works</p>
            <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Start with
              <span className="text-orange-400"> PromoCard. </span>
              Let the network do the rest.
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">Tell PROMORANG what you want, keep what matters close, see when something actually opens, and carry your next move and history in one personal place.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth?mode=signup&role=participant&next=/card" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black">Get my PromoCard <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/#ask" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white"><Search className="h-4 w-4" /> Tell PROMORANG what I want</Link>
            </div>
          </div>
          <PromoCardFace holder="Your PromoCard" available="What opens for you" limit="Wanted · Open · Active · Kept" places="A personal view of the things you want, the access that becomes real, the moves you make and the history worth carrying." action="See what changed" variant="membership" interactive={false} />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <NightTrail eyebrow="Your PromoCard journey" title="Want → watch → open → act → keep → return" steps={[
            { label: "Want", title: "Tell PROMORANG what matters to you.", text: "Add your voice to something people want, ask for something missing, or discover something you decide is worth keeping close." },
            { label: "Watch", title: "Give PROMORANG permission to bring you back.", text: "Watching keeps the relationship personal without pretending interest is already access." },
            { label: "Open", title: "See when something real becomes available.", text: "An Offer, access window, Moment or other response appears separately when a real operator makes it possible." },
            { label: "Act", title: "Pick it up and follow through when it makes sense.", text: "Claim, reserve, visit, attend, buy, share or complete the move—with each state staying honest." },
          ]} />
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <TicketPass kicker="Keep" title="Carry what actually mattered." detail="Used access, completed actions, memories and earned value can remain connected to you." stub="KEEP" stubLabel="History" />
            <TicketPass kicker="Return" title="Come back because something changed." detail="PromoCard gives PROMORANG a reason to bring you back to the same relationship instead of starting from zero every time." stub="BACK" stubLabel="Return" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">What makes the card useful</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">PromoCard is personal. PROMORANG is the market around it.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">The card becomes more useful when the network knows what you care about, can connect you to real responses, and remembers what happened without collapsing interest, access and completed actions into one number.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <TicketPass kicker="People" title="Bring the Want" detail="Participants show what they care about and choose what they want to keep close." stub="WANT" stubLabel="Participant" />
              <TicketPass kicker="Operators" title="Make something real possible" detail="Brands, merchants, hosts, creators and communities answer with things people can genuinely do, use, join or buy." stub="OPEN" stubLabel="Network" />
            </div>
          </div>
          <PaperReceipt heading="The truth underneath the card" lines={[
            { label: "Wanted", value: "Interest", strong: true },
            { label: "Open", value: "Real availability", strong: true },
            { label: "Active", value: "Picked up / committed", strong: true },
            { label: "Kept", value: "Used / completed / retained", strong: true },
          ]} footer="Human language on top; strict market state underneath." />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">What if nothing is open yet?</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">PromoCard should still be useful before the market is full.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">You can discover things, put a Want into the market, join something other people want, keep it close and invite others. Early participation helps PROMORANG learn what should exist next without inventing fake supply.</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            <TicketPass kicker="Discover" title="Find what deserves a place on your radar" detail="Discovery can create a preference before you knew exactly what to ask for." stub="SEE" stubLabel="Find" />
            <TicketPass kicker="Want" title="Put the missing thing on the table" detail="A first Want can start small and become clearer as other people add their voices." stub="1" stubLabel="Start" />
            <TicketPass kicker="Keep" title="Stay connected while the market catches up" detail="PromoCard keeps the relationship alive without pretending anything is available before it is." stub="KEEP" stubLabel="Return" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <NightTrail eyebrow="For the people who can respond" title="Listen → qualify → open → learn" steps={[
            { label: "Listen", title: "See what people are showing you.", text: "Discoveries and Wants reveal where attention is forming without being treated as guaranteed sales." },
            { label: "Qualify", title: "Decide whether it fits your goals and capacity.", text: "Volume, location, timing, audience and stronger commitment help you decide whether the Want deserves a response." },
            { label: "Open", title: "Put something genuinely useful into the market.", text: "An Offer, Moment, access window, trial, experience or activation should have clear terms and real availability." },
            { label: "Learn", title: "See who followed through.", text: "Picked-up access and completed actions stay separate so you can understand what people actually did." },
          ]} />
          <PromoCardFace holder="Participant PromoCard" available="Where your response becomes personal" limit="Want · Open · Active · Kept" places="The participant sees one simple product while your operating tools keep the underlying states, terms and outcomes clear." action="See what changed" variant="membership" interactive={false} />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Choose your next move</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Get the card—or choose the side of the network you operate.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth?mode=signup&role=participant&next=/card" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black"><Users className="h-4 w-4" /> Get my PromoCard</Link>
            <Link to="/for-merchants" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Store className="h-4 w-4" /> I run a business</Link>
            <Link to="/join" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80">See every path <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-3.5 w-3.5 text-orange-300" /> One participant product. One network. Many operating roles.</p>
        </div>
      </section>
    </main>
  );
}
