import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, MapPin, Sparkles, TrendingUp, Coins, Flame, Trophy } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function CreatorO2OSummaryPanel() {
  const { session } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ["creator-o2o-summary"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/o2o/creator-summary`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load O2O summary");
      }

      return payload?.summary || null;
    },
  });

  const economicsQuery = useQuery({
    queryKey: ["creator-economics"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/creator-economics/me`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load creator economics");
      }

      return payload?.economics || null;
    },
  });

  if (summaryQuery.isLoading || economicsQuery.isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (summaryQuery.error || economicsQuery.error || !summaryQuery.data || !economicsQuery.data) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {(summaryQuery.error as Error)?.message || (economicsQuery.error as Error)?.message || "Failed to load creator economics"}
      </div>
    );
  }

  const summary = summaryQuery.data;
  const economics = economicsQuery.data;
  const ledgerSummary = economics.summary || {};
  const profile = economics.profile || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Creator Studio</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">O2O Conversion</h3>
        </div>
        <Badge className="bg-primary/10 text-primary border border-primary/20">
          Content to Foot Traffic
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Linked Content", value: summary.linked_content_count || 0, icon: PlayCircle, tone: "text-primary" },
          { label: "Linked Moments", value: summary.linked_moment_count || 0, icon: MapPin, tone: "text-emerald-500" },
          { label: "Avg O2O Rate", value: `${summary.avg_o2o_conversion_rate || 0}%`, icon: TrendingUp, tone: "text-blue-500" },
          { label: "Sponsored Drops", value: summary.sponsored_links || 0, icon: Sparkles, tone: "text-accent-foreground" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border/60 bg-card p-5">
            <item.icon className={`h-5 w-5 ${item.tone}`} />
            <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Creator Economics</p>
              <h4 className="mt-2 font-serif text-xl font-bold text-foreground">Momentum Yield</h4>
            </div>
            <Badge className="border border-primary/20 bg-primary/10 text-primary">
              {(summary.catalyst_rank || "new_signal").replaceAll("_", " ")}
            </Badge>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Attributed Joins", value: summary.attributed_joins || 0, icon: MapPin, tone: "text-emerald-500" },
              { label: "Verified Unlocks", value: summary.verified_unlocks || 0, icon: Trophy, tone: "text-primary" },
              { label: "Memories Issued", value: summary.memories_issued || 0, icon: Sparkles, tone: "text-accent-foreground" },
              { label: "Momentum Value", value: `${summary.creator_momentum_value || 0}`, icon: Coins, tone: "text-amber-500" },
              { label: "Impact Score", value: summary.creator_impact_score || 0, icon: Flame, tone: "text-orange-500" },
              { label: "Catalyst Conversions", value: summary.catalyst_conversions || 0, icon: TrendingUp, tone: "text-blue-500" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                <item.icon className={`h-4 w-4 ${item.tone}`} />
                <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                <p className="mt-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Ledger Snapshot</p>
                <h4 className="mt-2 font-serif text-xl font-bold text-foreground">Creator Earnings</h4>
              </div>
              <Badge className="border border-primary/20 bg-primary/10 text-primary">
                {profile.tier || "starter"}
              </Badge>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Pending Value", value: `$${Number(ledgerSummary.pending_value || 0).toFixed(2)}` },
                { label: "Settled Value", value: `$${Number(ledgerSummary.settled_value || 0).toFixed(2)}` },
                { label: "Join Yield", value: `$${Number(ledgerSummary.mission_join_value || 0).toFixed(2)}` },
                { label: "Verification Yield", value: `$${Number(ledgerSummary.verification_value || 0).toFixed(2)}` },
                { label: "Memory Yield", value: `$${Number(ledgerSummary.memory_value || 0).toFixed(2)}` },
                { label: "Catalyst Yield", value: `$${Number(ledgerSummary.catalyst_value || 0).toFixed(2)}` },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                  <p className="text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Top Missions</p>
            <h4 className="mt-2 font-serif text-xl font-bold text-foreground">Highest Yield Stories</h4>
            <div className="mt-5 space-y-3">
              {(summary.top_missions || []).length ? (
                summary.top_missions.map((mission: any) => (
                  <div key={mission.id} className="rounded-2xl border border-border/50 bg-background/40 p-4">
                    <p className="text-sm font-semibold text-foreground">{mission.content_title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Unlocks {mission.moment_title}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{mission.o2o_conversion_rate || 0}% O2O</span>
                      <span>{mission.attributed_joins || 0} joins</span>
                      <span>{mission.verified_unlocks || 0} unlocks</span>
                      <span>{mission.memories_issued || 0} memories</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
                  Link creator content to moments to start building a measurable momentum portfolio.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
