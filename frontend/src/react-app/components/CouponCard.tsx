import { Gift, Calendar, Clock, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import rewardsService, { type UserCoupon } from '@/react-app/services/rewards';

interface CouponCardProps {
  coupon: UserCoupon;
  compact?: boolean;
}

export default function CouponCard({ coupon, compact = false }: CouponCardProps) {
  const navigate = useNavigate();
  const isExpiringSoon = rewardsService.isExpiringSoon(coupon);
  const daysLeft = rewardsService.getDaysUntilExpiry(coupon);

  const getRewardTypeIcon = () => {
    switch (coupon.reward_type) {
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

  const getGradientClass = () => {
    switch (coupon.reward_type) {
      case 'coupon':
        return 'from-purple-500 to-pink-500';
      case 'giveaway':
        return 'from-orange-500 to-red-500';
      case 'credit':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const handleClick = () => {
    navigate('/rewards');
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getGradientClass()} text-white`}>
              {getRewardTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate">{coupon.title}</h4>
              <p className="text-sm text-gray-600">
                {rewardsService.formatCouponValue(coupon)}
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Header with gradient */}
      <div className={`p-4 bg-gradient-to-r ${getGradientClass()}`}>
        <div className="flex items-start justify-between text-white">
          <div className="flex items-center space-x-2">
            {getRewardTypeIcon()}
            <span className="text-sm font-medium opacity-90">
              {rewardsService.getSourceDisplay(coupon.source)}
            </span>
          </div>
          {!coupon.is_redeemed && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
              New
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{coupon.title}</h3>
          {coupon.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{coupon.description}</p>
          )}
        </div>

        {/* Value Badge */}
        <div className="inline-flex items-center justify-center py-2 px-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-200">
          <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            {rewardsService.formatCouponValue(coupon)}
          </span>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Earned {new Date(coupon.earned_at).toLocaleDateString()}</span>
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
        </div>

        {/* CTA */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {coupon.is_redeemed ? 'Already claimed' : 'Click to claim'}
            </span>
            <ArrowRight className="h-4 w-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
