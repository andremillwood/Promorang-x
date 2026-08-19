import { useState } from 'react';
import { DollarSign, TrendingUp, Wallet, CreditCard, Gift, ArrowUpRight, Clock, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { GuidanceDisclosure } from '@/components/guidance/GuidanceDisclosure';
import { useValuePool, formatCents, getEarningCategoryLabel, getEarningCategoryIcon } from '@/hooks/useValuePool';
import { useMoneyQualification, getQualificationBlockers } from '@/hooks/useMoneyQualification';
import { useUserTier } from '@/hooks/useUserTier';
import { TierBadge } from '@/components/tier';
import { ValueCard } from './ValueCard';

export function EarningsDashboard() {
  const { useEarningSummary, useEarningsHistory, useDistributionRules, requestWithdrawal } = useValuePool();
  const { useQualificationStatus } = useMoneyQualification();
  const { useTierStatus } = useUserTier();
  
  const { data: summary, isLoading: summaryLoading } = useEarningSummary();
  const { data: history, isLoading: historyLoading } = useEarningsHistory(20);
  const { data: rules } = useDistributionRules();
  const { data: tierStatus } = useTierStatus();
  const { data: qualification } = useQualificationStatus();
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const isQualifiedForMoney = qualification?.is_qualified_for_money ?? false;
  const moneyBlockers = getQualificationBlockers(qualification);

  if (summaryLoading || historyLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const totalEarned = summary?.total_earned_cents || 0;
  const availableBalance = summary?.available_balance_cents || 0;
  const totalWithdrawn = summary?.total_withdrawn_cents || 0;

  // Calculate earning breakdown
  const breakdown = [
    { label: 'Attendance Marks', amount: summary?.marks_earned_cents || 0, icon: '🎯' },
    { label: 'Reviews', amount: summary?.reviews_earned_cents || 0, icon: '⭐' },
    { label: 'Media Shared', amount: summary?.media_earned_cents || 0, icon: '📸' },
    { label: 'Referrals', amount: summary?.referrals_earned_cents || 0, icon: '👥' },
    { label: 'Bonuses', amount: summary?.bonuses_earned_cents || 0, icon: '💎' },
  ].filter(item => item.amount > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-serif text-3xl font-bold">Your Earnings</h1>
            {tierStatus && <TierBadge tier={tierStatus.current_tier} size="sm" />}
          </div>
          <p className="text-muted-foreground">
            Value you've created and captured from moments
          </p>
        </div>
        
        {tierStatus && (
          <div className="text-sm text-muted-foreground">
            {tierStatus.current_tier === 'guest' && (
              <span>Become a Regular for 1.5x earnings multiplier</span>
            )}
            {tierStatus.current_tier === 'regular' && (
              <span className="text-green-600 font-medium">✨ 1.5x Regular multiplier active</span>
            )}
            {tierStatus.current_tier === 'mover' && (
              <span className="text-purple-600 font-medium">⚡ 2.0x Mover multiplier active</span>
            )}
          </div>
        )}
      </div>

      {/* Qualification & Value Overview */}
      <ValueCard showQualification={true} />
      
      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card className={isQualifiedForMoney ? "bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20" : "bg-muted border-border"}>
          <CardHeader className="pb-2">
            <CardDescription className={isQualifiedForMoney ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}>
              {isQualifiedForMoney ? "Available Balance" : "Money Locked"}
            </CardDescription>
            <CardTitle className={`text-3xl font-bold ${isQualifiedForMoney ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>
              {isQualifiedForMoney ? formatCents(availableBalance) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isQualifiedForMoney ? (
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={availableBalance < 500}
                onClick={() => setShowWithdrawModal(true)}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {availableBalance < 500 ? `Min $5 to withdraw` : 'Withdraw'}
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Lock className="w-4 h-4 inline mr-1" />
                Complete {moneyBlockers.length} requirements to unlock
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lifetime Earnings</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCents(totalEarned)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>From {summary?.total_moments_earned_from || 0} moments</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Withdrawn</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCents(totalWithdrawn)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cashed out to your wallet</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earning Breakdown */}
      {breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Earning Breakdown</CardTitle>
            <CardDescription>How you've earned value</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{formatCents(item.amount)}</span>
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(item.amount / totalEarned) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lifetime Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Impact</CardTitle>
          <CardDescription>Lifetime contributions to the ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-3xl font-bold">{summary?.lifetime_marks || 0}</div>
              <div className="text-sm text-muted-foreground">Marks Left</div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-3xl font-bold">{summary?.lifetime_reviews || 0}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-3xl font-bold">{summary?.lifetime_media || 0}</div>
              <div className="text-sm text-muted-foreground">Photos/Videos</div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-3xl font-bold">{summary?.lifetime_referrals_converted || 0}</div>
              <div className="text-sm text-muted-foreground">Friends Joined</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 10).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getEarningCategoryIcon(earning.earning_category)}</span>
                    <div>
                      <p className="font-medium">{getEarningCategoryLabel(earning.earning_category)}</p>
                      <p className="text-sm text-muted-foreground">
                        {earning.moment?.title || 'Unknown moment'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">+{formatCents(earning.amount_cents)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(earning.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No earnings yet. Start attending moments to earn!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {rules && (
        <GuidanceDisclosure
          id="earnings-dashboard:rules"
          title="How earnings work"
          summary="Open this for the current rates attached to Marks, reviews, media, referrals, and tier multipliers."
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="font-medium">Attendance</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCents(rules.base_mark_rate)} per Mark
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Gift className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="font-medium">Reviews</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCents(rules.sentiment_review_rate)} per review
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><CreditCard className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="font-medium">Media</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCents(rules.media_upload_rate)} per photo/video
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><ArrowUpRight className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="font-medium">Referrals</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCents(rules.referral_conversion_rate)} per friend
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
              <span>
                Tier multipliers: Guest 1.0x • Regular {rules.regular_multiplier}x • Mover {rules.mover_multiplier}x
              </span>
            </div>
        </GuidanceDisclosure>
      )}
    </div>
  );
}
