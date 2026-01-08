import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import PersonaHero from '@/react-app/components/marketing/PersonaHero';
import CTASection from '@/react-app/components/marketing/CTASection';
import { ShoppingBag, Zap, CreditCard, Box } from 'lucide-react';

export default function ForMerchants() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            <PersonaHero
                headline="Scale Your Direct-to-Consumer Growth"
                subheadline="Integrate with the most powerful creator-driven commerce engine. Turn every creator into your most profitable sales channel."
                ctaText="Register Store"
                ctaLink="/auth"
                stats={[
                    { value: '45%', label: 'Sales Lift' },
                    { value: '1.2s', label: 'API Speed' },
                    { value: '25+', label: 'Integrations' },
                    { value: '24/7', label: 'Support' },
                ]}
                backgroundGradient="from-indigo-600/20 to-teal-600/20"
                icon={<ShoppingBag className="w-10 h-10 text-indigo-500" />}
            />

            {/* Why Join as a Merchant */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            Eliminate <span className="text-indigo-500">Inventory Risk</span>
                        </h2>
                        <p className="text-xl text-pr-text-2">
                            Sell directly through creator storefronts without the overhead of traditional retail.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                problem: "High acquisition costs",
                                solution: "Organic creator-led sales",
                            },
                            {
                                problem: "Manual brand outreach",
                                solution: "Automated creator marketplace",
                            },
                            {
                                problem: "Complex logistics",
                                solution: "Integrated fulfillment options",
                            },
                            {
                                problem: "Slow settlement",
                                solution: "Instant on-chain payments",
                            },
                        ].map((item, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">❌</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">Legacy Retail</div>
                                        <div className="text-sm text-pr-text-2">{item.problem}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">✅</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">Promorang Commerce</div>
                                        <div className="text-sm text-pr-text-2">{item.solution}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Merchant Benefits */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">Merchant Powerhouse</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            Everything you need to run a high-performance creator storefront.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-10 h-10 text-yellow-500" />,
                                title: "Instant Storefronts",
                                description: "Create customized storefronts for your top creators in seconds.",
                            },
                            {
                                icon: <CreditCard className="w-10 h-10 text-emerald-500" />,
                                title: "Fluid Payments",
                                description: "Handle complex commissions and multi-party payouts automatically.",
                            },
                            {
                                icon: <Box className="w-10 h-10 text-blue-500" />,
                                title: "Inventory Sync",
                                description: "Keep your inventory in sync across all creator channels in real-time.",
                            },
                        ].map((benefit, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-indigo-500/50 transition-all">
                                <div className="mb-6 bg-pr-surface-2 w-16 h-16 rounded-2xl flex items-center justify-center">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-pr-text-1 mb-3">{benefit.title}</h3>
                                <p className="text-pr-text-2 mb-6 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-8 bg-pr-surface-card border border-pr-border rounded-3xl text-center">
                        <h3 className="text-xl font-bold mb-8">Works with the platforms you already use</h3>
                        <div className="flex flex-wrap justify-center gap-12 grayscale hover:grayscale-0 transition-all">
                            {[
                                { name: 'Shopify', icon: '🛍️' },
                                { name: 'WooCommerce', icon: '🛒' },
                                { name: 'Etsy', icon: '🧶' },
                                { name: 'BigCommerce', icon: '📦' }
                            ].map((p) => (
                                <div key={p.name} className="flex items-center gap-3">
                                    <span className="text-2xl">{p.icon}</span>
                                    <span className="font-bold text-pr-text-muted">{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Your Storefront, Amplified"
                subheadline="Bring your products to where the attention is. Join the Promorang Merchant Network."
                ctaText="Get Started"
                ctaLink="/auth"
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
