import { useMemo } from "react";
import { ArrowRight, MapPin, ShieldCheck, Store } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { buildMerchantDemandOpening, merchantAuthHref, readMerchantDemand } from "@/lib/merchant-demand";
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

export default function ForMerchants() {
  const { user } = useAuth();
  const { city, country } = useMarket();
  const [searchParams] = useSearchParams();
  const claimVenue = searchParams.get("claimVenue") || searchParams.get("venue");
  const demandAnswers = readMerchantDemand(searchParams);
  const demand = demandAnswers ? buildMerchantDemandOpening(demandAnswers) : null;
  const putPerkHref = merchantAuthHref(user, "/stock");
  const registerHref = merchantAuthHref(user, "/dashboard/venues/add");
  const { inbox, isLoading } = useDiscoveryDemand(
    city.name,
    country.slug || "jamaica",
    city.id === "all-jamaica" ? undefined : city.id,
  );
  const liveSignals = useMemo(() => inbox.questions.slice(0, 3), [inbox.questions]);
  const leadSignal = liveSignals[0];

  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO
        title={claimVenue ? `${claimVenue} on PROMORANG` : "PROMORANG for Merchants — See what people want. Open something they can use."}
        description="See what people nearby want, decide what your business can genuinely make available, and let PromoCard carry the customer from interest to visit and return."
        type="website"
      />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(16,185,129,.16),transparent_35%),radial-gradient(circle_at_85%_35%,rgba(249,115,22,.1),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300"><Store className="h-4 w-4" /> For merchants & places</p>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              See what people want.
              <br />
              <span className="text-emerald-300">Open something useful.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">
              People use PromoCard to keep what they want and come back when something opens. See what people nearby are asking for, decide what fits your business, make something you can honor available, and see who actually comes through the door.
            </p>

            {claimVenue ? (
              <div className="mt-7 max-w-2xl rounded-[1.6rem] border border-amber-300/20 bg-amber-300/[0.07] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">Is this your place?</p>
                <p className="mt-2 font-serif text-2xl font-bold">{claimVenue}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">Claim this place to manage how your business appears on PROMORANG and connect offers, Moments and updates to the right location.</p>
                <Link to={`${registerHref}${registerHref.includes("?") ? "&" : "?"}name=${encodeURIComponent(claimVenue)}`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-black text-black">Claim this place <ArrowRight className="h-4 w-4" /></Link>
              </div>
            ) : null}

            {demand ? (
              <div className="mt-7 max-w-2xl rounded-[1.6rem] border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">Your saved demand brief</p>
                <p className="mt-2 font-serif text-xl font-bold">{demand.window}</p>
                <p className="mt-3 text-sm leading-6 text-white/55">{demand.when} · {demand.who}</p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#local-demand" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-black text-black transition hover:bg-emerald-300">See what people want <ArrowRight className="h-4 w-4" /></a>
              <Link to={putPerkHref} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white transition hover:bg-white/[0.08]">Make something available</Link>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-emerald-400/10 blur-3xl" />
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
              <TicketPass kicker="Nothing strong nearby yet" title="You don’t have to wait for a signal." detail="Claim your place, keep your information current, or watch what people are asking for as the market develops." stub="OPEN" stubLabel="Market" />
            )}
          </div>
        </div>
      </section>

      <section id="local-demand" className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">What people nearby want</p>
              <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">A Want is not a customer yet. It is a reason to look closer.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">Use the Want to decide whether there is a fit before you commit discounts, stock, staff time or special hours. You can answer with access, an experience, a trial, a perk or something else you can genuinely honor.</p>
            </div>

            {isLoading && !liveSignals.length ? <div className="h-56 animate-pulse rounded-[1.6rem] bg-white/[0.04]" /> : liveSignals.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {liveSignals.slice(0, 2).map((signal) => (
                  <DemandSignalObject key={signal.poll.id} city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment} responseLabel={signal.poll.targetUnlockPerk} href={discoveryHref(signal.poll)} state={signalState(signal.votesRemaining, signal.closeness)} />
                ))}
              </div>
            ) : (
              <TicketPass kicker="Right now" title="No demand questions are live here yet." detail="No live requests yet. You can still claim your place, keep your information current and put up something useful when it makes sense." stub="0" stubLabel="Demand" />
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <NightTrail eyebrow="The merchant loop" title="Listen → qualify → open → learn" steps={[
            { label: "Listen", title: "Read what people are actually asking for.", text: "A Want makes interest visible. It does not promise a visit or a sale." },
            { label: "Qualify", title: "Decide whether this demand fits your business.", text: "Look at location, timing, volume and commitment before deciding whether the signal deserves a response." },
            { label: "Open", title: "Make only what you can honor available.", text: "Create an Offer, access window, Moment or place update with clear terms and limits." },
            { label: "Learn", title: "See who followed through.", text: "Picked-up access, visits and purchases stay distinct so you can understand what actually moved." },
          ]} />
          <PaperReceipt heading={`${inbox.city} local want snapshot`} lines={[
            { label: "Live wants", value: inbox.questions.length.toLocaleString(), strong: true },
            { label: "Voices", value: inbox.liveVoteCount.toLocaleString(), strong: true },
            { label: "Close to target", value: inbox.unlocking.length.toLocaleString() },
            { label: "Read as", value: "Interest, not sale", strong: true },
          ]} footer="Visible demand helps you make a better decision. It does not guarantee a visit or sale." />
        </div>
      </section>

      <ParticipationEconomy variant="operator" />

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">PromoCard is the customer-side product</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Make the relationship obvious before, during and after the visit.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">Your team should not need to understand PROMORANG’s whole system. PromoCard should make what is open, what the person picked up and what happens next clear at a glance.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <TicketPass kicker="Before the visit" title="Make the open thing clear" detail="What is available, when it can be used, how many exist, and what the participant needs to do." stub="OPEN" stubLabel="Access" />
              <TicketPass kicker="After the visit" title="Keep the relationship moving" detail="A confirmed visit can become part of the participant’s kept history without pretending it was a purchase." stub="VISIT" stubLabel="Follow-through" />
            </div>
          </div>
          <PromoCardFace holder="Participant PromoCard" available="What is open here" limit="Want · Open · Active · Kept" places="Show what is available, what this person has active and what the next step is at a glance." action="Use what is open" interactive={false} />
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Start with one response</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">What can your business make available that people would genuinely value?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55">It does not have to be a discount. Access, a complimentary extra, a trial, an upgrade, a sample, a Challenge, a Gig, a time-bound perk, a Content Drop or a Moment can be enough to begin.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to={putPerkHref} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-black text-black transition hover:bg-emerald-300"><Store className="h-4 w-4" /> Make something available <ArrowRight className="h-4 w-4" /></Link>
            <Link to={registerHref} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><MapPin className="h-4 w-4" /> Register your place</Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Interest, offers, visits, purchases and fulfillment are different parts of the customer journey.</p>
        </div>
      </section>
    </main>
  );
}