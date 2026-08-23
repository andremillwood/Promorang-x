import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Gift,
  Landmark,
  Loader2,
  MessageSquare,
  Pencil,
  Scale,
  ShieldCheck,
  Sparkles,
  UserX,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useModerationOverview } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProofSubmissionAuditDialog } from "@/components/proof/ProofSubmissionAuditDialog";

import { EmptyState } from "@/components/ui/EmptyState";

const API_URL = import.meta.env.VITE_API_URL || "https://api.promorang.co";

interface KYCRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: string;
  created_at: string;
  user: {
    display_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface ProofSubmission {
  id: string;
  drop_id: string;
  user_id: string;
  status: string;
  proof_url: string;
  submission_text: string;
  applied_at: string;
  user: {
    display_name: string;
    email: string;
  };
  drop: {
    title: string;
    gem_reward_base: number;
  };
}

interface MomentumProofSubmission {
  id: string;
  moment_id: string;
  user_id: string;
  submission_state: string;
  proof_bundle?: {
    code?: string | null;
    evidence_url?: string | null;
    location_verified?: boolean | null;
    submitted_at?: string | null;
  } | null;
  review_reason?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  moment?: {
    id: string;
    title: string;
    reward?: string | null;
    memory_rarity?: string | null;
    venue_name?: string | null;
    category?: string | null;
  } | null;
  memory?: {
    id: string;
    title: string;
    rarity?: string | null;
    issued_at?: string | null;
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
}

function statusTone(status?: string | null) {
  switch (status) {
    case "approved":
    case "verified":
    case "completed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700";
    case "rejected":
    case "flagged":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "pending":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

export function AdminModerationTab() {
  const { session } = useAuth();
  const { toast } = useToast();
  const { data: moderationOverview, isLoading: isModerationLoading, refetch: refetchModerationOverview } = useModerationOverview();

  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [proofs, setProofs] = useState<ProofSubmission[]>([]);
  const [momentumProofs, setMomentumProofs] = useState<MomentumProofSubmission[]>([]);
  const [momentumProofHistory, setMomentumProofHistory] = useState<MomentumProofSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState<string | null>(null);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${session?.access_token || ""}`,
  }), [session?.access_token]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [kycRes, proofRes, momentumProofRes, momentumProofHistoryRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/kyc/pending`, { headers }),
        fetch(`${API_URL}/api/admin/proofs/pending`, { headers }),
        fetch(`${API_URL}/api/proof/submissions/pending`, { headers }),
        fetch(`${API_URL}/api/proof/submissions/history?limit=40`, { headers }),
      ]);

      if (kycRes.ok) setKycRequests(await kycRes.json());
      if (proofRes.ok) setProofs(await proofRes.json());
      if (momentumProofRes.ok) {
        const payload = await momentumProofRes.json();
        setMomentumProofs(payload?.submissions || []);
      }
      if (momentumProofHistoryRes.ok) {
        const payload = await momentumProofHistoryRes.json();
        setMomentumProofHistory(payload?.submissions || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (session?.access_token) {
      void fetchData();
    }
  }, [session?.access_token]);

  async function handleKYCAction(id: string, action: "approve" | "reject") {
    setIsActioning(id);
    try {
      const reason = action === "reject" ? prompt("Reason for rejection:") : null;
      if (action === "reject" && !reason) return;

      const response = await fetch(`${API_URL}/api/admin/kyc/action`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId: id, action, reason }),
      });

      if (response.ok) {
        toast({ title: `KYC ${action === "approve" ? "Approved" : "Rejected"}` });
        await fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsActioning(null);
    }
  }

  async function handleProofAction(id: string, action: "approve" | "reject") {
    setIsActioning(id);
    try {
      const reason = action === "reject" ? prompt("Reason for rejection:") : null;
      if (action === "reject" && !reason) return;

      const response = await fetch(`${API_URL}/api/admin/proofs/${id}/review`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      if (response.ok) {
        toast({ title: `Proof ${action === "approve" ? "Approved" : "Rejected"}` });
        await fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsActioning(null);
    }
  }

  async function handleMomentumProofAction(id: string, action: "approve" | "reject") {
    setIsActioning(id);
    try {
      const reviewReason = action === "reject" ? prompt("Reason for rejection:") : null;
      if (action === "reject" && !reviewReason) return;

      const response = await fetch(`${API_URL}/api/proof/submissions/${id}/review`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action, review_reason: reviewReason }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to review proof submission");
      }

      toast({
        title: action === "approve" ? "Momentum proof approved" : "Momentum proof rejected",
        description: action === "approve"
          ? payload?.payout?.queued
            ? `Payout queued: JMD ${Number(payload.payout.queue_item.amount_jmd || 0).toLocaleString()}`
            : payload?.reward?.reward_value
              ? `Reward issued: ${payload.reward.reward_value}`
              : payload?.memory
                ? `Memory issued: ${payload.memory.title}`
                : "Proof approved"
          : reviewReason || undefined,
      });

      await fetchData();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Review failed",
        description: error.message || "Could not review proof submission",
        variant: "destructive",
      });
    } finally {
      setIsActioning(null);
    }
  }

  async function handleContentAction(item: { id: string; type: "media" | "review" }, status: "approved" | "rejected" | "pending") {
    const actionKey = `${item.type}-${item.id}`;
    setIsActioning(actionKey);
    try {
      const reason = status === "rejected" ? prompt("Reason for rejection:") : null;
      if (status === "rejected" && !reason) return;

      const response = await fetch(`${API_URL}/api/admin/moderation/content/${item.type}/${item.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        throw new Error(payload?.error || "Failed to moderate content");
      }

      toast({
        title: status === "approved" ? "Content approved" : status === "rejected" ? "Content rejected" : "Content returned to pending",
        description: status === "approved" ? "This item can appear publicly where approved content is shown." : reason || undefined,
      });
      await refetchModerationOverview();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Content moderation failed",
        description: error.message || "Could not update this content item",
        variant: "destructive",
      });
    } finally {
      setIsActioning(null);
    }
  }

  const summaryCards = [
    {
      label: "Active Moments",
      value: moderationOverview?.summary.active_moments || 0,
      helper: `${moderationOverview?.summary.total_moments || 0} tracked`,
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Pending Content",
      value: moderationOverview?.summary.pending_content || 0,
      helper: `${moderationOverview?.summary.rejected_content || 0} rejected`,
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Pending Proofs",
      value: moderationOverview?.summary.pending_proofs || 0,
      helper: `${moderationOverview?.summary.total_check_ins || 0} check-ins`,
      icon: Sparkles,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "KYC Queue",
      value: kycRequests.length,
      helper: `${proofs.length} mission proofs`,
      icon: Landmark,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3.5">
        <div className="rounded-xl bg-primary/10 p-2.5 shadow-soft">
          <Scale className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Moderation & Trust Center</h2>
          <p className="text-sm text-muted-foreground font-medium">
            See what is happening across moments, content, identity, and proof.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border-border/80 bg-card shadow-soft transition-colors hover:border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</CardDescription>
                <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", card.bg)}>
                  <card.icon className={cn("h-4 w-4", card.color)} />
                </div>
              </div>
              <CardTitle className="text-3xl font-black text-foreground">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="moments" className="space-y-6">
        <div className="-mx-1 overflow-x-auto px-1 touch-pan-x snap-x-mandatory scrollbar-none">
          <TabsList className="min-w-max bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="moments" className="gap-2 rounded-lg font-semibold">
              <Calendar className="h-4 w-4" />
              Moments
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2 rounded-lg font-semibold">
              <MessageSquare className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="kyc" className="gap-2 rounded-lg font-semibold">
              <Landmark className="h-4 w-4" />
              KYC Queue
              {kycRequests.length > 0 && <Badge variant="destructive" className="ml-1">{kycRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="proofs" className="gap-2 rounded-lg font-semibold">
              <FileText className="h-4 w-4" />
              Submission Proofs
              {proofs.length > 0 && <Badge variant="destructive" className="ml-1">{proofs.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="momentum-proofs" className="gap-2 rounded-lg font-semibold">
              <Sparkles className="h-4 w-4" />
              Momentum Proofs
              {momentumProofs.length > 0 && <Badge variant="destructive" className="ml-1">{momentumProofs.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="momentum-history" className="gap-2 rounded-lg font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Momentum History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="moments" className="space-y-4">
          {isModerationLoading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-52 rounded-2xl" />
              ))}
            </div>
          ) : (moderationOverview?.moments || []).length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No tracked moments yet"
              description="Moments hosted or created across the platform will appear here for moderation and check-in tracking."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {(moderationOverview?.moments || []).map((moment) => (
                <Card key={moment.id} className="border-border/80 bg-card shadow-soft">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-xl">{moment.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {moment.location} • {format(new Date(moment.starts_at), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={statusTone(moment.status)}>
                        {moment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={moment.host.avatar_url || undefined} />
                        <AvatarFallback>{moment.host.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Hosted by {moment.host.name}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Participants</p>
                        <p className="mt-1 text-lg font-semibold">{moment.metrics.participants}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Check-ins</p>
                        <p className="mt-1 text-lg font-semibold">{moment.metrics.check_ins}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending Proofs</p>
                        <p className="mt-1 text-lg font-semibold">{moment.metrics.proofs_pending}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending Content</p>
                        <p className="mt-1 text-lg font-semibold">{moment.metrics.content_pending}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                      {moment.metrics.content_rejected > 0
                        ? `${moment.metrics.content_rejected} rejected content items need follow-through for this moment.`
                        : "No rejected content on record for this moment."}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/moments/${moment.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Moment
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link to={`/moments/${moment.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Moment
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {isModerationLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : moderationOverview?.content?.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Content queue is clear"
              description="No pending or rejected content submissions require review right now."
            />
          ) : (
            <div className="space-y-3">
              {moderationOverview.content.map((item) => (
                <div key={`${item.type}-${item.id}`} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{item.type}</Badge>
                        <Badge variant="outline" className={statusTone(item.moderation_status)}>
                          {item.moderation_status}
                        </Badge>
                        {item.type === "review" && item.is_verified_participant && (
                          <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
                            Verified participant
                          </Badge>
                        )}
                      </div>
                      <p className="mt-3 font-medium">{item.moment_title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.preview}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={item.user.avatar_url || undefined} />
                          <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{item.user.name}</span>
                      </div>
                    </div>
                    <div className="shrink-0 space-y-3 text-sm text-muted-foreground">
                      <p>{format(new Date(item.created_at), "MMM d, h:mm a")}</p>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {item.media_url && (
                          <Button asChild variant="outline" size="sm">
                            <a href={item.media_url} target="_blank" rel="noreferrer">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </a>
                          </Button>
                        )}
                        {item.moderation_status !== "approved" && (
                          <Button
                            size="sm"
                            onClick={() => handleContentAction(item, "approved")}
                            disabled={isActioning === `${item.type}-${item.id}`}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        )}
                        {item.moderation_status !== "rejected" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContentAction(item, "rejected")}
                            disabled={isActioning === `${item.type}-${item.id}`}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        )}
                        {item.moderation_status !== "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContentAction(item, "pending")}
                            disabled={isActioning === `${item.type}-${item.id}`}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-80 rounded-2xl" />)}
            </div>
          ) : kycRequests.length === 0 ? (
            <EmptyState
              icon={Landmark}
              title="KYC verification queue is clear"
              description="All user identity verification requests have been processed."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {kycRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted">
                    <img src={request.document_url} alt="KYC document" className="h-full w-full object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{request.user.display_name || request.user.email}</CardTitle>
                    <CardDescription>{request.document_type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{request.user.email}</p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleKYCAction(request.id, "approve")}
                        disabled={isActioning === request.id}
                      >
                        {isActioning === request.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleKYCAction(request.id, "reject")}
                        disabled={isActioning === request.id}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="proofs" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-64 rounded-2xl" />)}
            </div>
          ) : proofs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No mission proofs pending"
              description="Participant proof submissions will show up here as missions are completed."
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {proofs.map((proof) => (
                <Card key={proof.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{proof.drop.title}</CardTitle>
                    <CardDescription>{proof.user.display_name || proof.user.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="overflow-hidden rounded-xl bg-muted">
                      <img src={proof.proof_url} alt="Proof" className="h-64 w-full object-cover" />
                    </div>
                    <p className="text-sm text-muted-foreground">{proof.submission_text || "No submission text"}</p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleProofAction(proof.id, "approve")}
                        disabled={isActioning === proof.id}
                      >
                        <Gift className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleProofAction(proof.id, "reject")}
                        disabled={isActioning === proof.id}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="momentum-proofs" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-2xl" />)}
            </div>
          ) : momentumProofs.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No momentum proofs in queue"
              description="Proof-of-attendance and check-in verification records will be listed here."
            />
          ) : (
            <div className="space-y-3">
              {momentumProofs.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{submission.moment?.title || "Untitled moment"}</CardTitle>
                        <CardDescription>{submission.moment?.venue_name || submission.moment?.category || "Moment proof"}</CardDescription>
                      </div>
                      <Badge variant="outline" className={statusTone(submission.submission_state)}>
                        {submission.submission_state}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-lg border border-border p-3 text-sm">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Code</p>
                        <p className="mt-1">{submission.proof_bundle?.code || "—"}</p>
                      </div>
                      <div className="rounded-lg border border-border p-3 text-sm">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Location Verified</p>
                        <p className="mt-1">{submission.proof_bundle?.location_verified ? "Yes" : "No"}</p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                      Approval verifies attendance, issues any configured reward, queues payout where applicable, and records proof-linked piece outcomes.
                    </div>
                    <div className="flex gap-2">
                      <ProofSubmissionAuditDialog submissionId={submission.id} />
                      <Button
                        className="flex-1"
                        onClick={() => handleMomentumProofAction(submission.id, "approve")}
                        disabled={isActioning === submission.id}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleMomentumProofAction(submission.id, "reject")}
                        disabled={isActioning === submission.id}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="momentum-history" className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)
          ) : momentumProofHistory.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No reviewed proof submissions"
              description="Reviewed momentum and check-in proof history will appear here."
            />
          ) : (
            momentumProofHistory.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium">{submission.moment?.title || "Untitled moment"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reviewed {submission.reviewed_at ? format(new Date(submission.reviewed_at), "MMM d, h:mm a") : format(new Date(submission.created_at), "MMM d, h:mm a")}
                    </p>
                    {submission.review_reason && (
                      <p className="mt-2 text-sm text-muted-foreground">{submission.review_reason}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <ProofSubmissionAuditDialog submissionId={submission.id} />
                    {submission.reward?.reward_value && (
                      <Badge variant="outline">
                        Reward: {submission.reward.reward_value}
                      </Badge>
                    )}
                    {submission.memory?.title && (
                      <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        {submission.memory.title}
                      </Badge>
                    )}
                    {submission.payout?.queued && (
                      <Badge variant="outline">Payout queued</Badge>
                    )}
                    <Badge variant="outline" className={statusTone(submission.submission_state)}>
                      {submission.submission_state}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
