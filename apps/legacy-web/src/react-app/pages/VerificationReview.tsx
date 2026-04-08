import { useEffect, useState } from 'react';
import {
    Check,
    X,
    Eye,
    Clock,
    FileCheck,
    AlertCircle,
    ExternalLink,
    Image as ImageIcon,
    MessageSquare,
    MapPin,
    Shield,
    Video as VideoIcon,
    ChevronLeft,
    ChevronRight,
    Zap
} from 'lucide-react';
import { apiFetch } from '@/react-app/utils/api';
import ModalBase from '@/react-app/components/ModalBase';

interface User {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
}

interface Drop {
    id: string;
    title: string;
    gem_reward_base: number;
    drop_role: string;
}

interface Proof {
    url: string;
    type: 'image' | 'video';
}

interface ProofSubmission {
    id: string;
    drop_id: string;
    user_id: string;
    status: string;
    proof_url: string;
    submission_text: string;
    applied_at: string;
    metadata: {
        proofs?: Proof[];
        location?: {
            latitude: number;
            longitude: number;
            accuracy: number;
        };
        ai_results?: any[];
        ai_confidence_avg?: number;
    };
    user: User;
    drop: Drop;
}

export default function VerificationReview() {
    const [submissions, setSubmissions] = useState<ProofSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<ProofSubmission | null>(null);
    const [reviewReason, setReviewReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await apiFetch('/api/drops/applications/pending');
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
            const res = await apiFetch(`/api/drops/${selectedSubmission.drop_id}/applications/${selectedSubmission.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    rejection_reason: action === 'reject' ? reviewReason : undefined
                })
            });

            if (res.ok) {
                setSubmissions(prev => prev.filter(s => s.id !== selectedSubmission.id));
                setSelectedSubmission(null);
                setReviewReason('');
                setCurrentImageIdx(0);
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

    const getProofs = (sub: ProofSubmission): Proof[] => {
        if (sub.metadata?.proofs && sub.metadata.proofs.length > 0) {
            return sub.metadata.proofs;
        }
        return sub.proof_url ? [{ url: sub.proof_url, type: 'image' }] : [];
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-pr-text-1">Verification Queue</h1>
                    <p className="text-pr-text-2 mt-1">Efficiently review user proofs and award activation credits.</p>
                </div>
                <div className="bg-pr-surface-card px-4 py-2 rounded-xl border border-pr-surface-3 text-pr-text-1 text-sm font-medium shadow-sm">
                    {submissions.length} Pending
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="bg-pr-surface-card rounded-2xl p-16 text-center border-2 border-dashed border-pr-surface-3">
                    <div className="bg-emerald-500/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
                        <FileCheck className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-pr-text-1">All Caught Up!</h3>
                    <p className="text-pr-text-2 mt-2 max-w-xs mx-auto">There are no pending proofs waiting for your review.</p>
                </div>
            ) : (
                <div className="bg-pr-surface-card rounded-2xl border border-pr-surface-3 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-pr-surface-2 text-pr-text-2 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">User</th>
                                    <th className="px-6 py-4 font-bold">Activation</th>
                                    <th className="px-6 py-4 font-bold">Evidence</th>
                                    <th className="px-6 py-4 font-bold">Confidence</th>
                                    <th className="px-6 py-4 font-bold">Submitted At</th>
                                    <th className="px-6 py-4 text-right font-bold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pr-surface-3">
                                {submissions.map((sub) => {
                                    const proofs = getProofs(sub);
                                    const hasLocation = !!sub.metadata?.location;
                                    const aiConfidence = sub.metadata?.ai_confidence_avg;

                                    return (
                                        <tr key={sub.id} className="hover:bg-pr-surface-2 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={sub.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.user.id}`}
                                                        alt="avatar"
                                                        className="w-10 h-10 rounded-full border border-pr-surface-3 shadow-sm"
                                                    />
                                                    <div>
                                                        <div className="text-pr-text-1 font-bold">{sub.user.display_name}</div>
                                                        <div className="text-xs text-pr-text-3">@{sub.user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-pr-text-1 font-medium">{sub.drop.title}</div>
                                                    <div className="text-[10px] text-pr-text-3 font-bold uppercase mt-0.5">{sub.drop.drop_role} Activation</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                                                        <ImageIcon className="w-3 h-3" /> {proofs.length} Proof{proofs.length !== 1 ? 's' : ''}
                                                    </span>
                                                    {hasLocation && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                                            <MapPin className="w-3 h-3" /> GPS Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {aiConfidence !== undefined ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-12 h-1.5 rounded-full bg-pr-surface-3 overflow-hidden">
                                                            <div
                                                                className={`h-full ${aiConfidence > 0.8 ? 'bg-emerald-500' : aiConfidence > 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                style={{ width: `${aiConfidence * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-pr-text-1">{Math.round(aiConfidence * 100)}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-pr-text-3 font-medium flex items-center gap-1">
                                                        <Zap className="w-3 h-3" /> Manual
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-pr-text-2 text-sm">
                                                {new Date(sub.applied_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSubmission(sub);
                                                        setCurrentImageIdx(0);
                                                    }}
                                                    className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-bold text-sm px-4 py-2 bg-orange-500/10 rounded-xl hover:bg-orange-500/20 transition-all shadow-sm"
                                                >
                                                    <Eye size={16} />
                                                    Explore
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Evidence Modal */}
            {selectedSubmission && (
                <ModalBase
                    isOpen={!!selectedSubmission}
                    onClose={() => {
                        setSelectedSubmission(null);
                        setCurrentImageIdx(0);
                    }}
                    maxWidth="4xl"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-5 h-[80vh] bg-pr-surface-background overflow-hidden rounded-2xl">
                        {/* Evidence Viewer (Left 3/5) */}
                        <div className="lg:col-span-3 bg-black flex flex-col relative group">
                            <div className="flex-1 flex items-center justify-center p-4">
                                {(() => {
                                    const proofs = getProofs(selectedSubmission);
                                    const proof = proofs[currentImageIdx];
                                    if (!proof) return null;

                                    if (proof.type === 'video') {
                                        return (
                                            <video
                                                controls
                                                className="max-w-full max-h-full rounded shadow-2xl"
                                                src={proof.url}
                                            />
                                        );
                                    }
                                    return (
                                        <img
                                            src={proof.url}
                                            alt="Proof"
                                            className="max-w-full max-h-full object-contain rounded shadow-2xl"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Check+Link';
                                            }}
                                        />
                                    );
                                })()}
                            </div>

                            {/* Gallery Navigation */}
                            {getProofs(selectedSubmission).length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIdx(prev => Math.max(0, prev - 1))}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIdx(prev => Math.min(getProofs(selectedSubmission).length - 1, prev + 1))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                    <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
                                        {getProofs(selectedSubmission).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIdx ? 'bg-white w-4' : 'bg-white/40'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 uppercase tracking-widest">
                                    {getProofs(selectedSubmission)[currentImageIdx]?.type || 'Proof Content'}
                                </span>
                                <a
                                    href={getProofs(selectedSubmission)[currentImageIdx]?.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-primary/80 text-white p-1.5 rounded-lg backdrop-blur-md hover:bg-primary transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        {/* Inspector Panel (Right 2/5) */}
                        <div className="lg:col-span-2 flex flex-col border-l border-pr-surface-3 bg-pr-surface-card">
                            <div className="p-6 overflow-y-auto flex-1 space-y-8">
                                {/* Header */}
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <img
                                            src={selectedSubmission.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedSubmission.user.id}`}
                                            className="w-12 h-12 rounded-full border-2 border-pr-surface-2"
                                            alt=""
                                        />
                                        <div>
                                            <h3 className="font-bold text-pr-text-1 leading-tight">{selectedSubmission.user.display_name}</h3>
                                            <p className="text-sm text-pr-text-3 leading-none mt-1">@{selectedSubmission.user.username}</p>
                                        </div>
                                    </div>
                                    <div className="bg-pr-surface-2 p-3 rounded-xl">
                                        <p className="text-[10px] font-black text-pr-text-3 uppercase tracking-tighter mb-1">Activation Target</p>
                                        <p className="text-sm font-bold text-pr-text-1 line-clamp-1">{selectedSubmission.drop.title}</p>
                                    </div>
                                </div>

                                {/* Intelligent Checks */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-pr-text-3 uppercase tracking-widest">Trust Indicators</h4>

                                    {/* AI Check */}
                                    <div className="flex items-center justify-between p-3 rounded-xl border border-pr-surface-3 bg-pr-surface-background">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-pr-text-1">AI Scan</p>
                                                <p className="text-[10px] text-pr-text-3">Pattern Match Check</p>
                                            </div>
                                        </div>
                                        {selectedSubmission.metadata?.ai_confidence_avg !== undefined ? (
                                            <div className="text-right">
                                                <p className={`text-xs font-black ${selectedSubmission.metadata.ai_confidence_avg > 0.8 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {Math.round(selectedSubmission.metadata.ai_confidence_avg * 100)}%
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-pr-text-3">PENDING</span>
                                        )}
                                    </div>

                                    {/* GPS Check */}
                                    <div className={`flex items-center justify-between p-3 rounded-xl border ${selectedSubmission.metadata?.location ? 'border-emerald-200 bg-emerald-50' : 'border-pr-surface-3 bg-pr-surface-background'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedSubmission.metadata?.location ? 'bg-emerald-100 text-emerald-600' : 'bg-pr-surface-2 text-pr-text-3'}`}>
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-pr-text-1">GPS Seal</p>
                                                <p className="text-[10px] text-pr-text-3">Device Location Check</p>
                                            </div>
                                        </div>
                                        {selectedSubmission.metadata?.location ? (
                                            <Shield className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-pr-text-3" />
                                        )}
                                    </div>
                                </div>

                                {/* User Notes */}
                                {selectedSubmission.submission_text && (
                                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
                                        <h4 className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                            <MessageSquare className="w-3 h-3" /> Submission Notes
                                        </h4>
                                        <p className="text-sm text-orange-900 leading-relaxed font-medium">
                                            "{selectedSubmission.submission_text}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="p-6 border-t border-pr-surface-3 bg-pr-surface-2">
                                <div className="mb-4">
                                    <textarea
                                        value={reviewReason}
                                        onChange={(e) => setReviewReason(e.target.value)}
                                        placeholder="Optional review notes (shared with user)..."
                                        className="w-full bg-pr-surface-background border border-pr-surface-3 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        rows={2}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        disabled={processing}
                                        onClick={() => handleAction('reject')}
                                        className="flex-1 bg-white border-2 border-red-200 text-red-500 font-black py-4 rounded-2xl hover:bg-red-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                    >
                                        REJECT
                                    </button>
                                    <button
                                        disabled={processing}
                                        onClick={() => handleAction('approve')}
                                        className="flex-[1.5] bg-emerald-500 text-white font-black py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? 'SAVING...' : 'VERIFY & PAY'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBase>
            )}
        </div>
    );
}
