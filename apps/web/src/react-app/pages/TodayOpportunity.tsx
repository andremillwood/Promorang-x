import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import api from '@/react-app/lib/api';
import {
    ChevronLeft,
    Rocket,
    Gift,
    Zap,
    Trophy,
    ArrowRight,
    Shield,
    Clock,
    Sparkles,
    Target
} from 'lucide-react';

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
            multiplier?: number;
            extra_tickets?: number;
        };
        drop?: {
            id: string;
            title: string;
            description: string;
            gem_reward_base: number;
            image_url?: string;
            category?: string;
        };
    };
}

export default function TodayOpportunity() {
    const navigate = useNavigate();
    const [todayState, setTodayState] = useState<TodayState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchState = async () => {
            try {
                const data = await api.get<TodayState>('/today');
                setTodayState(data as unknown as TodayState);
            } catch (err) {
                console.error('[TodayOpportunity] Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchState();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen-dynamic flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const { headline } = todayState || {};
    const payload = headline?.payload;
    const drop = headline?.drop;
    const type = headline?.type || 'reward';

    // Theme based on type
    const themes = {
        reward: {
            bg: 'from-blue-600/20 to-indigo-600/20',
            border: 'border-blue-500/20',
            icon: <Gift className="w-8 h-8 text-blue-400" />,
            badge: 'bg-blue-500/10 text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25',
        },
        multiplier: {
            bg: 'from-orange-600/20 to-amber-600/20',
            border: 'border-orange-500/20',
            icon: <Zap className="w-8 h-8 text-orange-400" />,
            badge: 'bg-orange-500/10 text-orange-400',
            button: 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/25',
        },
        chance: {
            bg: 'from-purple-600/20 to-pink-600/20',
            border: 'border-purple-500/20',
            icon: <Sparkles className="w-8 h-8 text-purple-400" />,
            badge: 'bg-purple-500/10 text-purple-400',
            button: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25',
        },
    };

    const currentTheme = themes[type as keyof typeof themes] || themes.reward;

    const handleAction = () => {
        if (type === 'reward' && drop?.id) {
            navigate(`/earn/${drop.id}`);
        } else {
            navigate('/earn');
        }
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-1">
            {/* Header / Back */}
            <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/today')}
                    className="p-2 -ml-2 rounded-full hover:bg-pr-surface-3 transition-colors text-pr-text-2"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-pr-text-3 uppercase tracking-widest">Mission ID</span>
                    <p className="text-xs font-mono text-pr-text-2">{new Date().toISOString().split('T')[0].replace(/-/g, '')}</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pb-20">
                {/* Hero / Visual */}
                <div className={`relative overflow-hidden rounded-3xl border ${currentTheme.border} bg-gradient-to-br ${currentTheme.bg} p-8 mb-8`}>
                    <div className="relative z-10">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${currentTheme.badge} text-xs font-bold uppercase tracking-widest mb-6`}>
                            {currentTheme.icon}
                            {type === 'reward' ? "Featured Drop" : type === 'multiplier' ? "Multiplier Event" : "Lucky Draw Event"}
                        </div>

                        <h1 className="text-4xl font-black text-pr-text-1 mb-4 leading-tight">
                            {payload?.title}
                        </h1>
                        <p className="text-lg text-pr-text-2 mb-8 max-w-md">
                            {payload?.subtitle}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {type === 'reward' && (
                                <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                        <Trophy className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-pr-text-3 font-bold uppercase">Reward</p>
                                        <p className="text-sm font-black text-pr-text-1">{payload?.reward_amount || 'High'} Gems</p>
                                    </div>
                                </div>
                            )}
                            {type === 'multiplier' && (
                                <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3">
                                    <div className="p-1.5 bg-orange-500/20 rounded-lg">
                                        <Zap className="w-4 h-4 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-pr-text-3 font-bold uppercase">Multiplier</p>
                                        <p className="text-sm font-black text-pr-text-1">{payload?.multiplier}× Boost</p>
                                    </div>
                                </div>
                            )}
                            <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-pr-text-3 font-bold uppercase">Time Left</p>
                                    <p className="text-sm font-black text-pr-text-1">Today Only</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ambient Glows */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[100px] -ml-32 -mb-32" />
                </div>

                {/* Details Section */}
                {type === 'reward' && drop && (
                    <div className="bg-pr-surface-2 rounded-2xl border border-pr-border/50 p-6 mb-8">
                        <h2 className="text-xs font-bold text-pr-text-3 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Rocket className="w-4 h-4" />
                            Mission Briefing
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-pr-text-1 mb-1">{drop.title}</h3>
                                <p className="text-sm text-pr-text-2 leading-relaxed">
                                    {drop.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-pr-border/30">
                                <div>
                                    <p className="text-[10px] font-bold text-pr-text-3 uppercase mb-1">Category</p>
                                    <span className="text-xs font-bold px-2 py-0.5 bg-pr-surface-3 rounded-full text-pr-text-2">
                                        {drop.category || 'General'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-pr-text-3 uppercase mb-1">Complexity</p>
                                    <span className="text-xs font-bold px-2 py-0.5 bg-pr-surface-3 rounded-full text-pr-text-2">
                                        Quick Engage
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions / Values */}
                <div className="grid grid-cols-1 gap-6 mb-12">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-pr-surface-3 rounded-xl border border-pr-border/50 text-pr-text-1 font-black shadow-inner">
                            01
                        </div>
                        <div>
                            <h3 className="font-bold text-pr-text-1">Accept the Mission</h3>
                            <p className="text-xs text-pr-text-2">Commit to today's featured opportunity by clicking the button below.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-pr-surface-3 rounded-xl border border-pr-border/50 text-pr-text-1 font-black shadow-inner">
                            02
                        </div>
                        <div>
                            <h3 className="font-bold text-pr-text-1">Complete & Submit</h3>
                            <p className="text-xs text-pr-text-2">Engage with the content and submit your proof to earn your rewards.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-pr-surface-3 rounded-xl border border-pr-border/50 text-pr-text-1 font-black shadow-inner">
                            03
                        </div>
                        <div>
                            <h3 className="font-bold text-pr-text-1">Claim Daily Ticket</h3>
                            <p className="text-xs text-pr-text-2">Every mission completion awards you an entry into today's Lucky Draw.</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-pr-surface-1/80 backdrop-blur-xl border-t border-pr-border/50 z-50">
                    <div className="max-w-2xl mx-auto">
                        <button
                            onClick={handleAction}
                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all ${currentTheme.button}`}
                        >
                            {type === 'reward' ? "Start Mission" : "Go to Earning Center"}
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
