import { useTranslation } from 'react-i18next';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import PersonaHero from '@/react-app/components/marketing/PersonaHero';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Target, Zap, Users, TrendingUp } from 'lucide-react';

export default function ForAdvertisers() {
    const { t } = useTranslation('marketing');

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            <PersonaHero
                headline={t('advertisers.hero.headline')}
                subheadline={t('advertisers.hero.subheadline')}
                ctaText={t('advertisers.hero.cta')}
                ctaLink="/auth"
                stats={[
                    { value: '3.5x', label: t('advertisers.hero.stats.roi') },
                    { value: '100%', label: t('advertisers.hero.stats.verified') },
                    { value: '0', label: t('advertisers.hero.stats.upfrontFees') },
                    { value: '24h', label: t('advertisers.hero.stats.launchTime') },
                ]}
                backgroundGradient="from-purple-600/20 to-pink-600/20"
                icon={<Target className="w-10 h-10 text-purple-500" />}
            />

            {/* Pain Points */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            {t('advertisers.painPoints.headline').split('<highlight>')[0]}
                            <span className="text-red-500">
                                {t('advertisers.painPoints.headline').split('<highlight>')[1]?.split('</highlight>')[0]}
                            </span>
                            {t('advertisers.painPoints.headline').split('</highlight>')[1]}
                        </h2>
                        <p className="text-xl text-pr-text-2">
                            {t('advertisers.painPoints.subheadline')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                problem: t('advertisers.painPoints.problems.adBlindness'),
                                solution: t('advertisers.painPoints.solutions.authenticContent'),
                            },
                            {
                                problem: t('advertisers.painPoints.problems.unpredictableCAC'),
                                solution: t('advertisers.painPoints.solutions.performancePricing'),
                            },
                            {
                                problem: t('advertisers.painPoints.problems.lowTrust'),
                                solution: t('advertisers.painPoints.solutions.highTrust'),
                            },
                            {
                                problem: t('advertisers.painPoints.problems.complexAttribution'),
                                solution: t('advertisers.painPoints.solutions.directROI'),
                            },
                        ].map((item, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">❌</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">{t('advertisers.painPoints.oldWay')}</div>
                                        <div className="text-sm text-pr-text-2">{item.problem}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">✅</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">{t('advertisers.painPoints.promorangWay')}</div>
                                        <div className="text-sm text-pr-text-2">{item.solution}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">{t('advertisers.benefits.headline')}</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            {t('advertisers.benefits.subheadline')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users className="w-10 h-10 text-blue-500" />,
                                title: t('advertisers.benefits.vettedCreators.title'),
                                description: t('advertisers.benefits.vettedCreators.description'),
                            },
                            {
                                icon: <Zap className="w-10 h-10 text-yellow-500" />,
                                title: t('advertisers.benefits.instantScale.title'),
                                description: t('advertisers.benefits.instantScale.description'),
                            },
                            {
                                icon: <TrendingUp className="w-10 h-10 text-green-500" />,
                                title: t('advertisers.benefits.equityAligned.title'),
                                description: t('advertisers.benefits.equityAligned.description'),
                            },
                        ].map((benefit, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                                <div className="mb-6 bg-pr-surface-2 w-16 h-16 rounded-2xl flex items-center justify-center">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-pr-text-1 mb-3">{benefit.title}</h3>
                                <p className="text-pr-text-2 mb-6 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CTASection
                headline={t('advertisers.cta.headline')}
                subheadline={t('advertisers.cta.subheadline')}
                ctaText={t('advertisers.cta.button')}
                ctaLink="/auth"
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
