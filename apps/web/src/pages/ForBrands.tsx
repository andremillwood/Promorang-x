import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandingLeaderboard } from "@/components/StandingLeaderboard";
import {
    Building2,
    Handshake,
    BarChart3,
    Target,
    Users,
    ArrowRight,
    Sparkles,
    Search,
    ShieldCheck,
    Zap
} from "lucide-react";

import { BrandEstimator } from "@/components/brand/BrandEstimator";

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
        title: "Community Pulse",
        description:
            "Understand what truly moves people. Explore the stories that resonate across the platform before you fund your next moment.",
    },
    {
        icon: ShieldCheck,
        title: "Real Impact",
        description:
            "Track the journey from discovery to action. Celebrate verified stories and physical gatherings that you made possible.",
    },
];

const stats = [
    { value: "89%", label: "Average redemption rate" },
    { value: "3.2x", label: "Higher engagement vs. ads" },
    { value: "50K+", label: "Monthly active participants" },
    { value: "15%", label: "Platform fee on sponsorships" },
];

const ForBrands = () => {
    const { user } = useAuth();
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
                            The Activation Layer for <br />
                            <span className="text-gradient-primary">Real-World Sponsorship.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Stop guessing. Promorang helps you **Discover the pulse** of 
                            real-world communities. Fund moments that matter, support 
                            physical gathering spots, and see the real proof of your impact.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button variant="hero" size="xl" asChild>
                                <a href="#outcomes">
                                    Explore Outcomes
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </a>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                {user ? (
                                    <Link to="/onboarding/brand">Enable Brand Dashboard</Link>
                                ) : (
                                    <Link to="/auth">Partner With Us</Link>
                                )}
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
                                Stop Paying for "Impressions." <br />
                                Start Paying for Verified Action.
                            </h2>

                            <p className="text-lg text-muted-foreground mb-8">
                                Already sponsoring Carnival or a local festival? Use Promorang to guarantee 
                                people actually interact with your brand. Instantly generate an automated 
                                ROI recap to justify your spend.
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

                        {/* Community Pulse Preview */}
                        <div className="relative">
                            <div className="bg-charcoal rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/30 transition-colors" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="font-serif text-xl font-bold text-white italic">Community Pulse</h4>
                                        <Badge className="bg-primary/20 text-primary border-primary/20 animate-pulse">Live Feed</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { title: "Yoga in the Park", yield: "84%", cost: "Active", velocity: "Heartfelt" },
                                            { title: "Craft Coffee Tour", yield: "92%", cost: "Active", velocity: "Vibrant" },
                                        ].map((intel, i) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-white">{intel.title}</p>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Status: {intel.cost}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-primary">{intel.yield} Verified</p>
                                                    <p className="text-[9px] text-white/20 uppercase font-black">{intel.velocity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Real stories unfold every day</p>
                                    </div>
                                </div>
                            </div>
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

            {/* Reward Catalyst Section */}
            <section id="catalyst" className="py-24 bg-charcoal relative overflow-hidden border-y border-white/5">
                <div className="container px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-widest mb-6">
                            <Zap className="w-3 h-3" />
                            Industry Reward Playbooks
                        </div>
                        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 italic">
                            Fueling <span className="text-primary">Community Gratitude.</span>
                        </h2>
                        <p className="text-white/60 text-lg">
                            Each industry has unique ways to reward standing. Use these playbooks 
                            to turn your specific products or services into elite community keys.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                industry: "Food & Beverage",
                                description: "Hospitality and taste-makers.",
                                idea: "Founder's Table",
                                ideaDesc: "Reserved seating and off-menu items for Eminence participants.",
                                icon: Zap,
                            },
                            {
                                industry: "Luxury & Retail",
                                description: "Physical goods and limited drops.",
                                idea: "Archive Access",
                                ideaDesc: "Early access or 'Item #001' of the next collection for Luminaries.",
                                icon: Sparkles,
                            },
                            {
                                industry: "Professional Services",
                                description: "Expertise and priority access.",
                                idea: "Priority Standing",
                                ideaDesc: "Skip-the-line support and private consulting for top storytellers.",
                                icon: ShieldCheck,
                            },
                            {
                                industry: "Digital & SaaS",
                                description: "Platforms and remote tools.",
                                idea: "Legacy Features",
                                ideaDesc: "Permanent feature unlocks and 'Founding Member' status badges.",
                                icon: Target,
                            }
                        ].map((category, i) => (
                            <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                    <category.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{category.industry}</h3>
                                <p className="text-xs text-white/40 mb-6">{category.description}</p>
                                <div className="pt-6 border-t border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 italic">{category.idea}</p>
                                    <p className="text-xs text-white/60 leading-relaxed">{category.ideaDesc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Echo Potential Section */}
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
                                        <h4 className="font-bold text-lg">Echo Potential</h4>
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Verified Reach</Badge>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resonance Standing</span>
                                            <span className="text-xs font-black text-primary">1.25x Boost</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="w-[85%] h-full bg-primary" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-center text-muted-foreground italic">
                                        "When an Eminence participant shares a story, it echoes to 50,000+ verified niche followers."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6">
                                <Users className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">The Echo Effect</span>
                            </div>
                            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                                Fund the <span className="text-primary italic">Amplifiers.</span>
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                Our community members are more than attendees—they are verified amplifiers. 
                                We track **Echo Potential** by correlating platform Standing with real-world 
                                reach (Instagram, Twitter, and more).
                            </p>
                            <div className="space-y-4">
                                {[
                                    { title: "Discovery Bonus", desc: "Automatic points for connecting verified social capital." },
                                    { title: "Resonance Multipliers", desc: "Higher standing for participants with proven community reach." },
                                    { title: "Brand ROI Recaps", desc: "Instant reports on how far your funded moment traveled." },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                {user ? (
                                    <Link to="/onboarding/brand">
                                        Enable Brand Dashboard
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                ) : (
                                    <Link to="/auth">
                                        Partner with Us
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Link>
                                )}
                            </Button>
                            <Button variant="outline" size="lg" className="border-cream/30 text-cream hover:bg-cream/10" asChild>
                                <Link to="/strategies">View Moment Catalog</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
            <StandingLeaderboard />
        </div>
    );
};

export default ForBrands;
