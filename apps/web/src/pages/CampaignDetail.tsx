import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CircleDollarSign,
  Eye,
  Gift,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandCampaigns, type Campaign } from "@/hooks/useCampaigns";
import { useCampaignProofOutcome } from "@/hooks/useProofOutcome";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProofOutcomeRail } from "@/components/proof/ProofOutcomeRail";
import { PromoPilotExecutionPanel } from "@/components/campaigns/PromoPilotExecutionPanel";
import { DemandFlightPath } from "@/components/campaigns/DemandFlightPath";
import { useI18n } from "@/i18n/I18nContext";

type CampaignPlanMetadata = {
  original_prompt?: string;
  normalizedIntent?: { cleanedInput?: string };
  moves?: string[];
  proof_requirement?: string;
  planned_reward_per_action_gems?: number;
  funding_status?: string;
  activation_status?: string;
};

const proofCopy: Record<string, string> = {
  LINK: "A submitted link confirms the action",
  OCR: "A receipt confirms the purchase",
  UPLOAD: "A photo confirms the visit",
};

function readableDate(value?: string | null) {
  if (!value) return "To be decided";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "To be decided";
  }
}

function descriptionValue(campaign: Campaign | undefined, prefix: string) {
  return campaign?.description?.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length).trim();
}

const CampaignDetail = () => {
  const { t } = useI18n();
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, activeRole } = useAuth();
  const campaignsQuery = useBrandCampaigns();
  const campaign = campaignsQuery.data?.find((entry) => entry.id === id);
  const outcomeQuery = useCampaignProofOutcome(campaign?.is_active ? id : undefined);
  const metadata = (campaign?.compiler_metadata || {}) as CampaignPlanMetadata;
  const isDraft = Boolean(campaign && !campaign.is_active);

  const enterStudio = useMutation({
    mutationFn: async () => {
      if (!campaign || !user) throw new Error("This activation plan is not available.");
      if (campaign.activation_proposal_id) return campaign.activation_proposal_id;
      const { data: proposalId, error } = await supabase.rpc("open_campaign_activation", { p_campaign_id: campaign.id });
      if (error) throw error;
      if (!proposalId) throw new Error("The Activation Studio could not be opened.");
      return proposalId;
    },
    onSuccess: async (proposalId) => {
      await queryClient.invalidateQueries({ queryKey: ["brand-campaigns"] });
      navigate(`/dashboard/proposals/${proposalId}`);
    },
    onError: (error: Error) => toast.error(error.message || "The activation studio could not be opened."),
  });

  if (!user) return <Navigate to="/auth" replace />;
  if (activeRole !== "brand" && activeRole !== "agency" && activeRole !== "admin") return <Navigate to="/dashboard" replace />;

  if (campaignsQuery.isLoading) {
    return <main className="min-h-screen bg-[#f2eee5] px-5 py-10"><div className="mx-auto max-w-7xl"><Skeleton className="h-12 w-72" /><Skeleton className="mt-8 h-[520px] w-full" /></div></main>;
  }

  if (!campaign) {
    return <main className="min-h-screen bg-[#f2eee5] px-5 py-16 text-[#191816]"><div className="mx-auto max-w-3xl border-t border-black/20 pt-8"><Sparkles className="h-8 w-8 text-[#d85b24]" /><h1 className="mt-5 text-4xl font-black">This activation is not in your workspace.</h1><Button asChild className="mt-7 rounded-full"><Link to="/dashboard?tab=campaigns">Return to your activations</Link></Button></div></main>;
  }

  const desiredOutcome = metadata.original_prompt || metadata.normalizedIntent?.cleanedInput || descriptionValue(campaign, "Desired outcome:") || campaign.description;
  const peopleWill = descriptionValue(campaign, "People will:") || "The participant action still needs to be shaped.";
  const whatCounts = proofCopy[metadata.proof_requirement || ""] || descriptionValue(campaign, "What counts:") || "The proof requirement still needs to be agreed.";
  const expectedMovement = descriptionValue(campaign, "Expected movement:") || "The expected movement will be agreed before funding.";

  return (
    <main className="min-h-screen bg-[#f2eee5] pb-24 text-[#191816]">
      <section className="bg-[#151412] px-5 pb-12 pt-8 text-white sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto max-w-7xl">
          <Link to="/dashboard?tab=campaigns" className="flex w-fit items-center gap-2 text-sm font-semibold text-white/50 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> {t("campaignDetail.yourActivations")}</Link>
          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${isDraft ? "bg-amber-300 text-black" : "bg-emerald-400 text-black"}`}>{isDraft ? t("campaignDetail.planNotLive") : t("campaignDetail.liveActivation")}</span>
                {campaign.geo_label && <span className="flex items-center gap-1.5 text-xs text-white/45"><MapPin className="h-3.5 w-3.5" />{campaign.geo_label}</span>}
              </div>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.055em] sm:text-7xl">{campaign.title}</h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/55">{desiredOutcome}</p>
            </div>
            <div className="border-l border-white/15 pl-6">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">{t("campaignDetail.nextMoveEyebrow")}</p>
              <p className="mt-3 text-2xl font-black leading-tight">{isDraft ? t("campaignDetail.draftNextMove") : t("campaignDetail.activeNextMove")}</p>
              <p className="mt-3 text-sm leading-6 text-white/45">{isDraft ? t("campaignDetail.draftNextDetail") : t("campaignDetail.activeNextDetail")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-16 xl:px-24">
        {isDraft ? (
          <>
            <section className="grid gap-x-10 gap-y-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { number: "01", label: t("campaignDetail.people"), value: "Choose the Scene and contributors", icon: Users },
                { number: "02", label: t("campaignDetail.whatTheyDo"), value: peopleWill, icon: Rocket },
                { number: "03", label: t("campaignDetail.whatCounts"), value: whatCounts, icon: ShieldCheck },
                { number: "04", label: t("campaignDetail.whatFollows"), value: campaign.reward_value || "Participant value to be agreed", icon: Gift },
              ].map((item) => (
                <article key={item.number} className="border-t border-black/20 pt-5">
                  <div className="flex items-center justify-between"><span className="text-xs font-black text-[#d85b24]">{item.number}</span><item.icon className="h-5 w-5 text-black/30" /></div>
                  <p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-black/40">{item.label}</p>
                  <h2 className="mt-2 text-xl font-black leading-tight">{item.value}</h2>
                </article>
              ))}
            </section>

            <section className="grid overflow-hidden border border-black/15 bg-[#faf7f0] lg:grid-cols-[minmax(0,1fr)_400px]">
              <div className="p-7 sm:p-10 lg:p-12">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#d85b24]">{t("campaignDetail.activationReadiness")}</p>
                <h2 className="mt-3 max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.045em]">{t("campaignDetail.readinessHeading")}</h2>
                <div className="mt-9 grid gap-5 sm:grid-cols-2">
                  {[
                    ["Outcome shaped", true, expectedMovement],
                    ["Proof explained", true, whatCounts],
                    ["Scene and people aligned", false, "Choose who this strengthens and who helps make it happen."],
                    ["Gems secured", false, "Set a participant limit, agree the promises, and secure the full reserve."],
                  ].map(([label, complete, detail]) => (
                    <div key={String(label)} className="flex gap-3">
                      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${complete ? "bg-emerald-700 text-white" : "border border-black/20 text-black/25"}`}>{complete && <Check className="h-3.5 w-3.5" />}</span>
                      <div><p className="text-sm font-black">{label}</p><p className="mt-1 text-xs leading-5 text-black/48">{detail}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <aside className="bg-[#d85b24] p-7 text-white sm:p-10 lg:p-12">
                <CircleDollarSign className="h-8 w-8" />
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{t("campaignDetail.continueInStudio")}</p>
                <h2 className="mt-3 text-3xl font-black leading-tight">Turn the draft into something people can trust.</h2>
                <p className="mt-4 text-sm leading-6 text-white/75">Connect a Scene and Moment, invite contributors, define the participant limit, then secure Gems through the canonical activation reserve.</p>
                <Button onClick={() => enterStudio.mutate()} disabled={enterStudio.isPending} className="mt-8 h-14 w-full rounded-full bg-[#191816] text-base font-black text-white hover:bg-black">
                  {enterStudio.isPending ? "Opening the studio…" : campaign.activation_proposal_id ? t("campaignDetail.openStudioButton") : t("campaignDetail.continueShaping")}<ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="mt-4 text-center text-xs text-white/65">This still does not publish or move Gems.</p>
              </aside>
            </section>

            <PromoPilotExecutionPanel campaignId={campaign.id} />
          </>
        ) : (
          <>
            <section className="grid gap-8 border-b border-black/15 py-10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "People reached", value: campaign.impressions.toLocaleString(), icon: Eye },
                { label: "Accepted actions", value: campaign.redemptions.toLocaleString(), icon: ShieldCheck },
                { label: "Participant return", value: campaign.reward_value || "Not recorded", icon: Gift },
                { label: "Open window", value: `${readableDate(campaign.start_date)} — ${readableDate(campaign.end_date)}`, icon: CalendarDays },
              ].map((item) => <div key={item.label}><item.icon className="h-5 w-5 text-[#d85b24]" /><p className="mt-4 text-2xl font-black">{item.value}</p><p className="mt-1 text-xs text-black/45">{item.label}</p></div>)}
            </section>
            <div className="py-10"><ProofOutcomeRail guidanceId={`campaign-detail:${campaign.id}:proof-outcome`} eyebrow="Shared return" title="Follow the path from attention to accepted action" data={outcomeQuery.data} isLoading={outcomeQuery.isLoading} /></div>
          </>
        )}

        <DemandFlightPath campaignId={campaign.id} />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-7">
          <p className="text-sm text-black/45">Want to shape a different outcome?</p>
          <Button asChild variant="outline" className="rounded-full border-black/20 bg-transparent"><Link to="/create/campaign">Create another activation</Link></Button>
        </div>
      </div>
    </main>
  );
};

export default CampaignDetail;
