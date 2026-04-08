import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, Landmark, Mail, MapPin, Send, History, CheckCircle2, AlertCircle, Clock, Plus, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

type PayoutType = 'wire_transfer' | 'paypal' | 'western_union' | 'cheque';

interface PayoutMethod {
    id: string;
    method_type: PayoutType;
    details: any;
    is_default: boolean;
    created_at: string;
}

interface WithdrawalRequest {
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    created_at: string;
    payout_method: {
        method_type: string;
    };
}

const ManualPayoutSettings = () => {
    const { user, session } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [methods, setMethods] = useState<PayoutMethod[]>([]);
    const [history, setHistory] = useState<WithdrawalRequest[]>([]);
    const [balance, setBalance] = useState({ gems: 0, usd: 0 });
    
    // Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [methodType, setMethodType] = useState<PayoutType>('wire_transfer');
    const [details, setDetails] = useState<any>({});
    const [withdrawAmount, setWithdrawAmount] = useState("");

    const fetchData = async () => {
        if (!session?.access_token) return;
        setIsLoading(true);
        try {
            const [methodsRes, historyRes, balanceRes] = await Promise.all([
                fetch(`${API_URL}/api/payouts/methods`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                }),
                fetch(`${API_URL}/api/payouts/history`, {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                }),
                fetch(`${API_URL}/api/auth-test`, { // Using auth-test to get fresh user data including balances
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                })
            ]);

            if (methodsRes.ok) {
                const data = await methodsRes.json();
                setMethods(data.methods || []);
            }
            if (historyRes.ok) {
                const data = await historyRes.json();
                setHistory(data.history || []);
            }
            if (balanceRes.ok) {
                const data = await balanceRes.json();
                // Estimate USD balance (100 Gems = $1)
                const gems = data.user?.gems_balance || 0;
                setBalance({ gems, usd: gems * 0.01 });
            }
        } catch (error) {
            console.error("Error fetching payout data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [session]);

    const handleAddMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/payouts/methods`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    type: methodType,
                    details,
                    is_default: methods.length === 0
                })
            });

            if (res.ok) {
                toast({ title: "Success", description: "Payout method added successfully." });
                setShowAddForm(false);
                setDetails({});
                fetchData();
            } else {
                const err = await res.json();
                throw new Error(err.error || "Failed to add method");
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount < 250) {
            toast({ title: "Invalid Amount", description: "Minimum withdrawal is $250.00 USD", variant: "destructive" });
            return;
        }

        const defaultMethod = methods.find(m => m.is_default) || methods[0];
        if (!defaultMethod) {
            toast({ title: "No Payout Method", description: "Please add a payout method first.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/payouts/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    amount,
                    payout_method_id: defaultMethod.id
                })
            });

            if (res.ok) {
                toast({ title: "Request Submitted", description: "Your withdrawal request is being reviewed." });
                setWithdrawAmount("");
                fetchData();
            } else {
                const err = await res.json();
                throw new Error(err.error || "Withdrawal failed");
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && methods.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading payout settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header / Summary */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="w-32 h-32 rotate-12" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Available for Payout</CardTitle>
                        <CardDescription className="text-4xl font-bold text-foreground mt-2">
                            ${balance.usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Minimum withdrawal threshold: $250.00 USD</span>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-primary/5 border-t border-primary/10 py-3">
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((balance.usd / 250) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </CardFooter>
                </Card>

                <Card className="shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Withdraw</CardTitle>
                        <CardDescription>Request funds to your default method.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    placeholder="250.00" 
                                    className="pl-9" 
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                />
                            </div>
                            <Button 
                                onClick={handleWithdraw} 
                                disabled={isSubmitting || balance.usd < 250}
                                className="shadow-glow"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request"}
                            </Button>
                        </div>
                        {balance.usd < 250 && (
                            <p className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                You need ${(250 - balance.usd).toFixed(2)} more to withdraw.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Payout Methods */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                        <Landmark className="w-6 h-6 text-primary" />
                        Payout Methods
                    </h3>
                    {!showAddForm && (
                        <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Method
                        </Button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {showAddForm ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <Card className="border-primary/30 shadow-2xl bg-secondary/30">
                                <form onSubmit={handleAddMethod}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Add New Payout Method</CardTitle>
                                        <CardDescription>Register where you'd like to receive your earnings.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Payment Type</Label>
                                            <Select value={methodType} onValueChange={(v: any) => setMethodType(v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="wire_transfer">Bank Transfer (Wire)</SelectItem>
                                                    <SelectItem value="paypal">PayPal</SelectItem>
                                                    <SelectItem value="western_union">Western Union</SelectItem>
                                                    <SelectItem value="cheque">Cheque via Mail</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Dynamic Fields */}
                                        <div className="grid gap-4 pt-2 border-t border-border/50">
                                            {methodType === 'wire_transfer' && (
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Account Holder Name</Label>
                                                        <Input required onChange={e => setDetails({...details, beneficiary: e.target.value})} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Bank Name</Label>
                                                        <Input required onChange={e => setDetails({...details, bank_name: e.target.value})} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">IBAN / Account Number</Label>
                                                        <Input required onChange={e => setDetails({...details, account_number: e.target.value})} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">SWIFT / BIC Code</Label>
                                                        <Input required onChange={e => setDetails({...details, swift_code: e.target.value})} />
                                                    </div>
                                                </div>
                                            )}

                                            {methodType === 'paypal' && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs truncate">PayPal Email Address</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input type="email" required className="pl-9" placeholder="yourname@gmail.com" onChange={e => setDetails({...details, email: e.target.value})} />
                                                    </div>
                                                </div>
                                            )}

                                            {methodType === 'western_union' && (
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Full Legal Name (as on ID)</Label>
                                                        <Input required onChange={e => setDetails({...details, full_name: e.target.value})} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Country/City</Label>
                                                        <Input required onChange={e => setDetails({...details, location: e.target.value})} />
                                                    </div>
                                                </div>
                                            )}

                                            {methodType === 'cheque' && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Full Mailing Address</Label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                        <textarea 
                                                            required 
                                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-9 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                            placeholder="123 Street Name, Apartment, City, State, ZIP, Country"
                                                            onChange={e => setDetails({...details, address: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                        <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Method"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid gap-4"
                        >
                            {methods.length === 0 ? (
                                <div className="text-center py-12 bg-muted/20 border border-dashed border-border rounded-xl">
                                    < Landmark className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                    <p className="text-muted-foreground">No payout methods saved. Add one to receive your earnings.</p>
                                </div>
                            ) : (
                                methods.map((method) => (
                                    <div key={method.id} className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                {method.method_type === 'wire_transfer' && <Landmark className="w-6 h-6" />}
                                                {method.method_type === 'paypal' && <Mail className="w-6 h-6" />}
                                                {method.method_type === 'western_union' && <Send className="w-6 h-6" />}
                                                {method.method_type === 'cheque' && <MapPin className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold capitalize">{method.method_type.replace('_', ' ')}</h4>
                                                    {method.is_default && <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Default</Badge>}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                    {method.method_type === 'paypal' ? method.details.email : 
                                                     method.method_type === 'wire_transfer' ? `${method.details.bank_name} - ${method.details.account_number.slice(-4).padStart(8, '*')}` :
                                                     method.method_type === 'cheque' ? method.details.address :
                                                     method.details.full_name || "Saved information"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                                            <Badge variant="outline" className="ml-auto md:ml-0">Stored Securely</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Withdrawal History */}
            <div className="space-y-4">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                    <History className="w-6 h-6 text-primary" />
                    Withdrawal History
                </h3>
                <Card className="border-border/50">
                    <CardContent className="p-0">
                        {history.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground italic">
                                Your withdrawal history will appear here once you request your first payout.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/30 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-bold">Date</th>
                                            <th className="px-6 py-4 text-left font-bold">Method</th>
                                            <th className="px-6 py-4 text-right font-bold">Amount</th>
                                            <th className="px-6 py-4 text-center font-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {history.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-foreground font-medium capitalize">
                                                    {tx.payout_method.method_type.replace('_', ' ')}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold">
                                                    ${tx.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        {tx.status === 'completed' && <Badge className="bg-emerald-500/10 text-emerald-500 border-none gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>}
                                                        {tx.status === 'pending' && <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>}
                                                        {tx.status === 'processing' && <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing</Badge>}
                                                        {tx.status === 'rejected' && <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> Rejected</Badge>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            {/* Safety Footer */}
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 rotate-3">
                    <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <h4 className="font-bold text-lg">Vendor Payout Security</h4>
                    <p className="text-sm text-muted-foreground">
                        Your payment information is stored in a isolated, encrypted vault. Payouts are manually reviewed and processed by our finance team every Tuesday and Friday.
                    </p>
                </div>
                <Button variant="outline" className="md:ml-auto gap-2" asChild>
                    <a href="mailto:finance@promorang.co">
                        Support <ExternalLink className="w-4 h-4" />
                    </a>
                </Button>
            </div>
        </div>
    );
};

export default ManualPayoutSettings;
