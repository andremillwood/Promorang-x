import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";

const PAYOUT_STATUS_LABEL: Record<string, TranslationKey> = {
    pending: "payQ.stPending",
    processing: "payQ.stProcessing",
    completed: "payQ.stCompleted",
    rejected: "payQ.stRejected",
    all: "payQ.stAll",
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    Loader2, 
    DollarSign, 
    Landmark, 
    Mail, 
    MapPin, 
    Send, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Search,
    Filter,
    ArrowDownLeft
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface WithdrawalRequest {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    admin_note: string;
    created_at: string;
    user: {
        email: string;
        raw_user_meta_data: {
            full_name?: string;
        };
    };
    payout_method: {
        method_type: string;
        details: any;
    };
}

interface MomentManualPayout {
    id: string;
    moment_id: string;
    user_id: string;
    amount_jmd: number;
    status: 'queued' | 'processing' | 'paid' | 'cancelled';
    due_at: string;
    created_at: string;
    moment?: {
        title?: string;
    };
}

export const AdminPayoutsTab = () => {
    const { t, formatDate, formatNumber } = useI18n();
    const { session } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [momentPayouts, setMomentPayouts] = useState<MomentManualPayout[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("pending");

    const fetchRequests = async () => {
        if (!session?.access_token) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/payouts/admin/requests`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests || []);
            } else {
                throw new Error("Failed to fetch requests");
            }
        } catch (error) {
            console.error("Error fetching admin requests:", error);
            toast({ title: t("payQ.toastLoad"), variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMomentPayouts = async () => {
        if (!session?.access_token) return;
        try {
            const res = await fetch(`${API_URL}/api/moment-economy/admin/payouts`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to fetch Moment payouts");
            setMomentPayouts(data.payouts || []);
        } catch (error) {
            console.error("Error fetching Moment payouts:", error);
        }
    };

    useEffect(() => {
        fetchRequests();
        fetchMomentPayouts();
    }, [session]);

    const handleUpdateStatus = async (requestId: string, status: string, note: string) => {
        setIsUpdating(requestId);
        try {
            const res = await fetch(`${API_URL}/api/payouts/admin/requests/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ status, note })
            });

            if (res.ok) {
                toast({ title: t("payQ.toastUpdated", { status }) });
                fetchRequests();
            } else {
                const err = await res.json();
                throw new Error(err.error || "Update failed");
            }
        } catch (error: any) {
            toast({ title: "Update Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUpdating(null);
        }
    };

    const handleMarkMomentPayoutPaid = async (payoutId: string) => {
        const paymentReference = prompt("Payment reference for this Moment payout:");
        if (!paymentReference) return;

        setIsUpdating(payoutId);
        try {
            const res = await fetch(`${API_URL}/api/moment-economy/admin/payouts/${payoutId}/paid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ payment_reference: paymentReference })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to mark payout paid");
            toast({ title: t("payQ.toastPaid"), description: t("payQ.toastPaidBody") });
            fetchMomentPayouts();
        } catch (error: any) {
            toast({ title: "Payout Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUpdating(null);
        }
    };

    const handleAttemptAutomatedMomentPayout = async (payoutId: string) => {
        setIsUpdating(payoutId);
        try {
            const res = await fetch(`${API_URL}/api/moment-economy/admin/payouts/${payoutId}/attempt-automated`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Automated payout failed");
            toast({
                title: data.paid ? t("payQ.toastAuto") : t("payQ.toastManual"),
                description: data.paid ? `Stripe transfer ${data.transfer?.transferId}` : data.reason,
            });
            fetchMomentPayouts();
        } catch (error: any) {
            toast({ title: "Automated Payout Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUpdating(null);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.payout_method.method_type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || req.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-500 border-none gap-1"><CheckCircle2 className="w-3 h-3" /> {t("payQ.stCompleted")}</Badge>;
            case 'pending': return <Badge variant="secondary" className="gap-1 animate-pulse"><Clock className="w-3 h-3" /> {t("payQ.stPending")}</Badge>;
            case 'processing': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none gap-1"><Loader2 className="w-3 h-3 animate-spin" /> {t("payQ.stProcessing")}</Badge>;
            case 'rejected': return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> {t("payQ.stRejected")}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-primary/20">
                <CardHeader>
                    <CardTitle>{t("payQ.momentTitle")}</CardTitle>
                    <CardDescription>{t("payQ.momentCopy")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {momentPayouts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("payQ.emptyMom")}</p>
                    ) : (
                        momentPayouts.map((payout) => (
                            <div key={payout.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-semibold">{payout.moment?.title || t("payQ.fallbackMom")}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("payQ.due", { amount: formatNumber(Number(payout.amount_jmd || 0)), when: formatDate(payout.due_at) })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{payout.status}</Badge>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={isUpdating === payout.id}
                                        onClick={() => handleAttemptAutomatedMomentPayout(payout.id)}
                                    >
                                        {t("payQ.tryStripe")}
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={isUpdating === payout.id}
                                        onClick={() => handleMarkMomentPayoutPaid(payout.id)}
                                    >
                                        {isUpdating === payout.id ? <Loader2 className="w-4 h-4 animate-spin" /> : t("payQ.markPaid")}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder={t("payQ.search")} 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="-mx-1 overflow-x-auto px-1 touch-pan-x snap-x-mandatory scrollbar-none">
                    <div className="flex min-w-max items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground mr-1 shrink-0" />
                    {['pending', 'processing', 'completed', 'rejected', 'all'].map((status) => (
                        <Button 
                            key={status}
                            variant={filterStatus === status ? "secondary" : "ghost"} 
                            size="sm"
                            className="snap-start"
                            onClick={() => setFilterStatus(status)}
                        >
                            {t(PAYOUT_STATUS_LABEL[status])}
                        </Button>
                    ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">{t("payQ.loading")}</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-20 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">{t("payQ.empty")}</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <Card key={req.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-[color,background-color,border-color,opacity,box-shadow,transform,filter] group shadow-sm">
                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
                                {/* Vendor & Amount Info */}
                                <div className="p-6 lg:w-[350px] shrink-0 bg-secondary/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                            <Landmark className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold truncate text-sm">{req.user?.email}</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{req.user?.raw_user_meta_data?.full_name || t("payQ.vendor")}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t("payQ.requested")}</p>
                                            <p className="text-3xl font-black text-foreground">${formatNumber(req.amount, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {getStatusBadge(req.status)}
                                            <Badge variant="outline" className="text-[9px] font-mono">{req.id.slice(-8)}</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Payout Details */}
                                <div className="p-6 flex-1 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
                                            <ArrowDownLeft className="w-3 h-3" />
                                            {t("payQ.info")}
                                        </h5>
                                        <Badge variant="secondary" className="capitalize">{req.payout_method.method_type.replace('_', ' ')}</Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                                        {Object.entries(req.payout_method.details).map(([key, value]) => (
                                            <div key={key}>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{key.replace('_', ' ')}</p>
                                                <p className="text-xs font-medium text-foreground line-clamp-1">{String(value)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {req.admin_note && (
                                        <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                            <p className="text-[10px] text-primary/60 uppercase font-bold mb-1">{t("payQ.note")}</p>
                                            <p className="text-xs italic text-primary/80">{req.admin_note}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-6 lg:w-[250px] shrink-0 bg-secondary/5 flex flex-col justify-center gap-3">
                                        {isUpdating === req.id ? (
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                <p className="text-[10px] font-bold text-primary animate-pulse">{t("payQ.syncing")}</p>
                                            </div>
                                        ) : (
                                            <>
                                                {req.status === 'pending' && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="w-full gap-2 hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                                                        onClick={() => handleUpdateStatus(req.id, 'processing', "Finance team has initiated processing.")}
                                                    >
                                                        {t("payQ.processing")}
                                                    </Button>
                                                )}
                                                
                                                {(req.status === 'pending' || req.status === 'processing') && (
                                                    <>
                                                        <Button 
                                                            size="sm" 
                                                            className="w-full gap-2 shadow-glow hover:bg-emerald-600 transition-colors bg-emerald-500 text-white"
                                                            onClick={() => {
                                                                const note = prompt("Optional transaction reference or note:");
                                                                handleUpdateStatus(req.id, 'completed', note || "Manual payout successfully completed.");
                                                            }}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" /> {t("payQ.approve")}
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="w-full text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                const reason = prompt("Enter rejection reason (will be visible to vendor):");
                                                                if (reason) handleUpdateStatus(req.id, 'rejected', reason);
                                                            }}
                                                        >
                                                            <AlertCircle className="w-4 h-4 mr-2" /> {t("payQ.reject")}
                                                        </Button>
                                                    </>
                                                )}
                                                
                                                {req.status === 'completed' && (
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">{t("payQ.fulfilled")}</p>
                                                        <p className="text-[9px] text-muted-foreground">{formatDate(req.created_at)}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
