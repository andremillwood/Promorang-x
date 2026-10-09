import { commercialText } from "@/i18n/commercial-presentation";
import { useI18n } from "@/i18n/I18nContext";
import { useMemo } from "react";
import { ArrowRight, Building2, Eye, Handshake, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { NightTrail, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { ParticipationEconomy } from "@/components/promorang/ParticipationEconomy";
import { discoverPathHref } from "@/lib/discovery-path";
import { BUSINESS_OUTCOMES, PROGRAMMES } from "@/lib/business-outcomes";

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

const brandOutcomeIds = ["launch", "try-it", "move-this", "learn-demand", "word-of-mouth", "bring-back"];
const brandProgrammeIds = ["first-50", "try-this", "move-this", "what-do-they-want", "tell-somebody", "bring-them-back"];

export default function ForBrands() {
  const { t } = useI18n();
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const liveSignals = useMemo(() => inbox.questions.slice(0, 2), [inbox.questions]);
  const outcomes = BUSINESS_OUTCOMES.filter((item) => brandOutcomeIds.includes(item.id));
  const programmes = PROGRAMMES.filter((item) => brandProgrammeIds.includes(item.id));

  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO title={t("commercial.promorang.for.brands.start.with.the.customer.movement.50")} description={t("commercial.choose.the.customer.action.your.brand.needs.get.51")} />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_.82fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300"><Building2 className="h-4 w-4" /> {t("commercial.for.brands.52")}{t("compression.businessTitle")}</p>
            <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-7xl">{t("compression.brandTitle")}</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">{t("compression.brandIntro")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">{t("compression.chooseOutcome")} <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/discover?tab=wants" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">{t("compression.seeDemand")}</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-orange-300/15 bg-orange-300/[0.055] p-6 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">{t("commercial.the.brand.question.53")}</p>
            <p className="mt-4 font-serif text-3xl font-bold leading-tight">{t("commercial.what.customer.action.would.actually.prove.the.investment.54")}</p>
            <p className="mt-4 text-sm leading-7 text-white/50">{t("commercial.promorang.keeps.awareness.interest.claims.visits.attendance.purchase.55")}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.start.with.an.outcome.56")}</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">{t("commercial.no.campaign.vocabulary.required.57")}</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((item) => <Link key={item.id} to={`/business/start?outcome=${item.id}`} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-orange-300/35"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-300">{commercialText(item.short, t)}</p><h3 className="mt-3 font-serif text-2xl font-bold">{commercialText(item.title, t)}</h3><p className="mt-3 text-sm leading-6 text-white/45">{commercialText(item.description, t)}</p><ArrowRight className="mt-5 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-orange-300" /></Link>)}
          </div>
        </div>
      </section>

      <details className="border-b border-white/10 px-5 py-6 sm:px-6">
        <summary className="mx-auto min-h-11 max-w-6xl cursor-pointer text-sm font-bold">{t("compression.plan")}</summary>
      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.brand.programmes.58")}</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.04em] sm:text-5xl">{t("commercial.choose.a.route.then.customize.it.59")}</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => <article key={programme.id} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"><Sparkles className="h-5 w-5 text-orange-300" /><h3 className="mt-4 font-serif text-2xl font-bold">{commercialText(programme.title, t)}</h3><p className="mt-3 text-sm leading-6 text-white/45">{commercialText(programme.promise, t)}</p><div className="mt-5 flex flex-wrap gap-2">{programme.path.map((step) => <span key={step} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-white/45">{commercialText(step, t)}</span>)}</div></article>)}
          </div>
        </div>
      </section>
      </details>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.read.the.market.too.60")}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.045em]">{t("commercial.a.business.goal.and.a.market.signal.can.61")}</h2>
            <p className="mt-4 text-sm leading-7 text-white/50">{t("commercial.you.can.start.from.the.brand.outcome.or.62")}</p>
          </div>
          {isLoading && !liveSignals.length ? <div className="h-56 animate-pulse rounded-[1.6rem] bg-white/[0.04]" /> : liveSignals.length ? <div className="grid gap-4 xl:grid-cols-2">{liveSignals.map((signal) => <DemandSignalObject key={signal.poll.id} city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment} responseLabel={signal.poll.targetUnlockPerk} href={discoverPathHref(signal.poll.question)} state={signalState(signal.votesRemaining, signal.closeness)} />)}</div> : <TicketPass kicker={t("commercial.right.now.63")} title={t("commercial.quiet.here.right.now.64")} detail={t("commercial.there.is.no.strong.want.here.yet.a.65")} stub="0" stubLabel={t("commercial.now.66")} />}
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <NightTrail eyebrow={t("commercial.the.brand.loop.67")} title={t("commercial.outcome.market.response.evidence.decision.68")} steps={[
            { label: t("createProposal.step1Short"), title: t("commercial.name.the.customer.movement.70"), text: t("commercial.start.with.the.behavior.that.would.matter.to.71") },
            { label: t("commercial.market.72"), title: t("commercial.read.what.people.are.already.showing.you.73"), text: t("commercial.use.discoveries.and.wants.to.sharpen.the.brief.74") },
            { label: t("hostCard.response"), title: t("commercial.put.something.real.into.market.76"), text: t("commercial.configure.the.offer.access.moment.content.or.other.77") },
            { label: t("commercial.evidence.78"), title: t("commercial.see.what.people.did.next.79"), text: t("commercial.track.the.selected.action.using.the.strongest.available.80") },
          ]} />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.why.promocard.matters.81")}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">{t("commercial.do.not.just.win.an.action.give.people.82")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">{t("commercial.when.someone.saves.claims.attends.or.earns.access.83")}</p>
          </div>
          <PromoCardFace holder={t("commercial.participant.promocard.84")} available={t("commercial.a.response.is.open.85")} limit={t("commercial.issued.access.only.86")} places={t("commercial.the.card.can.carry.access.or.a.return.87")} action={t("discover.pathOtherCta")} interactive={false} />
        </div>
      </section>

      <details className="px-5 py-6 sm:px-6"><summary className="mx-auto min-h-11 max-w-6xl cursor-pointer text-sm font-bold">{t("compression.details")}</summary><ParticipationEconomy variant="operator" /></details>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.start.from.the.change.89")}</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">{t("commercial.what.do.you.want.people.to.do.and.90")}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black"><Handshake className="h-4 w-4" /> {t("commercial.build.my.route.91")}<ArrowRight className="h-4 w-4" /></Link>
            <Link to="/what-is-promorang" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><Eye className="h-4 w-4" /> {t("commercial.understand.promorang.92")}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
