import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Gift,
  Handshake,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

const Hosting = () => {
  const { t } = useI18n();

  const hostLoop = [
    {
      icon: Calendar,
      title: t("hostingPage.loop1Title"),
      description: t("hostingPage.loop1Desc"),
    },
    {
      icon: MapPin,
      title: t("hostingPage.loop2Title"),
      description: t("hostingPage.loop2Desc"),
    },
    {
      icon: BarChart3,
      title: t("hostingPage.loop3Title"),
      description: t("hostingPage.loop3Desc"),
    },
    {
      icon: Gift,
      title: t("hostingPage.loop4Title"),
      description: t("hostingPage.loop4Desc"),
    },
  ];

  const hostBenefits = [
    {
      icon: ShieldCheck,
      title: t("hostingPage.benefit1Title"),
      description: t("hostingPage.benefit1Desc"),
    },
    {
      icon: Users,
      title: t("hostingPage.benefit2Title"),
      description: t("hostingPage.benefit2Desc"),
    },
    {
      icon: Sparkles,
      title: t("hostingPage.benefit3Title"),
      description: t("hostingPage.benefit3Desc"),
    },
    {
      icon: Handshake,
      title: t("hostingPage.benefit4Title"),
      description: t("hostingPage.benefit4Desc"),
    },
  ];

  const unlocks = [
    t("hostingPage.unlock1"),
    t("hostingPage.unlock2"),
    t("hostingPage.unlock3"),
    t("hostingPage.unlock4"),
  ];

  const metrics = [
    { value: "3+", label: t("hostingPage.metric1Label") },
    { value: "50+", label: t("hostingPage.metric2Label") },
    { value: "1", label: t("hostingPage.metric3Label") },
  ];

  const tools = [
    {
      icon: Calendar,
      title: t("hostingPage.tool1Title"),
      description: t("hostingPage.tool1Desc"),
    },
    {
      icon: QrCode,
      title: t("hostingPage.tool2Title"),
      description: t("hostingPage.tool2Desc"),
    },
    {
      icon: TrendingUp,
      title: t("hostingPage.tool3Title"),
      description: t("hostingPage.tool3Desc"),
    },
    {
      icon: BarChart3,
      title: t("hostingPage.tool4Title"),
      description: t("hostingPage.tool4Desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("hostingPage.seoTitle")}
        description={t("hostingPage.seoDesc")}
        type="website"
      />

      <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-24 md:pb-28 md:pt-36">
        <div className="absolute left-8 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-8 right-8 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="container relative z-10 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-primary/20 bg-primary/10 text-primary" variant="outline">
              <Sparkles className="mr-1 h-3 w-3" />
              {t("hostingPage.heroBadge")}
            </Badge>
            <h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              {t("hostingPage.heroTitle1")}
              <span className="text-gradient-primary">{t("hostingPage.heroTitle2")}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
              {t("hostingPage.heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?role=host">
                  {t("hostingPage.startHosting")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/for-brands">{t("hostingPage.seeSponsorLogic")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-background py-20 md:py-24">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="mb-4" variant="outline">
              <Zap className="mr-1 h-3 w-3" />
              {t("hostingPage.loopBadge")}
            </Badge>
            <h2 className="font-serif text-3xl font-bold md:text-5xl">
              {t("hostingPage.loopTitle")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {t("hostingPage.loopDesc")}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {hostLoop.map((step) => (
              <Card key={step.title} className="border-border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-white md:py-28">
        <div className="container px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <Badge className="mb-4 border-primary/20 bg-primary/10 text-primary" variant="outline">
                <TrendingUp className="mr-1 h-3 w-3" />
                {t("hostingPage.mattersBadge")}
              </Badge>
              <h2 className="font-serif text-3xl font-bold md:text-5xl">
                {t("hostingPage.mattersTitle")}
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-300">
                {t("hostingPage.mattersDesc")}
              </p>
              <div className="mt-8 grid gap-3">
                {unlocks.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm text-zinc-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t("hostingPage.thresholdsLabel")}</p>
              <div className="mt-6 grid gap-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
                    <p className="font-serif text-4xl font-bold text-white">{metric.value}</p>
                    <p className="mt-2 text-sm text-zinc-300">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 md:py-28">
        <div className="container px-6">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge className="mb-4" variant="outline">
              <BarChart3 className="mr-1 h-3 w-3" />
              {t("hostingPage.toolsBadge")}
            </Badge>
            <h2 className="font-serif text-3xl font-bold md:text-5xl">
              {t("hostingPage.toolsTitle")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {t("hostingPage.toolsDesc")}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {tools.map((tool) => (
              <Card key={tool.title} className="border-border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{tool.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{tool.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30 py-20 md:py-24">
        <div className="container px-6">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <Badge className="mb-4" variant="outline">
                <Gift className="mr-1 h-3 w-3" />
                {t("hostingPage.fundedBadge")}
              </Badge>
              <h2 className="font-serif text-3xl font-bold md:text-5xl">
                {t("hostingPage.fundedTitle")}
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                {t("hostingPage.fundedDesc")}
              </p>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-6 md:p-8">
              <div className="space-y-4">
                {hostBenefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4 rounded-2xl border border-border/70 bg-background p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal py-20 text-white md:py-28">
        <div className="container px-6 text-center">
          <h2 className="font-serif text-3xl font-bold md:text-5xl">
            {t("hostingPage.ctaTitle1")}
            <span className="text-gradient-primary">{t("hostingPage.ctaTitle2")}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            {t("hostingPage.ctaDesc")}
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth?role=host">
                {t("hostingPage.startHosting")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 hover:text-white" asChild>
              <Link to="/pricing">{t("hostingPage.seePricing")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hosting;
