/**
 * BrandActivationWizard
 * 
 * Single-screen activation creation for brands.
 * Allows choosing from templates with fixed credit funding.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, Zap, Camera, ArrowRight, Share2, Target } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface BrandActivationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (campaignId: string) => void;
}

type ActivationTemplate = 'social_proof' | 'engagement' | 'referral';

const ACTIVATION_TEMPLATES = [
    {
        id: 'social_proof',
        label: 'Social Proof',
        description: 'Users post a photo/video review',
        icon: Camera,
        defaultReward: 10,
        actionType: 'proof_submission'
    },
    {
        id: 'engagement',
        label: 'Engagement',
        description: 'Users interact with your content',
        icon: Share2,
        defaultReward: 5,
        actionType: 'social_engagement'
    },
    {
        id: 'referral',
        label: 'Direct Hit',
        description: 'Users refer new customers',
        icon: Target,
        defaultReward: 25,
        actionType: 'referral'
    },
] as const;

export default function BrandActivationWizard({ isOpen, onClose, onSuccess }: BrandActivationWizardProps) {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [templateId, setTemplateId] = useState<ActivationTemplate>('social_proof');
    const [rewardAmount, setRewardAmount] = useState(10);
    const [budget, setBudget] = useState(500);

    const template = ACTIVATION_TEMPLATES.find(t => t.id === templateId)!;

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError('Please enter an activation name');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Create campaign (Activation)
            const campaignResponse = await apiFetch('/api/advertisers/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: `${template.label} Activation: ${name.trim()}`,
                    status: 'active',
                    start_date: new Date().toISOString(),
                    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                    total_gem_budget: budget,
                }),
            });

            const campaignData = await campaignResponse.json();

            if (!campaignData.success) {
                throw new Error(campaignData.error || 'Failed to create activation');
            }

            const campaignId = campaignData.campaign?.id;

            // Auto-create a Drop based on template
            if (campaignId) {
                await apiFetch('/api/drops', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        campaign_id: campaignId,
                        name: `${name.trim()} - ${template.label}`,
                        description: template.description,
                        action_type: template.actionType,
                        reward_type: 'verified_credits', // Backend still uses 'verified_credits' field for now
                        reward_amount: rewardAmount,
                        max_completions: Math.floor(budget / rewardAmount),
                        status: 'active',
                    }),
                });
            }

            onSuccess?.(campaignId);
            onClose();
            navigate(`/advertiser/campaigns/${campaignId}`);
        } catch (err) {
            console.error('Activation creation error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-pr-surface-card rounded-3xl shadow-2xl max-w-xl w-full p-8 animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-pr-surface-2 text-pr-text-2 hover:text-pr-text-1 transition-colors"
                    aria-label="Close"
                    disabled={isSubmitting}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-pr-text-1">New Activation</h2>
                            <p className="text-sm text-pr-text-2">Fund a brand campaign in seconds</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Activation Name */}
                    <div>
                        <label className="block text-sm font-bold text-pr-text-1 mb-2 uppercase tracking-wider">
                            What are we promoting?
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Summer Collection, App Launch"
                            className="w-full px-4 py-4 bg-pr-input border border-pr-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-pr-text-1"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Template Selection */}
                    <div>
                        <label className="block text-sm font-bold text-pr-text-1 mb-3 uppercase tracking-wider">
                            Choose Template
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {ACTIVATION_TEMPLATES.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => {
                                        setTemplateId(t.id as ActivationTemplate);
                                        setRewardAmount(t.defaultReward);
                                    }}
                                    disabled={isSubmitting}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${templateId === t.id
                                        ? 'border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20'
                                        : 'border-pr-border hover:border-pr-text-3'
                                        }`}
                                >
                                    <t.icon className={`w-6 h-6 mb-3 ${templateId === t.id ? 'text-blue-500' : 'text-pr-text-2'
                                        }`} />
                                    <div className={`text-sm font-bold ${templateId === t.id ? 'text-blue-600' : 'text-pr-text-1'
                                        }`}>{t.label}</div>
                                    <div className="text-[10px] text-pr-text-2 mt-1 leading-tight">{t.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reward & Budget */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-pr-text-1 mb-2 uppercase tracking-wider">
                                Credits per user
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={rewardAmount}
                                    onChange={(e) => setRewardAmount(Number(e.target.value))}
                                    className="w-full pl-4 pr-12 py-4 bg-pr-input border border-pr-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-pr-text-1"
                                    disabled={isSubmitting}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-pr-text-3">CRD</div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-pr-text-1 mb-2 uppercase tracking-wider">
                                Total Budget
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(Number(e.target.value))}
                                    className="w-full pl-4 pr-12 py-4 bg-pr-input border border-pr-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-pr-text-1"
                                    disabled={isSubmitting}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-pr-text-3">CRD</div>
                            </div>
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">Estimated Reach</span>
                            <span className="text-xl font-black text-blue-700 dark:text-blue-400">
                                {rewardAmount > 0 ? Math.floor(budget / rewardAmount).toLocaleString() : 0} Users
                            </span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400/70 leading-relaxed">
                            Based on your budget and user reward. Credits are locked into the activation once launched.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !name.trim() || rewardAmount <= 0 || budget <= 0}
                        className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Launch Activation
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
