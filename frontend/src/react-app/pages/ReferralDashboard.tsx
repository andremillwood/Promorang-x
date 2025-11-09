import { useEffect, useState } from 'react';
import { Copy, Share2, Users, TrendingUp, DollarSign, Award, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface ReferralStats {
  summary: {
    total_referrals: number;
    active_referrals: number;
    pending_referrals: number;
    conversion_rate: string;
    total_earnings: {
      usd: number;
      gems: number;
      points: number;
    };
    referral_code: string;
    tier: {
      tier_name: string;
      tier_level: number;
      commission_rate: number;
      badge_icon: string;
      badge_color: string;
    };
  };
  referrals: any[];
  recent_commissions: any[];
}

interface ReferralTier {
  tier_name: string;
  tier_level: number;
  min_referrals: number;
  commission_rate: number;
  badge_icon: string;
  badge_color: string;
  perks: string[];
}

export default function ReferralDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [tiers, setTiers] = useState<ReferralTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/referrals/stats', {
        credentials: 'include',
      });
      const statsData = await statsResponse.json();
      
      if (statsData.status === 'success') {
        setStats(statsData.data);
      }

      // Fetch tiers
      const tiersResponse = await fetch('/api/referrals/tiers', {
        credentials: 'include',
      });
      const tiersData = await tiersResponse.json();
      
      if (tiersData.status === 'success') {
        setTiers(tiersData.data.tiers);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referral data',
        type: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!stats) return;
    
    const shareUrl = `${window.location.origin}/signup?ref=${stats.summary.referral_code}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
        type: 'success',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const shareReferralLink = async () => {
    if (!stats) return;
    
    const shareUrl = `${window.location.origin}/signup?ref=${stats.summary.referral_code}`;
    const shareText = `Join Promorang and earn rewards! Use my referral code: ${stats.summary.referral_code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Promorang',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyReferralLink();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Unable to load referral data</h2>
          <Button onClick={fetchReferralData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Dashboard</h1>
          <p className="text-gray-600">Earn rewards by inviting friends to Promorang</p>
        </div>

        {/* Referral Code Card */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Your Referral Code</h3>
              <div className="flex items-center gap-3">
                <code className="text-2xl font-mono font-bold bg-white/20 px-4 py-2 rounded-lg">
                  {stats.summary.referral_code}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyReferralLink}
                  className="bg-white/10 border-white/30 hover:bg-white/20 text-white"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyReferralLink}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button
                onClick={shareReferralLink}
                className="bg-white/10 border border-white/30 hover:bg-white/20 text-white"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.summary.total_referrals}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{stats.summary.active_referrals} active</span>
              <span className="text-gray-500 mx-2">•</span>
              <span className="text-gray-600">{stats.summary.pending_referrals} pending</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.summary.conversion_rate}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, parseFloat(stats.summary.conversion_rate))}%` }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.summary.total_earnings.usd)}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>{formatNumber(stats.summary.total_earnings.gems)} gems</span>
              <span className="mx-2">•</span>
              <span>{formatNumber(stats.summary.total_earnings.points)} points</span>
            </div>
          </Card>

          <Card className="p-6" style={{ borderColor: stats.summary.tier.badge_color, borderWidth: 2 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Tier</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.summary.tier.tier_name}
                </p>
              </div>
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${stats.summary.tier.badge_color}20` }}
              >
                {stats.summary.tier.badge_icon}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {(stats.summary.tier.commission_rate * 100).toFixed(1)}% commission rate
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings History</TabsTrigger>
            <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
          </TabsList>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referrals</h3>
              {stats.referrals.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Share your referral code to start earning!
                  </p>
                  <Button onClick={copyReferralLink} className="mt-4">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Referral Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {referral.users?.display_name?.[0] || referral.users?.username?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {referral.users?.display_name || referral.users?.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            Joined {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            referral.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {referral.status}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Earned: {formatCurrency(referral.total_commission_paid)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Earnings</h3>
              {stats.recent_commissions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No earnings yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You'll earn commissions when your referrals complete activities
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recent_commissions.map((commission, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {commission.earning_type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(commission.paid_at || commission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +{commission.commission_amount} {commission.commission_currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Tiers Tab */}
          <TabsContent value="tiers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier) => {
                const isCurrentTier = tier.tier_name === stats.summary.tier.tier_name;
                const isUnlocked = stats.summary.total_referrals >= tier.min_referrals;
                
                return (
                  <Card
                    key={tier.tier_level}
                    className={`p-6 relative ${
                      isCurrentTier ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{
                      ringColor: isCurrentTier ? tier.badge_color : undefined,
                    }}
                  >
                    {isCurrentTier && (
                      <div className="absolute top-4 right-4">
                        <Award className="h-5 w-5 text-yellow-500" />
                      </div>
                    )}
                    <div className="text-center">
                      <div
                        className="inline-flex h-16 w-16 items-center justify-center rounded-full text-3xl mb-4"
                        style={{ backgroundColor: `${tier.badge_color}20` }}
                      >
                        {tier.badge_icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{tier.tier_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tier.min_referrals === 0 ? 'Starting tier' : `${tier.min_referrals}+ referrals`}
                      </p>
                      <div className="mt-4 py-2 px-3 bg-gray-100 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">
                          {(tier.commission_rate * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-600">Commission Rate</p>
                      </div>
                      <div className="mt-4 space-y-2 text-left">
                        {(tier.perks || []).map((perk: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                      {!isUnlocked && (
                        <div className="mt-4 text-sm text-gray-500">
                          {tier.min_referrals - stats.summary.total_referrals} more referrals to unlock
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* How It Works Section */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3">
                <Share2 className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Share Your Code</h4>
              <p className="text-sm text-gray-600">
                Share your unique referral code with friends, family, and followers
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">2. They Sign Up</h4>
              <p className="text-sm text-gray-600">
                When they join using your code, they become your referral
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-3">
                <DollarSign className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Earn Rewards</h4>
              <p className="text-sm text-gray-600">
                Earn {(stats.summary.tier.commission_rate * 100).toFixed(0)}% commission on everything they earn
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
