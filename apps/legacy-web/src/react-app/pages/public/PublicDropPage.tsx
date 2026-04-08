import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { useAuth } from '@/react-app/hooks/useAuth';
import { ArrowRight, Clock, User, Lock, Timer, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface DropData {
    id: string;
    title: string;
    description: string;
    preview_image?: string;
    creator_name?: string;
    creator_avatar?: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    promo_points_reward: number;
    key_cost: number;
    created_at: string;
    status: string;
    starts_at?: string;
    ends_at?: string;
    min_access_rank?: number;
}

type AccessState = 'LOCKED' | 'COUNTDOWN' | 'AVAILABLE' | 'MISSED';

// Determine the access state based on drop data and user status
function getAccessState(drop: DropData, user: any, userAccessRank: number): AccessState {
    const now = new Date();
    const startsAt = drop.starts_at ? new Date(drop.starts_at) : null;
    const endsAt = drop.ends_at ? new Date(drop.ends_at) : null;
    const minRank = drop.min_access_rank || 0;

    // Check if ended (MISSED state)
    if (endsAt && now > endsAt) {
        return 'MISSED';
    }

    // Check if not started yet (COUNTDOWN state)
    if (startsAt && now < startsAt) {
        return 'COUNTDOWN';
    }

    // Check if user doesn't meet rank requirement (LOCKED state)
    if (!user || userAccessRank < minRank) {
        return 'LOCKED';
    }

    // Otherwise available
    return 'AVAILABLE';
}

// LOCKED State Component
function LockedState({ drop, navigate }: { drop: DropData; navigate: (path: string) => void }) {
    return (
        <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
            {/* Blurred Preview */}
            {drop.preview_image && (
                <div className="aspect-video bg-pr-surface-2 relative">
                    <img
                        src={drop.preview_image}
                        alt=""
                        className="w-full h-full object-cover blur-md opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pr-surface-card to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-2xl flex items-center gap-3">
                            <Lock className="w-6 h-6 text-yellow-500" />
                            <span className="text-white font-bold">Access Rank Required</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1 mb-4">{drop.title}</h1>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                    <Lock className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                    <p className="text-pr-text-1 font-semibold mb-2">
                        This opportunity requires Day {drop.min_access_rank || 7}+ Access Rank
                    </p>
                    <p className="text-pr-text-2 text-sm">
                        Active users unlock access to opportunities like this. Start building your rank today.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/auth')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 mx-auto"
                >
                    Start Day 1 to Unlock Future Access <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// COUNTDOWN State Component  
function CountdownState({ drop, startsAt, navigate }: { drop: DropData; startsAt: Date; navigate: (path: string) => void }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const diff = startsAt.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Starting now...');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [startsAt]);

    return (
        <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
            {/* Preview with countdown overlay */}
            {drop.preview_image && (
                <div className="aspect-video bg-pr-surface-2 relative">
                    <img
                        src={drop.preview_image}
                        alt=""
                        className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pr-surface-card via-transparent to-transparent" />
                </div>
            )}

            <div className="p-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1 mb-4">{drop.title}</h1>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
                    <Timer className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                    <p className="text-pr-text-1 font-semibold mb-2">
                        Available to Day {drop.min_access_rank || 1}+ users in:
                    </p>
                    <div className="text-4xl font-mono font-bold text-blue-500 mb-4">
                        {timeLeft}
                    </div>
                    <p className="text-pr-text-2 text-sm">
                        Higher Access Rank users get notified first when this goes live.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/auth')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 mx-auto"
                >
                    Join to Start Building Access Rank <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// MISSED State Component
function MissedState({ drop, endedAt, navigate }: { drop: DropData; endedAt: Date; navigate: (path: string) => void }) {
    const formattedDate = endedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
            {/* Greyed out preview */}
            {drop.preview_image && (
                <div className="aspect-video bg-pr-surface-2 relative">
                    <img
                        src={drop.preview_image}
                        alt=""
                        className="w-full h-full object-cover grayscale opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pr-surface-card to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <span className="text-white font-bold">Opportunity Closed</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1 mb-4 opacity-70">{drop.title}</h1>

                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <p className="text-pr-text-1 font-semibold mb-2">
                        This opportunity was available to active users on {formattedDate}
                    </p>
                    <p className="text-pr-text-2 text-sm">
                        This opportunity has ended and cannot be replayed. Active users saw it first.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/auth')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 mx-auto"
                >
                    Don't Miss the Next One <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-pr-text-muted text-sm mt-4">
                    <a href="/explore" className="text-blue-500 hover:underline">See what's available now →</a>
                </p>
            </div>
        </div>
    );
}

export default function PublicDropPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [drop, setDrop] = useState<DropData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userAccessRank] = useState(0); // Would come from user profile

    useEffect(() => {
        async function fetchDrop() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/drops/${id}/public`);
                if (!response.ok) {
                    throw new Error('Drop not found');
                }
                const data = await response.json();
                setDrop(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load drop');
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchDrop();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen-dynamic bg-pr-surface-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !drop) {
        return (
            <div className="min-h-screen-dynamic bg-pr-surface-background">
                <MarketingNav />
                <div className="max-w-4xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-3xl font-bold text-pr-text-1 mb-4">Drop Not Found</h1>
                    <p className="text-pr-text-2 mb-8">This drop may have been removed or is no longer available.</p>
                    <a href="/" className="text-blue-500 hover:underline">← Back to Home</a>
                </div>
                <MarketingFooter />
            </div>
        );
    }

    const accessState = getAccessState(drop, user, userAccessRank);
    const ogImage = drop.preview_image || 'https://promorang.co/promorang-logo.png';

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title={`${drop.title} | Promorang`}
                description={drop.description?.slice(0, 160) || `Opportunity on Promorang - available to active users.`}
                ogImage={ogImage}
                ogType="article"
                canonicalUrl={`https://promorang.co/d/${drop.id}`}
                keywords={`promorang, opportunity, ${drop.title}`}
            />
            <MarketingNav />

            <section className="py-12 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {accessState === 'LOCKED' && (
                        <LockedState drop={drop} navigate={navigate} />
                    )}

                    {accessState === 'COUNTDOWN' && drop.starts_at && (
                        <CountdownState
                            drop={drop}
                            startsAt={new Date(drop.starts_at)}
                            navigate={navigate}
                        />
                    )}

                    {accessState === 'MISSED' && drop.ends_at && (
                        <MissedState
                            drop={drop}
                            endedAt={new Date(drop.ends_at)}
                            navigate={navigate}
                        />
                    )}

                    {accessState === 'AVAILABLE' && (
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
                            {drop.preview_image && (
                                <div className="aspect-video bg-pr-surface-2 relative">
                                    <img
                                        src={drop.preview_image}
                                        alt={drop.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {drop.creator_avatar ? (
                                            <img src={drop.creator_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1">{drop.creator_name || 'Anonymous'}</div>
                                        <div className="text-sm text-pr-text-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {new Date(drop.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <h1 className="text-2xl md:text-4xl font-bold text-pr-text-1 mb-4">{drop.title}</h1>
                                <p className="text-pr-text-2 text-lg leading-relaxed mb-8">{drop.description}</p>

                                <button
                                    onClick={() => navigate(`/drops/${id}`)}
                                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                                >
                                    Participate Now <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* What is Promorang? - Simplified */}
            <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">How Access Works</h2>
                    <p className="text-pr-text-2 mb-8 max-w-2xl mx-auto">
                        Promorang gives priority access to active users. The more consistently you participate,
                        the earlier you see opportunities and the more you can access.
                    </p>
                    <a
                        href="/how-it-works"
                        className="text-blue-500 hover:underline font-semibold"
                    >
                        Learn how Access Rank works →
                    </a>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
