import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { useAuth } from '@/react-app/hooks/useAuth';
import { Share2, Eye, Heart, ArrowRight, Clock, User, Lock, DollarSign } from 'lucide-react';
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
}

export default function PublicContentPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [content, setContent] = useState<ContentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchContent() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content/${id}/public`);
                if (!response.ok) {
                    throw new Error('Content not found');
                }
                const data = await response.json();
                setContent(data.content || null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load content');
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchContent();
        }
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

    const ogImage = content.media_url || 'https://promorang.co/promorang-logo.png';
    const platformColors: Record<string, string> = {
        instagram: 'from-pink-500 to-purple-500',
        tiktok: 'from-black to-gray-800',
        youtube: 'from-red-500 to-red-600',
        twitter: 'from-blue-400 to-blue-500'
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title={`${content.title} | Promorang Content`}
                description={content.description?.slice(0, 160) || `Buy shares in this content on Promorang and earn as it performs!`}
                ogImage={ogImage}
                ogType="article"
                canonicalUrl={`https://promorang.co/c/${content.id}`}
                keywords={`promorang content, ${content.title}, content shares, ${content.platform}`}
            />
            <MarketingNav />

            {/* Content Hero */}
            <section className="py-12 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
                        {/* Media */}
                        {content.media_url && (
                            <div className="aspect-video bg-pr-surface-2 relative">
                                <img
                                    src={content.media_url}
                                    alt={content.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Platform Badge */}
                                <div className={`absolute top-4 left-4 bg-gradient-to-r ${platformColors[content.platform] || 'from-gray-500 to-gray-600'} text-white text-sm font-bold px-3 py-1 rounded-full capitalize`}>
                                    {content.platform}
                                </div>
                                {/* Share Price Badge */}
                                <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold">
                                    <DollarSign className="w-4 h-4" />
                                    {content.share_price?.toFixed(2)}/share
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-8">
                            {/* Creator Info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {content.creator_avatar ? (
                                        <img src={content.creator_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-pr-text-1">{content.creator_name || 'Anonymous Creator'}</div>
                                    <div className="text-sm text-pr-text-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {new Date(content.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-bold text-pr-text-1 mb-4">{content.title}</h1>
                            <p className="text-pr-text-2 text-lg leading-relaxed mb-8">{content.description}</p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <Eye className="w-5 h-5 text-pr-text-2 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">{content.views_count?.toLocaleString() || 0}</div>
                                    <div className="text-xs text-pr-text-2">Views</div>
                                </div>
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">{content.likes_count?.toLocaleString() || 0}</div>
                                    <div className="text-xs text-pr-text-2">Likes</div>
                                </div>
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <Share2 className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">{content.shares_count?.toLocaleString() || 0}</div>
                                    <div className="text-xs text-pr-text-2">Shares</div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to={user ? `/content/${id}` : '/auth'}
                                    className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                    {user ? (
                                        <>Buy Shares <DollarSign className="w-5 h-5" /></>
                                    ) : (
                                        <><Lock className="w-5 h-5" /> Sign Up to Buy Shares</>
                                    )}
                                </Link>
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
                        </div>
                    </div>
                </div>
            </section>

            {/* What is Content Shares? */}
            <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">What are Content Shares?</h2>
                    <p className="text-pr-text-2 mb-8 max-w-2xl mx-auto">
                        Buy shares in content you believe will perform well. As the content gains engagement,
                        the share value increases and you can sell for profit.
                    </p>
                    <Link to="/content-shares" className="inline-flex items-center gap-2 text-green-500 hover:underline font-medium">
                        Learn More About Content Shares <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
