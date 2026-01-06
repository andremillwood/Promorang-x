import { useTranslation } from 'react-i18next';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import CTASection from '@/react-app/components/marketing/CTASection';
import { Sparkles, Target, Users, TrendingUp } from 'lucide-react';

export default function About() {
    const { t } = useTranslation('marketing');

    const values = [
        {
            icon: <Sparkles className="w-8 h-8 text-blue-500" />,
            title: t('about.values.tasteOverFollowers.title'),
            description: t('about.values.tasteOverFollowers.description'),
        },
        {
            icon: <Target className="w-8 h-8 text-purple-500" />,
            title: t('about.values.equityForAll.title'),
            description: t('about.values.equityForAll.description'),
        },
        {
            icon: <Users className="w-8 h-8 text-green-500" />,
            title: t('about.values.transparencyFirst.title'),
            description: t('about.values.transparencyFirst.description'),
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
            title: t('about.values.longTermThinking.title'),
            description: t('about.values.longTermThinking.description'),
        },
    ];

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <MarketingNav />

            {/* Hero */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-pr-surface-background">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
                        {t('about.hero.headline').split('<highlight>')[0]}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                            {t('about.hero.headline').split('<highlight>')[1]?.split('</highlight>')[0]}
                        </span>
                        {t('about.hero.headline').split('</highlight>')[1]}
                    </h1>
                    <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto leading-relaxed">
                        {t('about.hero.subheadline')}
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">{t('about.mission.title')}</h2>
                        <p className="text-xl text-pr-text-2 leading-relaxed">
                            {t('about.mission.description')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-pr-text-1 mb-4">{t('about.mission.problemTitle')}</h3>
                            <p className="text-lg text-pr-text-2 mb-6 leading-relaxed">
                                {t('about.mission.problemText1')}
                            </p>
                            <p className="text-lg text-pr-text-2 leading-relaxed">
                                {t('about.mission.problemText2')}
                            </p>
                        </div>
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl p-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">❌</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">{t('about.mission.traditional')}</div>
                                        <div className="text-sm text-pr-text-2">{t('about.mission.traditionalDesc')}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1 mb-1">{t('about.mission.promorang')}</div>
                                        <div className="text-sm text-pr-text-2">{t('about.mission.promorangDesc')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">{t('about.values.title')}</h2>
                        <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
                            {t('about.values.subtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-blue-500/50 transition-all">
                                <div className="mb-6 bg-pr-surface-2 w-16 h-16 rounded-2xl flex items-center justify-center">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-pr-text-1 mb-3">{value.title}</h3>
                                <p className="text-pr-text-2 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-24 bg-pr-surface-1">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-8 text-center">{t('about.story.title')}</h2>
                    <div className="prose prose-lg max-w-none text-pr-text-2">
                        <p className="text-xl leading-relaxed mb-6">
                            {t('about.story.text1')}
                        </p>
                        <p className="text-lg leading-relaxed mb-6">
                            {t('about.story.text2')}
                        </p>
                        <p className="text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: t('about.story.text3') }} />
                        <p className="text-lg leading-relaxed">
                            {t('about.story.text4')}
                        </p>
                    </div>
                </div>
            </section>

            <CTASection
                headline={t('about.cta.headline')}
                subheadline={t('about.cta.subheadline')}
                ctaText={t('about.cta.button')}
                ctaLink="/auth"
                secondaryCta={{ text: t('about.cta.secondary'), link: '/how-it-works' }}
            />

            <MarketingFooter />
        </div>
    );
}
