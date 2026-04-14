import { useNavigate } from "react-router-dom";
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

const Rewards = () => {
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
      title: "Copied!",
      description: "Redemption code copied to clipboard.",
    });
  };

  const handleShareWin = async (rewardName: string, momentName: string) => {
    const text = `I just unlocked ${rewardName} from ${momentName} using Promorang! 🎉`;
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
        title: "Link Copied! 🔗",
        description: "Share your win with friends on social media.",
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-foreground mb-2 flex items-center gap-3">
            The Rewards Vault
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-muted-foreground font-medium">
            Verified proof of work yields exclusive standing and perks.
          </p>
        </div>
        
        {/* Vault Security Widget */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Vault Liquidity</p>
                <p className="text-[10px] text-emerald-600/70 font-bold">$42,500 USD Locked in Rewards</p>
            </div>
        </div>
      </div>

      <div className="mb-10">
        <EconomyPathGuide />
      </div>

      {/* Economy Wallet */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Points Card */}
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coins className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium uppercase tracking-wider">Total Points</span>
            </div>
            {balanceLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{balance?.points?.toLocaleString() || 0}</span>
                <span className="text-sm text-green-500 font-medium">Earned activity</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
              <span className="w-3 h-3"><Info className="w-3 h-3" /></span>
              Points convert to Keys every 1,000 pts.
            </p>
          </div>
        </div>

        {/* Keys Card */}
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Key className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Key className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium uppercase tracking-wider">PromoKeys</span>
            </div>
            {balanceLoading ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{balance?.promokeys || 0}</span>
                <span className="text-sm text-primary font-medium">Locked access</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Spend Keys to unlock high-value funded moments.
            </p>
          </div>
        </div>

        {/* Access Rank / Unlock Matrix Flex */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border/60 rounded-2xl p-6 relative overflow-hidden group shadow-soft-xl">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold uppercase tracking-wider text-accent">Access Rank</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-foreground">Rank {user?.user_metadata?.maturity_state || 2}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground font-medium flex items-center gap-1 mb-4">
               Current Status: <Badge variant="outline" className="text-[10px] uppercase bg-accent/10 text-accent border-accent/20 px-1 py-0 h-4">Verified Explorer</Badge>
            </div>
            
            <div className="mt-4 mb-4">
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden shadow-inner font-mono text-[8px] flex">
                <div className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300 animate-pulse" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Progress to Rank 3</p>
                <p className="text-[10px] text-primary font-bold">45%</p>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1 italic">12 more Canon Entries required to reach Priority Access.</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="w-full mt-2 text-xs font-bold h-9 bg-background/50 hover:bg-background border border-border/50 text-foreground shadow-sm">
                  <Key className="w-3.5 h-3.5 mr-2 text-primary" /> View Unlock Matrix
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-background border-border/60 p-0 overflow-hidden">
                 <div className="bg-charcoal text-cream p-6 text-center relative overflow-hidden">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/20 rounded-full blur-[50px] pointer-events-none" />
                     <h3 className="font-serif text-2xl font-bold relative z-10">The Access Matrix</h3>
                     <p className="text-white/60 text-sm mt-1 relative z-10">Your rank determines what you can reach.</p>
                 </div>
                 <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    
                    {/* Rank 1 */}
                    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card opacity-50 grayscale">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-muted bg-muted/20">
                          <span className="font-black text-muted-foreground">1</span>
                       </div>
                       <div>
                          <h4 className="font-bold text-foreground">General Admission</h4>
                          <p className="text-xs text-muted-foreground mt-1">Basic check-ins and standard rewards.</p>
                       </div>
                    </div>

                    {/* Rank 2 (Current) */}
                    <div className="flex gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5 ring-1 ring-primary/20 relative overflow-hidden">
                       <div className="absolute top-2 right-2"><Badge variant="default" className="text-[9px] uppercase px-1">You</Badge></div>
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground font-black shadow-md">
                          2
                       </div>
                       <div>
                          <h4 className="font-bold text-primary">Verified Explorer</h4>
                          <p className="text-xs text-muted-foreground mt-1">Unlock minor multipliers. Validated in the Canon.</p>
                       </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card relative">
                       <div className="absolute top-2 right-2"><LockIcon className="w-3 h-3 text-muted-foreground/50" /></div>
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-slate-400 bg-slate-50">
                          <span className="font-black text-slate-700">3</span>
                       </div>
                       <div>
                          <h4 className="font-bold text-foreground">Priority Access</h4>
                          <p className="text-xs text-muted-foreground mt-1 text-orange-600 font-medium">Unlocks 24-hour early access to high-value bounties.</p>
                       </div>
                    </div>

                    {/* Rank 5 */}
                    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card relative">
                       <div className="absolute top-2 right-2"><LockIcon className="w-3 h-3 text-muted-foreground/50" /></div>
                       <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 border-orange-500 bg-orange-50 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                          <span className="font-black text-orange-600">5</span>
                       </div>
                       <div>
                          <h4 className="font-bold text-foreground">The VIP Matrix</h4>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                             <li>Line skips at partner venues</li>
                             <li>Exclusive e-commerce drops</li>
                             <li>Direct brand sponsorship matching</li>
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
                <span className="text-sm font-bold uppercase tracking-wider text-emerald-600">Referral Hub</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-black text-foreground">12</span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase">Successes</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 font-medium">Earn <span className="text-emerald-600">+100 Pts</span> for every new explorer you bring to the wall.</p>
            <Button variant="outline" size="sm" className="w-full mt-6 text-xs font-bold h-9 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 shadow-sm">
              <Share2 className="w-3.5 h-3.5 mr-2" /> Invite & Grow
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="perks" className="w-full">
        <TabsList className="mb-8 bg-transparent border-b border-border rounded-none h-auto p-0 gap-8 justify-start">
          <TabsTrigger
            value="perks"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base transition-all"
          >
            <Gift className="w-4 h-4 mr-2" />
            My Perks
          </TabsTrigger>
          <TabsTrigger
            value="standing"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base transition-all"
          >
            <Crown className="w-4 h-4 mr-2" />
            Standing
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base transition-all"
          >
            <HistoryIcon className="w-4 h-4 mr-2" />
            Activity Ledger
          </TabsTrigger>
        </TabsList>

        {/* --- PERKS TAB --- */}
        <TabsContent value="perks" className="mt-0">
          <div className="space-y-8">
            {/* Available Perks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Available for Unlock
                </h2>
                {earnedRewards.length > 0 && <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{earnedRewards.length} Keys Required</Badge>}
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
                  <h3 className="text-lg font-semibold text-foreground mb-1">Vault empty</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Attend moments and complete verified actions to earn exclusive brand perks.
                  </p>
                  <Button variant="hero" onClick={() => navigate("/discover")}>
                    Discover Moments
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {earnedRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-card rounded-[1.5rem] p-6 border border-border/60 hover:border-primary/40 hover:shadow-glow transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Key className="w-16 h-16" />
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
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
                             <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">+12 others claimed</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-2">
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
                              Spend 1 Key
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
                                        <p className="text-white/70 text-sm font-medium">Unlocked via Verified Action</p>
                                    </div>
                                    
                                    <div className="p-8 space-y-8">
                                        {reward.redemption_code && (
                                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 text-center relative group">
                                                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 mb-4">Digital Redemption Code</p>
                                                <div className="flex items-center justify-center gap-4">
                                                    <code className="text-4xl font-black text-primary tracking-tighter italic">
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

                                        <div className="grid grid-cols-2 gap-4">
                                            <Button
                                                variant="outline"
                                                className="border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-widest text-[10px] h-12"
                                                onClick={() => handleShareWin(reward.reward_value, reward.moment?.title || "a campaign")}
                                            >
                                                <Share2 className="w-4 h-4 mr-2 text-primary" />
                                                Brag to Wall
                                            </Button>
                                            <Button
                                                variant="hero"
                                                className="h-12 font-black uppercase tracking-widest text-[10px] shadow-glow"
                                                onClick={() => claimReward.mutate(reward.id)}
                                                disabled={claimReward.isPending}
                                            >
                                                {claimReward.isPending ? "Syncing..." : "Mark Used"}
                                            </Button>
                                        </div>
                                        
                                        <p className="text-center text-[9px] text-white/20 font-medium uppercase tracking-widest">
                                            Reward transaction #8829-X Verified by Promorang Node
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
                    <h2 className="font-serif text-xl font-bold text-foreground">Unlocked History</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {claimedRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-card/50 border border-border/40 rounded-2xl p-4 flex items-center justify-between group grayscale hover:grayscale-0 transition-all duration-500"
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
                            Redeemed {format(new Date(reward.claimed_at!), "MMM d, yyyy")}
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
                       <h2 className="font-serif text-4xl font-black italic text-white tracking-tighter">Community Standing</h2>
                       <p className="text-white/50 text-sm mt-2 max-w-lg mx-auto">
                           Access Ranks and social capital are verified in real-time. Consistency is the only path to the top.
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
                Economy Ledger
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your full activity history and point earnings.
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
                <p className="text-muted-foreground font-medium">No activity recorded yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Start participating to build your ledger.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history?.map((entry) => (
                  <div key={entry.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4">
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
              The Ledger records every interaction that impacts your platform standing. Consistency is the primary driver of your **Access Rank**, while Points grant you the **Keys** needed to unlock funded opportunities.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rewards;
