import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    Gift,
    Package,
    Ticket,
    Sparkles,
    Percent,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { apiFetch } from '../utils/api';

/**
 * Sampling Creation Wizard
 * 
 * A step-by-step wizard for merchants in the NEW state to create
 * their first sampling activation. This is the simplified,
 * non-overwhelming path for early-stage users transitioning
 * from consumer to business mode.
 */

type ValueType = 'coupon' | 'product' | 'voucher' | 'experience';
type Surface = 'deals' | 'events' | 'post';

interface SamplingFormData {
    name: string;
    description: string;
    value_type: ValueType;
    value_amount: number;
    value_unit: string;
    max_redemptions: number;
    duration_days: number;
    surfaces: Surface[];
}

const VALUE_TYPES = [
    { id: 'coupon', label: 'Coupon', icon: Percent, description: 'Percentage or fixed discount', color: 'orange' },
    { id: 'product', label: 'Product Sample', icon: Package, description: 'Free product units', color: 'purple' },
    { id: 'voucher', label: 'Voucher', icon: Ticket, description: 'Store credit or gift card', color: 'blue' },
    { id: 'experience', label: 'Experience', icon: Sparkles, description: 'Event, service, or trial', color: 'pink' },
] as const;

const SURFACES = [
    { id: 'deals', label: 'Deals Page', description: 'Shown in the daily deals section' },
    { id: 'events', label: 'Events', description: 'Featured in local events' },
    { id: 'post', label: 'Post Proof', description: 'Available for user-generated content' },
] as const;

