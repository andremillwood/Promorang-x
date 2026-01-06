import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  ArrowRight,
  Star,
  TrendingUp,
  Zap,
  Sparkles,
  Share2,
  RefreshCw
} from 'lucide-react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';

// Components
import { Button } from '../../components/ui/button';

// Types
type StatsData = {
  earners: number;
  payout: number;
  earnings: number;
  activeCampaigns: number;
  totalPayouts: number;
};

// Mock data fetch functions
const fetchStats = async (): Promise<StatsData> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    earners: 127 + Math.floor(Math.random() * 50),
    payout: 0.3 + Math.random() * 0.5,
    earnings: 12 + Math.floor(Math.random() * 10),
    activeCampaigns: 24 + Math.floor(Math.random() * 10),
    totalPayouts: 125000 + Math.floor(Math.random() * 50000)
  };
};

// Persuasion Architecture Components

// 1. The "Grand Slam" Hero Section
const HeroSection = ({ activeStats, user, navigate, handleDemoLogin, demoLoginState }: any) => {
  const { t } = useTranslation('marketing');

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-pr-surface-background">
      {/* Dynamic Background - "Alchemy" Vibe */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Scarcity/Status Signal (Priestley) */}
        <div className="inline-flex items-center gap-2 bg-pr-surface-card/80 backdrop-blur-md border border-pr-border px-4 py-2 rounded-full mb-8 animate-fade-in-up">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-pr-text-1">
            <Trans
              i18nKey="home.hero.statusSignal"
              t={t}
              values={{ count: activeStats.earners.toLocaleString() }}
              components={{ bold: <span className="font-bold text-green-500" /> }}
            />
          </span>
        </div>

        {/* The Hook (Brunson) & Reframing (Sutherland) */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-pr-text-1 tracking-tight mb-6 leading-tight">
          <Trans
            i18nKey="home.hero.headline"
            t={t}
            components={{
              highlight: <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500" />,
              highlight2: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500" />,
              br: <br />
            }}
          />
        </h1>

        <p className="text-xl md:text-2xl text-pr-text-2 max-w-3xl mx-auto mb-10 leading-relaxed">
          <Trans
            i18nKey="home.hero.subheadline"
            t={t}
            components={{ bold: <span className="font-bold text-pr-text-1" /> }}
          />
        </p>

        {/* The Grand Slam Offer (Hormozi) */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          {user ? (
            <Button
              onClick={() => navigate('/dashboard')}
              variant="primary"
              size="lg"
              className="text-lg px-12 py-6 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all"
              rightIcon={<ArrowRight className="w-6 h-6" />}
            >
              {t('home.hero.dashboardBtn')}
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/auth')}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-lg px-12 py-6 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 animate-gradient"
                rightIcon={<ArrowRight className="w-6 h-6" />}
              >
                {t('home.hero.ctaBtn')}
              </Button>
              <p className="text-sm text-pr-text-2">
                <span className="text-green-500 font-bold">✓</span> {t('home.hero.benefits.noCreditCard')} •
                <span className="text-green-500 font-bold ml-2">✓</span> {t('home.hero.benefits.setupTime')} •
                <span className="text-green-500 font-bold ml-2">✓</span> {t('home.hero.benefits.keepFirst')}
              </p>
            </div>
          )}
        </div>

        {/* Demo "Risk Reversal" */}
        {!user && (
          <div className="animate-fade-in-up delay-200">
            <p className="text-sm text-pr-text-2 mb-4 font-medium uppercase tracking-wider opacity-70">{t('home.hero.riskReversal')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => handleDemoLogin('creator')}
                disabled={demoLoginState.loading === 'creator'}
                className="px-6 py-2 rounded-full bg-pr-surface-2 hover:bg-pr-surface-3 border border-pr-border text-pr-text-1 text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
              >
                {demoLoginState.loading === 'creator' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-yellow-500" />}
                {t('home.hero.creatorDemo')}
              </button>
              <button
                onClick={() => handleDemoLogin('investor')}
                disabled={demoLoginState.loading === 'investor'}
                className="px-6 py-2 rounded-full bg-pr-surface-2 hover:bg-pr-surface-3 border border-pr-border text-pr-text-1 text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
              >
                {demoLoginState.loading === 'investor' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 text-green-500" />}
                {t('home.hero.investorDemo')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// 2. The "Life-Force 8" Problem Agitation (Cashvertising)
const ProblemSection = () => {
  const { t } = useTranslation('marketing');

  return (
    <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6 leading-tight">
              <Trans
                i18nKey="home.problem.headline"
                t={t}
                components={{
                  br: <br />,
                  highlight: <span className="text-red-500" />
                }}
              />
            </h2>
            <div className="space-y-6 text-lg text-pr-text-2">
              <p>
                <Trans
                  i18nKey="home.problem.trap"
                  t={t}
                  components={{ bold: <span className="font-bold text-pr-text-1" /> }}
                />
              </p>
              <p>
                <Trans
                  i18nKey="home.problem.reality"
                  t={t}
                  components={{ bold: <span className="font-bold text-pr-text-1" /> }}
                />
              </p>
              <p>
                <Trans
                  i18nKey="home.problem.cost"
                  t={t}
                  components={{ bold: <span className="font-bold text-pr-text-1" /> }}
                />
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="text-red-500 font-bold mb-1">{t('home.problem.oldWay.title')}</div>
                <div className="text-sm text-pr-text-2">{t('home.problem.oldWay.desc')}</div>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="text-green-500 font-bold mb-1">{t('home.problem.promorangWay.title')}</div>
                <div className="text-sm text-pr-text-2">{t('home.problem.promorangWay.desc')}</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-3xl rounded-full" />
            <div className="relative bg-pr-surface-card border border-pr-border rounded-2xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-pr-border pb-4">
                <div className="font-bold text-pr-text-1">{t('home.problem.statement.title')}</div>
                <div className="text-sm text-pr-text-2">{t('home.problem.statement.subtitle')}</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center opacity-50">
                  <span>{t('home.problem.statement.instagram')}</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="flex justify-between items-center opacity-50">
                  <span>{t('home.problem.statement.tiktok')}</span>
                  <span className="font-mono">$12.43</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-green-500 pt-4 border-t border-pr-border">
                  <span>{t('home.problem.statement.promorang')}</span>
                  <span className="font-mono">$1,247.50</span>
                </div>
                <div className="text-xs text-center text-pr-text-2 mt-4">
                  {t('home.problem.statement.disclaimer')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 3. The "Funnel" Narrative (Brunson) - Hook, Story, Offer
const SolutionSection = () => {
  const { t } = useTranslation('marketing');

  return (
    <section className="py-24 bg-pr-surface-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
            {t('home.solution.headline')}
          </h2>
          <p className="text-xl text-pr-text-2">
            <Trans
              i18nKey="home.solution.subheadline"
              t={t}
              components={{ bold: <span className="font-bold text-pr-text-1" /> }}
            />
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Sparkles className="w-10 h-10 text-blue-500" />,
              title: t('home.solution.steps.0.title'),
              desc: t('home.solution.steps.0.desc'),
              stat: t('home.solution.steps.0.stat')
            },
            {
              icon: <Share2 className="w-10 h-10 text-purple-500" />,
              title: t('home.solution.steps.1.title'),
              desc: t('home.solution.steps.1.desc'),
              stat: t('home.solution.steps.1.stat')
            },
            {
              icon: <TrendingUp className="w-10 h-10 text-green-500" />,
              title: t('home.solution.steps.2.title'),
              desc: t('home.solution.steps.2.desc'),
              stat: t('home.solution.steps.2.stat')
            }
          ].map((step, i) => (
            <div key={i} className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-blue-500/50 transition-all group">
              <div className="mb-6 bg-pr-surface-2 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-pr-text-1 mb-3">{step.title}</h3>
              <p className="text-pr-text-2 mb-6 leading-relaxed">{step.desc}</p>
              <div className="bg-pr-surface-2 px-4 py-2 rounded-lg text-sm font-mono text-pr-text-1 inline-block">
                {step.stat}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. "Oversubscribed" Social Proof (Priestley)
const SocialProofSection = ({ activeStats }: any) => {
  const { t } = useTranslation('marketing');

  return (
    <section className="py-20 bg-gradient-to-b from-pr-surface-1 to-pr-surface-background border-t border-pr-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-pr-text-1 mb-12">
          <Trans
            i18nKey="home.socialProof.headline"
            t={t}
            components={{ highlight: <span className="text-blue-500" /> }}
          />
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="p-6">
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
              ${activeStats.totalPayouts.toLocaleString()}
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{t('home.socialProof.stats.paidToCreators')}</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-extrabold text-pr-text-1 mb-2">
              {activeStats.earners.toLocaleString()}
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{t('home.socialProof.stats.activeEarners')}</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-extrabold text-green-500 mb-2">
              12.5%
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{t('home.socialProof.stats.growth')}</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-extrabold text-orange-500 mb-2">
              0
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">{t('home.socialProof.stats.followersNeeded')}</div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-pr-surface-card border border-pr-border rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-medium text-pr-text-1 mb-8 leading-relaxed">
              <Trans
                i18nKey="home.socialProof.testimonial.quote"
                t={t}
                components={{ highlight: <span className="text-blue-500 font-bold" /> }}
              />
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`} alt="User" />
              </div>
              <div className="text-left">
                <div className="font-bold text-pr-text-1">{t('home.socialProof.testimonial.author')}</div>
                <div className="text-sm text-pr-text-2">{t('home.socialProof.testimonial.role')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 5. Final CTA - The "No Brainer"
const FinalCTA = ({ navigate, user }: any) => {
  const { t } = useTranslation('marketing');

  return (
    <section className="py-24 bg-pr-surface-background relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600/5" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-pr-text-1 mb-8">
          {t('home.finalCta.headline')}
        </h2>
        <p className="text-xl text-pr-text-2 mb-10 max-w-2xl mx-auto">
          {t('home.finalCta.subheadline')}
        </p>

        <div className="flex flex-col items-center gap-6">
          <Button
            onClick={() => navigate(user ? '/dashboard' : '/auth')}
            variant="primary"
            size="lg"
            className="text-xl px-16 py-6 shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-1 transition-all w-full sm:w-auto"
          >
            {user ? t('home.finalCta.dashboardBtn') : t('home.finalCta.ctaBtn')}
          </Button>
          <p className="text-sm text-pr-text-2 opacity-70">
            {t('home.finalCta.socialProof', { count: '3,482' })}
          </p>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const { t } = useTranslation('marketing');
  const { user, signIn, signOut: logout } = useAuth();
  const navigate = useNavigate();
  const [activeStats, setActiveStats] = useState<StatsData>({
    earners: 0,
    payout: 0,
    earnings: 0,
    activeCampaigns: 0,
    totalPayouts: 0
  });

  // Fetch stats data with loading and error states
  const {
    data: stats,
    execute: refetchStats
  } = useAsyncData(fetchStats, null, true);

  // Animate stats counter when data loads
  useEffect(() => {
    if (stats) {
      setActiveStats(stats);
    }
  }, [stats]);

  useEffect(() => {
    if (!stats) return;

    const interval = setInterval(() => {
      refetchStats().catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, [stats, refetchStats]);

  // Demo login state and handlers
  const [demoLoginState, setDemoLoginState] = useState<{
    loading: string | null;
  }>({
    loading: null,
  });

  // Handle demo login with loading state
  const handleDemoLogin = useCallback(async (type: 'creator' | 'investor' | 'advertiser') => {
    try {
      setDemoLoginState({ loading: type });
      const email = `${type}@demo.com`;
      const response = await signIn(email, 'demo123');

      if (response.error) {
        console.error('Demo login failed:', response.error);
      }
    } catch (error) {
      console.error('Demo login failed:', error);
    } finally {
      setDemoLoginState({ loading: null });
    }
  }, [signIn]);

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-background font-sans selection:bg-blue-500/30">
      <MarketingNav />

      <HeroSection
        activeStats={activeStats}
        user={user}
        navigate={navigate}
        handleDemoLogin={handleDemoLogin}
        demoLoginState={demoLoginState}
      />

      <ProblemSection />

      <SolutionSection />

      <SocialProofSection activeStats={activeStats} />

      <FinalCTA navigate={navigate} user={user} />

      {/* Trust Footer */}
      <footer className="bg-pr-surface-background border-t border-pr-border py-12 text-center text-pr-text-2 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-8 mb-8 opacity-50 grayscale hover:grayscale-0 transition-all">
            {/* Platform Logos (Text for now) */}
            <span>Instagram</span>
            <span>TikTok</span>
            <span>YouTube</span>
            <span>Shopify</span>
          </div>
          <p>{t('home.footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
