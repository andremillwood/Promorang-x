import { useMemo, useState } from "react";
import { ACTIVATION_REVIEW_DECISION_ACTIONS, ACTIVATION_REVIEW_NEXT_DECISIONS } from "@promorang/shared";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Camera, CheckCircle2, CircleDollarSign, HeartHandshake, MapPin, Plus, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nContext";

type ActivationMetadata = {
  desired_outcome?: string;
  outcome_detail?: string;
  scene?: string;
  location?: string;
  content_needed?: string[];
  collaborators?: string[];
  what_counts?: string;
  participant_value?: string[];
  funder_contribution?: string;
  social_return?: string;
  commercial_return?: string;
};

type Activation = {
  id: string;
  title: string;
  description: string | null;
  budget: number | null;
  status: "draft" | "sent" | "accepted" | "declined";
  created_at: string;
  metadata: ActivationMetadata | null;
  brand?: { name?: string } | null;
  latestOutcome?: ActivationOutcome | null;
};

type ActivationOutcome = {
  id: string;
  proposal_id: string;
  next_decision: string | null;
  next_decision_note: string | null;
  human_return_summary: string | null;
  commercial_return_summary: string | null;
  scene_learning_summary: string | null;
  captured_at: string;
};

const filters = ["all", "draft", "sent", "accepted", "repeat", "improve", "invite", "fund", "close"] as const;

export default function ProposalWorkspace() {
  const { t } = useI18n();
  const { user, activeOrgId } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["activation-plans", user?.id, activeOrgId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase.from("proposals").select("*, brand:brand_id (name)").order("created_at", { ascending: false });
      query = activeOrgId ? query.or(`planner_id.eq.${user.id},brand_id.eq.${activeOrgId}`) : query.eq("planner_id", user.id);
      const { data: rows, error } = await query;
      if (error) throw error;
      const activations = (rows || []) as Activation[];
      const proposalIdList = activations.map((item) => item.id);
      const proposalIds = new Set(proposalIdList);
      if (!proposalIdList.length) return activations;
      const { data: outcomeRows, error: outcomeError } = await supabase
        .from("activation_outcome_snapshots")
        .select("id,proposal_id,next_decision,next_decision_note,human_return_summary,commercial_return_summary,scene_learning_summary,captured_at")
        .in("proposal_id", proposalIdList)
        .order("captured_at", { ascending: false })
        .limit(200);
      if (outcomeError) throw outcomeError;
      const latestByProposal = ((outcomeRows || []) as ActivationOutcome[]).reduce((accumulator, outcome) => {
        const proposalId = outcome.proposal_id;
        if (proposalId && proposalIds.has(proposalId) && !accumulator[proposalId]) accumulator[proposalId] = outcome;
        return accumulator;
      }, {} as Record<string, ActivationOutcome>);
      return activations.map((activation) => ({ ...activation, latestOutcome: latestByProposal[activation.id] || null }));
    },
    enabled: Boolean(user),
  });

  const activations = useMemo(() => {
    if (filter === "all") return data;
    if (ACTIVATION_REVIEW_DECISION_ACTIONS[filter as keyof typeof ACTIVATION_REVIEW_DECISION_ACTIONS]) return data.filter((item) => item.latestOutcome?.next_decision === filter);
    return data.filter((item) => item.status === filter);
  }, [data, filter]);
  const liveCount = data.filter((item) => item.status === "accepted").length;
  const openFunding = data.reduce((total, item) => total + (item.status !== "declined" ? Number(item.budget || 0) : 0), 0);
  const decisionCounts = ACTIVATION_REVIEW_NEXT_DECISIONS.reduce((accumulator, decision) => ({ ...accumulator, [decision.id]: data.filter((item) => item.latestOutcome?.next_decision === decision.id).length }), {} as Record<string, number>);

  const filterLabels: Record<(typeof filters)[number], string> = {
    all: t("proposalWorkspace.filterAll"),
    draft: t("proposalWorkspace.filterDraft"),
    sent: t("proposalWorkspace.filterSent"),
    accepted: t("proposalWorkspace.filterAccepted"),
    repeat: "repeat",
    improve: "improve",
    invite: "invite",
    fund: "fund",
    close: "close",
  };

  return (
    <main className="min-h-screen bg-[#080808] px-4 pb-20 pt-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("proposalWorkspace.heroEyebrow")}</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-none sm:text-6xl">{t("proposalWorkspace.heroTitle")}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">{t("proposalWorkspace.heroSubtitle")}</p>
          </div>
          <Button onClick={() => navigate("/propose/new")} className="h-12 bg-primary px-6 font-black text-black hover:bg-primary/90"><Plus className="mr-2 h-4 w-4" />{t("proposalWorkspace.startActivation")}</Button>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric icon={Sparkles} label={t("proposalWorkspace.metricPlans")} value={String(data.length)} detail={t("proposalWorkspace.metricPlansDetail")} />
          <Metric icon={CalendarDays} label={t("proposalWorkspace.metricLive")} value={String(liveCount)} detail={t("proposalWorkspace.metricLiveDetail")} />
          <Metric icon={CircleDollarSign} label={t("proposalWorkspace.metricFunding")} value={openFunding ? `J$${openFunding.toLocaleString()}` : t("proposalWorkspace.metricOpen")} detail={t("proposalWorkspace.metricFundingDetail")} />
        </section>

        <section className="mt-5 rounded-[2rem] border border-primary/20 bg-primary/[0.06] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">{t("proposalWorkspace.reviewDecisions")}</p>
              <h2 className="mt-2 font-serif text-2xl font-bold">{t("proposalWorkspace.whatNext")}</h2>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-white/45">{t("proposalWorkspace.reviewCopy")}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {ACTIVATION_REVIEW_NEXT_DECISIONS.map((decision) => <DecisionMetric key={decision.id} label={decision.label} value={decisionCounts[decision.id] || 0} detail={decision.meaning} active={filter === decision.id} onClick={() => setFilter(decision.id)} />)}
          </div>
        </section>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Filter activation plans">
          {filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-xs font-bold capitalize transition ${filter === item ? "border-primary bg-primary text-black" : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25"}`}>{filterLabels[item] || item}</button>)}
        </div>

        <section className="mt-4 space-y-4">
          {isLoading ? Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.04]" />) : activations.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.025] px-6 py-20 text-center"><HeartHandshake className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-5 font-serif text-3xl font-bold">{t("proposalWorkspace.emptyTitle")}</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/45">{t("proposalWorkspace.emptyCopy")}</p><Button onClick={() => navigate("/propose/new")} className="mt-6 bg-primary font-black text-black">{t("proposalWorkspace.shapeFirstPlan")}</Button></div>
          ) : activations.map((activation) => <ActivationCard key={activation.id} activation={activation} onOpen={() => navigate(`/dashboard/proposals/${activation.id}`)} />)}
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Sparkles; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><Icon className="h-5 w-5 text-primary" /><p className="mt-5 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p><p className="mt-1 font-serif text-3xl font-bold">{value}</p><p className="mt-1 text-xs text-white/35">{detail}</p></div>;
}

