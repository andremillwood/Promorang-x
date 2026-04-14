import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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

const features = [
    {
        icon: Briefcase,
        title: "God Mode Administration",
        description: "Manage multiple venue and brand clients from a single dashboard. Spin up campaigns in 30 seconds."
    },
    {
        icon: TrendingUp,
        title: "Undeniable ROI",
        description: "Stop selling 'exposure'. Sell guaranteed foot traffic and verified customer data to your local clients."
    },
    {
        icon: FileText,
        title: "Automated Recap Reports",
        description: "On Monday morning, hit 'Generate' to download a pristine PDF ROI report to hand to your client."
    },
    {
        icon: ShieldCheck,
        title: "Proof of Work",
        description: "Differentiate your marketing agency. Show your clients exactly how many people you drove through their door."
    },
    {
        icon: Settings,
        title: "No-Code Campaign Engine",
        description: "Launch referral, purchase, and visit objectives without writing a single line of code or integrating POS APIs."
    },
    {
        icon: Search,
        title: "Discover Local Sponsors",
        description: "Use our matchmaking tool to pair your venue clients with aligned brand sponsors automatically."
    }
];

const ForAgencies = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-brand">
                <div className="container px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white mb-8 animate-fade-in shadow-sm backdrop-blur-sm">
                            <BarChart className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wide">For Freelancers & Agencies</span>
                        </div>

                        <h1 className="font-serif text-4xl md:text-6xl font-black text-white mb-6 animate-slide-up leading-tight">
                            The Ultimate <br className="hidden md:block"/>
                            <span className="text-primary-foreground/90">Proof of Work Toolbar.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            Stop promising your clients "good vibes and exposure." Use Promorang to guarantee foot traffic, orchestrate reward campaigns, and hand them a verified PDF of their exact ROI on Monday morning.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <Button variant="secondary" size="xl" className="font-bold shadow-xl" asChild>
                                <Link to="/auth?role=brand">
                                    Start Managing Clients
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-32">
                <div className="container px-6">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Charge a premium. Prove your worth.
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            The infrastructure you need to become the dominant local marketing agency.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-foreground text-lg mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground">{feature.description}</p>
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
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-foreground">
                            Ready to upgrade your agency?
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8">
                            Sign up today and run your first client campaign for free.
                        </p>
                        <Button variant="hero" size="xl" asChild>
                            <Link to="/auth?role=brand">
                                Open Agency Account
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForAgencies;
