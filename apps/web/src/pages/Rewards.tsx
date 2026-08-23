import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRewards, useClaimReward, useRewardStats } from "@/hooks/useRewards";
import { useUserBalance, useEconomyHistory } from "@/hooks/useEconomy";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
    Gift, 
    Zap, 
    ArrowUpRight, 
    Share2, 
    Bell, 
    Trophy, 
    Crown, 
    Sparkles, 
    Info, 
    User, 
    Heart, 
    TrendingUp,
    LayoutGrid,
    Users,
    Coins,
    Key,
    Lock as LockIcon,
    Unlock as UnlockIcon,
    History as HistoryIcon,
    Calendar,
    Check,
    Clock,
    ArrowDownLeft,
    Copy,
    ChevronRight,
    Search,
    ShieldCheck
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EconomyPathGuide } from "@/components/participant/EconomyPathGuide";
import { KeyUnlockAnimation } from "@/components/rewards/KeyUnlockAnimation";
import { PublicStanding } from "@/components/rewards/PublicStanding";
import { PersonalValueNav } from "@/components/value/PersonalValueNav";
import { useI18n } from "@/i18n/I18nContext";

const Rewards = () => {
  const { t, formatNumber } = useI18n();
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Economy Data
  const { data: balance, isLoading: balanceLoading } = useUserBalance();
  const { data: history, isLoading: historyLoading } = useEconomyHistory();

  // Per-Moment Rewards Data
  const { data: rewards, isLoading: rewardsLoading } = useUserRewards();
  const { data: stats, isLoading: statsLoading } = useRewardStats();

  const claimReward = useClaimReward();
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockedRewardId, setUnlockedRewardId] = useState<string | null>(null);

  const primaryRole = roles[0] || "participant";

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast({
      title: t("rewardsPage.copiedToastTitle"),
      description: t("rewardsPage.copiedToastDesc"),
    });
  };

  const handleShareWin = async (rewardName: string, momentName: string) => {
    const text = t("rewardsPage.shareWinText", { reward: rewardName, moment: momentName });
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Promorang Reward Unlock!',
          text: text,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
      toast({
        title: t("rewardsPage.shareLinkToastTitle"),
        description: t("rewardsPage.shareLinkToastDesc"),
      });
    }
  };

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
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-muted-foreground font-medium">
            {t("rewardsPage.subtitle")}
          </p>
        </div>
        
        {/* Vault Security Widget */}
        <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t("rewardsPage.vaultLiquidity")}</p>
                <p className="text-[10px] text-emerald-600/70 font-bold dark:text-emerald-400/80">{t("rewardsPage.vaultLiquidityDesc")}</p>
            </div>
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

      {/* Economy Wallet */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
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
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground sm:text-4xl">{formatNumber(balance?.points || 0)}</span>
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
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground sm:text-4xl">{formatNumber(balance?.promokeys || 0)}</span>
                <span className="text-sm text-primary font-medium">{t("rewardsPage.lockedAccess")}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              {t("rewardsPage.promoKeysDesc")}
            </p>
          </div>
        </div>

        {/* Access Rank / Unlock Matrix Flex */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/50 p-5 shadow-soft-xl sm:p-6">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold uppercase tracking-wider text-accent">{t("rewardsPage.accessRank")}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-black text-foreground sm:text-4xl">{t("rewardsPage.rankPrefix", { rank: String(user?.user_metadata?.maturity_state || 2) })}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground font-medium flex items-center gap-1 mb-4">
               {t("rewardsPage.currentStatusLabel")} <Badge variant="outline" className="text-[10px] uppercase bg-accent/10 text-accent border-accent/20 px-1 py-0 h-4">{t("rewardsPage.verifiedExplorerBadge")}</Badge>
            </div>
            
            <div className="mt-4 mb-4">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shadow-inner font-mono text-[8px] flex">
                <div className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300 animate-pulse" style={{ width: '45%' }}></div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">{t("rewardsPage.progressToRank3")}</p>
                <p className="text-[10px] text-primary font-bold">45%</p>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1 italic">{t("rewardsPage.canonEntriesRequired")}</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full mt-2 text-xs font-bold h-9 bg-background/50 hover:bg-background border border-border/50 text-foreground shadow-sm">
                  <Key className="w-3.5 h-3.5 mr-2 text-primary" /> {t("rewardsPage.viewUnlockMatrix")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-background border-border/60 p-0 overflow-hidden">
                 <div className="bg-charcoal text-cream p-6 text-center relative overflow-hidden">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/20 rounded-full blur-[50px] pointer-events-none" />
                     <h3 className="font-serif text-2xl font-bold relative z-10">{t("rewardsPage.matrixModalTitle")}</h3>
                     <p className="text-white/60 text-sm mt-1 relative z-10">{t("rewardsPage.matrixModalDesc")}</p>
                 </div>
                 <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    
                    {/* Rank 1 */}
                    <div className="flex gap-4 rounded-xl border border-border bg-card p-4 opacity-50 grayscale">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-muted bg-muted/20">
                          <span className="font-black text-muted-foreground">1</span>
                       </div>
                       <div className="min-w-0">
                          <h4 className="font-bold text-foreground">{t("rewardsPage.matrixRank1Title")}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{t("rewardsPage.matrixRank1Desc")}</p>
                       </div>
                    </div>

                    {/* Rank 2 (Current) */}
                    <div className="relative flex gap-4 overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-4 ring-1 ring-primary/20">
                       <div className="absolute top-2 right-2"><Badge variant="default" className="text-[9px] uppercase px-1">You</Badge></div>
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground font-black shadow-md">
                          2
                       </div>
                       <div className="min-w-0">
                          <h4 className="font-bold text-primary">{t("rewardsPage.matrixRank2Title")}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{t("rewardsPage.matrixRank2Desc")}</p>
                       </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card relative">
                       <div className="absolute top-2 right-2"><LockIcon className="w-3 h-3 text-muted-foreground/50" /></div>
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-muted-foreground/30 bg-muted">
                          <span className="font-black text-muted-foreground">3</span>
                       </div>
                       <div className="min-w-0">
                          <h4 className="font-bold text-foreground">{t("rewardsPage.matrixRank3Title")}</h4>
                          <p className="mt-1 text-xs font-medium text-orange-600 dark:text-orange-400">{t("rewardsPage.matrixRank3Desc")}</p>
                       </div>
                    </div>

                    {/* Rank 5 */}
                    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card relative">
                       <div className="absolute top-2 right-2"><LockIcon className="w-3 h-3 text-muted-foreground/50" /></div>
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-orange-500 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                          <span className="font-black text-orange-600 dark:text-orange-400">5</span>
                       </div>
                       <div className="min-w-0">
                          <h4 className="font-bold text-foreground">{t("rewardsPage.matrixRank5Title")}</h4>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                             <li>{t("rewardsPage.matrixRank5Feat1")}</li>
                             <li>{t("rewardsPage.matrixRank5Feat2")}</li>
                             <li>{t("rewardsPage.matrixRank5Feat3")}</li>
                          </ul>
                       </div>
                    </div>
                 </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Referral Hub Card */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border/60 rounded-2xl p-6 relative overflow-hidden group shadow-soft-xl border-emerald-500/20">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold uppercase tracking-wider text-emerald-600">{t("rewardsPage.referralHub")}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-foreground">12</span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase">{t("rewardsPage.successes")}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">{t("rewardsPage.referralDescPart1")}<span className="text-emerald-600">{t("rewardsPage.referralDescPart2")}</span>{t("rewardsPage.referralDescPart3")}</p>
            <Button variant="outline" size="sm" className="w-full mt-6 text-xs font-bold h-9 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-sm">
              <Share2 className="w-3.5 h-3.5 mr-2" /> {t("rewardsPage.inviteAndGrow")}
            </Button>
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
            value="standing"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base transition-[color,background-color,border-color,opacity,box-shadow,transform,filter]"
          >
            <Crown className="w-4 h-4 mr-2" />
            {t("rewardsPage.tabStanding")}
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
                            {reward.moment?.title || "Community Moment"}
                          </p>
                          <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <Avatar key={i} className="h-5 w-5 border border-card">
                                        <AvatarFallback className="bg-muted text-[8px] font-black">U</AvatarFallback>
                                    </Avatar>
                                ))}
                             </div>
                             <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{t("rewardsPage.othersClaimed")}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="hero"
                              className="flex-1 shadow-glow h-11 text-xs uppercase font-black tracking-widest"
                              onClick={() => {
                                setSelectedReward(reward.id);
                                setIsUnlocking(true);
                              }}
                            >
                              <Key className="w-4 h-4 mr-2" />
                              {t("rewardsPage.spendKey")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md bg-charcoal text-cream border-white/5 p-0 overflow-hidden">
                            {isUnlocking ? (
                                <KeyUnlockAnimation onComplete={() => setIsUnlocking(false)} />
                            ) : (
                                <>
                                    <div className="bg-gradient-primary p-8 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 shadow-2xl border border-white/20">
                                            <Gift className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="font-black text-3xl mb-1 italic font-serif text-white tracking-tight">{reward.reward_value}</h3>
                                        <p className="text-white/70 text-sm font-medium">{t("rewardsPage.unlockedVia")}</p>
                                    </div>
                                    
                                    <div className="p-8 space-y-8">
                                        {reward.redemption_code && (
                                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 text-center relative group">
                                                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 mb-4">{t("rewardsPage.digitalRedemptionCode")}</p>
                                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                                    <code className="max-w-full break-all text-3xl font-black italic tracking-tighter text-primary sm:text-4xl">
                                                        {reward.redemption_code}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-white/20 hover:text-primary hover:bg-white/5"
                                                        onClick={() => handleCopyCode(reward.redemption_code!)}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <Button
                                                variant="outline"
                                                className="border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-widest text-[10px] h-12"
                                                onClick={() => handleShareWin(reward.reward_value, reward.moment?.title || "a campaign")}
                                            >
                                                <Share2 className="w-4 h-4 mr-2 text-primary" />
                                                {t("rewardsPage.bragToWall")}
                                            </Button>
                                            <Button
                                                variant="hero"
                                                className="h-12 font-black uppercase tracking-widest text-[10px] shadow-glow"
                                                onClick={() => claimReward.mutate(reward.id)}
                                                disabled={claimReward.isPending}
                                            >
                                                {claimReward.isPending ? t("rewardsPage.syncing") : t("rewardsPage.markUsed")}
                                            </Button>
                                        </div>
                                        
                                        <p className="text-center text-[9px] text-white/20 font-medium uppercase tracking-widest">
                                            {t("rewardsPage.verifiedNodeText")}
                                        </p>
                                    </div>
                                </>
                            )}
                          </DialogContent>
                        </Dialog>
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
                            {t("rewardsPage.redeemedOn", { date: format(new Date(reward.claimed_at!), "MMM d, yyyy") })}
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

        {/* --- STANDING TAB --- */}
        <TabsContent value="standing" className="mt-0">
           <div className="space-y-8 scale-in duration-500">
               <div className="p-8 bg-gradient-to-br from-charcoal to-black rounded-[2rem] border border-white/5 text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
                   <div className="relative z-10">
                       <Crown className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
                       <h2 className="font-serif text-4xl font-black italic text-white tracking-tighter">{t("rewardsPage.communityStandingTitle")}</h2>
                       <p className="text-white/50 text-sm mt-2 max-w-lg mx-auto">
                           {t("rewardsPage.communityStandingDesc")}
                       </p>
                   </div>
               </div>
               
               <PublicStanding />
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
                            {format(new Date(entry.created_at), "MMM d, h:mm a")}
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
