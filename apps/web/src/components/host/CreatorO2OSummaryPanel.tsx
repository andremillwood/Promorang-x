import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (summaryQuery.isLoading) return <Skeleton className="h-40 rounded-sm" />;
  if (summaryQuery.isError || !summaryQuery.data) return <div role="alert" className="rounded-sm border border-destructive/30 p-4 text-sm"><p>Linked activity could not be loaded.</p><Button variant="outline" className="mt-3" disabled={summaryQuery.isFetching} onClick={() => void summaryQuery.refetch()}>Try again</Button></div>;
  const summary = summaryQuery.data;
  return (
    <section className="min-w-0 space-y-5">
      <header><h3 className="font-sans text-xl font-semibold tracking-tight">Linked activity</h3><p className="mt-2 text-sm text-muted-foreground">Activity attributed to your stories. Joins and verified unlocks are counted separately.</p></header>
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Linked stories", summary.linked_content_count], ["Linked events", summary.linked_moment_count],
          ["Sponsored links", summary.sponsored_links], ["Attributed joins", summary.attributed_joins],
          ["Verified unlocks", summary.verified_unlocks], ["Memories issued", summary.memories_issued],
        ].map(([label, value]) => <div key={label} className="min-w-0 rounded-sm  bg-card p-4"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-2 break-words text-2xl font-semibold tabular-nums">{Number(value || 0).toLocaleString()}</dd></div>)}
      </dl>
      <div className="rounded-sm  bg-card p-5">
        <h4 className="font-sans font-semibold">Activity by story</h4>
        <div className="mt-4 space-y-3">{summary.top_missions?.length ? summary.top_missions.map((mission: any) => <article key={mission.id} className="min-w-0 border-t border-border pt-3"><p className="break-words text-sm font-medium">{mission.content_title}</p><p className="mt-1 break-words text-xs text-muted-foreground">Linked to {mission.moment_title}</p><p className="mt-2 text-xs tabular-nums text-muted-foreground">{mission.attributed_joins || 0} joins · {mission.verified_unlocks || 0} verified unlocks · {mission.memories_issued || 0} memories</p></article>) : <p className="text-sm text-muted-foreground">Link a story to an event to start tracking activity here.</p>}</div>
      </div>
    </section>
  );
}
