import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, CheckCircle2, Radio, Ticket, Users } from "lucide-react";
import SEO from "@/components/SEO";
import { cultureEvents } from "@/data/culture-demo";
import { HostSyndicateSimulator } from "@/components/value/HostSyndicateSimulator";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const operatingLoop: Array<{
  icon: typeof Radio;
  label: TranslationKey;
  text: TranslationKey;
}> = [
  { icon: Radio, label: "orgLand.loopPublish", text: "orgLand.loopPublishText" },
  { icon: Ticket, label: "orgLand.loopFill", text: "orgLand.loopFillText" },
  { icon: CheckCircle2, label: "orgLand.loopProve", text: "orgLand.loopProveText" },
  { icon: BarChart3, label: "orgLand.loopBuild", text: "orgLand.loopBuildText" },
];

export default function OrganizerLanding() {
  const { t } = useI18n();

  const operatingStats: Array<[TranslationKey, string]> = [
    ["orgLand.tonight", cultureEvents[0].shortTitle],
    ["orgLand.peopleMoving", cultureEvents[0].attending],
    ["orgLand.proofLayer", cultureEvents[0].proof],
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <SEO
        title={t("orgLand.seoTitle")}
        description={t("orgLand.seoDescription")}
      />

      <section className="relative min-h-[680px] overflow-hidden border-b border-white/10 pt-20">
        <img src={cultureEvents[3].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(255,106,0,.22),transparent_30%),linear-gradient(90deg,#050505_5%,rgba(5,5,5,.92)_50%,rgba(5,5,5,.35))]" />
        <div className="container relative grid min-h-[600px] gap-10 px-6 py-16 lg:grid-cols-[1fr_390px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">{t("orgLand.kicker")}</p>
            <h1 className="mt-5 max-w-4xl text-6xl font-black uppercase leading-[0.82] tracking-[-0.075em] md:text-8xl">
              {t("orgLand.hero1")}<br /><span className="text-primary">{t("orgLand.hero2")}</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
              {t("orgLand.lede")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/organizer/events" className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">
                {t("orgLand.openWorkspace")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/create/moment" className="rounded-xl border border-white/20 bg-black/35 px-5 py-3 text-sm font-black">
                {t("orgLand.createMoment")}
              </Link>
            </div>
          </div>

          <div className="border-l border-primary/50 bg-black/60 p-6 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{t("orgLand.operatingView")}</p>
            <div className="mt-6 space-y-5">
              {operatingStats.map(([label, value]) => (
                <div key={label} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
                  <p className="text-xs text-white/40">{t(label)}</p>
                  <p className="mt-1 text-xl font-black">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Production & Syndicate Breakeven Simulator */}
      <section className="container px-6 py-12">
        <HostSyndicateSimulator />
      </section>

      <section className="container px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{t("orgLand.fromListing")}</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">{t("orgLand.opsTitle")}</h2>
            <p className="mt-4 leading-7 text-white/55">{t("orgLand.opsLede")}</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {operatingLoop.map((item, index) => (
              <div key={item.label} className="bg-[#111] p-6">
                <div className="flex items-center justify-between">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-black text-white/25">0{index + 1}</span>
                </div>
                <h3 className="mt-10 text-2xl font-black">{t(item.label)}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{t(item.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10">
          <img src={cultureEvents[1].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/55" />
          <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-end md:justify-between md:p-12">
            <div>
              <Users className="h-7 w-7 text-primary" />
              <h2 className="mt-5 max-w-2xl text-4xl font-black">{t("orgLand.returnTitle")}</h2>
            </div>
            <Link to="/organizer/events" className="inline-flex shrink-0 items-center gap-2 font-black text-primary">
              {t("orgLand.getStarted")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
