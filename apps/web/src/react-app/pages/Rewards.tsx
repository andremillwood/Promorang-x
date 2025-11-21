import { useState, useEffect } from 'react';
import { Gift, TrendingUp, Calendar, CheckCircle2, Clock, Sparkles, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/react-app/components/ui/use-toast';
import rewardsService, { type UserCoupon, type RewardStats } from '@/react-app/services/rewards';

export default function Rewards() {
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed'>('available');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponsData, statsData] = await Promise.all([
        rewardsService.listCoupons({ status: activeTab }),
        rewardsService.getStats(),
      ]);
      setCoupons(couponsData.coupons);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rewards. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (assignmentId: string) => {
    try {
      setRedeeming(assignmentId);
      const result = await rewardsService.redeemCoupon(assignmentId);

      toast({
        title: 'Reward Claimed! 🎉',
        description: result.instructions || result.message,
      });

      // Show code in a separate toast if available
      if (result.code) {
        setTimeout(() => {
          toast({
            title: 'Your Coupon Code',
            description: `Code: ${result.code} - Copy this code to use at checkout`,
            duration: 10000,
          });
        }, 500);
      }

      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error('Failed to redeem coupon:', error);
      toast({
        title: 'Redemption Failed',
        description: error.message || 'Failed to redeem reward. Please try again.',
      });
    } finally {
      setRedeeming(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      available: 'bg-green-100 text-green-700',
      redeemed: 'bg-pr-surface-2 text-pr-text-1',
      expired: 'bg-red-100 text-red-700',
      depleted: 'bg-orange-100 text-orange-700',
    };
    return badges[status as keyof typeof badges] || 'bg-blue-100 text-blue-700';
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'coupon':
        return <Gift className="h-5 w-5" />;
      case 'giveaway':
        return <Sparkles className="h-5 w-5" />;
      case 'credit':
        return <Trophy className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-pr-text-1">Your Rewards</h1>
        <p className="mt-2 text-pr-text-2">
          Track and redeem your earned coupons, giveaways, and credits
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Earned</p>
                <p className="text-3xl font-bold mt-1">{stats.total_earned}</p>
              </div>
              <Gift className="h-10 w-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Available</p>
                <p className="text-3xl font-bold mt-1">{stats.available_count}</p>
              </div>
              <Target className="h-10 w-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Redeemed</p>
                <p className="text-3xl font-bold mt-1">{stats.total_redeemed}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Value</p>
                <p className="text-3xl font-bold mt-1">${stats.total_value.toFixed(0)}</p>
              </div>
              <TrendingUp className="h-10 w-10 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-pr-surface-3">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'available'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-pr-text-2 hover:text-pr-text-1 hover:border-pr-surface-3'
            }`}
          >
            Available Rewards
          </button>
          <button
            onClick={() => setActiveTab('redeemed')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'redeemed'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-pr-text-2 hover:text-pr-text-1 hover:border-pr-surface-3'
            }`}
          >
            Redeemed
          </button>
        </nav>
      </div>

      {/* Coupons List */}
      {coupons.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => {
            const isExpiringSoon = rewardsService.isExpiringSoon(coupon);
            const daysLeft = rewardsService.getDaysUntilExpiry(coupon);

            return (
              <div
                key={coupon.assignment_id}
                className="bg-pr-surface-card rounded-xl shadow-sm border border-pr-surface-3 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header with gradient based on type */}
                <div
                  className={`p-4 ${
                    coupon.reward_type === 'coupon'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : coupon.reward_type === 'giveaway'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                >
                  <div className="flex items-start justify-between text-white">
                    <div className="flex items-center space-x-2">
                      {getRewardTypeIcon(coupon.reward_type)}
                      <span className="text-sm font-medium opacity-90">
                        {rewardsService.getSourceDisplay(coupon.source)}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(coupon.status)}`}>
                      {coupon.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-pr-text-1">{coupon.title}</h3>
                    {coupon.description && (
                      <p className="mt-1 text-sm text-pr-text-2">{coupon.description}</p>
                    )}
                  </div>

                  {/* Value */}
                  <div className="flex items-center justify-between py-3 px-4 bg-pr-surface-2 rounded-lg">
                    <span className="text-sm text-pr-text-2">Reward Value</span>
                    <span className="text-lg font-bold text-pr-text-1">
                      {rewardsService.formatCouponValue(coupon)}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-sm text-pr-text-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Earned {new Date(coupon.earned_at).toLocaleDateString()}
                      </span>
                    </div>
                    {!coupon.is_redeemed && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className={isExpiringSoon ? 'text-orange-600 font-medium' : ''}>
                          {daysLeft > 0
                            ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                            : 'Expires today'}
                        </span>
                      </div>
                    )}
                    {coupon.is_redeemed && coupon.redeemed_at && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>
                          Redeemed {new Date(coupon.redeemed_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {!coupon.is_redeemed && coupon.status === 'available' && (
                    <Button
                      onClick={() => handleRedeem(coupon.assignment_id)}
                      disabled={redeeming === coupon.assignment_id}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {redeeming === coupon.assignment_id ? (
                        <span className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Redeeming...</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2">
                          <Gift className="h-4 w-4" />
                          <span>Redeem Now</span>
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-pr-surface-card rounded-lg border border-pr-surface-3">
          <Gift className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-pr-text-1">
            {activeTab === 'available' ? 'No available rewards' : 'No redeemed rewards yet'}
          </h3>
          <p className="mt-2 text-sm text-pr-text-2">
            {activeTab === 'available'
              ? 'Complete drops, engage with content, or climb the leaderboard to earn rewards!'
              : 'Redeemed rewards will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
}
