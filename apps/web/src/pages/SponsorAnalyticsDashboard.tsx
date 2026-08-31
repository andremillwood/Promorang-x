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
  MapPin,
  Users,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { PromorangMap } from '@/components/PromorangMap';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';

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

const PLACEMENT_TYPE_KEYS: Record<string, TranslationKey> = {
  homepage_hero: "sponsorAn.placeHero",
  homepage_featured: "sponsorAn.placeFeatured",
  category_featured: "sponsorAn.placeCategory",
  moment_featured: "sponsorAn.placeMoment",
  moment_category_boost: "sponsorAn.placeBoost",
  promoshare_homepage_banner: "sponsorAn.placeBanner",
  promoshare_sponsored_badge: "sponsorAn.placeBadge",
  promoshare_push_notification: "sponsorAn.placePush",
};

const STATUS_KEYS: Record<string, TranslationKey> = {
  active: "sponsorAn.statusActive",
  completed: "sponsorAn.statusCompleted",
  pending_payment: "sponsorAn.statusPending",
};

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.promorang.co/api';

export default function SponsorAnalyticsDashboard() {
  const { t, formatNumber, formatDate } = useI18n();
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
      const response = await fetch(`${API_BASE}/featured-marketplace/my-bookings`, {
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
      toast.error(t("sponsorAn.toastLoad"));
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
          date: formatDate(date, { month: 'short', day: 'numeric' }),
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
  const placementName = (type: string) => (PLACEMENT_TYPE_KEYS[type] ? t(PLACEMENT_TYPE_KEYS[type]) : type);
  const statusLabel = (status: string) => (STATUS_KEYS[status] ? t(STATUS_KEYS[status]) : status);

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
              {t("sponsorAn.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("sponsorAn.lede")}
            </p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="outline" onClick={() => navigate('/featured')}>
              <Zap className="w-4 h-4 mr-2" />
              {t("sponsorAn.newCampaign")}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {t("sponsorAn.export")}
            </Button>
          </div>
        </div>

        {/* Campaign Selector */}
        {bookings.length > 0 && (
          <div className="mb-6">
            <Select value={selectedBooking} onValueChange={setSelectedBooking}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder={t("sponsorAn.selectCampaign")} />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={booking.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {statusLabel(booking.status)}
                      </Badge>
                      <span className="truncate max-w-[200px]">
                        {placementName(booking.placement_type)}
                      </span>
                      <span className="text-muted-foreground">
                        - {booking.entity_name || t("sponsorAn.untitled")}
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
            <h3 className="text-xl font-semibold mb-2">{t("sponsorAn.emptyTitle")}</h3>
            <p className="text-muted-foreground mb-4">
              {t("sponsorAn.emptyCopy")}
            </p>
            <Button onClick={() => navigate('/featured')}>
              {t("sponsorAn.emptyCta")}
            </Button>
          </Card>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("sponsorAn.totalSpent")}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.totalSpent.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("sponsorAn.across", { count: bookings.length })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("sponsorAn.impressions")}</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(stats.totalImpressions)}
                  </div>
                    <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span>{t("sponsorAn.weekUp", { pct: "12.5" })}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("sponsorAn.clicks")}</CardTitle>
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(stats.totalClicks)}
                  </div>
                    <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span>{t("sponsorAn.weekUp", { pct: "8.2" })}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("sponsorAn.avgCtr")}</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.avgCtr}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("sponsorAn.industryAvg", { pct: "2.5" })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="min-w-[640px]">
                <TabsTrigger value="overview">{t("sponsorAn.tabOverview")}</TabsTrigger>
                <TabsTrigger value="impressions">{t("sponsorAn.tabImpressions")}</TabsTrigger>
                <TabsTrigger value="clicks">{t("sponsorAn.tabClicks")}</TabsTrigger>
                <TabsTrigger value="ctr">{t("sponsorAn.tabCtr")}</TabsTrigger>
                <TabsTrigger value="performance">{t("sponsorAn.tabPerf")}</TabsTrigger>
                <TabsTrigger value="foottraffic">{t("sponsorAn.tabFoot")}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Date Range Selector */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <span className="text-sm text-muted-foreground">{t("sponsorAn.dateRange")}</span>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">{t("sponsorAn.last7")}</SelectItem>
                      <SelectItem value="30d">{t("sponsorAn.last30")}</SelectItem>
                      <SelectItem value="90d">{t("sponsorAn.last90")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Combined Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("sponsorAn.overviewTitle")}</CardTitle>
                    <CardDescription>
                      {t("sponsorAn.overviewDesc")}
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
                            name={t("sponsorAn.seriesImpressions")}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="clicks" 
                            stroke="#10b981" 
                            fillOpacity={1} 
                            fill="url(#colorClicks)" 
                            name={t("sponsorAn.seriesClicks")}
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
                      <CardTitle>{t("sponsorAn.details")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">{t("sponsorAn.placement")}</span>
                            <span className="font-medium">
                              {placementName(currentBooking.placement_type)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">{t("sponsorAn.content")}</span>
                            <span className="max-w-full truncate font-medium sm:max-w-[200px]">
                              {currentBooking.entity_name}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">{t("sponsorAn.duration")}</span>
                            <span className="font-medium">
                              {t("sponsorAn.durationDays", { count: currentBooking.duration_days })}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">{t("sponsorAn.totalCost")}</span>
                            <span className="font-medium">
                              ${currentBooking.total_amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">{t("sponsorAn.impressionsLabel")}</span>
                            <span className="font-medium">
                              {formatNumber(currentBooking.analytics?.impressions || 0)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">{t("sponsorAn.clicksLabel")}</span>
                            <span className="font-medium">
                              {formatNumber(currentBooking.analytics?.clicks || 0)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">{t("sponsorAn.ctrLabel")}</span>
                            <span className="font-medium">
                              {currentBooking.analytics?.ctr?.toFixed(2) || '0.00'}%
                            </span>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <span className="text-muted-foreground">{t("sponsorAn.cpc")}</span>
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
                    <CardTitle>{t("sponsorAn.impressionsTime")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="impressions" fill="#3b82f6" name={t("sponsorAn.seriesImpressions")} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="clicks">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("sponsorAn.clicksTime")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="clicks" fill="#10b981" name={t("sponsorAn.seriesClicks")} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ctr">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("sponsorAn.ctrTrend")}</CardTitle>
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
                            name={t("sponsorAn.seriesCtr")}
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
                    <CardTitle>{t("sponsorAn.perfTitle")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bookings.map(b => ({
                          type: placementName(b.placement_type),
                          impressions: b.analytics?.impressions || 0,
                          clicks: b.analytics?.clicks || 0,
                          spend: b.total_amount,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="spend" fill="#f59e0b" name={t("sponsorAn.seriesSpend")} />
                          <Bar dataKey="clicks" fill="#10b981" name={t("sponsorAn.seriesClicks")} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="foottraffic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t("sponsorAn.checkins")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-500">{t("sponsorAn.attendees", { count: 142 })}</div>
                      <p className="text-xs text-muted-foreground mt-1">{t("sponsorAn.geofence", { pct: "98.4" })}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t("sponsorAn.radius")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-500">2.4 km</div>
                      <p className="text-xs text-muted-foreground mt-1">{t("sponsorAn.fromVenue")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t("sponsorAn.peakHour")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-500">9:30 PM - 11 PM</div>
                      <p className="text-xs text-muted-foreground mt-1">{t("sponsorAn.peakHint")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{t("sponsorAn.perkRate")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-500">76.8%</div>
                      <p className="text-xs text-muted-foreground mt-1">{t("sponsorAn.redemptions")}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {t("sponsorAn.mapTitle")}
                    </CardTitle>
                    <CardDescription>
                      {t("sponsorAn.mapDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PromorangMap
                      center={{ lat: 17.9714, lng: -76.7936 }}
                      zoom={14}
                      height="420px"
                      markers={[
                        { id: "venue-main", lat: 17.9714, lng: -76.7936, title: "Fiction Nightclub (Venue Hub)", category: "Venue", reward: "142 Check-ins" },
                        { id: "checkin-1", lat: 17.9720, lng: -76.7940, title: "Verified Check-In #1", subtitle: "0.08 km from venue" },
                        { id: "checkin-2", lat: 17.9710, lng: -76.7928, title: "Verified Check-In #2", subtitle: "0.12 km from venue" },
                        { id: "checkin-3", lat: 17.9705, lng: -76.7950, title: "Verified Check-In #3", subtitle: "0.19 km from venue" },
                        { id: "checkin-4", lat: 17.9725, lng: -76.7915, title: "Verified Check-In #4", subtitle: "0.15 km from venue" },
                      ]}
                    />
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
