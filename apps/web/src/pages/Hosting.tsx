import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Users,
    Sparkles,
    Calendar,
    BarChart3,
    QrCode,
    Gift,
    Check,
    ArrowRight,
    Zap,
    TrendingUp,
} from "lucide-react";

const features = [
    {
        icon: Calendar,
        title: "Easy Event Creation",
        description:
            "Create moments in minutes with our intuitive wizard. Add images, set capacity, define rewards, and publish.",
    },
    {
        icon: Users,
        title: "Participant Management",
        description:
            "Track RSVPs, manage check-ins, and engage with your community before, during, and after events.",
    },
    {
        icon: QrCode,
        title: "QR Check-In System",
        description:
            "Auto-generated QR codes for seamless check-ins. Verify attendance and trigger rewards automatically.",
    },
    {
        icon: Gift,
        title: "Built-In Rewards",
        description:
            "Incentivize participation with discounts, freebies, and exclusive access. Keep your community engaged.",
    },
    {
        icon: BarChart3,
        title: "Rich Analytics",
        description:
            "Understand your community with participation trends, engagement metrics, and growth insights.",
    },
    {
        icon: Zap,
        title: "Instant Bounties",
        description:
            "Access brand-sponsored bounties to fund your events. Get paid to host moments that matter.",
    },
];

const pricingTiers = [
    {
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for getting started",
        features: [
            "Up to 3 active moments",
            "50 participants per moment",
            "Basic analytics",
            "QR check-in",
            "Email support",
        ],
        cta: "Start Hosting Free",
        popular: false,
    },
    {
        name: "Pro",
        price: "$19",
        period: "/month",
        description: "For growing communities",
        features: [
            "Unlimited moments",
            "200 participants per moment",
            "Advanced analytics",
            "Custom branding",
            "Priority support",
            "Export data",
        ],
        cta: "Start Free Trial",
        popular: true,
    },
    {
        name: "Business",
        price: "$49",
        period: "/month",
        description: "For established organizations",
        features: [
            "Everything in Pro",
            "Unlimited participants",
            "Team collaboration",
            "API access",
            "White-label options",
            "Dedicated account manager",
        ],
        cta: "Contact Sales",
        popular: false,
    },
];

