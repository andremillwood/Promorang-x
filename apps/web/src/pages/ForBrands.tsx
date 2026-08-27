import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import { MissionRoleValue } from "@/components/marketing/MissionRoleValue";
import { LeadMagnetGateway } from "@/components/LeadMagnetGateway";
import {
    Building2,
    Handshake,
    BarChart3,
    Target,
    Users,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Zap,
    Check,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";
import { BrandCaseStudies } from "@/components/brands/BrandCaseStudies";

const ForBrands = () => {
    const { user } = useAuth();
    const { t } = useI18n();

    const sponsorshipBenefits: Array<{ icon: typeof Target; titleKey: TranslationKey; descKey: TranslationKey }> = [
        {
            icon: Target,
            titleKey: "forBrands.benefit1Title",
            descKey: "forBrands.benefit1Desc",
        },
        {
            icon: Handshake,
            titleKey: "forBrands.benefit2Title",
            descKey: "forBrands.benefit2Desc",
        },
        {
            icon: Users,
            titleKey: "forBrands.benefit3Title",
            descKey: "forBrands.benefit3Desc",
        },
        {
            icon: BarChart3,
            titleKey: "forBrands.benefit4Title",
            descKey: "forBrands.benefit4Desc",
        },
        {
            icon: ShieldCheck,
            titleKey: "forBrands.benefit5Title",
            descKey: "forBrands.benefit5Desc",
        },
    ];

    const stats: Array<{ valKey: TranslationKey; labelKey: TranslationKey }> = [
        { valKey: "forBrands.statMomentsVal", labelKey: "forBrands.statMoments" },
        { valKey: "forBrands.statMarksVal", labelKey: "forBrands.statMarksStat" },
        { valKey: "forBrands.statQrVal", labelKey: "forBrands.statQr" },
        { valKey: "forBrands.statUgcVal", labelKey: "forBrands.statUgc" },
    ];

    return (
        <div className="min-h-screen overflow-x-clip bg-background">
            <SEO
                title={t("forBrands.seoTitle")}
                description={t("forBrands.seoDescription")}
                type="website"
            />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-charcoal pb-16 pt-28 text-white md:pb-32 md:pt-40">
                <div className="absolute left-1/2 top-16 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
                <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
                <div className="container relative z-10 px-4 sm:px-6">
                    <div className="grid gap-10 lg:grid-cols-[1fr_0.78fr] lg:items-center">
                    <div className="min-w-0">
                        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary mb-8">
                            <Building2 className="w-4 h-4" />
                            <span className="min-w-0 text-sm font-medium">{t("forBrands.badge")}</span>
                        </div>

                        <h1 className="mb-6 max-w-4xl break-words text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] text-white sm:text-6xl md:text-7xl">
                            {t("forBrands.heroTitle1")} <br className="hidden sm:block" />
                            <span className="text-gradient-primary">{t("forBrands.heroTitle2")}</span>
                        </h1>

                        <p className="mb-10 max-w-2xl text-base leading-8 text-zinc-200 sm:text-lg md:text-xl">
                            {t("forBrands.heroCopy")}
                        </p>

                        <MarketingPromiseStrip
                            variant="dark"
                            className="mb-8 max-w-3xl"
                            items={[
                                { label: t("forBrands.promiseSituationLabel"), text: t("forBrands.promiseSituationText") },
                                { label: t("forBrands.promisePossibleLabel"), text: t("forBrands.promisePossibleText") },
                                { label: t("forBrands.promiseNextLabel"), text: t("forBrands.promiseNextText") },
                            ]}
                        />

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                <a href="#outcomes">
                                    {t("forBrands.exploreFlow")}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </a>
                            </Button>
                            <Button variant="outline" size="lg" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
                                {user ? (
                                    <Link to="/onboarding/brand">{t("forBrands.startAccount")}</Link>
                                ) : (
                                    <Link to="/auth">{t("forBrands.startPilot")}</Link>
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="relative mx-auto w-full max-w-md">
                        <div className="absolute -inset-5 rounded-[2rem] bg-primary/20 blur-[80px]" />
                        <div className="relative rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t("forBrands.signalBadge")}</p>
                                    <p className="mt-1 text-sm text-zinc-300">{t("forBrands.previewSubtitle")}</p>
                                </div>
                                <Badge className="border-primary/20 bg-primary/15 text-primary">{t("forBrands.liveBadge")}</Badge>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                                <h2 className="text-2xl font-black tracking-[-0.04em] text-white">{t("forBrands.coffeeTourTitle")}</h2>
                                <p className="mt-2 text-sm leading-6 text-zinc-300">{t("forBrands.coffeeTourDesc")}</p>
                                <div className="mt-6 grid grid-cols-3 gap-3">
                                    {[
                                        { valKey: "forBrands.statRedemptionsVal" as const, labelKey: "forBrands.statRedemptions" as const },
                                        { valKey: "forBrands.statMarksVal" as const, labelKey: "forBrands.statMarks" as const },
                                        { valKey: "forBrands.statReturnVal" as const, labelKey: "forBrands.statReturn" as const },
                                    ].map(({ valKey, labelKey }) => (
                                        <div key={labelKey} className="rounded-xl bg-white/10 p-3 text-center">
                                            <p className="text-xl font-black text-white">{t(valKey)}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{t(labelKey)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
            </section>

            <LeadMagnetGateway audience="brand" />

            <MissionRoleValue audience="brand" />
            <BrandCaseStudies />

            {/* Participation Measurement Section */}
            <section className="py-20 md:py-32">
                <div className="container px-4 sm:px-6">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-6">
                                <BarChart3 className="w-4 h-4" />
                                <span className="text-sm font-medium">{t("forBrands.measurementBadge")}</span>
                            </div>

                            <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground md:text-5xl">
                                {t("forBrands.measurementTitle1")} <br />
                                {t("forBrands.measurementTitle2")}
                            </h2>

                            <p className="text-lg text-muted-foreground mb-8">
                                {t("forBrands.measurementCopy")}
                            </p>

                            <div className="space-y-4 mb-8">
                                {sponsorshipBenefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <benefit.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">
                                                {t(benefit.titleKey)}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {t(benefit.descKey)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="hero" asChild>
                                <Link to="/strategies">{t("forBrands.exploreMomentsBtn")}</Link>
                            </Button>
                        </div>

                        {/* Scene Pulse Preview */}
                        <div className="relative">
                            <div className="bg-charcoal rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="text-xl font-black tracking-[-0.04em] text-white">{t("forBrands.scenePulseTitle")}</h4>
                                        <Badge className="bg-primary/20 text-primary border-primary/20 animate-pulse">{t("forBrands.pulseLive")}</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { titleKey: "forBrands.pulse1Title" as const, verified: "84%", status: "Active", energyKey: "forBrands.pulse1Energy" as const },
                                            { titleKey: "forBrands.pulse2Title" as const, verified: "92%", status: "Active", energyKey: "forBrands.pulse2Energy" as const },
                                        ].map((intel, i) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-white">{t(intel.titleKey)}</p>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{t("forBrands.pulseStatus", { status: intel.status })}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-primary">{t("forBrands.pulseVerified", { verified: intel.verified })}</p>
                                                    <p className="text-[9px] text-white/20 uppercase font-black">{t(intel.energyKey)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{t("forBrands.pulseFooter")}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-b border-border bg-muted/30">
                <div className="container px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-3xl font-black text-primary md:text-4xl">
                                    {t(stat.valKey)}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{t(stat.labelKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Moment Catalog Section */}
            <section id="outcomes" className="py-20 bg-background border-y border-border">
                <div className="container px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-foreground mb-6">
                            <span className="text-sm font-medium">{t("forBrands.catalogBadge")}</span>
                        </div>
                        <h2 className="mb-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-foreground md:text-5xl">
                            {t("forBrands.catalogTitle")}
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            {t("forBrands.catalogCopy")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {/* Scene Moment - Entry Level */}
                        <div className="bg-card rounded-xl p-8 border border-border hover:shadow-soft-xl transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 mb-4 text-xs font-bold">
                                {t("forBrands.cardStartHere")}
                            </div>
                            <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6 text-emerald-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t("forBrands.cardSceneTitle")}</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">{t("forBrands.cardSingleLocation")}</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                {t("forBrands.cardSceneDesc")}
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">{t("forBrands.cardPilotBudget")}</span>
                                    <span className="font-mono font-medium">$0 – $150</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">{t("forBrands.cardSupportRange")}</span>
                                    <span className="font-mono font-medium text-emerald-500">$0 – $30</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">{t("forBrands.cardVerification")}</span>
                                    <span className="font-mono font-medium text-emerald-500">{t("forBrands.cardGpsTime")}</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/auth">{t("forBrands.cardStartFree")}</Link>
                            </Button>
                        </div>

                        {/* Activation */}
                        <div className="bg-card rounded-xl p-8 border border-border hover:shadow-soft-xl transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
                            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t("forBrands.cardActivationTitle")}</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">{t("forBrands.cardSingleLocation")}</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                {t("forBrands.cardActivationDesc")}
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">{t("forBrands.cardPilotBudget")}</span>
                                    <span className="font-mono font-medium">$250 – $750</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">{t("forBrands.cardVerification")}</span>
                                    <span className="font-mono font-medium text-emerald-500">{t("forBrands.cardGpsTime")}</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/strategies">{t("forBrands.cardExplorePotential")}</Link>
                            </Button>
                        </div>

                        {/* Bounty */}
                        <div className="bg-card rounded-xl p-8 border border-primary/20 shadow-soft-xl relative overflow-hidden transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                {t("forBrands.cardScalable")}
                            </div>
                            <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 text-white">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t("forBrands.cardBountyTitle")}</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">{t("forBrands.cardDistributed")}</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                {t("forBrands.cardBountyDesc")}
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">{t("forBrands.cardPilotBudget")}</span>
                                    <span className="font-mono font-medium">$500 – $2.5k</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">{t("forBrands.cardVerification")}</span>
                                    <span className="font-mono font-medium text-emerald-500">{t("forBrands.cardProofOfWork")}</span>
                                </div>
                            </div>
                            <Button variant="hero" className="w-full" asChild>
                                <Link to="/strategies">{t("forBrands.cardDiscoverTargeted")}</Link>
                            </Button>
                        </div>

                        {/* Digital */}
                        <div className="bg-card rounded-xl p-8 border border-border hover:shadow-soft-xl transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
                            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t("forBrands.cardDigitalTitle")}</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">{t("forBrands.cardRemote")}</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                {t("forBrands.cardDigitalDesc")}
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">{t("forBrands.cardPilotBudget")}</span>
                                    <span className="font-mono font-medium">$150 – $500</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">{t("forBrands.cardVerification")}</span>
                                    <span className="font-mono font-medium text-emerald-500">{t("forBrands.cardDigitalProof")}</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/strategies">{t("forBrands.cardViewLogic")}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Participation Playbooks Section */}
            <section id="catalyst" className="py-24 bg-charcoal relative overflow-hidden border-y border-white/5">
                <div className="container px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest mb-6">
                            <Zap className="w-3 h-3" />
                            {t("forBrands.playbooksBadge")}
                        </div>
                        <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white md:text-5xl">
                            {t("forBrands.playbooksTitle1")} <span className="text-primary">{t("forBrands.playbooksTitle2")}</span>
                        </h2>
                        <p className="text-white/60 text-lg">
                            {t("forBrands.playbooksCopy")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                industryKey: "forBrands.playbook1Industry" as const,
                                descKey: "forBrands.playbook1Desc" as const,
                                ideaKey: "forBrands.playbook1Idea" as const,
                                ideaDescKey: "forBrands.playbook1IdeaDesc" as const,
                                icon: Zap,
                            },
                            {
                                industryKey: "forBrands.playbook2Industry" as const,
                                descKey: "forBrands.playbook2Desc" as const,
                                ideaKey: "forBrands.playbook2Idea" as const,
                                ideaDescKey: "forBrands.playbook2IdeaDesc" as const,
                                icon: Sparkles,
                            },
                            {
                                industryKey: "forBrands.playbook3Industry" as const,
                                descKey: "forBrands.playbook3Desc" as const,
                                ideaKey: "forBrands.playbook3Idea" as const,
                                ideaDescKey: "forBrands.playbook3IdeaDesc" as const,
                                icon: ShieldCheck,
                            },
                            {
                                industryKey: "forBrands.playbook4Industry" as const,
                                descKey: "forBrands.playbook4Desc" as const,
                                ideaKey: "forBrands.playbook4Idea" as const,
                                ideaDescKey: "forBrands.playbook4IdeaDesc" as const,
                                icon: Target,
                            }
                        ].map((category, i) => (
                            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                    <category.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{t(category.industryKey)}</h3>
                                <p className="text-xs text-white/40 mb-6">{t(category.descKey)}</p>
                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 italic">{t(category.ideaKey)}</p>
                                    <p className="text-xs text-white/60 leading-relaxed">{t(category.ideaDescKey)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sharing Power Section */}
            <section className="py-24 bg-background border-b border-border">
                <div className="container px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl" />
                            <div className="relative bg-card rounded-[3rem] border border-border p-12 overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <h4 className="font-bold text-lg">{t("forBrands.sceneReachTitle")}</h4>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{t("forBrands.socialReachBadge")}</Badge>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("forBrands.signalBadge")}</span>
                                            <span className="text-xs font-black text-primary">{t("forBrands.signalStrong")}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="w-[85%] h-full bg-primary" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-center text-muted-foreground italic">
                                        {t("forBrands.reachQuote")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6">
                                <Users className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t("forBrands.amplificationBadge")}</span>
                            </div>
                            <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                                {t("forBrands.reachPeopleTitle1")} <span className="text-primary italic">{t("forBrands.reachPeopleTitle2")}</span>
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t("forBrands.reachPeopleCopy")}
                            </p>
                            <div className="space-y-4">
                                {[
                                    { titleKey: "forBrands.amp1Title" as const, descKey: "forBrands.amp1Desc" as const },
                                    { titleKey: "forBrands.amp2Title" as const, descKey: "forBrands.amp2Desc" as const },
                                    { titleKey: "forBrands.amp3Title" as const, descKey: "forBrands.amp3Desc" as const },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-foreground text-sm">{t(item.titleKey)}</h4>
                                            <p className="text-xs text-muted-foreground">{t(item.descKey)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Participants Join Section */}
            <section className="py-24 bg-charcoal border-b border-white/5">
                <div className="container px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 mb-6">
                                <Target className="w-4 h-4" />
                                <span className="text-sm font-bold uppercase tracking-wider">{t("forBrands.whyBadge")}</span>
                            </div>
                            <h2 className="mb-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white md:text-5xl">
                                {t("forBrands.whyTitle")}
                            </h2>
                            <p className="text-white/60 text-lg">
                                {t("forBrands.whyCopy")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <h3 className="font-bold text-xl text-white">{t("forBrands.reason1Title")}</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">{t("forBrands.reason1Step1")}</span>
                                        <span className="font-bold text-amber-500">{t("forBrands.reason1Step1Badge")}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">{t("forBrands.reason1Step2")}</span>
                                        <span className="font-bold text-amber-500">{t("forBrands.reason1Step2Badge")}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                                        <span className="text-white/60">{t("forBrands.reason1Step3")}</span>
                                        <span className="font-bold text-amber-500">{t("forBrands.reason1Step3Badge")}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-white/40 mt-4">
                                    {t("forBrands.reason1Footer")}
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-xl text-white">{t("forBrands.reason2Title")}</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                        <span className="text-white/60">{t("forBrands.reason2Step1")}</span>
                                    </div>
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <span className="text-white/60">{t("forBrands.reason2Step2")}</span>
                                    </div>
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        <span className="text-white/60">{t("forBrands.reason2Step3")}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-white/40 mt-4">
                                    {t("forBrands.reason2Footer")}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-8 text-center">
                            <h3 className="mb-4 text-3xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white">
                                {t("forBrands.bannerTitle")}
                            </h3>
                            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
                                {t("forBrands.bannerCopy")}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-white">{t("forBrands.bannerCheck1")}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-white">{t("forBrands.bannerCheck2")}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span className="text-white">{t("forBrands.bannerCheck3")}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-charcoal text-cream">
                <div className="container px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                            {t("forBrands.ctaTitle")}
                        </h2>
                        <p className="text-cream/70 text-lg mb-8">
                            {t("forBrands.ctaCopy")}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                {user ? (
                                    <Link to="/onboarding/brand">
                                        {t("forBrands.startAccount")}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                ) : (
                                    <Link to="/auth">
                                        {t("forBrands.startPilot")}
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                )}
                            </Button>
                            <Button variant="outline" size="lg" className="border-cream/30 text-cream hover:bg-cream/10" asChild>
                                <Link to="/strategies">{t("forBrands.viewCatalog")}</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForBrands;
