import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Calendar, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCard } from './MetricCard';
import { DateRangePicker } from './DateRangePicker';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import {
    formatCurrency,
    formatCompactNumber,
    getPresetDateRanges,
    exportToCSV
} from './utils';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useTour } from '@/contexts/TourContext';
import ProductTour from '@/components/tours/ProductTour';
import { useEffect } from 'react';

interface HostAnalyticsDashboardProps {
    userId: string;
}

/**
 * Comprehensive analytics dashboard for Hosts
 */
export function HostAnalyticsDashboard({ userId }: HostAnalyticsDashboardProps) {
    const { startTour, isTourCompleted } = useTour();
    const presets = getPresetDateRanges();
    const [dateRange, setDateRange] = useState({
        start: presets.last30Days.start,
        end: presets.last30Days.end,
    });

    // Auto-start analytics tour for new users
    useEffect(() => {
        if (!isTourCompleted('analytics')) {
            const timer = setTimeout(() => {
                startTour('analytics');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isTourCompleted, startTour]);

    // Fetch host earnings analytics
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['host-analytics', userId, dateRange],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('host_earnings_analytics')
                .select('*')
                .eq('host_id', userId)
                .gte('moment_date', dateRange.start.toISOString())
                .lte('moment_date', dateRange.end.toISOString());

            if (error) throw error;
            return data;
        },
    });

    // Aggregate metrics
    const metrics = analytics?.reduce(
        (acc, item) => ({
            totalEarnings: acc.totalEarnings + (item.total_revenue || 0),
            totalParticipants: acc.totalParticipants + (item.total_participants || 0),
            totalMoments: acc.totalMoments + 1,
            totalSponsorships: acc.totalSponsorships + (item.total_sponsorship || 0),
        }),
        { totalEarnings: 0, totalParticipants: 0, totalMoments: 0, totalSponsorships: 0 }
    ) || { totalEarnings: 0, totalParticipants: 0, totalMoments: 0, totalSponsorships: 0 };

    const avgRevenuePerMoment = metrics.totalMoments > 0
        ? metrics.totalEarnings / metrics.totalMoments
        : 0;

    // Prepare chart data
    const earningsByDay = analytics?.reduce((acc: any[], item) => {
        const date = new Date(item.moment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = acc.find(d => d.date === date);
        if (existing) {
            existing.earnings += item.total_revenue || 0;
            existing.participants += item.total_participants || 0;
        } else {
            acc.push({
                date,
                earnings: item.total_revenue || 0,
                participants: item.total_participants || 0
            });
        }
        return acc;
    }, []) || [];

    const momentPerformance = analytics?.map((item: any) => ({
        name: item.moment_title,
        participants: item.total_participants || 0,
        revenue: item.total_revenue || 0,
        sponsorship: item.total_sponsorship || 0,
    })).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 10) || [];

    const handleExport = () => {
        if (analytics) {
            exportToCSV(analytics, `host-analytics-${Date.now()}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Date Filter */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Host Earnings</h2>
                    <p className="text-sm text-muted-foreground">Track your moment performance and revenue</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center" data-tour="analytics-filters">
                    <DateRangePicker
                        startDate={dateRange.start}
                        endDate={dateRange.end}
                        onDateRangeChange={(start, end) => setDateRange({ start, end })}
                        className="w-full justify-start sm:w-auto"
                    />
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleExport} disabled={!analytics?.length} data-tour="analytics-export">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="analytics-metrics">
                <MetricCard
                    title="Total Earnings"
                    value={formatCurrency(metrics.totalEarnings)}
                    icon={<DollarSign className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="Your gross revenue before platform processing fees."
                />
                <MetricCard
                    title="Total Participants"
                    value={formatCompactNumber(metrics.totalParticipants)}
                    icon={<Users className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="Total number of people who have joined or checked into your moments."
                />
                <MetricCard
                    title="Moments Hosted"
                    value={formatCompactNumber(metrics.totalMoments)}
                    icon={<Calendar className="h-6 w-6" />}
                    loading={isLoading}
                />
                <MetricCard
                    title="Avg Revenue/Moment"
                    value={formatCurrency(avgRevenuePerMoment)}
                    icon={<TrendingUp className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="Average revenue generated across all your hosted moments."
                />
            </div>

            {/* Earnings Trend */}
            <div className="rounded-xl border border-border bg-card p-4 md:p-6" data-tour="analytics-chart">
                <h3 className="text-lg font-semibold mb-4">Earnings Trend</h3>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <LineChart
                        data={earningsByDay}
                        xKey="date"
                        yKeys={[
                            { key: 'earnings', label: 'Earnings', color: 'hsl(var(--chart-1))' },
                        ]}
                        formatYAxis="currency"
                        height={300}
                    />
                )}
            </div>

            {/* Moment Performance */}
            <div className="rounded-xl border border-border bg-card p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-4">Top Moments by Revenue</h3>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <BarChart
                        data={momentPerformance}
                        xKey="name"
                        yKeys={[
                            { key: 'revenue', label: 'Revenue', color: 'hsl(var(--chart-2))' },
                        ]}
                        formatYAxis="currency"
                        layout="horizontal"
                        showLegend={false}
                        height={300}
                    />
                )}
            </div>

            {/* Detailed Moment Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card" data-tour="analytics-table">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold">Moment Performance Details</h3>
                </div>
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 text-left">Moment</th>
                                <th className="px-6 py-3 text-right">Participants</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                                <th className="px-6 py-3 text-right">Sponsorship</th>
                                <th className="px-6 py-3 text-right">Revenue/Participant</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : momentPerformance.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No moment data available for this period
                                    </td>
                                </tr>
                            ) : (
                                momentPerformance.map((moment: any, index: number) => (
                                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{moment.name}</td>
                                        <td className="px-6 py-4 text-right">{formatCompactNumber(moment.participants)}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(moment.revenue)}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(moment.sponsorship)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {formatCurrency(moment.participants > 0 ? moment.revenue / moment.participants : 0)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="space-y-3 p-4 md:hidden">
                    {isLoading ? (
                        <div className="py-8 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : momentPerformance.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                            No moment data available for this period
                        </div>
                    ) : (
                        momentPerformance.map((moment: any, index: number) => (
                            <div key={index} className="rounded-xl border border-border bg-background/40 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="font-medium text-foreground">{moment.name}</p>
                                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                                        {formatCompactNumber(moment.participants)} joined
                                    </span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Revenue</p>
                                        <p className="font-semibold text-foreground">{formatCurrency(moment.revenue)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Sponsorship</p>
                                        <p className="font-semibold text-foreground">{formatCurrency(moment.sponsorship)}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">Revenue per participant</p>
                                        <p className="font-semibold text-foreground">
                                            {formatCurrency(moment.participants > 0 ? moment.revenue / moment.participants : 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Product Tour */}
            <ProductTour tourId="analytics" />
        </div>
    );
}
