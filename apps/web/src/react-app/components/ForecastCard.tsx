import { Link } from 'react-router-dom';
import { Clock, Target, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '@/react-app/config';

export interface SocialForecast {
    id: number;
    creator_id: number;
    creator_name: string;
    creator_avatar?: string;
    platform: string;
    content_url: string;
    media_url?: string;
    content_id?: number;
    content_title?: string;
    content_platform?: string;
    forecast_type: string;
    target_value: number;
    current_value: number;
    odds: number;
    pool_size: number;
    creator_initial_amount: number;
    creator_side: string;
    expires_at: string;
    status: string;
    created_at: string;
}

interface ForecastCardProps {
    forecast: SocialForecast;
    onPlacePrediction?: (forecast: SocialForecast) => void;
}

export default function ForecastCard({ forecast, onPlacePrediction }: ForecastCardProps) {
    const isExpired = new Date(forecast.expires_at) <= new Date();

    const formatNumber = (value: number | null | undefined, options?: Intl.NumberFormatOptions) => {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return '—';
        }
        return value.toLocaleString(undefined, options);
    };

    const formatCurrency = (value: number | null | undefined) => {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            return '—';
        }
        return value.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatTimeRemaining = (expiresAt: string) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }

        return `${hours}h ${minutes}m`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'expired': return 'text-pr-text-2 bg-pr-surface-2';
            case 'resolved': return 'text-blue-600 bg-blue-100';
            default: return 'text-pr-text-2 bg-pr-surface-2';
        }
    };

    return (
        <div className="bg-pr-surface-card rounded-lg border border-pr-surface-3 p-6 hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={forecast.creator_avatar || `${API_BASE_URL}/api/placeholder/32/32`}
                        alt={forecast.creator_name}
                        className="w-8 h-8 rounded-full"
                    />
                    <div>
                        <Link to={`/prediction/${forecast.id}`} className="hover:text-blue-600 transition-colors">
                            <p className="font-medium text-pr-text-1">{forecast.creator_name}</p>
                        </Link>
                        <p className="text-xs text-pr-text-2">{forecast.platform}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(forecast.status)}`}>
                        {forecast.status}
                    </span>
                    <a
                        href={forecast.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pr-text-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {forecast.media_url ? (
                <div className="mb-4 rounded-lg overflow-hidden h-40 bg-pr-surface-2 group">
                    <img
                        src={forecast.media_url}
                        alt={forecast.content_title || 'Content'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            ) : (
                <div className="mb-4 rounded-lg overflow-hidden h-40 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-50">
                    <div className="text-center p-4">
                        <Target className="w-12 h-12 text-blue-400 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium text-blue-600">Prediction Market</p>
                        <p className="text-xs text-blue-500/70">Forecast {forecast.forecast_type} analysis</p>
                    </div>
                </div>
            )}

            <div className="mb-4 p-3 bg-pr-surface-2 rounded-lg border border-pr-surface-3">
                <p className="text-sm font-semibold text-pr-text-1 mb-1 line-clamp-2">
                    {forecast.content_title || forecast.title || 'Untitled Market'}
                </p>
                {forecast.content_platform && (
                    <p className="text-xs text-pr-text-2 flex items-center">
                        <span className="w-1 h-1 rounded-full bg-pr-text-2 mr-2" />
                        {forecast.content_platform}
                    </p>
                )}
            </div>

            <div className="space-y-3 mt-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                            {forecast.forecast_type} {formatNumber(forecast.target_value)}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-pr-text-2">Pool</p>
                        <p className="font-semibold text-green-600">{formatCurrency(forecast.pool_size)}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-pr-text-2">
                            {formatTimeRemaining(forecast.expires_at)}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-pr-text-2">Odds</p>
                        <p className="font-semibold text-blue-600">
                            {typeof forecast.odds === 'number' && !Number.isNaN(forecast.odds) ? `${forecast.odds}x` : '—'}
                        </p>
                    </div>
                </div>

                {forecast.creator_side && forecast.creator_initial_amount > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-pr-text-2 mb-1">Creator's Prediction</p>
                        <p className="text-sm font-medium text-blue-600 truncate">
                            {forecast.creator_side.toUpperCase()} • {formatCurrency(forecast.creator_initial_amount)} staked
                        </p>
                    </div>
                )}

                {onPlacePrediction && !isExpired && (
                    <button
                        onClick={() => onPlacePrediction(forecast)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-2"
                    >
                        Make Your Prediction
                    </button>
                )}
            </div>
        </div>
    );
}
