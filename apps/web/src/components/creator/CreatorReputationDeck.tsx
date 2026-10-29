import { currentUiLocale } from "@/i18n/geo-locale";
import { BadgeCheck, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRoleSuccessProgress } from "@/hooks/useRoleSuccessProgress";
import { useCreatorEconomicProfile } from "@/hooks/useCreatorEconomics";

const tierLabels: Record<string, string> = { starter: "Starter", rising: "Rising", signature: "Signature", icon: "Icon" };

export function CreatorReputationDeck() {
  const progressQuery = useRoleSuccessProgress("creator");
  const profileQuery = useCreatorEconomicProfile();
  const progress = progressQuery.data;
  const profile = profileQuery.data;
  const loading = progressQuery.isLoading || profileQuery.isLoading;
  const current = Number(progress?.current || 0);
  const target = Number(progress?.target || 25);
  const completion = target > 0 ? Math.max(0, Math.min(100, Math.round(current / target * 100))) : 0;

  if (progressQuery.isError || profileQuery.isError) return <section role="alert" className="rounded-sm border border-destructive/30 p-5"><h2 className="text-xl font-semibold">Creator standing could not be loaded.</h2><Button variant="outline" className="mt-3" disabled={progressQuery.isFetching || profileQuery.isFetching} onClick={() => void Promise.allSettled([progressQuery.refetch(), profileQuery.refetch()])}>Try again</Button></section>;

  return (
    <section className="min-w-0 space-y-5" aria-busy={loading}>
      <header><h2 className="font-sans text-2xl font-semibold tracking-tight">Creator standing</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Track milestones from your published work and verified supporter activity.</p></header>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-sm  bg-card p-5">
          <p className="text-sm text-muted-foreground">Recorded tier</p>
          <p className="mt-2 text-lg font-semibold">{loading ? "Loading…" : profile?.tier ? tierLabels[profile.tier] || profile.tier : "No tier recorded"}</p>
          <p className="mt-6 text-sm text-muted-foreground">{progress?.unit || "Verified supporter actions"}</p>
          <p className="mt-2 break-words text-3xl font-semibold tabular-nums">{loading ? "—" : `${current.toLocaleString(currentUiLocale())} / ${target.toLocaleString(currentUiLocale())}`}</p>
          <div role="progressbar" aria-label="Creator milestone progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={loading ? undefined : completion} className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${loading ? 0 : completion}%` }} /></div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{progress?.sourceLabel || "Attributed joins and verified unlocks linked to your work."}</p>
          {progress?.nextAction ? <Button asChild className="mt-4 h-auto min-h-11 whitespace-normal"><Link to={progress.nextAction.href}>{progress.nextAction.label}</Link></Button> : null}
        </div>
        <div className="min-w-0 rounded-sm  bg-card p-5">
          <h3 className="font-semibold">Milestones</h3>
          <div className="mt-4 space-y-4">{loading ? <p role="status" className="text-sm text-muted-foreground">Loading milestones…</p> : progress?.milestones?.length ? progress.milestones.map((milestone) => <div key={milestone.label} className="flex items-start gap-3">{milestone.complete ? <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />}<div className="min-w-0"><p className="break-words text-sm font-medium">{milestone.label}</p><p className="mt-1 text-xs text-muted-foreground">{milestone.complete ? "Completed" : "In progress"}</p></div></div>) : <p className="text-sm leading-6 text-muted-foreground">No milestones recorded yet. Publish work and link it to an event to start tracking progress.</p>}</div>
        </div>
      </div>
    </section>
  );
}

export default CreatorReputationDeck;
