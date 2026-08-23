import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Coins, Gem, HandHeart, Megaphone, Radio, Rocket, Share2, Sparkles, Target, TrendingUp, Trophy } from "lucide-react";
import SEO from "@/components/SEO";
import { cultureCreators, cultureEvents } from "@/data/culture-demo";
import { PersonalValueNav } from "@/components/value/PersonalValueNav";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

const growthTiles = [
  { titleKey: "growthHub.tileContentTitle" as TranslationKey, textKey: "growthHub.tileContentText" as TranslationKey, href: "/growth/content", icon: Radio },
  { titleKey: "growthHub.tilePromoshareTitle" as TranslationKey, textKey: "growthHub.tilePromoshareText" as TranslationKey, href: "/growth/promoshare", icon: Sparkles },
  { titleKey: "growthHub.tileCampaignsTitle" as TranslationKey, textKey: "growthHub.tileCampaignsText" as TranslationKey, href: "/growth/campaigns", icon: Megaphone },
  { titleKey: "growthHub.tileReferralsTitle" as TranslationKey, textKey: "growthHub.tileReferralsText" as TranslationKey, href: "/growth/referrals", icon: Share2 },
  { titleKey: "growthHub.tilePioneerTitle" as TranslationKey, textKey: "growthHub.tilePioneerText" as TranslationKey, href: "/growth/pioneer", icon: Trophy },
  { titleKey: "growthHub.tilePiecesTitle" as TranslationKey, textKey: "growthHub.tilePiecesText" as TranslationKey, href: "/growth/pieces", icon: Trophy },
  { titleKey: "growthHub.tileAnalyticsTitle" as TranslationKey, textKey: "growthHub.tileAnalyticsText" as TranslationKey, href: "/growth/analytics", icon: BarChart3 },
  { titleKey: "growthHub.tileEarningsTitle" as TranslationKey, textKey: "growthHub.tileEarningsText" as TranslationKey, href: "/growth/earnings", icon: Coins },
  { titleKey: "growthHub.tileMembershipTitle" as TranslationKey, textKey: "growthHub.tileMembershipText" as TranslationKey, href: "/wallet", icon: Gem },
  { titleKey: "growthHub.tileResilienceTitle" as TranslationKey, textKey: "growthHub.tileResilienceText" as TranslationKey, href: "/support", icon: HandHeart },
  { titleKey: "growthHub.tileKickstartTitle" as TranslationKey, textKey: "growthHub.tileKickstartText" as TranslationKey, href: "/growth/kickstart", icon: Rocket },
];

const routeFallbacks: Record<string, string> = {
  "/growth/content": "/content-drops",
  "/growth/promoshare": "/promoshare",
  "/growth/campaigns": "/promopush",
  "/growth/referrals": "/growth/referrals",
  "/growth/pieces": "/portfolio",
  "/growth/analytics": "/dashboard/analytics",
  "/growth/earnings": "/wallet",
  "/growth/pioneer": "/growth/pioneer",
  "/growth/kickstart": "/marketplace",
};

