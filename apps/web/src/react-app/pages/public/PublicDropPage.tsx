import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import KeyGateModal from '@/react-app/components/KeyGateModal';
import { useAuth } from '@/react-app/hooks/useAuth';
import { Share2, Eye, Heart, MessageCircle, TrendingUp, ArrowRight, Clock, User, Key, Lock } from 'lucide-react';
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
}

export default function PublicDropPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const [drop, setDrop] = useState<DropData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [userKeys, setUserKeys] = useState(0);

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

    // Fetch user's key balance if logged in
    useEffect(() => {
        async function fetchUserKeys() {
            if (!user) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserKeys(data.user?.currencies?.promokeys || 0);
                }
            } catch (err) {
                console.error('Failed to fetch user keys:', err);
            }
        }
        fetchUserKeys();
    }, [user]);

    const handleEngage = () => {
        if (!user) {
            setShowKeyModal(true);
            return;
        }

        const keyCost = drop?.key_cost || 0;
        if (userKeys < keyCost) {
            setShowKeyModal(true);
            return;
        }

        // User has enough keys, redirect to app view
        navigate(`/drops/${id}`);
    };

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

    const ogImage = drop.preview_image || 'https://promorang.co/promorang-logo.png';
    const formattedDate = new Date(drop.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const keyCost = drop.key_cost || 0;
    const canEngage = user && userKeys >= keyCost;

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title={`${drop.title} | Promorang Drop`}
                description={drop.description?.slice(0, 160) || `Check out this Drop on Promorang and earn Promo Points!`}
                ogImage={ogImage}
                ogType="article"
                canonicalUrl={`https://promorang.co/d/${drop.id}`}
                keywords={`promorang drop, ${drop.title}, earn promo points, content engagement`}
            />
            <MarketingNav />

            {/* Drop Hero */}
            <section className="py-12 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
                        {/* Drop Image */}
                        {drop.preview_image && (
                            <div className="aspect-video bg-pr-surface-2 relative">
                                <img
                                    src={drop.preview_image}
                                    alt={drop.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Key Cost Badge */}
                                {keyCost > 0 && (
                                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                        <Key className="w-4 h-4 text-yellow-500" />
                                        <span className="text-white font-bold">{keyCost} Keys</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Drop Content */}
                        <div className="p-8">
                            {/* Creator Info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {drop.creator_avatar ? (
                                        <img src={drop.creator_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-pr-text-1">{drop.creator_name || 'Anonymous Creator'}</div>
                                    <div className="text-sm text-pr-text-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {formattedDate}
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl md:text-4xl font-bold text-pr-text-1 mb-4">{drop.title}</h1>

                            {/* Description */}
                            <p className="text-pr-text-2 text-lg leading-relaxed mb-8">{drop.description}</p>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <Eye className="w-5 h-5 text-pr-text-2 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">{drop.views_count?.toLocaleString() || 0}</div>
                                    <div className="text-xs text-pr-text-2">Views</div>
                                </div>
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">{drop.likes_count?.toLocaleString() || 0}</div>
                                    <div className="text-xs text-pr-text-2">Likes</div>
                                </div>
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <Share2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">{drop.shares_count?.toLocaleString() || 0}</div>
                                    <div className="text-xs text-pr-text-2">Shares</div>
                                </div>
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">{drop.promo_points_reward?.toLocaleString() || 0}</div>
                                    <div className="text-xs text-pr-text-2">Promo Points</div>
                                </div>
                            </div>

                            {/* CTA - Auth-aware */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleEngage}
                                    className={`flex-1 px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${canEngage
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-xl shadow-green-500/20'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-xl shadow-blue-500/20'
                                        }`}
                                >
                                    {!user ? (
                                        <>Sign Up to Engage <ArrowRight className="w-5 h-5" /></>
                                    ) : canEngage ? (
                                        <>Engage & Earn <ArrowRight className="w-5 h-5" /></>
                                    ) : (
                                        <><Lock className="w-5 h-5" /> {keyCost} Keys Required</>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied!');
                                    }}
                                    className="px-8 py-4 bg-pr-surface-2 border border-pr-border text-pr-text-1 rounded-lg font-semibold hover:bg-pr-surface-3 transition-all flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" /> Share
                                </button>
                            </div>

                            {/* Key Info */}
                            {user && keyCost > 0 && (
                                <div className="mt-4 p-4 bg-pr-surface-2 rounded-lg flex items-center justify-between">
                                    <div className="text-pr-text-2 text-sm">Your Keys</div>
                                    <div className={`font-bold ${userKeys >= keyCost ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {userKeys} / {keyCost} required
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* What is Promorang? */}
            <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">What is Promorang?</h2>
                    <p className="text-pr-text-2 mb-8 max-w-2xl mx-auto">
                        Promorang is a platform where you earn Promo Points by engaging with content you love.
                        Share drops, make forecasts, and build your way to Partner tier with revenue share.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/content-shares" className="text-green-500 hover:underline">Learn about Content Shares →</a>
                        <a href="/forecasts" className="text-blue-500 hover:underline">Learn about Forecasts →</a>
                        <a href="/about/growth-hub" className="text-purple-500 hover:underline">Learn about Growth Hub →</a>
                    </div>
                </div>
            </section>

            <MarketingFooter />

            {/* Key Gate Modal */}
            <KeyGateModal
                isOpen={showKeyModal}
                onClose={() => setShowKeyModal(false)}
                keyCost={keyCost}
                userKeys={userKeys}
                isLoggedIn={!!user}
                dropTitle={drop.title}
            />
        </div>
    );
}
