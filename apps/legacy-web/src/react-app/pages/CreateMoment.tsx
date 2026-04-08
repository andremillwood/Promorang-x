import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    ArrowLeft,
    Check,
    Zap,
    ShieldCheck,
    Star,
    Sparkles,
    Users,
    Activity
} from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { apiFetch } from '@/react-app/utils/api';

const MOMENT_TIERS = [
    {
        id: 'basic',
        name: 'Moment Basic',
        price: 250,
        participants: 100,
        description: 'Perfect for small rituals and first-time hosts.',
        outcome: 'Verified participation record',
        standard: 'Standard verification',
        icon: Zap,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
    {
        id: 'pro',
        name: 'Moment Pro',
        price: 500,
        participants: 500,
        description: 'Advanced validation for agencies and product launches.',
        outcome: 'Advanced Geo & Time validation',
        standard: 'Higher certainty for sponsors',
        icon: ShieldCheck,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
    {
        id: 'premium',
        name: 'Moment Premium',
        price: 1500,
        participants: 5000,
        description: 'Professional standard for national brands.',
        outcome: 'Priority verification & White-label records',
        standard: 'Elite professional standard',
        icon: Star,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    }
];

export default function CreateMoment() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Security Check: Guard removed for simplification. Everyone can draft a moment.

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'physical_event',
        tier: 'basic',
        starts_at: '',
        ends_at: '',
    });

    const updateForm = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!user) {
            navigate('/auth?redirect=/moments/create');
            return;
        }

        if (!formData.title.trim()) {
            setError('The invitation needs a name.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await apiFetch('/api/moments', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create invitation');
            }

            const moment = await response.json();

            // Redirect to manager directly where they can see the payment requirement
            navigate(`/moments/${moment.id}/manage`);
        } catch (err) {
            console.error('Error creating moment:', err);
            setError(err instanceof Error ? err.message : 'Failed to create invitation');
        } finally {
            setLoading(false);
        }
    };

    const selectedTier = MOMENT_TIERS.find(t => t.id === formData.tier) || MOMENT_TIERS[0];

    const renderStep1 = () => (
        <div className="space-y-8">
            <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">The Vision</label>
                <div className="relative">
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => updateForm('title', e.target.value)}
                        placeholder="Name your ritual..."
                        className="w-full bg-transparent border-none text-5xl font-black italic lowercase focus:ring-0 placeholder-white/20 caret-amber-500 transition-all p-0"
                    />
                    <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent mt-2" />
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">The Narrative</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    placeholder="Tell the story of this moment..."
                    rows={4}
                    className="w-full bg-zinc-950/50 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 text-pr-text-1 focus:ring-amber-500/20 focus:border-amber-500/20 placeholder-white/20 transition-all"
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Starts at</label>
                    <div className="relative group">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="datetime-local"
                            value={formData.starts_at}
                            onChange={(e) => updateForm('starts_at', e.target.value)}
                            className="w-full bg-zinc-950/50 backdrop-blur-sm border border-white/5 rounded-full py-5 pl-14 pr-6 text-sm focus:border-amber-500/30 focus:ring-0 transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-[0.2em] text-white/40 ml-1">Ends at</label>
                    <div className="relative group">
                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                        <input
                            type="datetime-local"
                            value={formData.ends_at}
                            onChange={(e) => updateForm('ends_at', e.target.value)}
                            className="w-full bg-zinc-950/50 backdrop-blur-sm border border-white/5 rounded-full py-5 pl-14 pr-6 text-sm focus:border-amber-500/30 focus:ring-0 transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8">
            <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-white/20">Choose Your Certainty</label>
                <p className="text-sm text-white/40">Higher stakes require higher professional standards.</p>
            </div>

            <div className="grid gap-4">
                {MOMENT_TIERS.map((tier) => (
                    <button
                        key={tier.id}
                        onClick={() => updateForm('tier', tier.id)}
                        className={`text-left p-8 rounded-[3rem] border-2 transition-all relative overflow-hidden group ${formData.tier === tier.id
                            ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_40px_rgba(245,158,11,0.15)]'
                            : 'border-white/5 bg-zinc-950/50 backdrop-blur-sm hover:border-white/10'
                            }`}
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <tier.icon className={`w-5 h-5 ${tier.color}`} />
                                    <h3 className="font-black italic lowercase text-xl">{tier.name}</h3>
                                </div>
                                <p className="text-xs text-white/40 max-w-[240px] leading-relaxed">{tier.description}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black">${tier.price}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-30">Per Moment</div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3 relative z-10">
                            <div className="px-4 py-2 bg-white/5 rounded-full flex items-center gap-2">
                                <Users className="w-3 h-3 text-white/40" />
                                <span className="text-[10px] font-black text-white/60">Up to {tier.participants} guests</span>
                            </div>
                            <div className="px-4 py-2 bg-white/5 rounded-full flex items-center gap-2">
                                <Activity className="w-3 h-3 text-white/40" />
                                <span className="text-[10px] font-black text-white/60">{(tier as any).standard}</span>
                            </div>
                        </div>

                        {formData.tier === tier.id && (
                            <div className="absolute top-0 right-0 p-8 grayscale opacity-20">
                                <Sparkles className="w-24 h-24" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-10">
            <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-3xl font-black italic lowercase tracking-tight">Ready to invite the world?</h2>
                <p className="text-white/40 text-sm max-w-sm mx-auto font-medium">By launching this moment, you are creating a permanent record in the neighborhood canon.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-white/5">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Moment Selection</div>
                        <div className="font-black italic text-xl">{selectedTier.name}</div>
                    </div>
                    <div className="text-2xl font-black text-amber-500">${selectedTier.price}</div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-white/60">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Professional {(selectedTier as any).standard}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Up to {selectedTier.participants} verified guests</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Permanent Canon Entry</span>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
                <p className="text-xs text-amber-200/60 leading-relaxed text-center font-medium">
                    Payment will be requested in the Hosting Center after creation.
                    No subscription required. One-off closure fee only.
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#08060a] py-12 px-6 relative overflow-hidden">
            {/* Ambient Background Washes */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/[0.03] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.03] blur-[140px] rounded-full" />
            </div>

            <div className="max-w-xl mx-auto space-y-12 relative z-10">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/40" />
                    </button>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 rounded-full transition-all ${step === s ? 'w-8 bg-amber-500' : 'w-4 bg-white/5'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="w-12" /> {/* Spacer */}
                </header>

                <div className="space-y-12">
                    {error && (
                        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-sm font-bold text-center italic">
                            {error}
                        </div>
                    )}

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}

                    {/* Footer Nav */}
                    <div className="pt-8 flex gap-4">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white/40 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={() => (step < 3 ? setStep(step + 1) : handleSubmit())}
                            disabled={loading}
                            className={`flex-1 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl ${step === 3
                                ? 'bg-amber-500 text-[#08060a] hover:scale-105'
                                : 'bg-white text-[#08060a] hover:scale-105'
                                }`}
                        >
                            {loading ? 'Submitting...' : step < 3 ? 'Continue' : 'Launch Invitation'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
