import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, ArrowRight, Eye, Heart, Zap } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface ContentItem {
    id: string;
    title: string;
    creator_name: string;
    media_url: string;
    platform: string;
    impressions: number;
    engagement_rate: number;
}

export default function TrendingContentSection() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrending() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/content/public?limit=4`);
                if (response.ok) {
                    const data = await response.json();
                    setContent(data.slice(0, 4) || []);
                }
            } catch (error) {
                console.error('Failed to fetch trending content:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchTrending();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-pr-surface-2 border-y border-pr-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (content.length === 0) return null;

    return (
        <section className="py-16 bg-pr-surface-2 border-y border-pr-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-bold text-blue-500 uppercase tracking-wider">Trending Content</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-pr-text-1">
                            Popular Content Shares
                        </h2>
                    </div>
                    <Link
                        to="/content-shares"
                        className="hidden sm:flex items-center gap-2 text-blue-500 hover:underline font-medium"
                    >
                        Explore All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {content.map((item) => (
                        <Link
                            key={item.id}
                            to={`/c/${item.id}`}
                            className="group bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-500/50 transition-all transform hover:-translate-y-1"
                        >
                            <div className="aspect-video bg-pr-surface-3 relative overflow-hidden">
                                <img
                                    src={item.media_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <span className="text-white text-xs font-bold uppercase tracking-wider">{item.platform}</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-pr-text-1 line-clamp-1 mb-1 group-hover:text-blue-500 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-pr-text-muted mb-3">by {item.creator_name}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-pr-text-2">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5" /> {(item.impressions / 1000).toFixed(1)}k
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5" /> {(item.engagement_rate * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <Share2 className="w-4 h-4 text-pr-text-muted group-hover:text-blue-500 transition-colors" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 sm:hidden text-center">
                    <Link
                        to="/content-shares"
                        className="inline-flex items-center gap-2 text-blue-500 hover:underline font-medium"
                    >
                        Explore All Content <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
