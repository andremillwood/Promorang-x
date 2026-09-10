import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getStakeholderHowLead } from "@promorang/shared";
import { useOpportunities, useExperienceActions } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { StakeholderHowLead } from "@/components/people/StakeholderLoop";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";

export default function EarnOpportunities() {
  const { t } = useI18n();
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
      toast({ title: t("earn.took"), description: t("earn.tookCopy") });
    } catch (error) {
      toast({ title: t("earn.couldNot"), description: (error as Error).message, variant: "destructive" });
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
          <p className="font-serif text-2xl font-bold">{t("earn.shareTitle", { title: taken.title })}</p>
          <p className="mt-2 text-sm text-white/60">{t("earn.shareCopy")}</p>
          <p className="mt-3 break-all font-mono text-xs text-primary">{taken.url}</p>
          <div className="mt-4 grid gap-2">
            <Link to={to(`/drop/${taken.slug}`)} className="grid min-h-12 place-items-center rounded-full bg-primary text-sm font-black text-black">
              {t("earn.openDrop")}
            </Link>
            <Link to={to("/give")} className="grid min-h-12 place-items-center rounded-full border border-white/20 text-sm font-black">
              {t("earn.shareAnother")}
            </Link>
            <Link to={to("/card")} className="block text-center text-sm text-white/40">{t("earn.seeCard")}</Link>
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
                <p><span className="text-white/40">{t("earn.peopleGet")}</span> · {item.peopleGet}</p>
                <p><span className="text-white/40">{t("earn.youEarn")}</span> · {item.youEarn}</p>
              </div>
              <button
                type="button"
                disabled={takeOpportunity.isPending}
                onClick={() => take(item.id, item.title)}
                className="mt-5 min-h-12 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
              >
                {t("earn.take")}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <QuietEmpty
          title={t("earn.emptyTitle")}
          copy={t("earn.emptyCopy")}
          action={
            <Link to={to(how.nextHref || "/discover?tab=perks")} className="text-sm font-bold text-primary">
              {how.nextLabel || t("earn.browsePerks")}
            </Link>
          }
        />
      )}
    </ExperienceShell>
  );
}
