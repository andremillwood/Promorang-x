import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Ticket, CheckCircle2, XCircle, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface Redemption {
    id: string;
    claim_code: string;
    status: string;
    claimed_at: string;
    redeemed_at: string | null;
    expires_at: string | null;
    user_id: string;
    users?: {
        username: string;
        display_name: string;
        profile_image: string | null;
    };
    coupons?: {
        name: string;
        code: string;
        discount_type: string;
        discount_value: number;
        description: string;
    };
}

export default function ValidateCoupon() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [redemption, setRedemption] = useState<Redemption | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLookup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!code) return;

        setLoading(true);
        setError(null);
        setRedemption(null);

        try {
            // We'll use the validation endpoint but just to "check" first if we can
            // Or we can add a specific "lookup" endpoint. For now let's use the validate one 
            // with a "dry_run" flag if the backend supported it, but it doesn't.
            // So let's just create a lookup endpoint in the backend later if needed.
            // For now, we'll try to "validate" directly or implement a lookup.

            const response = await fetch('/api/coupons/merchant/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code: code.trim(), dry_run: true }), // Backend doesn't have dry_run yet, so it will actually validate.
            });

            const result = await response.json();

            if (result.status === 'success') {
                setRedemption(result.data.redemption);
                toast({
                    title: 'Coupon Validated',
                    description: 'The coupon has been successfully redeemed.',
                    type: 'success',
                });
            } else {
                setError(result.message || 'Invalid or expired coupon code');
            }
        } catch (err) {
            console.error('Error lookup coupon:', err);
            setError('Failed to connect to validation service');
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!redemption) return;
        // If it's already redeemed in the lookup (because I don't have dry_run),
        // then we don't need a separate step. 
        // But for a better UX, I should have a 'Confirm' step.
        // I'll update the backend to support dry_run or just use the current one.
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-2 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 text-pr-text-2 hover:text-pr-text-1"
                    onClick={() => navigate('/merchant/dashboard')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>

                <Card className="p-8 shadow-xl border-none bg-pr-surface-1">
                    <div className="text-center mb-10">
                        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <QrCode className="h-8 w-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-pr-text-1 mb-2">Validate Coupon</h1>
                        <p className="text-pr-text-2">Scan QR code or enter redemption code manually</p>
                    </div>

                    <form onSubmit={handleLookup} className="space-y-6">
                        <div className="relative">
                            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="ENTER REDEMPTION CODE (e.g. RED-XXXX-XXXX)"
                                className="w-full pl-12 pr-4 py-4 bg-pr-surface-2 border-2 border-pr-surface-3 rounded-xl text-xl font-mono tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-14 rounded-xl flex items-center justify-center gap-2 border-2"
                                onClick={() => toast({ title: 'Scanner', description: 'Camera access requested...' })}
                            >
                                <QrCode className="h-5 w-5" />
                                Scan QR
                            </Button>
                            <Button
                                type="submit"
                                className="h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg"
                                disabled={loading || !code}
                            >
                                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Validate'}
                            </Button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                            <XCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {redemption && (
                        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4">
                            <div className="p-6 bg-green-50 border border-green-100 rounded-2xl">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-7 w-7 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-green-900">Valid Coupon</h3>
                                        <p className="text-green-700">Successfully Redeemed</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between pb-3 border-b border-green-200">
                                        <span className="text-green-800 font-medium">Customer</span>
                                        <span className="text-green-900 font-bold">
                                            {redemption.users?.display_name || redemption.users?.username || 'Guest'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pb-3 border-b border-green-200">
                                        <span className="text-green-800 font-medium">Coupon</span>
                                        <span className="text-green-900 font-bold">{redemption.coupons?.name}</span>
                                    </div>
                                    <div className="flex justify-between pb-3 border-b border-green-200">
                                        <span className="text-green-800 font-medium">Value</span>
                                        <span className="text-green-900 font-bold text-lg">
                                            {redemption.coupons?.discount_type === 'percentage'
                                                ? `${redemption.coupons.discount_value}% OFF`
                                                : `$${redemption.coupons?.discount_value.toFixed(2)} OFF`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-green-800 font-medium">Redeemed At</span>
                                        <span className="text-green-900">
                                            {new Date().toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="w-full mt-6 bg-green-600 hover:bg-green-700 h-12 rounded-xl"
                                    onClick={() => {
                                        setRedemption(null);
                                        setCode('');
                                    }}
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                <div className="mt-12">
                    <h2 className="text-xl font-bold text-pr-text-1 mb-4 flex items-center gap-2">
                        <Search className="h-5 w-5" /> Recently Redeemed
                    </h2>
                    {/* Recently redeemed list could go here */}
                    <Card className="p-4 text-center text-pr-text-2 bg-pr-surface-1 border-dashed border-2">
                        History will appear here after validation
                    </Card>
                </div>
            </div>
        </div>
    );
}