export default function SamplingCreateWizard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<SamplingFormData>({
        name: '',
        description: '',
        value_type: 'coupon',
        value_amount: 0,
        value_unit: 'percent',
        max_redemptions: 20,
        duration_days: 7,
        surfaces: ['deals'],
    });

    // Handle pre-filled product data from navigation state
    useEffect(() => {
        const state = location.state as { productId?: string; productName?: string } | null;
        if (state?.productId && state?.productName) {
            setFormData(prev => ({
                ...prev,
                name: `Try ${state.productName} for Free`,
                description: `Get a free sample of our ${state.productName}. Limited time offer!`,
                value_type: 'product',
                value_unit: 'units',
                value_amount: 1, // Default to 1 unit sample
            }));
        }
    }, [location.state]);

    const totalSteps = 4;

    const updateField = <K extends keyof SamplingFormData>(field: K, value: SamplingFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleSurface = (surface: Surface) => {
        setFormData(prev => ({
            ...prev,
            surfaces: prev.surfaces.includes(surface)
                ? prev.surfaces.filter(s => s !== surface)
                : [...prev.surfaces, surface]
        }));
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.value_type && formData.value_amount > 0;
            case 2:
                return formData.name.trim().length > 0;
            case 3:
                return formData.surfaces.length > 0;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        if (!user) {
            navigate('/auth?redirect=/advertiser/sampling/create');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await apiFetch('/api/merchant-sampling/activation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    value_type: formData.value_type,
                    value_amount: formData.value_amount,
                    value_unit: formData.value_unit,
                    max_redemptions: formData.max_redemptions,
                    duration_days: formData.duration_days,
                    include_in_deals: formData.surfaces.includes('deals'),
                    include_in_events: formData.surfaces.includes('events'),
                    include_in_post_proof: formData.surfaces.includes('post'),
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to advertiser dashboard with success state
                navigate('/advertiser?sampling=created');
            } else {
                setError(data.error || 'Failed to create sampling offer. Please try again.');
            }
        } catch (err) {
            console.error('Error creating sampling:', err);
            setError('Network error. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getValueTypeColor = (type: string) => {
        switch (type) {
            case 'coupon': return 'orange';
            case 'product': return 'purple';
            case 'voucher': return 'blue';
            case 'experience': return 'pink';
            default: return 'gray';
        }
    };

    return (
        <div className="min-h-screen-dynamic bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <div className="max-w-2xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <Gift className="w-7 h-7 text-emerald-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-pr-text-1 mb-2">Create Your Sampling Offer</h1>
                    <p className="text-pr-text-2">Step {step} of {totalSteps}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex gap-2">
                        {Array.from({ length: totalSteps }, (_, i) => (
                            <div
                                key={i}
                                className={`flex-1 h-2 rounded-full transition-colors ${i + 1 <= step ? 'bg-emerald-500' : 'bg-emerald-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-pr-border p-8 mb-6">
                    {/* Step 1: What are you offering? */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-pr-text-1 mb-2">What are you offering?</h2>
                                <p className="text-pr-text-2">Choose the type of value you want to share with users.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {VALUE_TYPES.map(({ id, label, icon: Icon, description, color }) => (
                                    <button
                                        key={id}
                                        onClick={() => updateField('value_type', id as ValueType)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.value_type === id
                                            ? `border-${color}-500 bg-${color}-50`
                                            : 'border-pr-border hover:border-pr-text-3'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 mb-2 text-${color}-500`} />
                                        <div className="font-semibold text-pr-text-1">{label}</div>
                                        <div className="text-xs text-pr-text-2">{description}</div>
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                                    Value Amount
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        value={formData.value_amount || ''}
                                        onChange={(e) => updateField('value_amount', parseFloat(e.target.value) || 0)}
                                        className="flex-1 px-4 py-3 border border-pr-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder={formData.value_type === 'coupon' ? 'e.g., 20' : 'e.g., 10'}
                                    />
                                    <select
                                        value={formData.value_unit}
                                        onChange={(e) => updateField('value_unit', e.target.value)}
                                        className="px-4 py-3 border border-pr-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        {formData.value_type === 'coupon' && (
                                            <>
                                                <option value="percent">% off</option>
                                                <option value="usd">$ off</option>
                                            </>
                                        )}
                                        {formData.value_type === 'product' && (
                                            <option value="units">units</option>
                                        )}
                                        {formData.value_type === 'voucher' && (
                                            <option value="usd">$ value</option>
                                        )}
                                        {formData.value_type === 'experience' && (
                                            <option value="usd">$ value</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Name and Description */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-pr-text-1 mb-2">Describe your offer</h2>
                                <p className="text-pr-text-2">Give it a catchy name and description.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                                    Offer Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="w-full px-4 py-3 border border-pr-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    placeholder="e.g., 20% Off Your First Coffee"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-pr-text-1 mb-2">
                                    Description (optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-pr-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                    placeholder="Tell users what they're getting..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                                        Duration
                                    </label>
                                    <select
                                        value={formData.duration_days}
                                        onChange={(e) => updateField('duration_days', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 border border-pr-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value={7}>7 days</option>
                                        <option value={10}>10 days</option>
                                        <option value={14}>14 days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-pr-text-1 mb-2">
                                        Max Redemptions
                                    </label>
                                    <select
                                        value={formData.max_redemptions}
                                        onChange={(e) => updateField('max_redemptions', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 border border-pr-border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value={10}>10 users</option>
                                        <option value={15}>15 users</option>
                                        <option value={20}>20 users</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Where should it appear? */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-pr-text-1 mb-2">Where should it appear?</h2>
                                <p className="text-pr-text-2">Choose where users will discover your offer.</p>
                            </div>

                            <div className="space-y-3">
                                {SURFACES.map(({ id, label, description }) => (
                                    <button
                                        key={id}
                                        onClick={() => toggleSurface(id as Surface)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${formData.surfaces.includes(id as Surface)
                                            ? 'border-emerald-500 bg-emerald-50'
                                            : 'border-pr-border hover:border-pr-text-3'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.surfaces.includes(id as Surface)
                                            ? 'bg-emerald-500 text-white'
                                            : 'border-2 border-pr-border'
                                            }`}>
                                            {formData.surfaces.includes(id as Surface) && (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-pr-text-1">{label}</div>
                                            <div className="text-xs text-pr-text-2">{description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-700">
                                    <strong>PromoShare</strong> and <strong>Social Shield</strong> verification are automatically enabled for all sampling offers to ensure authentic engagement.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-pr-text-1 mb-2">Review & Launch</h2>
                                <p className="text-pr-text-2">Make sure everything looks good.</p>
                            </div>

                            <div className="bg-pr-surface-2 rounded-xl p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-${getValueTypeColor(formData.value_type)}-100`}>
                                        {formData.value_type === 'coupon' && <Percent className={`w-5 h-5 text-${getValueTypeColor(formData.value_type)}-500`} />}
                                        {formData.value_type === 'product' && <Package className={`w-5 h-5 text-${getValueTypeColor(formData.value_type)}-500`} />}
                                        {formData.value_type === 'voucher' && <Ticket className={`w-5 h-5 text-${getValueTypeColor(formData.value_type)}-500`} />}
                                        {formData.value_type === 'experience' && <Sparkles className={`w-5 h-5 text-${getValueTypeColor(formData.value_type)}-500`} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-pr-text-1">{formData.name || 'Untitled Offer'}</div>
                                        <div className="text-sm text-pr-text-2">
                                            {formData.value_amount} {formData.value_unit} • {formData.value_type}
                                        </div>
                                    </div>
                                </div>

                                {formData.description && (
                                    <p className="text-sm text-pr-text-2">{formData.description}</p>
                                )}

                                <div className="flex flex-wrap gap-2 pt-2 border-t border-pr-border">
                                    <span className="px-2 py-1 bg-white rounded text-xs text-pr-text-2">
                                        {formData.duration_days} days
                                    </span>
                                    <span className="px-2 py-1 bg-white rounded text-xs text-pr-text-2">
                                        Up to {formData.max_redemptions} redemptions
                                    </span>
                                    {formData.surfaces.map(s => (
                                        <span key={s} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
                                            {s === 'deals' ? 'Deals' : s === 'events' ? 'Events' : 'Post Proof'}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : navigate('/advertiser/onboarding')}
                        className="flex items-center gap-2 px-4 py-2 text-pr-text-2 hover:text-pr-text-1 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>

                    {step < totalSteps ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Launch Sampling Offer
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
