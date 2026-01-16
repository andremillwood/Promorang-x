import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import SEO from '@/react-app/components/SEO';
import { Tag, Gift, Percent, Search, ShoppingBag, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function CouponsForShoppersPage() {
    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title="Coupons for Shoppers - Save on Every Purchase"
                description="Find exclusive coupons and discounts from your favorite brands. Stack deals with Promo Points for maximum savings."
                keywords="coupons, discounts, deals, savings, promorang coupons, shopper deals"
                canonicalUrl="https://promorang.co/coupons-for-shoppers"
            />
            <MarketingNav />

            {/* Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-pink-600/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-rose-600/20 rounded-full blur-[120px]" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 px-4 py-2 rounded-full mb-8">
                        <Tag className="w-5 h-5 text-pink-500" />
                        <span className="text-sm font-bold text-pink-400">EXCLUSIVE DEALS</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6">
                        Save More. <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Shop Smarter.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10">
                        Discover exclusive coupons from brands you love. Stack with <strong className="text-pink-400">Promo Points</strong> for even bigger savings.
                    </p>
                    <a href="/coupons" className="inline-flex px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-xl items-center gap-2">
                        Browse Coupons <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        How <span className="text-pink-500">Coupons</span> Work
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '1', icon: Search, title: 'Browse', desc: 'Explore coupons by category or brand' },
                            { step: '2', icon: Tag, title: 'Claim', desc: 'Save coupons to your wallet' },
                            { step: '3', icon: ShoppingBag, title: 'Shop', desc: 'Apply at checkout in marketplace or in-store' },
                            { step: '4', icon: Gift, title: 'Save', desc: 'Enjoy your discount instantly' },
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-4">{item.step}</div>
                                <item.icon className="w-10 h-10 text-pink-500 mx-auto mb-4" />
                                <h3 className="font-bold text-pr-text-1 mb-2">{item.title}</h3>
                                <p className="text-sm text-pr-text-2">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coupon Types */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-16 text-center">
                        Types of <span className="text-pink-500">Deals</span>
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Percent, title: 'Percentage Off', desc: 'Save 10%, 20%, 50% or more on select items', example: '25% off all sneakers', color: 'text-green-500', bg: 'bg-green-500/20' },
                            { icon: Tag, title: 'Fixed Amount', desc: 'Get a set dollar amount off your purchase', example: '$10 off orders over $50', color: 'text-blue-500', bg: 'bg-blue-500/20' },
                            { icon: Gift, title: 'Free Items', desc: 'Get free products, shipping, or extras', example: 'Free dessert with entrée', color: 'text-purple-500', bg: 'bg-purple-500/20' },
                        ].map((type, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                                <div className={`w-14 h-14 ${type.bg} rounded-xl flex items-center justify-center mb-6`}>
                                    <type.icon className={`w-7 h-7 ${type.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{type.title}</h3>
                                <p className="text-pr-text-2 mb-4">{type.desc}</p>
                                <div className="p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-sm text-pr-text-muted">Example: </span>
                                    <span className={`text-sm font-medium ${type.color}`}>{type.example}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stack with Promo Points */}
            <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full mb-4">
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs font-bold text-yellow-400">PRO TIP</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">
                                Stack Coupons with <span className="text-yellow-500">Promo Points</span>
                            </h2>
                            <p className="text-xl text-pr-text-2 mb-6">
                                Use your earned Promo Points on top of coupons for maximum savings. The more active you are on Promorang, the more you save.
                            </p>
                            <ul className="space-y-3">
                                {['Earn PP from Drops and shares', 'Apply PP at checkout', 'Combine with any coupon'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-yellow-500" />
                                        <span className="text-pr-text-1">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-pr-surface-card border border-yellow-500/30 rounded-2xl p-8">
                            <h3 className="font-bold text-pr-text-1 mb-6 text-center">Stacking Example</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between p-3 bg-pr-surface-2 rounded-lg">
                                    <span className="text-pr-text-2">Original Price</span>
                                    <span className="text-pr-text-1">$100.00</span>
                                </div>
                                <div className="flex justify-between p-3 bg-pink-500/10 rounded-lg">
                                    <span className="text-pink-400">25% Coupon</span>
                                    <span className="text-pink-400">-$25.00</span>
                                </div>
                                <div className="flex justify-between p-3 bg-yellow-500/10 rounded-lg">
                                    <span className="text-yellow-400">500 Promo Points</span>
                                    <span className="text-yellow-400">-$5.00</span>
                                </div>
                                <div className="flex justify-between p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                                    <span className="font-bold text-green-400">You Pay</span>
                                    <span className="text-2xl font-bold text-green-400">$70.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Where to Use */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6">Where to Use Coupons</h2>
                    <p className="text-xl text-pr-text-2 mb-12">Redeem your coupons in multiple ways</p>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { icon: ShoppingBag, title: 'Promorang Marketplace', desc: 'Apply directly at checkout when shopping in our marketplace' },
                            { icon: Tag, title: 'Partner Stores', desc: 'Show your code at participating merchants for in-store discounts' },
                        ].map((option, i) => (
                            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <option.icon className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                                <h3 className="font-bold text-pr-text-1 mb-2">{option.title}</h3>
                                <p className="text-sm text-pr-text-2">{option.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline="Start saving today"
                subheadline="Browse exclusive coupons and discounts from top brands."
                ctaText="Browse Coupons"
                ctaLink="/coupons"
                secondaryCta={{ text: "For Merchants", link: "/coupons-for-merchants" }}
                backgroundStyle="gradient"
            />
            <MarketingFooter />
        </div>
    );
}
