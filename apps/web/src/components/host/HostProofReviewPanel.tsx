import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Gift, Scale, Sparkles, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ProofSubmissionAuditDialog } from "@/components/proof/ProofSubmissionAuditDialog";
import { GuidanceDisclosure } from "@/components/guidance/GuidanceDisclosure";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

type MomentumProofSubmission = {
  id: string;
  moment_id: string;
  submission_state: string;
  review_reason?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  proof_bundle?: {
    code?: string | null;
    evidence_url?: string | null;
    location_verified?: boolean | null;
    submitted_at?: string | null;
  } | null;
  moment?: {
    title: string;
    reward?: string | null;
    memory_rarity?: string | null;
    venue_name?: string | null;
  } | null;
  memory?: {
    title: string;
    issued_at?: string | null;
  } | null;
  mission_attribution?: {
    status?: string | null;
    first_engaged_at?: string | null;
    joined_at?: string | null;
    verified_at?: string | null;
    engagement_events_count?: number | null;
    join_events_count?: number | null;
    verification_events_count?: number | null;
  } | null;
  reward?: {
    id: string;
    reward_value?: string | null;
    status?: string | null;
  } | null;
  payout?: {
    queued?: boolean;
    queue_item?: {
      amount_jmd?: number | null;
    } | null;
  } | null;
  attendance_piece_awards?: Array<{
    event?: {
      quantity?: number | null;
      piece_type?: string | null;
    } | null;
  }> | null;
  piece_award?: {
    event?: {
      quantity?: number | null;
      piece_type?: string | null;
    } | null;
  } | null;
};

