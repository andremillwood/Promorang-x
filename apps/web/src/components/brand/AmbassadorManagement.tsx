import { Users, Star, DollarSign, TrendingUp, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBrandAmbassadors, useUpdateAmbassadorStatus } from "@/hooks/useAmbassadors";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const statusColors = {
  applied: "bg-blue-500/20 text-blue-500",
  pending: "bg-yellow-500/20 text-yellow-500",
  active: "bg-emerald-500/20 text-emerald-500",
  suspended: "bg-red-500/20 text-red-500",
  inactive: "bg-muted text-muted-foreground",
};

export function AmbassadorManagement() {
  const { user } = useAuth();
  const { data: ambassadors, isLoading } = useBrandAmbassadors(user?.id || "");
  const updateStatus = useUpdateAmbassadorStatus();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const pendingApplications = ambassadors?.filter(a => a.status === "applied") || [];
  const activeAmbassadors = ambassadors?.filter(a => a.status === "active") || [];
  const totalEarnings = ambassadors?.reduce((sum, a) => sum + (a.total_earnings || 0), 0) || 0;
  const totalReferrals = ambassadors?.reduce((sum, a) => sum + (a.total_referrals || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{activeAmbassadors.length}</p>
          <p className="text-sm text-muted-foreground font-serif">Active Advocates</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <Clock className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{pendingApplications.length}</p>
          <p className="text-sm text-muted-foreground font-serif">Pending Requests</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalReferrals}</p>
          <p className="text-sm text-muted-foreground">Total Referrals</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <DollarSign className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">${totalEarnings.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Paid Out</p>
        </div>
      </div>

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div>
          <h3 className="font-serif text-xl font-semibold text-foreground mb-4">Pending Requests</h3>
          <div className="space-y-3">
            {pendingApplications.map((ambassador) => (
              <div
                key={ambassador.id}
                className="bg-card rounded-xl p-4 border border-yellow-500/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">
                      New Application
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Applied {format(new Date(ambassador.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge className={statusColors[ambassador.status]}>
                    {ambassador.status}
                  </Badge>
                </div>
                {ambassador.bio && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {ambassador.bio}
                  </p>
                )}
                {ambassador.social_links && Object.keys(ambassador.social_links).length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {Object.entries(ambassador.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {platform}
                      </a>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateStatus.mutate({
                      ambassadorId: ambassador.id,
                      status: "active",
                    })}
                    disabled={updateStatus.isPending}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus.mutate({
                      ambassadorId: ambassador.id,
                      status: "inactive",
                    })}
                    disabled={updateStatus.isPending}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Ambassadors */}
      <div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-4">Active Advocates</h3>
        {activeAmbassadors.length > 0 ? (
          <div className="space-y-3">
            {activeAmbassadors.map((ambassador) => (
              <div
                key={ambassador.id}
                className="bg-card rounded-xl p-4 border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {ambassador.ambassador_code?.slice(-2) || "AM"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {ambassador.ambassador_code || "Ambassador"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Since {format(new Date(ambassador.approved_at || ambassador.created_at), "MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColors.active}>Active</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{ambassador.total_referrals || 0}</p>
                    <p className="text-xs text-muted-foreground">Referrals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{ambassador.commission_rate}%</p>
                    <p className="text-xs text-muted-foreground">Commission</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">${(ambassador.total_earnings || 0).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">Earned</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No active ambassadors yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Approve applications to grow your ambassador network
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
