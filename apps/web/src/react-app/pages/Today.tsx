/**
 * Today Screen - Daily Layer Entry Point
 * 
 * Shows the 4 locked daily elements:
 * 1. Today's Headline (reveal-first)
 * 2. Today's Multiplier
 * 3. Yesterday's Rank (from snapshot)
 * 4. Today's Draw
 * 
 * All 4 elements are ALWAYS visible, even on Day 1 (with placeholders if needed).
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useMaturity } from '@/react-app/context/MaturityContext';
import api from '@/react-app/lib/api';
import { Flame, RefreshCw, Rocket, Trophy, ArrowRight, Sparkles as SparklesIcon, Store, Gift, Calendar, HelpCircle, LogOut, Settings, User } from 'lucide-react';
import TodayHeadline from '@/react-app/components/today/TodayHeadline';
import TodayMultiplier from '@/react-app/components/today/TodayMultiplier';
import TodayRank from '@/react-app/components/today/TodayRank';
import TodayDraw from '@/react-app/components/today/TodayDraw';
import ReflectionStrip from '@/react-app/components/today/ReflectionStrip';
import FeaturedToday from '@/react-app/components/today/FeaturedToday';
import AccessRankExplainer from '@/react-app/components/today/AccessRankExplainer';
import WhatsNextCard from '@/react-app/components/WhatsNextCard';
import { TodaySkeleton } from '@/react-app/components/ui/SkeletonShimmer';

// Types from API response
interface ReflectionItem {
    id: string;
    message: string;
    category: 'activity' | 'milestone' | 'streak' | 'community';
    icon: string;
    accent_color: string;
}

interface FeaturedItem {
    id: string;
    type: 'promorang_drop' | 'community';
    title: string;
    preview: string;
    accent_color: string;
    drop_id?: string;
}

interface TodayState {
    headline: {
        type: string;
        payload: {
            title: string;
            subtitle?: string;
            cta_text?: string;
            cta_action?: string;
            image_url?: string;
            drop_id?: string;
            reward_amount?: number;
        };
        drop?: { id: string };
    };
    multiplier: {
        type: string;
        value: number;
        reason: string | null;
    };
    yesterday_rank: {
        rank: number | null;
        percentile: number | null;
        change: number;
        label: string;
    } | null;
    today_progress: {
        tickets: number;
        dynamic_points: number;
        label: string;
    };
    draw: {
        auto_entered: boolean;
        tickets: number;
        prizes: Array<{
            tier: string;
            type: string;
            amount: number;
            description: string;
        }>;
        status: string;
        result?: {
            won: boolean;
            prize_type?: string;
            prize_amount?: number;
        };
    };
    // Being Seen: Reflections & Featured (replaces checklist)
    reflections: ReflectionItem[];
    featured_content: FeaturedItem[];
    headline_viewed: boolean;
    headline_engaged: boolean;
}

export default function Today() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { maturityState } = useMaturity();
    const [todayState, setTodayState] = useState<TodayState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track if user has clicked these actions before (for dynamic labels)
    const [hasClickedDeals, setHasClickedDeals] = useState(() =>
        localStorage.getItem('promorang_clicked_deals') === 'true'
    );
    const [hasClickedEvents, setHasClickedEvents] = useState(() =>
        localStorage.getItem('promorang_clicked_events') === 'true'
    );
    const [hasClickedProof, setHasClickedProof] = useState(() =>
        localStorage.getItem('promorang_clicked_proof') === 'true'
    );

    const isFirstArrival = new URLSearchParams(location.search).get('first_arrival') === 'true';

    const fetchTodayState = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use api helper which includes Authorization header automatically
            const data = await api.get<TodayState>('/today');
            setTodayState(data as unknown as TodayState);
        } catch (err) {
            console.error('[Today] Error fetching state:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodayState();
    }, []);

    // Handle engagement with headline
    const handleEngage = async (action: 'view' | 'engage' | 'complete') => {
        try {
            // Use api helper which includes Authorization header automatically
            await api.post('/today/engage', {
                action,
                reference_id: todayState?.headline.drop?.id,
            });

            // Only refresh state after engage/complete actions (not view)
            // View is fire-and-forget to prevent infinite re-render loops
            if (action !== 'view') {
                await fetchTodayState();
            }

            // If engaging (clicking Explore), navigate to the drop/action
            if (action === 'engage') {
                if (todayState?.headline.payload.cta_action) {
                    navigate(todayState.headline.payload.cta_action);
                } else {
                    // Fallback Option B: Curated marketplace
                    navigate('/marketplace');
                }
            }
        } catch (err) {
            console.error('[Today] Engagement error:', err);
        }
    };

    // Format today's date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    // Loading state
    if (loading) {
        return <TodaySkeleton />;
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchTodayState}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* First Arrival Welcome */}
            {isFirstArrival && (
                <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-top duration-1000">
                    <SparklesIcon className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-pr-text-1">This is where Promorang happens each day.</h2>
                    <p className="text-pr-text-2 mt-1">One action. Real progress. Come back tomorrow.</p>
                </div>
            )}

            {/* What's Next - Smart suggestion */}
            <WhatsNextCard variant="compact" />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-pr-text-1">Today</h1>
                    <p className="text-sm text-pr-text-2">{dateStr}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Guide Link */}
                    <Link
                        to="/start"
                        className="p-2 rounded-full bg-pr-surface-2 hover:bg-pr-surface-3 transition-colors"
                        title="Getting Started Guide"
                    >
                        <HelpCircle className="w-5 h-5 text-pr-text-2" />
                    </Link>
                    {/* Profile Link */}
                    <Link
                        to="/profile"
                        className="p-2 rounded-full bg-pr-surface-2 hover:bg-pr-surface-3 transition-colors"
                        title="Profile & Settings"
                    >
                        <User className="w-5 h-5 text-pr-text-2" />
                    </Link>
                    {/* Logout Button */}
                    <button
                        onClick={async () => {
                            await signOut();
                            navigate('/auth');
                        }}
                        className="p-2 rounded-full bg-pr-surface-2 hover:bg-red-100 hover:text-red-600 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5 text-pr-text-2 hover:text-red-600" />
                    </button>
                    {/* Streak Badge */}
                    {(user as any)?.points_streak_days > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full">
                            <Flame className="w-4 h-4 text-orange-500 animate-flame" />
                            <span className="text-sm font-bold text-orange-700">
                                {(user as any).points_streak_days}-day streak
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 1. Today's Headline (Reveal-First) */}
            <TodayHeadline
                headline={todayState?.headline || null}
                viewed={todayState?.headline_viewed || false}
                engaged={todayState?.headline_engaged || false}
                onView={() => handleEngage('view')}
                onEngage={() => handleEngage('engage')}
                userState={maturityState}
            />

            {/* 2. Multiplier + 3. Rank Row */}
            <div className="grid grid-cols-2 gap-4">
                <TodayMultiplier
                    type={todayState?.multiplier.type || 'base'}
                    value={todayState?.multiplier.value || 1.0}
                    reason={todayState?.multiplier.reason || null}
                    userState={maturityState}
                />
                <TodayRank
                    rank={todayState?.yesterday_rank?.rank || null}
                    percentile={todayState?.yesterday_rank?.percentile || null}
                    change={todayState?.yesterday_rank?.change || 0}
                    todayProgress={todayState?.today_progress || { tickets: 0, dynamic_points: 0, label: '' }}
                    userState={maturityState}
                />
            </div>

            {/* 4. Today's Draw */}
            <div id="draw">
                <TodayDraw
                    tickets={todayState?.draw.tickets || 0}
                    autoEntered={todayState?.draw.auto_entered || false}
                    prizes={todayState?.draw.prizes || []}
                    status={todayState?.draw.status || 'open'}
                    result={todayState?.draw.result || null}
                    userState={maturityState}
                />
            </div>

            {/* Access Rank Explainer - Only for State 0/1 */}
            {maturityState <= 1 && (
                <AccessRankExplainer
                    currentRank={maturityState}
                    daysActive={maturityState}
                    streakDays={(user as any)?.points_streak_days || 0}
                />
            )}

            {/* Access Rank Opportunities - Only for State 0/1 */}
            {maturityState <= 1 && (
                <div className="space-y-4 mb-6">
                    <h3 className="text-sm font-bold text-pr-text-2 uppercase tracking-widest px-1">Rank Up Actions</h3>

                    <div className="grid grid-cols-1 gap-3">
                        {/* Deals CTA */}
                        <button
                            onClick={() => {
                                if (!hasClickedDeals) {
                                    localStorage.setItem('promorang_clicked_deals', 'true');
                                    setHasClickedDeals(true);
                                }
                                navigate('/deals');
                            }}
                            className="interactive-card animate-slide-up p-4 bg-white dark:bg-pr-surface-card border border-orange-200 dark:border-orange-500/30 rounded-xl flex items-center gap-4 hover:border-orange-400 shadow-sm"
                        >
                            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-500/20">
                                <Gift className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-pr-text-1">{hasClickedDeals ? 'Claim a Deal' : 'Claim Your First Deal'}</h4>
                                <p className="text-xs text-pr-text-2">Unlock rank rewards & community access</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-pr-text-3" />
                        </button>

                        {/* Events CTA */}
                        <button
                            onClick={() => {
                                if (!hasClickedEvents) {
                                    localStorage.setItem('promorang_clicked_events', 'true');
                                    setHasClickedEvents(true);
                                }
                                navigate('/events-entry');
                            }}
                            className="interactive-card animate-slide-up-delay-1 p-4 bg-white dark:bg-pr-surface-card border border-blue-200 dark:border-blue-500/30 rounded-xl flex items-center gap-4 hover:border-blue-400 shadow-sm"
                        >
                            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                                <Calendar className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-pr-text-1">{hasClickedEvents ? 'RSVP to an Event' : 'RSVP to Your First Event'}</h4>
                                <p className="text-xs text-pr-text-2">Meet the community & earn keys</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-pr-text-3" />
                        </button>

                        {/* Post Proof CTA */}
                        <button
                            onClick={() => {
                                if (!hasClickedProof) {
                                    localStorage.setItem('promorang_clicked_proof', 'true');
                                    setHasClickedProof(true);
                                }
                                navigate('/post');
                            }}
                            className="interactive-card animate-slide-up-delay-2 p-4 bg-white dark:bg-pr-surface-card border border-purple-200 dark:border-purple-500/30 rounded-xl flex items-center gap-4 hover:border-purple-400 shadow-sm"
                        >
                            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-500/20">
                                <Rocket className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-pr-text-1">{hasClickedProof ? 'Share & Rank Up' : 'Share Content, Rank Up'}</h4>
                                <p className="text-xs text-pr-text-2">Build your rank & enter the daily draw</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-pr-text-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Got a Business? Card - Only for State 0/1 */}
            {maturityState <= 1 && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-emerald-100">
                            <Store className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-emerald-900 mb-1">Got a Business?</h3>
                            <p className="text-sm text-emerald-700 mb-3">
                                Try Promorang to attract customers. Create one free sampling offer and see real users discover your brand.
                            </p>
                            <button
                                onClick={() => navigate('/advertiser/onboarding')}
                                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                            >
                                Learn How
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Being Seen: Reflection Strip (System notices) */}
            {todayState?.reflections && todayState.reflections.length > 0 && (
                <ReflectionStrip reflections={todayState.reflections} />
            )}

            {/* Being Seen: Featured Today (Internal content redistribution) */}
            {todayState?.featured_content && todayState.featured_content.length > 0 && (
                <FeaturedToday items={todayState.featured_content} />
            )}

            {/* Contribute CTA - More Visible */}
            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-4">
                <button
                    onClick={() => navigate('/contribute')}
                    className="w-full flex items-center gap-4 text-left hover:opacity-80 transition-opacity"
                >
                    <div className="p-2.5 rounded-xl bg-purple-500/20">
                        <SparklesIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-pr-text-1">Add Your Voice</h4>
                        <p className="text-xs text-pr-text-2">Share content, host events, grow your network</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-500" />
                </button>
            </div>

            {/* Action Destinations */}
            <div className="space-y-3 pt-4 border-t border-pr-border/50">
                <h3 className="text-xs font-bold text-pr-text-2 uppercase tracking-widest px-1">Quick Destinations</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/earn')}
                        className="p-4 bg-gradient-to-br from-pr-surface-2 to-pr-surface-3 rounded-xl border border-pr-border/50 text-left group hover:scale-[1.01] transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <Rocket className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-pr-text-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h4 className="font-bold text-pr-text-1">Earning Center</h4>
                        <p className="text-xs text-pr-text-2">Discover active drops & proofs</p>
                    </button>

                    <button
                        onClick={() => navigate('/promoshare')}
                        className="p-4 bg-gradient-to-br from-pr-surface-2 to-pr-surface-3 rounded-xl border border-pr-border/50 text-left group hover:scale-[1.01] transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                <SparklesIcon className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-pr-text-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h4 className="font-bold text-pr-text-1">PromoShare V2</h4>
                        <p className="text-xs text-pr-text-2">Check the global jackpot</p>
                    </button>

                    {maturityState >= 2 && (
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="p-4 bg-gradient-to-br from-pr-surface-2 to-pr-surface-3 rounded-xl border border-pr-border/50 text-left group hover:scale-[1.01] transition-all sm:col-span-2"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 flex items-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    <span className="text-xs font-bold uppercase">Competitive</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-pr-text-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <h4 className="font-bold text-pr-text-1">Global Rankings</h4>
                            <p className="text-xs text-pr-text-2">See where you stand against the community</p>
                        </button>
                    )}
                </div>
            </div>

            <div className="text-center pt-8 opacity-30 group hover:opacity-100 transition-opacity">
                <button
                    onClick={() => navigate('/marketplace')}
                    className="text-[10px] font-bold uppercase tracking-widest text-pr-text-2 hover:text-blue-500 transition-colors"
                >
                    Curated Marketplace →
                </button>
            </div>
        </div>
    );
}
