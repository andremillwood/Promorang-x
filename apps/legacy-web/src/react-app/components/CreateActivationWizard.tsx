import React, { useState, useEffect } from 'react';
import { X, Camera, Share2, Target, ArrowRight, ArrowLeft, Loader2, CheckCircle, Upload, Search, Film } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface CreateActivationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (data: { campaign_id: string; drop_id: string }) => void;
}

type ObjectiveId = 'social_proof' | 'engagement' | 'referral';

interface Objective {
    id: ObjectiveId;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    recommendedCredits: number;
}

const OBJECTIVES: Objective[] = [
    {
        id: 'social_proof',
        title: 'Social Proof',
        description: 'Users post original photos or videos tagging your brand.',
        icon: Camera,
        color: 'blue',
        recommendedCredits: 20
    },
    {
        id: 'engagement',
        title: 'Social Engagement',
        description: 'Drive likes, comments, and shares on your existing posts.',
        icon: Share2,
        color: 'emerald',
        recommendedCredits: 5
    },
    {
        id: 'referral',
        title: 'Direct Referral',
        description: 'Reward users for successful customer referrals.',
        icon: Target,
        color: 'purple',
        recommendedCredits: 50
    }
];

export default function CreateActivationWizard({ isOpen, onClose, onSuccess }: CreateActivationWizardProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [objectiveId, setObjectiveId] = useState<ObjectiveId>('social_proof');
    const [creditsPerAction, setCreditsPerAction] = useState(20);
    const [totalBudget, setTotalBudget] = useState(1000);
    const [contentSource, setContentSource] = useState<'existing' | 'upload'>('existing');
    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
    const [mediaUrl, setMediaUrl] = useState('');

    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    const currentObjective = OBJECTIVES.find(o => o.id === objectiveId)!;

    const handleNext = () => {
        if (step < totalSteps) setStep(step + 1);
        else handleSubmit();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await apiFetch('/api/activations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    objective: objectiveId,
                    credits_per_action: creditsPerAction,
                    total_budget: totalBudget,
                    content_id: selectedContentId,
                    media_url: mediaUrl
                })
            });

            const result = await response.json();
            if (result.success) {
                onSuccess?.(result.data);
                onClose();
            } else {
                setError(result.error || 'Failed to create activation');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-pr-surface-card rounded-[2.5rem] shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-pr-border animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-start border-b border-pr-border/50">
                    <div>
                        <h2 className="text-3xl font-black text-pr-text-1 tracking-tight">Create Activation</h2>
                        <p className="text-pr-text-2 font-medium">Phase {step} of {totalSteps}: {
                            step === 1 ? 'Define Objective' : step === 2 ? 'Attach Content' : 'Set Budget'
                        }</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-pr-surface-2 dark:hover:bg-pr-surface-3 transition-colors">
                        <X className="w-6 h-6 text-pr-text-2" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-8 pt-4">
                    <Progress value={progress} className="h-2 rounded-full bg-pr-surface-3" />
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Objective */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-pr-text-3 uppercase tracking-widest mb-3">Activation Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Summer Viral Challenge"
                                    className="w-full px-5 py-4 bg-pr-input border-2 border-pr-border rounded-[1.25rem] focus:border-blue-500 outline-none transition-all font-bold text-pr-text-1 text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-pr-text-3 uppercase tracking-widest mb-4">Choose Objective</label>
                                <div className="grid grid-cols-1 gap-4">
                                    {OBJECTIVES.map((obj) => (
                                        <button
                                            key={obj.id}
                                            onClick={() => {
                                                setObjectiveId(obj.id);
                                                setCreditsPerAction(obj.recommendedCredits);
                                            }}
                                            className={`flex items-start gap-5 p-6 rounded-[1.5rem] border-2 transition-all text-left group ${objectiveId === obj.id
                                                    ? 'border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10'
                                                    : 'border-pr-border hover:border-pr-border/80 bg-pr-surface-2'
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${objectiveId === obj.id ? 'bg-blue-500 shadow-xl shadow-blue-500/30' : 'bg-pr-surface-3'
                                                }`}>
                                                <obj.icon className={`w-7 h-7 ${objectiveId === obj.id ? 'text-white' : 'text-pr-text-2'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-pr-text-1 text-lg mb-1">{obj.title}</h4>
                                                <p className="text-sm text-pr-text-2 font-medium leading-relaxed">{obj.description}</p>
                                            </div>
                                            {objectiveId === obj.id && <CheckCircle className="w-6 h-6 text-blue-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Content */}
                    {step === 2 && (
                        <div className="space-y-8 text-center py-4">
                            <div className="flex justify-center mb-4">
                                <div className="p-5 bg-emerald-500/10 rounded-3xl">
                                    <Film className="w-12 h-12 text-emerald-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-pr-text-1">Attach Media Asset</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setContentSource('existing')}
                                    className={`p-6 rounded-3xl border-2 font-bold transition-all ${contentSource === 'existing' ? 'border-emerald-500 bg-emerald-500/5' : 'border-pr-border'
                                        }`}
                                >
                                    <Search className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                                    Existing Piece
                                </button>
                                <button
                                    onClick={() => setContentSource('upload')}
                                    className={`p-6 rounded-3xl border-2 font-bold transition-all ${contentSource === 'upload' ? 'border-emerald-500 bg-emerald-500/5' : 'border-pr-border'
                                        }`}
                                >
                                    <Upload className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                                    New Media Link
                                </button>
                            </div>

                            {contentSource === 'existing' ? (
                                <div className="p-10 border-2 border-dashed border-pr-border rounded-3xl bg-pr-surface-2">
                                    <p className="text-pr-text-3 font-medium mb-4 italic">Library Search Placeholder</p>
                                    <Button variant="outline" className="rounded-xl border-2">Browse Assets</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <input
                                        type="url"
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        placeholder="Paste Instagram/TikTok/YouTube URL"
                                        className="w-full px-5 py-4 bg-pr-input border-2 border-pr-border rounded-2xl outline-none font-bold"
                                    />
                                    <p className="text-xs text-pr-text-2 font-medium">We'll automatically fetch metadata and preview when possible.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Budget */}
                    {step === 3 && (
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                                <div className="relative z-10 flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-1 opacity-80">Campaign Objective</p>
                                        <h4 className="text-2xl font-black italic">{currentObjective.title}</h4>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                                        <currentObjective.icon className="w-8 h-8" />
                                    </div>
                                </div>
                                <div className="mt-8 relative z-10 text-center">
                                    <p className="text-indigo-100/70 text-sm font-bold uppercase tracking-widest mb-1">Total Impact</p>
                                    <div className="text-6xl font-black tracking-tighter">
                                        {(totalBudget / creditsPerAction).toFixed(0)} <span className="text-2xl opacity-50">Actions</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-pr-text-3 uppercase tracking-widest mb-3">Cost per Action</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={creditsPerAction}
                                            onChange={(e) => setCreditsPerAction(Number(e.target.value))}
                                            className="w-full pl-6 pr-14 py-4 bg-pr-input border-2 border-pr-border rounded-2xl font-black text-xl outline-none focus:border-indigo-500"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-pr-text-3 text-xs">CRD</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-pr-text-3 uppercase tracking-widest mb-3">Total Budget</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={totalBudget}
                                            onChange={(e) => setTotalBudget(Number(e.target.value))}
                                            className="w-full pl-6 pr-14 py-4 bg-pr-input border-2 border-pr-border rounded-2xl font-black text-xl outline-none focus:border-indigo-500"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-pr-text-3 text-xs">CRD</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-pr-surface-2 rounded-3xl border border-pr-border flex gap-4 items-center">
                                <div className="w-12 h-12 bg-pr-surface-3 rounded-full flex items-center justify-center font-black text-pr-text-2">!</div>
                                <p className="text-sm text-pr-text-2 font-medium leading-relaxed">
                                    Funds will be reserved from your <span className="text-pr-text-1 font-bold">Credit Balance</span> immediately upon launch.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-pr-border flex items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || isSubmitting}
                        className="rounded-2xl h-14 px-6 font-bold"
                    >
                        {step === 1 ? 'Cancel' : 'Go Back'}
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={isSubmitting || (step === 1 && !name)}
                        className={`rounded-2xl h-14 px-10 font-black text-lg transition-all shadow-xl ${step === totalSteps ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-pr-text-1 text-pr-surface-1'
                            }`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                {step === totalSteps ? 'Launch Activation' : 'Next Step'}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
