import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, Flame, Radio, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const pulseTone = {
  dormant: "bg-muted text-muted-foreground",
  forming: "bg-primary/10 text-primary border border-primary/20",
  live: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  cooling: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
} as const;

export const HostPulseControlPanel = ({ moments }: { moments: any[] }) => {
  const { session } = useAuth();
  const trackedMoments = (moments || []).slice(0, 6);

  const pulseQuery = useQuery({
    queryKey: ["host-pulse-overview", trackedMoments.map((moment) => moment.id).join(",")],
    enabled: !!session && trackedMoments.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        trackedMoments.map(async (moment) => {
          const response = await fetch(`${API_URL}/api/pulse/moments/${moment.id}`, {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload?.error || "Failed to load pulse state");
          return payload?.pulse;
        }),
      );
      return results;
    },
  });

  const momentumQuery = useQuery({
    queryKey: ["host-momentum-metrics"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/analytics/host/momentum`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load momentum metrics");
      return payload;
    },
  });

  const pulseMoments = pulseQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">Live Coordination</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">Pulse Control</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Track which hosted moments are building, which ones have crossed threshold, and where crowd conditions need intervention.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/pulse">Open Global Pulse</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Live", value: momentumQuery.data?.live_count, tone: "border-emerald-500/15 bg-emerald-500/5" },
          { label: "Forming", value: momentumQuery.data?.forming_count, tone: "border-primary/15 bg-primary/5" },
          { label: "Pending Proofs", value: momentumQuery.data?.pending_proofs, tone: "border-border bg-card" },
          { label: "Proof Conversion", value: momentumQuery.data ? `${momentumQuery.data.proof_conversion_rate}%` : undefined, tone: "border-border bg-card" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl border p-4 ${item.tone}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-black text-foreground">
              {momentumQuery.isLoading ? "..." : item.value ?? 0}
            </p>
          </div>
        ))}
      </div>

      {pulseQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : trackedMoments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
          <Activity className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Create a moment to start tracking live pulse states.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {pulseMoments.map((pulse: any) => {
            const progress = Math.min(((pulse.threshold_progress || 0) / Math.max(pulse.gathering_threshold || 1, 1)) * 100, 100);
            const pulseClass = pulseTone[(pulse.pulse_state as keyof typeof pulseTone) || "dormant"];
            return (
              <div key={pulse.moment_id} className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{pulse.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pulse.crowd_level || 0} participants • threshold {pulse.gathering_threshold || 0}
                    </p>
                  </div>
                  <Badge className={pulseClass}>{pulse.pulse_state || "dormant"}</Badge>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${progress}%` }} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Multiplier</p>
                    <p className="mt-2 font-semibold text-foreground">{pulse.current_bonus_multiplier || 1}x</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sentiment</p>
                    <p className="mt-2 font-semibold capitalize text-foreground">{pulse.sentiment_band || "low"}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Users className="h-3.5 w-3.5" />
                    {pulse.threshold_progress || 0} / {pulse.gathering_threshold || 0}
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Radio className="h-3.5 w-3.5" />
                    {pulse.pulse_state === "live" ? "Gathering active" : "Building"}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${pulse.saturation_risk === "high" || pulse.saturation_risk === "full" ? "text-amber-600" : "text-muted-foreground"}`}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {pulse.saturation_risk || "low"} saturation
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm text-orange-500">
                    <Flame className="h-4 w-4" />
                    {pulse.pulse_state === "live" ? "Momentum is active" : "More people needed"}
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/moments/${pulse.moment_id}`}>Open</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
