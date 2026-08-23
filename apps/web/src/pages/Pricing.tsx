import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
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
import { useI18n } from '@/i18n/I18nContext';

const PricingPage = () => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState('brands');

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title={t("pricing.seoTitle")}
                description={t("pricing.seoDescription")}
                type="website"
            />

            {/* Hero Section */}
            <section className="bg-gradient-hero pb-16 pt-28 md:pb-32 md:pt-40">
                <div className="container px-4 sm:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="mb-6 font-serif text-3xl font-bold text-foreground sm:text-4xl md:text-6xl">
                            {t("pricing.heroTitle1")} <br />
                            <span className="text-gradient-primary">{t("pricing.heroTitle2")}</span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
                            {t("pricing.heroCopy")}
                        </p>
                        <MarketingPromiseStrip
                            className="mx-auto max-w-5xl text-left"
                            items={[
                                { label: t("pricing.promiseSituationLabel"), text: t("pricing.promiseSituationText") },
                                { label: t("pricing.promisePossibleLabel"), text: t("pricing.promisePossibleText") },
                                { label: t("pricing.promiseNextLabel"), text: t("pricing.promiseNextText") },
                            ]}
                            ctaLabel={t("pricing.compareByRole")}
                            ctaHref="#pricing-by-role"
                        />
                    </div>
                </div>
            </section>

            <section className="border-y border-white/10 bg-[#090909] py-16 text-white md:py-24">
                <div className="container px-4 sm:px-6">
                    <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
                        <div className="lg:sticky lg:top-28 lg:self-start">
                            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">{t("pricing.revModelBadge")}</p>
                            <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] md:text-6xl">{t("pricing.revModelTitle")}</h2>
                            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">{t("pricing.revModelCopy")}</p>
                            <Link to="/economy#how-promorang-earns" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-primary hover:underline">{t("pricing.seeMoneyFlow")} <ArrowRight className="h-4 w-4" /></Link>
                        </div>
                        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
                            {revenueLines.map((line, index) => (
                                <article key={line.key} className="bg-[#111] p-6 md:p-7">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-mono text-xs text-primary">0{index + 1}</span>
                                        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/50">{line.capture}</span>
                                    </div>
                                    <h3 className="mt-8 text-xl font-black">{line.title}</h3>
                                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/35">{t("pricing.paidBy", { payer: line.payer })}</p>
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
                                {t("pricing.payingForTitle")}
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                {t("pricing.payingForCopy")}
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-4">
                            {[
                                [t("pricing.loop1Title"), t("pricing.loop1Desc")],
                                [t("pricing.loop2Title"), t("pricing.loop2Desc")],
                                [t("pricing.loop3Title"), t("pricing.loop3Desc")],
                                [t("pricing.loop4Title"), t("pricing.loop4Desc")],
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
                                <span>{t("pricing.tabBrands")}</span>
                            </TabsTrigger>
                            <TabsTrigger value="merchants" className="flex items-center gap-2">
                                <Store className="w-4 h-4" />
                                <span>{t("pricing.tabMerchants")}</span>
                            </TabsTrigger>
                            <TabsTrigger value="hosts" className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                <span>{t("pricing.tabHosts")}</span>
                            </TabsTrigger>
                            <TabsTrigger value="participants" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{t("pricing.tabParticipants")}</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* BRANDS TAB */}
                        <TabsContent value="brands" className="space-y-12">
                            <div className="text-center mb-12">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    {t("pricing.brandPricingTitle")}
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    {t("pricing.brandPricingCopy")}
                                </p>
                            </div>

                            {/* SKU Grid */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                                {/* Community Moment */}
                                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 mb-4 text-xs font-bold">
                                        {t("pricing.startHere")}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{t("pricing.communityMomentTitle")}</h3>
                                    <div className="text-3xl font-bold text-foreground mb-4">{t("pricing.communityMomentPrice")}</div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        {t("pricing.communityMomentDesc")}
                                    </p>
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("pricing.platformFee")}</span>
                                            <span className="font-medium">$0-$30</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("pricing.rewardPool")}</span>
                                            <span className="font-medium">{t("pricing.optional")}</span>
                                        </div>
                                    </div>
                                    <CommercialCTA variant="outline" className="w-full" to="/auth?mode=signup&role=brand&intent=community_moment&next=/create/campaign" action="select_community_moment" audience="brand" metadata={{ sku: 'A1', price_band: '0-150' }}>{t("pricing.startFree")}</CommercialCTA>
                                </div>

                                {/* Activation Moment */}
                                <div className="bg-card rounded-xl p-6 border-2 border-primary shadow-xl relative">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                            {t("pricing.mostPopular")}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{t("pricing.activationMomentTitle")}</h3>
                                    <div className="text-3xl font-bold text-foreground mb-4">{t("pricing.activationMomentPrice")}</div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        {t("pricing.activationMomentDesc")}
                                    </p>
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("pricing.platformFee")}</span>
                                            <span className="font-medium">$75-$150</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("pricing.rewardPool")}</span>
                                            <span className="font-medium">$150-$500</span>
                                        </div>
                                    </div>
                                    <CommercialCTA variant="hero" className="w-full" to="/auth?mode=signup&role=brand&intent=fund_moment&sku=A2&next=/create/campaign" action="select_activation_moment" audience="brand" metadata={{ sku: 'A2', price_band: '250-750' }}>{t("pricing.fundMoment")}</CommercialCTA>
                                </div>

                                {/* Bounty Moment */}
                                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 mb-4 text-xs font-bold">
                                        {t("pricing.requiresMoment")}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{t("pricing.bountyMomentTitle")}</h3>
                                    <div className="text-3xl font-bold text-foreground mb-4">{t("pricing.bountyMomentPrice")}</div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        {t("pricing.bountyMomentDesc")}
                                    </p>
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("pricing.platformFee")}</span>
                                            <span className="font-medium">15-25%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("pricing.distribution")}</span>
                                            <span className="font-medium">{t("pricing.multiHost")}</span>
                                        </div>
                                    </div>
                                    <CommercialCTA variant="outline" className="w-full" to="/auth?mode=signup&role=brand&intent=fund_bounty&sku=A3&next=/create/campaign" action="select_bounty_moment" audience="brand" metadata={{ sku: 'A3', price_band: '500-2500' }}>{t("pricing.configureBounty")}</CommercialCTA>
                                </div>

                                {/* Digital Moment */}
                                <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]">
                                    <h3 className="text-xl font-bold mb-2 mt-7">{t("pricing.digitalMomentTitle")}</h3>
                                    <div className="text-3xl font-bold text-foreground mb-4">{t("pricing.digitalMomentPrice")}</div>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        {t("pricing.digitalMomentDesc")}
                                    </p>
                                    <div className="space-y-2 text-sm mb-6">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("pricing.platformFee")}</span>
                                            <span className="font-medium">$50-$100</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t("pricing.verification")}</span>
                                            <span className="font-medium">{t("pricing.digitalProof")}</span>
                                        </div>
                                    </div>
                                    <CommercialCTA variant="outline" className="w-full" to="/auth?mode=signup&role=brand&intent=fund_digital&sku=A5&next=/create/campaign" action="select_digital_moment" audience="brand" metadata={{ sku: 'A5', price_band: '150-500' }}>{t("pricing.configureDigital")}</CommercialCTA>
                                </div>
                            </div>

                            {/* Scale Options */}
                            <div className="bg-muted/30 rounded-2xl p-8 mt-12">
                                <h3 className="text-2xl font-bold mb-6">{t("pricing.scalePricingTitle")}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">{t("pricing.bundleTitle")}</h4>
                                            <p className="text-sm text-muted-foreground">{t("pricing.bundleDesc")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Zap className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">{t("pricing.priorityMatchingTitle")}</h4>
                                            <p className="text-sm text-muted-foreground">{t("pricing.priorityMatchingDesc")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">{t("pricing.multiLocationTitle")}</h4>
                                            <p className="text-sm text-muted-foreground">{t("pricing.multiLocationDesc")}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold">{t("pricing.brandStudioTitle")}</h4>
                                        <p className="mt-1 text-sm text-muted-foreground">{t("pricing.brandStudioDesc")}</p>
                                    </div>
                                    <CommercialCTA variant="outline" to="/auth?mode=signup&role=brand&intent=brand_studio&next=/membership/checkout?plan=brand_studio" action="select_brand_studio" audience="brand" metadata={{ plan: 'brand_studio', price: 999 }}>{t("pricing.chooseBrandStudio")}</CommercialCTA>
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
                                    {t("pricing.merchantPricingTitle")}
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    {t("pricing.merchantPricingCopy")}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {/* Free Tier */}
                                <div className="bg-card rounded-xl p-8 border-2 border-primary shadow-xl">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-2">{t("pricing.partnerVenueTitle")}</h3>
                                        <div className="text-4xl font-bold text-foreground mb-2">{t("pricing.partnerVenuePrice")}</div>
                                        <p className="text-sm text-muted-foreground">{t("pricing.foreverFree")}</p>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            t("pricing.partnerVenueFeat1"),
                                            t("pricing.partnerVenueFeat2"),
                                            t("pricing.partnerVenueFeat3"),
                                            t("pricing.partnerVenueFeat4"),
                                            t("pricing.partnerVenueFeat5"),
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <CommercialCTA variant="hero" className="w-full" to="/auth?mode=signup&role=merchant&intent=partner_venue&next=/dashboard/venues/add" action="select_partner_venue" audience="merchant" metadata={{ sku: 'merchant_free' }}>{t("pricing.startFree")}</CommercialCTA>
                                </div>

                                {/* Recurring Tier */}
                                <div className="bg-card rounded-xl p-8 border border-border">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-2">{t("pricing.merchantMomentTitle")}</h3>
                                        <div className="text-4xl font-bold text-foreground mb-2">{t("pricing.merchantMomentPrice")}</div>
                                        <p className="text-sm text-muted-foreground">{t("pricing.perMonth")}</p>
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {[
                                            t("pricing.merchantMomentFeat1"),
                                            t("pricing.merchantMomentFeat2"),
                                            t("pricing.merchantMomentFeat3"),
                                            t("pricing.merchantMomentFeat4"),
                                            t("pricing.merchantMomentFeat5"),
                                        ].map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <CommercialCTA variant="outline" className="w-full" to="/auth?mode=signup&role=merchant&intent=merchant_growth&next=/membership/checkout?plan=merchant_growth" action="select_merchant_plan" audience="merchant" metadata={{ plan: 'merchant_growth', price: 499 }}>{t("pricing.startMerchantGrowth")}</CommercialCTA>
                                </div>
                            </div>
                        </TabsContent>

                        {/* HOSTS TAB */}
                        <TabsContent value="hosts" className="space-y-12">
                            <div className="text-center mb-12">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    {t("pricing.hostPricingTitle")}
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    {t("pricing.hostPricingCopy")}
                                </p>
                            </div>

                            {/* Value Ladder */}
                            <div className="max-w-4xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Free */}
                                    <div className="bg-card rounded-xl p-6 border border-border">
                                        <h3 className="text-xl font-bold mb-4">{t("pricing.startFreeHostTitle")}</h3>
                                        <ul className="space-y-3">
                                            {[
                                                t("pricing.startFreeHostFeat1"),
                                                t("pricing.startFreeHostFeat2"),
                                                t("pricing.startFreeHostFeat3"),
                                                t("pricing.startFreeHostFeat4"),
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
                                        <h3 className="text-xl font-bold mb-4">{t("pricing.earnTrustTitle")}</h3>
                                        <ul className="space-y-3">
                                            {[
                                                t("pricing.earnTrustFeat1"),
                                                t("pricing.earnTrustFeat2"),
                                                t("pricing.earnTrustFeat3"),
                                                t("pricing.earnTrustFeat4"),
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
                                        <h3 className="text-xl font-bold mb-4">{t("pricing.scaleImpactTitle")}</h3>
                                        <ul className="space-y-3">
                                            {[
                                                t("pricing.scaleImpactFeat1"),
                                                t("pricing.scaleImpactFeat2"),
                                                t("pricing.scaleImpactFeat3"),
                                                t("pricing.scaleImpactFeat4"),
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
                                    <h3 className="text-2xl font-bold">{t("pricing.hostProTitle")}</h3>
                                    <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{t("pricing.hostProDesc")}</p>
                                    <CommercialCTA variant="hero" className="mt-6" to="/auth?mode=signup&role=host&intent=host_pro&next=/membership/checkout?plan=host_pro" action="select_host_pro" audience="host" metadata={{ plan: 'host_pro', price: 49 }}>{t("pricing.chooseHostPro")}</CommercialCTA>
                                </div>
                            </div>
                        </TabsContent>

                        {/* PARTICIPANTS TAB */}
                        <TabsContent value="participants" className="space-y-12">
                            <div className="text-center mb-12">
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    {t("pricing.participantPricingTitle")}
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    {t("pricing.participantPricingCopy")}
                                </p>
                            </div>

                            <div className="max-w-4xl mx-auto">
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                                    {[
                                        { tier: 'Free', name: t('pricing.tierFree'), price: '$0', points: '1.0x', keyCost: '100%', description: t('pricing.tierFreeDesc') },
                                        { tier: 'Plus', name: t('pricing.tierPlus'), price: '$9.99/mo', points: '1.25x', keyCost: '90%', description: t('pricing.tierPlusDesc') },
                                        { tier: 'Pro', name: t('pricing.tierPro'), price: '$24.99/mo', points: '1.5x', keyCost: '75%', description: t('pricing.tierProDesc') },
                                        { tier: 'Elite', name: t('pricing.tierElite'), price: '$49.99/mo', points: '2.0x', keyCost: '60%', description: t('pricing.tierEliteDesc') },
                                    ].map((plan) => (
                                        <div key={plan.tier} className="rounded-xl border border-border bg-card p-6">
                                            <h3 className="text-xl font-bold">{plan.name}</h3>
                                            <div className="mt-2 text-3xl font-bold text-foreground">{plan.price}</div>
                                            <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                                            <div className="mt-5 space-y-2 text-sm">
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-muted-foreground">{t("pricing.points")}</span>
                                                    <span className="font-medium">{plan.points}</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-muted-foreground">{t("pricing.keyCost")}</span>
                                                    <span className="font-medium">{plan.keyCost}</span>
                                                </div>
                                            </div>
                                            {plan.tier === 'Free' ? (
                                                <CommercialCTA variant="outline" className="mt-6 w-full" to="/auth?mode=signup&role=participant&intent=free_membership&next=/wallet" action="select_free_membership" audience="participant" metadata={{ plan: 'free' }}>{t("pricing.joinFree")}</CommercialCTA>
                                            ) : (
                                                <CommercialCTA variant={plan.tier === 'Pro' ? 'hero' : 'outline'} className="mt-6 w-full" to={`/auth?mode=signup&role=participant&intent=membership&plan=${plan.tier.toLowerCase()}&next=/membership/checkout?plan=${plan.tier.toLowerCase()}`} action="select_paid_membership" audience="participant" metadata={{ plan: plan.tier.toLowerCase(), price: plan.price }}>{t("pricing.chooseTier", { tier: plan.name })}</CommercialCTA>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 grid gap-6 rounded-xl bg-muted/30 p-8 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold mb-3">{t("pricing.earnActiveStandingTitle")}</h4>
                                        <p className="text-sm leading-7 text-muted-foreground">
                                            {t("pricing.earnActiveStandingDesc")}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-3">{t("pricing.membershipPowersPoolTitle")}</h4>
                                        <p className="text-sm leading-7 text-muted-foreground">
                                            {t("pricing.membershipPowersPoolDesc")}
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
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("pricing.fundedOrderBadge")}</p>
                                <h2 className="mt-4 font-serif text-3xl font-bold md:text-4xl">{t("pricing.fundedOrderTitle")}</h2>
                                <div className="mt-8 space-y-4">
                                    {moneyBoundaries.map((item, index) => <div key={item.label} className="grid grid-cols-[2rem_1fr] gap-4 border-t border-border pt-4 first:border-0 first:pt-0"><span className="font-mono text-xs text-primary">0{index + 1}</span><div><h3 className="font-bold">{item.label}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p></div></div>)}
                                </div>
                            </div>
                            <div className="rounded-3xl border border-border bg-card p-7 md:p-9">
                                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">{t("pricing.conversionPathBadge")}</p>
                                <h2 className="mt-4 font-serif text-3xl font-bold md:text-4xl">{t("pricing.conversionPathTitle")}</h2>
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
                            {t("pricing.readyStartedTitle")}
                        </h2>
                        <p className="text-cream/70 text-lg mb-8">
                            {t("pricing.readyStartedCopy")}
                        </p>
                        <CommercialCTA variant="hero" size="xl" to="/auth?mode=signup&intent=pricing&next=/post-login" action="pricing_primary_cta" audience="participant">
                            {t("pricing.chooseYourRoute")}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </CommercialCTA>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PricingPage;
