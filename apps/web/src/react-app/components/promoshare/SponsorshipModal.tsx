import React, { useState } from 'react';
import { X, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { promoShareService } from '../../services/promoshare';

interface SponsorshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    cycleId: number;
}

export function SponsorshipModal({ isOpen, onClose, cycleId }: SponsorshipModalProps) {
    const [rewardType, setRewardType] = useState('point');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await promoShareService.sponsorCycle({
                cycle_id: cycleId,
                reward_type: rewardType,
                amount: Number(amount),
                description
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to submit sponsorship');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-3">
                        <Gift size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Sponsor This Draw</h2>
                    <p className="text-gray-500 text-sm mt-1">Boost brand visibility by adding to the prize pool.</p>
                </div>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <CheckCircle size={48} className="text-green-500 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Sponsorship Submitted!</h3>
                        <p className="text-gray-500 text-center mt-2">Your contribution is pending approval.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reward Type</label>
                            <select
                                value={rewardType}
                                onChange={(e) => setRewardType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="point">Points</option>
                                <option value="gem">Gems</option>
                                <option value="coupon">Coupon</option>
                                <option value="product">Product</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount / Quantity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="e.g., 500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[80px]"
                                placeholder="e.g., Sponsored by [Brand Name] - 50% Off Coupon"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Sponsor Now'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
