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

const PLACEMENT_TYPE_LABELS: Record<string, string> = {
  homepage_hero: 'Homepage Hero',
  homepage_featured: 'Homepage Featured',
  category_featured: 'Category Featured',
  moment_featured: 'Featured Moment',
  moment_category_boost: 'Moment Boost',
  promoshare_homepage_banner: 'PromoShare Banner',
  promoshare_sponsored_badge: 'Sponsored Badge',
  promoshare_push_notification: 'Push Notification'
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending_payment: {
    color: 'bg-yellow-500',
    icon: <Clock className="w-4 h-4" />,
    label: 'Pending Payment'
  },
  active: {
    color: 'bg-green-500',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Active'
  },
  completed: {
    color: 'bg-blue-500',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Completed'
  },
  cancelled: {
    color: 'bg-red-500',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Cancelled'
  }
};

export default function FeaturedPlacementsAdmin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // Check admin access
  useEffect(() => {
    if (user && !user.is_admin) {
      toast.error('Admin access required');
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
      toast.error('Failed to load bookings');
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
        toast.success('Booking activated successfully');
        fetchBookings();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to activate booking');
      }
    } catch (error) {
      console.error('Error activating booking:', error);
      toast.error('Failed to activate booking');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Admin access required</p>
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
              Featured Placements Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage featured marketplace bookings and view revenue
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Back to Admin
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.total_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.platform_fees)}
                </div>
                <p className="text-xs text-muted-foreground">15% of revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_bookings}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {bookings.filter(b => b.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revenue by Type */}
        {stats?.by_type && Object.keys(stats.by_type).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Placement Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(stats.by_type).map(([type, data]) => (
                  <div key={type} className="p-4 border rounded-lg">
                    <p className="font-medium text-sm">
                      {PLACEMENT_TYPE_LABELS[type] || type}
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(data.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.count} booking{data.count !== 1 ? 's' : ''}
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
            <CardTitle>Booking Management</CardTitle>
            <CardDescription>View and manage featured placement bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 grid min-w-[520px] grid-cols-4">
                <TabsTrigger value="pending_payment">Pending</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      {activeTab === 'pending_payment' && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={activeTab === 'pending_payment' ? 8 : 7} className="text-center py-8 text-muted-foreground">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">
                            {booking.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {PLACEMENT_TYPE_LABELS[booking.placement_type] || booking.placement_type}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{booking.entity_type}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {booking.entity_id.slice(0, 8)}...
                            </p>
                          </TableCell>
                          <TableCell>
                            {booking.duration_days} day{booking.duration_days !== 1 ? 's' : ''}
                            <p className="text-xs text-muted-foreground">
                              {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{formatCurrency(booking.total_amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              Fee: {formatCurrency(booking.platform_fee)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center gap-2">
                              {STATUS_CONFIG[booking.status]?.icon}
                              <Badge className={STATUS_CONFIG[booking.status]?.color}>
                                {STATUS_CONFIG[booking.status]?.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(booking.created_at)}</TableCell>
                          {activeTab === 'pending_payment' && (
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => handleActivate(booking.id)}
                                disabled={isLoading}
                              >
                                {isLoading ? 'Activating...' : 'Activate'}
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
