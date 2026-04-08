import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Handshake,
    BarChart3,
    Target,
    Users,
    ArrowRight,
    Sparkles,
} from "lucide-react";

const sponsorshipBenefits = [
    {
        icon: Target,
        title: "Precision Matching",
        description:
            "Don't buy impressions. Fund specific outcomes. Match with moments that align with your brand values and mission.",
    },
    {
        icon: Handshake,
        title: "Authentic Integration",
        description:
            "No interrupting ads. Become the hero of the moment by enabling experiences that wouldn't happen without you.",
    },
    {
        icon: Users,
        title: "Verified Audiences",
        description:
            "Connect with people who actually showed up. GPS-verified participation beats passive scroll depth every time.",
    },
    {
        icon: BarChart3,
        title: "Outcome ROI",
        description:
            "Track cost-per-redemption and cost-per-action. Pay for movement, not just eyeballs.",
    },
];

const stats = [
    { value: "89%", label: "Average redemption rate" },
    { value: "3.2x", label: "Higher engagement vs. ads" },
    { value: "50K+", label: "Monthly active participants" },
    { value: "15%", label: "Platform fee on sponsorships" },
];

const ForBrands = () => {
    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Promorang for Brands - Fund Proof, Not Promises"
                description="Stop interrupting people. Start funding their lives. Sponsor real-world moments with GPS-verified proof of attendance. Pay for outcomes, not impressions."
                type="website"
            />

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-hero">
                <div className="container px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
                            <Building2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Precision Sponsor Infrastructure</span>
                        </div>

                        <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
                            Fund Moments. <br />
                            <span className="text-gradient-primary">Get Verified Outcomes.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            No subscriptions. Pay per Moment. Promorang infrastructure allows you to
                            fund real-world activations with surgical precision and verified proof.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                <a href="#outcomes">
                                    Explore Outcomes
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </a>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link to="/auth">Partner With Us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ROI Section */}
            <section className="py-20 md:py-32">
                <div className="container px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-6">
                                <BarChart3 className="w-4 h-4" />
                                <span className="text-sm font-medium">Measurement & ROI</span>
                            </div>

                            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                                Stop Interrupting. <br />
                                Start Participating.
                            </h2>

                            <p className="text-lg text-muted-foreground mb-8">
                                Promorang yields verified participation data. No more guessing if your
                                ad spend actually moved the needle.
                            </p>

                            <div className="space-y-4 mb-8">
                                {sponsorshipBenefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <benefit.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">
                                                {benefit.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="hero" asChild>
                                <Link to="/strategies">Explore Outcomes</Link>
                            </Button>
                        </div>

                        {/* Visual */}
                        <div className="relative">
                            <div className="bg-card rounded-2xl border border-border p-6 shadow-elevated">
                                <h4 className="font-semibold text-foreground mb-4">
                                    Sponsorship Marketplace
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { title: "Sunrise Yoga", category: "Wellness", participants: 45, bid: "$250" },
                                        { title: "Food Festival", category: "Food & Drink", participants: 234, bid: "$500" },
                                        { title: "Art Workshop", category: "Creative", participants: 15, bid: "$150" },
                                    ].map((moment, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-4 bg-secondary rounded-xl"
                                        >
                                            <div>
                                                <p className="font-medium text-foreground">{moment.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {moment.category} • {moment.participants} participants
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-primary">{moment.bid}</p>
                                                <p className="text-xs text-muted-foreground">suggested</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-b border-border bg-muted/30">
                <div className="container px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="font-serif text-3xl md:text-4xl font-bold text-primary">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SKU Catalog Section */}
            <section id="outcomes" className="py-20 bg-background border-y border-border">
                <div className="container px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-foreground mb-6">
                            <span className="text-sm font-medium">Atomic Commercial Units</span>
                        </div>
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                            The Moment Catalog
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Sponsorship isn't an ad buy. It's a purchase of a specific outcome.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Community Moment - Entry Level */}
                        <div className="bg-card rounded-xl p-8 border border-border hover:shadow-soft-xl transition-all">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 mb-4 text-xs font-bold">
                                START HERE
                            </div>
                            <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6 text-emerald-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Community Moment</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">SINGLE LOCATION</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                Culture seeding, cold start, density building. Test the platform with minimal risk.
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Suggested Funding</span>
                                    <span className="font-mono font-medium">$0 – $150</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Platform Fee</span>
                                    <span className="font-mono font-medium text-emerald-500">$0 – $30</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Verification</span>
                                    <span className="font-mono font-medium text-emerald-500">GPS + Time</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/auth">Start Free</Link>
                            </Button>
                        </div>

                        {/* Activation */}
                        <div className="bg-card rounded-xl p-8 border border-border hover:shadow-soft-xl transition-all">
                            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 text-primary">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Activation Moment</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Single Location</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                Fund a specific moment. Get verified presence in a high-relevance environment.
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Suggested Funding</span>
                                    <span className="font-mono font-medium">$250 – $750</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Verification</span>
                                    <span className="font-mono font-medium text-emerald-500">GPS + Time</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/strategies">Explore Potential Outcomes</Link>
                            </Button>
                        </div>

                        {/* Bounty */}
                        <div className="bg-card rounded-xl p-8 border border-primary/20 shadow-soft-xl relative overflow-hidden transition-all">
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                                SCALABLE
                            </div>
                            <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 text-white">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Bounty Moment</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Distributed</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                Commission outcomes across multiple hosts. Paying only for verified execution.
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Suggested Funding</span>
                                    <span className="font-mono font-medium">$500 – $2.5k</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Verification</span>
                                    <span className="font-mono font-medium text-emerald-500">Proof of Work</span>
                                </div>
                            </div>
                            <Button variant="hero" className="w-full" asChild>
                                <Link to="/strategies">Discover Targeted Outcomes</Link>
                            </Button>
                        </div>

                        {/* Digital */}
                        <div className="bg-card rounded-xl p-8 border border-border hover:shadow-soft-xl transition-all">
                            <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Digital Moment</h3>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">Remote</p>
                            <p className="text-muted-foreground mb-6 min-h-[48px]">
                                Verified participation without physical limits. Ideal for remote activations.
                            </p>
                            <div className="space-y-2 mb-8 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Suggested Funding</span>
                                    <span className="font-mono font-medium">$150 – $500</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Verification</span>
                                    <span className="font-mono font-medium text-emerald-500">Digital Proof</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/strategies">View Verification Logic</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-charcoal text-cream">
                <div className="container px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                            Ready to fund proof, not promises?
                        </h2>
                        <p className="text-cream/70 text-lg mb-8">
                            Join leading brands already using Promorang to build authentic connections with precision.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                <Link to="/auth">
                                    Partner with Us
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="border-cream/30 text-cream hover:bg-cream/10" asChild>
                                <Link to="/strategies">View Moment Catalog</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForBrands;
