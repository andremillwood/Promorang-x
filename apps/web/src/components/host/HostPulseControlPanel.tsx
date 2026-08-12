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
      <div className="flex flex-col gap-5 border-b border-border/60 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Read the room</p>
          <h3 className="mt-3 font-serif text-4xl font-semibold leading-none tracking-[-0.04em] text-foreground">Where is energy forming?</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            See which Moments need a stronger invitation, which rooms are alive, and where the experience needs care.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/pulse">Open Global Pulse</Link>
        </Button>
      </div>

      <div className="grid border-y border-border/60 sm:grid-cols-4">
        {[
          { label: "Live", value: momentumQuery.data?.live_count, tone: "border-emerald-500/15 bg-emerald-500/5" },
          { label: "Forming", value: momentumQuery.data?.forming_count, tone: "border-primary/15 bg-primary/5" },
          { label: "Waiting for review", value: momentumQuery.data?.pending_proofs, tone: "" },
          { label: "Arrivals verified", value: momentumQuery.data ? `${momentumQuery.data.proof_conversion_rate}%` : undefined, tone: "" },
        ].map((item) => (
          <div key={item.label} className={`border-b border-border/60 px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${item.tone}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-foreground">
              {momentumQuery.isLoading ? "..." : item.value ?? 0}
            </p>
          </div>
        ))}
      </div>

      {pulseQuery.isLoading ? (
        <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/55">
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
            const pulseClass = pulseTone[(pulse.pulse_state as keyof typeof pulseTone) || "dormant"];
            return (
              <article key={pulse.moment_id} className="border-b border-border/60 p-6 last:border-b-0 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="font-serif text-2xl font-semibold leading-tight text-foreground">{pulse.title}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {pulse.crowd_level || 0} people in the room · {Math.max((pulse.gathering_threshold || 0) - (pulse.threshold_progress || 0), 0)} more until it gathers
                    </p>
                  </div>
                  <Badge className={pulseClass}>{pulse.pulse_state || "dormant"}</Badge>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border/50 pt-5 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Users className="h-3.5 w-3.5" />
                    {pulse.threshold_progress || 0} showing intent
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Radio className="h-3.5 w-3.5" />
                    {pulse.pulse_state === "live" ? "Gathering active" : "Building"}
                  </span>
                  <span className={`inline-flex items-center gap-1 ${pulse.saturation_risk === "high" || pulse.saturation_risk === "full" ? "text-amber-600" : "text-muted-foreground"}`}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {pulse.saturation_risk || "low"} crowd pressure
                  </span>
                  <span className="text-muted-foreground">Room feeling: <strong className="capitalize text-foreground">{pulse.sentiment_band || "quiet"}</strong></span>
                  <span className="text-muted-foreground">Value lift: <strong className="text-foreground">{pulse.current_bonus_multiplier || 1}x</strong></span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-sm text-orange-500">
                    <Flame className="h-4 w-4" />
                    {pulse.pulse_state === "live" ? "Momentum is active" : "More people needed"}
                  </span>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link to={`/moments/${pulse.moment_id}`}>Open Moment</Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
