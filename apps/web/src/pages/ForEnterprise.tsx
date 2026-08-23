import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import PioneerCallout from "@/components/pioneer/PioneerCallout";
import { MissionRoleValue } from "@/components/marketing/MissionRoleValue";
import {
  Building2,
  ShieldCheck,
  BarChart3,
  Globe2,
  Lock,
  Layers,
  ArrowRight,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

export default function ForEnterprise() {
  const { t } = useI18n();

  const enterpriseFeatures: Array<{ icon: typeof Globe2; titleKey: TranslationKey; descKey: TranslationKey }> = [
    {
      icon: Globe2,
      titleKey: "forEnterprise.feat1Title",
      descKey: "forEnterprise.feat1Desc",
    },
    {
      icon: Lock,
      titleKey: "forEnterprise.feat2Title",
      descKey: "forEnterprise.feat2Desc",
    },
    {
      icon: Layers,
      titleKey: "forEnterprise.feat3Title",
      descKey: "forEnterprise.feat3Desc",
    },
    {
      icon: BarChart3,
      titleKey: "forEnterprise.feat4Title",
      descKey: "forEnterprise.feat4Desc",
    },
    {
      icon: ShieldCheck,
      titleKey: "forEnterprise.feat5Title",
      descKey: "forEnterprise.feat5Desc",
    },
    {
      icon: Headphones,
      titleKey: "forEnterprise.feat6Title",
      descKey: "forEnterprise.feat6Desc",
    },
  ];

  const useCases: Array<{ roleKey: TranslationKey; impactKey: TranslationKey }> = [
    {
      roleKey: "forEnterprise.case1Role",
      impactKey: "forEnterprise.case1Impact",
    },
    {
      roleKey: "forEnterprise.case2Role",
      impactKey: "forEnterprise.case2Impact",
    },
    {
      roleKey: "forEnterprise.case3Role",
      impactKey: "forEnterprise.case3Impact",
    },
    {
      roleKey: "forEnterprise.case4Role",
      impactKey: "forEnterprise.case4Impact",
    },
  ];

  return (
    <>
      <SEO
        title={t("forEnterprise.seoTitle")}
        description={t("forEnterprise.seoDescription")}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden border-b border-border bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="container px-4 sm:px-6 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5 text-primary">
                <Building2 className="w-4 h-4 mr-2 inline" /> {t("forEnterprise.badge")}
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight text-foreground">
                {t("forEnterprise.heroTitle")}
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {t("forEnterprise.heroCopy")}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="xl" variant="hero" asChild>
                  <Link to="/contact">
                    {t("forEnterprise.scheduleDemo")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link to="/pricing">
                    {t("forEnterprise.viewPricing")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <MarketingPromiseStrip />

        {/* Core Enterprise Capabilities */}
        <section className="py-20 md:py-28 bg-muted/10">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <Badge variant="secondary" className="px-3 py-1">{t("forEnterprise.capBadge")}</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">
                {t("forEnterprise.capTitle")}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t("forEnterprise.capCopy")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enterpriseFeatures.map((feat) => (
                <Card key={feat.titleKey} className="border-border/60 hover:border-primary/40 transition-all shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
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

        {/* Enterprise Use Cases */}
        <section className="py-20 border-t border-border bg-background">
          <div className="container px-4 sm:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
              <Badge variant="secondary" className="px-3 py-1">{t("forEnterprise.casesBadge")}</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif">
                {t("forEnterprise.casesTitle")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {useCases.map((uc) => (
                <div key={uc.roleKey} className="p-6 rounded-2xl bg-card border border-border flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">{t(uc.roleKey)}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{t(uc.impactKey)}</p>
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
              roleTitle={t("forEnterprise.roleTitle")}
              headline={t("forEnterprise.roleHeadline")}
              points={[
                t("forEnterprise.rolePoint1"),
                t("forEnterprise.rolePoint2"),
                t("forEnterprise.rolePoint3"),
                t("forEnterprise.rolePoint4"),
              ]}
              ctaText={t("forEnterprise.talkSpecialist")}
              ctaHref="/contact"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5 border-t border-border text-center">
          <div className="container px-4 sm:px-6 mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif">{t("forEnterprise.ctaTitle")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("forEnterprise.ctaCopy")}
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Button size="xl" variant="hero" asChild>
                <Link to="/contact">{t("forEnterprise.requestDemo")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <PioneerCallout />
      </div>
    </>
  );
}
