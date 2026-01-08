import { useState } from 'react';
import {
    X,
    Link as LinkIcon,
    FileText,
    Send,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import type { EventTaskType } from '@/shared/types';
import eventsService from '@/react-app/services/events';

interface TaskSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: EventTaskType;
    eventId: string;
    onSuccess: () => void;
}

export default function TaskSubmissionModal({ isOpen, onClose, task, eventId, onSuccess }: TaskSubmissionModalProps) {
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [proofText, setProofText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!submissionUrl && !proofText) {
            setError('Please provide a link or text proof of completion.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            await eventsService.submitTaskProof(eventId, task.id, {
                submission_url: submissionUrl,
                proof_text: proofText
            });

            setSubmitted(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Submission error:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit proof');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-pr-surface-card border border-pr-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-pr-border">
                    <div>
                        <h2 className="text-xl font-bold text-pr-text-1">Submit Proof</h2>
                        <p className="text-sm text-pr-text-2 mt-1">{task.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-pr-surface-2 rounded-full text-pr-text-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {submitted ? (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-pr-text-1">Submission Sent!</h3>
                        <p className="text-pr-text-2 mt-2">
                            The organizer will review your proof soon.
                            Rewards will be granted upon approval.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Task Reward Info */}
                        <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                            <Send className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-purple-500">
                                Rewards: {task.points_reward > 0 && `${task.points_reward} Points`}
                                {task.points_reward > 0 && task.gems_reward > 0 && ' + '}
                                {task.gems_reward > 0 && `${task.gems_reward} Gems`}
                            </span>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                                    <LinkIcon className="w-4 h-4 inline mr-2" />
                                    Link to Proof (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={submissionUrl}
                                    onChange={(e) => setSubmissionUrl(e.target.value)}
                                    placeholder="e.g., https://instagram.com/p/..."
                                    className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-[10px] text-pr-text-3 mt-1 px-1">
                                    Include a link to your social media post, story, or article.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Write Proof / Details (Optional)
                                </label>
                                <textarea
                                    value={proofText}
                                    onChange={(e) => setProofText(e.target.value)}
                                    rows={4}
                                    placeholder="Describe how you completed the task..."
                                    className="w-full px-4 py-3 bg-pr-surface-2 border border-pr-border rounded-xl text-pr-text-1 placeholder-pr-text-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-pr-surface-2 text-pr-text-2 rounded-xl font-medium hover:bg-pr-surface-3 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Proof'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
