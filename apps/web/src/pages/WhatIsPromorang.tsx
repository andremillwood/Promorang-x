import { ArrowRight, Building2, Compass, ShieldCheck, Sparkles, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { NightTrail, PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

export default function WhatIsPromorang() {
  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO
        title="What is PROMORANG? — Discovery, demand, response and proof"
        description="PROMORANG helps people discover what matters, show what they want, find others who feel the same way, and keep their place in what happens next through PromoCard."
      />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(249,115,22,.2),transparent_38%),radial-gradient(circle_at_80%_55%,rgba(147,51,234,.1),transparent_34%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Sparkles className="h-4 w-4" /> What is PROMORANG?</p>
          <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            A market for
            <br />
            <span className="text-orange-400">what people care about next.</span>
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
            PROMORANG helps people discover things worth knowing, express what they want, see when other people feel the same way, and keep their place when someone responds. For businesses, creators and organizers, it makes demand easier to see before they decide what to put into the market.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400"><Compass className="h-4 w-4" /> Explore PROMORANG</Link>
            <Link to="/how-it-works" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white transition hover:bg-white/[0.08]">See the full loop <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">It can begin two ways</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">You do not have to know what you want before PROMORANG can be useful.</h2>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            <TicketPass kicker="I do not know yet" title="Discovery helps a preference appear." detail="See an approved place, product, experience, idea or local possibility. Something catches your attention. Now you know you care." stub="SEE" stubLabel="Discovery" />
            <TicketPass kicker="I already know" title="Tell PROMORANG what is missing." detail="Tell PROMORANG the place, offer, product, experience or change you are looking for. If other people feel the same way, shared interest becomes easier to see." stub="LOOK" stubLabel="Interest" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <NightTrail eyebrow="The simplest explanation" title="Discover → want → join → respond → prove" steps={[
            { label: "Discover", title: "See what exists or what is worth noticing.", text: "A Discovery is approved knowledge, not automatically an offer, event or endorsement." },
            { label: "Want", title: "Recognize or express a preference.", text: "You can react to something you found or tell PROMORANG what you are still looking for." },
            { label: "Join", title: "See when other people feel the same way.", text: "Recorded demand makes shared interest legible. It still does not mean attendance, inventory or purchase." },
            { label: "Respond", title: "Someone decides what to put up.", text: "A merchant, brand, creator or host can create a distinct response with real terms, limits and supply." },
          ]} />
          <div className="mt-10 grid gap-5 md:grid-cols-[1.1fr_.9fr]">
            <TicketPass kicker="Then" title="Proof tells us what actually happened." detail="A claim, visit, check-in, purchase or other action only becomes verified when the required evidence and approval exist." stub="PROOF" stubLabel="Reality" />
            <PaperReceipt heading="PROMORANG truth" lines={[
              { label: "Discovery", value: "What is known", strong: true },
              { label: "Demand", value: "What is wanted", strong: true },
              { label: "Response", value: "What is supplied", strong: true },
              { label: "Proof", value: "What happened", strong: true },
            ]} footer="One object can lead to another, but PROMORANG should never silently pretend they are the same thing." />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">PromoCard is the thread</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">The market is public. Your relationship to it is personal.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">PromoCard remembers the parts of PROMORANG that matter to you: what you are watching, what you are behind, access that was actually issued, verified actions and things worth returning to.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <TicketPass kicker="Before something happens" title="Keep your place" detail="A want or signal can stay connected to you so PROMORANG has a reason to bring you back when the market changes." stub="KEEP" stubLabel="Intent" />
              <TicketPass kicker="After something happens" title="Keep the consequence" detail="Real access, proof, returns and retained history can stay attached to the same person instead of disappearing after one campaign." stub="RETURN" stubLabel="History" />
            </div>
          </div>
          <PromoCardFace holder="Your PromoCard" available="What you're part of" limit="Wants · access · proof" places="The card carries continuity across the market without turning unverified interest into value." action="Keep your place" variant="membership" interactive={false} />
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">One market, different reasons to enter</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Everybody sees a different job. They should still be acting on the same truth.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TicketPass kicker="People" title="Find what moves you" detail="Discover, look, join, act and keep your personal history on PromoCard." stub="JOIN" stubLabel="People" />
            <TicketPass kicker="Merchants" title="Respond to local demand" detail="See relevant interest and put up only the supply your business can actually honor." stub="SUPPLY" stubLabel="Place" />
            <TicketPass kicker="Brands" title="Read the market first" detail="Observe demand, decide what outcome matters, respond and verify what followed." stub="MOVE" stubLabel="Brand" />
            <TicketPass kicker="Creators & hosts" title="Surface and organize attention" detail="Help people discover something, gather around it and move into real participation." stub="BUILD" stubLabel="Culture" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">The short version</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">PROMORANG helps a market notice itself.</h2>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-white/55">It helps people discover possibilities, makes shared wants visible, gives operators a reason to respond, and uses proof to distinguish what actually happened from what people merely said they wanted.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/discover" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black"><Users className="h-4 w-4" /> Enter as a participant</Link>
            <Link to="/for-merchants" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Store className="h-4 w-4" /> I run a business</Link>
            <Link to="/for-brands" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Building2 className="h-4 w-4" /> I represent a brand</Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-3.5 w-3.5 text-orange-300" /> Demand ≠ supply. Claim ≠ proof. Verification ≠ purchase unless the record says so.</p>
        </div>
      </section>
    </main>
  );
}