import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
    ExternalLink,
    Filter,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export const AdminPayoutsTab = () => {
    const { session } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
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
            toast({ title: "Error", description: "Failed to load withdrawal requests.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
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
                toast({ title: "Updated", description: `Request ${status} successfully.` });
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

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.payout_method.method_type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || req.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-emerald-500/10 text-emerald-500 border-none gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
            case 'pending': return <Badge variant="secondary" className="gap-1 animate-pulse"><Clock className="w-3 h-3" /> Pending</Badge>;
            case 'processing': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing</Badge>;
            case 'rejected': return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by vendor email or method..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground mr-1" />
                    {['pending', 'processing', 'completed', 'rejected', 'all'].map((status) => (
                        <Button 
                            key={status}
                            variant={filterStatus === status ? "secondary" : "ghost"} 
                            size="sm"
                            className="capitalize"
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-muted-foreground">Fetching withdrawal queue...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-20 text-center bg-muted/20 border border-dashed border-border rounded-xl">
                        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">No withdrawal requests found matching your criteria.</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <Card key={req.id} className="overflow-hidden border-border/50 hover:border-primary/50 transition-all group shadow-sm">
                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
                                {/* Vendor & Amount Info */}
                                <div className="p-6 lg:w-[350px] shrink-0 bg-secondary/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                            <Landmark className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold truncate text-sm">{req.user?.email}</h4>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{req.user?.raw_user_meta_data?.full_name || "Vendor"}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Requested Amount</p>
                                            <p className="text-3xl font-black text-foreground">${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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
                                            Payout Information
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
                                            <p className="text-[10px] text-primary/60 uppercase font-bold mb-1">Internal Note</p>
                                            <p className="text-xs italic text-primary/80">{req.admin_note}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="p-6 lg:w-[250px] shrink-0 bg-secondary/5 flex flex-col justify-center gap-3">
                                    <AnimatePresence mode="wait">
                                        {isUpdating === req.id ? (
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                <p className="text-[10px] font-bold text-primary animate-pulse">Syncing platform ledger...</p>
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
                                                        Mark Processing
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
                                                            <CheckCircle2 className="w-4 h-4" /> Approve & Fulfill
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
                                                            <AlertCircle className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </>
                                                )}
                                                
                                                {req.status === 'completed' && (
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-emerald-500 font-black uppercase mb-1">Fulfilled</p>
                                                        <p className="text-[9px] text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
