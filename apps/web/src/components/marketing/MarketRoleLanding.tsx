import { useI18n } from "@/i18n/I18nContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { DemandSignalObject } from "@/components/promorang/DemandSignalObject";
import { TicketPass } from "@/components/promorang/SignatureObjects";
import { useMarket } from "@/contexts/MarketContext";
import { useDiscoveryDemand } from "@/hooks/useDiscoveryDemand";
import { discoverPathHref } from "@/lib/discovery-path";

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
  const { t } = useI18n();
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
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">{props.eyebrow} · {t("compression.businessTitle")}</p>
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

          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
            <p className="text-xs font-bold text-orange-300">{t("compression.howWorks")}</p>
            <h2 className="mt-4 text-2xl font-bold">{props.responseTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">{props.responseDetail}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold text-orange-300">{t("compression.results")}</p>
          <h2 className="mt-3 text-3xl font-bold">{props.proofTitle}</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">{props.proofDetail}</p>
          <details className="mt-6 rounded-xl border border-white/10 p-4">
            <summary className="min-h-11 cursor-pointer text-sm font-bold">{t("compression.details")}</summary>
            <p className="mt-2 text-sm leading-6 text-white/60">{t("compression.distinctions")}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/55">{props.truthGates.map(gate => <li key={gate}>{gate}</li>)}</ul>
          </details>
        </div>
      </section>
      <section className="border-b border-white/10 px-5 py-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div><h2 className="text-3xl font-bold">{t("compression.marketTitle")}</h2><p className="mt-4 text-sm leading-7 text-white/60">{t("compression.marketCopy")}</p><Link to="/discover?tab=wants" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-300">{t("compression.seeDemand")}<ArrowRight className="h-4 w-4" /></Link></div>
          {leadSignal ? <DemandSignalObject city={inbox.city} title={leadSignal.poll.question} leadingOption={leadSignal.leading?.text} demandCount={leadSignal.poll.totalVotes || 0} threshold={leadSignal.poll.thresholdForMoment} responseLabel={leadSignal.poll.targetUnlockPerk} href={discoverPathHref(leadSignal.poll.question)} actionLabel={t("compression.seeDemand")} state={signalState(leadSignal.votesRemaining, leadSignal.closeness)} /> : !isLoading ? <TicketPass kicker={t("compression.seeDemand")} title={t("compression.quiet")} detail={t("compression.quietCopy")} stub="—" stubLabel={city.name} /> : <p role="status" className="text-sm text-white/60">{t("people.homeLoad")}</p>}
        </div>
      </section>
      <section className="border-b border-white/10 px-5 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl"><h2 className="text-3xl font-bold">{t("compression.keepTitle")}</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">{props.promoCardDetail}</p><Link to="/what-is-promorang" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-orange-300">{t("compression.cardMore")}<ArrowRight className="h-4 w-4" /></Link></div>
      </section>
      <section className="px-5 py-12 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><h2 className="text-2xl font-bold">{t("compression.ready")}</h2><p className="mt-3 text-sm text-white/60">{t("compression.readyCopy")}</p></div><Link to={props.primaryCta.href} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-black text-black">{props.primaryCta.label}<ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </main>
  );
}
