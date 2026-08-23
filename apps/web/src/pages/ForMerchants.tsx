import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarketingPromiseStrip from "@/components/MarketingPromiseStrip";
import PioneerCallout from "@/components/pioneer/PioneerCallout";
import { MissionRoleValue } from "@/components/marketing/MissionRoleValue";
import { LeadMagnetGateway } from "@/components/LeadMagnetGateway";
import {
    Store,
    Users,
    Gift,
    TrendingUp,
    ArrowRight,
    MapPin,
    Clock,
    ShieldCheck,
    Lock,
    Sparkles,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";

const ForMerchants = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const claimVenue = searchParams.get("claimVenue") || searchParams.get("venue");
    const { t } = useI18n();

    const merchantBenefits: Array<{ icon: typeof MapPin; titleKey: TranslationKey; descKey: TranslationKey }> = [
        {
            icon: MapPin,
            titleKey: "forMerchants.benefit1Title",
            descKey: "forMerchants.benefit1Desc",
        },
        {
            icon: Users,
            titleKey: "forMerchants.benefit2Title",
            descKey: "forMerchants.benefit2Desc",
        },
        {
            icon: ShieldCheck,
            titleKey: "forMerchants.benefit3Title",
            descKey: "forMerchants.benefit3Desc",
        },
        {
            icon: TrendingUp,
            titleKey: "forMerchants.benefit4Title",
            descKey: "forMerchants.benefit4Desc",
        },
    ];

    const stats: Array<{ valKey: TranslationKey; labelKey: TranslationKey }> = [
        { valKey: "forMerchants.statVisits", labelKey: "forMerchants.statVisitsLabel" },
        { valKey: "forMerchants.statOffers", labelKey: "forMerchants.statOffersLabel" },
        { valKey: "forMerchants.statProof", labelKey: "forMerchants.statProofLabel" },
        { valKey: "forMerchants.statCost", labelKey: "forMerchants.statCostLabel" },
    ];

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title={claimVenue ? t("forMerchants.seoTitleClaim", { venue: claimVenue }) : t("forMerchants.seoTitle")}
                description={t("forMerchants.seoDescription")}
                type="website"
            />

            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-white/5 bg-charcoal pb-16 pt-28 md:pb-32 md:pt-40">
                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full -top-24 -left-24" />
                <div className="container relative z-10 px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        {claimVenue ? (
                            <div className="mb-8 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-3">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t("forMerchants.unclaimedBadge")}</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                                    {t("forMerchants.claimQuestion")} <span className="text-amber-400">{claimVenue}</span>?
                                </h2>
                                <p className="text-sm text-white/70 max-w-xl mx-auto mb-5">
                                    {t("forMerchants.claimCopy")}
                                </p>
                                <Button variant="hero" size="lg" className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-black shadow-lg shadow-amber-500/20" asChild>
                                    <Link to={`/dashboard/venues/add?name=${encodeURIComponent(claimVenue)}`}>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        {t("forMerchants.claimButton", { venue: claimVenue })}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-8">
                                <Store className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{t("forMerchants.badge")}</span>
                            </div>
                        )}

                        <h1 className="mx-auto mb-6 max-w-[20rem] break-words text-5xl font-black uppercase leading-[0.88] tracking-[-0.065em] text-white sm:max-w-4xl sm:text-6xl md:text-7xl">
                            {t("forMerchants.heroTitle1")} <span className="text-primary">{t("forMerchants.heroTitle2")}</span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg md:text-xl">
                            {t("forMerchants.heroCopy")}
                        </p>

                        <MarketingPromiseStrip
                            variant="dark"
                            className="mx-auto mb-8 max-w-5xl text-left"
                            items={[
                                { label: t("forMerchants.promiseSituationLabel"), text: t("forMerchants.promiseSituationText") },
                                { label: t("forMerchants.promisePossibleLabel"), text: t("forMerchants.promisePossibleText") },
                                { label: t("forMerchants.promiseNextLabel"), text: t("forMerchants.promiseNextText") },
                            ]}
                        />

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                <Link to="/dashboard/venues/add">
                                    {t("forMerchants.registerSpot")}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button variant="outline" className="text-white border-white/20 hover:bg-white/5" size="lg" asChild>
                                <Link to="/explore/moments">{t("forMerchants.seeWhatsHappening")}</Link>
                            </Button>
                        </div>

                        <div className="mt-10 grid gap-3 text-left sm:grid-cols-3">
                            {[
                                { titleKey: "forMerchants.stripWelcomeTitle" as const, descKey: "forMerchants.stripWelcomeText" as const },
                                { titleKey: "forMerchants.stripValidateTitle" as const, descKey: "forMerchants.stripValidateText" as const },
                                { titleKey: "forMerchants.stripReturnTitle" as const, descKey: "forMerchants.stripReturnText" as const },
                            ].map(({ titleKey, descKey }) => (
                                <div key={titleKey} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">{t(titleKey)}</p>
                                    <p className="mt-2 text-sm leading-6 text-zinc-300">{t(descKey)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <LeadMagnetGateway audience="merchant" />

            <MissionRoleValue audience="merchant" />

            <PioneerCallout
                title={t("forMerchants.pioneerTitle")}
                copy={t("forMerchants.pioneerCopy")}
            />

            {/* The Verification Flow */}
            <section className="py-24 bg-background">
                <div className="container px-4 sm:px-6">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t("forMerchants.trustBadge")}</span>
                            </div>
                            <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-5xl">
                                {t("forMerchants.checkinTitle1")} <span className="text-emerald-600 italic">{t("forMerchants.checkinTitle2")}</span>
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t("forMerchants.checkinCopy")}
                            </p>
                            
                            <div className="grid gap-6">
                                {merchantBenefits.map((benefit) => (
                                    <div key={benefit.titleKey} className="flex gap-4 p-4 rounded-2xl hover:bg-muted transition-colors group">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 transition-colors group-hover:text-white flex-shrink-0">
                                            <benefit.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground mb-1">{t(benefit.titleKey)}</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{t(benefit.descKey)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/10 rounded-[3rem] blur-3xl" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-charcoal p-6 shadow-2xl sm:rounded-[3rem] sm:p-12">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                <Store className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold">{t("forMerchants.cardVenueCheckin")}</p>
                                                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{t("forMerchants.cardReadyToWelcome")}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-primary/20 text-primary border-primary/30">{t("forMerchants.cardSecurePin")}</Badge>
                                    </div>

                                    <div className="p-8 bg-black/40 rounded-2xl border border-white/5 text-center space-y-6">
                                        <p className="text-xs text-white/60 font-medium">{t("forMerchants.cardVerifyArrival")}</p>
                                        <div className="flex justify-center gap-2 sm:gap-3">
                                            {[1,2,3,4].map(i => (
                                                <div key={i} className="flex h-14 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-black text-white sm:h-16 sm:w-12 sm:text-2xl">
                                                    *
                                                </div>
                                            ))}
                                        </div>
                                        <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs py-6">
                                            {t("forMerchants.cardConfirmWelcome")}
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-white/40">
                                        <Lock className="w-3 h-3" />
                                        <span className="text-[9px] uppercase font-black tracking-widest">{t("forMerchants.cardSecureSimple")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Dashboard */}
            <section className="py-16 bg-muted/30 border-y border-border">
                <div className="container px-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-12">
                        {stats.map((stat) => (
                            <div key={stat.valKey} className="text-center group">
                                <p className="mb-2 text-4xl font-black text-foreground transition-colors group-hover:text-emerald-600">{t(stat.valKey)}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t(stat.labelKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-charcoal relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="container relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
                    <h2 className="mb-8 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-white md:text-5xl">
                        {t("forMerchants.heartTitle1")} <span className="text-primary italic">{t("forMerchants.heartTitle2")}</span>
                    </h2>
                    <p className="text-lg text-white/60 mb-10 leading-relaxed">
                        {t("forMerchants.heartCopy")}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button variant="hero" size="xl" asChild>
                            <Link to="/dashboard/venues/add">{t("forMerchants.registerSpotNow")}</Link>
                        </Button>
                        <Link to="/help" className="text-white/40 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest">
                            {t("forMerchants.howItWorksForSpots")}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForMerchants;
