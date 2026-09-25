import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BadgeDollarSign, Gift, Megaphone, Target, Trophy } from "lucide-react";
import { getStakeholderHowLead } from "@promorang/shared";
import { useOpportunities, useExperienceActions, useExperienceHome } from "@/hooks/usePeopleExperience";
import { useExperiencePath } from "@/hooks/useExperiencePath";
import { ExperienceShell, QuietEmpty } from "@/components/people/ExperienceShell";
import { StakeholderHowLead } from "@/components/people/StakeholderLoop";
import { ParticipationEconomy } from "@/components/promorang/ParticipationEconomy";
import { MASTER_KEY_RULES } from "@/lib/master-key";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";

type ParticipationKind = "challenge" | "gig" | "offer" | "content" | "campaign";

function opportunityKind(item: any): ParticipationKind {
  if (item.participationKind === "challenge" || item.sourceKind === "mission") return "challenge";
  if (item.participationKind === "gig") return "gig";
  if (item.sourceKind === "offer") return "offer";
  if (item.sourceKind === "content" || item.sourceKind === "drop") return "content";
  return "campaign";
}

const kindMeta: Record<ParticipationKind, { label: string; icon: typeof Target; tone: string }> = {
  challenge: { label: "Challenge", icon: Trophy, tone: "text-amber-300" },
  gig: { label: "Gig", icon: BadgeDollarSign, tone: "text-emerald-300" },
  offer: { label: "Offer", icon: Gift, tone: "text-orange-300" },
  content: { label: "Content Drop", icon: Megaphone, tone: "text-fuchsia-300" },
  campaign: { label: "Activation", icon: Target, tone: "text-sky-300" },
};

