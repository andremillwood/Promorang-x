import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2,
    ShieldCheck,
    FileText,
    UserX,
    CheckCircle2,
    XCircle,
    UserCheck,
    Scale,
    Eye,
    Landmark,
    MessageSquare,
    Sparkles,
    Gift
} from "lucide-react";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
}

export function AdminModerationTab() {
    const { session } = useAuth();
    const { toast } = useToast();
    const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
    const [proofs, setProofs] = useState<ProofSubmission[]>([]);
    const [momentumProofs, setMomentumProofs] = useState<MomentumProofSubmission[]>([]);
    const [momentumProofHistory, setMomentumProofHistory] = useState<MomentumProofSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState<string | null>(null);

    const headers = { Authorization: `Bearer ${session?.access_token}` };

    const fetchData = async () => {
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
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (session?.access_token) fetchData();
    }, [session]);

    const handleKYCAction = async (id: string, action: 'approve' | 'reject') => {
        setIsActioning(id);
        try {
            const reason = action === 'reject' ? prompt("Reason for rejection:") : null;
            if (action === 'reject' && !reason) return;

            const res = await fetch(`${API_URL}/api/admin/kyc/action`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ verificationId: id, action, reason })
            });

            if (res.ok) {
                toast({ title: `KYC ${action === 'approve' ? 'Approved' : 'Rejected'}` });
                fetchData();
            }
        } catch (e) { console.error(e); }
        finally { setIsActioning(null); }
    };

    const handleProofAction = async (id: string, action: 'approve' | 'reject') => {
        setIsActioning(id);
        try {
            const reason = action === 'reject' ? prompt("Reason for rejection:") : null;
            if (action === 'reject' && !reason) return;

            const res = await fetch(`${API_URL}/api/admin/proofs/${id}/review`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reason })
            });

            if (res.ok) {
                toast({ title: `Proof ${action === 'approve' ? 'Approved' : 'Rejected'}` });
                fetchData();
            }
        } catch (e) { console.error(e); }
        finally { setIsActioning(null); }
    };

    const handleMomentumProofAction = async (id: string, action: 'approve' | 'reject') => {
        setIsActioning(id);
        try {
            const reviewReason = action === 'reject' ? prompt("Reason for rejection:") : null;
            if (action === 'reject' && !reviewReason) return;

            const res = await fetch(`${API_URL}/api/proof/submissions/${id}/review`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, review_reason: reviewReason }),
            });

            const payload = await res.json();
            if (!res.ok) {
                throw new Error(payload?.error || 'Failed to review proof submission');
            }

            toast({
                title: action === 'approve' ? 'Momentum proof approved' : 'Momentum proof rejected',
                description: action === 'approve' && payload?.memory
                    ? `Memory issued: ${payload.memory.title}`
                    : undefined,
            });
            fetchData();
        } catch (e: any) {
            console.error(e);
            toast({
                title: 'Review failed',
                description: e.message || 'Could not review proof submission',
                variant: 'destructive',
            });
        }
        finally { setIsActioning(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Scale className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Moderation & Trust Center</h2>
                    <p className="text-muted-foreground text-sm">Review identity verifications and mission evidence.</p>
                </div>
            </div>

            <Tabs defaultValue="kyc" className="space-y-6">
                <div className="-mx-1 overflow-x-auto px-1 touch-pan-x snap-x-mandatory scrollbar-none">
                <TabsList className="min-w-max bg-muted/50 p-1">
                    <TabsTrigger value="kyc" className="gap-2">
                        <Landmark className="w-4 h-4" />
                        KYC Queue
                        {kycRequests.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                {kycRequests.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="proofs" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Submission Proofs
                        {proofs.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                {proofs.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="momentum-proofs" className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        Momentum Proofs
                        {momentumProofs.length > 0 && (
                            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                {momentumProofs.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="momentum-history" className="gap-2">
                        <Scale className="w-4 h-4" />
                        Momentum History
                    </TabsTrigger>
                </TabsList>
                </div>

                {/* KYC Queue */}
                <TabsContent value="kyc" className="space-y-4">
                    {isLoading ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
                        </div>
                    ) : kycRequests.length === 0 ? (
                        <div className="py-20 text-center border border-dashed rounded-2xl bg-muted/20">
                            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground">The KYC queue is empty. Good work!</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {kycRequests.map((req) => (
                                <Card key={req.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-all shadow-sm group">
                                    <div className="aspect-video relative overflow-hidden bg-muted">
                                        <img 
                                            src={req.document_url} 
                                            alt="KYC Document" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="secondary" size="sm" asChild>
                                                <a href={req.document_url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Enlarge Document
                                                </a>
                                            </Button>
                                        </div>
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-black/60 backdrop-blur-md border-none uppercase text-[9px] tracking-widest px-2 py-0.5">
                                                {req.document_type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-sm truncate">{req.user?.display_name || "Anonymous"}</CardTitle>
                                        <CardDescription className="text-[10px] truncate">{req.user?.email}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="flex flex-col gap-2 border-t border-border p-4 pt-4 sm:flex-row">
                                        <Button 
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-glow-sm" 
                                            size="sm"
                                            onClick={() => handleKYCAction(req.id, 'approve')}
                                            disabled={!!isActioning}
                                        >
                                            <UserCheck className="w-4 h-4 mr-1.5" />
                                            Approve
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            className="flex-1 text-destructive hover:bg-destructive/10" 
                                            size="sm"
                                            onClick={() => handleKYCAction(req.id, 'reject')}
                                            disabled={!!isActioning}
                                        >
                                            <UserX className="w-4 h-4 mr-1.5" />
                                            Reject
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Submission Proofs */}
                <TabsContent value="proofs" className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                        </div>
                    ) : proofs.length === 0 ? (
                        <div className="py-20 text-center border border-dashed rounded-2xl bg-muted/20">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground">No mission proofs awaiting review.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {proofs.map((proof) => (
                                <Card key={proof.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-all shadow-sm">
                                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
                                        <div className="p-6 md:w-64 shrink-0 bg-secondary/10">
                                            <Badge variant="default" className="mb-3 text-[9px] tracking-tighter shadow-glow-sm">
                                                Reward: {proof.drop?.gem_reward_base} Gems
                                            </Badge>
                                            <h4 className="font-bold text-sm leading-tight mb-2">{proof.drop?.title}</h4>
                                            <div className="text-[10px] text-muted-foreground space-y-1">
                                                <p className="font-bold text-foreground">{proof.user?.display_name}</p>
                                                <p>{proof.user?.email}</p>
                                                <p>{format(new Date(proof.applied_at), "MMM d, h:mm a")}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-6 flex-1 space-y-4">
                                            <div className="flex items-start gap-4">
                                                {proof.proof_url && (
                                                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-border shrink-0 cursor-pointer" onClick={() => window.open(proof.proof_url)}>
                                                        <img src={proof.proof_url} alt="Proof" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <h5 className="text-[10px] uppercase font-black text-primary/60 mb-1 flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" /> User Provided Evidence
                                                    </h5>
                                                    <p className="text-xs italic text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                                                        "{proof.submission_text || "No descriptive text provided."}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col justify-center gap-2 bg-secondary/5 p-6 md:w-56">
                                            <Button 
                                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" 
                                                size="sm"
                                                onClick={() => handleProofAction(proof.id, 'approve')}
                                                disabled={!!isActioning}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                Confirm Reward
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                className="w-full text-destructive hover:bg-destructive/10" 
                                                size="sm"
                                                onClick={() => handleProofAction(proof.id, 'reject')}
                                                disabled={!!isActioning}
                                            >
                                                <XCircle className="w-4 h-4 mr-1.5" />
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="momentum-proofs" className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                        </div>
                    ) : momentumProofs.length === 0 ? (
                        <div className="py-20 text-center border border-dashed rounded-2xl bg-muted/20">
                            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground">No Momentum Engine proofs are awaiting review.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {momentumProofs.map((proof) => (
                                <Card key={proof.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-all shadow-sm">
                                    <div className="flex flex-col gap-0 divide-y divide-border md:flex-row md:divide-x md:divide-y-0">
                                        <div className="bg-secondary/10 p-6 md:w-72 shrink-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant="default" className="text-[9px] tracking-tighter shadow-glow-sm">
                                                    {proof.moment?.memory_rarity || 'common'} memory
                                                </Badge>
                                                {proof.moment?.reward && (
                                                    <Badge variant="outline" className="text-[9px] tracking-tighter">
                                                        Reward: {proof.moment.reward}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h4 className="mt-3 font-bold text-sm leading-tight">
                                                {proof.moment?.title || 'Untitled Moment'}
                                            </h4>
                                            <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                                                <p><span className="font-semibold text-foreground">Moment ID:</span> {proof.moment_id}</p>
                                                <p><span className="font-semibold text-foreground">User ID:</span> {proof.user_id}</p>
                                                <p>{format(new Date(proof.created_at), "MMM d, h:mm a")}</p>
                                                {proof.moment?.venue_name && <p>{proof.moment.venue_name}</p>}
                                            </div>
                                        </div>

                                        <div className="flex-1 p-6 space-y-4">
                                            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                                                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                                    <h5 className="text-[10px] uppercase font-black text-primary/60 mb-2 flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" />
                                                        Proof Bundle
                                                    </h5>
                                                    <div className="space-y-2 text-xs text-muted-foreground">
                                                        <p><span className="font-semibold text-foreground">Code:</span> {proof.proof_bundle?.code || "None"}</p>
                                                        <p><span className="font-semibold text-foreground">Location verified:</span> {proof.proof_bundle?.location_verified ? "Yes" : "No"}</p>
                                                        {proof.proof_bundle?.submitted_at && (
                                                            <p><span className="font-semibold text-foreground">Submitted:</span> {format(new Date(proof.proof_bundle.submitted_at), "MMM d, h:mm a")}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                                    <h5 className="text-[10px] uppercase font-black text-primary/60 mb-2 flex items-center gap-1">
                                                        <Gift className="w-3 h-3" />
                                                        Expected Outcome
                                                    </h5>
                                                    <p className="text-xs text-muted-foreground">
                                                        Approval verifies the submission and automatically issues a memory for this user and moment if one does not already exist.
                                                    </p>
                                                </div>
                                            </div>

                                            {proof.proof_bundle?.evidence_url && (
                                                <div className="rounded-xl border border-border/50 bg-background p-3">
                                                    <p className="mb-2 text-[10px] uppercase font-black text-primary/60">Evidence</p>
                                                    <div
                                                        className="h-40 w-full cursor-pointer overflow-hidden rounded-lg border border-border bg-muted"
                                                        onClick={() => window.open(proof.proof_bundle?.evidence_url || "", "_blank")}
                                                    >
                                                        <img
                                                            src={proof.proof_bundle.evidence_url}
                                                            alt="Proof evidence"
                                                            className="h-full w-full object-cover hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 flex-col justify-center gap-2 bg-secondary/5 p-6 md:w-56">
                                            <Button
                                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                                                size="sm"
                                                onClick={() => handleMomentumProofAction(proof.id, 'approve')}
                                                disabled={!!isActioning}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                Verify & Mint
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full text-destructive hover:bg-destructive/10"
                                                size="sm"
                                                onClick={() => handleMomentumProofAction(proof.id, 'reject')}
                                                disabled={!!isActioning}
                                            >
                                                <XCircle className="w-4 h-4 mr-1.5" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="momentum-history" className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                        </div>
                    ) : momentumProofHistory.length === 0 ? (
                        <div className="py-20 text-center border border-dashed rounded-2xl bg-muted/20">
                            <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground">No reviewed Momentum proofs yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {momentumProofHistory.map((proof) => (
                                <Card key={proof.id} className="overflow-hidden border-border/50 shadow-sm">
                                    <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge variant={proof.submission_state === "verified" ? "default" : "destructive"}>
                                                    {proof.submission_state}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {proof.moment?.memory_rarity || "common"} memory
                                                </Badge>
                                                {proof.memory && (
                                                    <Badge className="bg-primary/10 text-primary border border-primary/20">
                                                        Minted: {proof.memory.title}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">
                                                    {proof.moment?.title || "Untitled Moment"}
                                                </h4>
                                                <div className="mt-1 space-y-1 text-[11px] text-muted-foreground">
                                                    <p>User ID: {proof.user_id}</p>
                                                    <p>Moment ID: {proof.moment_id}</p>
                                                    <p>
                                                        Reviewed {proof.reviewed_at ? format(new Date(proof.reviewed_at), "MMM d, h:mm a") : "recently"}
                                                    </p>
                                                    {proof.memory?.issued_at && (
                                                        <p>
                                                            Memory issued {format(new Date(proof.memory.issued_at), "MMM d, h:mm a")}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full max-w-md space-y-3">
                                            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                                                <p className="text-[10px] uppercase font-black text-primary/60">Proof Summary</p>
                                                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                                    <p>Code: {proof.proof_bundle?.code || "None"}</p>
                                                    <p>Location verified: {proof.proof_bundle?.location_verified ? "Yes" : "No"}</p>
                                                    {proof.proof_bundle?.submitted_at && (
                                                        <p>Submitted: {format(new Date(proof.proof_bundle.submitted_at), "MMM d, h:mm a")}</p>
                                                    )}
                                                </div>
                                            </div>
                                            {proof.review_reason && (
                                                <div className="rounded-xl border border-border/50 bg-background p-4">
                                                    <p className="text-[10px] uppercase font-black text-primary/60">Review Reason</p>
                                                    <p className="mt-2 text-xs text-muted-foreground">{proof.review_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
