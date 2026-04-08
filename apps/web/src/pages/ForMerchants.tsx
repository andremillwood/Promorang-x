import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
    Store,
    Users,
    Gift,
    TrendingUp,
    ArrowRight,
    TrendingUp as Graph,
    MapPin,
    Clock,
} from "lucide-react";

const merchantBenefits = [
    {
        icon: MapPin,
        title: "Venue Registration",
        description:
            "List your venue on Promorang and let hosts discover your space for their next moment.",
    },
    {
        icon: Users,
        title: "Guaranteed Foot Traffic",
        description:
            "Attract new customers through community events. Convert moment participants into your regulars.",
    },
    {
        icon: Gift,
        title: "In-Store Rewards",
        description:
            "Offer exclusive flash-deals to moment participants. Drive redemptions and build direct loyalty.",
    },
    {
        icon: Graph,
        title: "Growth Analytics",
        description:
            "Understand which moments drive the most traffic and optimize your venue partnerships.",
    },
];

const stats = [
    { value: "45%", label: "Visitor-to-Customer conversion" },
    { value: "2.5x", label: "Higher dwell time" },
    { value: "500+", label: "Verified Venues" },
    { value: "$0", label: "Listing fee for merchants" },
];

const ForMerchants = () => {
    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Promorang for Merchants - Your Space is the Stage"
                description="Become a destination for community moments. Register your venue, attract foot traffic, and convert participants into regulars with verified in-store rewards."
                type="website"
            />

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-hero">
                <div className="container px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-8">
                            <Store className="w-4 h-4" />
                            <span className="text-sm font-medium">Venue Infrastructure</span>
                        </div>

                        <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
                            Become a Verified Anchor. <br />
                            <span className="text-gradient-primary">Scale with Frequency.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Free to start. No listing fees. Turn your venue into a Moment Anchor
                            and attract verified foot traffic from brand activations.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                <Link to="/discover">
                                    Explore Live Venues
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link to="/auth">Register Your Venue</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Content - Yield Discovery */}
            <section className="py-20 md:py-32 bg-muted/30">
                <div className="container px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="bg-card rounded-2xl border border-border p-6 shadow-elevated">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="font-semibold text-foreground">Venue Dashboard</h4>
                                    <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase">Live</div>
                                </div>
                                <div className="aspect-video bg-secondary rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                                    <Store className="w-12 h-12 text-muted-foreground transition-transform hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-secondary rounded-lg border border-border/50">
                                        <p className="font-bold text-foreground">12</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">Moments</p>
                                    </div>
                                    <div className="text-center p-3 bg-secondary rounded-lg border border-border/50">
                                        <p className="font-bold text-foreground">456</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">Visitors</p>
                                    </div>
                                    <div className="text-center p-3 bg-secondary rounded-lg border border-border/50">
                                        <p className="font-bold text-foreground">89%</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">Redeem Rate</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -z-10" />
                        </div>

                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6">
                                <Users className="w-4 h-4" />
                                <span className="text-sm font-medium">Stakeholder Value</span>
                            </div>

                            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                                The world is waiting for your next moment
                            </h2>

                            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                Connect with local hosts who need a home for their gatherings. From
                                afternoon workshops to evening social hours, turn your space into
                                the neighborhood hub.
                            </p>

                            <div className="space-y-6 mb-10">
                                {merchantBenefits.map((benefit, index) => (
                                    <div key={index} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <benefit.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-1">
                                                {benefit.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="hero" size="lg" asChild>
                                <Link to="/auth">Register Your Venue</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 border-b border-border">
                <div className="container px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="font-serif text-3xl md:text-4xl font-bold text-emerald-600">
                                    {stat.value}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-charcoal text-cream">
                <div className="container px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                            Ready to host the next big moment?
                        </h2>
                        <p className="text-cream/70 text-lg mb-8 leading-relaxed">
                            Join hundreds of venues already growing their business through authentic community participation.
                        </p>
                        <Button variant="hero" size="xl" asChild>
                            <Link to="/auth">
                                List Your Space
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ForMerchants;
