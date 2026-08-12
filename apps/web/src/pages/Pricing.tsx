import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MomentPricingCalculator } from '@/components/MomentPricingCalculator';
import MarketingPromiseStrip from '@/components/MarketingPromiseStrip';
import { CommercialCTA } from '@/components/commercial/CommercialCTA';
import { commercialJourney, moneyBoundaries, revenueLines } from '@/lib/revenue-model';
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
                        <MarketingPromiseStrip
                            className="mx-auto max-w-5xl text-left"
                            items={[
                                { label: 'Situation', text: 'Most marketing spend buys attention before anyone knows whether people will act.' },
                                { label: 'Promorang makes possible', text: 'Budget funds moments, verification, reward pools, and repeat movement.' },
                                { label: 'Next move', text: 'Choose your role, then start with the smallest moment that can prove demand.' },
                            ]}
                            ctaLabel="Compare by role"
                            ctaHref="#pricing-by-role"
                        />
                    </div>
                </div>
            </section>

            <section className="border-y border-white/10 bg-[#090909] py-16 text-white md:py-24">
                <div className="container px-4 sm:px-6">
                    <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
                        <div className="lg:sticky lg:top-28 lg:self-start">
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">Promorang revenue model</p>
                            <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-6xl">We earn when value moves.</h2>
                            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">Participation can begin free. Promorang earns through disclosed fees when an operator funds, scales, transacts, subscribes, or uses managed infrastructure—not by quietly reducing participant rewards.</p>
                            <Link to="/economy#how-promorang-earns" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-primary hover:underline">See the full money flow <ArrowRight className="h-4 w-4" /></Link>
                        </div>
                        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
                            {revenueLines.map((line, index) => (
                                <article key={line.key} className="bg-[#111] p-6 md:p-7">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-mono text-xs text-primary">0{index + 1}</span>
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/50">{line.capture}</span>
                                    </div>
                                    <h3 className="mt-8 text-xl font-black">{line.title}</h3>
                                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/35">Paid by {line.payer}</p>
                                    <p className="mt-4 text-sm leading-6 text-white/55">{line.description}</p>
                                </article>
                            ))}
                        </div>
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
            <section id="pricing-by-role" className="py-16 md:py-32">
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
                                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
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
                                    <CommercialCTA variant="outline" className="w-full" to="/auth?mode=signup&role=brand&intent=community_moment&next=/create/campaign" action="select_community_moment" audience="brand" metadata={{ sku: 'A1', price_band: '0-150' }}>Start Free</CommercialCTA>
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
                                    <CommercialCTA variant="hero" className="w-full" to="/auth?mode=signup&role=brand&intent=fund_moment&sku=A2&next=/create/campaign" action="select_activation_moment" audience="brand" metadata={{ sku: 'A2', price_band: '250-750' }}>Fund a Moment</CommercialCTA>
                                </div>

                                {/* Bounty Moment */}
                                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
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
                                    <CommercialCTA variant="outline" className="w-full" to="/auth?mode=signup&role=brand&intent=fund_bounty&sku=A3&next=/create/campaign" action="select_bounty_moment" audience="brand" metadata={{ sku: 'A3', price_band: '500-2500' }}>Configure bounty</CommercialCTA>
                                </div>

                                {/* Digital Moment */}
                                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
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
                                    <CommercialCTA variant="outline" className="w-full" to="/auth?mode=signup&role=brand&intent=fund_digital&sku=A5&next=/create/campaign" action="select_digital_moment" audience="brand" metadata={{ sku: 'A5', price_band: '150-500' }}>Configure digital</CommercialCTA>
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
                                <div className="mt-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold">Brand Studio · $999/month</h4>
                                        <p className="mt-1 text-sm text-muted-foreground">Workspace, reusable templates, reporting, and priority matching. Moment funding remains separate.</p>
                                    </div>
                                    <CommercialCTA variant="outline" to="/auth?mode=signup&role=brand&intent=brand_studio&next=/membership/checkout?plan=brand_studio" action="select_brand_studio" audience="brand" metadata={{ plan: 'brand_studio', price: 999 }}>Choose Brand Studio</CommercialCTA>
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
                                    <CommercialCTA variant="hero" className="w-full" to="/auth?mode=signup&role=merchant&intent=partner_venue&next=/dashboard/venues/add" action="select_partner_venue" audience="merchant" metadata={{ sku: 'merchant_free' }}>Start Free</CommercialCTA>
                                </div>

                                {/* Recurring Tier */}
                                <div className="bg-card rounded-xl p-8 border border-border">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-2">Merchant Moment</h3>
                                        <div className="text-4xl font-bold text-foreground mb-2">$499</div>
                                        <p className="text-sm text-muted-foreground">Per month</p>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            '8 Merchant Moments included',
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
                                    <CommercialCTA variant="outline" className="w-full" to="/auth?mode=signup&role=merchant&intent=merchant_growth&next=/membership/checkout?plan=merchant_growth" action="select_merchant_plan" audience="merchant" metadata={{ plan: 'merchant_growth', price: 499 }}>Start Merchant Growth</CommercialCTA>
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
                                    Start free, build proof, and earn the right to operate bigger funded moments.
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
                                <div className="mt-8 rounded-xl border-2 border-primary bg-card p-7 text-center">
                                    <h3 className="text-2xl font-bold">Host Pro · $49/month</h3>
                                    <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">Advanced operations, reusable templates, and priority matching. Trust requirements still apply.</p>
                                    <CommercialCTA variant="hero" className="mt-6" to="/auth?mode=signup&role=host&intent=host_pro&next=/membership/checkout?plan=host_pro" action="select_host_pro" audience="host" metadata={{ plan: 'host_pro', price: 49 }}>Choose Host Pro</CommercialCTA>
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
                                            {tier === 'Free' ? <CommercialCTA variant="outline" className="mt-6 w-full" to="/auth?mode=signup&role=participant&intent=free_membership&next=/wallet" action="select_free_membership" audience="participant" metadata={{ plan: 'free' }}>Join free</CommercialCTA> : <CommercialCTA variant={tier === 'Pro' ? 'hero' : 'outline'} className="mt-6 w-full" to={`/auth?mode=signup&role=participant&intent=membership&plan=${tier.toLowerCase()}&next=/membership/checkout?plan=${tier.toLowerCase()}`} action="select_paid_membership" audience="participant" metadata={{ plan: tier.toLowerCase(), price }}>{`Choose ${tier}`}</CommercialCTA>}
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

            <section className="border-t border-border bg-secondary/20 py-16 md:py-24">
                <div className="container px-4 sm:px-6">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-8 lg:grid-cols-2">
                            <div className="rounded-3xl border border-border bg-card p-7 md:p-9">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Every funded order</p>
                                <h2 className="mt-4 font-serif text-3xl font-bold md:text-4xl">Three balances. Never one mystery total.</h2>
                                <div className="mt-8 space-y-4">
                                    {moneyBoundaries.map((item, index) => <div key={item.label} className="grid grid-cols-[2rem_1fr] gap-4 border-t border-border pt-4 first:border-0 first:pt-0"><span className="font-mono text-xs text-primary">0{index + 1}</span><div><h3 className="font-bold">{item.label}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p></div></div>)}
                                </div>
                            </div>
                            <div className="rounded-3xl border border-border bg-card p-7 md:p-9">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">Conversion path</p>
                                <h2 className="mt-4 font-serif text-3xl font-bold md:text-4xl">Your selection travels with you.</h2>
                                <ol className="mt-8 space-y-3">{commercialJourney.map((step, index) => <li key={step} className="flex gap-4 rounded-xl bg-muted/50 p-4"><span className="font-mono text-xs font-black text-primary">{index + 1}</span><span className="text-sm font-semibold">{step}</span></li>)}</ol>
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
                            Ready to get started?
                        </h2>
                        <p className="text-cream/70 text-lg mb-8">
                            Start where you are. Fund moments when you need them. Scale once the proof is real.
                        </p>
                        <CommercialCTA variant="hero" size="xl" to="/auth?mode=signup&intent=pricing&next=/post-login" action="pricing_primary_cta" audience="participant">
                            Choose your route
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </CommercialCTA>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PricingPage;
