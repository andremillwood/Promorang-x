import { useEffect, useMemo } from "react";
import { ArrowRight, Building2, Eye, Handshake, ShieldCheck } from "lucide-react";
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
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { ParticipationEconomy } from "@/components/promorang/ParticipationEconomy";

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
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO
        title="PROMORANG for Brands — See what people want. Give them something worth doing."
        description="See what people want, answer with something real, and use PromoCard to carry the participant relationship from interest to follow-through."
        type="website"
      />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(249,115,22,.2),transparent_36%),radial-gradient(circle_at_85%_35%,rgba(255,255,255,.05),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Building2 className="h-4 w-4" /> For brands</p>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              See what people want.
              <br />
              <span className="text-orange-400">Give them something</span>
              <br />
              worth doing.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              People use PromoCard to keep what they want and come back when something opens. PROMORANG lets your brand see where that interest is gathering, answer with a real activation, and understand what people actually did next.
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
              <a href="#demand" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400">See what people want <ArrowRight className="h-4 w-4" /></a>
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
                actionLabel="See the want"
                state={signalState(leadSignal.votesRemaining, leadSignal.closeness)}
              />
            ) : (
              <TicketPass kicker="No strong signal here yet" title="This market is quiet right now." detail="Use the quiet as information. Explore what people are discovering, or watch the market until a signal forms." stub="OPEN" stubLabel="Market" />
            )}
          </div>
        </div>
      </section>

      <section id="demand" className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">What people want</p>
              <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Listen first. Open something real. Then see who followed through.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">A Want tells you where to look, not where to spend automatically. Your response becomes meaningful when something real opens and participants choose to act.</p>
            </div>

            {isLoading && !liveSignals.length ? <div className="h-56 animate-pulse rounded-[1.6rem] bg-white/[0.04]" /> : liveSignals.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {liveSignals.slice(0, 2).map((signal) => (
                  <DemandSignalObject key={signal.poll.id} city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment} responseLabel={signal.poll.targetUnlockPerk} href={discoveryHref(signal.poll)} state={signalState(signal.votesRemaining, signal.closeness)} />
                ))}
              </div>
            ) : (
              <TicketPass kicker="Right now" title="Quiet here right now." detail="There aren’t any live demand questions in this market yet. Explore Discoveries, watch the market, or come back as interest forms." stub="0" stubLabel="Now" />
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <NightTrail eyebrow="The brand loop" title="Listen → decide → open → learn" steps={[
            { label: "Listen", title: "Read what people are already showing you.", text: "Discoveries show what is getting attention. Wants show what people say they care about. Use both to decide where to look closer." },
            { label: "Decide", title: "Choose whether the signal matters to you.", text: "Watch it, research it, sponsor it, answer it—or leave it alone. A signal is an invitation to investigate, not a command to spend." },
            { label: "Open", title: "Put something useful into the market.", text: "Release an Offer, access, Moment, product opportunity or activation with clear terms and limits." },
            { label: "Learn", title: "See who followed through.", text: "Keep claims, visits, check-ins, purchases and other completed actions distinct so you know what your activation actually moved." },
          ]} />
          <PaperReceipt heading={`${inbox.city} want snapshot`} lines={[
            { label: "Live wants", value: inbox.questions.length.toLocaleString(), strong: true },
            { label: "Voices", value: inbox.liveVoteCount.toLocaleString(), strong: true },
            { label: "Close to target", value: inbox.unlocking.length.toLocaleString() },
            { label: "Read as", value: "Interest, not action", strong: true },
          ]} footer="Use this as a starting point for a smarter brief—not as a promise of sales." />
        </div>
      </section>

      <ParticipationEconomy variant="operator" />

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">PromoCard is where the response becomes personal</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Do not stop at attention. Give the relationship somewhere to continue.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">PromoCard is the participant product. When someone keeps a Want, receives access, picks something up or follows through, the relationship has one personal place to continue without pretending every step means the same thing.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <TicketPass kicker="Before you open something" title="Where interest is forming" detail="Wants and Discoveries can show you where attention is building before you activate." stub="SEE" stubLabel="Want" />
              <TicketPass kicker="After something opens" title="What happened next" detail="See what was picked up and which actions were actually completed." stub="RESULT" stubLabel="Follow-through" />
            </div>
          </div>
          <PromoCardFace holder="Participant PromoCard" available="Something worth doing is open" limit="Want · Open · Active · Kept" places="A real response can become personal access, an active move or a kept result on the participant’s PromoCard." action="See what changed" interactive={false} />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">One simple question</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">What do you want people to do—and what can you make worth doing?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55">Start there. PROMORANG connects the outcome you need to visible Wants, a real response, PromoCard continuity and the actions that follow.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={user ? "/onboarding/brand" : authPathForReturn("/dashboard?view=studio", { mode: "signup", role: "brand" })} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400"><Handshake className="h-4 w-4" /> Answer with an activation <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/what-is-promorang" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Eye className="h-4 w-4" /> Understand PROMORANG</Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-3.5 w-3.5 text-orange-300" /> Interest, access and outcomes stay distinct so your team can see what changed.</p>
        </div>
      </section>
    </main>
  );
}