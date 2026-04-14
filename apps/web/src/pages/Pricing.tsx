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
                description="Transparent, per-Moment pricing for brands, merchants, hosts, and participants. Participate free. Pay to scale."
                type="website"
            />

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-hero">
                <div className="container px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-6">
                            Pricing is Per Moment, <br />
                            <span className="text-gradient-primary">Not Per User</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                            Participate free. Brands and Merchants pay to scale. No hidden fees.
                            Just transparent, per-Moment pricing.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stakeholder Tabs */}
            <section className="py-20 md:py-32">
                <div className="container px-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
                        <TabsList className="grid w-full grid-cols-4 mb-12">
                            <TabsTrigger value="brands" className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                <span className="hidden sm:inline">For Brands</span>
                            </TabsTrigger>
                            <TabsTrigger value="merchants" className="flex items-center gap-2">
                                <Store className="w-4 h-4" />
                                <span className="hidden sm:inline">For Merchants</span>
                            </TabsTrigger>
                            <TabsTrigger value="hosts" className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="hidden sm:inline">For Hosts</span>
                            </TabsTrigger>
                            <TabsTrigger value="participants" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span className="hidden sm:inline">For Participants</span>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                        <h3 className="text-2xl font-bold mb-2">Verified Anchor</h3>
                                        <div className="text-4xl font-bold text-foreground mb-2">$0</div>
                                        <p className="text-sm text-muted-foreground">Forever free</p>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            'Verified Moment Anchor status',
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
                                            'Featured Anchor status',
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
                                    Build a record. Scale what works.
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
                                                'Claim Bounties',
                                                'Build execution record',
                                                'Earn from Moments',
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
                                                'Low rejection rate',
                                                'Repeat brand satisfaction',
                                                'Access Rank progression',
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
                                                'Higher-value Bounties',
                                                'Preferred brand matching',
                                                'Replication rights',
                                                'Advanced tooling',
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
                                    Participate, earn, and build your record for free.
                                </p>
                            </div>

                            <div className="max-w-4xl mx-auto">
                                <div className="bg-card rounded-xl p-8 border-2 border-primary shadow-xl mb-8">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-2">Free Forever</h3>
                                        <p className="text-muted-foreground">Participation is always free</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <ul className="space-y-3">
                                            {[
                                                'Join Moments',
                                                'Check in and participate',
                                                'Build Access Rank',
                                                'Accumulate verified Records',
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3">
                                                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <ul className="space-y-3">
                                            {[
                                                'View personal history',
                                                'Earn rewards',
                                                'No payment required',
                                                'No hidden fees',
                                            ].map((feature, i) => (
                                                <li key={i} className="flex items-center gap-3">
                                                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-xl p-8 text-center">
                                    <h4 className="font-semibold mb-4">Earn Priority Access</h4>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Priority access is earned through **Consistency** and **Access Rank**.
                                        There are no paid tiers for participants. The more you participate, the more you unlock.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            <TrendingUp className="w-4 h-4 text-secondary" />
                                            <span>Higher Rank = Better Odds</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium">
                                            <Zap className="w-4 h-4 text-secondary" />
                                            <span>Consistent Streaks = Priority</span>
                                        </div>
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
                            No subscriptions. No commitments. Just transparent, per-Moment pricing.
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
