import { useSearchParams } from "react-router-dom";
import { useOpportunities, useExperienceActions } from "@/hooks/usePeopleExperience";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { useToast } from "@/hooks/use-toast";

export default function EarnOpportunities() {
  const [params] = useSearchParams();
  const sceneId = params.get("hub") || undefined;
  const opportunities = useOpportunities(sceneId);
  const { takeOpportunity } = useExperienceActions();
  const { toast } = useToast();

  const take = async (id: string) => {
    try {
      const result = await takeOpportunity.mutateAsync({ id, sceneId });
      const url = `${window.location.origin}/drop/${result.drop.slug}`;
      await navigator.clipboard.writeText(url).catch(() => undefined);
      toast({ title: "You took it", description: "A drop is ready for your people." });
    } catch (error) {
      toast({ title: "Could not take this yet", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <ExperienceShell
      eyebrow="Earn"
      title="Opportunities"
      description="Get people to try, visit, buy or show up. You earn when the action is verified."
      backTo="/dashboard"
    >
      {opportunities.isLoading ? (
        <div className="h-40 animate-pulse rounded-[1.6rem] bg-white/5" />
      ) : opportunities.data?.length ? (
        <div className="space-y-3">
          {opportunities.data.map((item) => (
            <article key={item.id} className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{item.sourceKind}</p>
              <h2 className="mt-2 font-serif text-3xl font-bold leading-tight">{item.title}</h2>
              {item.description ? <p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p> : null}
              <div className="mt-4 grid gap-2 text-sm">
                <p><span className="text-white/40">Your people get</span> · {item.peopleGet}</p>
                <p><span className="text-white/40">You can earn</span> · {item.youEarn}</p>
              </div>
              <button
                type="button"
                disabled={takeOpportunity.isPending}
                onClick={() => take(item.id)}
                className="mt-5 min-h-12 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
              >
                Take opportunity
              </button>
            </article>
          ))}
        </div>
      ) : (
        <QuietEmpty
          title="Nothing to earn from right now"
          copy="When a merchant, brand or venue wants your people, the opportunity will land here."
        />
      )}
    </ExperienceShell>
  );
}