export const HostProofReviewPanel = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const { t, formatDate, formatNumber } = useI18n();

  const stamp = (value?: string | null) => {
    if (!value) return "";
    return formatDate(value, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const pendingQuery = useQuery({
    queryKey: ["host-proof-review-pending"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/proof/submissions/pending`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || t("hostProof.loadQueueFail"));
      return payload?.submissions || [];
    },
  });

  const historyQuery = useQuery({
    queryKey: ["host-proof-review-history"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/proof/submissions/history?limit=10`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || t("hostProof.loadHistFail"));
      return payload?.submissions || [];
    },
  });

  const reviewMarkDetails = async (id: string, action: "approve" | "reject") => {
    const reviewReason = action === "reject" ? window.prompt(t("hostProof.rejectPrompt")) : null;
    if (action === "reject" && !reviewReason) return;

    const response = await fetch(`${API_URL}/api/proof/submissions/${id}/review`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, review_reason: reviewReason }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || t("hostProof.reviewFail"));

    toast({
      title: action === "approve" ? t("hostProof.toastApproved") : t("hostProof.toastRejected"),
      description: action === "approve"
        ? payload?.payout?.queued
          ? t("hostProof.toastPayout", { amount: formatNumber(Number(payload.payout.queue_item.amount_jmd || 0)) })
          : payload?.reward?.reward_value
            ? t("hostProof.toastReward", { value: payload.reward.reward_value })
            : payload?.memory
              ? t("hostProof.toastMemory", { title: payload.memory.title })
              : t("hostProof.toastVerified")
        : payload?.submission?.review_reason || t("hostProof.toastRejected"),
    });

    await Promise.all([pendingQuery.refetch(), historyQuery.refetch()]);
  };

  const pending = pendingQuery.data || [];
  const history = historyQuery.data || [];
  const loading = pendingQuery.isLoading || historyQuery.isLoading;
  const loadError = pendingQuery.error || historyQuery.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 border-b border-border/60 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">{t("hostProof.eyebrow")}</p>
          <h3 className="mt-3 font-serif text-4xl font-semibold leading-none tracking-[-0.04em] text-foreground">{t("hostProof.title")}</h3>
          <GuidanceDisclosure
            id="host-proof-review:decision-context"
            eyebrow={t("hostProof.guideEyebrow")}
            title={t("hostProof.guideTitle")}
            summary={t("hostProof.guideSummary")}
            className="mt-3 max-w-2xl"
            tone="light"
          >
            <p className="text-sm leading-6 text-muted-foreground">
              {t("hostProof.guideBody")}
            </p>
          </GuidanceDisclosure>
        </div>
        <div className="flex items-end gap-7 border-l border-border/60 pl-6">
          <div><p className="font-serif text-4xl font-semibold">{pendingQuery.isLoading ? "…" : pending.length}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{t("hostProof.waitingNow")}</p></div>
          <div><p className="font-serif text-4xl font-semibold text-muted-foreground">{historyQuery.isLoading ? "…" : history.length}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{t("hostProof.recentlyDecided")}</p></div>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {(loadError as Error).message}
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {pending.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">{t("hostProof.emptyPending")}</p>
              </div>
            ) : (
              pending.map((proof: MomentumProofSubmission) => (
                <Card key={proof.id} className="overflow-hidden rounded-[2rem] border-border/50 p-5 sm:p-7">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-primary/10 text-primary border border-primary/20">
                          {t("hostProof.memoryRarity", { rarity: proof.moment?.memory_rarity || "common" })}
                        </Badge>
                        {proof.moment?.reward && <Badge variant="outline">{t("hostProof.rewardLabel", { value: proof.moment.reward })}</Badge>}
                      </div>
                      <div>
                        <h4 className="font-serif text-2xl font-semibold text-foreground">{proof.moment?.title || t("hostProof.untitled")}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("hostProof.submitted", {
                            venue: proof.moment?.venue_name || t("hostProof.venuePending"),
                            when: stamp(proof.proof_bundle?.submitted_at || proof.created_at),
                          })}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                          <p><span className="font-semibold text-foreground">{t("hostProof.code")}</span> {proof.proof_bundle?.code || t("hostProof.none")}</p>
                          <p className="mt-1"><span className="font-semibold text-foreground">{t("hostProof.location")}</span> {proof.proof_bundle?.location_verified ? t("hostProof.verified") : t("hostProof.notVerified")}</p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">{t("hostProof.approvalLabel")}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{t("hostProof.approvalBody")}</p>
                        </div>
                      </div>
                      {proof.mission_attribution && (
                        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">{t("hostProof.missionCtx")}</p>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <p><span className="font-semibold text-foreground">{t("hostProof.status")}</span> {proof.mission_attribution.status || "engaged"}</p>
                            <p><span className="font-semibold text-foreground">{t("hostProof.digitalEvents")}</span> {proof.mission_attribution.engagement_events_count || 0}</p>
                            <p><span className="font-semibold text-foreground">{t("hostProof.joined")}</span> {proof.mission_attribution.joined_at ? stamp(proof.mission_attribution.joined_at) : t("hostProof.notTracked")}</p>
                            <p><span className="font-semibold text-foreground">{t("hostProof.verifiedAt")}</span> {proof.mission_attribution.verified_at ? stamp(proof.mission_attribution.verified_at) : t("hostProof.pending")}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex w-full max-w-sm flex-col gap-3 lg:items-end">
                      {proof.proof_bundle?.evidence_url && (
                        <a href={proof.proof_bundle.evidence_url} target="_blank" rel="noopener noreferrer" className="block h-32 w-full overflow-hidden rounded-xl border border-border bg-muted">
                          <img src={proof.proof_bundle.evidence_url} alt={t("hostProof.proofAlt")} className="h-full w-full object-cover" />
                        </a>
                      )}
                      <div className="flex w-full gap-2">
                        <ProofSubmissionAuditDialog submissionId={proof.id} triggerLabel={t("hostProof.audit")} />
                        <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => reviewMarkDetails(proof.id, "approve")}>
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          {t("hostProof.verify")}
                        </Button>
                        <Button variant="ghost" className="flex-1 text-destructive hover:bg-destructive/10" onClick={() => reviewMarkDetails(proof.id, "reject")}>
                          <XCircle className="mr-1.5 h-4 w-4" />
                          {t("hostProof.reject")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <h4 className="font-serif text-xl font-bold">{t("hostProof.historyTitle")}</h4>
            </div>
            <div className="mt-5 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("hostProof.emptyHistory")}</p>
              ) : (
                history.map((proof: MomentumProofSubmission) => (
                  <div key={proof.id} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{proof.moment?.title || t("hostProof.untitled")}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {proof.reviewed_at ? stamp(proof.reviewed_at) : t("hostProof.recentlyReviewed")}
                        </p>
                      </div>
                    <div className="flex flex-wrap gap-2">
                      <ProofSubmissionAuditDialog submissionId={proof.id} triggerLabel={t("hostProof.audit")} />
                      <Badge variant={proof.submission_state === "verified" ? "default" : "destructive"}>
                        {proof.submission_state}
                      </Badge>
                        {proof.reward?.reward_value && (
                          <Badge variant="outline">
                            {t("hostProof.rewardLabel", { value: proof.reward.reward_value })}
                          </Badge>
                        )}
                        {proof.memory && (
                          <Badge className="bg-primary/10 text-primary border border-primary/20">
                            <Gift className="mr-1 h-3 w-3" />
                            {proof.memory.title}
                          </Badge>
                        )}
                        {proof.payout?.queued && (
                          <Badge variant="outline">
                            {t("hostProof.payoutQueued")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {proof.attendance_piece_awards?.map((award, index) => (
                        <Badge key={`attendance-${index}`} variant="outline">
                          {t("hostProof.attendancePieces", {
                            qty: award?.event?.quantity || 0,
                            type: award?.event?.piece_type || t("hostProof.pieceFallback"),
                          })}
                        </Badge>
                      ))}
                      {proof.piece_award?.event && (
                        <Badge variant="outline">
                          {t("hostProof.proofPieces", {
                            qty: proof.piece_award.event.quantity || 0,
                            type: proof.piece_award.event.piece_type || t("hostProof.pieceFallback"),
                          })}
                        </Badge>
                      )}
                    </div>
                    {proof.review_reason && <p className="mt-3 text-xs text-muted-foreground">{proof.review_reason}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
