import { useI18n } from "@/i18n/I18nContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import BusinessOutcomeNavigator from "@/components/business/BusinessOutcomeNavigator";
import { CurrentArc } from "@/components/marketing/MarketingPhysics";

export default function BusinessStart() {
  const { t } = useI18n();
  return (
    <main className="marketing-cinematic min-h-screen overflow-x-clip bg-[#060606] text-white">
      <SEO title={t("commercial.promorang.for.business.start.with.the.outcome.185")} description={t("commercial.tell.promorang.what.needs.to.change.get.a.186")} />
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-12 pt-24 sm:px-6 md:pb-16 md:pt-32">
        <CurrentArc variant="hero" className="marketing-hero-current" />
        <div className="relative mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-orange-300">{t("commercial.promorang.for.business.149")}</p>
          <h1 className="mt-4 max-w-5xl font-serif text-5xl font-bold leading-[.92] tracking-[-.055em] sm:text-7xl">{t("commercial.start.with.the.change.you.need.187")}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">{t("commercial.you.do.not.need.to.arrive.with.a.188")}</p>
          <div className="mt-7 flex flex-wrap gap-4 text-xs font-bold">
            <Link to="/discover?tab=wants" className="inline-flex items-center gap-2 text-orange-300">{t("commercial.show.me.what.people.want.151")}<ArrowRight className="h-4 w-4" /></Link>
            <Link to="/solutions" className="inline-flex items-center gap-2 text-white/50">{t("commercial.see.all.business.solutions.189")}</Link>
          </div>
        </div>
      </section>
      <section className="px-5 py-12 sm:px-6 md:py-20">
        <BusinessOutcomeNavigator />
      </section>
    </main>
  );
}
