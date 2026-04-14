import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, Users, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCard } from './MetricCard';
import { DateRangePicker } from './DateRangePicker';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import {
    formatCurrency,
    formatCompactNumber,
    formatPercent,
    getPresetDateRanges,
    exportToCSV
} from './utils';
import { Button } from '@/components/ui/button';
import { Download, Loader2, PlaySquare } from 'lucide-react';
import { EvidenceFeed } from './EvidenceFeed';
import { AutomatedRecap } from './AutomatedRecap';

interface BrandAnalyticsDashboardProps {
    userId: string;
}

/**
 * Comprehensive analytics dashboard for Brands
 */
export function BrandAnalyticsDashboard({ userId }: BrandAnalyticsDashboardProps) {
    const presets = getPresetDateRanges();
    const [dateRange, setDateRange] = useState({
        start: presets.last30Days.start,
        end: presets.last30Days.end,
    });
    const [isRecapOpen, setIsRecapOpen] = useState(false);

    // Fetch brand campaign analytics
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['brand-analytics', userId, dateRange],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('brand_campaign_analytics')
                .select('*')
                .eq('brand_id', userId)
                .gte('created_at', dateRange.start.toISOString())
                .lte('created_at', dateRange.end.toISOString());

            if (error) throw error;
            return data;
        },
    });

    // Aggregate metrics
    const metrics = analytics?.reduce(
        (acc, item) => ({
            totalSpent: acc.totalSpent + (item.total_spent || 0),
            totalParticipants: acc.totalParticipants + (item.total_participants || 0),
            totalSponsorships: acc.totalSponsorships + (item.moments_sponsored || 0),
            activeCampaigns: acc.activeCampaigns + (item.status === 'active' ? 1 : 0),
        }),
        { totalSpent: 0, totalParticipants: 0, totalSponsorships: 0, activeCampaigns: 0 }
    ) || { totalSpent: 0, totalParticipants: 0, totalSponsorships: 0, activeCampaigns: 0 };

    // Calculate ROI metrics
    const avgCostPerParticipant = metrics.totalParticipants > 0
        ? metrics.totalSpent / metrics.totalParticipants
        : 0;

    // Prepare chart data
    const spendByDay = analytics?.reduce((acc: any[], item) => {
        const date = new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = acc.find(d => d.date === date);
        if (existing) {
            existing.spent += item.total_spent || 0;
            existing.participants += item.total_participants || 0;
        } else {
            acc.push({
                date,
                spent: item.total_spent || 0,
                participants: item.total_participants || 0
            });
        }
        return acc;
    }, []) || [];

    const campaignPerformance = analytics?.map((item: any) => ({
        name: item.campaign_name,
        spent: item.total_spent || 0,
        participants: item.total_participants || 0,
        sponsorships: item.moments_sponsored || 0,
        roi: item.total_participants > 0 ? (item.total_spent / item.total_participants) : 0,
    })).sort((a: any, b: any) => b.participants - a.participants).slice(0, 10) || [];

    const budgetUtilization = analytics?.map((item: any) => ({
        name: item.campaign_name,
        value: item.budget_utilization || 0,
    })) || [];

    const handleExport = () => {
        if (analytics) {
            exportToCSV(analytics, `brand-analytics-${Date.now()}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Date Filter */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Campaign Analytics</h2>
                    <p className="text-sm text-muted-foreground">Monitor your brand campaigns and ROI</p>
                </div>
                <div className="flex items-center gap-2">
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onDateRangeChange={(start, end) => setDateRange({ start, end })}
                    />
                    <Button variant="outline" size="sm" onClick={handleExport} disabled={!analytics?.length}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button variant="hero" size="sm" onClick={() => setIsRecapOpen(true)} disabled={!analytics?.length}>
                        <PlaySquare className="h-4 w-4 mr-2" />
                        Generate Recap
                    </Button>
                </div>
            </div>

            <AutomatedRecap
                isOpen={isRecapOpen}
                onClose={() => setIsRecapOpen(false)}
                campaignName={'Aggregate Campaign Summary'}
                totalSpent={metrics.totalSpent}
                totalParticipants={metrics.totalParticipants}
                roi={avgCostPerParticipant}
                evidenceItems={[
                    // Mock some data specifically for the recap demo
                    { id: '1', type: 'photo', user_name: '@sarahj_creates', action_description: 'Post', verification_status: 'verified', timestamp: new Date().toISOString(), media_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop', reward_issued: '50 Keys', location: 'Event Hub' },
                    { id: '2', type: 'photo', user_name: '@miketravels', action_description: 'Post', verification_status: 'verified', timestamp: new Date().toISOString(), media_url: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=400&auto=format&fit=crop', reward_issued: '50 Keys', location: 'VIP Lounge' },
                ]}
            />

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Spend"
                    value={formatCurrency(metrics.totalSpent)}
                    icon={<DollarSign className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="The total amount of capital deployed across all your campaign activations."
                />
                <MetricCard
                    title="Total Participants"
                    value={formatCompactNumber(metrics.totalParticipants)}
                    icon={<Users className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="The total number of users who have engaged with your sponsored moments."
                />
                <MetricCard
                    title="Moments Sponsored"
                    value={formatCompactNumber(metrics.totalSponsorships)}
                    icon={<Target className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="Total number of community-hosted moments your brand has partnered with."
                />
                <MetricCard
                    title="Cost per Participant"
                    value={formatCurrency(avgCostPerParticipant)}
                    icon={<TrendingUp className="h-6 w-6" />}
                    subtitle="Average"
                    loading={isLoading}
                    tooltip="The average amount of budget spent to acquire one engaged participant (ROI)."
                />
            </div>

            {/* Spend & Engagement Trend */}
            <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold mb-4">Spend & Engagement Trend</h3>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <LineChart
                        data={spendByDay}
                        xKey="date"
                        yKeys={[
                            { key: 'spent', label: 'Spend', color: 'hsl(var(--chart-1))' },
                            { key: 'participants', label: 'Participants', color: 'hsl(var(--chart-2))' },
                        ]}
                        formatYAxis="currency"
                        height={300}
                    />
                )}
            </div>

            {/* Evidence Feed & Campaign Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Evidence Feed - 1 column */}
                <div className="lg:col-span-1">
                    <EvidenceFeed brandId={userId} maxItems={4} />
                </div>

                {/* Campaign Performance - 2 columns */}
                <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Campaign Scalability</h3>
                    {isLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <BarChart
                            data={campaignPerformance}
                            xKey="name"
                            yKeys={[
                                { key: 'participants', label: 'Participants', color: 'hsl(var(--chart-3))' },
                            ]}
                            formatYAxis="number"
                            layout="horizontal"
                            showLegend={false}
                            height={300}
                        />
                    )}
                </div>
            </div>

            {/* Detailed Campaign Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold">Campaign Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 text-left">Campaign</th>
                                <th className="px-6 py-3 text-right">Sponsorships</th>
                                <th className="px-6 py-3 text-right">Participants</th>
                                <th className="px-6 py-3 text-right">Total Spent</th>
                                <th className="px-6 py-3 text-right">Cost/Participant</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : campaignPerformance.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        No campaign data available for this period
                                    </td>
                                </tr>
                            ) : (
                                campaignPerformance.map((campaign: any, index: number) => (
                                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{campaign.name}</td>
                                        <td className="px-6 py-4 text-right">{formatCompactNumber(campaign.sponsorships)}</td>
                                        <td className="px-6 py-4 text-right">{formatCompactNumber(campaign.participants)}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(campaign.spent)}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(campaign.roi)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
