import { useEffect, useMemo } from "react";
import { ArrowRight, Building2, Eye, Handshake, ShieldCheck, Users } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { authPathForReturn } from "@/lib/post-auth-next";
import { brandAuthHref, readSponsorBrief, rememberBrandEntry } from "@/lib/commercial-intent";
import { discoveryHref } from "@/lib/discovery-path";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { NightTrail, PaperReceipt, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

export default function ForBrands() {
  const { user } = useAuth();
  const { city, country } = useMarket();
  const [searchParams] = useSearchParams();
  const fromSponsor = searchParams.get("from") === "sponsor" || searchParams.get("audience") === "brand";
  const brief = readSponsorBrief();
  const showSponsorContinue = fromSponsor || Boolean(brief);
  const campaignHref = brandAuthHref(user);
  const { inbox, isLoading } = useDiscoveryDemand(
    city.name,
    country.slug || "jamaica",
    city.id === "all-jamaica" ? undefined : city.id,
  );

  useEffect(() => {
    if (showSponsorContinue) rememberBrandEntry();
  }, [showSponsorContinue]);

  const liveSignals = useMemo(() => inbox.questions.slice(0, 3), [inbox.questions]);
  const leadSignal = liveSignals[0];

  return (
    <main className="min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO
        title="PROMORANG for Brands — See demand before you spend to create it"
        description="See recorded market demand, decide how to respond, and measure what actually happened without confusing interest with action."
        type="website"
      />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(249,115,22,.2),transparent_36%),radial-gradient(circle_at_85%_35%,rgba(255,255,255,.05),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Building2 className="h-4 w-4" /> For brands</p>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              See demand
              <br />
              <span className="text-orange-400">before you spend</span>
              <br />
              trying to create it.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              PROMORANG shows what people are already discovering, asking for and choosing to stand behind. Your brand can decide whether to respond with something real—then measure the verified consequence separately from the original interest.
            </p>

            {showSponsorContinue ? (
              <div className="mt-7 max-w-2xl rounded-[1.6rem] border border-orange-400/20 bg-orange-400/[0.08] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Continue your brand brief</p>
                <p className="mt-2 font-serif text-2xl font-bold">{brief?.name || "Your saved brand brief"}</p>
                {brief?.insight ? <p className="mt-2 text-sm leading-6 text-white/55">{brief.insight}</p> : null}
                <Link to={campaignHref} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400">Continue <ArrowRight className="h-4 w-4" /></Link>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#demand" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400">See recorded demand <ArrowRight className="h-4 w-4" /></a>
              <Link to={user ? "/onboarding/brand" : authPathForReturn("/dashboard?view=studio", { mode: "signup", role: "brand" })} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white transition hover:bg-white/[0.08]">Respond as a brand</Link>
            </div>
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
                responseLabel={leadSignal.poll.targetUnlockPerk}
                href={discoveryHref(leadSignal.poll)}
                actionLabel="Open signal"
                state={signalState(leadSignal.votesRemaining, leadSignal.closeness)}
              />
            ) : (
              <TicketPass kicker="No recorded demand yet" title="An empty market is still useful information." detail="PROMORANG does not manufacture activity to make a sales page look persuasive. When recorded demand exists, it appears here." stub="OPEN" stubLabel="Market" />
            )}
          </div>
        </div>
      </section>

      <section id="demand" className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Market evidence</p>
              <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Interest first. Response second. Outcome third.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">A vote is not a visit. A threshold is not inventory. PROMORANG keeps those states separate so a brand knows what it is actually looking at.</p>
            </div>

            {isLoading && !liveSignals.length ? <div className="h-56 animate-pulse rounded-[1.6rem] bg-white/[0.04]" /> : liveSignals.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {liveSignals.slice(0, 2).map((signal) => (
                  <DemandSignalObject key={signal.poll.id} city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment} responseLabel={signal.poll.targetUnlockPerk} href={discoveryHref(signal.poll)} state={signalState(signal.votesRemaining, signal.closeness)} />
                ))}
              </div>
            ) : (
              <TicketPass kicker="Market state" title="Nothing is being substituted." detail="There are no live recorded demand questions in this market source right now. That should remain visible rather than being replaced by sample campaign numbers." stub="0" stubLabel="Recorded" />
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <NightTrail eyebrow="The brand loop" title="Observe → decide → respond → verify" steps={[
            { label: "Observe", title: "Read what people are already showing you.", text: "Discoveries reveal what exists. Demand reveals what people say they want. Neither is automatically a customer." },
            { label: "Decide", title: "Choose whether the signal matters to you.", text: "A brand can watch, research, sponsor, answer or ignore a signal. PROMORANG does not turn a threshold into supply on your behalf." },
            { label: "Respond", title: "Put a distinct response into the market.", text: "Release an offer, access, Moment, product opportunity or other real supply with clear limits and conditions." },
            { label: "Verify", title: "Measure what actually happened after that.", text: "Claims, check-ins, purchases or other approved proof states create evidence only when the required records exist." },
          ]} />
          <PaperReceipt heading={`${inbox.city} demand snapshot`} lines={[
            { label: "Demand questions", value: inbox.questions.length.toLocaleString(), strong: true },
            { label: "Recorded votes", value: inbox.liveVoteCount.toLocaleString(), strong: true },
            { label: "Near threshold", value: inbox.unlocking.length.toLocaleString() },
            { label: "Truth gate", value: "Demand ≠ action", strong: true },
          ]} footer="PROMORANG should help a brand spend against evidence without overstating what the evidence means." />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">Why PromoCard matters</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Do not just win an action. Keep the relationship legible.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">PromoCard lets a participant carry forward the things they are behind, access that was actually issued, verified actions, and return opportunities. That gives a brand continuity without pretending PROMORANG owns the customer relationship.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <TicketPass kicker="Before response" title="What people are behind" detail="Signals and saved interests can tell you where attention is forming before you create supply." stub="SEE" stubLabel="Demand" />
              <TicketPass kicker="After response" title="What people actually did" detail="Verified consequence is kept separate from the interest that preceded it." stub="PROOF" stubLabel="Outcome" />
            </div>
          </div>
          <PromoCardFace holder="Participant PromoCard" available="A response is open" limit="Issued access only" places="The card can carry a real entitlement or return path when one has actually been created." action="Use this" interactive={false} />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">One simple question</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">What do you want people to do—and what evidence would actually prove it happened?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55">Start there. PROMORANG can connect the outcome you need to the demand, response and proof states that should exist around it.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={user ? "/onboarding/brand" : authPathForReturn("/dashboard?view=studio", { mode: "signup", role: "brand" })} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400"><Handshake className="h-4 w-4" /> Build a response <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/what-is-promorang" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Eye className="h-4 w-4" /> Understand PROMORANG</Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-3.5 w-3.5 text-orange-300" /> Recorded interest, issued supply and verified outcome stay distinct.</p>
        </div>
      </section>
    </main>
  );
}