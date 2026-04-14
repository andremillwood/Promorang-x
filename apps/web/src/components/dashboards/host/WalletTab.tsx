import React, { useState } from 'react';
import { usePayouts } from "@/hooks/usePayouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, CreditCard, DollarSign, Plus, AlertCircle, TrendingUp, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const WalletTab = () => {
    const { methods, history, loading, addPayoutMethod, requestWithdrawal } = usePayouts();
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [newMethodType, setNewMethodType] = useState("");
    const [newMethodDetails, setNewMethodDetails] = useState("");
    const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    // Mock balance for now (replace with actual from economy hook)
    const balanceUSD = 450.00; // Mock > 250 for testing UI state
    const minWithdrawal = 250.00;

    const handleAddMethod = async () => {
        await addPayoutMethod(newMethodType, { account: newMethodDetails });
        setIsAddMethodOpen(false);
        setNewMethodType("");
        setNewMethodDetails("");
    };

    const handleWithdraw = async () => {
        await requestWithdrawal(parseFloat(withdrawAmount), selectedMethod);
        setIsWithdrawOpen(false);
        setWithdrawAmount("");
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Balance Card */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                            Available Balance
                        </CardTitle>
                        <CardDescription>Earnings available for withdrawal</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold font-serif mb-4">
                            ${balanceUSD.toFixed(2)}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="hero"
                                        className="w-full"
                                        disabled={balanceUSD < minWithdrawal}
                                    >
                                        Request Withdrawal
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Request Payout</DialogTitle>
                                        <DialogDescription>
                                            Minimum withdrawal amount is ${minWithdrawal.toFixed(2)}.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Amount</Label>
                                            <Input
                                                type="number"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                                placeholder="0.00"
                                                min={minWithdrawal}
                                                max={balanceUSD}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Payout Method</Label>
                                            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {methods.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>
                                                            {m.method_type.toUpperCase()} - {JSON.stringify(m.details)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleWithdraw} disabled={!selectedMethod || parseFloat(withdrawAmount) < minWithdrawal}>
                                            Submit Request
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            {balanceUSD < minWithdrawal && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Minimum ${minWithdrawal.toFixed(2)} required
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Projected Earnings */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Projected Earnings
                            </CardTitle>
                            <CardDescription>Based on active sponsorships</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-baseline">
                                <span className="text-3xl font-black text-foreground">$1,250</span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase">Booked</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '65%' }} />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                <span className="text-primary font-bold">6/9 milestones</span> achieved for the "Deep House Yoga" series.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="bg-white/10" />

            {/* History */}
            <div>
                <h3 className="font-serif text-lg font-semibold mb-4">Transaction History</h3>

                <div className="rounded-xl border border-border/50 overflow-hidden">
                    <div className="bg-muted/50 p-3 grid grid-cols-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Method</div>
                        <div className="text-right">Status</div>
                    </div>
                    <div className="divide-y divide-border/50">
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">No transactions yet</div>
                        ) : (
                            history.map((tx) => (
                                <div key={tx.id} className="p-3 grid grid-cols-4 items-center text-sm hover:bg-muted/30 transition-colors">
                                    <div className="text-muted-foreground">
                                        {new Date(tx.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="font-medium font-mono">${tx.amount.toFixed(2)}</div>
                                    <div className="text-muted-foreground capitalize">
                                        {tx.payout_method?.method_type || 'Unknown'}
                                    </div>
                                    <div className="text-right">
                                        <Badge
                                            variant={
                                                tx.status === 'completed' ? 'default' :
                                                    tx.status === 'rejected' ? 'destructive' :
                                                        'outline'
                                            }
                                            className={
                                                tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''
                                            }
                                        >
                                            {tx.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
