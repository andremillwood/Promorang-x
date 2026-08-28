import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { LeadMagnetGateway } from "@/components/LeadMagnetGateway";
import {
    Briefcase,
    TrendingUp,
    ShieldCheck,
    FileText,
    Settings,
    ArrowRight,
    Search,
    BarChart
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";
import { TranslationKey } from "@/i18n/translations";
import { PromoCardEconomyExplainer } from "@/components/promocard";

const ForAgencies = () => {
    const { t } = useI18n();

    const features: Array<{ icon: typeof Briefcase; titleKey: TranslationKey; descKey: TranslationKey }> = [
        {
            icon: Briefcase,
            titleKey: "forAgencies.feat1Title",
            descKey: "forAgencies.feat1Desc",
        },
        {
            icon: TrendingUp,
            titleKey: "forAgencies.feat2Title",
            descKey: "forAgencies.feat2Desc",
        },
        {
            icon: FileText,
            titleKey: "forAgencies.feat3Title",
            descKey: "forAgencies.feat3Desc",
        },
        {
            icon: ShieldCheck,
            titleKey: "forAgencies.feat4Title",
            descKey: "forAgencies.feat4Desc",
        },
        {
            icon: Settings,
            titleKey: "forAgencies.feat5Title",
            descKey: "forAgencies.feat5Desc",
        },
        {
            icon: Search,
            titleKey: "forAgencies.feat6Title",
            descKey: "forAgencies.feat6Desc",
        }
    ];

    return (
        <>
            <SEO
                title={t("forAgencies.seoTitle")}
                description={t("forAgencies.seoDescription")}
            />
            <div className="marketing-refined min-h-screen bg-background">
            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-brand">
                <div className="container px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white mb-8 animate-fade-in shadow-sm backdrop-blur-sm">
                            <BarChart className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wide">{t("forAgencies.badge")}</span>
                        </div>

                        <h1 className="font-serif text-4xl md:text-6xl font-black text-white mb-6 animate-slide-up leading-tight">
                            {t("forAgencies.heroTitle1")} <br className="hidden md:block"/>
                            <span className="text-primary-foreground/90">{t("forAgencies.heroTitle2")}</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            {t("forAgencies.heroCopy")}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <Button variant="secondary" size="xl" className="font-bold shadow-xl" asChild>
                                <Link to="/auth?role=brand">
                                    {t("forAgencies.startManaging")}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <PromoCardEconomyExplainer audience="agency" />

            <LeadMagnetGateway audience="brand" />

            {/* Features Section */}
            <section className="py-20 md:py-32">
                <div className="container px-6">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                            {t("forAgencies.featuresHeading")}
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            {t("forAgencies.featuresCopy")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <div
                                key={feature.titleKey}
                                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-foreground text-lg mb-2">
                                    {t(feature.titleKey)}
                                </h3>
                                <p className="text-muted-foreground">{t(feature.descKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-charcoal text-cream relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/10"></div>
                <div className="container px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/5 border border-white/10 mb-6">
                            <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-white">
                            {t("forAgencies.ctaTitle")}
                        </h2>
                        <p className="text-white/70 text-lg mb-8">
                            {t("forAgencies.ctaCopy")}
                        </p>
                        <Button variant="hero" size="xl" asChild>
                            <Link to="/auth?role=brand">
                                {t("forAgencies.openAccount")}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
        </>
    );
};

export default ForAgencies;
