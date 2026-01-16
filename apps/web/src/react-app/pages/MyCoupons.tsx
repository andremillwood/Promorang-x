import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Tag, Percent, DollarSign, Calendar, CheckCircle2, Clock, ChevronRight, QrCode, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '../utils/api';

interface UserCoupon {
  id: string;
  coupon_id: string;
  is_redeemed: boolean;
  redeemed_at: string | null;
  assigned_at: string;
  target_label?: string;
  advertiser_coupons?: {
    id: string;
    title: string;
    description: string;
    reward_type: 'percentage' | 'fixed' | 'free_item' | 'bogo';
    value: number;
    value_unit?: string;
    start_date: string;
    end_date: string;
    status: string;
    advertiser_id: string;
  };
}

type FilterType = 'all' | 'active' | 'used';

export default function MyCoupons() {
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/rewards/coupons');
      const data = await response.json();
      if (data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    if (!coupon.advertiser_coupons) return false;
    if (filter === 'active') return !coupon.is_redeemed;
    if (filter === 'used') return coupon.is_redeemed;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'fixed': return DollarSign;
      case 'free_item': return Gift;
      default: return Tag;
    }
  };

  const getRewardText = (coupon: UserCoupon['advertiser_coupons']) => {
    if (!coupon) return 'Coupon';
    switch (coupon.reward_type) {
      case 'percentage': return `${coupon.value || 0}% OFF`;
      case 'fixed': return `$${coupon.value || 0} OFF`;
      case 'free_item': return 'FREE ITEM';
      case 'bogo': return 'BUY 1 GET 1';
      default: return coupon.title || 'Coupon';
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => !c.is_redeemed && c.advertiser_coupons).length,
    used: coupons.filter(c => c.is_redeemed).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pr-text-1 flex items-center space-x-3">
            <Gift className="w-8 h-8 text-purple-500" />
            <span>My Coupons</span>
          </h1>
          <p className="text-pr-text-2 mt-2">Coupons and rewards you've earned</p>
        </div>
        <Link
          to="/coupons"
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Browse More Coupons
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-pr-text-1">{stats.total}</p>
              <p className="text-sm text-pr-text-2">Total Coupons</p>
            </div>
          </div>
        </div>
        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-pr-text-1">{stats.active}</p>
              <p className="text-sm text-pr-text-2">Available</p>
            </div>
          </div>
        </div>
        <div className="bg-pr-surface-card border border-pr-border rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-pr-text-1">{stats.used}</p>
              <p className="text-sm text-pr-text-2">Redeemed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-pr-surface-card border border-pr-border rounded-xl p-2 inline-flex space-x-2">
        {(['all', 'active', 'used'] as FilterType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === tab
                ? 'bg-purple-500 text-white'
                : 'text-pr-text-2 hover:bg-pr-surface-2'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Coupons Grid */}
      {filteredCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((item) => {
            const coupon = item.advertiser_coupons;
            if (!coupon) return null;

            const isExpired = coupon.end_date ? new Date(coupon.end_date) < new Date() : false;
            const isUsed = item.is_redeemed;
            const RewardIcon = getRewardIcon(coupon.reward_type || 'default');

            return (
              <div
                key={item.id}
                className={`bg-pr-surface-card border border-pr-border rounded-xl overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                  (isUsed || isExpired) ? 'opacity-70' : ''
                }`}
                onClick={() => setSelectedCoupon(item)}
              >
                {/* Reward Header */}
                <div className={`p-4 ${
                  isUsed ? 'bg-gray-500' : isExpired ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <RewardIcon className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">{getRewardText(coupon)}</span>
                    </div>
                    {isUsed && (
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Redeemed</span>
                    )}
                    {isExpired && !isUsed && (
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">Expired</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-pr-text-1 mb-1 line-clamp-1">{coupon.title || 'Coupon'}</h3>
                  <p className="text-sm text-pr-text-2 line-clamp-2 mb-3">{coupon.description || 'Redeem for a discount'}</p>

                  <div className="flex items-center justify-between text-xs text-pr-text-2">
                    {isUsed && item.redeemed_at ? (
                      <div className="flex items-center space-x-1 text-green-500">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Redeemed {formatDate(item.redeemed_at)}</span>
                      </div>
                    ) : isExpired ? (
                      <div className="flex items-center space-x-1 text-red-500">
                        <Clock className="w-3 h-3" />
                        <span>Expired {formatDate(coupon.end_date)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Expires {formatDate(coupon.end_date)}</span>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-pr-surface-card border border-pr-border rounded-xl">
          <Gift className="w-16 h-16 text-pr-text-2 mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-semibold text-pr-text-1 mb-2">
            {filter === 'all' ? 'No Coupons Yet' : `No ${filter} coupons`}
          </h3>
          <p className="text-pr-text-2 mb-4">
            Complete drops and campaigns to earn coupons and rewards!
          </p>
          <Link
            to="/coupons"
            className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Browse Available Coupons
          </Link>
        </div>
      )}

      {/* Coupon Detail Modal */}
      {selectedCoupon && selectedCoupon.advertiser_coupons && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCoupon(null)}>
          <div className="bg-pr-surface-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`p-6 ${
              selectedCoupon.is_redeemed ? 'bg-gray-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}>
              <div className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{getRewardText(selectedCoupon.advertiser_coupons)}</div>
                <div className="text-white/80">{selectedCoupon.advertiser_coupons.title}</div>
              </div>
            </div>

            {/* QR Code */}
            <div className="p-6 flex flex-col items-center border-b border-pr-border">
              <p className="text-sm text-pr-text-2 mb-4">Show this QR code to redeem</p>
              <div className={`p-4 bg-white rounded-xl ${selectedCoupon.is_redeemed ? 'opacity-50' : ''}`}>
                <QRCodeSVG
                  value={JSON.stringify({
                    type: 'coupon_redemption',
                    coupon_id: selectedCoupon.coupon_id,
                    assignment_id: selectedCoupon.id,
                    code: selectedCoupon.id.slice(0, 8).toUpperCase()
                  })}
                  size={180}
                />
              </div>

              {/* Redemption Code */}
              <div className="mt-4 bg-pr-surface-2 rounded-lg px-4 py-3 flex items-center space-x-3">
                <div>
                  <p className="text-xs text-pr-text-2 uppercase tracking-wider">Redemption Code</p>
                  <p className="text-xl font-mono font-bold text-pr-text-1 tracking-widest">
                    {selectedCoupon.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => copyCode(selectedCoupon.id.slice(0, 8).toUpperCase())}
                  className="p-2 hover:bg-pr-surface-3 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-pr-text-2" />}
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <p className="text-pr-text-2">{selectedCoupon.advertiser_coupons.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-pr-text-2">Valid Until</span>
                <span className="text-pr-text-1 font-medium">
                  {formatDate(selectedCoupon.advertiser_coupons.end_date)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-pr-text-2">Status</span>
                <span className={`font-medium ${selectedCoupon.is_redeemed ? 'text-green-500' : 'text-purple-500'}`}>
                  {selectedCoupon.is_redeemed ? 'Redeemed' : 'Available'}
                </span>
              </div>

              {selectedCoupon.is_redeemed && selectedCoupon.redeemed_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-pr-text-2">Redeemed On</span>
                  <span className="text-pr-text-1 font-medium">
                    {formatDate(selectedCoupon.redeemed_at)}
                  </span>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="p-4 border-t border-pr-border">
              <button
                onClick={() => setSelectedCoupon(null)}
                className="w-full py-3 bg-pr-surface-2 text-pr-text-1 rounded-lg font-medium hover:bg-pr-surface-3 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
