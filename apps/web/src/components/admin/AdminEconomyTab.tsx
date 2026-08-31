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
import { useI18n } from "@/i18n/I18nContext";

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
    const { t, formatDate, formatNumber } = useI18n();
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
            toast({ title: t("gemEcon.toastMissTitle"), description: t("gemEcon.toastMissDesc"), variant: "destructive" });
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
                toast({ title: t("gemEcon.toastOkTitle"), description: `${adjustCurrency}: ${data.previous_balance} → ${data.new_balance}` });
                setAdjustUserId(""); setAdjustAmount(""); setAdjustReason("");
                fetchStats();
                fetchTransactions();
            } else {
                throw new Error(data.error);
            }
        } catch (e: any) {
            toast({ title: t("gemEcon.toastFailTitle"), description: e.message, variant: "destructive" });
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
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-red-400">{t("gemEcon.liability")}</span>
                                </div>
                                <p className="text-3xl font-black">${stats?.total_liability_usd}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    {t("gemEcon.pending", { n: stats?.pending_withdrawal_usd?.toFixed(2) ?? "0" })}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-cyan-500/20">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Gem className="w-4 h-4 text-cyan-400" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">{t("gemEcon.totalGems")}</span>
                                </div>
                                <p className="text-3xl font-black">{formatNumber(stats?.total_gems || 0)}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{t("gemEcon.rate", { n: stats?.gem_usd_rate ?? 0 })}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-amber-500/20">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Coins className="w-4 h-4 text-amber-400" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400">{t("gemEcon.totalPts")}</span>
                                </div>
                                <p className="text-3xl font-black">{formatNumber(stats?.total_points || 0)}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-purple-500/20">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <KeyRound className="w-4 h-4 text-purple-400" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-purple-400">{t("gemEcon.promoKeys")}</span>
                                </div>
                                <p className="text-3xl font-black">{formatNumber(stats?.total_promokeys || 0)}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-primary/20">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Activity className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-primary">{t("gemEcon.velocity")}</span>
                                </div>
                                <p className="text-3xl font-black">{formatNumber(stats?.transactions_24h || 0)}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">{t("gemEcon.wallets", { n: stats?.total_users_with_balance || 0 })}</p>
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
                                <CardTitle className="text-lg">{t("gemEcon.ledger")}</CardTitle>
                                <CardDescription>{t("gemEcon.ledgerCopy")}</CardDescription>
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
                                    {t("gemEcon.emptyTx")}
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
                                                    {formatDate(tx.created_at, { month: "short", day: "numeric" })}
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
                                {t("gemEcon.intervene")}
                            </CardTitle>
                            <CardDescription>{t("gemEcon.interveneCopy")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs">{t("gemEcon.userId")}</Label>
                                <Input
                                    placeholder={t("gemEcon.userPh")}
                                    value={adjustUserId}
                                    onChange={e => setAdjustUserId(e.target.value)}
                                    className="font-mono text-xs"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs">{t("gemEcon.currency")}</Label>
                                    <Select value={adjustCurrency} onValueChange={setAdjustCurrency}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gems">{t("gemEcon.gems")}</SelectItem>
                                            <SelectItem value="points">{t("gemEcon.points")}</SelectItem>
                                            <SelectItem value="promokeys">{t("gemEcon.promoKeysOpt")}</SelectItem>
                                            <SelectItem value="gold">{t("gemEcon.gold")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">{t("gemEcon.amount")}</Label>
                                    <Input
                                        type="number"
                                        placeholder={t("gemEcon.amountPh")}
                                        value={adjustAmount}
                                        onChange={e => setAdjustAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">{t("gemEcon.reason")}</Label>
                                <Input
                                    placeholder={t("gemEcon.reasonPh")}
                                    value={adjustReason}
                                    onChange={e => setAdjustReason(e.target.value)}
                                />
                            </div>
                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" />
                                    {t("gemEcon.flux")}
                                </Label>
                                <Button 
                                    variant="outline" 
                                    className="w-full h-10 text-[10px] font-black tracking-widest uppercase border-primary/30 hover:bg-primary/10 hover:border-primary"
                                    onClick={() => {
                                        setAdjustCurrency("points");
                                        setAdjustAmount("5000");
                                        setAdjustReason("Emergency Reward Flux - Safety Cap Override");
                                    }}
                                >
                                    {t("gemEcon.fluxPreset")}
                                </Button>
                            </div>
                            <Button
                                className="w-full shadow-glow"
                                onClick={handleAdjust}
                                disabled={adjusting}
                            >
                                {adjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("gemEcon.execute")}
                            </Button>
                            <p className="text-[9px] text-muted-foreground text-center">
                                {t("gemEcon.footer")}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
