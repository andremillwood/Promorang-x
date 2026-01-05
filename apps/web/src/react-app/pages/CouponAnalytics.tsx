import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Gift, DollarSign, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import advertiserService from '@/react-app/services/advertiser';

interface CouponAnalytics {
  total_coupons: number;
  total_assigned: number;
  total_redeemed: number;
  redemption_rate: number;
  total_value_distributed: number;
  top_performing_coupons: Array<{
    id: string;
    title: string;
    assignments: number;
    redemptions: number;
    redemption_rate: number;
  }>;
  assignments_by_source: Record<string, number>;
  redemptions_over_time: Array<{
    date: string;
    count: number;
  }>;
}

export default function CouponAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<CouponAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // This would call a new analytics endpoint
      // For now, using mock data
      const mockData: CouponAnalytics = {
        total_coupons: 15,
        total_assigned: 342,
        total_redeemed: 187,
        redemption_rate: 54.7,
        total_value_distributed: 4235.50,
        top_performing_coupons: [
          { id: '1', title: '25% Off Premium', assignments: 89, redemptions: 67, redemption_rate: 75.3 },
          { id: '2', title: '100 Bonus Gems', assignments: 124, redemptions: 58, redemption_rate: 46.8 },
          { id: '3', title: 'Creator Merch Pack', assignments: 67, redemptions: 42, redemption_rate: 62.7 },
        ],
        assignments_by_source: {
          'Drop Completion': 156,
          'Leaderboard': 98,
          'Content Engagement': 88,
        },
        redemptions_over_time: [
          { date: '2025-01-01', count: 12 },
          { date: '2025-01-02', count: 18 },
          { date: '2025-01-03', count: 15 },
          { date: '2025-01-04', count: 22 },
          { date: '2025-01-05', count: 19 },
        ],
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!analytics) return;

    const csv = [
      'Metric,Value',
      `Total Coupons,${analytics.total_coupons}`,
      `Total Assigned,${analytics.total_assigned}`,
      `Total Redeemed,${analytics.total_redeemed}`,
      `Redemption Rate,${analytics.redemption_rate}%`,
      `Total Value Distributed,$${analytics.total_value_distributed}`,
      '',
      'Top Performing Coupons',
      'Title,Assignments,Redemptions,Redemption Rate',
      ...analytics.top_performing_coupons.map(c => 
        `${c.title},${c.assignments},${c.redemptions},${c.redemption_rate}%`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coupon-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-pr-text-1">Coupon Analytics</h1>
            <p className="text-sm text-pr-text-2 mt-1">
              Track performance and ROI of your coupon campaigns
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-lg border border-pr-surface-3 px-4 py-2"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-pr-text-2">Total Coupons</span>
          </div>
          <p className="text-3xl font-bold text-pr-text-1">{analytics.total_coupons}</p>
        </div>

        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-pr-text-2">Assigned</span>
          </div>
          <p className="text-3xl font-bold text-pr-text-1">{analytics.total_assigned}</p>
        </div>

        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-pr-text-2">Redeemed</span>
          </div>
          <p className="text-3xl font-bold text-pr-text-1">{analytics.total_redeemed}</p>
        </div>

        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-pr-text-2">Redemption Rate</span>
          </div>
          <p className="text-3xl font-bold text-pr-text-1">{analytics.redemption_rate}%</p>
        </div>

        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-pr-text-2">Value Distributed</span>
          </div>
          <p className="text-3xl font-bold text-pr-text-1">${analytics.total_value_distributed.toFixed(0)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Coupons */}
        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <h2 className="text-lg font-semibold text-pr-text-1 mb-4">Top Performing Coupons</h2>
          <div className="space-y-4">
            {analytics.top_performing_coupons.map((coupon, index) => (
              <div key={coupon.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-pr-text-1">{coupon.title}</p>
                    <p className="text-sm text-pr-text-2">
                      {coupon.redemptions} / {coupon.assignments} redeemed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{coupon.redemption_rate}%</p>
                  <p className="text-xs text-pr-text-2">rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignments by Source */}
        <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
          <h2 className="text-lg font-semibold text-pr-text-1 mb-4">Assignments by Source</h2>
          <div className="space-y-4">
            {Object.entries(analytics.assignments_by_source).map(([source, count]) => {
              const total = Object.values(analytics.assignments_by_source).reduce((a, b) => a + b, 0);
              const percentage = ((count / total) * 100).toFixed(1);
              
              return (
                <div key={source}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-pr-text-1">{source}</span>
                    <span className="text-pr-text-2">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-pr-surface-3 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Redemptions Over Time */}
      <div className="bg-pr-surface-card rounded-lg shadow-sm border border-pr-surface-3 p-6">
        <h2 className="text-lg font-semibold text-pr-text-1 mb-4">Redemptions Over Time</h2>
        <div className="h-64 flex items-end space-x-2">
          {analytics.redemptions_over_time.map((day, index) => {
            const maxCount = Math.max(...analytics.redemptions_over_time.map(d => d.count));
            const height = (day.count / maxCount) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                  title={`${day.count} redemptions`}
                />
                <p className="text-xs text-pr-text-2 mt-2">{new Date(day.date).getDate()}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-pr-text-1 mb-3">💡 Insights & Recommendations</h2>
        <ul className="space-y-2 text-sm text-pr-text-1">
          <li className="flex items-start space-x-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Your redemption rate of {analytics.redemption_rate}% is above the industry average of 45%.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-0.5">→</span>
            <span>Drop completion rewards have the highest assignment rate. Consider creating more drop-based campaigns.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-orange-600 mt-0.5">!</span>
            <span>Consider sending reminder emails for coupons expiring soon to boost redemption rates.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