function DecisionMetric({ label, value, detail, active, onClick }: { label: string; value: number; detail: string; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`rounded-2xl border p-4 text-left transition ${active ? "border-primary bg-primary text-black" : "border-white/10 bg-black/25 text-white hover:border-primary/40"}`}><p className={`text-[8px] font-black uppercase tracking-[0.16em] ${active ? "text-black/60" : "text-primary"}`}>{label}</p><p className="mt-2 font-serif text-3xl font-bold">{value}</p><p className={`mt-2 line-clamp-2 text-[10px] leading-4 ${active ? "text-black/55" : "text-white/35"}`}>{detail}</p></button>;
}

function ActivationCard({ activation, onOpen }: { activation: Activation; onOpen: () => void }) {
  const { t } = useI18n();
  const metadata = activation.metadata || {};
  const statusMap: Record<Activation["status"], [string, string]> = {
    draft: [t("proposalWorkspace.statusDraftTitle"), t("proposalWorkspace.statusDraftDetail")],
    sent: [t("proposalWorkspace.statusSentTitle"), t("proposalWorkspace.statusSentDetail")],
    accepted: [t("proposalWorkspace.statusAcceptedTitle"), t("proposalWorkspace.statusAcceptedDetail")],
    declined: [t("proposalWorkspace.statusDeclinedTitle"), t("proposalWorkspace.statusDeclinedDetail")],
  };
  const [statusTitle, statusDetail] = statusMap[activation.status] || statusMap.draft;
  const contentCount = metadata.content_needed?.length || 0;
  const peopleCount = metadata.collaborators?.length || 0;
  const decision = activation.latestOutcome?.next_decision ? ACTIVATION_REVIEW_DECISION_ACTIONS[activation.latestOutcome.next_decision as keyof typeof ACTIVATION_REVIEW_DECISION_ACTIONS] : null;
  return <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111110]">
    <div className="grid lg:grid-cols-[1fr_300px]">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-primary">{statusTitle}</span>{activation.latestOutcome?.next_decision && <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-emerald-300">Next: {activation.latestOutcome.next_decision}</span>}{metadata.scene && <span className="flex items-center gap-1.5 text-xs text-white/45"><Users className="h-3.5 w-3.5" />{metadata.scene}</span>}{metadata.location && <span className="flex items-center gap-1.5 text-xs text-white/45"><MapPin className="h-3.5 w-3.5" />{metadata.location}</span>}</div>
        <h2 className="mt-5 font-serif text-3xl font-bold sm:text-4xl">{activation.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{metadata.outcome_detail || activation.description || "A shared experience waiting to be shaped."}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <StoryBeat icon={CalendarDays} label={t("proposalWorkspace.theMoment")} value={activation.description || t("proposalWorkspace.defineExperience")} />
          <StoryBeat icon={Camera} label={t("proposalWorkspace.theStory")} value={contentCount ? t("proposalWorkspace.storyRolesCount", { count: contentCount.toString() }) : t("proposalWorkspace.chooseHowItTravels")} />
          <StoryBeat icon={Users} label={t("proposalWorkspace.thePeople")} value={peopleCount ? t("proposalWorkspace.peopleRolesCount", { count: peopleCount.toString() }) : t("proposalWorkspace.inviteRightContributors")} />
        </div>
        <div className="mt-7 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
          <ReturnBlock label={t("proposalWorkspace.peopleGain")} value={metadata.social_return || metadata.participant_value?.join(" · ") || t("proposalWorkspace.peopleGainDefault")} />
          <ReturnBlock label={t("proposalWorkspace.partnersGain")} value={metadata.commercial_return || t("proposalWorkspace.partnersGainDefault")} />
        </div>
        {activation.latestOutcome && <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary">{t("proposalWorkspace.latestReview")}</p><p className="mt-2 text-sm leading-6 text-white/60">{activation.latestOutcome.human_return_summary || activation.latestOutcome.commercial_return_summary || t("proposalWorkspace.reviewRecorded")}</p>{activation.latestOutcome.scene_learning_summary && <p className="mt-2 text-xs leading-5 text-white/40">{t("proposalWorkspace.sceneLearning", { learning: activation.latestOutcome.scene_learning_summary })}</p>}</div>}
      </div>
      <aside className="flex flex-col justify-between border-t border-white/10 bg-black/30 p-6 lg:border-l lg:border-t-0">
        <div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{t("proposalWorkspace.nextMove")}</p><h3 className="mt-3 font-serif text-2xl font-bold">{decision?.title || statusTitle}</h3><p className="mt-2 text-xs leading-5 text-white/45">{activation.latestOutcome?.next_decision_note || decision?.detail || statusDetail}</p>{activation.budget ? <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/30">{t("proposalWorkspace.fundingRequested")}</p><p className="mt-1 text-xl font-bold">J${Number(activation.budget).toLocaleString()}</p></div> : null}</div>
        <Button onClick={onOpen} variant="outline" className="mt-7 w-full justify-between border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">{t("proposalWorkspace.openActivation")} <ArrowRight className="h-4 w-4" /></Button>
      </aside>
    </div>
  </article>;
}

function StoryBeat({ icon: Icon, label, value }: { icon: typeof Camera; label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><Icon className="h-4 w-4 text-primary" /><p className="mt-4 text-[8px] font-black uppercase tracking-[0.16em] text-white/30">{label}</p><p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-white/70">{value}</p></div>; }
function ReturnBlock({ label, value }: { label: string; value: string }) { return <div><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-primary"><CheckCircle2 className="h-3.5 w-3.5" />{label}</p><p className="mt-2 text-xs leading-5 text-white/50">{value}</p></div>; }
