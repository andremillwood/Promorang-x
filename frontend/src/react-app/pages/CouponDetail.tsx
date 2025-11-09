import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Calendar, Users, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import advertiserService, { type CouponDetail as CouponDetailType } from '@/react-app/services/advertiser';

export default function CouponDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [couponData, setCouponData] = useState<CouponDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!id) {
        setError('No coupon ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await advertiserService.getCoupon(id);
        
        if (!data) {
          setError('Coupon not found');
          return;
        }

        setCouponData(data);
      } catch (err) {
        console.error('Failed to fetch coupon:', err);
        setError('Failed to load coupon details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
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

  if (error || !couponData) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error || 'Coupon not found'}</p>
        </div>
      </div>
    );
  }

  const { coupon } = couponData;
  const redemptionRate = coupon.quantity_total > 0
    ? ((coupon.quantity_total - coupon.quantity_remaining) / coupon.quantity_total) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{coupon.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
          </div>
        </div>
        <span className={getStatusBadge(coupon.status)}>
          {coupon.status}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-500">Reward Value</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {coupon.value} {coupon.value_unit}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-500">Remaining</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {coupon.quantity_remaining} / {coupon.quantity_total}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-500">Redemption Rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {redemptionRate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-500">Assignments</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {coupon.assignments?.length || 0}
          </p>
        </div>
      </div>

      {/* Assignments */}
      {coupon.assignments && coupon.assignments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
            <p className="text-sm text-gray-500 mt-1">
              Where this coupon is currently assigned
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {coupon.assignments.map((assignment) => (
              <div key={assignment.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{assignment.target_label}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Type: {assignment.target_type} • Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  assignment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {assignment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redemptions */}
      {coupon.redemptions && coupon.redemptions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Redemptions</h2>
            <p className="text-sm text-gray-500 mt-1">
              Latest coupon redemptions by creators
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redeemed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupon.redemptions.slice(0, 10).map((redemption) => (
                  <tr key={redemption.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {redemption.user_name || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {redemption.reward_value} {redemption.reward_unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(redemption.redeemed_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        redemption.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {redemption.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conditions */}
      {coupon.conditions && Object.keys(coupon.conditions).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conditions</h2>
          <div className="space-y-2">
            {Object.entries(coupon.conditions).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-500">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium text-gray-900">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
