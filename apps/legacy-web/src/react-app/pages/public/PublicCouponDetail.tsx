
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Clock, Store, Copy, CheckCircle, Ticket, Info } from 'lucide-react';
import advertiserService from '@/react-app/services/advertiser';
import { useAuth } from '@/react-app/hooks/useAuth';

export default function PublicCouponDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [coupon, setCoupon] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (id) fetchCoupon();
    }, [id]);

    const fetchCoupon = async () => {
        setLoading(true);
        try {
            const data = await advertiserService.getPublicCoupon(id!);
            setCoupon(data);
        } catch (error) {
            console.error('Error fetching coupon:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = () => {
        if (!user) {
            // Encode current location to redirect back after login
            navigate(`/auth?redirect=/coupons/${id}`);
            return;
        }
        // Logic for claiming (if just copying code) or unlocking
        // For this public view, we might just copy the code if available, or direct them to "Use Now"
    };

    const copyToClipboard = () => {
        // Only allow copying of code if coupon is fully public and code is visible
        // Or this action might be "Claim" which reveals code
        // For now simulation:
        navigator.clipboard.writeText(coupon?.code || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (!coupon) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold text-white mb-4">Coupon not found</h1>
                <button onClick={() => navigate('/coupons')} className="text-cyan-400 hover:text-cyan-300">Back to Coupons</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header Image / Pattern */}
            <div className="h-64 bg-gradient-to-r from-blue-900 to-purple-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

                <button
                    onClick={() => navigate('/coupons')}
                    className="absolute top-6 left-6 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-all z-10"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-20">
                <div className="bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl overflow-hidden p-8">

                    {/* Brand Header */}
                    <div className="flex items-center gap-4 mb-8">
                        {coupon.merchant_stores?.logo_url ? (
                            <img src={coupon.merchant_stores.logo_url} className="w-16 h-16 rounded-full border-2 border-gray-700 bg-gray-800 object-cover" alt="" />
                        ) : (
                            <div className="w-16 h-16 rounded-full border-2 border-gray-700 bg-gray-800 flex items-center justify-center">
                                <Store className="w-8 h-8 text-gray-500" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-gray-400 font-medium">{coupon.merchant_stores?.store_name || 'Brand Partner'}</h2>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">{coupon.title}</h1>
                        </div>
                    </div>

                    {/* Offer Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                                <h3 className="text-lg font-bold text-gray-200 flex items-center gap-2 mb-4">
                                    <Info className="w-5 h-5 text-cyan-500" />
                                    Offer Details
                                </h3>
                                <p className="text-gray-300 leading-relaxed text-lg">
                                    {coupon.description}
                                </p>

                                <div className="flex flex-wrap gap-4 mt-6">
                                    <div className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700 flex items-center gap-2 text-sm text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                                    </div>
                                    <div className="bg-gray-800 px-4 py-2 rounded-xl border border-gray-700 flex items-center gap-2 text-sm text-gray-400">
                                        <Gift className="w-4 h-4" />
                                        Value: {coupon.value} {coupon.value_unit}
                                    </div>
                                </div>
                            </div>

                            {/* Conditions if any */}
                            {coupon.conditions && (
                                <div className="space-y-2 text-gray-400 text-sm">
                                    <p className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Terms & Conditions</p>
                                    <ul className="list-disc list-inside space-y-1 pl-1">
                                        <li>Minimum purchase may apply.</li>
                                        <li>Valid until expiration date.</li>
                                        <li>Cannot be combined with other offers.</li>
                                        {/* Map actual conditions if robust structure exists */}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Action Sidebar */}
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 text-center shadow-lg">
                                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-500 mb-2">
                                    {coupon.value} {coupon.value_unit === '%' ? '%' : coupon.value_unit}
                                </div>
                                <div className="text-gray-400 font-medium mb-6 uppercase tracking-widest text-xs">Discount Offer</div>

                                {user ? (
                                    <button
                                        onClick={copyToClipboard}
                                        className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-5 h-5" />
                                                Copy Code
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleClaim}
                                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                                    >
                                        <Ticket className="w-5 h-5" />
                                        Sign In to Claim
                                    </button>
                                )}
                                <p className="text-xs text-gray-500 mt-4">
                                    {user ? 'Use this code at checkout.' : 'Join Promorang to unlock this reward.'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
