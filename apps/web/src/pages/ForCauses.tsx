import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import PioneerCallout from "@/components/pioneer/PioneerCallout";
import { MissionRoleValue } from "@/components/marketing/MissionRoleValue";
import {
  Heart,
  HandHeart,
  Award,
  ArrowRight,
  CheckCircle2,
  Gift,
  ShieldCheck,
  Megaphone,
  Share2,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

export default function ForCauses() {
  const { t } = useI18n();

  const causeFeatures: Array<{ icon: typeof HandHeart; titleKey: TranslationKey; descKey: TranslationKey }> = [
    {
      icon: HandHeart,
      titleKey: "forCauses.feat1Title",
      descKey: "forCauses.feat1Desc",
    },
    {
      icon: ShieldCheck,
      titleKey: "forCauses.feat2Title",
      descKey: "forCauses.feat2Desc",
    },
    {
      icon: Gift,
      titleKey: "forCauses.feat3Title",
      descKey: "forCauses.feat3Desc",
    },
    {
      icon: Megaphone,
      titleKey: "forCauses.feat4Title",
      descKey: "forCauses.feat4Desc",
    },
    {
      icon: Award,
      titleKey: "forCauses.feat5Title",
      descKey: "forCauses.feat5Desc",
    },
    {
      icon: Share2,
      titleKey: "forCauses.feat6Title",
      descKey: "forCauses.feat6Desc",
    },
  ];

  const impactUseCases: Array<{ titleKey: TranslationKey; descKey: TranslationKey }> = [
    {
      titleKey: "forCauses.useCase1Title",
      descKey: "forCauses.useCase1Desc",
    },
    {
      titleKey: "forCauses.useCase2Title",
      descKey: "forCauses.useCase2Desc",
    },
    {
      titleKey: "forCauses.useCase3Title",
      descKey: "forCauses.useCase3Desc",
    },
    {
      titleKey: "forCauses.useCase4Title",
      descKey: "forCauses.useCase4Desc",
    },
  ];

  return (
    <>
      <SEO
        title={t("forCauses.seoTitle")}
        description={t("forCauses.seoDescription")}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden border-b border-border bg-gradient-to-b from-background via-rose-500/5 to-background">
          <div className="container px-4 sm:px-6 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Heart className="w-4 h-4 mr-2 inline fill-rose-500 text-rose-500" /> {t("forCauses.badge")}
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight text-foreground">
                {t("forCauses.heroTitle")}
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {t("forCauses.heroCopy")}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="xl" variant="hero" asChild>
                  <Link to="/contact">
                    {t("forCauses.launchCampaign")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link to="/how-it-works">
                    {t("forCauses.exploreImpact")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <MarketingPromiseStrip />

        {/* Features Grid */}
        <section className="py-20 md:py-28 bg-muted/10">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <Badge variant="secondary" className="px-3 py-1">{t("forCauses.toolkitBadge")}</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">
                {t("forCauses.toolkitTitle")}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t("forCauses.toolkitCopy")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {causeFeatures.map((feat) => (
                <Card key={feat.titleKey} className="border-border/60 hover:border-rose-500/40 transition-all shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-serif">{t(feat.titleKey)}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{t(feat.descKey)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 border-t border-border bg-background">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <Badge variant="secondary" className="px-3 py-1">{t("forCauses.scenariosBadge")}</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">
                {t("forCauses.scenariosTitle")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {impactUseCases.map((uc) => (
                <div key={uc.titleKey} className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{t(uc.titleKey)}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{t(uc.descKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Value Section */}
        <section className="py-20 border-t border-border bg-muted/20">
          <div className="container px-4 sm:px-6 mx-auto">
            <MissionRoleValue
              roleTitle={t("forCauses.roleTitle")}
              headline={t("forCauses.roleHeadline")}
              points={[
                t("forCauses.rolePoint1"),
                t("forCauses.rolePoint2"),
                t("forCauses.rolePoint3"),
                t("forCauses.rolePoint4"),
              ]}
              ctaText={t("forCauses.applyNonProfit")}
              ctaHref="/contact"
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-rose-500/5 border-t border-border text-center">
          <div className="container px-4 sm:px-6 mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">{t("forCauses.ctaTitle")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("forCauses.ctaCopy")}
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Button size="xl" variant="hero" asChild>
                <Link to="/contact">{t("forCauses.getStarted")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <PioneerCallout />
      </div>
    </>
  );
}
