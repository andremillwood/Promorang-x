/**
 * MerchantValidate
 * 
 * P1 High: Manual coupon validation page for merchants without smartphones.
 * Staff can enter a 6-digit code to validate redemption instead of scanning QR.
 * 
 * Addresses: Low-tech merchants, busy counters, shared tablets
 */

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Gift, ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

interface ValidationResult {
    success: boolean;
    coupon?: {
        id: string;
        code: string;
        discount_type: string;
        discount_value: number;
        description?: string;
    };
    customer?: {
        name?: string;
    };
    error?: string;
}

export default function MerchantValidate() {
    const [code, setCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleCodeChange = (value: string) => {
        // Only allow alphanumeric, uppercase, max 8 chars
        const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        setCode(sanitized);
        setResult(null);
    };

    const handleValidate = async () => {
        if (code.length < 4) {
            setResult({ success: false, error: 'Code must be at least 4 characters' });
            return;
        }

        setIsValidating(true);
        setResult(null);

        try {
            const response = await apiFetch(`/api/coupons/validate/${code}`, {
                method: 'GET',
            });

            const data = await response.json();

            if (data.success && data.coupon) {
                setResult({
                    success: true,
                    coupon: data.coupon,
                    customer: data.customer,
                });
            } else {
                setResult({
                    success: false,
                    error: data.error || 'Invalid or expired code',
                });
            }
        } catch (err) {
            console.error('Validation error:', err);
            setResult({ success: false, error: 'Network error. Please try again.' });
        } finally {
            setIsValidating(false);
        }
    };

    const handleConfirmRedemption = async () => {
        if (!result?.coupon?.id) return;

        setIsConfirming(true);

        try {
            const response = await apiFetch(`/api/coupons/${result.coupon.id}/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ validation_code: code }),
            });

            const data = await response.json();

            if (data.success) {
                setResult({
                    success: true,
                    coupon: result.coupon,
                    customer: result.customer,
                });
                // Show success state for 3 seconds then reset
                setTimeout(() => {
                    setCode('');
                    setResult(null);
                }, 3000);
            } else {
                setResult({
                    success: false,
                    error: data.error || 'Failed to confirm redemption',
                });
            }
        } catch (err) {
            console.error('Redemption error:', err);
            setResult({ success: false, error: 'Network error. Please try again.' });
        } finally {
            setIsConfirming(false);
        }
    };

    const formatDiscount = (coupon: ValidationResult['coupon']) => {
        if (!coupon) return '';
        if (coupon.discount_type === 'percentage') {
            return `${coupon.discount_value}% OFF`;
        }
        return `$${coupon.discount_value} OFF`;
    };

    return (
        <div className="min-h-screen-dynamic bg-pr-surface-background">
            <div className="max-w-md mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/advertiser"
                        className="p-2 rounded-full hover:bg-pr-surface-2 text-pr-text-2 hover:text-pr-text-1 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-pr-text-1">Validate Coupon</h1>
                        <p className="text-sm text-pr-text-2">Enter the customer's code</p>
                    </div>
                </div>

                {/* Code Entry */}
                <div className="bg-pr-surface-card rounded-2xl p-6 shadow-sm border border-pr-border mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <KeyRound className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-pr-text-1">Redemption Code</h2>
                            <p className="text-xs text-pr-text-2">Ask customer for their code</p>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={code}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        placeholder="ABCD1234"
                        className="w-full text-center text-3xl font-mono tracking-widest px-4 py-4 bg-pr-input border border-pr-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-pr-text-1 uppercase"
                        maxLength={8}
                        disabled={isValidating || isConfirming}
                    />

                    <button
                        onClick={handleValidate}
                        disabled={code.length < 4 || isValidating}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                    >
                        {isValidating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <Gift className="w-5 h-5" />
                                Check Code
                            </>
                        )}
                    </button>
                </div>

                {/* Result Display */}
                {result && (
                    <div className={`rounded-2xl p-6 border ${result.success
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : 'bg-red-500/10 border-red-500/20'
                        }`}>
                        {result.success && result.coupon ? (
                            <div className="text-center">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-emerald-600 mb-2">
                                    Valid Coupon!
                                </h3>
                                <div className="bg-white dark:bg-pr-surface-2 rounded-xl p-4 mb-4">
                                    <div className="text-2xl font-bold text-emerald-600">
                                        {formatDiscount(result.coupon)}
                                    </div>
                                    {result.coupon.description && (
                                        <p className="text-sm text-pr-text-2 mt-1">
                                            {result.coupon.description}
                                        </p>
                                    )}
                                    {result.customer?.name && (
                                        <p className="text-xs text-pr-text-3 mt-2">
                                            Customer: {result.customer.name}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleConfirmRedemption}
                                    disabled={isConfirming}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
                                >
                                    {isConfirming ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Confirm Redemption
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-red-600 mb-2">
                                    Invalid Code
                                </h3>
                                <p className="text-sm text-red-600/80">
                                    {result.error}
                                </p>
                                <button
                                    onClick={() => {
                                        setCode('');
                                        setResult(null);
                                    }}
                                    className="mt-4 text-sm text-pr-text-2 hover:text-pr-text-1"
                                >
                                    Try another code
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Help text */}
                <p className="text-center text-xs text-pr-text-3 mt-6">
                    Can't find the code? Ask the customer to show their coupon in the Promorang app.
                </p>
            </div>
        </div>
    );
}
