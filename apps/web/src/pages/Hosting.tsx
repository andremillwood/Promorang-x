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
            <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-hero">
                <div className="container px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">For Creators & Community Leaders</span>
                        </div>

                        <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up">
                            Gather your people.{" "}
                            <span className="text-gradient-primary">Create magic.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                            Whether you're organizing yoga sessions, book clubs, or neighborhood
                            meetups—Promorang gives you the tools to bring people together and
                            build lasting connections.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                            <Button variant="hero" size="xl" asChild>
                                <Link to="/create-moment">
                                    Start Hosting
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link to="/discover">See Examples</Link>
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
                            Everything you need to host amazing moments
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            From creation to analytics, we've got you covered.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow group"
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

            {/* Pricing Section */}
            <section className="py-20 md:py-32 bg-gradient-warm">
                <div className="container px-6">
                    <div className="max-w-2xl mx-auto text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Start free and scale as your community grows.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {pricingTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`relative bg-card rounded-2xl p-8 border hover:shadow-xl transition-all ${tier.popular
                                        ? "border-primary shadow-lg scale-105 z-10"
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
                <div className="absolute inset-0 bg-primary/5"></div>
                <div className="container px-6 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-foreground">
                            Ready to bring your community together?
                        </h2>
                        <p className="text-muted-foreground text-lg mb-8">
                            Join thousands of hosts creating meaningful experiences every day.
                        </p>
                        <Button variant="hero" size="xl" asChild>
                            <Link to="/create-moment">
                                Create Your First Moment
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
