import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import PioneerCallout from "@/components/pioneer/PioneerCallout";
import { LeadMagnetGateway } from "@/components/LeadMagnetGateway";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Gift,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

const ForCommunities = () => {
  const { t } = useI18n();

  const sceneLoop: Array<{ icon: typeof Users; titleKey: TranslationKey; descKey: TranslationKey }> = [
    {
      icon: Users,
      titleKey: "forCommunities.step1Title",
      descKey: "forCommunities.step1Desc",
    },
    {
      icon: Sparkles,
      titleKey: "forCommunities.step2Title",
      descKey: "forCommunities.step2Desc",
    },
    {
      icon: TrendingUp,
      titleKey: "forCommunities.step3Title",
      descKey: "forCommunities.step3Desc",
    },
    {
      icon: Gift,
      titleKey: "forCommunities.step4Title",
      descKey: "forCommunities.step4Desc",
    },
  ];

  const levels: Array<{ nameKey: TranslationKey; icon: typeof Sparkles; descKey: TranslationKey }> = [
    {
      nameKey: "forCommunities.levelSeeker",
      icon: Sparkles,
      descKey: "forCommunities.levelSeekerDesc",
    },
    {
      nameKey: "forCommunities.levelHerald",
      icon: Flame,
      descKey: "forCommunities.levelHeraldDesc",
    },
    {
      nameKey: "forCommunities.levelLuminary",
      icon: TrendingUp,
      descKey: "forCommunities.levelLuminaryDesc",
    },
    {
      nameKey: "forCommunities.levelEminence",
      icon: ShieldCheck,
      descKey: "forCommunities.levelEminenceDesc",
    },
  ];

  const networkPoints: TranslationKey[] = [
    "forCommunities.networkPoint1",
    "forCommunities.networkPoint2",
    "forCommunities.networkPoint3",
  ];

  const sceneValue: TranslationKey[] = [
    "forCommunities.compoundsPoint1",
    "forCommunities.compoundsPoint2",
    "forCommunities.compoundsPoint3",
    "forCommunities.compoundsPoint4",
  ];

  return (
    <div className="marketing-refined min-h-screen bg-background">
      <SEO
        title={t("forCommunities.seoTitle")}
        description={t("forCommunities.seoDescription")}
        type="website"
      />

      <section className="relative overflow-hidden border-b border-white/5 bg-charcoal pb-20 pt-24 text-white sm:pt-28 md:pb-32 md:pt-40">
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-[120px] -top-12 -right-12" />
        <div className="container relative z-10 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              <Users className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t("forCommunities.badge")}</span>
            </div>

            <h1 className="mx-auto mb-6 max-w-[20rem] break-words text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] sm:max-w-4xl sm:text-6xl md:text-7xl">
              {t("forCommunities.heroTitle1")} <span className="text-primary italic">{t("forCommunities.heroTitle2")}</span>
            </h1>

            <p className="mx-auto mb-8 max-w-[22rem] text-base leading-relaxed text-white/60 sm:max-w-2xl sm:text-lg md:text-xl">
              {t("forCommunities.heroCopy")}
            </p>

            <MarketingPromiseStrip
              variant="dark"
              className="mx-auto mb-8 max-w-5xl text-left"
              items={[
                { label: t("forCommunities.promiseSituationLabel"), text: t("forCommunities.promiseSituationText") },
                { label: t("forCommunities.promisePossibleLabel"), text: t("forCommunities.promisePossibleText") },
                { label: t("forCommunities.promiseNextLabel"), text: t("forCommunities.promiseNextText") },
              ]}
            />

            <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/propose">
                  {t("forCommunities.createFirstMoment")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/5" size="lg" asChild>
                <Link to="/explore/moments">{t("forCommunities.seeSceneMoments")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LeadMagnetGateway audience="host" />

      <PioneerCallout
        title={t("forCommunities.pioneerTitle")}
        copy={t("forCommunities.pioneerCopy")}
      />

      <section className="border-b border-border bg-background py-20 md:py-24">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="mb-4" variant="outline">
              <Zap className="mr-1 h-3 w-3" />
              {t("forCommunities.loopBadge")}
            </Badge>
            <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
              {t("forCommunities.loopTitle")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {t("forCommunities.loopCopy")}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {sceneLoop.map((step) => (
              <Card key={step.titleKey} className="border-border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{t(step.titleKey)}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(step.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-white md:py-28">
        <div className="container px-6">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary" variant="outline">
                <TrendingUp className="mr-1 h-3 w-3" />
                {t("forCommunities.levelsBadge")}
              </Badge>
              <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                {t("forCommunities.levelsTitle")}
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-300">
                {t("forCommunities.levelsCopy")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {levels.map((level) => (
                <div key={level.nameKey} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-primary">
                    <level.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{t(level.nameKey)}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">{t(level.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-28">
        <div className="container px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <Badge className="mb-4" variant="outline">
                <Users className="mr-1 h-3 w-3" />
                {t("forCommunities.networkBadge")}
              </Badge>
              <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                {t("forCommunities.networkTitle")}
              </h2>
              <div className="mt-6 space-y-3">
                {networkPoints.map((itemKey) => (
                  <div key={itemKey} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                    <span className="text-sm leading-7 text-muted-foreground">{t(itemKey)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t("forCommunities.compoundsTitle")}</p>
              <div className="mt-6 space-y-4">
                {sceneValue.map((itemKey) => (
                  <div key={itemKey} className="rounded-2xl border border-border/70 bg-background p-4">
                    <p className="text-sm font-medium leading-6 text-foreground">{t(itemKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-20 md:py-24">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
            {t("forCommunities.ctaTitle")}
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {t("forCommunities.ctaCopy")}
          </p>
          <Button variant="hero" size="xl" className="mt-10" asChild>
            <Link to="/propose">
              {t("forCommunities.createFirstMoment")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ForCommunities;