export default function EarnOpportunities() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const { activeRole } = useAuth();
  const lensRole = params.get("role") || activeRole;
  const requestedKind = params.get("kind") as ParticipationKind | null;
  const how = getStakeholderHowLead(lensRole, "earn");
  const sceneId = params.get("hub") || undefined;
  const to = useExperiencePath();
  const opportunities = useOpportunities(sceneId);
  const home = useExperienceHome();
  const masterKey = (home.data as any)?.masterKey || (home.data as any)?.card?.masterKey || null;
  const fundedAccessDormant = Boolean(masterKey?.earned && masterKey?.status === "dormant");
  const { takeOpportunity } = useExperienceActions();
  const { toast } = useToast();
  const [taken, setTaken] = useState<{ title: string; slug: string; url: string } | null>(null);

  const filtered = useMemo(() => {
    const rows = opportunities.data || [];
    if (!requestedKind || !["challenge", "gig", "offer", "content", "campaign"].includes(requestedKind)) return rows;
    return rows.filter((item: any) => opportunityKind(item) === requestedKind);
  }, [opportunities.data, requestedKind]);

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
      eyebrow="Ways to participate"
      title={requestedKind === "challenge" ? "Challenges worth completing." : requestedKind === "gig" ? "Paid Gigs worth taking." : "Things worth doing."}
      description="Offers, Challenges, paid Gigs and other live opportunities should tell you what the move is, what counts, and what value follows."
    >
      <StakeholderHowLead role={lensRole} surface="earn" />

      {masterKey ? (
        <div className={`rounded-[1.5rem] border p-5 ${fundedAccessDormant ? "border-amber-300/25 bg-amber-300/[.05]" : "border-emerald-300/20 bg-emerald-300/[.04]"}`}>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-white/40">Master Key · {masterKey.status}</p>
          <h2 className="mt-2 font-serif text-2xl font-bold">{fundedAccessDormant ? "Your Master Key is earned. Rebuild Momentum to reopen funded work." : masterKey.earned ? "Your earning access is open." : "Build verified participation to unlock earning access."}</h2>
          <p className="mt-2 text-sm leading-6 text-white/50">{masterKey.earned ? `Momentum ${masterKey.momentum || 0} · Active target ${MASTER_KEY_RULES.activeMomentum} in a rolling ${MASTER_KEY_RULES.windowDays}-day window. Empty logins do not count.` : "Qualification requires varied participation, verified Moves and at least one attributable downstream action."}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-y border-white/10 py-4">
        {(["challenge", "gig", "offer", "campaign"] as ParticipationKind[]).map((kind) => {
          const meta = kindMeta[kind];
          const Icon = meta.icon;
          const active = requestedKind === kind;
          return (
            <Link
              key={kind}
              to={to(`/earn?kind=${kind}`)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs font-black transition ${active ? "border-primary bg-primary text-black" : "border-white/12 text-white/60 hover:border-white/30 hover:text-white"}`}
            >
              <Icon className="h-3.5 w-3.5" /> {meta.label}
            </Link>
          );
        })}
        <Link to={to("/content-drops")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-xs font-black text-white/60 hover:border-white/30 hover:text-white">
          <Megaphone className="h-3.5 w-3.5" /> Content Drops
        </Link>
      </div>

      {taken ? (
        <div className="rounded-[1.6rem] border border-primary/40 bg-primary/10 px-5 py-5">
          <p className="font-serif text-2xl font-bold">{t("earn.shareTitle", { title: taken.title })}</p>
          <p className="mt-2 text-sm text-white/60">{t("earn.shareCopy")}</p>
          <p className="mt-3 break-all font-mono text-xs text-primary">{taken.url}</p>
          <div className="mt-4 grid gap-2">
            <Link to={to(`/drop/${taken.slug}`)} className="grid min-h-12 place-items-center rounded-full bg-primary text-sm font-black text-black">
              {t("earn.openDrop")}
            </Link>
            <Link to={to("/card")} className="block text-center text-sm text-white/40">{t("earn.seeCard")}</Link>
          </div>
        </div>
      ) : null}

      {opportunities.isLoading ? (
        <div className="h-40 animate-pulse rounded-[1.6rem] bg-white/5" />
      ) : filtered.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item: any) => {
            const kind = opportunityKind(item);
            const meta = kindMeta[kind];
            const Icon = meta.icon;
            return (
              <article key={item.id} className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${meta.tone}`}>
                    <Icon className="h-4 w-4" /> {meta.label}
                  </p>
                  {item.remaining != null ? <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">{item.remaining} left</span> : null}
                </div>
                <h2 className="mt-3 font-serif text-3xl font-bold leading-tight">{item.title}</h2>
                {item.description ? <p className="mt-2 text-sm leading-6 text-white/55">{item.description}</p> : null}

                <div className="mt-5 grid gap-3 border-y border-white/10 py-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">{kind === "gig" ? "The work" : "The move"}</p>
                    <p className="mt-1 text-sm text-white/75">{item.peopleGet}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">{kind === "gig" ? "Compensation" : "Value"}</p>
                    <p className="mt-1 text-sm font-bold text-white">{item.compensation || item.youEarn}</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={takeOpportunity.isPending || (fundedAccessDormant && kind === "gig")}
                  onClick={() => take(item.id, item.title)}
                  className="mt-5 min-h-12 w-full rounded-full bg-primary text-sm font-black text-black disabled:opacity-60"
                >
                  {fundedAccessDormant && kind === "gig" ? "Rebuild Momentum to access" : kind === "gig" ? "Take this Gig" : kind === "challenge" ? "Join Challenge" : "Take this opportunity"}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <QuietEmpty
          title={requestedKind === "gig" ? "No paid Gigs are live right now." : requestedKind === "challenge" ? "No Challenges are live right now." : t("earn.emptyTitle")}
          copy={requestedKind ? "PROMORANG will not substitute demo work for a quiet market. Explore other opportunity types or come back when something real opens." : t("earn.emptyCopy")}
          action={
            <Link to={to("/discover")} className="text-sm font-bold text-primary">
              Explore the market
            </Link>
          }
        />
      )}

      <ParticipationEconomy variant="participant" masterKey={masterKey} />
    </ExperienceShell>
  );
}
