import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { NightTrail, PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { discoveryHref } from "@/lib/discovery-path";

type RoleLandingProps = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  roleJob: string;
  discoveryUse: string;
  demandUse: string;
  responseTitle: string;
  responseDetail: string;
  responseStub: string;
  proofTitle: string;
  proofDetail: string;
  promoCardDetail: string;
  truthGates: string[];
};

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

export default function MarketRoleLanding(props: RoleLandingProps) {
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(
    city.name,
    country.slug || "jamaica",
    city.id === "all-jamaica" ? undefined : city.id,
  );
  const leadSignal = inbox.questions[0];

  return (
    <main className="min-h-screen overflow-x-clip bg-[#070707] text-white selection:bg-orange-500 selection:text-black">
      <SEO title={props.seoTitle} description={props.seoDescription} />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_5%,rgba(249,115,22,.18),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,.05),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1380px] gap-12 lg:grid-cols-[minmax(0,.92fr)_minmax(480px,1.08fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">{props.eyebrow}</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[.92] tracking-[-0.055em] sm:text-6xl lg:text-7xl">{props.title}</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">{props.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={props.primaryCta.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400">
                {props.primaryCta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              {props.secondaryCta ? (
                <Link to={props.secondaryCta.href} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-black text-white transition hover:bg-white/[0.08]">
                  {props.secondaryCta.label}
                </Link>
              ) : null}
            </div>
            <p className="mt-6 max-w-2xl border-l border-orange-400/40 pl-4 text-sm leading-6 text-white/45">{props.roleJob}</p>
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
                actionLabel="Open recorded signal"
                state={signalState(leadSignal.votesRemaining, leadSignal.closeness)}
              />
            ) : (
              <TicketPass
                kicker={isLoading ? "Reading recorded market" : "No recorded demand shown"}
                title={isLoading ? "Checking this market…" : "An empty market stays empty."}
                detail={isLoading ? "PROMORANG is reading production state." : "This page does not invent demand, customers, inventory or outcomes to make the opportunity look larger than it is."}
                stub="TRUTH"
                stubLabel="Market"
              />
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">One market · your lens</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Start with what is true, then decide what you can add.</h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <TicketPass
              kicker="Discovery"
              title="Know what already exists"
              detail={props.discoveryUse}
              stub="SEE"
              stubLabel="Knowledge"
            />
            <TicketPass
              kicker="Demand"
              title="See what people are asking for"
              detail={props.demandUse}
              stub="HEAR"
              stubLabel="Signal"
            />
            <TicketPass
              kicker="Response"
              title={props.responseTitle}
              detail={props.responseDetail}
              stub={props.responseStub}
              stubLabel="Your move"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <NightTrail
            eyebrow="The operating loop"
            title="Read → decide → respond → prove"
            steps={[
              { label: "Read", title: "Start with Discovery and recorded demand.", text: "Use approved knowledge and actual participant signals instead of assumptions dressed up as market truth." },
              { label: "Decide", title: "Choose whether the signal deserves a response.", text: "Demand can inform a decision. It does not obligate supply or prove that anyone will attend, buy or convert." },
              { label: "Respond", title: props.responseTitle, text: props.responseDetail },
              { label: "Prove", title: props.proofTitle, text: props.proofDetail },
            ]}
          />
          <PaperReceipt
            heading="Truth before persuasion"
            lines={props.truthGates.map((gate, index) => ({ label: `Gate ${index + 1}`, value: gate, strong: index === 0 }))}
            footer="PROMORANG can make a market legible without collapsing interest, supply, action and verified outcome into the same number."
          />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-300"><ShieldCheck className="h-4 w-4" /> PromoCard continuity</p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">The participant relationship should survive the campaign, event or offer.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/55">{props.promoCardDetail} PromoCard should only show access, returns and retained history that were actually issued or verified.</p>
          </div>
          <Link to="/what-is-promorang" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-black transition hover:bg-orange-100">
            See the whole system <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 border-t border-white/10 pt-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-serif text-2xl font-bold">Ready to make a legitimate response?</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Start from the job you need done. PROMORANG should not require you to understand the entire platform before making the next move.</p>
          </div>
          <Link to={props.primaryCta.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black transition hover:bg-orange-400">
            {props.primaryCta.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
