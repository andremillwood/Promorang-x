import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nContext";
import { CommercialVertical } from "@promorang/shared";
import {
  ShoppingBag,
  Utensils,
  Ticket,
  Store,
  Dumbbell,
  Landmark,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Receipt,
  MapPin,
  QrCode,
  Link2,
  Sparkles,
  FileText
} from "lucide-react";

export default function SolutionsHub() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState<CommercialVertical>("fmcg_retail");

  // Diagnostic state
  const [diagStep1, setDiagStep1] = useState<string>("retail");
  const [diagStep2, setDiagStep2] = useState<string>("attribution");
  const [diagStep3, setDiagStep3] = useState<string>("sales");

  // Determine recommended vertical from diagnostic
  const getRecommendedVertical = (): CommercialVertical => {
    if (diagStep1 === "retail") return "fmcg_retail";
    if (diagStep1 === "hospitality") return "hospitality_dining";
    if (diagStep1 === "events") return "events_experiences";
    if (diagStep1 === "dtc") return "dtc_ecommerce";
    if (diagStep1 === "fitness") return "fitness_studios";
    return "fmcg_retail";
  };

  const recommended = getRecommendedVertical();

  const verticalCards: Array<{
    id: CommercialVertical;
    badgeKey: string;
    titleKey: string;
    subtitleKey: string;
    painKey: string;
    solutionKey: string;
    metricKey: string;
    icon: typeof ShoppingBag;
    proofIcon: typeof Receipt;
    proofKey: string;
    proposalPreset: string;
  }> = [
    {
      id: "fmcg_retail",
      badgeKey: "solutions.fmcgBadge",
      titleKey: "solutions.fmcgTitle",
      subtitleKey: "solutions.fmcgSubtitle",
      painKey: "solutions.fmcgPain",
      solutionKey: "solutions.fmcgSolution",
      metricKey: "solutions.fmcgMetric",
      icon: ShoppingBag,
      proofIcon: Receipt,
      proofKey: "solutions.proofTypeReceipt",
      proposalPreset: "fmcg",
    },
    {
      id: "hospitality_dining",
      badgeKey: "solutions.hospitalityBadge",
      titleKey: "solutions.hospitalityTitle",
      subtitleKey: "solutions.hospitalitySubtitle",
      painKey: "solutions.hospitalityPain",
      solutionKey: "solutions.hospitalitySolution",
      metricKey: "solutions.hospitalityMetric",
      icon: Utensils,
      proofIcon: MapPin,
      proofKey: "solutions.proofTypeCheckIn",
      proposalPreset: "hospitality",
    },
    {
      id: "events_experiences",
      badgeKey: "solutions.eventsBadge",
      titleKey: "solutions.eventsTitle",
      subtitleKey: "solutions.eventsSubtitle",
      painKey: "solutions.eventsPain",
      solutionKey: "solutions.eventsSolution",
      metricKey: "solutions.eventsMetric",
      icon: Ticket,
      proofIcon: QrCode,
      proofKey: "solutions.proofTypeQr",
      proposalPreset: "events",
    },
    {
      id: "dtc_ecommerce",
      badgeKey: "solutions.dtcBadge",
      titleKey: "solutions.dtcTitle",
      subtitleKey: "solutions.dtcSubtitle",
      painKey: "solutions.dtcPain",
      solutionKey: "solutions.dtcSolution",
      metricKey: "solutions.dtcMetric",
      icon: Store,
      proofIcon: Link2,
      proofKey: "solutions.proofTypeLink",
      proposalPreset: "dtc",
    },
    {
      id: "fitness_studios",
      badgeKey: "solutions.fitnessBadge",
      titleKey: "solutions.fitnessTitle",
      subtitleKey: "solutions.fitnessSubtitle",
      painKey: "solutions.fitnessPain",
      solutionKey: "solutions.fitnessSolution",
      metricKey: "solutions.fitnessMetric",
      icon: Dumbbell,
      proofIcon: MapPin,
      proofKey: "solutions.proofTypeCheckIn",
      proposalPreset: "fitness",
    },
    {
      id: "city_hubs",
      badgeKey: "solutions.cityHubsBadge",
      titleKey: "solutions.cityHubsTitle",
      subtitleKey: "solutions.cityHubsSubtitle",
      painKey: "solutions.cityHubsPain",
      solutionKey: "solutions.cityHubsSolution",
      metricKey: "solutions.cityHubsMetric",
      icon: Landmark,
      proofIcon: QrCode,
      proofKey: "solutions.proofTypeQr",
      proposalPreset: "city",
    },
  ];

  const activeVerticalData = verticalCards.find((v) => v.id === selectedTab) || verticalCards[0];
  const recommendedData = verticalCards.find((v) => v.id === recommended) || verticalCards[0];

  const handleLaunchProposal = (preset: string) => {
    navigate(`/propose/new?vertical=${preset}`);
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white font-sans pb-32">
      <SEO
        title={t("solutions.seoTitle")}
        description={t("solutions.seoDescription")}
      />

      {/* HERO SECTION */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border/40 bg-gradient-to-b from-secondary/30 via-background to-background">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="px-4 py-1.5 border-primary/40 bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline-block" />
            {t("solutions.badge")}
          </Badge>

          <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            {t("solutions.title")}
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("solutions.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => {
              const element = document.getElementById("diagnostic");
              element?.scrollIntoView({ behavior: "smooth" });
            }}>
              <Zap className="w-4 h-4 mr-2" />
              {t("solutions.diagnosticTitle")}
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/proposals/arla-pro">
                <FileText className="w-4 h-4 mr-2" />
                View Arla Pro Live Pilot
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* INTERACTIVE 3-STEP DIAGNOSTIC */}
      <section id="diagnostic" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <Badge className="bg-secondary text-foreground font-mono text-xs uppercase">Interactive Routing Tool</Badge>
          <h2 className="text-3xl font-serif font-bold">{t("solutions.diagnosticTitle")}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t("solutions.diagnosticSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Diagnostic Selector Panel */}
          <Card className="lg:col-span-7 bg-card/60 backdrop-blur border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Commercial Needs Assessment</CardTitle>
              <CardDescription>Select your current operational setup to find the exact campaign match.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question 1 */}
              <div className="space-y-2.5">
                <label className="text-xs font-mono font-bold uppercase text-primary tracking-wide">
                  {t("solutions.step1Label")}
                </label>
                <p className="text-sm font-semibold text-foreground">{t("solutions.diagnosticQ1")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "retail", labelKey: "solutions.diagnosticQ1Opt1", icon: ShoppingBag },
                    { id: "hospitality", labelKey: "solutions.diagnosticQ1Opt2", icon: Utensils },
                    { id: "events", labelKey: "solutions.diagnosticQ1Opt3", icon: Ticket },
                    { id: "dtc", labelKey: "solutions.diagnosticQ1Opt4", icon: Store },
                    { id: "fitness", labelKey: "solutions.diagnosticQ1Opt5", icon: Dumbbell },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = diagStep1 === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDiagStep1(opt.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary"
                            : "border-border/60 hover:border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{t(opt.labelKey as any)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <label className="text-xs font-mono font-bold uppercase text-primary tracking-wide">
                  {t("solutions.step2Label")}
                </label>
                <p className="text-sm font-semibold text-foreground">{t("solutions.diagnosticQ2")}</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "attribution", labelKey: "solutions.diagnosticQ2Opt1" },
                    { id: "offpeak", labelKey: "solutions.diagnosticQ2Opt2" },
                    { id: "influencer_roi", labelKey: "solutions.diagnosticQ2Opt3" },
                    { id: "retention", labelKey: "solutions.diagnosticQ2Opt4" },
                  ].map((opt) => {
                    const isSelected = diagStep2 === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDiagStep2(opt.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary"
                            : "border-border/60 hover:border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground/40"}`} />
                        <span>{t(opt.labelKey as any)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <label className="text-xs font-mono font-bold uppercase text-primary tracking-wide">
                  {t("solutions.step3Label")}
                </label>
                <p className="text-sm font-semibold text-foreground">{t("solutions.diagnosticQ3")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: "sales", labelKey: "solutions.diagnosticQ3Opt1" },
                    { id: "traffic", labelKey: "solutions.diagnosticQ3Opt2" },
                    { id: "tickets", labelKey: "solutions.diagnosticQ3Opt3" },
                    { id: "habits", labelKey: "solutions.diagnosticQ3Opt4" },
                  ].map((opt) => {
                    const isSelected = diagStep3 === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDiagStep3(opt.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary"
                            : "border-border/60 hover:border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-primary" : "bg-muted-foreground/30"}`} />
                        <span>{t(opt.labelKey as any)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostic Result Card */}
          <div className="lg:col-span-5 sticky top-24">
            <Card className="bg-gradient-to-b from-card via-card to-secondary/30 border-2 border-primary/40 shadow-xl overflow-hidden">
              <div className="bg-primary px-4 py-2 text-primary-foreground font-mono text-xs font-black uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {t("solutions.recommendedBlueprint")}
                </span>
                <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded">100% Outcome Based</span>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <recommendedData.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <Badge variant="outline" className="text-[10px] font-mono mb-1">{t(recommendedData.badgeKey as any)}</Badge>
                    <CardTitle className="text-xl font-serif font-bold">{t(recommendedData.titleKey as any)}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-xs pt-2 leading-relaxed">
                  {t(recommendedData.subtitleKey as any)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {/* Painkiller Fix */}
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-destructive font-bold font-mono text-[11px] uppercase">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Problem Eliminated
                  </div>
                  <p className="text-muted-foreground">{t(recommendedData.painKey as any)}</p>
                </div>

                {/* Solution */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold font-mono text-[11px] uppercase">
                    <Zap className="w-3.5 h-3.5" />
                    Promorang Mechanism
                  </div>
                  <p className="text-foreground">{t(recommendedData.solutionKey as any)}</p>
                </div>

                {/* Proof & Metric */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-secondary/60 p-2.5 rounded-lg border border-border/60">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">Proof Layer</div>
                    <div className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <recommendedData.proofIcon className="w-3.5 h-3.5 text-primary" />
                      {t(recommendedData.proofKey as any)}
                    </div>
                  </div>
                  <div className="bg-secondary/60 p-2.5 rounded-lg border border-border/60">
                    <div className="text-[10px] font-mono uppercase text-muted-foreground">Primary KPI</div>
                    <div className="font-semibold text-primary mt-0.5">{t(recommendedData.metricKey as any)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 space-y-2">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
                    onClick={() => handleLaunchProposal(recommendedData.proposalPreset)}
                  >
                    {t("solutions.ctaProposal")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="w-full text-xs font-semibold" asChild>
                    <Link to="/contact">
                      {t("solutions.ctaTalk")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* VERTICAL DEEP DIVE TABS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-border/40">
        <div className="text-center mb-10 space-y-2">
          <Badge variant="secondary" className="font-mono text-xs uppercase">{t("solutions.verticalAll")}</Badge>
          <h2 className="text-3xl font-serif font-bold">Explore All Commercial Blueprints</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Compare mechanisms, closed-loop proof systems, and verified attribution models.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {verticalCards.map((v) => {
            const Icon = v.icon;
            const isCurrent = selectedTab === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedTab(v.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-border/60 hover:border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(v.titleKey as any).split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Vertical Showcase */}
        <Card className="border-2 border-border/80 bg-card/80 backdrop-blur overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-8 p-6 sm:p-8 space-y-6 border-b md:border-b-0 md:border-r border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <activeVerticalData.icon className="w-8 h-8" />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs font-mono mb-1">{t(activeVerticalData.badgeKey as any)}</Badge>
                  <h3 className="text-2xl font-serif font-bold">{t(activeVerticalData.titleKey as any)}</h3>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {t(activeVerticalData.subtitleKey as any)}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-destructive font-bold text-xs uppercase font-mono">
                    <AlertTriangle className="w-4 h-4" />
                    The Commercial Bleeding Point
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(activeVerticalData.painKey as any)}</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase font-mono">
                    <Zap className="w-4 h-4" />
                    The Closed-Loop Cure
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{t(activeVerticalData.solutionKey as any)}</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 p-6 sm:p-8 bg-secondary/30 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Verification Method</div>
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <activeVerticalData.proofIcon className="w-4 h-4 text-primary" />
                    {t(activeVerticalData.proofKey as any)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">North Star Metric</div>
                  <div className="flex items-center gap-2 font-bold text-sm text-primary">
                    <TrendingUp className="w-4 h-4" />
                    {t(activeVerticalData.metricKey as any)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Payout Structure</div>
                  <div className="text-xs text-muted-foreground">
                    100% Performance-gated. Zero upfront media waste.
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/40">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  onClick={() => handleLaunchProposal(activeVerticalData.proposalPreset)}
                >
                  {t("solutions.ctaProposal")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {activeVerticalData.id === "fmcg_retail" && (
                  <Button variant="outline" className="w-full text-xs font-semibold" asChild>
                    <Link to="/proposals/arla-pro">
                      Read Arla Pro Pilot Case
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
