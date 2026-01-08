import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Shield, AlertTriangle, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';

interface Forecast {
    id: number;
    content_title: string;
    creator_name: string;
    expiration_date: string;
    pool_size: number;
    status: string;
    result?: string;
}

const AdminForecasts: React.FC = () => {
    const [forecasts, setForecasts] = useState<Forecast[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchForecasts();
    }, []);

    const fetchForecasts = async () => {
        try {
            // In a real app, this would be an admin-specific endpoint or filtered list
            // mocking fetching all for now, assuming /social-forecasts returns all if we don't filter rigorously?
            // Actually /social-forecasts usually returns active ones.
            const response = await api.get<Forecast[]>('/social-forecasts');
            if (Array.isArray(response)) {
                setForecasts(response);
            }
        } catch (error) {
            console.error('Failed to fetch forecasts', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: number, winningSide: 'over' | 'under') => {
        if (!confirm(`Are you sure you want to resolve forecast #${id} as ${winningSide.toUpperCase()}? This will trigger payouts.`)) {
            return;
        }

        setResolving(id);
        setMessage(null);

        try {
            const response = await api.post<{ success: boolean, message: string }>(`/social-forecasts/${id}/resolve`, {
                result: winningSide,
                winning_side: winningSide
            });

            if (response && response.success) {
                setMessage({ type: 'success', text: response.message || 'Operation successful' });
                fetchForecasts(); // Refresh list
            } else {
                setMessage({ type: 'error', text: 'Resolution failed' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Resolution failed' });
        } finally {
            setResolving(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-pr-pl-dark p-6 pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center space-x-3 mb-8">
                    <Shield className="w-8 h-8 text-pr-primary" />
                    <h1 className="text-2xl font-bold text-white">Admin: Forecast Resolution</h1>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="grid gap-6">
                    {forecasts.length === 0 ? (
                        <div className="bg-pr-surface p-8 rounded-xl text-center text-gray-400">
                            No active forecasts found to resolve.
                        </div>
                    ) : (
                        forecasts.map(forecast => (
                            <div key={forecast.id} className="bg-pr-surface p-6 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="bg-pr-primary/20 text-pr-primary px-2 py-0.5 rounded text-xs font-mono uppercase">
                                            #{forecast.id}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs uppercase ${forecast.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {forecast.status}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{forecast.content_title}</h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                                        <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> Pool: ${forecast.pool_size.toFixed(2)}</span>
                                        <span className="flex items-center">Creator: {forecast.creator_name}</span>
                                        <span className="flex items-center">Expires: {new Date(forecast.expiration_date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {forecast.status === 'active' ? (
                                        <>
                                            <button
                                                onClick={() => handleResolve(forecast.id, 'over')}
                                                disabled={resolving === forecast.id}
                                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                                            >
                                                <TrendingUp className="w-4 h-4 mr-2" />
                                                Win OVER
                                            </button>
                                            <button
                                                onClick={() => handleResolve(forecast.id, 'under')}
                                                disabled={resolving === forecast.id}
                                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                                            >
                                                <TrendingUp className="w-4 h-4 mr-2 rotate-180" />
                                                Win UNDER
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-gray-500 font-mono text-sm px-4 py-2 border border-white/10 rounded-lg">
                                            RESOLVED: {forecast.result?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminForecasts;
