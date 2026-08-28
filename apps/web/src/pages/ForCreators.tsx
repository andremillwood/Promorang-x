import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import PioneerCallout from "@/components/pioneer/PioneerCallout";
import { MissionRoleValue } from "@/components/marketing/MissionRoleValue";
import { LeadMagnetGateway } from "@/components/LeadMagnetGateway";
import { CreatorEarningsSimulator } from "@/components/value/CreatorEarningsSimulator";
import { PlayCircle, Link2, MapPin, Sparkles, TrendingUp, ArrowRight, Gem, Users, Camera, Store, CalendarCheck, BadgeDollarSign, ShieldCheck, BarChart3, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";
import { PromoCardEconomyExplainer } from "@/components/promocard";

const ForCreators = () => {
  const { t } = useI18n();

  const creatorBenefits: Array<{ icon: typeof PlayCircle; titleKey: TranslationKey; descKey: TranslationKey }> = [
    {
      icon: PlayCircle,
      titleKey: "forCreators.benefit1Title",
      descKey: "forCreators.benefit1Desc",
    },
    {
      icon: Link2,
      titleKey: "forCreators.benefit2Title",
      descKey: "forCreators.benefit2Desc",
    },
    {
      icon: TrendingUp,
      titleKey: "forCreators.benefit3Title",
      descKey: "forCreators.benefit3Desc",
    },
    {
      icon: Gem,
      titleKey: "forCreators.benefit4Title",
      descKey: "forCreators.benefit4Desc",
    },
    {
      icon: Users,
      titleKey: "forCreators.benefit5Title",
      descKey: "forCreators.benefit5Desc",
    },
  ];

  const creatorUseCases: Array<{ icon: typeof Camera; titleKey: TranslationKey; descKey: TranslationKey }> = [
    {
      icon: Camera,
      titleKey: "forCreators.useCase1Title",
      descKey: "forCreators.useCase1Desc",
    },
    {
      icon: Store,
      titleKey: "forCreators.useCase2Title",
      descKey: "forCreators.useCase2Desc",
    },
    {
      icon: CalendarCheck,
      titleKey: "forCreators.useCase3Title",
      descKey: "forCreators.useCase3Desc",
    },
  ];

  const creatorEconomicsKeys: TranslationKey[] = [
    "forCreators.economic1",
    "forCreators.economic2",
    "forCreators.economic3",
    "forCreators.economic4",
  ];

  const creatorFaqs: Array<{ qKey: TranslationKey; aKey: TranslationKey }> = [
    {
      qKey: "forCreators.faq1Q",
      aKey: "forCreators.faq1A",
    },
    {
      qKey: "forCreators.faq2Q",
      aKey: "forCreators.faq2A",
    },
    {
      qKey: "forCreators.faq3Q",
      aKey: "forCreators.faq3A",
    },
  ];

  const creatorFeaturesKeys: TranslationKey[] = [
    "forCreators.feature1",
    "forCreators.feature2",
    "forCreators.feature3",
    "forCreators.feature4",
    "forCreators.feature5",
  ];

  const creatorHowSteps: Array<{ icon: typeof PlayCircle; titleKey: TranslationKey; descKey: TranslationKey }> = [
    {
      icon: PlayCircle,
      titleKey: "forCreators.step1Title",
      descKey: "forCreators.step1Desc",
    },
    {
      icon: Link2,
      titleKey: "forCreators.step2Title",
      descKey: "forCreators.step2Desc",
    },
    {
      icon: ShieldCheck,
      titleKey: "forCreators.step3Title",
      descKey: "forCreators.step3Desc",
    },
    {
      icon: BarChart3,
      titleKey: "forCreators.step4Title",
      descKey: "forCreators.step4Desc",
    },
  ];

  return (
    <div className="marketing-refined min-h-screen bg-background">
      <SEO
        title={t("forCreators.seoTitle")}
        description={t("forCreators.seoDescription")}
        type="website"
      />

      <section className="relative overflow-hidden border-b border-white/5 bg-charcoal pb-20 pt-24 text-white sm:pt-28 md:pb-32 md:pt-40">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -top-12 -right-12" />
        <div className="container px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8">
              <PlayCircle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t("forCreators.badge")}</span>
            </div>

            <h1 className="mx-auto mb-6 max-w-[20rem] break-words text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] sm:max-w-4xl sm:text-6xl md:text-7xl">
              {t("forCreators.heroTitle1")} <span className="text-primary italic">{t("forCreators.heroTitle2")}</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg md:text-xl">
              {t("forCreators.heroCopy")}
            </p>

            <MarketingPromiseStrip
              variant="dark"
              className="mx-auto mb-8 max-w-5xl text-left"
              items={[
                { label: t("forCreators.promiseSituationLabel"), text: t("forCreators.promiseSituationText") },
                { label: t("forCreators.promisePossibleLabel"), text: t("forCreators.promisePossibleText") },
                { label: t("forCreators.promiseNextLabel"), text: t("forCreators.promiseNextText") },
              ]}
            />

            <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?role=creator">
                  {t("forCreators.startAsCreator")}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10" size="lg" asChild>
                <Link to="/creators">Explore Creator Hub &amp; Things to Share</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
              {[
                { titleKey: "forCreators.stripStoryTitle" as const, descKey: "forCreators.stripStoryText" as const },
                { titleKey: "forCreators.stripPlaceTitle" as const, descKey: "forCreators.stripPlaceText" as const },
                { titleKey: "forCreators.stripUnlockTitle" as const, descKey: "forCreators.stripUnlockText" as const },
              ].map(({ titleKey, descKey }) => (
                <div key={titleKey} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t(titleKey)}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{t(descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PromoCardEconomyExplainer audience="creator" />

      {/* Interactive Value Experience Simulator */}
      <section className="container mx-auto px-4 -mt-12 relative z-20 mb-16">
        <CreatorEarningsSimulator />
      </section>

      <LeadMagnetGateway audience="creator" />

      <MissionRoleValue audience="creator" />

      <PioneerCallout
        title={t("forCreators.pioneerTitle")}
        copy={t("forCreators.pioneerCopy")}
      />

      <section className="py-24 bg-background border-b border-border">
        <div className="container px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
              {t("forCreators.loopTitle1")} <span className="text-primary">{t("forCreators.loopTitle2")}</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("forCreators.loopCopy")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            {creatorBenefits.map((item) => (
              <div key={item.titleKey} className="rounded-[2rem] border border-border bg-card p-6 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] hover:border-primary/30">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{t(item.titleKey)}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/30 py-24">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="border-primary/20 bg-primary/10 text-primary">{t("forCreators.audienceBadge")}</Badge>
            <h2 className="mt-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
              {t("forCreators.audienceTitle")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("forCreators.audienceCopy")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {creatorUseCases.map((item) => (
              <div key={item.titleKey} className="rounded-[2rem] border border-border bg-card p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{t(item.titleKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-charcoal text-white overflow-hidden relative">
        <div className="container px-6 relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 font-black uppercase tracking-widest text-[10px]">
                <Sparkles className="w-3 h-3" />
                {t("forCreators.valueBadge")}
              </div>
              <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                {t("forCreators.valueTitle1")} <span className="text-primary italic">{t("forCreators.valueTitle2")}</span>
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                {t("forCreators.valueCopy")}
              </p>
              <div className="space-y-4">
                {creatorFeaturesKeys.map((featureKey) => (
                  <div key={featureKey} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-white/80">{t(featureKey)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <div className="relative rounded-[3rem] border border-white/10 bg-white/5 p-8 md:p-12">
                <Badge className="bg-primary/15 text-primary border border-primary/20">{t("forCreators.attributionBadge")}</Badge>
                <h3 className="mt-6 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em]">{t("forCreators.attributionTitle")}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  {t("forCreators.attributionCopy")}
                </p>
                <Button variant="hero" size="lg" className="mt-8 w-full" asChild>
                  <Link to="/auth?role=creator">{t("forCreators.openStudio")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-24">
        <div className="container px-6">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                <BadgeDollarSign className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-[0.18em]">{t("forCreators.economicsBadge")}</span>
              </div>
              <h2 className="mt-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                {t("forCreators.economicsTitle")}
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {t("forCreators.economicsCopy")}
              </p>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-2">
                {creatorEconomicsKeys.map((itemKey) => (
                  <div key={itemKey} className="rounded-2xl border border-border/70 bg-background p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium leading-6 text-foreground">{t(itemKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background py-24">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="border-primary/20 bg-primary/10 text-primary">{t("forCreators.howBadge")}</Badge>
            <h2 className="mt-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
              {t("forCreators.howTitle")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {creatorHowSteps.map((item) => (
              <div key={item.titleKey} className="rounded-[2rem] border border-border bg-card p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{t(item.titleKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-secondary/20 py-24">
        <div className="container px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <Badge className="border-primary/20 bg-primary/10 text-primary">{t("forCreators.faqBadge")}</Badge>
              <h2 className="mt-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                {t("forCreators.faqTitle")}
              </h2>
            </div>
            <div className="mt-12 grid gap-6">
              {creatorFaqs.map((item) => (
                <div key={item.qKey} className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
                  <h3 className="text-lg font-bold text-foreground">{t(item.qKey)}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(item.aKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-24 text-white">
        <div className="container px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-bold">{t("forCreators.ctaBadge")}</span>
            </div>
            <h2 className="mt-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
              {t("forCreators.ctaTitle")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-zinc-300">
              {t("forCreators.ctaCopy")}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?role=creator">
                  {t("forCreators.startAsCreator")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to="/watch-unlock">{t("forCreators.browseMissions")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForCreators;
