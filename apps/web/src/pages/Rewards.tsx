import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRewards, useClaimReward, useRewardStats } from "@/hooks/useRewards";
import { useUserBalance, useEconomyHistory } from "@/hooks/useEconomy";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  Check,
  Clock,
  X,
  Copy,
  Sparkles,
  Key,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

  const primaryRole = roles[0] || "participant";

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Redemption code copied to clipboard.",
    });
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
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Rewards Hub 🎁
          </h1>
          <p className="text-muted-foreground">
            Manage your points, keys, and earned perks.
          </p>
        </div>
      </div>

      {/* Economy Wallet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Access Rank (Consistency) Placeholder - Bridging the gap */}
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium uppercase tracking-wider">Access Power</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">Rank 1</span>
              <Badge variant="outline" className="text-[10px] uppercase">Newbie</Badge>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: '25%' }}></div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-right">Progress to Rank 2: 25%</p>
            </div>
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
            value="history"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 font-semibold text-base transition-all"
          >
            <History className="w-4 h-4 mr-2" />
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
                  Pending Perks
                </h2>
                {earnedRewards.length > 0 && <Badge variant="secondary">{earnedRewards.length} Items</Badge>}
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
                    <Gift className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">No Perks Found</h3>
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
                      className="bg-card rounded-2xl p-5 border border-border hover:shadow-glow transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                          <Gift className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground mb-1">{reward.reward_value}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            Found at: <span className="text-foreground">{reward.moment?.title || "Unknown moment"}</span>
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Authentic Proof
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(reward.earned_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="hero"
                              className="flex-1 shadow-card"
                              onClick={() => setSelectedReward(reward.id)}
                            >
                              Claim Perk
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-serif text-center">Your Exclusive Reward</DialogTitle>
                            </DialogHeader>
                            <div className="py-6 text-center">
                              <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-xl">
                                <Gift className="w-10 h-10 text-primary-foreground" />
                              </div>
                              <h3 className="font-bold text-2xl mb-1">{reward.reward_value}</h3>
                              <p className="text-muted-foreground mb-8">
                                From "{reward.moment?.title}"
                              </p>

                              {reward.redemption_code && (
                                <div className="mb-8 p-4 bg-secondary/50 rounded-2xl border border-border">
                                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-bold">Redemption Code</p>
                                  <div className="flex items-center justify-center gap-2">
                                    <code className="text-3xl font-mono font-bold text-primary tracking-tighter">
                                      {reward.redemption_code}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:bg-primary/10"
                                      onClick={() => handleCopyCode(reward.redemption_code!)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-3">
                                <Button
                                  variant="hero"
                                  className="w-full py-6 text-lg"
                                  onClick={() => {
                                    claimReward.mutate(reward.id);
                                  }}
                                  disabled={claimReward.isPending}
                                >
                                  {claimReward.isPending ? "Updating..." : "Mark as Redeemed"}
                                </Button>
                                <p className="text-[10px] text-muted-foreground">
                                  Only mark as redeemed once you have physically received the item or used the service.
                                </p>
                              </div>
                            </div>
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
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  History
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claimedRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="bg-card border border-border rounded-xl p-4 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {reward.reward_value}
                          </h4>
                          <p className="text-[10px] text-muted-foreground">
                            Redeemed {format(new Date(reward.claimed_at!), "MMM d")}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold">Claimed</Badge>
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
                <History className="w-5 h-5 text-primary" />
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
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
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
