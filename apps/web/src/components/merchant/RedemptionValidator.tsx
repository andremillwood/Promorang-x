import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, QrCode, Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Redemption {
    id: string;
    redemption_code: string;
    status: string;
    created_at: string;
    validated_at?: string;
    merchant_products: {
        name: string;
        category?: string;
    };
}

const RedemptionValidator = () => {
    const { session } = useAuth();
    const { toast } = useToast();
    const [redemptionCode, setRedemptionCode] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [recentRedemptions, setRecentRedemptions] = useState<Redemption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session?.access_token) {
            fetchRecentRedemptions();
        }
    }, [session]);

    const fetchRecentRedemptions = async () => {
        setIsLoading(true);
        try {
            const token = session?.access_token;
            console.log('[RedemptionValidator] 🔍 Fetching with token:', token ? `${token.substring(0, 20)}... (length: ${token.length})` : 'NO TOKEN');
            console.log('[RedemptionValidator] 🌐 API_URL:', API_URL);
            
            const response = await fetch(`${API_URL}/api/merchant/sales?status=validated`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorBody = await response.text();
                const recoveryHeader = response.headers.get('X-Auth-Recovery-Mode');
                const authError = response.headers.get('X-Auth-Error');
                console.error('[RedemptionValidator] ❌ Response status:', response.status);
                console.error('[RedemptionValidator] ❌ Response body:', errorBody);
                console.error('[RedemptionValidator] ❌ X-Auth-Error:', authError);
                console.error('[RedemptionValidator] ❌ X-Auth-Recovery-Mode:', recoveryHeader);
                throw new Error('Failed to fetch redemptions');
            }

            const data = await response.json();
            setRecentRedemptions(data.slice(0, 10)); // Show last 10
        } catch (error: any) {
            console.error('Error fetching redemptions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!redemptionCode.trim()) {
            toast({
                title: "Error",
                description: "Please enter a redemption code",
                variant: "destructive",
            });
            return;
        }

        setIsValidating(true);
        try {
            const response = await fetch(
                `${API_URL}/api/merchant/sales/${redemptionCode.toUpperCase()}/validate`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Validation failed');
            }

            const validatedSale = await response.json();

            toast({
                title: "✅ Redemption Validated!",
                description: `${validatedSale.merchant_products.name} has been redeemed successfully.`,
            });

            setRedemptionCode("");
            fetchRecentRedemptions();
        } catch (error: any) {
            toast({
                title: "Validation Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsValidating(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <section className="space-y-8">
            <div className="max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Welcome the arrival</p>
                <h2 className="mt-3 font-serif text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-5xl">Recognize what someone came to claim.</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">Enter the code from the guest’s Vault or receipt. Promorang will confirm whether the offer is valid before you complete the welcome.</p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b0b] text-white shadow-[0_30px_90px_rgba(0,0,0,.25)]">
                <div className="bg-[radial-gradient(circle_at_10%_0%,rgba(255,106,0,.25),transparent_40%)] p-6 sm:p-9">
                    <div className="mb-7 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-400/30 bg-orange-500/10"><QrCode className="h-5 w-5 text-orange-400" /></span><div><p className="font-serif text-2xl font-semibold">Check the guest’s code</p><p className="text-sm text-white/45">This changes the claim from waiting to completed.</p></div></div>
                    <form onSubmit={handleValidate} className="space-y-4">
                        <div>
                            <Label htmlFor="code" className="text-white/70">Claim code</Label>
                            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                                <Input
                                    id="code"
                                    value={redemptionCode}
                                    onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code (e.g., ABC12345)"
                                    className="h-14 flex-1 rounded-full border-white/15 bg-white/[0.06] px-6 font-mono text-lg tracking-[0.12em] text-white placeholder:text-white/25"
                                    maxLength={64}
                                />
                                <Button type="submit" className="h-14 rounded-full bg-orange-500 px-7 font-black text-black hover:bg-orange-400" disabled={isValidating}>
                                    {isValidating ? (
                                        "Validating..."
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4 mr-2" />
                                            Validate
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 text-sm leading-6 text-white/45">
                            Ask the guest to open the code in their Vault or receipt. Detailed claim status remains available in Commerce.
                        </div>
                    </form>
                </div>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/55">
                <div className="border-b border-border/60 p-6 sm:p-8"><p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Recently welcomed</p><h3 className="mt-3 font-serif text-3xl font-semibold">Completed claims</h3><p className="mt-2 text-sm text-muted-foreground">The ten most recent offers recognized at your venue.</p></div>
                <div className="p-6 sm:p-8">
                    {isLoading ? (
                        <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : recentRedemptions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No redemptions yet. Validated codes will appear here.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentRedemptions.map((redemption) => (
                                <article
                                    key={redemption.id}
                                    className="flex flex-col gap-4 border-b border-border/60 py-5 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="font-serif text-xl font-semibold">{redemption.merchant_products.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Code: <span className="font-mono">{redemption.redemption_code}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="default">Claim completed</Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDate(redemption.validated_at || redemption.created_at)}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RedemptionValidator;
