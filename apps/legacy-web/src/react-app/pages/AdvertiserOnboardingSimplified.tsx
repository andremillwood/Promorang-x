import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    Sparkles,
    Gift,
    Users,
    ArrowRight,
    CheckCircle,
    Store,
    Percent,
    Package,
    Ticket
} from 'lucide-react';
import { EntryLayout } from '@/react-app/components/entry';

/**
 * Simplified Advertiser Onboarding for State 0/1 Users
 * 
 * This component provides a focused, non-overwhelming introduction
 * to the merchant/advertiser side of Promorang. It mirrors the
 * consumer experience: one clear action, educational content,
 * no complex tier comparisons or analytics promises.
 * 
 * Purpose: Let early-stage users experience the merchant side
 * with a single "Sampling Offer" before exposing them to the
 * full professional advertiser tools.
 */

export default function AdvertiserOnboardingSimplified() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStartSampling = async () => {
        if (!user) {
            navigate('/auth?redirect=/advertiser/onboarding');
            return;
        }

        setIsConverting(true);
        setError(null);

        try {
            // Convert user to advertiser type
            const response = await fetch('/api/users/become-advertiser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
                },
                body: JSON.stringify({
                    brand_name: user.display_name || user.username,
                    is_sampling_onboard: true // Flag to indicate simplified flow
                }),
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                if (data.token) {
                    localStorage.setItem('access_token', data.token);
                }

                // Navigate to sampling creation wizard
                navigate('/advertiser/sampling/create');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            console.error('Error starting sampling:', err);
            setError('Network error. Please check your connection.');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <EntryLayout showBackToStart={true}>
            <div className="flex-grow bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/10 dark:via-teal-950/10 dark:to-cyan-950/10">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500">
                    <div className="absolute inset-0 bg-black/5"></div>
                    <div className="relative z-10 px-6 py-16 md:py-20">
                        <div className="max-w-3xl mx-auto text-center text-white">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <Store className="w-8 h-8" />
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                Got a Business?
                            </h1>
                            <p className="text-xl md:text-2xl text-emerald-100 max-w-2xl mx-auto">
                                Let real people discover your brand before you spend on ads.
                                No commitment. No guesswork. Just real users interacting with your offer.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-6 py-12">

                    {/* How It Works - 3 Steps */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-center text-pr-text-1 mb-8">
                            How Sampling Works
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Step 1 */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pr-border text-center">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Gift className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div className="text-sm font-bold text-emerald-600 mb-2">Step 1</div>
                                <h3 className="font-semibold text-pr-text-1 mb-2">Describe Your Offer</h3>
                                <p className="text-sm text-pr-text-2">
                                    You choose the value. Nothing is sold. Nothing is hidden.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pr-border text-center">
                                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-6 h-6 text-teal-600" />
                                </div>
                                <div className="text-sm font-bold text-teal-600 mb-2">Step 2</div>
                                <h3 className="font-semibold text-pr-text-1 mb-2">Users Discover It</h3>
                                <p className="text-sm text-pr-text-2">
                                    Real people choose to participate. You see who engages, what they do, and what gets redeemed.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-pr-border text-center">
                                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-6 h-6 text-cyan-600" />
                                </div>
                                <div className="text-sm font-bold text-cyan-600 mb-2">Step 3</div>
                                <h3 className="font-semibold text-pr-text-1 mb-2">Decide Your Next Step</h3>
                                <p className="text-sm text-pr-text-2">
                                    After seeing how people actually respond, decide your next move—walk away, repeat, or scale.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What You Can Offer */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-pr-border mb-8">
                        <h3 className="text-lg font-semibold text-pr-text-1 mb-2 text-center">
                            What Can You Offer?
                        </h3>
                        <p className="text-sm text-pr-text-2 text-center mb-6">
                            Start with what costs you the least and teaches you the most.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col items-center p-4 bg-pr-surface-2 rounded-xl">
                                <Percent className="w-8 h-8 text-orange-500 mb-2" />
                                <span className="text-sm font-medium text-pr-text-1">Coupon</span>
                                <span className="text-xs text-pr-text-2">% off your product</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-pr-surface-2 rounded-xl">
                                <Package className="w-8 h-8 text-purple-500 mb-2" />
                                <span className="text-sm font-medium text-pr-text-1">Sample</span>
                                <span className="text-xs text-pr-text-2">Free product units</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-pr-surface-2 rounded-xl">
                                <Ticket className="w-8 h-8 text-blue-500 mb-2" />
                                <span className="text-sm font-medium text-pr-text-1">Voucher</span>
                                <span className="text-xs text-pr-text-2">Value vouchers</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-pr-surface-2 rounded-xl">
                                <Sparkles className="w-8 h-8 text-pink-500 mb-2" />
                                <span className="text-sm font-medium text-pr-text-1">Experience</span>
                                <span className="text-xs text-pr-text-2">Event or service</span>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white mb-8">
                        <h3 className="text-lg font-semibold mb-6 text-center">
                            Why Try Sampling First?
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-200 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium">No upfront cost</div>
                                    <div className="text-sm text-emerald-100">You control the cost by controlling the offer. Nothing else is charged.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-200 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium">Real user engagement</div>
                                    <div className="text-sm text-emerald-100">See who engages, what they do, and whether they redeem—before spending on reach.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-200 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium">No pressure to continue</div>
                                    <div className="text-sm text-emerald-100">If it doesn't feel right, you stop. No contracts. No penalties. No sales calls.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-200 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-medium">Limited to 20 redemptions</div>
                                    <div className="text-sm text-emerald-100">A small, contained test designed to show signal, not scale.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-pr-border text-center">
                        <h2 className="text-2xl font-bold text-pr-text-1 mb-3">
                            Ready to Try It?
                        </h2>
                        <p className="text-pr-text-2 mb-6 max-w-md mx-auto">
                            See how real users respond in under 2 minutes. No commitment required.
                        </p>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleStartSampling}
                            disabled={isConverting}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
                        >
                            {isConverting ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>Setting up...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create My Free Sampling Offer</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <p className="text-xs text-pr-text-3 mt-4">
                            Free • No credit card • Up to 20 redemptions
                        </p>
                        <p className="text-xs text-pr-text-2 mt-2 opacity-70">
                            This is how most businesses start on Promorang.
                        </p>
                    </div>

                    {/* Link to full onboarding for power users */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-pr-text-2">
                            Already confident in your demand?{' '}
                            <button
                                onClick={() => navigate('/advertiser/onboarding?full=true')}
                                className="text-emerald-600 hover:text-emerald-700 font-medium underline"
                            >
                                View Professional Plans →
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </EntryLayout>
    );
}
