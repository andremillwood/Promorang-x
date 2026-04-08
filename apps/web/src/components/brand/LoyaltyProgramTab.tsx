import { Award, Gift, TrendingUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBrandPointProgram, useBrandLoyaltyTiers } from "@/hooks/usePoints";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const tierColors = {
  bronze: "bg-amber-700 text-amber-100",
  silver: "bg-slate-400 text-slate-900",
  gold: "bg-yellow-400 text-yellow-900",
  platinum: "bg-gradient-to-r from-slate-300 to-slate-500 text-white",
  ambassador: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
};

export function LoyaltyProgramTab() {
  const { user } = useAuth();
  const { data: program, isLoading: programLoading } = useBrandPointProgram(user?.id || "");
  const { data: tiers, isLoading: tiersLoading } = useBrandLoyaltyTiers(user?.id || "");

  if (programLoading || tiersLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      {program ? (
        <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-primary-foreground/70 text-sm">Loyalty Program</p>
              <h2 className="text-2xl font-bold">{program.program_name}</h2>
            </div>
            <Badge className={program.is_active ? "bg-emerald-500" : "bg-muted"}>
              {program.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary-foreground/10 rounded-lg p-3">
              <p className="text-lg font-bold">{program.points_per_checkin}</p>
              <p className="text-xs text-primary-foreground/70">Per Check-in</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-3">
              <p className="text-lg font-bold">{program.points_per_review}</p>
              <p className="text-xs text-primary-foreground/70">Per Review</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-3">
              <p className="text-lg font-bold">{program.points_per_media}</p>
              <p className="text-xs text-primary-foreground/70">Per Media</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-3">
              <p className="text-lg font-bold">{program.points_per_referral}</p>
              <p className="text-xs text-primary-foreground/70">Per Referral</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="mt-4">
            <Settings className="w-4 h-4 mr-2" />
            Edit Program
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No Loyalty Program</h3>
          <p className="text-muted-foreground mb-4">
            Create a loyalty program to reward your most engaged participants
          </p>
          <Button>Create Program</Button>
        </div>
      )}

      {/* Tiers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Loyalty Tiers</h3>
          <Button variant="outline" size="sm">
            Manage Tiers
          </Button>
        </div>

        {tiers && tiers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-card rounded-xl p-5 border border-border"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge className={tierColors[tier.tier]}>
                    {tier.tier_name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {tier.min_points.toLocaleString()}+ pts
                  </span>
                </div>
                <div className="space-y-2">
                  {tier.discount_percent && tier.discount_percent > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-foreground">{tier.discount_percent}% discount</span>
                    </div>
                  )}
                  {tier.priority_access && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-accent" />
                      <span className="text-foreground">Priority access</span>
                    </div>
                  )}
                  {tier.tier_benefits && Array.isArray(tier.tier_benefits) && tier.tier_benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Gift className="w-4 h-4 text-primary" />
                      <span className="text-foreground">{String(benefit)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No tiers configured</p>
            <p className="text-sm text-muted-foreground mt-1">
              Set up tiers to reward loyal participants
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
