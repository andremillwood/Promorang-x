import { Link } from "react-router-dom";
import { ArrowRight, FileText, RadioTower, WandSparkles } from "lucide-react";
import { useContentDrops, useMyContentDrops } from "@/hooks/useContentDistribution";
import { Button } from "@/components/ui/button";

type CreatorReleaseWorkspaceBridgeProps = {
  mode: "work" | "create";
};

export default function CreatorReleaseWorkspaceBridge({ mode }: CreatorReleaseWorkspaceBridgeProps) {
  const opportunitiesQuery = useContentDrops("active");
  const mineQuery = useMyContentDrops("all");
  const opportunities = opportunitiesQuery.data || [];
  const mine = mineQuery.data || [];

  const loading = opportunitiesQuery.isLoading || mineQuery.isLoading;
  const error = opportunitiesQuery.error || mineQuery.error;

  if (loading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Creator Next</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[0, 1].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />)}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-300">Release workspace unavailable</p>
        <h3 className="mt-2 text-xl font-black">PROMORANG could not load the real creator release state.</h3>
        <p className="mt-2 text-sm text-white/55">The dashboard will not substitute demo opportunities while the live source is unavailable.</p>
      </section>
    );
  }

  if (mode === "work") {
    return (
      <section className="space-y-5 rounded-3xl border border-purple-500/20 bg-purple-950/10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Creator Next · Opportunity Desk</p>
            <h2 className="mt-2 text-2xl font-black text-white">Take work that actually exists.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Live release opportunities come from the real content-distribution workspace. If nothing is published, PROMORANG stays honestly empty instead of showing sample bounties.</p>
          </div>
          <Button asChild className="rounded-xl bg-purple-500 font-black text-white hover:bg-purple-400"><Link to="/content-drops?role=creator">Open full opportunity desk <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
        </div>

        {opportunities.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {opportunities.slice(0, 4).map((drop) => {
              const reward = Number(drop.reward_config?.base_points || 0);
              const assets = drop.content_distribution_assets?.length || 0;
              return (
                <article key={drop.id} className="rounded-[1.35rem] border border-white/10 bg-[#101010] p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-purple-300">{drop.objective_type.replace("_", " ")}</span>
                      <h3 className="mt-2 text-lg font-black tracking-[-0.02em]">{drop.title}</h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">{drop.description || "Open the release to see what action is expected and what counts as proof."}</p>
                    </div>
                    <RadioTower className="h-5 w-5 shrink-0 text-purple-300" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-white/45">
                    <span className="rounded-full border border-white/10 px-2 py-1">{reward} Points base</span>
                    <span className="rounded-full border border-white/10 px-2 py-1">{assets} {assets === 1 ? "asset" : "assets"}</span>
                    {drop.linked_moment_id ? <span className="rounded-full border border-purple-400/20 bg-purple-400/10 px-2 py-1 text-purple-200">Moment linked</span> : null}
                  </div>
                  <Button asChild variant="outline" className="mt-4 w-full border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]"><Link to={`/content-drops/${drop.id}`}>Open opportunity <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.35rem] border border-dashed border-white/15 p-7 text-center text-white">
            <FileText className="mx-auto h-6 w-6 text-purple-300" />
            <h3 className="mt-3 text-xl font-black">No live creator opportunities right now.</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/50">That is a valid product state. No demo bounty is substituted into the live workspace.</p>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-3xl border border-purple-500/20 bg-purple-950/10 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">Creator Next · Production Room</p>
          <h2 className="mt-2 text-2xl font-black text-white">Publish through the real release workspace.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">The current live path already creates distribution campaigns and release assets, links Moments/offers, and keeps your releases together. The mock portfolio grid is no longer the primary Create experience.</p>
        </div>
        <Button asChild className="rounded-xl bg-purple-500 font-black text-white hover:bg-purple-400"><Link to="/content-drops?role=creator"><WandSparkles className="mr-2 h-4 w-4" />Open Production Room</Link></Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[1.25rem] border border-white/10 bg-[#101010] p-5 text-white"><span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">Your releases</span><strong className="mt-3 block text-3xl font-black">{mine.length}</strong><p className="mt-1 text-xs text-white/45">Real release records in your workspace</p></div>
        <div className="rounded-[1.25rem] border border-white/10 bg-[#101010] p-5 text-white"><span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">Active</span><strong className="mt-3 block text-3xl font-black">{mine.filter((drop) => drop.status === "active").length}</strong><p className="mt-1 text-xs text-white/45">Currently published</p></div>
        <div className="rounded-[1.25rem] border border-white/10 bg-[#101010] p-5 text-white"><span className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">Linked work</span><strong className="mt-3 block text-3xl font-black">{mine.filter((drop) => Boolean(drop.linked_moment_id)).length}</strong><p className="mt-1 text-xs text-white/45">Connected to a Moment</p></div>
      </div>

      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.025] p-5 text-sm leading-6 text-white/50">
        <strong className="text-white">Current production boundary:</strong> publishing a release is not the same as submitting proof, approval, or settlement. Those states remain separate and will be recomposed in the Creator Proof/Value pass.
      </div>
    </section>
  );
}
