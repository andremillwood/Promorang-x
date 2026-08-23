import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";
import { ArrowRight, Compass, Film, Gift, MapPin, Sparkles } from "lucide-react";
import { getSiteUrl } from "@/lib/discovery";
import { useI18n } from "@/i18n/I18nContext";

const Explore = () => {
  const { t } = useI18n();

  const exploreSections = [
    {
      title: t("explorePage.secMomentsTitle"),
      description: t("explorePage.secMomentsDesc"),
      href: "/explore/moments",
      icon: Compass,
      cta: t("explorePage.secMomentsCta"),
    },
    {
      title: t("explorePage.secPlacesTitle"),
      description: t("explorePage.secPlacesDesc"),
      href: "/explore/venues",
      icon: MapPin,
      cta: t("explorePage.secPlacesCta"),
    },
    {
      title: t("explorePage.secRewardsTitle"),
      description: t("explorePage.secRewardsDesc"),
      href: "/explore/rewards",
      icon: Gift,
      cta: t("explorePage.secRewardsCta"),
    },
    {
      title: t("explorePage.secContentTitle"),
      description: t("explorePage.secContentDesc"),
      href: "/explore/content",
      icon: Film,
      cta: t("explorePage.secContentCta"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("explorePage.seoTitle")}
        description={t("explorePage.seoDesc")}
        url={getSiteUrl("/explore")}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("explorePage.seoTitle"),
          description: t("explorePage.seoDesc"),
        }}
      />

      <section className="px-4 pb-12 pt-24 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_34%),linear-gradient(135deg,rgba(9,9,9,0.98),rgba(21,21,21,0.94))] p-6 shadow-2xl sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("explorePage.heroBadge")}
                </div>
                <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white sm:text-6xl">
                  {t("explorePage.heroTitle")}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("explorePage.heroSubtitle")}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link to="/for-you">{t("explorePage.openForYou")}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/explore/moments">{t("explorePage.startMoments")}</Link>
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  [t("explorePage.orientationLabel"), t("explorePage.orientationBody")],
                  [t("explorePage.firstValueLabel"), t("explorePage.firstValueBody")],
                  [t("explorePage.unlockLabel"), t("explorePage.unlockBody")],
                ].map(([label, body]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-white/68">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {exploreSections.map((section) => (
              <Card key={section.title} className="border-border/70 shadow-soft transition-transform hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-[-0.03em]">{section.title}</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="group -ml-3 px-3">
                    <Link to={section.href}>
                      {section.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr,0.7fr]">
            <GuidanceDisclosure
              id="explore:how-to-choose"
              eyebrow={t("explorePage.guideEyebrow")}
              title={t("explorePage.guideTitle")}
              summary={t("explorePage.guideSummary")}
              className="mt-0"
              tone="light"
            >
              <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="font-semibold text-foreground">{t("explorePage.guideForYouTitle")}</p>
                  <p className="mt-2">{t("explorePage.guideForYouDesc")}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="font-semibold text-foreground">{t("explorePage.guideExploreTitle")}</p>
                  <p className="mt-2">{t("explorePage.guideExploreDesc")}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <p className="font-semibold text-foreground">{t("explorePage.guideRewardsTitle")}</p>
                  <p className="mt-2">{t("explorePage.guideRewardsDesc")}</p>
                </div>
              </div>
            </GuidanceDisclosure>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl font-black tracking-[-0.03em]">{t("explorePage.alsoBrowseTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/brands">
                    {t("explorePage.browseBrands")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/hosts">
                    {t("explorePage.browseHosts")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/search">
                    {t("explorePage.browseSearch")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Explore;
