import { useEffect, useState } from 'react';
import { Check, X, Eye, Clock, FileCheck, AlertCircle, ExternalLink, Image as ImageIcon, MessageSquare } from 'lucide-react';
import ModalBase from '@/react-app/components/ModalBase';

interface User {
    id: string;
    display_name: string;
    email: string;
    avatar_url: string;
}

interface Drop {
    id: string;
    title: string;
    gem_reward_base: number;
    drop_role: string;
}

interface ProofSubmission {
    id: string;
    drop_id: string;
    user_id: string;
    status: string;
    proof_url: string;
    submission_text: string;
    applied_at: string;
    metadata: any;
    user: User;
    drop: Drop;
}

export default function AdminProofDashboard() {
    const [submissions, setSubmissions] = useState<ProofSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<ProofSubmission | null>(null);
    const [reviewReason, setReviewReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/admin/proofs/pending');
            const data = await res.json();
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedSubmission) return;

        setProcessing(true);
        try {
            const res = await fetch(`/api/admin/proofs/${selectedSubmission.id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    reason: reviewReason
                })
            });

            if (res.ok) {
                setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission.id));
                setSelectedSubmission(null);
                setReviewReason('');
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

    if (loading) return <div className="text-white">Loading mission proofs...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Mission Proof Moderation</h1>
                    <p className="text-gray-400 mt-2">Verify receipts, order numbers, and content links.</p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 text-sm">
                    {submissions.length} Pending Verifications
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
                    <div className="bg-green-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                        <FileCheck className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white">Queue Empty</h3>
                    <p className="text-gray-400 mt-2">All mission proofs have been processed.</p>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-900/50 text-gray-400 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4">Operator</th>
                                    <th className="px-6 py-4">Mission</th>
                                    <th className="px-6 py-4">Proof Type</th>
                                    <th className="px-6 py-4">Submitted At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={sub.user.avatar_url || 'https://via.placeholder.com/32'}
                                                    alt="avatar"
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div>
                                                    <div className="text-white font-medium">{sub.user.display_name}</div>
                                                    <div className="text-xs text-gray-400">{sub.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-white font-medium">{sub.drop.title}</div>
                                                <div className="text-xs text-pr-text-muted capitalize">{sub.drop.drop_role.toLowerCase()} • {sub.drop.gem_reward_base} Verified Credits</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {sub.proof_url ? (
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium">
                                                        <ImageIcon className="w-3 h-3" /> Image/Link
                                                    </span>
                                                ) : null}
                                                {sub.submission_text ? (
                                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs font-medium">
                                                        <MessageSquare className="w-3 h-3" /> Text/Order #
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                {new Date(sub.applied_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedSubmission(sub)}
                                                className="text-orange-400 hover:text-orange-300 font-medium text-sm px-4 py-2 bg-orange-400/10 rounded-lg hover:bg-orange-400/20 transition-colors"
                                            >
                                                Review Proof
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
            {selectedSubmission && (
                <ModalBase
                    isOpen={!!selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    maxWidth="2xl"
                >
                    <div className="space-y-6">
                        <div className="flex items-start justify-between border-b pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Mission Proof Verification</h2>
                                <p className="text-sm text-gray-500">
                                    Operator: <span className="font-semibold text-gray-700">{selectedSubmission.user.display_name}</span> •
                                    Mission: <span className="font-semibold text-gray-700">{selectedSubmission.drop.title}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Evidence View */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Submission Evidence</h3>

                                {selectedSubmission.proof_url && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase">Image / Receipt</p>
                                        <div className="bg-gray-100 rounded-lg border overflow-hidden relative group">
                                            <img
                                                src={selectedSubmission.proof_url}
                                                alt="Submission Proof"
                                                className="w-full h-auto max-h-[300px] object-contain"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Load+Failed';
                                                }}
                                            />
                                            <a
                                                href={selectedSubmission.proof_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-x-0 bottom-0 bg-black/50 text-white py-2 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <ExternalLink className="w-4 h-4" /> Open Original
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {selectedSubmission.submission_text && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase">Text / Order Number</p>
                                        <div className="p-3 bg-gray-50 rounded-lg border font-mono text-sm text-gray-800 break-all">
                                            {selectedSubmission.submission_text}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Details & Actions */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Mission Details</h3>
                                    <div className="space p-4 bg-orange-50 rounded-xl border border-orange-100">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-orange-700">Role:</span>
                                            <span className="font-bold text-orange-900 capitalize">{selectedSubmission.drop.drop_role.toLowerCase()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-orange-700">Base Reward:</span>
                                            <span className="font-bold text-orange-900">{selectedSubmission.drop.gem_reward_base} Verified Credits</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Moderation</h3>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                            Review Notes (Internal/Public)
                                        </label>
                                        <textarea
                                            value={reviewReason}
                                            onChange={(e) => setReviewReason(e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                                            placeholder="Optional reason for rejection or approval note..."
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
                                            <Check className="w-5 h-5" /> Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBase>
            )}
        </div>
    );
}
