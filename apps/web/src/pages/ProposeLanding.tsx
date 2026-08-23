import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Lightbulb,
    ArrowRight,
    Sparkles,
    Users,
    DollarSign,
    CheckCircle,
    Rocket
} from "lucide-react";
import { useI18n } from "@/i18n/I18nContext";

export default function ProposeLanding() {
    const { t } = useI18n();

    const steps = [
        {
            icon: Lightbulb,
            title: t("proposeLandingPage.step1Title"),
            desc: t("proposeLandingPage.step1Desc"),
            color: "text-amber-500"
        },
        {
            icon: CheckCircle,
            title: t("proposeLandingPage.step2Title"),
            desc: t("proposeLandingPage.step2Desc"),
            color: "text-emerald-500"
        },
        {
            icon: DollarSign,
            title: t("proposeLandingPage.step3Title"),
            desc: t("proposeLandingPage.step3Desc"),
            color: "text-blue-500"
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
                    <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl opacity-50 mix-blend-multiply" />
                </div>

                <div className="container px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border/50 text-foreground mb-8 animate-fade-in">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest">{t("proposeLandingPage.badge")}</span>
                    </div>

                    <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight max-w-4xl mx-auto">
                        {t("proposeLandingPage.heroTitle1")} <br />
                        <span className="text-gradient-primary">{t("proposeLandingPage.heroTitle2")}</span>
                    </h1>

                    <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed">
                        {t("proposeLandingPage.heroSubtitle")}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="xl" variant="hero" asChild className="group">
                            <Link to="/propose/new">
                                {t("proposeLandingPage.startProposal")}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button size="xl" variant="outline" asChild>
                            <Link to="/explore/moments">{t("proposeLandingPage.seeExamples")}</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 border-y border-border/40 bg-secondary/20">
                <div className="container px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        {steps.map((step, i) => (
                            <div key={i} className="text-center relative">
                                {i !== 2 && (
                                    <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-border -z-10" />
                                )}
                                <div className={`w-20 h-20 mx-auto rounded-3xl bg-background border border-border shadow-soft flex items-center justify-center mb-6`}>
                                    <step.icon className={`w-8 h-8 ${step.color}`} />
                                </div>
                                <h3 className="font-serif text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Guarantee (Risk Reversal) */}
            <section className="py-32">
                <div className="container px-6">
                    <div className="bg-card rounded-[3rem] p-12 md:p-20 border border-border/50 shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -ml-20 -mb-20" />

                        <Rocket className="w-12 h-12 text-primary mx-auto mb-6" />

                        <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6">
                            {t("proposeLandingPage.guaranteeTitle")}
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            {t("proposeLandingPage.guaranteeDesc")}
                        </p>

                        <Button size="xl" variant="default" className="rounded-full px-12" asChild>
                            <Link to="/propose/new">{t("proposeLandingPage.draftProposal")}</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

