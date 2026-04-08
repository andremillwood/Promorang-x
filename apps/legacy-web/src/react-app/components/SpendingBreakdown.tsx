import { ActivityBreakdown, KPICard } from './AnalyticsCharts';
import { Wallet, Target, Users, TrendingUp } from 'lucide-react';

interface SpendingBreakdownProps {
    data: {
        totalSpent: number;
        breakdown: Array<{ name: string; value: number; color: string }>;
        roi: number;
        acquisitions: number;
        costPerAcquisition: number;
    };
}

export default function SpendingBreakdown({ data }: SpendingBreakdownProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Credits Spent"
                    value={`${data.totalSpent.toLocaleString()} CRD`}
                    icon={<Wallet className="w-4 h-4" />}
                    change={12}
                    changeType="increase"
                />
                <KPICard
                    title="Total Conversions"
                    value={data.acquisitions.toLocaleString()}
                    icon={<Target className="w-4 h-4" />}
                    change={8}
                    changeType="increase"
                />
                <KPICard
                    title="Avg. CPA"
                    value={`${data.costPerAcquisition.toFixed(2)} CRD`}
                    icon={<Users className="w-4 h-4" />}
                    change={5}
                    changeType="decrease"
                />
                <KPICard
                    title="Platform ROI"
                    value={`${data.roi}x`}
                    icon={<TrendingUp className="w-4 h-4" />}
                    change={15}
                    changeType="increase"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-pr-surface-card rounded-2xl p-6 border border-pr-surface-3 shadow-sm lg:col-span-1">
                    <h3 className="text-lg font-bold text-pr-text-1 mb-6">Spending by Objective</h3>
                    <div className="h-[300px]">
                        <ActivityBreakdown data={data.breakdown} />
                    </div>
                    <div className="mt-4 space-y-2">
                        {data.breakdown.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-pr-text-2 font-medium">{item.name}</span>
                                </div>
                                <span className="text-pr-text-1 font-bold">{((item.value / data.totalSpent) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-pr-surface-card rounded-2xl p-6 border border-pr-surface-3 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-bold text-pr-text-1 mb-6">Efficiency Analysis</h3>
                    <div className="space-y-6">
                        <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400">Viral Growth Efficiency</h4>
                                    <p className="text-xs text-emerald-600/70">Social Proof Activations</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">High</span>
                            </div>
                            <p className="text-sm text-pr-text-2 mb-4 leading-relaxed">
                                Your social proof campaigns are generating 3.4x more organic reach per credit compared to basic engagement drops.
                            </p>
                            <div className="h-2 w-full bg-emerald-200 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[85%]" />
                            </div>
                        </div>

                        <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-blue-700 dark:text-blue-400">Engagement Density</h4>
                                    <p className="text-xs text-blue-600/70">Interaction Activations</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Optimal</span>
                            </div>
                            <p className="text-sm text-pr-text-2 mb-4 leading-relaxed">
                                Platform users are spending an average of 12 seconds more on your content when incentivized via credits.
                            </p>
                            <div className="h-2 w-full bg-blue-200 dark:bg-blue-900/50 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[62%]" />
                            </div>
                        </div>

                        <div className="p-5 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-purple-700 dark:text-purple-400">Retention Catalyst</h4>
                                    <p className="text-xs text-purple-600/70">Referral Activations</p>
                                </div>
                                <span className="px-3 py-1 bg-purple-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Medium</span>
                            </div>
                            <p className="text-sm text-pr-text-2 mb-4 leading-relaxed">
                                Users acquired via social referrals have a 15% higher 30-day retention rate than organic users.
                            </p>
                            <div className="h-2 w-full bg-purple-200 dark:bg-purple-900/50 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[48%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
