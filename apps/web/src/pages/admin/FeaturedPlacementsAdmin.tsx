/**
 * FEATURED PLACEMENTS ADMIN
 * 
 * Admin dashboard for managing featured marketplace bookings:
 * - View all pending/active/completed bookings
 * - Activate bookings after payment confirmation
 * - View revenue statistics
 * - Manage placement availability
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  Users,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  LayoutGrid,
  Megaphone,
  Calendar
} from 'lucide-react';

interface Booking {
  id: string;
  user_id: string;
  placement_type: string;
  entity_type: string;
  entity_id: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  total_amount: number;
  platform_fee: number;
  status: 'pending_payment' | 'active' | 'completed' | 'cancelled';
  payment_method?: string;
  paid_at?: string;
  created_at: string;
  user?: {
    username: string;
    display_name: string;
  };
}

interface Stats {
  total_revenue: number;
  total_bookings: number;
  platform_fees: number;
  by_type: Record<string, { revenue: number; count: number }>;
}

const PLACEMENT_TYPE_KEYS: Record<string, TranslationKey> = {
  homepage_hero: 'featAdmin.placeHero',
  homepage_featured: 'featAdmin.placeFeatured',
  category_featured: 'featAdmin.placeCategory',
  moment_featured: 'featAdmin.placeMoment',
  moment_category_boost: 'featAdmin.placeBoost',
  promoshare_homepage_banner: 'featAdmin.placeBanner',
  promoshare_sponsored_badge: 'featAdmin.placeBadge',
  promoshare_push_notification: 'featAdmin.placePush'
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; labelKey: TranslationKey }> = {
  pending_payment: {
    color: 'bg-yellow-500',
    icon: <Clock className="w-4 h-4" />,
    labelKey: 'featAdmin.statusPending'
  },
  active: {
    color: 'bg-green-500',
    icon: <CheckCircle className="w-4 h-4" />,
    labelKey: 'featAdmin.statusActive'
  },
  completed: {
    color: 'bg-blue-500',
    icon: <CheckCircle className="w-4 h-4" />,
    labelKey: 'featAdmin.statusCompleted'
  },
  cancelled: {
    color: 'bg-red-500',
    icon: <XCircle className="w-4 h-4" />,
    labelKey: 'featAdmin.statusCancelled'
  }
};

export default function FeaturedPlacementsAdmin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t, formatDate, formatNumber } = useI18n();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Check admin access
  useEffect(() => {
    if (user && !user.is_admin) {
      toast.error(t('featAdmin.toastAdmin'));
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.is_admin) {
      fetchBookings();
      fetchStats();
    }
  }, [user, activeTab]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/featured-marketplace/my-bookings?status=${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(t('featAdmin.toastLoad'));
    }
  };

  const fetchStats = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(
        `/api/featured-marketplace/revenue-stats?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleActivate = async (bookingId: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/featured-marketplace/${bookingId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(t('featAdmin.toastActivated'));
        fetchBookings();
        fetchStats();
      } else {
        toast.error(data.error || t('featAdmin.toastActivateFail'));
      }
    } catch (error) {
      console.error('Error activating booking:', error);
      toast.error(t('featAdmin.toastActivateFail'));
    } finally {
      setIsLoading(false);
    }
  };

  const money = (amount: number) =>
    formatNumber(amount, { style: 'currency', currency: 'USD' });

  const shortDate = (dateString: string) =>
    formatDate(dateString, { month: 'short', day: 'numeric', year: 'numeric' });

  const placementLabel = (type: string) =>
    PLACEMENT_TYPE_KEYS[type] ? t(PLACEMENT_TYPE_KEYS[type]) : type;

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('featAdmin.denied')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <LayoutGrid className="w-8 h-8 text-primary" />
              {t('featAdmin.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('featAdmin.lede')}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            {t('featAdmin.back')}
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('featAdmin.totalRev')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {money(stats.total_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">{t('featAdmin.last30')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('featAdmin.platformFees')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {money(stats.platform_fees)}
                </div>
                <p className="text-xs text-muted-foreground">{t('featAdmin.feePct')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('featAdmin.totalBookings')}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_bookings}</div>
                <p className="text-xs text-muted-foreground">{t('featAdmin.allTime')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('featAdmin.activeNow')}</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bookings.filter(b => b.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">{t('featAdmin.running')}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue by Type */}
        {stats?.by_type && Object.keys(stats.by_type).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('featAdmin.revByType')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(stats.by_type).map(([type, data]) => (
                  <div key={type} className="p-4 border rounded-lg">
                    <p className="font-medium text-sm">
                      {placementLabel(type)}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {money(data.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(data.count === 1 ? 'featAdmin.bookingOne' : 'featAdmin.bookingMany', { count: data.count })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('featAdmin.manage')}</CardTitle>
            <CardDescription>{t('featAdmin.manageDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid min-w-[520px] grid-cols-4">
                <TabsTrigger value="pending_payment">{t('featAdmin.tabPending')}</TabsTrigger>
                <TabsTrigger value="active">{t('featAdmin.tabActive')}</TabsTrigger>
                <TabsTrigger value="completed">{t('featAdmin.tabCompleted')}</TabsTrigger>
                <TabsTrigger value="cancelled">{t('featAdmin.tabCancelled')}</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('featAdmin.colId')}</TableHead>
                      <TableHead>{t('featAdmin.colType')}</TableHead>
                      <TableHead>{t('featAdmin.colEntity')}</TableHead>
                      <TableHead>{t('featAdmin.colDuration')}</TableHead>
                      <TableHead>{t('featAdmin.colAmount')}</TableHead>
                      <TableHead>{t('featAdmin.colStatus')}</TableHead>
                      <TableHead>{t('featAdmin.colCreated')}</TableHead>
                      {activeTab === 'pending_payment' && <TableHead>{t('featAdmin.colActions')}</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={activeTab === 'pending_payment' ? 8 : 7} className="text-center py-8 text-muted-foreground">
                          {t('featAdmin.empty')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">
                            {booking.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {placementLabel(booking.placement_type)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{booking.entity_type}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {booking.entity_id.slice(0, 8)}...
                            </p>
                          </TableCell>
                          <TableCell>
                            {t(booking.duration_days === 1 ? 'featAdmin.dayOne' : 'featAdmin.dayMany', { count: booking.duration_days })}
                            <p className="text-xs text-muted-foreground">
                              {shortDate(booking.start_date)} - {shortDate(booking.end_date)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{money(booking.total_amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('featAdmin.fee', { amount: money(booking.platform_fee) })}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-2">
                              {STATUS_CONFIG[booking.status]?.icon}
                              <Badge className={STATUS_CONFIG[booking.status]?.color}>
                                {STATUS_CONFIG[booking.status] ? t(STATUS_CONFIG[booking.status].labelKey) : booking.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{shortDate(booking.created_at)}</TableCell>
                          {activeTab === 'pending_payment' && (
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => handleActivate(booking.id)}
                                disabled={isLoading}
                              >
                                {isLoading ? t('featAdmin.activating') : t('featAdmin.activate')}
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
