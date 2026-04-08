import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2, DollarSign, TrendingUp, Gem, KeyRound, Coins,
    Search, ArrowUpRight, ArrowDownLeft, Activity, AlertTriangle,
    Zap, RefreshCw
} from "lucide-react";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface EconomyStats {
    total_points: number;
    total_gems: number;
    total_promokeys: number;
    total_gold: number;
    total_liability_usd: string;
    gem_usd_rate: number;
    total_users_with_balance: number;
    transactions_24h: number;
    pending_withdrawal_usd: number;
}

interface Transaction {
    id: string;
    user_id: string;
    currency: string;
    amount: number;
    transaction_type: string;
    source: string;
    description: string;
    created_at: string;
    profiles?: { full_name: string; email: string };
}

export function AdminEconomyTab() {
    const { session } = useAuth();
    const { toast } = useToast();
    const [stats, setStats] = useState<EconomyStats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [txLoading, setTxLoading] = useState(true);

    // Adjustment form
    const [adjustUserId, setAdjustUserId] = useState("");
    const [adjustCurrency, setAdjustCurrency] = useState("gems");
    const [adjustAmount, setAdjustAmount] = useState("");
    const [adjustReason, setAdjustReason] = useState("");
    const [adjusting, setAdjusting] = useState(false);

    const headers = { Authorization: `Bearer ${session?.access_token}` };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/economy/stats`, { headers });
            if (res.ok) setStats(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const fetchTransactions = async () => {
        setTxLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/economy/transactions?limit=30`, { headers });
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions || []);
            }
        } catch (e) { console.error(e); }
        finally { setTxLoading(false); }
    };

    useEffect(() => {
        if (session?.access_token) {
            fetchStats();
            fetchTransactions();
        }
    }, [session]);

    const handleAdjust = async () => {
        if (!adjustUserId || !adjustAmount || !adjustReason) {
            toast({ title: "Missing fields", description: "All fields are required for a balance adjustment.", variant: "destructive" });
            return;
        }
        setAdjusting(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/economy/adjust-balance`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: adjustUserId,
                    currency: adjustCurrency,
                    amount: parseFloat(adjustAmount),
                    reason: adjustReason
                })
            });
            const data = await res.json();
            if (res.ok) {
                toast({ title: "Balance Adjusted ✅", description: `${adjustCurrency}: ${data.previous_balance} → ${data.new_balance}` });
                setAdjustUserId(""); setAdjustAmount(""); setAdjustReason("");
                fetchStats();
                fetchTransactions();
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            toast({ title: "Adjustment Failed", description: e.message, variant: "destructive" });
        } finally {
            setAdjusting(false);
        }
    };

    const getCurrencyIcon = (currency: string) => {
        switch (currency) {
            case 'gems': return <Gem className="w-4 h-4 text-cyan-400" />;
            case 'points': return <Coins className="w-4 h-4 text-amber-400" />;
            case 'promokeys': return <KeyRound className="w-4 h-4 text-purple-400" />;
            case 'gold': return <Zap className="w-4 h-4 text-yellow-400" />;
            default: return <DollarSign className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-8">
            {/* Economy Scorecard */}
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
                ) : (
                    <>
                        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-red-400">Liability</span>
                                </div>
                                <p className="text-3xl font-black">${stats?.total_liability_usd}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Pending: ${stats?.pending_withdrawal_usd?.toFixed(2)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-cyan-500/20">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Gem className="w-4 h-4 text-cyan-400" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">Total Gems</span>
                                </div>
                                <p className="text-3xl font-black">{stats?.total_gems?.toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Rate: ${stats?.gem_usd_rate}/gem</p>
                            </CardContent>
                        </Card>
                        <Card className="border-amber-500/20">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Coins className="w-4 h-4 text-amber-400" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">Total Points</span>
                                </div>
                                <p className="text-3xl font-black">{stats?.total_points?.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-purple-500/20">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <KeyRound className="w-4 h-4 text-purple-400" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-purple-400">PromoKeys</span>
                                </div>
                                <p className="text-3xl font-black">{stats?.total_promokeys?.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-primary/20">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Activity className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary">24h Velocity</span>
                                </div>
                                <p className="text-3xl font-black">{stats?.transactions_24h?.toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{stats?.total_users_with_balance} wallets</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Master Ledger */}
                <div className="lg:col-span-2">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-lg">Master Ledger</CardTitle>
                                <CardDescription>Recent platform transactions</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => fetchTransactions()}>
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {txLoading ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground border border-dashed rounded-xl">
                                    No transactions recorded yet.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                    {transactions.map(tx => (
                                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                    {tx.amount >= 0 ?
                                                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" /> :
                                                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                                                    }
                                                </div>
                                                <div>
                                                    <p className="font-medium text-xs">{tx.profiles?.full_name || tx.user_id.slice(0, 8)}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                                        {tx.source} — {tx.description || tx.transaction_type}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-right">
                                                {getCurrencyIcon(tx.currency)}
                                                <span className={`font-bold text-xs ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground w-16 text-right">
                                                    {format(new Date(tx.created_at), "MMM d")}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Manual Adjustment Tool */}
                <div>
                    <Card className="border-primary/20 bg-primary/5 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                Manual Intervention
                            </CardTitle>
                            <CardDescription>Grant or deduct currency for any user.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs">User ID</Label>
                                <Input
                                    placeholder="Paste user UUID..."
                                    value={adjustUserId}
                                    onChange={e => setAdjustUserId(e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs">Currency</Label>
                                    <Select value={adjustCurrency} onValueChange={setAdjustCurrency}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gems">Gems 💎</SelectItem>
                                            <SelectItem value="points">Points 🪙</SelectItem>
                                            <SelectItem value="promokeys">PromoKeys 🔑</SelectItem>
                                            <SelectItem value="gold">Gold ⭐</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="+500 or -100"
                                        value={adjustAmount}
                                        onChange={e => setAdjustAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Reason (logged permanently)</Label>
                                <Input
                                    placeholder="e.g. Support ticket #1234"
                                    value={adjustReason}
                                    onChange={e => setAdjustReason(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full shadow-glow"
                                onClick={handleAdjust}
                                disabled={adjusting}
                            >
                                {adjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Execute Adjustment"}
                            </Button>
                            <p className="text-[9px] text-muted-foreground text-center">
                                All adjustments are permanently recorded with your admin ID.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
