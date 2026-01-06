import { useTranslation } from 'react-i18next';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import PersonaHero from '@/react-app/components/marketing/PersonaHero';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Layers, Zap, Settings, BarChart } from 'lucide-react';

export default function ForOperators() {
    const { t } = useTranslation('marketing');

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            <PersonaHero
                headline={t('operators.hero.headline')}
                subheadline={t('operators.hero.subheadline')}
                ctaText={t('operators.hero.cta')}
                ctaLink="/auth"
                stats={[
                    { value: '10x', label: t('operators.hero.stats.engagement') },
                    { value: '30%', label: t('operators.hero.stats.retentionLift') },
                    { value: '10min', label: t('operators.hero.stats.integration') },
                    { value: '50/50', label: t('operators.hero.stats.revShare') },
                ]}
                backgroundGradient="from-orange-600/20 to-red-600/20"
                icon={<Layers className="w-10 h-10 text-orange-500" />}
            />

            {/* Pain Points */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
                            {t('operators.painPoints.headline').split('<highlight>')[0]}
                            <span className="text-red-500">
                                {t('operators.painPoints.headline').split('<highlight>')[1]?.split('</highlight>')[0]}
                            </span>
                            {t('operators.painPoints.headline').split('</highlight>')[1]}
                        </h2>
                        <p className="text-xl text-pr-text-2">
                            {t('operators.painPoints.subheadline')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                problem: t('operators.painPoints.problems.devTime'),
                                solution: t('operators.painPoints.solutions.plugAndPlay'),
                            },
                            {
                                problem: t('operators.painPoints.problems.highChurn'),
                                solution: t('operators.painPoints.solutions.gamifiedRetention'),
                            },
                            {
                                problem: t('operators.painPoints.problems.hardToMonetize'),
                                solution: t('operators.painPoints.solutions.builtInRevenue'),
                            },
                            {
                                problem: t('operators.painPoints.problems.siloedData'),
                                solution: t('operators.painPoints.solutions.unifiedAnalytics'),
                            },
                        ].map((item, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">❌</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">{t('operators.painPoints.oldWay')}</div>
                                        <div className="text-sm text-pr-text-2">{item.problem}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl">✅</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">{t('operators.painPoints.promorangWay')}</div>
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
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">{t('operators.benefits.headline')}</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-10 h-10 text-orange-500" />,
                                title: t('operators.benefits.instantIntegration.title'),
                                description: t('operators.benefits.instantIntegration.description'),
                            },
                            {
                                icon: <Settings className="w-10 h-10 text-gray-500" />,
                                title: t('operators.benefits.fullyCustomizable.title'),
                                description: t('operators.benefits.fullyCustomizable.description'),
                            },
                            {
                                icon: <BarChart className="w-10 h-10 text-blue-500" />,
                                title: t('operators.benefits.newRevenue.title'),
                                description: t('operators.benefits.newRevenue.description'),
                            },
                        ].map((benefit, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-orange-500/50 transition-all">
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
                headline={t('operators.cta.headline')}
                subheadline={t('operators.cta.subheadline')}
                ctaText={t('operators.cta.button')}
                ctaLink="/auth"
                backgroundStyle="gradient"
            />

            <MarketingFooter />
        </div>
    );
}
