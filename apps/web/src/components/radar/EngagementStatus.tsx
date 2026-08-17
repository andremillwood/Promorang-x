import { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface EngagementMetrics {
    user_id: string;
    platform: string;
    raw_followers: number;
    engagement_rate: number;
    effective_followers: number;
    avg_likes_per_post: number;
    avg_comments_per_post: number;
    total_posts_analyzed: number;
    last_synced_at: string | null;
}

interface TrustTier {
    trust_level: 'low' | 'standard' | 'high';
    multiplier: number;
}

interface EngagementStatusProps {
    className?: string;
    showSyncButton?: boolean;
    onSync?: () => void;
}

export default function EngagementStatus({
    className = '',
    showSyncButton = true,
    onSync
}: EngagementStatusProps) {
    const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
    const [trustTier, setTrustTier] = useState<TrustTier | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [metricsRes, tierRes] = await Promise.all([
                fetch('/api/users/engagement/metrics', { credentials: 'include' }),
                fetch('/api/users/trust-tier', { credentials: 'include' })
            ]);

            if (metricsRes.ok) {
                const data = await metricsRes.json();
                if (data.success) {
                    setMetrics(data.metrics);
                }
            }

            if (tierRes.ok) {
                const data = await tierRes.json();
                if (data.success) {
                    setTrustTier(data);
                }
            }
        } catch (error) {
            console.error('Error fetching engagement data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            // This would typically trigger an Instagram scrape or API sync
            // For now, we'll just refresh the data
            await fetchData();
            onSync?.();
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className={`animate-pulse bg-white rounded-xl p-6 border ${className}`}>
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className={`bg-white rounded-xl p-6 border border-gray-200 ${className}`}>
                <div className="flex items-center space-x-3 text-gray-500">
                    <AlertCircle className="w-5 h-5" />
                    <span>No engagement data available. Verify your social account to get started.</span>
                </div>
            </div>
        );
    }

    const effectivenessRatio = metrics.raw_followers > 0
        ? metrics.effective_followers / metrics.raw_followers
        : 0;

    const engagementPercent = (metrics.engagement_rate * 100).toFixed(2);
    const isHealthy = effectivenessRatio >= 0.5;

    const getTrustBadge = () => {
        if (!trustTier) return null;

        const badges = {
            low: { color: 'bg-red-100 text-red-700', label: 'Low Trust', icon: TrendingDown },
            standard: { color: 'bg-gray-100 text-gray-700', label: 'Standard', icon: CheckCircle },
            high: { color: 'bg-green-100 text-green-700', label: 'High Trust', icon: TrendingUp }
        };

        const badge = badges[trustTier.trust_level];
        const Icon = badge.icon;

        return (
            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="w-3 h-3" />
                <span>{badge.label}</span>
                {trustTier.multiplier !== 1.0 && (
                    <span className="opacity-75">({trustTier.multiplier}x)</span>
                )}
            </div>
        );
    };

    return (
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Follower Health</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                        {getTrustBadge()}
                        {showSyncButton && (
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors disabled:opacity-50"
                                title="Sync engagement data"
                            >
                                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Raw Followers</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {metrics.raw_followers.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Effective Followers</p>
                        <p className={`text-2xl font-bold ${isHealthy ? 'text-green-600' : 'text-amber-600'}`}>
                            {metrics.effective_followers.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Effectiveness Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Effectiveness</span>
                        <span className={`font-medium ${isHealthy ? 'text-green-600' : 'text-amber-600'}`}>
                            {(effectivenessRatio * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isHealthy ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'
                                }`}
                            style={{ width: `${Math.min(effectivenessRatio * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Engagement Details */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-gray-900">{engagementPercent}%</p>
                        <p className="text-xs text-gray-500">Engagement Rate</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-gray-900">{metrics.avg_likes_per_post}</p>
                        <p className="text-xs text-gray-500">Avg Likes</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-semibold text-gray-900">{metrics.avg_comments_per_post}</p>
                        <p className="text-xs text-gray-500">Avg Comments</p>
                    </div>
                </div>

                {/* Status Message */}
                <div className={`p-3 rounded-lg ${isHealthy ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <p className={`text-sm ${isHealthy ? 'text-green-700' : 'text-amber-700'}`}>
                        {isHealthy
                            ? '✨ Great engagement! Your followers are active and engaged.'
                            : '⚠️ Your engagement is below average. Focus on authentic interactions to improve your effective follower count.'}
                    </p>
                </div>

                {/* Last Synced */}
                {metrics.last_synced_at && (
                    <p className="text-xs text-gray-400 mt-4 text-center">
                        Last synced: {new Date(metrics.last_synced_at).toLocaleDateString()}
                    </p>
                )}
            </div>
        </div>
    );
}
