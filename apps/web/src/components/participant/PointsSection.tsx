import { Gift, Star, TrendingUp, Award } from "lucide-react";
import { usePointsStats, useUserPoints, usePointTransactions } from "@/hooks/usePoints";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const tierColors = {
  bronze: "bg-amber-700 text-amber-100",
  silver: "bg-slate-400 text-slate-900",
  gold: "bg-yellow-400 text-yellow-900",
  platinum: "bg-gradient-to-r from-slate-300 to-slate-500 text-white",
  ambassador: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
};

const actionLabels: Record<string, string> = {
  checkin: "Check-in",
  referral: "Referral Bonus",
  review: "Review",
  media_upload: "Media Upload",
  redemption: "Redemption",
  bonus: "Bonus",
  expiry: "Points Expired",
  adjustment: "Adjustment",
  affiliate_commission: "Affiliate Commission",
};

export function PointsOverview() {
  const { data: stats, isLoading: statsLoading } = usePointsStats();
  const { data: brandPoints, isLoading: pointsLoading } = useUserPoints();

  if (statsLoading || pointsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Points Card */}
      <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/70 text-sm">Total Gratitude Earned</p>
            <p className="text-4xl font-bold">{stats?.totalCurrent.toLocaleString() || 0}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Gift className="w-8 h-8" />
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-primary-foreground/70">Lifetime: </span>
            <span className="font-semibold">{stats?.totalLifetime.toLocaleString() || 0}</span>
          </div>
          <div>
            <span className="text-primary-foreground/70">Brands: </span>
            <span className="font-semibold">{stats?.brandCount || 0}</span>
          </div>
          {stats?.highestTier && (
            <Badge className={tierColors[stats.highestTier as keyof typeof tierColors] || tierColors.bronze}>
              {(stats.highestTier || "bronze").charAt(0).toUpperCase() + (stats.highestTier || "bronze").slice(1)}
            </Badge>
          )}
        </div>
      </div>

      {/* Brand Wallets */}
      {brandPoints && brandPoints.length > 0 ? (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Your Brand Legacies</h3>
          <div className="grid gap-3">
            {brandPoints.map((bp) => (
              <div
                key={bp.id}
                className="bg-card rounded-xl p-4 border border-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Brand ID: {bp.brand_id.slice(0, 8)}...</p>
                    <Badge className={tierColors[bp.current_tier || "bronze"]} variant="secondary">
                      {(bp.current_tier || "bronze").charAt(0).toUpperCase() + (bp.current_tier || "bronze").slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{bp.current_points?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border p-8 text-center">
          <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">No points earned yet</p>
          <p className="text-sm text-muted-foreground">Join and attend moments to start earning PromoPoints</p>
        </div>
      )}

      {/* Resonance Boost / Echo Potential CTA */}
      <div className="bg-charcoal rounded-2xl p-6 border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-all cursor-pointer">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white italic">Reveal Your Echo Potential</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Resonance Standing</p>
            </div>
          </div>
          <p className="text-sm text-white/60 mb-4 leading-relaxed">
            Link your Instagram to calculate your **Echo Potential**. Verified reach 
            grants a standing multiplier and unlocks exclusive Vault rewards.
          </p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-primary/20 text-primary text-[9px] uppercase font-black tracking-widest bg-primary/5">
              +500 Gratitude Discovery Bonus
            </Badge>
            <div className="flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-tighter">
              Verify Reach
              <Star className="w-3 h-3 text-primary" />
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: "Whisper", reach: "500+", boost: "1.1x" },
              { name: "Echo", reach: "2k+", boost: "1.25x" },
              { name: "Thunder", reach: "10k+", boost: "1.5x" },
              { name: "Tempest", reach: "50k+", boost: "2.0x" },
            ].map(tier => (
              <div key={tier.name} className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-tighter text-primary/60 mb-0.5">{tier.name}</p>
                <p className="text-sm font-bold text-white">{tier.boost}</p>
                <p className="text-[8px] text-white/30 uppercase tracking-widest">{tier.reach} Reach</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PointsTransactionHistory() {
  const { data: transactions, isLoading } = usePointTransactions();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-muted/30 rounded-xl p-6 text-center">
        <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
      {transactions.slice(0, 10).map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between bg-card rounded-lg p-3 border border-border"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              tx.points > 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
            }`}>
              {tx.points > 0 ? "+" : "-"}
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {actionLabels[tx.action] || tx.action}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(tx.created_at), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <p className={`font-bold ${tx.points > 0 ? "text-emerald-500" : "text-red-500"}`}>
            {tx.points > 0 ? "+" : ""}{tx.points}
          </p>
        </div>
      ))}
    </div>
  );
}
