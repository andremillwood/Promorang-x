import { useState } from 'react';
import { DollarSign, TrendingUp, Wallet, CreditCard, Gift, ArrowUpRight, Clock, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { GuidanceDisclosure } from '@/components/guidance/GuidanceDisclosure';
import { useValuePool, formatCents, getEarningCategoryIcon, type StakeholderEarning } from '@/hooks/useValuePool';
import { useMoneyQualification, getQualificationBlockers } from '@/hooks/useMoneyQualification';
import { useUserTier } from '@/hooks/useUserTier';
import { TierBadge } from '@/components/tier';
import { useI18n } from '@/i18n/I18nContext';
import type { TranslationKey } from '@/i18n/translations';
import { ValueCard } from './ValueCard';

const CAT_KEYS: Record<StakeholderEarning['earning_category'], TranslationKey> = {
  base_mark: "earnDash.catMark",
  sentiment_review: "earnDash.catReview",
  media_upload: "earnDash.catMedia",
  referral_conversion: "earnDash.catReferral",
  featured_testimonial: "earnDash.catFeatured",
  high_engagement: "earnDash.catEngage",
  loyalty_bonus: "earnDash.catLoyalty",
  host_fee: "earnDash.catHost",
  venue_facilitation: "earnDash.catVenue",
  brand_sponsorship: "earnDash.catBrand",
};

export function EarningsDashboard() {
  const { t, formatNumber, formatDate } = useI18n();
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
    { key: "earnDash.marks" as const, amount: summary?.marks_earned_cents || 0, icon: '🎯' },
    { key: "earnDash.reviews" as const, amount: summary?.reviews_earned_cents || 0, icon: '⭐' },
    { key: "earnDash.media" as const, amount: summary?.media_earned_cents || 0, icon: '📸' },
    { key: "earnDash.referrals" as const, amount: summary?.referrals_earned_cents || 0, icon: '👥' },
    { key: "earnDash.bonuses" as const, amount: summary?.bonuses_earned_cents || 0, icon: '💎' },
  ].filter(item => item.amount > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-serif text-3xl font-bold">{t("earnDash.title")}</h1>
            {tierStatus && <TierBadge tier={tierStatus.current_tier} size="sm" />}
          </div>
          <p className="text-muted-foreground">
            {t("earnDash.copy")}
          </p>
        </div>
        
        {tierStatus && (
          <div className="text-sm text-muted-foreground">
            {tierStatus.current_tier === 'guest' && (
              <span>{t("earnDash.guestMult")}</span>
            )}
            {tierStatus.current_tier === 'regular' && (
              <span className="text-green-600 font-medium">✨ {t("earnDash.regularMult")}</span>
            )}
            {tierStatus.current_tier === 'mover' && (
              <span className="text-purple-600 font-medium">⚡ {t("earnDash.moverMult")}</span>
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
              {isQualifiedForMoney ? t("earnDash.available") : t("earnDash.moneyLocked")}
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
                {availableBalance < 500 ? t("earnDash.minWithdraw") : t("earnDash.withdraw")}
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Lock className="w-4 h-4 inline mr-1" />
                {t("earnDash.completeReqs", { count: moneyBlockers.length })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("earnDash.lifetime")}</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCents(totalEarned)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>{t("earnDash.fromMoments", { count: formatNumber(summary?.total_moments_earned_from || 0) })}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("earnDash.withdrawn")}</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCents(totalWithdrawn)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t("earnDash.cashedOut")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earning Breakdown */}
      {breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("earnDash.breakdown")}</CardTitle>
            <CardDescription>{t("earnDash.breakdownCopy")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{t(item.key)}</span>
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
          <CardTitle className="text-lg">{t("earnDash.impact")}</CardTitle>
          <CardDescription>{t("earnDash.impactCopy")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-3xl font-bold">{summary?.lifetime_marks || 0}</div>
              <div className="text-sm text-muted-foreground">{t("earnDash.marksLeft")}</div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-3xl font-bold">{summary?.lifetime_reviews || 0}</div>
              <div className="text-sm text-muted-foreground">{t("earnDash.reviews")}</div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-3xl font-bold">{summary?.lifetime_media || 0}</div>
              <div className="text-sm text-muted-foreground">{t("earnDash.photos")}</div>
            </div>
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="text-3xl font-bold">{summary?.lifetime_referrals_converted || 0}</div>
              <div className="text-sm text-muted-foreground">{t("earnDash.friends")}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("earnDash.recent")}</CardTitle>
        </CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 10).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getEarningCategoryIcon(earning.earning_category)}</span>
                    <div>
                      <p className="font-medium">{t(CAT_KEYS[earning.earning_category])}</p>
                      <p className="text-sm text-muted-foreground">
                        {earning.moment?.title || t("earnDash.unknownMoment")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">+{formatCents(earning.amount_cents)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(earning.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("earnDash.empty")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {rules && (
        <GuidanceDisclosure
          id="earnings-dashboard:rules"
          title={t("earnDash.howTitle")}
          summary={t("earnDash.howSummary")}
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="font-medium">{t("earnDash.attendance")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("earnDash.perMark", { amount: formatCents(rules.base_mark_rate) })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Gift className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="font-medium">{t("earnDash.reviews")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("earnDash.perReview", { amount: formatCents(rules.sentiment_review_rate) })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><CreditCard className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="font-medium">{t("earnDash.media")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("earnDash.perMedia", { amount: formatCents(rules.media_upload_rate) })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><ArrowUpRight className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="font-medium">{t("earnDash.referrals")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("earnDash.perFriend", { amount: formatCents(rules.referral_conversion_rate) })}
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
              <span>
                {t("earnDash.tierMults", { regular: rules.regular_multiplier, mover: rules.mover_multiplier })}
              </span>
            </div>
        </GuidanceDisclosure>
      )}
    </div>
  );
}
