import { commercialText } from "@/i18n/commercial-presentation";
import { useI18n } from "@/i18n/I18nContext";
import { useMemo } from "react";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Store } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { buildMerchantDemandOpening, merchantAuthHref, readMerchantDemand } from "@/lib/merchant-demand";
import { discoverPathHref } from "@/lib/discovery-path";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { NightTrail, PromoCardFace, TicketPass } from "@/components/promorang/SignatureObjects";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";
import { ParticipationEconomy } from "@/components/promorang/ParticipationEconomy";
import { BUSINESS_OUTCOMES, PROGRAMMES } from "@/lib/business-outcomes";

function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

const merchantOutcomeIds = ["bring-people-in", "quiet-period", "move-this", "bring-back", "launch", "learn-demand"];
const merchantProgrammeIds = ["first-50", "quiet-hours", "move-this", "bring-them-back", "what-do-they-want"];

export default function ForMerchants() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { city, country } = useMarket();
  const [searchParams] = useSearchParams();
  const claimVenue = searchParams.get("claimVenue") || searchParams.get("venue");
  const demandAnswers = readMerchantDemand(searchParams);
  const demand = demandAnswers ? buildMerchantDemandOpening(demandAnswers) : null;
  const registerHref = merchantAuthHref(user, "/dashboard/venues/add");
  const { inbox, isLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const liveSignals = useMemo(() => inbox.questions.slice(0, 2), [inbox.questions]);
  const outcomes = BUSINESS_OUTCOMES.filter((item) => merchantOutcomeIds.includes(item.id));
  const programmes = PROGRAMMES.filter((item) => merchantProgrammeIds.includes(item.id));

  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#070707] text-white">
      <SEO title={claimVenue ? t("commercial.placeSeo", { place: claimVenue }) : t("commercial.merchantSeo")} description={t("commercial.more.visits.stronger.quiet.periods.product.movement.and.93")} />

      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-16 pt-28 sm:px-6 md:pb-24 md:pt-36">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1fr_.86fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300"><Store className="h-4 w-4" /> {t("commercial.for.merchants.places.94")}{t("compression.businessTitle")}</p>
            <h1 className="mt-6 max-w-5xl font-serif text-5xl font-bold leading-[.91] tracking-[-0.055em] sm:text-7xl">{t("compression.merchantTitle")}</h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/65 sm:text-lg">{t("compression.merchantIntro")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-black text-black">{t("compression.chooseOutcome")} <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/discover?tab=wants" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black">{t("compression.seeDemand")}</Link>
            </div>

            {claimVenue ? (
              <div className="mt-7 max-w-2xl rounded-[1.6rem] border border-amber-300/20 bg-amber-300/[0.07] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">{t("commercial.is.this.your.place.95")}</p>
                <p className="mt-2 font-serif text-2xl font-bold">{claimVenue}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">{t("commercial.claim.the.place.to.manage.how.it.appears.96")}</p>
                <Link to={`${registerHref}${registerHref.includes("?") ? "&" : "?"}name=${encodeURIComponent(claimVenue)}`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-300 px-5 text-sm font-black text-black">{t("commercial.claim.this.place.97")}<ArrowRight className="h-4 w-4" /></Link>
              </div>
            ) : null}

            {demand ? (
              <div className="mt-7 max-w-2xl rounded-[1.6rem] border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">{t("commercial.your.saved.demand.brief.98")}</p>
                <p className="mt-2 font-serif text-xl font-bold">{commercialText(demand.window, t)}</p>
                <p className="mt-3 text-sm leading-6 text-white/55">{commercialText(demand.when, t) === demand.when ? t("commercial.merchantPreview.capacity", { window: commercialText(demand.window, t) }) : commercialText(demand.when, t)} · {commercialText(demand.who, t)}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-emerald-300/15 bg-emerald-300/[0.055] p-6 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">{t("commercial.say.it.the.way.you.actually.think.it.99")}</p>
            <div className="mt-5 space-y-3">
              {[t("commercial.i.need.more.customers.100"), t("commercial.i.want.people.in.during.a.quiet.time.101"), t("commercial.i.need.to.move.this.item.102"), t("commercial.i.want.first.time.customers.to.return.103"), t("commercial.i.do.not.know.show.me.what.people.104")].map((line) => <p key={line} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm font-bold">{line}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">{t("commercial.start.with.an.outcome.56")}</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">{t("commercial.promorang.can.translate.the.business.problem.into.the.105")}</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((item) => <Link key={item.id} to={`/business/start?outcome=${item.id}`} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-300/35"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">{commercialText(item.short, t)}</p><h3 className="mt-3 font-serif text-2xl font-bold">{commercialText(item.title, t)}</h3><p className="mt-3 text-sm leading-6 text-white/45">{commercialText(item.description, t)}</p><ArrowRight className="mt-5 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-emerald-300" /></Link>)}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-14 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">{t("release.50")}</p>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl">{t("release.51")}</h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/60">{t("release.52")}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">{t("release.53")}</p>
          <div className="mt-6 flex flex-wrap gap-4"><Link className="inline-flex min-h-12 items-center rounded-full bg-emerald-300 px-6 font-bold text-black" to="/dashboard/products/add">{t("release.54")}</Link><Link className="inline-flex min-h-12 items-center rounded-full border border-white/20 px-6 font-bold" to="/offers">{t("release.55")}</Link><Link className="inline-flex min-h-12 items-center px-3 text-emerald-300" to="/shop">{t("release.56")}</Link></div>
        </div>
      </section>
      <details className="border-b border-white/10 px-5 py-6 sm:px-6">
        <summary className="mx-auto min-h-11 max-w-6xl cursor-pointer text-sm font-bold">{t("compression.plan")}</summary>
      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">{t("commercial.merchant.programmes.106")}</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.04em] sm:text-5xl">{t("commercial.a.route.your.team.can.understand.107")}</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => <article key={programme.id} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"><Sparkles className="h-5 w-5 text-emerald-300" /><h3 className="mt-4 font-serif text-2xl font-bold">{commercialText(programme.title, t)}</h3><p className="mt-3 text-sm leading-6 text-white/45">{commercialText(programme.promise, t)}</p><div className="mt-5 flex flex-wrap gap-2">{programme.path.map((step) => <span key={step} className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-white/45">{commercialText(step, t)}</span>)}</div></article>)}
          </div>
        </div>
      </section>
      </details>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">{t("commercial.local.market.108")}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em]">{t("commercial.a.request.is.not.a.customer.it.is.109")}</h2>
            <p className="mt-4 text-sm leading-7 text-white/50">{t("commercial.see.where.real.interest.is.gathering.then.put.110")}</p>
          </div>
          {isLoading && !liveSignals.length ? <div className="h-56 animate-pulse rounded-[1.6rem] bg-white/[0.04]" /> : liveSignals.length ? <div className="grid gap-4 xl:grid-cols-2">{liveSignals.map((signal) => <DemandSignalObject key={signal.poll.id} city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment} responseLabel={signal.poll.targetUnlockPerk} href={`/give?from=want&demand_id=${encodeURIComponent(signal.poll.id)}&want=${encodeURIComponent(signal.poll.question)}&city=${encodeURIComponent(inbox.city)}`} state={signalState(signal.votesRemaining, signal.closeness)} actionLabel={t("commercial.put.something.on.the.table.111")} />)}</div> : <TicketPass kicker={t("commercial.right.now.63")} title={t("commercial.no.strong.want.nearby.yet.112")} detail={t("commercial.you.can.still.start.from.your.own.business.113")} stub="0" stubLabel={t("commercial.want.114")} />}
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <NightTrail eyebrow={t("commercial.the.merchant.loop.115")} title={t("commercial.outcome.qualify.respond.verify.116")} steps={[
            { label: t("createProposal.step1Short"), title: t("commercial.name.what.would.make.the.business.better.117"), text: t("commercial.visits.purchases.repeat.behavior.product.movement.or.another.118") },
            { label: t("commercial.qualify.119"), title: t("commercial.check.whether.the.market.and.timing.make.sense.120"), text: t("commercial.look.at.wants.location.volume.and.what.the.121") },
            { label: t("commercial.respond.122"), title: t("commercial.put.up.only.what.you.can.honor.123"), text: t("commercial.create.an.offer.access.window.moment.or.place.124") },
            { label: t("commercial.verify.125"), title: t("commercial.see.what.really.happened.126"), text: t("commercial.validated.visits.purchases.or.other.supported.actions.become.127") },
          ]} />
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">{t("commercial.promocard.at.the.counter.128")}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">{t("commercial.make.it.obvious.what.this.person.can.use.129")}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">{t("commercial.your.staff.should.not.need.to.understand.the.130")}</p>
          </div>
          <PromoCardFace holder={t("commercial.participant.promocard.84")} available={t("commercial.use.this.here.131")} limit={t("commercial.issued.offer.terms.apply.132")} places={t("commercial.show.the.offer.the.terms.and.the.next.133")} action={t("commercial.present.this.134")} interactive={false} />
        </div>
      </section>

      <details className="px-5 py-6 sm:px-6"><summary className="mx-auto min-h-11 max-w-6xl cursor-pointer text-sm font-bold">{t("compression.details")}</summary><ParticipationEconomy variant="operator" /></details>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 text-center md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">{t("commercial.start.with.one.business.result.135")}</p>
          <h2 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-0.045em] sm:text-5xl">{t("commercial.tell.promorang.what.needs.to.improve.then.shape.136")}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-black text-black"><Store className="h-4 w-4" /> {t("commercial.build.my.route.91")}<ArrowRight className="h-4 w-4" /></Link>
            <Link to={registerHref} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black text-white/80"><MapPin className="h-4 w-4" /> {t("commercial.register.your.place.137")}</Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-2 text-xs text-white/35"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> {t("commercial.interest.offers.visits.purchases.and.fulfillment.remain.different.138")}</p>
        </div>
      </section>
    </main>
  );
}
