import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Share2, Users, TrendingUp, DollarSign, Award, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { apiFetch } from '../utils/api';
import PageTransition from '@/react-app/components/ui/PageTransition';
import { useCelebration } from '@/react-app/components/ui/Celebrate';
import { Progress } from '@/components/ui/progress';

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
    tier?: {
      tier_name: string;
      tier_level: number;
      commission_rate: number;
      badge_icon: string;
      badge_color: string;
    } | null;
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [tiers, setTiers] = useState<ReferralTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { celebrate } = useCelebration();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsResponse = await apiFetch('/api/referrals/stats');
      const statsJson = await statsResponse.json();

      if (statsJson.status === 'success' && statsJson.data) {
        setStats(statsJson.data as ReferralStats);
      } else {
        setStats(null);
      }

      // Fetch tiers
      const tiersResponse = await apiFetch('/api/referrals/tiers');
      const tiersJson = await tiersResponse.json();

      if (tiersJson.status === 'success' && tiersJson.data?.tiers) {
        setTiers(tiersJson.data.tiers as ReferralTier[]);
      } else {
        setTiers([]);
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

    const code = stats.summary.referral_code;
    if (!code) {
      toast({
        title: 'Referral code not ready',
        description: 'Your referral code is still being generated. Please try again shortly.',
        type: 'destructive',
      });
      return;
    }

    const shareUrl = `${window.location.origin}/auth?ref=${code}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      celebrate('sparkles');
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

    const code = stats.summary.referral_code;
    if (!code) {
      toast({
        title: 'Referral code not ready',
        description: 'Your referral code is still being generated. Please try again shortly.',
        type: 'destructive',
      });
      return;
    }

    const shareUrl = `${window.location.origin}/auth?ref=${code}`;
    const shareText = `Join Promorang and earn rewards! Use my referral code: ${code}`;

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
      <div className="min-h-screen-dynamic bg-pr-surface-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="h-10 w-64 bg-pr-surface-3 rounded-lg animate-pulse" />
          <div className="h-32 rounded-2xl bg-gradient-to-r from-blue-200 to-purple-200 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`stat-skeleton-${index}`} className="h-40 rounded-xl border border-pr-surface-3 bg-pr-surface-card p-6 animate-pulse">
                <div className="h-4 w-24 bg-pr-surface-3 rounded mb-4" />
                <div className="h-8 w-16 bg-pr-surface-3 rounded mb-4" />
                <div className="h-3 w-32 bg-pr-surface-3 rounded" />
              </div>
            ))}
          </div>
          <div className="h-12 w-full bg-pr-surface-3 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`tier-skeleton-${index}`} className="h-96 rounded-xl border border-pr-surface-3 bg-pr-surface-card p-6 animate-pulse">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-16 w-16 bg-pr-surface-3 rounded-full" />
                  <div className="h-5 w-24 bg-pr-surface-3 rounded" />
                  <div className="h-4 w-32 bg-pr-surface-3 rounded" />
                  <div className="h-16 w-full bg-pr-surface-3 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-pr-text-1">Unable to load referral data</h2>
          <Button onClick={fetchReferralData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const currentTier = stats.summary.tier || null;
  const currentBadgeColor = currentTier?.badge_color || '#6366F1';
  const currentBadgeIcon = currentTier?.badge_icon || '⭐';
  const currentCommissionRate = currentTier?.commission_rate ?? 0.05;

  // Calculate progress to next tier
  const nextTier = tiers.find(t => t.min_referrals > stats.summary.total_referrals);
  const prevTier = [...tiers].reverse().find(t => t.min_referrals <= stats.summary.total_referrals) || tiers[0];

  const progressToNext = nextTier
    ? Math.min(100, Math.round(((stats.summary.total_referrals - prevTier.min_referrals) / (nextTier.min_referrals - prevTier.min_referrals)) * 100))
    : 100;

  return (
    <PageTransition>
      <div className="min-h-screen-dynamic bg-pr-surface-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-pr-text-1 mb-2">Referral Dashboard</h1>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-pr-text-2">Earn rewards by inviting friends to Promorang</p>
              <Button
                variant="outline"
                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                onClick={() => navigate('/venue-qr')}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Create Printable QR Poster
              </Button>
            </div>
          </div>

          {/* Referral Code Card */}
          <Card className="mb-8 p-6 md:p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold mb-3">Your Referral Code</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <code className="text-xl sm:text-2xl font-mono font-bold bg-pr-surface-card/20 px-4 py-2 rounded-lg break-all">
                    {stats.summary.referral_code}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyReferralLink}
                    className="bg-pr-surface-card/10 border-white/30 hover:bg-pr-surface-card/20 text-white"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  onClick={copyReferralLink}
                  className="btn-spring bg-pr-surface-card text-blue-600 hover:bg-pr-surface-2 w-full sm:w-auto"
                  size="lg"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  onClick={shareReferralLink}
                  className="btn-spring bg-pr-surface-card/10 border border-white/30 hover:bg-pr-surface-card/20 text-white w-full sm:w-auto"
                  size="lg"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Tier Progress Bar (Next Level gamification) */}
            {nextTier && (
              <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold">Next Level: {nextTier.tier_name}</span>
                  <span className="text-xs font-medium">{nextTier.min_referrals - stats.summary.total_referrals} more referrals needed</span>
                </div>
                <Progress value={progressToNext} className="h-2 bg-white/20" indicatorClassName="bg-gradient-to-r from-yellow-400 to-orange-400" />
              </div>
            )}
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="animate-slide-up-delay-1 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pr-text-2">Total Referrals</p>
                  <p className="text-3xl font-bold text-pr-text-1 mt-2">
                    {stats.summary.total_referrals}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">{stats.summary.active_referrals} active</span>
                <span className="text-pr-text-2 mx-2">•</span>
                <span className="text-pr-text-2">{stats.summary.pending_referrals} pending</span>
              </div>
            </Card>

            <Card className="animate-slide-up-delay-2 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pr-text-2">Conversion Rate</p>
                  <p className="text-3xl font-bold text-pr-text-1 mt-2">
                    {stats.summary.conversion_rate}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-pr-surface-3 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, parseFloat(stats.summary.conversion_rate))}%` }}
                  />
                </div>
              </div>
            </Card>

            <Card className="animate-slide-up-delay-3 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pr-text-2">Total Earnings</p>
                  <p className="text-3xl font-bold text-pr-text-1 mt-2">
                    {formatCurrency(stats.summary.total_earnings.usd)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-pr-text-2">
                <span>{formatNumber(stats.summary.total_earnings.gems)} gems</span>
                <span className="mx-2">•</span>
                <span>{formatNumber(stats.summary.total_earnings.points)} points</span>
              </div>
            </Card>

            <Card
              className="animate-slide-up-delay-4 p-6"
              style={currentTier ? { borderColor: currentBadgeColor, borderWidth: 2 } : {}}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-pr-text-2">Current Tier</p>
                  <p className="text-2xl font-bold text-pr-text-1 mt-2">
                    {currentTier?.tier_name || 'Starter'}
                  </p>
                </div>
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${currentBadgeColor}20` }}
                >
                  {currentBadgeIcon}
                </div>
              </div>
              <div className="mt-4 text-sm text-pr-text-2">
                {(currentCommissionRate * 100).toFixed(1)}% commission rate
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="referrals" className="space-y-6">
            <TabsList className="bg-pr-surface-card border border-pr-surface-3">
              <TabsTrigger value="referrals">My Referrals</TabsTrigger>
              <TabsTrigger value="earnings">Earnings History</TabsTrigger>
              <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
            </TabsList>

            {/* Referrals Tab */}
            <TabsContent value="referrals">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Your Referrals</h3>
                {stats.referrals.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-pr-text-1">No referrals yet</h3>
                    <p className="mt-1 text-sm text-pr-text-2">
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
                        className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg hover:bg-pr-surface-2 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {referral.users?.display_name?.[0] || referral.users?.username?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-pr-text-1">
                              {referral.users?.display_name || referral.users?.username}
                            </p>
                            <p className="text-sm text-pr-text-2">
                              Joined {new Date(referral.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${referral.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {referral.status}
                          </span>
                          <p className="text-sm text-pr-text-2 mt-1">
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
                <h3 className="text-lg font-semibold text-pr-text-1 mb-4">Recent Earnings</h3>
                {stats.recent_commissions.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-pr-text-1">No earnings yet</h3>
                    <p className="mt-1 text-sm text-pr-text-2">
                      You'll earn commissions when your referrals complete activities
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recent_commissions.map((commission, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-pr-surface-2 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-pr-text-1 capitalize">
                            {commission.earning_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-pr-text-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {tiers.map((tier) => {
                  const isCurrentTier = currentTier ? tier.tier_name === currentTier.tier_name : false;
                  const isUnlocked = stats.summary.total_referrals >= tier.min_referrals;

                  return (
                    <Card
                      key={tier.tier_level}
                      className={`p-6 relative transition-all hover:shadow-lg ${isCurrentTier ? 'ring-2 ring-offset-2 shadow-xl' : ''
                        } ${!isUnlocked ? 'opacity-60' : ''
                        }`}
                      style={{
                        ringColor: isCurrentTier ? tier.badge_color : undefined,
                        borderColor: isCurrentTier ? tier.badge_color : undefined,
                        borderWidth: isCurrentTier ? '2px' : undefined,
                      }}
                    >
                      {isCurrentTier && (
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                            <Award className="h-3 w-3" />
                            <span>Current</span>
                          </div>
                        </div>
                      )}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-gray-900/5 rounded-xl pointer-events-none" />
                      )}
                      <div className="text-center">
                        <div
                          className="inline-flex h-20 w-20 items-center justify-center rounded-full text-4xl mb-4 shadow-md"
                          style={{ backgroundColor: `${tier.badge_color}20`, color: tier.badge_color }}
                        >
                          {tier.badge_icon}
                        </div>
                        <h3 className="text-xl font-bold text-pr-text-1 mb-1">{tier.tier_name}</h3>
                        <p className="text-sm text-pr-text-2 mt-1">
                          {tier.min_referrals === 0 ? 'Starting tier' : `${tier.min_referrals}+ referrals`}
                        </p>
                        <div
                          className="mt-4 py-3 px-4 rounded-lg shadow-sm"
                          style={{ backgroundColor: `${tier.badge_color}10` }}
                        >
                          <p className="text-3xl font-bold" style={{ color: tier.badge_color }}>
                            {(tier.commission_rate * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-pr-text-2 font-medium mt-1">Commission Rate</p>
                        </div>
                        <div className="mt-4 space-y-2 text-left">
                          {(tier.perks || []).map((perk: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 text-sm text-pr-text-1">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                        {!isUnlocked && (
                          <div className="mt-4 px-3 py-2 bg-pr-surface-2 rounded-lg">
                            <p className="text-sm font-semibold text-pr-text-1">
                              {tier.min_referrals - stats.summary.total_referrals} more to unlock
                            </p>
                          </div>
                        )}
                        {isUnlocked && !isCurrentTier && (
                          <div className="mt-4 px-3 py-2 bg-green-100 rounded-lg">
                            <p className="text-sm font-semibold text-green-700">Unlocked!</p>
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
          <Card className="mt-8 p-6 bg-pr-surface-card border border-pr-surface-3">
            <h3 className="text-lg font-semibold text-pr-text-1 mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3">
                  <Share2 className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-pr-text-1 mb-2">1. Share Your Code</h4>
                <p className="text-sm text-pr-text-2">
                  Share your unique referral code with friends, family, and followers
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-pr-text-1 mb-2">2. They Sign Up</h4>
                <p className="text-sm text-pr-text-2">
                  When they join using your code, they become your referral
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-3">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-pr-text-1 mb-2">3. Earn Rewards</h4>
                <p className="text-sm text-pr-text-2">
                  Earn {(currentCommissionRate * 100).toFixed(0)}% commission on everything they earn
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
