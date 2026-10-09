import { commercialText } from "@/i18n/commercial-presentation";
import { useI18n } from "@/i18n/I18nContext";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Compass, Megaphone, Sparkles, Store, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { PaperReceipt, TicketPass } from "@/components/promorang/SignatureObjects";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { useMarket } from "@/contexts/MarketContext";
import { discoverPathHref } from "@/lib/discovery-path";
import { BUSINESS_OUTCOMES, PROGRAMMES } from "@/lib/business-outcomes";



function signalState(votesRemaining: number, closeness: "unlocking" | "warming" | "early") {
  if (votesRemaining === 0) return "threshold_met" as const;
  if (closeness === "unlocking") return "near_threshold" as const;
  return closeness;
}

export default function SolutionsHub() {
  const { t } = useI18n();
  const sectors = [
  { icon: Store, title: t("commercial.places.merchants.139"), copy: t("commercial.visits.quiet.periods.product.movement.and.repeat.business.140"), href: "/for-merchants" },
  { icon: Building2, title: t("explorePage.browseBrands"), copy: t("commercial.product.trial.launches.customer.action.demand.learning.and.142"), href: "/for-brands" },
  { icon: Ticket, title: t("commercial.events.experiences.143"), copy: t("commercial.attendance.access.check.in.and.reasons.to.return.144"), href: "/hosting" },
  { icon: Users, title: t("commercial.communities.culture.145"), copy: t("commercial.shared.interest.participation.scenes.and.moments.146"), href: "/for-communities" },
];
  const { city, country } = useMarket();
  const { inbox, isLoading } = useDiscoveryDemand(city.name, country.slug || "jamaica", city.id === "all-jamaica" ? undefined : city.id);
  const signal = inbox.questions[0];

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <SEO title={t("commercial.promorang.for.business.start.with.the.outcome.147")} description={t("commercial.tell.promorang.what.needs.to.change.choose.an.148")} />

      <section className="border-b border-white/10 px-5 pb-16 pt-24 sm:px-6 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-[1380px] gap-12 lg:grid-cols-[1.04fr_.96fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">{t("commercial.promorang.for.business.149")}</p>
            <h1 className="mt-5 max-w-5xl font-serif text-5xl font-bold leading-[.92] tracking-[-.055em] sm:text-7xl">{t("compression.businessTitle")}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">{t("compression.businessCopy")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/business/start" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-400 px-6 text-sm font-black text-black">{t("commercial.choose.an.outcome.150")}<ArrowRight className="h-4 w-4" /></Link>
              <Link to="/discover?tab=wants" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-black"><Compass className="h-4 w-4" /> {t("commercial.show.me.what.people.want.151")}</Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-orange-300/15 bg-orange-300/[0.05] p-6 sm:p-7">
            <details><summary className="min-h-11 cursor-pointer text-sm font-bold">{t("compression.optional")}</summary>
            <div className="mt-5 space-y-4">
              {[
                ["01", t("commercial.outcome.led.152"), t("commercial.tell.us.what.needs.to.change.promorang.recommends.153")],
                ["02", t("commercial.intent.led.154"), t("commercial.already.know.the.activation.describe.it.and.build.155")],
                ["03", t("commercial.market.led.156"), t("commercial.see.what.people.want.and.decide.whether.your.157")],
              ].map(([n,title,copy]) => <div key={title} className="grid grid-cols-[42px_1fr] gap-4 border-t border-white/10 pt-4"><span className="font-mono text-xs font-black text-orange-300">{n}</span><div><h2 className="font-serif text-xl font-bold">{title}</h2><p className="mt-1 text-sm leading-6 text-white/45">{copy}</p></div></div>)}
            </div>
            </details>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("createProposal.chooseChange")}</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.045em] sm:text-5xl">{t("commercial.you.buy.the.outcome.promorang.helps.shape.the.159")}</h2>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BUSINESS_OUTCOMES.map((item) => (
              <Link key={item.id} to={`/business/start?outcome=${item.id}`} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 transition hover:border-orange-300/35">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-300">{commercialText(item.short, t)}</p>
                <h3 className="mt-3 font-serif text-2xl font-bold">{commercialText(item.title, t)}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">{commercialText(item.description, t)}</p>
                <ArrowRight className="mt-5 h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-orange-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <details className="border-b border-white/10 px-5 py-6 sm:px-6">
        <summary className="mx-auto min-h-11 max-w-6xl cursor-pointer text-sm font-bold">{t("compression.plan")}</summary>
      <section className="border-b border-white/10 bg-[#0b0b0b] px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.starting.programmes.160")}</p>
          <h2 className="mt-3 max-w-4xl font-serif text-4xl font-bold tracking-[-.04em] sm:text-5xl">{t("commercial.a.considered.route.not.a.pile.of.features.161")}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">{t("commercial.programmes.are.configurable.recipes.they.help.translate.a.162")}</p>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PROGRAMMES.map((programme) => <article key={programme.id} className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5"><Sparkles className="h-5 w-5 text-orange-300" /><h3 className="mt-4 font-serif text-2xl font-bold">{commercialText(programme.title, t)}</h3><p className="mt-3 text-sm leading-6 text-white/45">{commercialText(programme.promise, t)}</p><p className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-white/25">{commercialText(programme.designedFor, t)}</p></article>)}
          </div>
        </div>
      </section>
      </details>

      <section id="market" className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-9 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.or.start.from.the.market.163")}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">{t("commercial.people.may.already.be.telling.you.where.to.164")}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">{t("commercial.a.want.is.not.a.sale.and.a.165")}</p>
            <Link to="/discover?tab=wants" className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-orange-300">{t("commercial.open.market.pulse.166")}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          {signal ? <DemandSignalObject city={inbox.city} title={signal.poll.question} leadingOption={signal.leading?.text || null} demandCount={signal.poll.totalVotes || 0} threshold={signal.poll.thresholdForMoment || null} responseLabel={signal.poll.targetUnlockPerk || null} href={discoverPathHref(signal.poll.question)} state={signalState(signal.votesRemaining, signal.closeness)} actionLabel={t("commercial.open.want.167")} /> : <TicketPass kicker={isLoading ? t("release.93") : t("release.94")} title={isLoading ? t("release.95") : t("release.96")} detail={isLoading ? t("release.97") : t("release.98")} stub="NOW" stubLabel={t("commercial.market.72")} />}
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.business.context.comes.second.168")}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">{t("commercial.the.same.outcome.means.different.things.for.different.169")}</h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {sectors.map(({icon:Icon,title,copy,href}) => <Link key={title} to={href} className="group grid gap-4 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center"><div className="grid h-11 w-11 place-items-center rounded-full border border-white/10"><Icon className="h-5 w-5 text-orange-300" /></div><div><h3 className="font-serif text-2xl font-bold group-hover:text-orange-300">{title}</h3><p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">{copy}</p></div><ArrowRight className="h-5 w-5 text-white/25 group-hover:text-orange-300" /></Link>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.zero.hero.170")}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-.04em]">{t("commercial.the.work.is.not.finished.when.the.campaign.171")}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/50">{t("commercial.promorang.is.designed.to.carry.the.business.from.172")}</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link to="/business/start" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-orange-400 px-5 text-xs font-black text-black">{t("commercial.start.with.my.outcome.173")}<ArrowRight className="h-4 w-4" /></Link><Link to="/pricing" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-black">{t("commercial.see.commercial.scope.174")}</Link></div>
          </div>
          <PaperReceipt heading={t("commercial.the.loop.175")} lines={[
            {label:t("commercial.need.176"),value:t("commercial.what.must.change.177")},
            {label:t("commercial.programme.178"),value:t("commercial.recommended.route.179"),strong:true},
            {label:t("hostCard.response"),value:t("commercial.what.goes.live.180")},
            {label:t("commercial.evidence.78"),value:t("commercial.what.people.did.181"),strong:true},
            {label:t("commercial.decision.182"),value:t("commercial.repeat.change.stop.183")},
          ]} footer={t("commercial.outcome.programme.evidence.next.move.184")} />
        </div>
      </section>
    </main>
  );
}
