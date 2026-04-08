import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { useAuth } from '@/react-app/hooks/useAuth';
import { ArrowRight, Clock, User, Lock, Timer, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface ContentData {
    id: string;
    title: string;
    description: string;
    media_url?: string;
    platform: string;
    creator_name?: string;
    creator_avatar?: string;
    views_count: number;
    likes_count: number;
    shares_count: number;
    share_price: number;
    created_at: string;
    starts_at?: string;
    ends_at?: string;
    min_access_rank?: number;
}

type AccessState = 'LOCKED' | 'COUNTDOWN' | 'AVAILABLE' | 'MISSED';

function getAccessState(content: ContentData, user: any, userAccessRank: number): AccessState {
    const now = new Date();
    const startsAt = content.starts_at ? new Date(content.starts_at) : null;
    const endsAt = content.ends_at ? new Date(content.ends_at) : null;
    const minRank = content.min_access_rank || 0;

    if (endsAt && now > endsAt) return 'MISSED';
    if (startsAt && now < startsAt) return 'COUNTDOWN';
    if (!user || userAccessRank < minRank) return 'LOCKED';
    return 'AVAILABLE';
}

// LOCKED State Component
function LockedState({ content, navigate }: { content: ContentData; navigate: (path: string) => void }) {
    return (
        <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
            {content.media_url && (
                <div className="aspect-video bg-pr-surface-2 relative">
                    <img src={content.media_url} alt="" className="w-full h-full object-cover blur-md opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-2xl flex items-center gap-3">
                            <Lock className="w-6 h-6 text-yellow-500" />
                            <span className="text-white font-bold">Access Rank Required</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="p-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1 mb-4">{content.title}</h1>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
                    <Lock className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                    <p className="text-pr-text-1 font-semibold mb-2">
                        This content requires Day {content.min_access_rank || 7}+ Access Rank
                    </p>
                    <p className="text-pr-text-2 text-sm">
                        Active users unlock access to content like this. Start building your rank today.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/auth')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                    Start Day 1 to Unlock Future Access <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// COUNTDOWN State Component  
function CountdownState({ content, startsAt, navigate }: { content: ContentData; startsAt: Date; navigate: (path: string) => void }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const diff = startsAt.getTime() - now.getTime();
            if (diff <= 0) { setTimeLeft('Starting now...'); return; }
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(hours > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [startsAt]);

    return (
        <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
            {content.media_url && (
                <div className="aspect-video bg-pr-surface-2 relative">
                    <img src={content.media_url} alt="" className="w-full h-full object-cover opacity-70" />
                </div>
            )}
            <div className="p-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1 mb-4">{content.title}</h1>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
                    <Timer className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                    <p className="text-pr-text-1 font-semibold mb-2">Available in:</p>
                    <div className="text-4xl font-mono font-bold text-blue-500 mb-4">{timeLeft}</div>
                    <p className="text-pr-text-2 text-sm">Higher Access Rank users get notified first.</p>
                </div>
                <button
                    onClick={() => navigate('/auth')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                    Join to Start Building Access Rank <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// MISSED State Component
function MissedState({ content, endedAt, navigate }: { content: ContentData; endedAt: Date; navigate: (path: string) => void }) {
    const formattedDate = endedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
            {content.media_url && (
                <div className="aspect-video bg-pr-surface-2 relative">
                    <img src={content.media_url} alt="" className="w-full h-full object-cover grayscale opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-2xl flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            <span className="text-white font-bold">Content Closed</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="p-8 text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1 mb-4 opacity-70">{content.title}</h1>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
                    <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                    <p className="text-pr-text-1 font-semibold mb-2">
                        This content was available to active users on {formattedDate}
                    </p>
                    <p className="text-pr-text-2 text-sm">This opportunity has ended. Active users saw it first.</p>
                </div>
                <button
                    onClick={() => navigate('/auth')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 mx-auto"
                >
                    Don't Miss the Next One <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default function PublicContentPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [content, setContent] = useState<ContentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userAccessRank] = useState(0);

    useEffect(() => {
        async function fetchContent() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content/${id}/public`);
                if (!response.ok) throw new Error('Content not found');
                const data = await response.json();
                setContent(data.content || null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load content');
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchContent();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen-dynamic bg-pr-surface-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen-dynamic bg-pr-surface-background">
                <MarketingNav />
                <div className="max-w-4xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-3xl font-bold text-pr-text-1 mb-4">Content Not Found</h1>
                    <p className="text-pr-text-2 mb-8">This content may have been removed or is no longer available.</p>
                    <Link to="/" className="text-blue-500 hover:underline">← Back to Home</Link>
                </div>
                <MarketingFooter />
            </div>
        );
    }

    const accessState = getAccessState(content, user, userAccessRank);
    const ogImage = content.media_url || 'https://promorang.co/promorang-logo.png';

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title={`${content.title} | Promorang`}
                description={content.description?.slice(0, 160) || `Content opportunity on Promorang.`}
                ogImage={ogImage}
                ogType="article"
                canonicalUrl={`https://promorang.co/c/${content.id}`}
                keywords={`promorang, content, ${content.title}`}
            />
            <MarketingNav />

            <section className="py-12 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {accessState === 'LOCKED' && <LockedState content={content} navigate={navigate} />}
                    {accessState === 'COUNTDOWN' && content.starts_at && (
                        <CountdownState content={content} startsAt={new Date(content.starts_at)} navigate={navigate} />
                    )}
                    {accessState === 'MISSED' && content.ends_at && (
                        <MissedState content={content} endedAt={new Date(content.ends_at)} navigate={navigate} />
                    )}
                    {accessState === 'AVAILABLE' && (
                        <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
                            {content.media_url && (
                                <div className="aspect-video bg-pr-surface-2">
                                    <img src={content.media_url} alt={content.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                                        {content.creator_avatar ? (
                                            <img src={content.creator_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1">{content.creator_name || 'Anonymous'}</div>
                                        <div className="text-sm text-pr-text-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {new Date(content.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-bold text-pr-text-1 mb-4">{content.title}</h1>
                                <p className="text-pr-text-2 text-lg leading-relaxed mb-8">{content.description}</p>
                                <Link
                                    to={`/content/${id}`}
                                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                    View Content <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">How Access Works</h2>
                    <p className="text-pr-text-2 mb-8 max-w-2xl mx-auto">
                        Promorang gives priority access to active users. The more consistently you participate,
                        the earlier you see opportunities and the more you can access.
                    </p>
                    <a href="/how-it-works" className="text-blue-500 hover:underline font-semibold">
                        Learn how Access Rank works →
                    </a>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
