import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Gift, Calendar, Users, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import advertiserService from '@/react-app/services/advertiser';
import type { CouponType } from '@/shared/types';

export default function AdvertiserCoupons() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<CouponType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const data = await advertiserService.listCoupons();
        setCoupons(data.coupons || []);
      } catch (err) {
        console.error('Failed to fetch coupons:', err);
        setError('Failed to load coupons. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'expired':
        return `${baseClasses} bg-gray-100 text-gray-700`;
      case 'depleted':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-700`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Rewards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage coupon codes and rewards for your campaigns
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => navigate('/advertiser/coupons/analytics')}
            className="flex items-center space-x-2"
          >
            <BarChart2 className="h-4 w-4" />
            <span>Analytics</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/advertiser/coupons/bulk')}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Bulk Create</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Coupon</span>
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Gift className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How Coupons Work</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Coupons can be assigned to campaigns, drops, or leaderboard positions. When creators meet the conditions,
                they automatically receive the coupon code. Track redemptions and manage inventory from this dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      {coupons.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <Link
              key={coupon.id}
              to={`/advertiser/coupons/${coupon.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{coupon.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{coupon.description}</p>
                </div>
                <span className={getStatusBadge(coupon.status)}>
                  {coupon.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Reward</span>
                  <span className="font-medium text-gray-900">
                    {coupon.value} {coupon.value_unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Remaining</span>
                  <span className="font-medium text-gray-900">
                    {coupon.quantity_remaining} / {coupon.quantity_total}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Expires {new Date(coupon.end_date).toLocaleDateString()}</span>
                  </span>
                  {coupon.assignments && coupon.assignments.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{coupon.assignments.length} assigned</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Gift className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No coupons yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first coupon.</p>
          <div className="mt-6">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Coupon</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
