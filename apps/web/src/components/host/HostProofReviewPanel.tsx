import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle2, Gift, History, Scale, Sparkles, Stamp, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  proof_bundle?: { code?: string | null; evidence_url?: string | null; location_verified?: boolean | null; submitted_at?: string | null } | null;
  moment?: { title: string; reward?: string | null; memory_rarity?: string | null; venue_name?: string | null } | null;
  memory?: { title: string; issued_at?: string | null } | null;
  mission_attribution?: {
    status?: string | null;
    joined_at?: string | null;
    verified_at?: string | null;
    engagement_events_count?: number | null;
  } | null;
  reward?: { id: string; reward_value?: string | null; status?: string | null } | null;
  payout?: { queued?: boolean; queue_item?: { amount_jmd?: number | null } | null } | null;
  attendance_piece_awards?: Array<{ event?: { quantity?: number | null; piece_type?: string | null } | null }> | null;
  piece_award?: { event?: { quantity?: number | null; piece_type?: string | null } | null } | null;
};

export const HostProofReviewPanel = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [writingId, setWritingId] = useState<string | null>(null);

  const pendingQuery = useQuery({
    queryKey: ["host-proof-review-pending"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/proof/submissions/pending`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load proof queue");
      return payload?.submissions || [];
    },
  });

  const historyQuery = useQuery({
    queryKey: ["host-proof-review-history"],
    enabled: !!session,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/proof/submissions/history?limit=10`, { headers: { Authorization: `Bearer ${session?.access_token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Failed to load proof history");
      return payload?.submissions || [];
    },
  });

  const review = async (id: string, action: "approve" | "reject", reason?: string) => {
    setWritingId(id);
    try {
      const response = await fetch(`${API_URL}/api/proof/submissions/${id}/review`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, review_reason: action === "reject" ? reason : null }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || "Proof decision was not recorded.");

      toast({
        title: action === "approve" ? "Proof verified" : "Proof rejected",
        description: action === "approve"
          ? payload?.payout?.queued
            ? `Payout queued: JMD ${Number(payload.payout.queue_item?.amount_jmd || 0).toLocaleString()}`
            : payload?.reward?.reward_value
              ? `Reward issued: ${payload.reward.reward_value}`
              : payload?.memory?.title
                ? `Memory issued: ${payload.memory.title}`
                : "Verification approved"
          : payload?.submission?.review_reason || reason || "Proof rejected",
      });
      setRejectingId(null);
      setRejectionReason("");
      await Promise.all([pendingQuery.refetch(), historyQuery.refetch()]);
    } catch (error) {
      toast({ title: "Decision not recorded", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    } finally {
      setWritingId(null);
    }
  };

  const pending = pendingQuery.data || [];
  const history = historyQuery.data || [];
  const loading = pendingQuery.isLoading || historyQuery.isLoading;
  const loadError = pendingQuery.error || historyQuery.error;

  return (
    <div className="space-y-6" data-proof-family="host-proof-close">
      <section className="relative overflow-hidden bg-[#efe1c8] p-5 text-[#1b160f] shadow-[0_24px_70px_rgba(0,0,0,.18)] sm:p-7">
        <div className="absolute right-0 top-0 h-full w-2 bg-[repeating-linear-gradient(180deg,#ff6a00_0_7px,transparent_7px_15px)] opacity-25" />
        <div className="flex flex-col gap-6 border-b border-dashed border-black/20 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3"><Stamp className="h-5 w-5 text-[#8b5427]" /><p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8b5427]">Host · Proof Close</p></div>
            <h3 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Resolve what is real before the Moment closes.</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">Submission is a claim. Approval is a recorded verification decision. Rejection requires a reason and remains part of the history.</p>
          </div>
          <div className="flex gap-7 border-l border-black/15 pl-5">
            <div><p className="font-serif text-3xl font-semibold">{pendingQuery.isLoading ? "…" : pending.length}</p><p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8b5427]">Waiting</p></div>
            <div><p className="font-serif text-3xl font-semibold text-black/55">{historyQuery.isLoading ? "…" : history.length}</p><p className="text-[9px] font-black uppercase tracking-[0.16em] text-black/40">Recent decisions</p></div>
          </div>
        </div>
        <GuidanceDisclosure id="host-proof-review:decision-context" eyebrow="Decision consequence" title="What approval changes" summary="Approval can release downstream memory, reward, payout, Piece or other value." className="mt-5 max-w-3xl" tone="light">
          <p className="text-sm leading-6 text-muted-foreground">Approval can trigger downstream records. A queued payout remains queued; approval alone must never be presented as paid.</p>
        </GuidanceDisclosure>
      </section>

      {loadError ? (
        <div className="border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">{(loadError as Error).message}</div>
      ) : loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-none" />)}</div>
      ) : (
        <>
          <div className="space-y-4">
            {pending.length === 0 ? (
              <div className="border border-dashed border-border bg-card/50 p-8 text-center"><Sparkles className="mx-auto h-8 w-8 text-primary" /><p className="mt-4 text-sm text-muted-foreground">No proof submissions are waiting for review.</p></div>
            ) : pending.map((proof: MomentumProofSubmission) => (
              <Card key={proof.id} className="overflow-hidden rounded-none border-border/50">
                <div className="grid lg:grid-cols-[13rem_1fr_22rem]">
                  <div className="border-b border-border/60 bg-muted/25 p-5 lg:border-b-0 lg:border-r">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">Claim</p>
                    <h4 className="mt-3 font-serif text-2xl font-semibold tracking-[-0.03em] text-foreground">{proof.moment?.title || "Untitled Moment"}</h4>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{proof.moment?.venue_name || "Venue pending"}</p>
                    <p className="mt-4 font-mono text-[10px] text-muted-foreground">{proof.id}</p>
                  </div>

                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="border border-primary/20 bg-primary/10 text-primary">{proof.moment?.memory_rarity || "common"} memory</Badge>
                      {proof.moment?.reward ? <Badge variant="outline">Reward: {proof.moment.reward}</Badge> : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-foreground/55">Source</p><p className="mt-2"><strong className="text-foreground">Code:</strong> {proof.proof_bundle?.code || "None"}</p></div>
                      <div className="border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-foreground/55">Location</p><p className="mt-2">{proof.proof_bundle?.location_verified ? "Verified" : "Not verified"}</p></div>
                      <div className="border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground"><p className="text-[9px] font-black uppercase tracking-[0.14em] text-foreground/55">Submitted</p><p className="mt-2">{format(new Date(proof.proof_bundle?.submitted_at || proof.created_at), "MMM d, h:mm a")}</p></div>
                    </div>
                    {proof.mission_attribution ? <div className="border border-border/60 p-3 text-xs text-muted-foreground"><strong className="text-foreground">Mission context:</strong> {proof.mission_attribution.status || "engaged"} · {proof.mission_attribution.engagement_events_count || 0} digital events · verified {proof.mission_attribution.verified_at ? format(new Date(proof.mission_attribution.verified_at), "MMM d, h:mm a") : "pending"}</div> : null}
                    <div className="border-l-2 border-primary/35 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Decision boundary:</strong> verify only if the submitted source supports the participation claim. Existing arrival truth is not erased by a later proof rejection.</div>
                  </div>

                  <div className="space-y-3 border-t border-border/60 bg-background/65 p-5 lg:border-l lg:border-t-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">Decision</p>
                    {proof.proof_bundle?.evidence_url ? <a href={proof.proof_bundle.evidence_url} target="_blank" rel="noopener noreferrer" className="block h-32 overflow-hidden border border-border bg-muted"><img src={proof.proof_bundle.evidence_url} alt="Submitted proof evidence" className="h-full w-full object-cover" /></a> : null}
                    <ProofSubmissionAuditDialog submissionId={proof.id} triggerLabel="Open audit trail" />
                    {rejectingId === proof.id ? (
                      <div className="border border-destructive/20 bg-destructive/5 p-3">
                        <label htmlFor={`reject-${proof.id}`} className="text-[10px] font-black uppercase tracking-[0.16em] text-destructive">Rejection reason</label>
                        <Textarea id={`reject-${proof.id}`} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="mt-2 min-h-24" placeholder="Explain what did not verify…" />
                        <div className="mt-3 flex gap-2"><Button variant="outline" className="flex-1" onClick={() => { setRejectingId(null); setRejectionReason(""); }}>Cancel</Button><Button variant="destructive" className="flex-1" disabled={!rejectionReason.trim() || writingId === proof.id} onClick={() => void review(proof.id, "reject", rejectionReason.trim())}>{writingId === proof.id ? "Recording…" : "Record rejection"}</Button></div>
                      </div>
                    ) : (
                      <div className="flex gap-2"><Button className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600" disabled={writingId === proof.id} onClick={() => void review(proof.id, "approve")}><CheckCircle2 className="mr-1.5 h-4 w-4" />{writingId === proof.id ? "Recording…" : "Verify"}</Button><Button variant="ghost" className="flex-1 text-destructive hover:bg-destructive/10" disabled={writingId === proof.id} onClick={() => { setRejectingId(proof.id); setRejectionReason(""); }}><XCircle className="mr-1.5 h-4 w-4" />Reject</Button></div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <section className="border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /><h4 className="font-serif text-xl font-semibold">Decision archive</h4></div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Original submissions, decisions and rejection reasons remain inspectable after close.</p>
            <div className="mt-5 divide-y divide-border/60 border-y border-border/60">
              {history.length === 0 ? <p className="py-5 text-sm text-muted-foreground">No reviewed proof yet.</p> : history.map((proof: MomentumProofSubmission) => (
                <div key={proof.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div><p className="text-sm font-semibold text-foreground">{proof.moment?.title || "Untitled Moment"}</p><p className="mt-1 text-xs text-muted-foreground">{proof.reviewed_at ? format(new Date(proof.reviewed_at), "MMM d, h:mm a") : "Recently reviewed"}{proof.review_reason ? ` · ${proof.review_reason}` : ""}</p></div>
                  <div className="flex flex-wrap gap-2"><ProofSubmissionAuditDialog submissionId={proof.id} triggerLabel="Audit" /><Badge variant={proof.submission_state === "verified" ? "default" : "destructive"}>{proof.submission_state}</Badge>{proof.reward?.reward_value ? <Badge variant="outline">Reward: {proof.reward.reward_value}</Badge> : null}{proof.memory ? <Badge className="border border-primary/20 bg-primary/10 text-primary"><Gift className="mr-1 h-3 w-3" />{proof.memory.title}</Badge> : null}{proof.payout?.queued ? <Badge variant="outline">Payout queued</Badge> : null}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-start gap-3 border-l-2 border-primary/30 pl-4"><Scale className="mt-0.5 h-4 w-4 text-primary"/><p className="text-xs leading-5 text-muted-foreground">Approval is a verification decision. Reward issuance, memory issuance and payout queueing are downstream records and stay visibly distinct.</p></div>
          </section>
        </>
      )}
    </div>
  );
};