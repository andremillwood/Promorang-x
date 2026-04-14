import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, QrCode, Search } from "lucide-react";

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
    const { user, session } = useAuth();
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
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground">Redemption Validator</h2>
                <p className="text-muted-foreground">Validate customer redemption codes</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        Validate Redemption
                    </CardTitle>
                    <CardDescription>
                        Enter the customer's redemption code to validate their purchase
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleValidate} className="space-y-4">
                        <div>
                            <Label htmlFor="code">Redemption Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="code"
                                    value={redemptionCode}
                                    onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code (e.g., ABC12345)"
                                    className="flex-1 font-mono text-lg"
                                    maxLength={8}
                                />
                                <Button type="submit" disabled={isValidating}>
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

                        <div className="text-sm text-muted-foreground">
                            <p>💡 Tip: Ask the customer to show you their redemption code from the app.</p>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Redemptions</CardTitle>
                    <CardDescription>
                        Last 10 validated redemptions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : recentRedemptions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No redemptions yet. Validated codes will appear here.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {recentRedemptions.map((redemption) => (
                                <div
                                    key={redemption.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="font-medium">{redemption.merchant_products.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Code: <span className="font-mono">{redemption.redemption_code}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="default">Validated</Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formatDate(redemption.validated_at || redemption.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RedemptionValidator;
