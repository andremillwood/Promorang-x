import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface O2OAnalyticsPanelProps {
  audience: "host" | "brand";
}

export function O2OAnalyticsPanel({ audience }: O2OAnalyticsPanelProps) {
  const { session } = useAuth();

  const query = useQuery({
    queryKey: ["o2o-analytics", audience],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/analytics/${audience}/o2o`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load O2O analytics");
      }
      return payload;
    },
  });

  if (query.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {(query.error as Error).message}
      </div>
    );
  }

  const summary = query.data?.summary || {};
  const breakdown = query.data?.mission_breakdown || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">O2O Attribution</p>
        <h3 className="mt-2 font-serif text-2xl font-bold text-foreground">Digital to Physical Performance</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Mission Links", value: summary.linked_missions || 0 },
          { label: "Digital Engagements", value: summary.digital_engagements || 0 },
          { label: "Attributed Joins", value: summary.attributed_joins || 0 },
          { label: "Memories Issued", value: summary.memories_issued || 0 },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{item.label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{Number(item.value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/80">Conversion Rates</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Join conversion</p>
              <p className="text-2xl font-bold text-foreground">{Number(summary.join_conversion_rate || 0).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verification rate</p>
              <p className="text-2xl font-bold text-foreground">{Number(summary.verification_rate || 0).toFixed(2)}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Mission Breakdown</p>
            <Badge className="bg-primary/10 text-primary border border-primary/20">
              {audience === "host" ? "Creator / Host View" : "Brand View"}
            </Badge>
          </div>
          <div className="mt-4 space-y-3">
            {breakdown.length ? breakdown.slice(0, 5).map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.content_title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Linked to {item.moment_title}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{item.o2o_conversion_rate}%</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4 text-sm">
                  <p className="text-muted-foreground">Engagements: <span className="font-medium text-foreground">{item.digital_engagements}</span></p>
                  <p className="text-muted-foreground">Joins: <span className="font-medium text-foreground">{item.attributed_joins}</span></p>
                  <p className="text-muted-foreground">Check-ins: <span className="font-medium text-foreground">{item.attributed_checkins}</span></p>
                  <p className="text-muted-foreground">Memories: <span className="font-medium text-foreground">{item.memories_issued}</span></p>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                No O2O attribution data yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
