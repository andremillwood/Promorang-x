import { useEffect, useState } from 'react';
import { Check, X, Eye, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface VerificationRequest {
    id: string;
    user_id: string;
    document_type: string;
    document_url: string;
    created_at: string;
    user: {
        display_name: string;
        email: string;
        avatar_url: string;
    };
}

export default function AdminKYC() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/kyc/pending');
            const data = await res.json();
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedRequest) return;

        setProcessing(true);
        try {
            const res = await fetch('/api/admin/kyc/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    verificationId: selectedRequest.id,
                    action,
                    reason: actionReason
                })
            });

            if (res.ok) {
                // Remove from list
                setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
                setSelectedRequest(null);
                setActionReason('');
            } else {
                alert('Action failed');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">KYC Verification</h1>
                    <p className="text-gray-400 mt-2">Manage identity verification requests.</p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 text-sm">
                    {requests.length} Pending Requests
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                    <div className="bg-green-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                        <ShieldCheck className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white">All caught up!</h3>
                    <p className="text-gray-400 mt-2">There are no pending verification requests at this time.</p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Document Type</th>
                                <th className="px-6 py-4">Submitted At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {requests.map((req) => (
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
                                                <div className="text-sm text-gray-400">{req.user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 capitalize">{req.document_type.replace('_', ' ')}</td>
                                    <td className="px-6 py-4 text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedRequest(req)}
                                            className="text-blue-400 hover:text-blue-300 font-medium text-sm px-3 py-1.5 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Review Modal */}
            {selectedRequest && (
                <ModalBase
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    maxWidth="lg"
                >
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Review Document</h2>
                                <p className="text-sm text-gray-500">Applicant: {selectedRequest.user.display_name}</p>
                            </div>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                            <img
                                src={selectedRequest.document_url}
                                alt="Document ID"
                                className="max-h-[400px] object-contain shadow-lg rounded"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Document Type</label>
                                <p className="font-medium text-gray-900 capitalize">{selectedRequest.document_type.replace('_', ' ')}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">User Email</label>
                                <p className="font-medium text-gray-900">{selectedRequest.user.email}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rejection Reason (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. blurred image, expired document"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction('reject')}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleAction('approve')}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                                >
                                    Approve Verification
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalBase>
            )}
        </div>
    );
}