export default function GrowthHub() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-black pb-16 text-white">
      <SEO
        title={t("growthHub.seoTitle")}
        description={t("growthHub.seoDescription")}
      />
      <section className="relative min-h-[560px] overflow-hidden border-b border-white/10 pt-24">
        <img src={cultureEvents[0].image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        <div className="container relative grid min-h-[464px] gap-8 px-6 pb-12 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("growthHub.heroEyebrow")}</p>
            <h1 className="mt-4 max-w-5xl font-sans text-5xl font-black uppercase leading-[0.84] tracking-[-0.075em] md:text-8xl">
              {t("growthHub.heroTitle1")}<br /><span className="text-primary">{t("growthHub.heroTitle2")}</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">
              {t("growthHub.heroSubtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/content-drops" className="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">{t("growthHub.launchContent")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              <Link to="/promoshare" className="inline-flex items-center rounded-xl border border-white/20 bg-black/30 px-5 py-3 text-sm font-black">{t("growthHub.openPromoShare")}</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/55 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{t("growthHub.operatorBadge")}</p>
            <div className="mt-4 flex items-center gap-4">
              <img src={cultureCreators[0].avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
              <div>
                <p className="text-xl font-black">{t("growthHub.operatorTitle")}</p>
                <p className="text-sm text-white/55">{t("growthHub.operatorSubtitle")}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[["Reach", "Connect"], ["Signal", "Build"], ["Earn", "Activate"]].map(([label, value]) => <div key={label} className="rounded-xl bg-white/[0.06] p-3"><p className="text-sm font-black">{value}</p><p className="text-[9px] uppercase text-white/35">{label}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <div className="container relative z-20 -mt-5 px-6">
        <PersonalValueNav />
      </div>

      <section className="container px-6 py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{t("growthHub.queueEyebrow")}</p><h2 className="mt-1 text-3xl font-black">{t("growthHub.queueHeading")}</h2></div>
          <Link to="/dashboard/analytics" className="text-sm font-bold text-primary">{t("growthHub.viewAnalytics")}</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { title: t("growthHub.queueCard1Title"), text: t("growthHub.queueCard1Text"), href: "/content-drops", icon: Radio, cta: t("growthHub.queueCard1Cta") },
            { title: t("growthHub.queueCard2Title"), text: t("growthHub.queueCard2Text"), href: "/promoshare", icon: Share2, cta: t("growthHub.queueCard2Cta") },
            { title: t("growthHub.queueCard3Title"), text: t("growthHub.queueCard3Text"), href: "/missions", icon: Target, cta: t("growthHub.queueCard3Cta") },
          ].map((item) => (
            <Link key={item.title} to={item.href} className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-primary/50">
              <item.icon className="h-6 w-6 text-primary" /><h3 className="mt-8 text-2xl font-black">{item.title}</h3><p className="mt-3 text-sm leading-6 text-white/52">{item.text}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">{item.cta}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container px-6 pb-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{t("growthHub.enginesEyebrow")}</p><h2 className="mt-1 text-3xl font-black">{t("growthHub.enginesHeading")}</h2></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {growthTiles.map((tile) => (
            <Link key={tile.href} to={routeFallbacks[tile.href] || tile.href} className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-primary/50">
              <tile.icon className="mb-5 h-7 w-7 text-primary" />
              <h2 className="text-2xl font-black">{t(tile.titleKey)}</h2>
              <p className="mt-3 min-h-16 text-sm leading-6 text-white/58">{t(tile.textKey)}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-primary">
                {t("growthHub.tileOpen")}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container px-6 pb-10">
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{t("growthHub.valueEyebrow")}</p>
          <h2 className="mt-1 text-3xl font-black">{t("growthHub.valueHeading")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/58">{t("growthHub.valueSubtitle")}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { icon: Gem, title: t("growthHub.benefitCard1Title"), label: t("growthHub.benefitCard1Label"), text: t("growthHub.benefitCard1Text") },
            { icon: Trophy, title: t("growthHub.benefitCard2Title"), label: t("growthHub.benefitCard2Label"), text: t("growthHub.benefitCard2Text") },
            { icon: HandHeart, title: t("growthHub.benefitCard3Title"), label: t("growthHub.benefitCard3Label"), text: t("growthHub.benefitCard3Text") },
            { icon: Rocket, title: t("growthHub.benefitCard4Title"), label: t("growthHub.benefitCard4Label"), text: t("growthHub.benefitCard4Text") },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center justify-between gap-3"><item.icon className="h-6 w-6 text-primary" /><span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-primary">{item.label}</span></div>
              <h3 className="mt-8 text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/55">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100/75">
          {t("growthHub.disclaimerNotice")}
        </div>
      </section>

      <section className="container px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /><p className="text-xs font-black uppercase tracking-[0.22em] text-primary">{t("growthHub.opportunitiesEyebrow")}</p></div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">{t("growthHub.opportunitiesHeading")}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">{t("growthHub.opportunitiesSubtitle")}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {cultureEvents.slice(0, 3).map((event) => (
              <Link key={event.slug} to={`/events/${event.slug}`} className="rounded-2xl border border-white/10 bg-black/35 p-3">
                <img src={event.image} alt="" className="h-28 w-full rounded-xl object-cover" />
                <p className="mt-3 font-black">{event.shortTitle}</p>
                <p className="text-xs text-primary">{event.proof}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

