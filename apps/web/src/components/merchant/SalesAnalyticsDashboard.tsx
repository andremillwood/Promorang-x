import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DollarSign, TrendingUp, Users, Package, ShoppingCart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SalesSummary {
    totalSales: number;
    totalRevenue: number;
    totalPointsRedeemed: number;
    validatedRedemptions: number;
    pendingRedemptions: number;
}

interface TopProduct {
    name: string;
    category: string;
    salesCount: number;
}

interface CustomerInsights {
    uniqueCustomers: number;
    totalPurchases: number;
    avgPurchasesPerCustomer: number;
    repeatCustomerRate: number;
}

const SalesAnalyticsDashboard = () => {
    const { user, session } = useAuth();
    const [timeRange, setTimeRange] = useState("30");
    const [summary, setSummary] = useState<SalesSummary | null>(null);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
    const [salesOverTime, setSalesOverTime] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session?.access_token) {
            fetchAnalytics();
        }
    }, [timeRange, session]);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const daysAgo = parseInt(timeRange);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysAgo);

            const params = new URLSearchParams({
                startDate: startDate.toISOString(),
                endDate: new Date().toISOString(),
            });

            // Fetch all analytics data
            const [summaryRes, topProductsRes, customersRes, salesTimeRes] = await Promise.all([
                fetch(`${API_URL}/api/merchant/analytics/summary?${params}`, {
                    headers: { 'Authorization': `Bearer ${session?.access_token}` },
                }),
                fetch(`${API_URL}/api/merchant/analytics/top-products?${params}&limit=5`, {
                    headers: { 'Authorization': `Bearer ${session?.access_token}` },
                }),
                fetch(`${API_URL}/api/merchant/analytics/customers?${params}`, {
                    headers: { 'Authorization': `Bearer ${session?.access_token}` },
                }),
                fetch(`${API_URL}/api/merchant/analytics/sales-over-time?${params}&groupBy=day`, {
                    headers: { 'Authorization': `Bearer ${session?.access_token}` },
                }),
            ]);

            const [summaryData, topProductsData, customersData, salesTimeData] = await Promise.all([
                summaryRes.json(),
                topProductsRes.json(),
                customersRes.json(),
                salesTimeRes.json(),
            ]);

            setSummary(summaryData);
            setTopProducts(topProductsData);
            setCustomerInsights(customersData);
            setSalesOverTime(salesTimeData);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Sales Analytics</h2>
                    <p className="text-muted-foreground">Track your performance and insights</p>
                </div>

                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${summary?.totalRevenue?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.totalSales || 0} sales
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary?.totalSales || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {summary?.validatedRedemptions || 0} validated
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customerInsights?.uniqueCustomers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {customerInsights?.repeatCustomerRate?.toFixed(1) || 0}% repeat rate
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary?.totalPointsRedeemed.toLocaleString() || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Platform points</p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Sales Over Time</CardTitle>
                    <CardDescription>Daily sales and revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                    {salesOverTime.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={salesOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="salesCount"
                                    stroke="#8884d8"
                                    name="Sales"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#82ca9d"
                                    name="Revenue ($)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No sales data available</p>
                    )}
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                    <CardDescription>Your best performers</CardDescription>
                </CardHeader>
                <CardContent>
                    {topProducts.length > 0 ? (
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">{product.category}</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">
                                        <Package className="w-3 h-3 mr-1" />
                                        {product.salesCount} sales
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No sales data yet</p>
                    )}
                </CardContent>
            </Card>

            {/* Customer Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Behavior</CardTitle>
                        <CardDescription>Understanding your customers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Avg. Purchases per Customer</span>
                            <span className="font-bold">{customerInsights?.avgPurchasesPerCustomer?.toFixed(1) || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Repeat Customer Rate</span>
                            <span className="font-bold">{customerInsights?.repeatCustomerRate?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Purchases</span>
                            <span className="font-bold">{customerInsights?.totalPurchases || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Redemption Status</CardTitle>
                        <CardDescription>Track redemption activity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Validated</span>
                            <Badge variant="default">{summary?.validatedRedemptions || 0}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Pending</span>
                            <Badge variant="secondary">{summary?.pendingRedemptions || 0}</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SalesAnalyticsDashboard;
