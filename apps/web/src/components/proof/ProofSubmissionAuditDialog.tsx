import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock3, Gift, Loader2, ReceiptText, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

type ProofAuditEntry = {
  kind: string;
  at: string;
  title: string;
  detail?: string | null;
};

type ProofAudit = {
  submission: {
    id: string;
    submission_state: string;
    created_at: string;
    reviewed_at?: string | null;
    review_reason?: string | null;
    proof_bundle?: {
      proof_type?: string | null;
      evidence_url?: string | null;
      code?: string | null;
      location_verified?: boolean | null;
    } | null;
    moment?: {
      title?: string | null;
      venue_name?: string | null;
    } | null;
  };
  reward_count: number;
  memory_count: number;
  payout_count: number;
  timeline: ProofAuditEntry[];
};

function iconForKind(kind: string) {
  switch (kind) {
    case "proof_submission":
      return ScanSearch;
    case "proof_verified":
      return ShieldCheck;
    case "reward":
      return Gift;
    case "memory":
      return Sparkles;
    case "payout":
      return ReceiptText;
    default:
      return Clock3;
  }
}

export function ProofSubmissionAuditDialog({
  submissionId,
  triggerLabel = "View audit",
}: {
  submissionId: string;
  triggerLabel?: string;
}) {
  const { session } = useAuth();
  const { t, formatDate } = useI18n();
  const [open, setOpen] = useState(false);

  const auditQuery = useQuery({
    queryKey: ["proof-submission-audit", submissionId],
    enabled: open && !!session?.access_token && !!submissionId,
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/proof/submissions/${submissionId}/audit`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load proof audit");
      }
      return payload?.audit as ProofAudit;
    },
  });

  const audit = auditQuery.data;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("auditDlg.title")}</DialogTitle>
          <DialogDescription>
            {t("auditDlg.desc")}
          </DialogDescription>
        </DialogHeader>

        {auditQuery.isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-2xl" />
              ))}
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : auditQuery.error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {(auditQuery.error as Error).message}
          </div>
        ) : audit ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("auditDlg.submission")}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{audit.submission.moment?.title || t("auditDlg.untitled")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {audit.submission.proof_bundle?.proof_type || t("auditDlg.unknown")} • {formatDate(audit.submission.created_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("auditDlg.status")}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className={audit.submission.submission_state === "verified" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : audit.submission.submission_state === "rejected" ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-amber-500/20 bg-amber-500/10 text-amber-700"}>
                    {audit.submission.submission_state}
                  </Badge>
                </div>
                {audit.submission.review_reason ? (
                  <p className="mt-2 text-xs text-muted-foreground">{audit.submission.review_reason}</p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("auditDlg.outcomes")}</p>
                <div className="mt-2 space-y-1 text-sm text-foreground">
                  <p>{t("auditDlg.rewards", { count: audit.reward_count })}</p>
                  <p>{t("auditDlg.memories", { count: audit.memory_count })}</p>
                  <p>{t("auditDlg.payouts", { count: audit.payout_count })}</p>
                </div>
              </div>
            </div>

            {audit.submission.proof_bundle?.evidence_url ? (
              <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                <img
                  src={audit.submission.proof_bundle.evidence_url}
                  alt={t("auditDlg.evidenceAlt")}
                  className="max-h-72 w-full object-cover"
                />
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary/80">{t("auditDlg.timeline")}</p>
                <p className="text-xs text-muted-foreground">{t("auditDlg.events", { count: audit.timeline.length })}</p>
              </div>

              {audit.timeline.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                  {t("auditDlg.empty")}
                </div>
              ) : (
                <div className="space-y-3">
                  {audit.timeline.map((entry, index) => {
                    const Icon = iconForKind(entry.kind);
                    return (
                      <div key={`${entry.kind}-${entry.at}-${index}`} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="font-medium text-foreground">{entry.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(entry.at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                              </p>
                            </div>
                            {entry.detail ? (
                              <p className="mt-2 text-sm text-muted-foreground">{entry.detail}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("auditDlg.loading")}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProofSubmissionAuditDialog;
