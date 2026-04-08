import { useEffect, useState } from 'react';
import { Check, X, Clock, Wallet, AlertCircle, ExternalLink, DollarSign, User } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface User {
    id: string;
    display_name: string;
    email: string;
    avatar_url: string;
}

interface WithdrawalReactivation {
    id: string;
    user_id: string;
    verified_credits_amount: number;
    usd_value: number;
    payment_method: string;
    payment_details: any;
    status: string;
    created_at: string;
    notes?: string;
    user: User;
}

export default function AdminWithdrawals() {
    const [reactivations, setReactivations] = useState<WithdrawalReactivation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReactivation, setSelectedReactivation] = useState<WithdrawalReactivation | null>(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchReactivations();
    }, []);

    const fetchReactivations = async () => {
        try {
            const res = await fetch('/api/admin/withdrawals/pending');
            const data = await res.json();
            setReactivations(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch withdrawal reactivations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedReactivation) return;

        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/withdrawals/${selectedReactivation.id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    notes: adminNotes
                })
            });

            if (res.ok) {
                setReactivations(prev => prev.filter(r => r.id !== selectedReactivation.id));
                setSelectedReactivation(null);
                setAdminNotes('');
            } else {
                const error = await res.json();
                alert(`Action failed: ${error.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-white p-6">Loading withdrawal reactivations...</div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Withdrawal Management</h1>
                    <p className="text-gray-400 mt-2">Review and process Gem-to-USD withdrawal reactivations.</p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 text-sm">
                    {reactivations.length} Pending Reactivations
                </div>
            </div>

            {reactivations.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                    <div className="bg-green-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                        <Wallet className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Queue Empty</h3>
                    <p className="text-gray-400 mt-2">All withdrawal reactivations have been processed.</p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-400 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount (Verified Credits)</th>
                                    <th className="px-6 py-4">Value (USD)</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Reactivationed At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {reactivations.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={req.user.avatar_url || 'https://via.placeholder.com/32'}
                                                    alt="avatar"
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div>
                                                    <div className="text-white font-medium">{req.user.display_name}</div>
                                                    <div className="text-xs text-gray-400">{req.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{req.verified_credits_amount.toLocaleString()} 💎</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-green-400 font-bold">${req.usd_value.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium uppercase">
                                                {req.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedReactivation(req)}
                                                className="text-orange-400 hover:text-orange-300 font-medium text-sm px-4 py-2 bg-orange-400/10 rounded-lg hover:bg-orange-400/20 transition-colors"
                                            >
                                                Review Reactivation
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {selectedReactivation && (
                <ModalBase
                    isOpen={!!selectedReactivation}
                    onClose={() => setSelectedReactivation(null)}
                    maxWidth="xl"
                >
                    <div className="space-y-6">
                        <div className="flex items-start justify-between border-b pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Withdrawal Reactivation Verification</h2>
                                <p className="text-sm text-gray-500">
                                    User: <span className="font-semibold text-gray-700">{selectedReactivation.user.display_name}</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Amount Summary */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Verified Credits Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedReactivation.verified_credits_amount.toLocaleString()} 💎</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                    <p className="text-xs font-semibold text-green-600 uppercase mb-1">USD Value</p>
                                    <p className="text-2xl font-bold text-green-700">${selectedReactivation.usd_value.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Payment Information</h3>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-blue-700">Method:</span>
                                        <span className="font-bold text-blue-900 uppercase">{selectedReactivation.payment_method}</span>
                                    </div>
                                    <div className="pt-2 border-t border-blue-200">
                                        <p className="text-xs font-semibold text-blue-400 uppercase mb-1">Details</p>
                                        <pre className="text-sm text-blue-900 font-mono whitespace-pre-wrap rounded">
                                            {JSON.stringify(selectedReactivation.payment_details, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Moderation */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Moderation</h3>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                        Internal Notes / Reason
                                    </label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                                        placeholder="Optional notes for this action..."
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={processing}
                                        className="flex-1 px-4 py-3 border border-red-300 text-red-700 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction('approve')}
                                        disabled={processing}
                                        className="flex-1 px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-5 h-5" /> Approve Payout
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 text-center italic">
                                    Note: Approving will mark reactivation as completed. Manual payment processing must be handled separately.
                                </p>
                            </div>
                        </div>
                    </div>
                </ModalBase>
            )}
        </div>
    );
}
