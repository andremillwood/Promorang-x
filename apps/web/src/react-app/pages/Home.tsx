import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Zap,
  ShoppingBag,
  Target,
  Sparkles,
  Store,
  Loader2,
  RefreshCw,
  Share2,
  Star,
  Users,
  CheckCircle,
  BarChart3,
  Globe,
  Shield,
  Clock,
  Layout,
  MousePointer2,
  Smartphone,
  Check
} from 'lucide-react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import EarningsCalculator from '@/react-app/components/marketing/EarningsCalculator';
import SEO from '@/react-app/components/SEO';
import FeaturedDropsSection from '@/react-app/components/marketing/FeaturedDropsSection';
import MarketplacePreviewSection from '@/react-app/components/marketing/MarketplacePreviewSection';
import TrendingContentSection from '@/react-app/components/marketing/TrendingContentSection';
import ForecastsPreviewSection from '@/react-app/components/marketing/ForecastsPreviewSection';
import HeroBentoGrid from '@/react-app/components/marketing/HeroBentoGrid';
import PlatformTicker from '@/react-app/components/marketing/PlatformTicker';
import PersonaSwitcher, { type PersonaType } from '@/react-app/components/marketing/PersonaSwitcher';
import PublicSearch from '@/react-app/components/marketing/PublicSearch';

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
const HeroSection = ({ activeStats, user, navigate, handleDemoLogin, demoLoginState, activePersona, onPersonaChange }: any) => {
  const personaCopy = {
    creator: {
      title: "Monetize Your Influence",
      highlight: "Creators",
      sub: "Turn your audience into revenue by participating in high-engagement Drops and viral campaigns."
    },
    investor: {
      title: "Invest in Viral",
      highlight: "Performance",
      sub: "Trade social capital, manage content portfolios, and predict viral trends for maximum returns."
    },
    merchant: {
      title: "Scale Your Brand",
      highlight: "ROI",
      sub: "Deploy word-of-mouth campaigns at scale and track every share with precision analytics."
    },
    shopper: {
      title: "Shop with",
      highlight: "Rewards",
      sub: "Earn points through engagement and redeem them for exclusive deals and partner coupons."
    }
  };

  const copy = personaCopy[activePersona as keyof typeof personaCopy] || personaCopy.creator;

  return (
    <section className="relative min-h-[100vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-pr-surface-background pt-20">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Messaging & Funnels */}
          <div className="max-w-2xl text-center lg:text-left">
            <PersonaSwitcher activePersona={activePersona} onPersonaChange={onPersonaChange} />

            <h1 className="text-5xl lg:text-7xl font-black text-pr-text-1 tracking-tight mb-6 leading-[1.1] animate-in fade-in slide-in-from-left duration-700">
              {copy.title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient bg-size-200">
                {copy.highlight}
              </span>
            </h1>

            <p className="text-xl text-pr-text-muted mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-left duration-700 delay-200">
              {copy.sub}
            </p>

            <div className="mb-10 animate-in fade-in slide-in-from-left duration-700 delay-300">
              <PublicSearch />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-left duration-700 delay-400">
              {!user ? (
                <>
                  <button
                    onClick={() => navigate('/explore')}
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      EXPLORE ECOSYSTEM <Globe className="w-5 h-5 flex-shrink-0" />
                    </span>
                  </button>
                  <button
                    onClick={() => handleDemoLogin(activePersona)}
                    disabled={demoLoginState.loading}
                    className="px-8 py-4 bg-pr-surface-card border border-pr-border text-pr-text-1 rounded-2xl font-extrabold hover:bg-pr-surface-2 transition-all hover:border-blue-500/50 flex items-center justify-center gap-2 group/demo"
                  >
                    {demoLoginState.loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Layout className="w-5 h-5 text-pr-text-muted group-hover/demo:text-blue-500 transition-colors" />
                    )}
                    <span>TRY AS {activePersona.toUpperCase()}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black shadow-2xl hover:shadow-blue-500/40 transition-all hover:scale-105 flex items-center gap-3"
                >
                  GO TO DASHBOARD <ArrowRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {demoLoginState.error && (
              <p className="mt-4 text-red-500 text-sm font-medium animate-bounce">
                {demoLoginState.error}
              </p>
            )}
          </div>

          {/* Right Column: Platform Showcase (Bento Grid) */}
          <div className="relative mt-8 lg:mt-0 animate-in fade-in slide-in-from-right duration-1000">
            <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full" />
            <div className="relative">
              <HeroBentoGrid persona={activePersona} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Solution Finder Section - "Who Are You?" Funnel
const SolutionFinderSection = ({ navigate }: { navigate: (path: string) => void }) => {
  const businessNiches = [
    { label: "Tourism & Hospitality", path: "/for-tourism", icon: "🏨" },
    { label: "Restaurants & F&B", path: "/for-restaurants", icon: "🍽️" },
    { label: "E-commerce & DTC", path: "/for-ecommerce", icon: "🛒" },
    { label: "Events & Festivals", path: "/for-events", icon: "🎉" },
    { label: "Corporate & Enterprise", path: "/for-enterprise", icon: "🏢" },
    { label: "Universities & Students", path: "/for-universities", icon: "🎓" },
  ];

  return (
    <section className="py-20 bg-pr-surface-1 border-y border-pr-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-4">
          Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Solution</span>
        </h2>
        <p className="text-lg text-pr-text-2 mb-12 max-w-2xl mx-auto">
          Promorang works for creators and businesses alike. Tell us who you are, and we'll show you how to grow.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Creator Path */}
          <button
            onClick={() => navigate('/creators')}
            className="group p-8 bg-pr-surface-card border border-pr-border rounded-2xl hover:border-blue-500 transition-all text-left"
          >
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-pr-text-1 mb-2 group-hover:text-blue-500 transition-colors">I'm a Creator</h3>
            <p className="text-pr-text-2 mb-4">Influencer, content creator, or anyone with an audience who wants to monetize their influence.</p>
            <span className="text-blue-500 font-semibold flex items-center gap-2">
              Start Earning <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </button>

          {/* Business Path */}
          <div className="p-8 bg-pr-surface-card border border-pr-border rounded-2xl text-left">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-2xl font-bold text-pr-text-1 mb-2">I'm a Business</h3>
            <p className="text-pr-text-2 mb-4">Brand, restaurant, event organizer, or company looking to grow through word-of-mouth marketing.</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {businessNiches.map((niche) => (
                <button
                  key={niche.path}
                  onClick={() => navigate(niche.path)}
                  className="flex items-center gap-2 px-3 py-2 bg-pr-surface-2 hover:bg-pr-surface-3 rounded-lg text-sm text-pr-text-1 transition-colors text-left"
                >
                  <span>{niche.icon}</span>
                  <span>{niche.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-pr-text-muted">
          Not sure where you fit? <button onClick={() => navigate('/how-it-works')} className="text-blue-500 hover:underline">Learn how Promorang works</button>
        </p>
      </div>
    </section>
  );
};

// 2. The "Life-Force 8" Problem Agitation (Cashvertising)
const ProblemSection = () => {
  return (
    <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-6 leading-tight">
              The <span className="text-red-500">Social Media Monetization</span> Trap is <br /> Broken
            </h2>
            <div className="space-y-6 text-lg text-pr-text-2">
              <p>
                You're building someone else's empire instead of your own. Every post, every story, every reel grows their platform - not your wallet.
              </p>
              <p>
                <span className="font-bold text-pr-text-1">The reality:</span> You create the content, you take the risks, you build the audience - but someone else cashes in.
              </p>
              <p>
                <span className="font-bold text-pr-text-1">The cost:</span> 30-50% of your earnings plus total control over your career.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="text-red-500 font-bold mb-1">The Old Way</div>
                <div className="text-sm text-pr-text-2">Traditional platforms take your cut and make the rules</div>
              </div>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="text-green-500 font-bold mb-1">The Promorang Way</div>
                <div className="text-sm text-pr-text-2">You keep 80% and call the shots</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-3xl rounded-full" />
            <div className="relative bg-pr-surface-card border border-pr-border rounded-2xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-pr-border pb-4">
                <div className="font-bold text-pr-text-1">The Math Doesn't Lie</div>
                <div className="text-sm text-pr-text-2">Monthly earnings comparison</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center opacity-50">
                  <span>Instagram</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="flex justify-between items-center opacity-50">
                  <span>TikTok</span>
                  <span className="font-mono">$12.43</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold text-green-500 pt-4 border-t border-pr-border">
                  <span>Promorang</span>
                  <span className="font-mono">$1,247.50</span>
                </div>
                <div className="text-xs text-center text-pr-text-2 mt-4">
                  *Based on average creator metrics
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
  return (
    <section className="py-24 bg-pr-surface-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">3-Step Freedom Formula</span>
          </h2>
          <p className="text-xl text-pr-text-2">
            From audience to income in minutes, not months.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Sparkles className="w-10 h-10 text-blue-500" />,
              title: 'Connect Your Social',
              desc: 'Link your Instagram and TikTok to instantly import your audience and engagement metrics.',
              stat: '60 seconds'
            },
            {
              icon: <Share2 className="w-10 h-10 text-purple-500" />,
              title: 'Choose Your Campaigns',
              desc: 'Select from brands willing to pay premium rates for your audience demographics.',
              stat: '90 seconds'
            },
            {
              icon: <TrendingUp className="w-10 h-10 text-green-500" />,
              title: 'Get Paid Instantly',
              desc: 'Receive payments automatically when your followers engage with your content.',
              stat: '24/7'
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

// 3b. Unique Value Props - What Makes Promorang Different
const UniqueValuePropsSection = ({ navigate }: { navigate: (path: string) => void }) => {
  return (
    <section className="py-24 bg-pr-surface-1 border-y border-pr-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-pr-text-1 mb-6">
            What Makes Promorang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Different</span>
          </h2>
          <p className="text-xl text-pr-text-2 max-w-3xl mx-auto">
            Three unique ways to earn that you won't find anywhere else.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Content Shares */}
          <button
            onClick={() => navigate('/content-shares')}
            className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-green-500/50 transition-all group relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">UNIQUE</div>
            <div className="mb-6 bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Share2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-pr-text-1 mb-3">Content Shares</h3>
            <p className="text-pr-text-2 mb-6 leading-relaxed">
              Engage with content you believe in and earn <strong className="text-pr-text-1">shares (equity)</strong> in that content's success. When the content performs, you earn.
            </p>
            <div className="bg-pr-surface-2 p-4 rounded-lg">
              <div className="text-sm font-bold text-pr-text-1 mb-1">How it works:</div>
              <ul className="text-xs text-pr-text-2 space-y-1">
                <li>✓ Engage with creator content (like, share, comment)</li>
                <li>✓ Earn shares in that content's performance</li>
                <li>✓ Get rewarded when the content succeeds</li>
              </ul>
            </div>
            <div className="mt-4 text-green-500 font-semibold text-sm flex items-center gap-1">
              Learn more <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Forecasts */}
          <button
            onClick={() => navigate('/forecasts')}
            className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-blue-500/50 transition-all group relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">UNIQUE</div>
            <div className="mb-6 bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-pr-text-1 mb-3">Forecasts</h3>
            <p className="text-pr-text-2 mb-6 leading-relaxed">
              Predict which <strong className="text-pr-text-1">content will perform well</strong>. When you're right, you earn bonus Promo Points. Your taste becomes your income.
            </p>
            <div className="bg-pr-surface-2 p-4 rounded-lg">
              <div className="text-sm font-bold text-pr-text-1 mb-1">How it works:</div>
              <ul className="text-xs text-pr-text-2 space-y-1">
                <li>✓ Browse upcoming content from creators</li>
                <li>✓ Predict which will hit engagement targets</li>
                <li>✓ Earn Promo Points when your forecast is correct</li>
              </ul>
            </div>
            <div className="mt-4 text-blue-500 font-semibold text-sm flex items-center gap-1">
              Learn more <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Growth Hub */}
          <button
            onClick={() => navigate('/about/growth-hub')}
            className="bg-pr-surface-card border border-pr-border rounded-2xl p-8 hover:border-purple-500/50 transition-all group relative overflow-hidden text-left"
          >
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">EXCLUSIVE</div>
            <div className="mb-6 bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-pr-text-1 mb-3">Growth Hub</h3>
            <p className="text-pr-text-2 mb-6 leading-relaxed">
              Level up through tiers. Unlock higher earnings, exclusive campaigns, and become a <strong className="text-pr-text-1">true partner</strong> in Promorang's success.
            </p>
            <div className="bg-pr-surface-2 p-4 rounded-lg">
              <div className="text-sm font-bold text-pr-text-1 mb-1">Tier benefits:</div>
              <ul className="text-xs text-pr-text-2 space-y-1">
                <li>✓ Starter → Pro → Elite → Partner</li>
                <li>✓ Higher point multipliers per tier</li>
                <li>✓ Partner tier earns platform revenue share</li>
              </ul>
            </div>
            <div className="mt-4 text-purple-500 font-semibold text-sm flex items-center gap-1">
              Learn more <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

// 3c. Earnings Calculator Section
const EarningsCalculatorSection = ({ navigate }: { navigate: (path: string) => void }) => {
  return (
    <section className="py-24 bg-pr-surface-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EarningsCalculator onGetStarted={() => navigate('/auth')} />
      </div>
    </section>
  );
};

// Integrations Section - "Works With Your Stack"
const IntegrationsSection = () => {
  const platforms = [
    { name: 'Shopify', icon: '🛍️' },
    { name: 'WooCommerce', icon: '🛒' },
    { name: 'Etsy', icon: '🧶' },
    { name: 'BigCommerce', icon: '📦' },
  ];

  return (
    <section className="py-24 bg-pr-surface-1 border-y border-pr-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-pr-text-1 mb-4">
            Connect Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Store</span>
          </h2>
          <p className="text-lg text-pr-text-2 max-w-2xl mx-auto">
            Promorang integrates with the world's leading e-commerce platforms. Sync your product catalog in seconds.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center grayscale hover:grayscale-0 transition-all duration-500">
          {platforms.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-3 group">
              <div className="w-20 h-20 bg-pr-surface-card border border-pr-border rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm group-hover:shadow-blue-500/10 group-hover:border-blue-500/30">
                {p.icon}
              </div>
              <span className="font-bold text-pr-text-muted group-hover:text-pr-text-1 transition-colors">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. "Oversubscribed" Social Proof (Priestley)
const SocialProofSection = ({ activeStats }: any) => {
  return (
    <section className="py-20 bg-gradient-to-b from-pr-surface-1 to-pr-surface-background border-t border-pr-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-pr-text-1 mb-12">
          Join <span className="text-blue-500">3,482+ Creators</span> Already Earning
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="p-6">
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
              ${activeStats.totalPayouts.toLocaleString()}
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">Paid to Creators</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-extrabold text-pr-text-1 mb-2">
              {activeStats.earners.toLocaleString()}
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">Active Earners</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-extrabold text-green-500 mb-2">
              12.5%
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">Monthly Growth</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-extrabold text-orange-500 mb-2">
              0
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-pr-text-2">Followers to Start</div>
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
              Promorang changed everything. I went from struggling to monetize my 50k followers to making more money than my 9-5 job. <span className="text-blue-500 font-bold">The best part? I keep control of my content.</span>
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`} alt="User" />
              </div >
              <div className="text-left">
                <div className="font-bold text-pr-text-1">Sarah Chen</div>
                <div className="text-sm text-pr-text-2">Content Creator, 50k followers</div>
              </div>
            </div >
          </div >
        </div >
      </div >
    </section >
  );
};

// 5. Final CTA - The "No Brainer"
const FinalCTA = ({ navigate, user }: any) => {
  return (
    <section className="py-24 bg-pr-surface-background relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600/5" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold text-pr-text-1 mb-8">
          Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Own Your Audience?</span>
        </h2>
        <p className="text-xl text-pr-text-2 mb-10 max-w-2xl mx-auto">
          Stop building someone else's dream. Start building your future.
        </p>

        <div className="flex flex-col items-center gap-6">
          <Button
            onClick={() => navigate(user ? '/dashboard' : '/auth')}
            variant="primary"
            size="lg"
            className="text-xl px-16 py-6 shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 transform hover:-translate-y-1 transition-all w-full sm:w-auto"
          >
            {user ? 'Go to Dashboard' : 'Start Earning Now'}
          </Button>
          <p className="text-sm text-pr-text-2 opacity-70">
            Join 3,482 creators who've already made the switch
          </p>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [activePersona, setActivePersona] = useState<PersonaType>('creator');
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
    loading: boolean;
    error: string | null;
  }>({
    loading: false,
    error: null,
  });

  // Handle demo login with loading state
  const handleDemoLogin = useCallback(async (persona: PersonaType) => {
    try {
      setDemoLoginState({ loading: true, error: null });

      // Map persona to demo account
      const demoMap = {
        creator: 'creator@demo.com',
        investor: 'investor@demo.com',
        merchant: 'advertiser@demo.com',
        shopper: 'shopper@demo.com'
      };

      const email = demoMap[persona as keyof typeof demoMap] || 'creator@demo.com';
      const response = await signIn(email, 'demo123');

      if (response.error) {
        setDemoLoginState({ loading: false, error: response.error.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Demo login failed:', error);
      setDemoLoginState({ loading: false, error: 'Failed to process demo login' });
    } finally {
      // Logic handled by auth redirect usually, but safety cleanup
      setDemoLoginState(prev => ({ ...prev, loading: false }));
    }
  }, [signIn]);

  return (
    <div className="min-h-screen-dynamic bg-pr-surface-background font-sans selection:bg-blue-500/30">
      <SEO
        title="Turn Your Instagram Followers Into Real Income"
        description="Promorang helps creators and businesses monetize social engagement through Content Shares, Forecasts, and referral rewards. Start earning Promo Points today."
        keywords="influencer marketing, creator monetization, social media earnings, promo points, content shares, referral rewards"
        canonicalUrl="https://promorang.co/"
      />
      <MarketingNav />

      <HeroSection
        activeStats={activeStats}
        user={user}
        navigate={navigate}
        handleDemoLogin={handleDemoLogin}
        demoLoginState={demoLoginState}
        activePersona={activePersona}
        onPersonaChange={setActivePersona}
      />

      <SolutionFinderSection navigate={navigate} />

      <FeaturedDropsSection />

      <MarketplacePreviewSection />

      <TrendingContentSection />

      <ForecastsPreviewSection />

      <ProblemSection />

      <SolutionSection />

      <UniqueValuePropsSection navigate={navigate} />

      <EarningsCalculatorSection navigate={navigate} />

      <IntegrationsSection />

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
            <span>WooCommerce</span>
            <span>Etsy</span>
            <span>BigCommerce</span>
          </div>
          <p>© 2026 Promorang. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