const Hosting = () => {
    return (
        <div className="min-h-screen bg-background">

            {/* Hero Section */}
            <section className="bg-gradient-hero pb-20 pt-24 sm:pt-28 md:pb-32 md:pt-40">
                <div className="container px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-accent shadow-sm animate-fade-in">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wide">The Digital Land Grab</span>
                        </div>

                        <h1 className="mb-6 font-serif text-4xl font-black leading-tight text-foreground animate-slide-up sm:text-5xl md:text-6xl">
                            Build an Audience.
                            <br className="hidden md:block"/>
                            <span className="text-gradient-primary">Monetize Through Sponsors.</span>
                        </h1>

                        <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground animate-slide-up sm:text-lg md:text-xl" style={{ animationDelay: "0.1s" }}>
                            Every moment you host is a deposit in your sponsorship attractiveness account. 
                            Create 3 moments → Unlock brand matchmaking → Get paid to host. 
                            You're not planning events—you're building a media property that brands will pay to access.
                        </p>

                        <div className="flex flex-col items-stretch justify-center gap-4 animate-slide-up sm:flex-row sm:items-center" style={{ animationDelay: "0.2s" }}>
                            <Button variant="hero" size="xl" className="font-bold shadow-glow" asChild>
                                <Link to="/auth?role=host">
                                    Claim Your Niche
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="border-border/50 text-foreground" asChild>
                                <Link to="/discover">View Early Adopters</Link>
                            </Button>
                        </div>

                        <div className="mt-6 -mx-4 overflow-x-auto px-4 touch-pan-x snap-x-mandatory scrollbar-none sm:hidden">
                            <div className="flex gap-3 pb-1">
                                <div className="min-w-[220px] snap-start rounded-2xl border border-primary/15 bg-primary/5 p-4 text-left">
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Journey</p>
                                    <p className="mt-2 text-sm font-medium text-foreground">Claim your niche, create consistent moments, then convert that trust into sponsorship access.</p>
                                </div>
                                <div className="min-w-[220px] snap-start rounded-2xl border border-border bg-card p-4 text-left">
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">Mobile first</p>
                                    <p className="mt-2 text-sm text-muted-foreground">The page now stacks like an onboarding flow instead of a wide desktop pitch.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 md:py-32">
                <div className="container px-6">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Everything you need to host amazing moments
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            From creation to analytics, we've got you covered.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground text-lg mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* The Sponsorship Flywheel */}
            <section className="py-20 md:py-32 bg-charcoal text-cream relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/5"></div>
                <div className="container px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary border border-primary/30 mb-6">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wider">The Revenue Model</span>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                            How You Earn as a Host
                        </h2>
                        <p className="text-cream/60 text-lg">
                            It's not about ticket sales. It's about building a verified audience that brands pay to access.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            {[
                                { step: "1", title: "Create Moments", desc: "Host 3+ events", icon: Calendar, color: "bg-blue-500" },
                                { step: "2", title: "Build Audience", desc: "Attract participants", icon: Users, color: "bg-amber-500" },
                                { step: "3", title: "Unlock Match", desc: "Brands see your data", icon: Sparkles, color: "bg-primary" },
                                { step: "4", title: "Get Sponsored", desc: "Funding for events", icon: Gift, color: "bg-emerald-500" },
                                { step: "5", title: "Grow Loop", desc: "More = more sponsors", icon: TrendingUp, color: "bg-purple-500" },
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                                        <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mx-auto mb-4`}>
                                            <item.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Step {item.step}</p>
                                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                        <p className="text-sm text-cream/50">{item.desc}</p>
                                    </div>
                                    {i < 4 && (
                                        <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                                            <ArrowRight className="w-4 h-4 text-cream/20" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div>
                                    <p className="text-4xl font-black text-primary mb-2">3</p>
                                    <p className="text-sm font-semibold">Moments to unlock sponsorship matchmaking</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-amber-500 mb-2">50+</p>
                                    <p className="text-sm font-semibold">Participants needed to attract brand interest</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-emerald-500 mb-2">$250-2.5k</p>
                                    <p className="text-sm font-semibold">Typical sponsorship per funded moment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 md:py-32 bg-gradient-warm">
                <div className="container px-6">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Start Free. Scale with Sponsors.
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Free to start. Paid features unlock at higher tiers. But the real revenue? That's from brand sponsorships.
                        </p>
                    </div>

                    <div className="grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3 md:gap-8 mx-auto">
                        {pricingTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`relative rounded-2xl border bg-card p-6 transition-all md:p-8 ${tier.popular
                                        ? "z-10 border-primary shadow-lg md:scale-105"
                                        : "border-border"
                                    }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="font-semibold text-foreground text-xl mb-2">
                                        {tier.name}
                                    </h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="font-serif text-4xl font-bold text-foreground">
                                            {tier.price}
                                        </span>
                                        <span className="text-muted-foreground">{tier.period}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {tier.description}
                                    </p>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm">
                                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                            <span className="text-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={tier.popular ? "hero" : "outline"}
                                    className="w-full"
                                    asChild
                                >
                                    <Link to="/auth?role=host">{tier.cta}</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-charcoal text-cream relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/5"></div>
                <div className="container px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/5 border border-white/10 mb-6">
                            <Users className="w-8 h-8 text-accent" />
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-foreground">
                            Ready to lock in your Founding Host status?
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8">
                            Early adopters get permanent profile badges and priority matchmaking for brand sponsorships.
                        </p>
                        <Button variant="hero" size="xl" asChild>
                            <Link to="/auth?role=host">
                                Become a Founding Host
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Hosting;
