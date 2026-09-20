import { ArrowRight, Building2, ShieldCheck, Sparkles, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { NightTrail, PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

export default function WhatIsPromorang() {
  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO
        title="What is PROMORANG? — The network behind your PromoCard"
        description="PromoCard is the participant product. PROMORANG is the network that helps what people want become things they can discover, access, do and keep."
      />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(249,115,22,.2),transparent_38%),radial-gradient(circle_at_80%_55%,rgba(147,51,234,.1),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Sparkles className="h-4 w-4" /> What is PROMORANG?</p>
            <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              PROMORANG is the network.
              <br />
              <span className="text-orange-400">PromoCard is yours.</span>
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
              PromoCard is the participant product: one place for what you want, what opens for you, what you pick up and what you want to carry forward. PROMORANG is the network underneath it—connecting people, places, brands, creators, hosts and communities around those moves.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth?mode=signup&role=participant&next=/card" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400">Get my PromoCard <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/how-it-works" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white transition hover:bg-white/[0.08]">See how the network moves</Link>
            </div>
          </div>
          <PromoCardFace
            holder="Your PromoCard"
            available="What opens for you"
            limit="Wanted · Open · Active · Kept"
            places="The things you care about, the access that becomes real, the moves you make and the history worth carrying stay connected to you."
            action="See what changed"
            variant="membership"
            interactive={false}
          />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">What lives on PromoCard</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">The card changes as your relationship to the market changes.</h2>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <TicketPass kicker="Wanted" title="What I care about" detail="Things I asked for, backed or want PROMORANG to keep close." stub="WANT" stubLabel="Mine" />
            <TicketPass kicker="Open" title="What became available" detail="Real Offers, access or Moments I can decide to act on now." stub="OPEN" stubLabel="Now" />
            <TicketPass kicker="Active" title="What I picked up" detail="Claims, reservations and commitments that still need a next move." stub="MOVE" stubLabel="Next" />
            <TicketPass kicker="Kept" title="What I carry forward" detail="Used access, completed actions, memories and earned value worth keeping." stub="KEEP" stubLabel="History" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <NightTrail eyebrow="The market around the card" title="Discover → want → open → act → keep → return" steps={[
            { label: "Discover", title: "See something worth knowing.", text: "A place, person, product, experience or possibility can catch your attention before you knew to ask for it." },
            { label: "Want", title: "Put your preference into the market.", text: "Add your voice to something other people want or tell PROMORANG what is still missing." },
            { label: "Open", title: "Someone makes something real possible.", text: "A merchant, brand, creator or host can answer with an Offer, Moment, access or another real response." },
            { label: "Act", title: "Choose whether to pick it up and follow through.", text: "Claim, reserve, visit, attend, buy, share or complete the move when it makes sense to you." },
          ]} />
          <div className="mt-10 grid gap-5 md:grid-cols-[1.1fr_.9fr]">
            <TicketPass kicker="Then" title="Keep what matters and come back when something changes." detail="PromoCard is the continuity layer. PROMORANG can bring you back because the relationship has somewhere personal to live." stub="RETURN" stubLabel="PromoCard" />
            <PaperReceipt heading="What each stage actually means" lines={[
              { label: "Want", value: "Interest", strong: true },
              { label: "Open", value: "Real availability", strong: true },
              { label: "Active", value: "Picked up / committed", strong: true },
              { label: "Kept", value: "Used / completed / retained", strong: true },
            ]} footer="PROMORANG keeps these states connected without pretending they mean the same thing." />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">The other side of PromoCard</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">People carry the card. Other stakeholders help make the card useful.</h2>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <TicketPass kicker="Merchants" title="Open something useful" detail="See what people nearby want and make access, an Offer, a Moment or another response you can honor." stub="OPEN" stubLabel="Place" />
            <TicketPass kicker="Brands" title="Give people something worth doing" detail="Read the Want, choose a meaningful activation, and learn who followed through." stub="MOVE" stubLabel="Brand" />
            <TicketPass kicker="Creators" title="Move attention toward something real" detail="Help people notice, want, join and act—then build a record around the movement you created." stub="SHARE" stubLabel="Creator" />
            <TicketPass kicker="Hosts & communities" title="Turn interest into belonging" detail="Create Moments, access and reasons to return that people can keep connected to their PromoCard." stub="GATHER" stubLabel="Scene" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">The short version</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Your wants. Your access. Your moves. One PromoCard.</h2>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-white/55">PROMORANG makes the card useful by connecting it to a living network of people and organizations that can discover, respond, fulfill, verify and bring you back.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth?mode=signup&role=participant&next=/card" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black"><Users className="h-4 w-4" /> Get my PromoCard</Link>
            <Link to="/for-merchants" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Store className="h-4 w-4" /> I run a business</Link>
            <Link to="/for-brands" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Building2 className="h-4 w-4" /> I represent a brand</Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-3.5 w-3.5 text-orange-300" /> Want, availability, commitment and follow-through remain distinct underneath the experience.</p>
        </div>
      </section>
    </main>
  );
}
