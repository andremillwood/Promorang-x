import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MarketingNav from '@/react-app/components/marketing/MarketingNav';
import MarketingFooter from '@/react-app/components/marketing/MarketingFooter';
import SEO from '@/react-app/components/SEO';
import { useAuth } from '@/react-app/hooks/useAuth';
import { TrendingUp, Clock, Users, ArrowRight, Lock, Target, DollarSign } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

interface ForecastData {
    id: number;
    creator_name: string;
    platform: string;
    content_title: string;
    media_url?: string;
    forecast_type: string;
    target_value: number;
    current_value: number;
    odds: number;
    pool_size: number;
    expires_at: string;
    participants: number;
    status: string;
}

export default function PublicForecastPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchForecast() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/social-forecasts/${id}/public`);
                if (!response.ok) {
                    throw new Error('Forecast not found');
                }
                const data = await response.json();
                setForecast(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load forecast');
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchForecast();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen-dynamic bg-pr-surface-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !forecast) {
        return (
            <div className="min-h-screen-dynamic bg-pr-surface-background">
                <MarketingNav />
                <div className="max-w-4xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-3xl font-bold text-pr-text-1 mb-4">Forecast Not Found</h1>
                    <p className="text-pr-text-2 mb-8">This forecast may have ended or is no longer available.</p>
                    <Link to="/forecasts" className="text-blue-500 hover:underline">← Learn About Forecasts</Link>
                </div>
                <MarketingFooter />
            </div>
        );
    }

    const ogImage = forecast.media_url || 'https://promorang.co/promorang-logo.png';
    const progress = (forecast.current_value / forecast.target_value) * 100;
    const timeLeft = new Date(forecast.expires_at).getTime() - Date.now();
    const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

    const platformColors: Record<string, string> = {
        instagram: 'from-pink-500 to-purple-500',
        tiktok: 'from-black to-gray-800',
        youtube: 'from-red-500 to-red-600',
        twitter: 'from-blue-400 to-blue-500'
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <SEO
                title={`${forecast.content_title} Forecast | Promorang`}
                description={`Predict if this ${forecast.platform} content will hit ${forecast.target_value.toLocaleString()} ${forecast.forecast_type}. Current odds: ${forecast.odds}x`}
                ogImage={ogImage}
                ogType="article"
                canonicalUrl={`https://promorang.co/f/${forecast.id}`}
                keywords={`promorang forecast, ${forecast.platform}, ${forecast.forecast_type}, prediction market`}
            />
            <MarketingNav />

            {/* Forecast Hero */}
            <section className="py-12 md:py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-pr-surface-card border border-pr-border rounded-2xl overflow-hidden">
                        {/* Media */}
                        {forecast.media_url && (
                            <div className="aspect-video bg-pr-surface-2 relative">
                                <img
                                    src={forecast.media_url}
                                    alt={forecast.content_title}
                                    className="w-full h-full object-cover"
                                />
                                <div className={`absolute top-4 left-4 bg-gradient-to-r ${platformColors[forecast.platform] || 'from-gray-500 to-gray-600'} text-white text-sm font-bold px-3 py-1 rounded-full capitalize`}>
                                    {forecast.platform}
                                </div>
                                <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-bold">
                                    <TrendingUp className="w-4 h-4" />
                                    {forecast.odds}x Odds
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm text-pr-text-muted">by {forecast.creator_name}</span>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-bold text-pr-text-1 mb-4">{forecast.content_title}</h1>

                            {/* Forecast Details */}
                            <div className="bg-pr-surface-2 rounded-xl p-6 mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Target className="w-5 h-5 text-blue-500" />
                                    <span className="font-bold text-pr-text-1">Forecast Target</span>
                                </div>
                                <p className="text-2xl font-extrabold text-pr-text-1 mb-4">
                                    Will this content hit <span className="text-blue-500">{forecast.target_value.toLocaleString()} {forecast.forecast_type}</span>?
                                </p>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-pr-text-2">Current: {forecast.current_value.toLocaleString()}</span>
                                        <span className="text-pr-text-1 font-bold">{progress.toFixed(1)}%</span>
                                    </div>
                                    <div className="h-3 bg-pr-surface-3 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'} rounded-full transition-all`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">${forecast.pool_size?.toFixed(0) || 0}</div>
                                    <div className="text-xs text-pr-text-2">Pool Size</div>
                                </div>
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <Users className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">{forecast.participants || 0}</div>
                                    <div className="text-xs text-pr-text-2">Participants</div>
                                </div>
                                <div className="text-center p-4 bg-pr-surface-2 rounded-lg">
                                    <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                                    <div className="text-xl font-bold text-pr-text-1">{hoursLeft}h</div>
                                    <div className="text-xs text-pr-text-2">Left</div>
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to={user ? `/forecasts/${id}` : '/auth'}
                                    className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                >
                                    {user ? (
                                        <>Make Prediction <TrendingUp className="w-5 h-5" /></>
                                    ) : (
                                        <><Lock className="w-5 h-5" /> Sign Up to Predict</>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is Forecasts? */}
            <section className="py-16 bg-pr-surface-1 border-y border-pr-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-pr-text-1 mb-4">What are Forecasts?</h2>
                    <p className="text-pr-text-2 mb-8 max-w-2xl mx-auto">
                        Predict whether content will hit its performance target. If you're right,
                        you win a share of the pool based on the odds.
                    </p>
                    <Link to="/forecasts" className="inline-flex items-center gap-2 text-blue-500 hover:underline font-medium">
                        Learn More About Forecasts <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
