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
import { Coins, CreditCard, DollarSign, Plus, AlertCircle } from "lucide-react";
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

                {/* Payout Methods */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Payout Methods
                            </CardTitle>
                            <CardDescription>Manage how you get paid</CardDescription>
                        </div>
                        <Dialog open={isAddMethodOpen} onOpenChange={setIsAddMethodOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Plus className="w-4 h-4 mr-2" /> Add
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Payout Method</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={newMethodType} onValueChange={setNewMethodType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                <SelectItem value="paypal">PayPal</SelectItem>
                                                <SelectItem value="venmo">Venmo</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Account Details</Label>
                                        <Input
                                            value={newMethodDetails}
                                            onChange={(e) => setNewMethodDetails(e.target.value)}
                                            placeholder="Email, Phone, or IBAN"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddMethod} disabled={!newMethodType || !newMethodDetails}>
                                        Save Method
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {methods.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No payout methods added.</p>
                            ) : (
                                methods.map((method) => (
                                    <div key={method.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                {method.method_type === 'bank_transfer' && <CreditCard className="w-4 h-4" />}
                                                {method.method_type === 'paypal' && <span className="text-xs font-bold">PP</span>}
                                                {method.method_type === 'venmo' && <span className="text-xs font-bold">V</span>}
                                                {method.method_type === 'other' && <DollarSign className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm capitalize">{method.method_type.replace('_', ' ')}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                    {typeof method.details === 'string' ? method.details : JSON.stringify(method.details)}
                                                </p>
                                            </div>
                                        </div>
                                        {method.is_default && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
                                    </div>
                                ))
                            )}
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
