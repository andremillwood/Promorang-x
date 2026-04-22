/**
 * SPONSOR ANALYTICS DASHBOARD
 * 
 * Comprehensive analytics dashboard for sponsors to track the performance
 * of their featured placements, moments, and campaigns.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Eye,
  MousePointer,
  DollarSign,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Crown,
  RefreshCcw,
  Download,
  Filter,
  ChevronRight,
} from 'lucide-react';

interface Booking {
  id: string;
  placement_type: string;
  entity_type: string;
  entity_name: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  total_amount: number;
  platform_fee: number;
  status: 'active' | 'completed' | 'pending_payment';
  analytics?: {
    impressions: number;
    clicks: number;
    ctr: number;
    unique_viewers: number;
  };
}

interface TimeSeriesData {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

const PLACEMENT_TYPE_COLORS: Record<string, string> = {
  homepage_hero: '#f59e0b',
  homepage_featured: '#10b981',
  category_featured: '#3b82f6',
  moment_featured: '#8b5cf6',
  moment_category_boost: '#ec4899',
  promoshare_homepage_banner: '#ef4444',
  promoshare_sponsored_badge: '#06b6d4',
  promoshare_push_notification: '#84cc16',
};

const PLACEMENT_TYPE_NAMES: Record<string, string> = {
  homepage_hero: 'Homepage Hero',
  homepage_featured: 'Homepage Featured',
  category_featured: 'Category Featured',
  moment_featured: 'Featured Moment',
  moment_category_boost: 'Moment Boost',
  promoshare_homepage_banner: 'PromoShare Banner',
  promoshare_sponsored_badge: 'Sponsored Badge',
  promoshare_push_notification: 'Push Notification',
};

export default function SponsorAnalyticsDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string>('');
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    if (selectedBooking) {
      fetchTimeSeriesData(selectedBooking);
    }
  }, [selectedBooking, dateRange]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/featured-marketplace/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
        // Select first booking if none selected
        if (data.bookings.length > 0 && !selectedBooking) {
          const firstBooking = data.bookings[0].id;
          setSelectedBooking(firstBooking);
          // Update URL
          setSearchParams({ booking: firstBooking });
        }
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimeSeriesData = async (bookingId: string) => {
    try {
      // In a real implementation, this would fetch from the backend
      // For now, generate sample data
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const data: TimeSeriesData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          impressions: Math.floor(Math.random() * 1000) + 500,
          clicks: Math.floor(Math.random() * 100) + 20,
          ctr: parseFloat((Math.random() * 5 + 2).toFixed(2)),
        });
      }
      
      setTimeSeriesData(data);
    } catch (error) {
      console.error('Error fetching time series data:', error);
    }
  };

  const currentBooking = bookings.find(b => b.id === selectedBooking);

  const getTotalStats = () => {
    const activeBookings = bookings.filter(b => b.status === 'active');
    const completedBookings = bookings.filter(b => b.status === 'completed');
    
    return {
      totalSpent: bookings.reduce((sum, b) => sum + b.total_amount, 0),
      totalImpressions: bookings.reduce((sum, b) => sum + (b.analytics?.impressions || 0), 0),
      totalClicks: bookings.reduce((sum, b) => sum + (b.analytics?.clicks || 0), 0),
      activeCampaigns: activeBookings.length,
      completedCampaigns: completedBookings.length,
      avgCtr: bookings.length > 0
        ? (bookings.reduce((sum, b) => sum + (b.analytics?.ctr || 0), 0) / bookings.length).toFixed(2)
        : '0.00',
    };
  };

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" />
              Campaign Analytics
            </h1>
            <p className="text-muted-foreground mt-1">
              Track performance of your featured placements and sponsored content
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/featured')}>
              <Zap className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Campaign Selector */}
        {bookings.length > 0 && (
          <div className="mb-6">
            <Select value={selectedBooking} onValueChange={setSelectedBooking}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Select a campaign to view" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={booking.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                      <span className="truncate max-w-[200px]">
                        {PLACEMENT_TYPE_NAMES[booking.placement_type] || booking.placement_type}
                      </span>
                      <span className="text-muted-foreground">
                        - {booking.entity_name || 'Untitled'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Campaigns Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any featured placements yet. Start your first campaign to see analytics here.
            </p>
            <Button onClick={() => navigate('/featured')}>
              Create Your First Campaign
            </Button>
          </Card>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.totalSpent.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {bookings.length} campaigns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalImpressions.toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span>+12.5% this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalClicks.toLocaleString()}
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span>+8.2% this week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. CTR</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.avgCtr}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Industry avg: 2.5%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="impressions">Impressions</TabsTrigger>
                <TabsTrigger value="clicks">Clicks</TabsTrigger>
                <TabsTrigger value="ctr">CTR</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Date Range Selector */}
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground">Date Range:</span>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Combined Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Overview</CardTitle>
                    <CardDescription>
                      Impressions and clicks over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeSeriesData}>
                          <defs>
                            <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area 
                            type="monotone" 
                            dataKey="impressions" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorImpressions)" 
                            name="Impressions"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="clicks" 
                            stroke="#10b981" 
                            fillOpacity={1} 
                            fill="url(#colorClicks)" 
                            name="Clicks"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Campaign Details */}
                {currentBooking && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Placement Type</span>
                            <span className="font-medium">
                              {PLACEMENT_TYPE_NAMES[currentBooking.placement_type]}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Content</span>
                            <span className="font-medium truncate max-w-[200px]">
                              {currentBooking.entity_name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">
                              {currentBooking.duration_days} days
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Cost</span>
                            <span className="font-medium">
                              ${currentBooking.total_amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Impressions</span>
                            <span className="font-medium">
                              {currentBooking.analytics?.impressions?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Clicks</span>
                            <span className="font-medium">
                              {currentBooking.analytics?.clicks?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">CTR</span>
                            <span className="font-medium">
                              {currentBooking.analytics?.ctr?.toFixed(2) || '0.00'}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cost Per Click</span>
                            <span className="font-medium">
                              ${currentBooking.analytics?.clicks > 0
                                ? (currentBooking.total_amount / currentBooking.analytics.clicks).toFixed(2)
                                : '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="impressions">
                <Card>
                  <CardHeader>
                    <CardTitle>Impressions Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clicks">
                <Card>
                  <CardHeader>
                    <CardTitle>Clicks Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ctr">
                <Card>
                  <CardHeader>
                    <CardTitle>Click-Through Rate Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="ctr" 
                            stroke="#8b5cf6" 
                            strokeWidth={2}
                            name="CTR %"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Performance by Placement Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bookings.map(b => ({
                          type: PLACEMENT_TYPE_NAMES[b.placement_type] || b.placement_type,
                          impressions: b.analytics?.impressions || 0,
                          clicks: b.analytics?.clicks || 0,
                          spend: b.total_amount,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="spend" fill="#f59e0b" name="Spend ($)" />
                          <Bar dataKey="clicks" fill="#10b981" name="Clicks" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
