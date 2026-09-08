import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getStakeholderHowLead } from "@promorang/shared";
import { useOpportunities, useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { StakeholderHowLead } from "@/components/people/StakeholderLoop";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function EarnOpportunities() {
  const [params] = useSearchParams();
  const { activeRole } = useAuth();
  const lensRole = params.get("role") || activeRole;
  const how = getStakeholderHowLead(lensRole, "earn");
  const sceneId = params.get("hub") || undefined;
  const to = useExperiencePath();
  const opportunities = useOpportunities(sceneId);
  const { takeOpportunity } = useExperienceActions();
  const { toast } = useToast();
  const [taken, setTaken] = useState<{ title: string; slug: string; url: string } | null>(null);

  const take = async (id: string, title: string) => {
    try {
      const result = await takeOpportunity.mutateAsync({ id, sceneId });
      const url = `${window.location.origin}/drop/${result.drop.slug}`;
      await navigator.clipboard.writeText(url).catch(() => undefined);
      setTaken({ title, slug: result.drop.slug, url });
      toast({ title: "You took it", description: "Share the live drop. Pay happens after the merchant validates." });
    } catch (error) {
      toast({ title: "Could not take this yet", description: (error as Error).message, variant: "destructive" });
    }
  };

  return (
    <ExperienceShell
      eyebrow={how.eyebrow}
      title={how.title}
      description={how.body}
    >
      <StakeholderHowLead role={lensRole} surface="earn" />
      {taken ? (
        <div className="rounded-[1.6rem] border border-primary/40 bg-primary/10 px-5 py-5">
          <p className="font-serif text-2xl font-bold">Share {taken.title}</p>
          <p className="mt-2 text-sm text-white/60">Your people claim this on their PromoCard. You earn when the merchant records the code.</p>
          <p className="mt-3 break-all font-mono text-xs text-primary">{taken.url}</p>
          <div className="mt-4 grid gap-2">
            <Link to={to(`/drop/${taken.slug}`)} className="grid min-h-12 place-items-center rounded-full bg-primary text-sm font-black text-black">
              Open the live drop
            </Link>
            <Link to={to("/give")} className="grid min-h-12 place-items-center rounded-full border border-white/20 text-sm font-black">
              Share another perk
            </Link>
            <Link to={to("/card")} className="block text-center text-sm text-white/40">See what’s on PromoCard</Link>
          </div>
        </div>
      ) : null}
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
                onClick={() => take(item.id, item.title)}
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
          action={
            <Link to={to(how.nextHref || "/stock")} className="text-sm font-bold text-primary">
              {how.nextLabel || "Put something up yourself"}
            </Link>
          }
        />
      )}
    </ExperienceShell>
  );
}
