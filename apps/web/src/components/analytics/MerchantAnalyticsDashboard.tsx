import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Package, TrendingUp, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCard } from './MetricCard';
import { DateRangePicker } from './DateRangePicker';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import {
    formatCurrency,
    formatCompactNumber,
    calculateGrowthRate,
    getPresetDateRanges,
    exportToCSV
} from './utils';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface MerchantAnalyticsDashboardProps {
    userId: string;
}

/**
 * Comprehensive analytics dashboard for Merchants
 */
export function MerchantAnalyticsDashboard({ userId }: MerchantAnalyticsDashboardProps) {
    const presets = getPresetDateRanges();
    const [dateRange, setDateRange] = useState({
        start: presets.last30Days.start,
        end: presets.last30Days.end,
    });

    // Fetch merchant analytics from the view
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['merchant-analytics', userId, dateRange],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('merchant_sales_analytics')
                .select('*')
                .eq('merchant_id', userId)
                .gte('sale_date', dateRange.start.toISOString())
                .lte('sale_date', dateRange.end.toISOString());

            if (error) throw error;
            return data;
        },
    });

    // Aggregate metrics
    const metrics = analytics?.reduce(
        (acc, item) => ({
            totalRevenue: acc.totalRevenue + (item.total_revenue || 0),
            totalSales: acc.totalSales + (item.total_sales || 0),
            totalRedemptions: acc.totalRedemptions + (item.total_redemptions || 0),
            uniqueProducts: new Set([...acc.uniqueProducts, item.product_id]).size,
        }),
        { totalRevenue: 0, totalSales: 0, totalRedemptions: 0, uniqueProducts: new Set() }
    ) || { totalRevenue: 0, totalSales: 0, totalRedemptions: 0, uniqueProducts: 0 };

    // Prepare chart data
    const revenueByDay = analytics?.reduce((acc: any[], item) => {
        const date = new Date(item.sale_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = acc.find(d => d.date === date);
        if (existing) {
            existing.revenue += item.total_revenue || 0;
            existing.sales += item.total_sales || 0;
        } else {
            acc.push({ date, revenue: item.total_revenue || 0, sales: item.total_sales || 0 });
        }
        return acc;
    }, []) || [];

    const productPerformance = analytics?.reduce((acc: any[], item) => {
        const existing = acc.find(p => p.name === item.product_name);
        if (existing) {
            existing.revenue += item.total_revenue || 0;
            existing.sales += item.total_sales || 0;
        } else {
            acc.push({
                name: item.product_name,
                revenue: item.total_revenue || 0,
                sales: item.total_sales || 0
            });
        }
        return acc;
    }, []).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 10) || [];

    const stockStatus = [
        { name: 'In Stock', value: 45, color: 'hsl(var(--chart-1))' },
        { name: 'Low Stock', value: 12, color: 'hsl(var(--chart-3))' },
        { name: 'Out of Stock', value: 3, color: 'hsl(var(--chart-5))' },
    ];

    const handleExport = () => {
        if (analytics) {
            exportToCSV(analytics, `merchant-analytics-${Date.now()}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Date Filter */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Sales Analytics</h2>
                    <p className="text-sm text-muted-foreground">Track your product performance and revenue</p>
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
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(metrics.totalRevenue)}
                    icon={<DollarSign className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="Your gross revenue from product sales and redemptions."
                />
                <MetricCard
                    title="Total Sales"
                    value={formatCompactNumber(metrics.totalSales)}
                    icon={<ShoppingCart className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="The total number of product transactions."
                />
                <MetricCard
                    title="Redemptions"
                    value={formatCompactNumber(metrics.totalRedemptions)}
                    icon={<TrendingUp className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="Total number of vouchers or rewards successfully claimed at your venue."
                />
                <MetricCard
                    title="Active Products"
                    value={metrics.uniqueProducts}
                    icon={<Package className="h-6 w-6" />}
                    loading={isLoading}
                    tooltip="The number of unique products currently available for selection."
                />
            </div>

            {/* Revenue Trend */}
            <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <LineChart
                        data={revenueByDay}
                        xKey="date"
                        yKeys={[
                            { key: 'revenue', label: 'Revenue', color: 'hsl(var(--chart-1))' },
                        ]}
                        formatYAxis="currency"
                        height={300}
                    />
                )}
            </div>

            {/* Product Performance & Stock Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Products by Revenue</h3>
                    {isLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <BarChart
                            data={productPerformance}
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

                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold mb-4">Inventory Status</h3>
                    <PieChart
                        data={stockStatus}
                        height={300}
                        formatValue="number"
                        innerRadius={60}
                    />
                </div>
            </div>

            {/* Detailed Product Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-semibold">Product Performance Details</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 text-left">Product</th>
                                <th className="px-6 py-3 text-right">Sales</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                                <th className="px-6 py-3 text-right">Redemptions</th>
                                <th className="px-6 py-3 text-right">Avg. Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : productPerformance.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No sales data available for this period
                                    </td>
                                </tr>
                            ) : (
                                productPerformance.map((product: any, index: number) => (
                                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">{product.name}</td>
                                        <td className="px-6 py-4 text-right">{formatCompactNumber(product.sales)}</td>
                                        <td className="px-6 py-4 text-right">{formatCurrency(product.revenue)}</td>
                                        <td className="px-6 py-4 text-right">{formatCompactNumber(product.redemptions || 0)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {formatCurrency(product.sales > 0 ? product.revenue / product.sales : 0)}
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
