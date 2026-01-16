/**
 * Start Page (Entry Hub)
 * 
 * Consolidated landing page for new/early-stage users.
 * Shows the Promorang economy flow: Points → Keys → Drops → Gems
 * Instagram connect is the primary value driver for early users.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import { EntryLayout } from '@/react-app/components/entry';
import { apiFetch } from '@/react-app/lib/api';
import OnboardingPreferences from '@/react-app/components/onboarding/OnboardingPreferences';
import {
  Gift,
  Calendar,
  Camera,
  Sparkles,
  TrendingUp,
  Star,
  Zap,
  ArrowRight,
  Instagram,
  Key,
  Coins,
  Diamond,
  Users,
  ExternalLink,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import WhatsNextCard from '@/react-app/components/WhatsNextCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// The Promorang Economy Flow
const ECONOMY_STEPS = [
  {
    icon: Coins,
    label: 'Earn Points',
    description: 'Get verified for the attention and presence you already have',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  {
    icon: Key,
    label: 'Buy Keys',
    description: 'Keys are earned access, not a paywall',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    icon: Gift,
    label: 'Access Drops',
    description: 'Drops are real deals, events, and content opportunities',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    icon: Diamond,
    label: 'Earn Gems',
    description: 'Complete actions, earn real money you can withdraw',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  }
];

// Removed POINTS_ACTIVITIES - replaced by OnboardingPreferences wizard

// Drop categories to explore
const DROP_CATEGORIES = [
  {
    title: 'Deals',
    path: '/deals',
    icon: Gift,
    color: 'from-emerald-500 to-teal-500',
    caption: 'Simple brand actions with guaranteed rewards'
  },
  {
    title: 'Events',
    path: '/events-entry',
    icon: Calendar,
    color: 'from-blue-500 to-indigo-500',
    caption: 'Earn for showing up online or in person'
  },
  {
    title: 'Content',
    path: '/post',
    icon: Camera,
    color: 'from-purple-500 to-pink-500',
    caption: 'Share content and submit proof when asked'
  }
];

interface UserBalances {
  points_balance: number;
  keys_balance: number;
  gems_balance: number;
}

export default function StartPage() {
  const { user } = useAuth();
  const { recordAction, maturityState } = useMaturity();
  const navigate = useNavigate();
  const [balances, setBalances] = useState<UserBalances>({ points_balance: 0, keys_balance: 0, gems_balance: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch user balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiFetch('/users/me');
        if (data) {
          const userData = data.user || data;
          setBalances({
            points_balance: userData.points_balance || 0,
            keys_balance: userData.keys_balance || 0,
            gems_balance: userData.gems_balance || 0
          });
        }
      } catch (error) {
        console.error('Error fetching balances:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBalances();
  }, [user]);

  // Record page view
  useEffect(() => {
    if (user) {
      recordAction('page_view', { page: 'start' });
    }
  }, [user, recordAction]);

  // Calculate points needed for first key (assuming 500 points = 1 key)
  const POINTS_PER_KEY = 500;
  const pointsToFirstKey = Math.max(0, POINTS_PER_KEY - balances.points_balance);
  const progressToKey = Math.min((balances.points_balance / POINTS_PER_KEY) * 100, 100);

  // Instagram connect handler - opens ManyChat flow
  const handleInstagramConnect = () => {
    // This would open the Instagram DM flow via ManyChat
    window.open('https://ig.me/m/promorang', '_blank');
  };

  // -----------------------------------------
  // State 1+ Users: Show Quick Reference Guide
  // -----------------------------------------
  if (maturityState >= 1 && user) {
    return (
      <EntryLayout showBackToStart={false}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Handoff Banner */}
          <section className="animate-in fade-in slide-in-from-top duration-700">
            <Card className="p-6 bg-gradient-to-r from-orange-500 to-pink-500 border-none text-white shadow-lg overflow-hidden relative">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">You’re in. Let’s focus on today.</h2>
                  <p className="text-white/80 text-sm mt-1">Your journey has started. The daily layer is where the progress happens.</p>
                </div>
                <Button
                  size="lg"
                  onClick={() => navigate('/today?first_arrival=true')}
                  className="bg-white text-orange-600 hover:bg-white/90 font-bold px-8 shadow-sm whitespace-nowrap"
                >
                  Go to Today
                </Button>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles className="h-24 w-24" />
              </div>
            </Card>
          </section>
          {/* Header */}
          <section className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-pr-text-1">Quick Reference Guide</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1">
              Welcome Back!
            </h1>
            <p className="text-pr-text-2 max-w-lg mx-auto">
              This is your starting point. Use it to understand the flow, but focus your energy on the Today screen.
            </p>
          </section>

          {/* Balances Bar */}
          {!loading && (
            <section className="bg-gradient-to-r from-pr-surface-1 to-pr-surface-2 rounded-2xl p-4 border border-pr-border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="text-2xl font-bold text-pr-text-1">{balances.points_balance.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-pr-text-2">Points</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Key className="h-4 w-4 text-purple-500" />
                    <span className="text-2xl font-bold text-pr-text-1">{balances.keys_balance}</span>
                  </div>
                  <p className="text-xs text-pr-text-2">Keys</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Diamond className="h-4 w-4 text-emerald-500" />
                    <span className="text-2xl font-bold text-pr-text-1">{balances.gems_balance}</span>
                  </div>
                  <p className="text-xs text-pr-text-2">Gems ($)</p>
                </div>
              </div>
              <p className="text-[10px] text-center text-pr-text-2 mt-4 opacity-70">
                You don’t buy your way in. You earn your way forward.
              </p>
            </section>
          )}

          {/* How It Works - Economy Flow */}
          <section>
            <h2 className="text-lg font-semibold text-pr-text-1 mb-4 text-center">The Promorang Economy</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ECONOMY_STEPS.map((step, index) => (
                <div key={index} className="relative">
                  <Card className="p-4 bg-pr-surface-card border border-pr-border text-center h-full">
                    <div className={`w-10 h-10 rounded-xl ${step.bgColor} flex items-center justify-center mx-auto mb-2`}>
                      <step.icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <h3 className="text-sm font-semibold text-pr-text-1">{step.label}</h3>
                    <p className="text-xs text-pr-text-2 mt-1">{step.description}</p>
                  </Card>
                  {index < ECONOMY_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-4 w-4 text-pr-text-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Quick Links */}
          <section>
            <h2 className="text-lg font-semibold text-pr-text-1 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Link to="/today" className="group">
                <Card className="p-4 bg-pr-surface-card border border-orange-500/30 hover:border-orange-500/50 transition-all text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0">
                    <span className="flex h-3 w-3 m-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-pr-text-1 group-hover:text-orange-500 transition-colors">Today</h3>
                  <p className="text-xs text-pr-text-2 mt-1">View daily opportunities</p>
                </Card>
              </Link>
              {DROP_CATEGORIES.map((category) => (
                <Link key={category.path} to={category.path} className="group">
                  <Card className="p-4 bg-pr-surface-card border border-pr-border hover:border-transparent hover:shadow-lg transition-all text-center">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-pr-text-1 group-hover:text-orange-500 transition-colors">{category.title}</h3>
                    <p className="text-xs text-pr-text-2 mt-1">Explore {category.title.toLowerCase()}</p>
                  </Card>
                </Link>
              ))}
              {/* Contribute Card */}
              <Link to="/contribute" className="group">
                <Card className="p-4 bg-pr-surface-card border border-purple-500/30 hover:border-purple-500/50 transition-all text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-pr-text-1 group-hover:text-purple-500 transition-colors">Contribute</h3>
                  <p className="text-xs text-pr-text-2 mt-1">Grow your network</p>
                </Card>
              </Link>
            </div>
          </section>

          {/* Tips */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 bg-pr-surface-card border border-pr-border">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                  <Star className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-pr-text-1">Check In Daily</h3>
                  <p className="text-sm text-pr-text-2 mt-1">
                    Visit /today each day to see new headlines, earn tickets, and enter the daily draw!
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-pr-surface-card border border-pr-border">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-pr-text-1">Rank Up for Access</h3>
                  <p className="text-sm text-pr-text-2 mt-1">
                    Complete actions to increase your Access Rank and unlock more features!
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Got a Business? Card */}
          <section className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">Got a Business?</h3>
                <p className="text-emerald-800 dark:text-emerald-500/80 mt-1">
                  Try Promorang to attract customers. Create one free sampling offer and see real users discover your brand.
                </p>
              </div>
              <Button
                onClick={() => navigate('/advertiser/onboarding')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8"
              >
                Learn How
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </section>

          {/* Back to Today button */}
          <section className="text-center">
            <Button
              size="lg"
              onClick={() => navigate('/today')}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Back to Today
            </Button>
          </section>
        </div>
      </EntryLayout>
    );
  }

  // -----------------------------------------
  // State 0 Users: Show Full Onboarding
  // -----------------------------------------
  return (
    <EntryLayout showBackToStart={false}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-full border border-orange-500/20">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-pr-text-1">
              {user ? `Welcome${(user as any).user_metadata?.display_name ? `, ${(user as any).user_metadata.display_name}` : ''}!` : 'Start earning today'}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-pr-text-1">
            Turn What You Already Do Into Income
          </h1>

          <p className="text-base text-pr-text-2 max-w-xl mx-auto italic">
            Showing up, sharing, and participating now earns real rewards.
          </p>
          <p className="text-xs text-pr-text-2 opacity-60">
            No upfront cost. No experience required.
          </p>
        </section>

        {/* Balances Bar (for logged in users) */}
        {user && !loading && (
          <section className="bg-gradient-to-r from-pr-surface-1 to-pr-surface-2 rounded-2xl p-4 border border-pr-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="text-2xl font-bold text-pr-text-1">{balances.points_balance.toLocaleString()}</span>
                </div>
                <p className="text-xs text-pr-text-2">Points</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Key className="h-4 w-4 text-purple-500" />
                  <span className="text-2xl font-bold text-pr-text-1">{balances.keys_balance}</span>
                </div>
                <p className="text-xs text-pr-text-2">Keys</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Diamond className="h-4 w-4 text-emerald-500" />
                  <span className="text-2xl font-bold text-pr-text-1">{balances.gems_balance}</span>
                </div>
                <p className="text-xs text-pr-text-2">Gems ($)</p>
              </div>
            </div>
            <p className="text-[10px] text-center text-pr-text-2 mt-4 opacity-70">
              You don’t buy your way in. You earn your way forward.
            </p>
          </section>
        )}

        {/* How It Works - Economy Flow */}
        <section>
          <h2 className="text-lg font-semibold text-pr-text-1 mb-4 text-center">How Promorang Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ECONOMY_STEPS.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-4 bg-pr-surface-card border border-pr-border text-center h-full">
                  <div className={`w-10 h-10 rounded-xl ${step.bgColor} flex items-center justify-center mx-auto mb-2`}>
                    <step.icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-pr-text-1">{step.label}</h3>
                  <p className="text-xs text-pr-text-2 mt-1">{step.description}</p>
                </Card>
                {index < ECONOMY_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-4 w-4 text-pr-text-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Access Rank Journey - Visual Timeline */}
        <section className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-indigo-500/20">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-pr-text-1 flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Your Access Rank Journey
            </h2>
            <p className="text-sm text-pr-text-2 mt-1">
              Show up consistently → Unlock more opportunities
            </p>
          </div>

          {/* Rank Timeline */}
          <div className="space-y-3">
            {[
              { emoji: '🌱', name: 'New', days: 'Day 0', unlocks: 'Today page, Entry surfaces', current: maturityState === 0 },
              { emoji: '🔍', name: 'Explorer', days: 'Day 1+', unlocks: 'Daily Draw, Post Proof', current: maturityState === 1 },
              { emoji: '⭐', name: 'Member', days: 'Day 7+', unlocks: 'Leaderboard, PromoShare, Referrals', current: maturityState === 2 },
              { emoji: '💎', name: 'Insider', days: 'Day 14+', unlocks: 'Growth Hub, Priority Access', current: maturityState >= 3 },
            ].map((rank, index) => (
              <div
                key={rank.name}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${rank.current
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-400'
                  : maturityState > index
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-pr-surface-2 border border-pr-border opacity-60'
                  }`}
              >
                <div className="text-2xl">{rank.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pr-text-1">{rank.name}</span>
                    <span className="text-xs text-pr-text-3">{rank.days}</span>
                    {rank.current && (
                      <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-pr-text-2 truncate">{rank.unlocks}</p>
                </div>
                {maturityState > index && !rank.current && (
                  <div className="text-green-500 text-sm font-medium">✓</div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 text-center">
            <Link
              to="/access-rank"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity text-sm"
            >
              View Full Progress
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Progress to First Key (for users with no keys) */}
        {user && balances.keys_balance === 0 && (
          <section className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-pr-text-1 flex items-center gap-2">
                  <Key className="h-5 w-5 text-purple-500" />
                  Get Your First Key
                </h2>
                <p className="text-sm text-pr-text-2">
                  {pointsToFirstKey > 0
                    ? 'Your first key unlocks real opportunities. Earn it once. Use it everywhere.'
                    : 'You have enough points! Buy a key to access drops.'
                  }
                </p>
              </div>

              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between text-xs text-pr-text-2 mb-1">
                  <span>{balances.points_balance.toLocaleString()} / {POINTS_PER_KEY.toLocaleString()} points</span>
                  <span>{Math.round(progressToKey)}%</span>
                </div>
                <div className="h-3 bg-pr-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressToKey}%` }}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Instagram Connect CTA - Primary Action */}
        <section className="bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Instagram className="h-8 w-8" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Verify Your Presence & Get Started Instantly
              </h2>
              <p className="text-white/80 text-sm md:text-base">
                We verify real accounts so brands reward real people. Your following becomes your starting advantage.
              </p>
              <p className="text-[10px] text-white/60 mt-2">
                Connecting does not post on your behalf.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleInstagramConnect}
              className="bg-white text-purple-600 hover:bg-white/90 font-semibold px-6 flex-shrink-0"
            >
              <Instagram className="h-5 w-5 mr-2" />
              Connect Instagram
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Personalization Preferences - Replaces old profile/referral CTAs */}
        {user && (
          <section>
            <h2 className="text-lg font-semibold text-pr-text-1 mb-2">Tell Us About You</h2>
            <p className="text-sm text-pr-text-2 mb-4">Help us show you the most relevant deals and opportunities.</p>
            <OnboardingPreferences
              onComplete={(prefs) => {
                console.log('Preferences saved:', prefs);
                // Could refresh balances here to show updated points
              }}
            />
          </section>
        )}


        {/* Explore Drops */}
        <section>
          <h2 className="text-lg font-semibold text-pr-text-1 mb-2">Explore Drops</h2>
          <p className="text-sm text-pr-text-2 mb-4">These are the three ways people earn on Promorang.</p>
          <div className="grid grid-cols-3 gap-4">
            {DROP_CATEGORIES.map((category) => (
              <Link
                key={category.path}
                to={category.path}
                className="group"
              >
                <Card className="p-4 bg-pr-surface-card border border-pr-border hover:border-transparent hover:shadow-lg transition-all text-center h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-pr-text-1 group-hover:text-orange-500 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-[10px] text-pr-text-2 mt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    {category.caption}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* What's Next - Smart Guidance */}
        <section className="pt-4">
          <WhatsNextCard />
        </section>

        {/* Got a Business? Card */}
        <section className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Store className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400">Got a Business?</h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-500/80 mt-1">
                Try Promorang to attract customers. Create one free sampling offer and see real users discover your brand.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/advertiser/onboarding')}
              className="border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 font-bold px-6"
            >
              Learn How
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* Stats/Social Proof (for non-logged in users) */}
        {!user && (
          <section className="bg-gradient-to-r from-orange-500/5 via-pink-500/5 to-purple-500/5 rounded-2xl p-8 border border-pr-border">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-pr-text-1">
                Join thousands earning real money
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                    50K+
                  </p>
                  <p className="text-sm text-pr-text-2 mt-1">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                    $2M+
                  </p>
                  <p className="text-sm text-pr-text-2 mt-1">Gems Paid Out</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                    1,200+
                  </p>
                  <p className="text-sm text-pr-text-2 mt-1">Brand Partners</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                    4.8★
                  </p>
                  <p className="text-sm text-pr-text-2 mt-1">User Rating</p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8"
              >
                <Zap className="h-5 w-5 mr-2" />
                Create Free Account
              </Button>
            </div>
          </section>
        )}

        {/* Quick Tips */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 bg-pr-surface-card border border-pr-border">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                <Star className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-pr-text-1">More Followers = More Points</h3>
                <p className="text-sm text-pr-text-2 mt-1">
                  Your Instagram followers directly translate to points. Grow your audience to unlock more opportunities.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-pr-surface-card border border-pr-border">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-pr-text-1">Complete Drops = Earn Gems</h3>
                <p className="text-sm text-pr-text-2 mt-1">
                  Each gem is worth $1. Complete brand campaigns to earn real money you can withdraw.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </EntryLayout>
  );
}
