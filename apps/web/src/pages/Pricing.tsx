import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MomentPricingCalculator } from '@/components/MomentPricingCalculator';
import {
    Users,
    Building2,
    Store,
    Sparkles,
    Check,
    ArrowRight,
    Shield,
    Zap,
    TrendingUp,
} from 'lucide-react';

const PricingPage = () => {
    const [activeTab, setActiveTab] = useState('brands');

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Pricing - Pay Per Moment, Not Per User"
                description="Transparent Promorang pricing for brands, merchants, hosts, and participants. Fund moments, reward pools, and real-world participation instead of paying for passive reach."
                type="website"
            />

            {/* Hero Section */}
            <section className="bg-gradient-hero pb-16 pt-28 md:pb-32 md:pt-40">
                <div className="container px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-6xl">
                            Pricing is Per Moment, <br />
                            <span className="text-gradient-primary">Not Per User</span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
                            Participants join free. Operators pay when they want to fund moments, sponsor behavior,
                            or scale repeatable formats. Pricing is tied to real-world outcomes, not seats on a dashboard.
                        </p>
                    </div>
                </div>
            </section>

            <section className="border-y border-border bg-secondary/30 py-16">
                <div className="container px-4 sm:px-6">
                    <div className="mx-auto max-w-5xl">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                                What you are actually paying for
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Promorang pricing maps to a real behavior loop: moments, verification, reward pools, and repeat movement.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-4">
                            {[
                                ['Moments', 'The real-world experience people join.'],
                                ['Verification', 'Marks and check-ins that prove it happened.'],
                                ['Reward Pools', 'Perks, PromoShare relevance, and funded participation.'],
                                ['Repeat Signal', 'The community pattern that makes future spend more valuable.'],
                            ].map(([title, text]) => (
                                <div key={title} className="rounded-2xl border border-border bg-card p-5">
                                    <p className="text-sm font-bold text-foreground">{title}</p>
                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stakeholder Tabs */}
            <section className="py-16 md:py-32">
                <div className="container px-4 sm:px-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
                        <TabsList className="mb-8 grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-2 sm:mb-12 sm:grid-cols-4">
                            <TabsTrigger value="brands" className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                <span>For Brands</span>
                            </TabsTrigger>
                            <TabsTrigger value="merchants" className="flex items-center gap-2">
                                <Store className="w-4 h-4" />
                                <span>For Merchants</span>
                            </TabsTrigger>
                            <TabsTrigger value="hosts" className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span>For Hosts</span>
                            </TabsTrigger>
                            <TabsTrigger value="participants" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>For Participants</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* BRANDS TAB */}
                        <TabsContent value="brands" className="space-y-12">
                            <div className="text-center mb-12">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    Brand Pricing (Per Moment)
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    Fund specific outcomes. Scale when ready. No minimum commitment.
                                </p>
                            </div>

                            {/* SKU Grid */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                                {/* Community Moment */}
                                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 mb-4 text-xs font-bold">
                                        START HERE
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Community Moment</h3>
                                    <div className="text-3xl font-bold text-foreground mb-4">$0 - $150</div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Culture seeding, cold start, density building
                                    </p>
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Platform fee</span>
                                            <span className="font-medium">$0-$30</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Reward pool</span>
                                            <span className="font-medium">Optional</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link to="/auth">Start Free</Link>
                                    </Button>
                                </div>

                                {/* Activation Moment */}
                                <div className="bg-card rounded-xl p-6 border-2 border-primary shadow-xl relative">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                            MOST POPULAR
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Activation Moment</h3>
                                    <div className="text-3xl font-bold text-foreground mb-4">$250 - $750</div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Product trial, brand presence at one location
                                    </p>
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Platform fee</span>
                                            <span className="font-medium">$75-$150</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Reward pool</span>
                                            <span className="font-medium">$150-$500</span>
                                        </div>
                                    </div>
                                    <Button variant="hero" className="w-full" asChild>
                                        <Link to="/auth">Fund a Moment</Link>
                                    </Button>
                                </div>

                                {/* Bounty Moment */}
                                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 mb-4 text-xs font-bold">
                                        REQUIRES 1+ MOMENT
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Bounty Moment</h3>
                                    <div className="text-3xl font-bold text-foreground mb-4">$500 - $2.5k</div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Distributed activation across locations
                                    </p>
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Platform fee</span>
                                            <span className="font-medium">15-25%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Distribution</span>
                                            <span className="font-medium">Multi-host</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link to="/auth">Learn More</Link>
                                    </Button>
                                </div>

                                {/* Digital Moment */}
                                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all">
                                    <h3 className="text-xl font-bold mb-2 mt-7">Digital Moment</h3>
                                    <div className="text-3xl font-bold text-foreground mb-4">$150 - $500</div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Remote activation, no physical limits
                                    </p>
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Platform fee</span>
                                            <span className="font-medium">$50-$100</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Verification</span>
                                            <span className="font-medium">Digital proof</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link to="/auth">Learn More</Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Scale Options */}
                            <div className="bg-muted/30 rounded-2xl p-8 mt-12">
                                <h3 className="text-2xl font-bold mb-6">Scale Pricing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Moment Bundles</h4>
                                            <p className="text-sm text-muted-foreground">10-20% discount on 5+ Moments</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Zap className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Priority Matching</h4>
                                            <p className="text-sm text-muted-foreground">Faster workflow, guaranteed SLAs</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">Multi-Location Replication</h4>
                                            <p className="text-sm text-muted-foreground">Scale proven formats faster</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Calculator */}
                            <div className="mt-12">
                                <MomentPricingCalculator />
                            </div>
                        </TabsContent>

                        {/* MERCHANTS TAB */}
                        <TabsContent value="merchants" className="space-y-12">
                            <div className="text-center mb-12">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    Merchant Pricing
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    Free to start. Scale with frequency.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {/* Free Tier */}
                                <div className="bg-card rounded-xl p-8 border-2 border-primary shadow-xl">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-2">Partner Venue</h3>
                                        <div className="text-4xl font-bold text-foreground mb-2">$0</div>
                                        <p className="text-sm text-muted-foreground">Forever free</p>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            'Partner Venue status',
                                            'Foot traffic from activations',
                                            'Redemption records',
                                            'Venue credibility',
                                            'No listing fees',
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button variant="hero" className="w-full" asChild>
                                        <Link to="/auth">Start Free</Link>
                                    </Button>
                                </div>

                                {/* Recurring Tier */}
                                <div className="bg-card rounded-xl p-8 border border-border">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-2">Merchant Moment</h3>
                                        <div className="text-4xl font-bold text-foreground mb-2">$300 - $1k</div>
                                        <p className="text-sm text-muted-foreground">Per month</p>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            '4-12 Moments included',
                                            'Featured Venue status',
                                            'Recurring templates',
                                            'Loyalty integrations',
                                            'Priority support',
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link to="/auth">Learn More</Link>
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* HOSTS TAB */}
                        <TabsContent value="hosts" className="space-y-12">
                            <div className="text-center mb-12">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    Host Pricing
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    Start free, build signal, and earn the right to operate bigger funded moments.
                                </p>
                            </div>

                            {/* Value Ladder */}
                            <div className="max-w-4xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Free */}
                                    <div className="bg-card rounded-xl p-6 border border-border">
                                        <h3 className="text-xl font-bold mb-4">Start Free</h3>
                                        <ul className="space-y-3">
                                            {[
                                                'Create Community Moments',
                                                'Build a verified host record',
                                                'Track repeat participation',
                                                'Start proving your scene',
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Escalation */}
                                    <div className="bg-card rounded-xl p-6 border-2 border-primary">
                                        <h3 className="text-xl font-bold mb-4">Earn Trust</h3>
                                        <ul className="space-y-3">
                                            {[
                                                '90%+ fulfillment rate',
                                                'Low friction check-ins',
                                                'Repeat participant trust',
                                                'Level progression and stronger standing',
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Scale */}
                                    <div className="bg-card rounded-xl p-6 border border-border">
                                        <h3 className="text-xl font-bold mb-4">Scale Impact</h3>
                                        <ul className="space-y-3">
                                            {[
                                                'Higher-value Brand Rewards',
                                                'Preferred brand and sponsor matching',
                                                'Repeatable format replication',
                                                'Advanced tooling and support',
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* PARTICIPANTS TAB */}
                        <TabsContent value="participants" className="space-y-12">
                            <div className="text-center mb-12">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    Participant Pricing
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    Start free, earn your way up through Keys, or subscribe for immediate standing.
                                </p>
                            </div>

                            <div className="max-w-4xl mx-auto">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                                    {[
                                        ['Free', '$0', '1.0x', '100%', 'Points, Keys, and non-cash PromoShare entries.'],
                                        ['Plus', '$9.99/mo', '1.25x', '90%', 'Cash/Gem PromoShare access and boosted tickets.'],
                                        ['Pro', '$24.99/mo', '1.5x', '75%', 'Higher caps, priority access, and premium missions.'],
                                        ['Elite', '$49.99/mo', '2.0x', '60%', 'Largest boosts, premium pools, and local impact funding.'],
                                    ].map(([tier, price, points, keyCost, description]) => (
                                        <div key={tier} className="rounded-xl border border-border bg-card p-6">
                                            <h3 className="text-xl font-bold">{tier}</h3>
                                            <div className="mt-2 text-3xl font-bold text-foreground">{price}</div>
                                            <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                                            <div className="mt-5 space-y-2 text-sm">
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-muted-foreground">Points</span>
                                                    <span className="font-medium">{points}</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-muted-foreground">Key cost</span>
                                                    <span className="font-medium">{keyCost}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 grid gap-6 rounded-xl bg-muted/30 p-8 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-3">Earn Active Standing</h4>
                                        <p className="text-sm leading-7 text-muted-foreground">
                                            Free participants can unlock temporary Plus, Pro, or Elite standing by earning enough Keys from verified activity in a month.
                                            Cash/Gem PromoShare access starts at Plus standing, whether paid or earned.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-3">Membership Powers The Pool</h4>
                                        <p className="text-sm leading-7 text-muted-foreground">
                                            A configured percentage of every paid participant tier funds PromoShare rewards, liquidity reserves, and higher-tier local impact pools.
                                            Rewards still depend on verified participation and cycle outcomes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-charcoal text-cream">
                <div className="container px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
                            Ready to get started?
                        </h2>
                        <p className="text-cream/70 text-lg mb-8">
                            Start where you are. Fund moments when you need them. Scale once the signal is real.
                        </p>
                        <Button variant="hero" size="xl" asChild>
                            <Link to="/auth">
                                Start Free
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PricingPage;
