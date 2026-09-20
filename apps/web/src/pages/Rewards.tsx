import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRewards, useClaimReward } from "@/hooks/useRewards";
import { useUserBalance, useEconomyHistory } from "@/hooks/useEconomy";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Gift, 
    ArrowUpRight, 
    Info, 
    Coins,
    Key,
    Lock as LockIcon,
    Unlock as UnlockIcon,
    History as HistoryIcon,
    ArrowDownLeft,
} from "lucide-react";
import { EconomyPathGuide } from "@/components/participant/EconomyPathGuide";
import { PersonalValueNav } from "@/components/value/PersonalValueNav";
import { useI18n } from "@/i18n/I18nContext";

const Rewards = () => {
  const { t, formatNumber, formatDate } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Economy Data
  const { data: balance, isLoading: balanceLoading, isError: balanceError } = useUserBalance();
  const { data: history, isLoading: historyLoading, isError: historyError } = useEconomyHistory();

  // Per-Moment Rewards Data
  const { data: rewards, isLoading: rewardsLoading, isError: rewardsError } = useUserRewards();

  const claimReward = useClaimReward();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const earnedRewards = rewards?.filter((r) => r.status === "earned") || [];
  const claimedRewards = rewards?.filter((r) => r.status === "claimed") || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <PersonalValueNav />
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-3 font-serif text-2xl font-black text-foreground sm:text-3xl">
            {t("rewardsPage.title")}
          </h1>
          <p className="text-muted-foreground font-medium">
            {t("rewardsPage.subtitle")}
          </p>
        </div>
        
        <div className="max-w-sm rounded-2xl border border-border bg-card p-4 text-xs leading-5 text-muted-foreground">
          This page shows recorded balances, reward claims and economy history. A claim is not merchant validation, fulfillment or settlement.
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline">
          <Link to="/wallet">{t("rewardsPage.openWallet")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/marketplace">{t("rewardsPage.openMarketplace")}</Link>
        </Button>
      </div>

      <div className="mb-10">
        <EconomyPathGuide />
      </div>

      {(balanceError || rewardsError || historyError) && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
          Some recorded reward sources are unavailable. Missing balances, rewards, or history are not being shown as zero or empty activity.
        </div>
      )}

      {/* Economy Wallet */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
        {/* Points Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coins className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium uppercase tracking-wider">{t("rewardsPage.totalPoints")}</span>
            </div>
            {balanceLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : balanceError ? (
              <p className="text-sm font-semibold text-amber-600">Unavailable</p>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground sm:text-4xl">{formatNumber(balance?.points ?? 0)}</span>
                <span className="text-sm text-green-600 font-medium dark:text-green-400">{t("rewardsPage.earnedActivity")}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
              <span className="w-3 h-3"><Info className="w-3 h-3" /></span>
              {t("rewardsPage.pointsDisclaimer")}
            </p>
          </div>
        </div>

        {/* Keys Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Key className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Key className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium uppercase tracking-wider">{t("rewardsPage.promoKeys")}</span>
            </div>
            {balanceLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : balanceError ? (
              <p className="text-sm font-semibold text-amber-600">Unavailable</p>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground sm:text-4xl">{formatNumber(balance?.promokeys ?? 0)}</span>
                <span className="text-sm text-primary font-medium">{t("rewardsPage.lockedAccess")}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              {t("rewardsPage.promoKeysDesc")}
            </p>
          </div>
        </div>

      </div>

      <Tabs defaultValue="perks" className="w-full">
        <TabsList className="mb-8 justify-start gap-4 rounded-none border-b border-border bg-transparent p-0 sm:gap-8">
          <TabsTrigger
            value="perks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]"
          >
            <Gift className="w-4 h-4 mr-2" />
            {t("rewardsPage.tabMyPerks")}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]"
          >
            <HistoryIcon className="w-4 h-4 mr-2" />
            {t("rewardsPage.tabActivityLedger")}
          </TabsTrigger>
        </TabsList>

        {/* --- PERKS TAB --- */}
        <TabsContent value="perks" className="mt-0">
          <div className="space-y-8">
            {/* Available Perks */}
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  {t("rewardsPage.availUnlockTitle")}
                </h2>
                {earnedRewards.length > 0 && <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{t("rewardsPage.keysRequired", { count: earnedRewards.length.toString() })}</Badge>}
              </div>

              {rewardsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                  ))}
                </div>
              ) : rewardsError ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
                  <h3 className="font-semibold text-foreground">Rewards unavailable</h3>
                  <p className="mt-2 text-sm text-muted-foreground">The recorded reward ledger could not be loaded. No empty state has been substituted.</p>
                </div>
              ) : earnedRewards.length === 0 ? (
                <div className="bg-card rounded-2xl p-12 border border-border border-dashed text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <HistoryIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{t("rewardsPage.vaultEmptyTitle")}</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    {t("rewardsPage.vaultEmptyDesc")}
                  </p>
                  <Button variant="hero" onClick={() => navigate("/explore/moments")}>
                    {t("rewardsPage.exploreMomentsCta")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {earnedRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-card rounded-[1.5rem] p-6 border border-border/60 hover:border-primary/40 hover:shadow-glow transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Key className="w-16 h-16" />
                      </div>
                      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500">
                          <Gift className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-xl text-foreground mb-1 italic font-serif leading-tight">{reward.reward_value}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
                            {reward.moment?.title || t("rewardsPage.communityMoment")}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Recorded reward · claim and redemption remain separate</p>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Button
                          variant="hero"
                          className="flex-1 shadow-glow h-11 text-xs uppercase font-black tracking-widest"
                          onClick={() => claimReward.mutate(reward.id)}
                          disabled={claimReward.isPending}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          {claimReward.isPending ? "Recording…" : "Record claim"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Claimed History */}
            {claimedRewards.length > 0 && (
              <div className="pt-8 border-t border-border">
                <div className="flex items-center gap-2 mb-6">
                    <HistoryIcon className="w-5 h-5 text-muted-foreground" />
                    <h2 className="font-serif text-xl font-bold text-foreground">{t("rewardsPage.unlockedHistoryTitle")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {claimedRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/50 p-4 grayscale transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] duration-500 hover:grayscale-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <UnlockIcon className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-foreground truncate text-sm">
                            {reward.reward_value}
                          </h4>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            Claimed {formatDate(reward.claimed_at!, { month: "short", day: "numeric", year: "numeric" })} · fulfillment not implied
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* --- HISTORY TAB --- */}
        <TabsContent value="history" className="mt-0">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                <HistoryIcon className="w-5 h-5 text-primary" />
                {t("rewardsPage.economyLedgerTitle")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("rewardsPage.economyLedgerDesc")}
              </p>
            </div>

            {historyLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : historyError ? (
              <div className="p-12 text-center">
                <LockIcon className="mx-auto h-4 w-4 text-amber-500" />
                <p className="mt-2 font-medium text-foreground">Economy history unavailable</p>
                <p className="mt-1 text-xs text-muted-foreground">A source failure is not an empty ledger.</p>
              </div>
            ) : history?.length === 0 ? (
              <div className="p-12 text-center">
                <LockIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <p className="text-muted-foreground font-medium">{t("rewardsPage.noActivityTitle")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("rewardsPage.noActivityDesc")}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history?.map((entry) => (
                  <div key={entry.id} className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${entry.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                        {entry.amount > 0 ? (
                          <ArrowUpRight className={`w-5 h-5 ${entry.amount > 0 ? 'text-green-500' : 'text-red-500'}`} />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {entry.description || entry.transaction_type.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px] uppercase tracking-tighter px-1">
                            {entry.source.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(entry.created_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-black ${entry.amount > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount} <span className="text-[10px] uppercase font-bold">{entry.currency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-primary mr-1 italic">Note:</span>
              {t("rewardsPage.ledgerNote")}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rewards;
