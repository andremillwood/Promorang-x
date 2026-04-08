import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Target, Users } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface ForecastItem {
    id: number;
    content_title: string;
    creator_name: string;
    media_url: string;
    platform: string;
    odds: number;
    pool_size: number;
    participants: number;
}

export default function ForecastsPreviewSection() {
    const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchForecasts() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/social-forecasts/public?limit=3`);
                if (response.ok) {
                    const data = await response.json();
                    setForecasts(data.slice(0, 3) || []);
                }
            } catch (error) {
                console.error('Failed to fetch forecasts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchForecasts();
    }, []);

    if (loading) {
        return (
            <section className="py-16 bg-pr-surface-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (forecasts.length === 0) return null;

    return (
        <section className="py-16 bg-pr-surface-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-bold text-green-500 uppercase tracking-wider">Social Forecasts</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-pr-text-1">
                            Predict Performance
                        </h2>
                    </div>
                    <Link
                        to="/forecasts"
                        className="hidden sm:flex items-center gap-2 text-blue-500 hover:underline font-medium"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Forecasts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {forecasts.map((forecast) => (
                        <Link
                            key={forecast.id}
                            to={`/f/${forecast.id}`}
                            className="group bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden hover:shadow-2xl hover:border-green-500/50 transition-all flex flex-col"
                        >
                            <div className="aspect-[16/9] bg-pr-surface-2 relative overflow-hidden">
                                <img
                                    src={forecast.media_url}
                                    alt={forecast.content_title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                                    {forecast.platform}
                                </div>
                                <div className="absolute bottom-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    {forecast.odds}x Odds
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg text-pr-text-1 line-clamp-2 mb-2 group-hover:text-green-500 transition-colors">
                                    {forecast.content_title}
                                </h3>
                                <p className="text-sm text-pr-text-muted mb-4">by {forecast.creator_name}</p>

                                <div className="mt-auto pt-4 border-t border-pr-border space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-pr-text-2">
                                            <Target className="w-4 h-4 text-blue-500" />
                                            <span>Potential Pool</span>
                                        </div>
                                        <span className="font-bold text-pr-text-1">${forecast.pool_size.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-pr-text-2">
                                            <Users className="w-4 h-4 text-purple-500" />
                                            <span>Participants</span>
                                        </div>
                                        <span className="font-bold text-pr-text-1">{forecast.participants}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="mt-8 sm:hidden text-center">
                    <Link
                        to="/forecasts"
                        className="inline-flex items-center gap-2 text-blue-500 hover:underline font-medium"
                    >
                        View All Forecasts <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
