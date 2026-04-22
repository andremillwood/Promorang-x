import { DollarSign, Key, Gift, Ticket, Coins, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMoneyQualification, getQualificationRequirement, getQualificationBlockers } from '@/hooks/useMoneyQualification';
import { useValuePool, formatCents } from '@/hooks/useValuePool';
import { useUserTier } from '@/hooks/useUserTier';
import { TierBadge } from '@/components/tier';

interface ValueCardProps {
  showQualification?: boolean;
  compact?: boolean;
}

export function ValueCard({ showQualification = true, compact = false }: ValueCardProps) {
  const { useQualificationStatus, useRewardBundles, recalculate } = useMoneyQualification();
  const { useEarningSummary } = useValuePool();
  const { useTierStatus } = useUserTier();
  
  const { data: qualification } = useQualificationStatus();
  const { data: summary } = useEarningSummary();
  const { data: tierStatus } = useTierStatus();
  const { data: recentRewards } = useRewardBundles(5);

  const isQualified = qualification?.is_qualified_for_money ?? false;
  const requirements = getQualificationRequirement(qualification);
  const blockers = isQualified ? [] : getQualificationBlockers(qualification);

  // Calculate totals from reward bundles
  const totalPoints = recentRewards?.reduce((sum, r) => sum + r.points_awarded, 0) || 0;
  const totalMoney = recentRewards?.reduce((sum, r) => sum + r.money_awarded_cents, 0) || 0;
  const keysEarned = recentRewards?.filter(r => r.key_earned).length || 0;
  const coupons = recentRewards?.filter(r => r.coupon_issued).length || 0;
  const giveaways = recentRewards?.filter(r => r.giveaway_won).length || 0;

  if (compact) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isQualified ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {isQualified ? (
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{isQualified ? 'Money Qualified' : 'Points Only'}</p>
                <p className="text-sm text-muted-foreground">
                  {isQualified 
                    ? `Earn up to $${tierStatus?.current_tier === 'mover' ? '4' : tierStatus?.current_tier === 'regular' ? '3' : '2'} per Mark`
                    : `${blockers.length} requirements to unlock money`
                  }
                </p>
              </div>
            </div>
            {tierStatus && <TierBadge tier={tierStatus.current_tier} size="sm" />}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Qualification Status */}
      {showQualification && (
        <Card className={isQualified ? 'border-emerald-500/30' : 'border-amber-500/30'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Money Qualification</CardTitle>
                {isQualified ? (
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Qualified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800">
                    <Lock className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => recalculate.mutate()}
                disabled={recalculate.isPending}
              >
                Check Status
              </Button>
            </div>
            <CardDescription>
              {isQualified 
                ? "You meet all requirements to earn real money from your participation"
                : "Complete these requirements to unlock money earnings"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requirements.map((req) => (
                <div key={req.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {req.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={req.met ? '' : 'text-muted-foreground'}>
                      {req.label}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {req.requirement}
                  </span>
                </div>
              ))}
            </div>

            {!isQualified && blockers.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-900 mb-2">To unlock money earnings:</p>
                <ul className="text-sm text-amber-800 space-y-1">
                  {blockers.map((blocker, i) => (
                    <li key={i}>• {blocker}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Value Types Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Value Summary</CardTitle>
          <CardDescription>All rewards earned from your participation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Points */}
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <Coins className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summary?.total_earned_cents ? '∞' : '∞'}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Points</div>
              <div className="text-xs text-blue-600 mt-1">Always earn</div>
            </div>

            {/* Money */}
            <div className={`text-center p-4 rounded-lg ${isQualified ? 'bg-emerald-500/10' : 'bg-muted'}`}>
              <DollarSign className={`w-6 h-6 mx-auto mb-2 ${isQualified ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
              <div className={`text-2xl font-bold ${isQualified ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                {isQualified ? formatCents(summary?.total_earned_cents || 0) : '—'}
              </div>
              <div className={`text-sm ${isQualified ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>Money</div>
              <div className={`text-xs mt-1 ${isQualified ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {isQualified ? 'Qualifed to earn' : 'Locked'}
              </div>
            </div>

            {/* Keys */}
            <div className="text-center p-4 bg-purple-500/10 rounded-lg">
              <Key className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {tierStatus?.current_tier === 'guest' ? 0 : tierStatus?.current_tier === 'regular' ? 1 : tierStatus?.current_tier === 'mover' ? 2 : 3}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Keys</div>
              <div className="text-xs text-purple-600 mt-1">Unlock features</div>
            </div>

            {/* Extras (Giveaways + Coupons) */}
            <div className="text-center p-4 bg-amber-500/10 rounded-lg">
              <Gift className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{giveaways + coupons}</div>
              <div className="text-sm text-amber-700">Extras</div>
              <div className="text-xs text-amber-600 mt-1">Giveaways & Coupons</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      {recentRewards && recentRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentRewards.slice(0, 5).map((reward) => (
                <div key={reward.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <div>
                      <p className="font-medium">{reward.moment?.title || 'Unknown Moment'}</p>
                      <p className="text-xs text-muted-foreground">
                        {reward.was_qualified_for_money ? 'Money + Points' : 'Points Only'} • {reward.tier_at_mark} tier
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <Coins className="w-3 h-3 text-blue-500" />
                      <span>+{reward.points_awarded}</span>
                    </div>
                    {reward.money_awarded_cents > 0 && (
                      <div className="flex items-center gap-1 text-sm text-emerald-600">
                        <DollarSign className="w-3 h-3" />
                        <span>+{formatCents(reward.money_awarded_cents)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
