import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Tag, BarChart3, Users, Settings, CheckCircle, ArrowRight, Zap, Shield, QrCode } from 'lucide-react';

export default function CouponsForMerchantsPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Coupons for Merchants - Drive Traffic & Sales"
                description="Create and distribute digital coupons to attract customers. Track redemptions in real-time. No printing costs, no fraud."
                keywords="merchant coupons, digital coupons, coupon creation, promorang merchants"
                canonicalUrl="https://promorang.co/coupons-for-merchants"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-teal-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-full mb-8">
                        <Tag className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-400">FOR MERCHANTS</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Coupons That <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Convert</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10">
                        Create digital coupons in minutes. <strong className="text-emerald-400">Track every redemption</strong>. No printing, no fraud, no hassle.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/advertiser/coupons" className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl flex items-center gap-2">
                            Create Coupons <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href="/advertiser-pricing" className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-2 transition-all">
                            View Pricing
                        </a>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        Why Digital <span className="text-emerald-500">Coupons</span>?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track views, claims, and redemptions as they happen. Know your ROI instantly.', color: 'text-blue-500', bg: 'bg-blue-500/20' },
                            { icon: Shield, title: 'Fraud Prevention', desc: 'Each coupon is unique and verified. No duplicating, no sharing codes.', color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
                            { icon: Zap, title: 'Instant Distribution', desc: 'Reach thousands of users immediately through Promorang\'s network.', color: 'text-orange-500', bg: 'bg-orange-500/20' },
                        ].map((item, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                                <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-6`}>
                                    <item.icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{item.title}</h3>
                                <p className="text-pr-text-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        How to <span className="text-emerald-500">Create</span> Coupons
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '1', icon: Settings, title: 'Configure', desc: 'Set discount type, amount, and terms' },
                            { step: '2', icon: Users, title: 'Target', desc: 'Choose your audience or go public' },
                            { step: '3', icon: Zap, title: 'Launch', desc: 'Publish and reach users instantly' },
                            { step: '4', icon: BarChart3, title: 'Track', desc: 'Monitor redemptions and ROI' },
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">{item.step}</div>
                                <item.icon className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                                <h3 className="font-bold text-pr-text-1 mb-2">{item.title}</h3>
                                <p className="text-sm text-pr-text-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-12 text-center">Powerful Features</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Bulk Creation', desc: 'Create hundreds of unique codes at once' },
                            { title: 'Usage Limits', desc: 'Set per-user and total redemption limits' },
                            { title: 'Expiration Dates', desc: 'Create urgency with time-limited offers' },
                            { title: 'QR Codes', desc: 'Auto-generated QR for easy in-store scanning' },
                            { title: 'Min. Purchase', desc: 'Require minimum spend to redeem' },
                            { title: 'Category Targeting', desc: 'Limit to specific products or categories' },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-pr-surface-card border border-pr-border rounded-xl">
                                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-pr-text-1 mb-1">{feature.title}</h3>
                                    <p className="text-sm text-pr-text-2">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Redemption */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">
                                Easy <span className="text-emerald-500">Redemption</span>
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-6">
                                Customers redeem coupons digitally — in your online store or by showing a QR code in person.
                            </p>
                            <ul className="space-y-3">
                                {['Auto-applied at marketplace checkout', 'QR code scanning for in-store', 'Real-time verification', 'Instant confirmation for both parties'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        <span className="text-pr-text-1">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-pr-surface-card border border-emerald-500/30 rounded-2xl p-8 text-center">
                            <QrCode className="w-24 h-24 text-emerald-500 mx-auto mb-4" />
                            <h3 className="font-bold text-pr-text-1 mb-2">Scan to Redeem</h3>
                            <p className="text-sm text-pr-text-2">Each coupon gets a unique QR code for easy in-store redemption</p>
                        </div>
                    </div>
                </div>
            </section>

            <CTASection
                headline="Ready to drive sales with coupons?"
                subheadline="Create your first digital coupon in minutes."
                ctaText="Create Coupons"
                ctaLink="/advertiser/coupons"
                secondaryCta={{ text: "View Pricing", link: "/advertiser-pricing" }}
                backgroundStyle="gradient"
            />
            <MarketingFooter />
        </div>
    );
}
