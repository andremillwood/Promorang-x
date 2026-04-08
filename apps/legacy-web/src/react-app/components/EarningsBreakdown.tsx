import { TrendingUp, Award, Users, PlusCircle } from 'lucide-react';

interface EarningsBreakdownProps {
    data: {
        total_weighted: number;
        breakdown: Array<{
            type: string;
            amount: number;
            percentage: number;
        }>;
    } | null;
    loading: boolean;
}

export default function EarningsBreakdown({ data, loading }: EarningsBreakdownProps) {
    if (loading) {
        return (
            <div className="bg-pr-surface-card border border-pr-surface-3 rounded-2xl p-6 animate-pulse">
                <div className="h-6 w-48 bg-pr-surface-3 rounded mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 w-full bg-pr-surface-2 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.breakdown.length === 0) {
        return (
            <div className="bg-pr-surface-card border border-pr-surface-3 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-pr-text-1 mb-2">Earnings Breakdown</h3>
                <p className="text-sm text-pr-text-2 italic">No weighted earnings data available yet. Complete missions to see your breakdown!</p>
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'missions':
                return <TrendingUp className="w-5 h-5 text-blue-600" />;
            case 'staking':
                return <Award className="w-5 h-5 text-purple-600" />;
            case 'referrals':
                return <Users className="w-5 h-5 text-green-600" />;
            default:
                return <PlusCircle className="w-5 h-5 text-orange-600" />;
        }
    };

    const getColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'missions':
                return 'bg-blue-100 text-blue-900';
            case 'staking':
                return 'bg-purple-100 text-purple-900';
            case 'referrals':
                return 'bg-green-100 text-green-900';
            default:
                return 'bg-orange-100 text-orange-900';
        }
    };

    return (
        <div className="bg-pr-surface-card border border-pr-surface-3 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-pr-text-1">Earnings Breakdown</h3>
                    <p className="text-sm text-pr-text-2">Total Weighted Contributions: <span className="font-bold text-pr-text-1">{data.total_weighted.toLocaleString()} Verified Credits</span></p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-pr-accent-orange">{(data.total_weighted * 0.01).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    <p className="text-[10px] text-pr-text-2 font-medium uppercase tracking-wider">Estimated Value</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.breakdown.map((item) => (
                    <div key={item.type} className="bg-pr-surface-3/30 border border-pr-surface-3 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg ${getColor(item.type)}`}>
                                {getIcon(item.type)}
                            </div>
                            <span className="text-sm font-bold text-pr-text-2">{item.percentage}%</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-pr-text-2 capitalize">{item.type}</p>
                            <p className="text-xl font-bold text-pr-text-1">{item.amount.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Bars View */}
            <div className="mt-8 space-y-4">
                {data.breakdown.map((item) => (
                    <div key={`bar-${item.type}`} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                            <span className="text-pr-text-2">{item.type}</span>
                            <span className="text-pr-text-1">{item.amount.toLocaleString()} Verified Credits</span>
                        </div>
                        <div className="w-full bg-pr-surface-3 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${item.type === 'missions' ? 'bg-blue-500' :
                                        item.type === 'staking' ? 'bg-purple-500' :
                                            item.type === 'referrals' ? 'bg-green-500' :
                                                'bg-orange-500'
                                    }`}
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-pr-surface-2 rounded-xl flex items-start space-x-3 border border-dashed border-pr-border">
                <Sparkles className="w-5 h-5 text-pr-accent-orange shrink-0 mt-0.5" />
                <p className="text-xs text-pr-text-2 leading-relaxed">
                    <strong>How it works:</strong> Weighted contributions are the primary factor in your global rank. Higher difficulty missions (like Buy Missions) award significantly more weighted verified_credits than standard social activity.
                </p>
            </div>
        </div>
    );
}

import { Sparkles } from 'lucide-react';
