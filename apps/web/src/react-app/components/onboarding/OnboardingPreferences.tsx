/**
 * OnboardingPreferences - Inline Preference Wizard Component
 * 
 * A 3-step wizard that collects user preferences for personalization:
 * 1. Interests (multi-select chips)
 * 2. Location (city/zip or online-only)
 * 3. Deal types (what kind of opportunities they want)
 * 
 * Awards points on first completion.
 */

import { useState, useEffect } from 'react';
import { Check, ChevronRight, ChevronLeft, MapPin, Sparkles, X } from 'lucide-react';
import { apiFetch } from '@/react-app/lib/api';
import { useCelebration } from '@/react-app/components/ui/Celebrate';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Interest categories
const INTERESTS = [
    { id: 'food', label: 'Food & Dining', emoji: '🍔' },
    { id: 'shopping', label: 'Shopping & Retail', emoji: '🛍️' },
    { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
    { id: 'fitness', label: 'Fitness & Wellness', emoji: '💪' },
    { id: 'beauty', label: 'Beauty & Style', emoji: '💄' },
    { id: 'gaming', label: 'Gaming & Tech', emoji: '🎮' },
    { id: 'home', label: 'Home & Local', emoji: '🏠' },
    { id: 'travel', label: 'Travel', emoji: '✈️' }
];

// Deal type options
const DEAL_TYPES = [
    { id: 'samples', label: 'Free Samples', emoji: '🎁', description: 'Try products at no cost' },
    { id: 'discounts', label: 'Discounts & Coupons', emoji: '💰', description: 'Percentage off deals' },
    { id: 'events', label: 'Exclusive Events', emoji: '🎟️', description: 'VIP access, meetups' },
    { id: 'paid', label: 'Paid Opportunities', emoji: '💵', description: 'Earn money for actions' }
];

const POINTS_REWARD = 100;

interface OnboardingPreferencesProps {
    onComplete?: (preferences: any) => void;
    onSkip?: () => void;
    initiallyCompleted?: boolean;
}

export default function OnboardingPreferences({
    onComplete,
    onSkip,
    initiallyCompleted = false
}: OnboardingPreferencesProps) {
    const [step, setStep] = useState(0);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [location, setLocation] = useState({ city: '', zip: '', online_only: false });
    const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [completed, setCompleted] = useState(initiallyCompleted);
    const [pointsAwarded, setPointsAwarded] = useState(0);
    const [dismissed, setDismissed] = useState(false);
    const { celebrate } = useCelebration();

    // Check if already completed
    useEffect(() => {
        checkExistingPreferences();
    }, []);

    const checkExistingPreferences = async () => {
        try {
            const response = await apiFetch('/api/users/preferences');
            const data = await response.json();
            if (data.completed) {
                setCompleted(true);
                if (data.preferences) {
                    setSelectedInterests(data.preferences.interests || []);
                    setLocation(data.preferences.location || {});
                    setSelectedDealTypes(data.preferences.deal_types || []);
                }
            }
        } catch (error) {
            // Not logged in or error - that's okay
        }
    };

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleDealType = (id: string) => {
        setSelectedDealTypes(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await apiFetch('/api/users/preferences', {
                method: 'POST',
                body: JSON.stringify({
                    interests: selectedInterests,
                    location,
                    deal_types: selectedDealTypes
                })
            });

            const data = await response.json();

            if (data.success) {
                setCompleted(true);
                setPointsAwarded(data.points_awarded || 0);

                if (data.points_awarded > 0) {
                    celebrate('sparkles');
                }

                onComplete?.(data.preferences);
            }
        } catch (error) {
            console.error('Failed to save preferences:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = () => {
        setDismissed(true);
        onSkip?.();
    };

    // If dismissed, show nothing
    if (dismissed) return null;

    // If completed, show success state
    if (completed) {
        return (
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl p-4 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-pr-text-1">Preferences Set</h3>
                        <p className="text-xs text-pr-text-2">
                            {selectedInterests.length > 0
                                ? `${selectedInterests.length} interests selected`
                                : 'We\'ll show you personalized content'}
                        </p>
                    </div>
                    {pointsAwarded > 0 && (
                        <span className="text-sm font-bold text-emerald-500 animate-pop-in">
                            +{pointsAwarded} pts
                        </span>
                    )}
                </div>
            </div>
        );
    }

    const steps = [
        { title: 'What are you into?', subtitle: 'Select all that interest you' },
        { title: 'Where are you?', subtitle: 'So we can find local deals' },
        { title: 'What do you want?', subtitle: 'Pick your preferred opportunities' }
    ];

    return (
        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/5 rounded-2xl p-5 border border-blue-500/20">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-bold text-pr-text-1">{steps[step].title}</h3>
                    <p className="text-xs text-pr-text-2">{steps[step].subtitle}</p>
                </div>
                <button
                    onClick={handleSkip}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-pr-text-3"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-5">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === step
                                ? 'w-6 bg-blue-500'
                                : i < step
                                    ? 'w-1.5 bg-blue-500/50'
                                    : 'w-1.5 bg-pr-text-3/30'
                            }`}
                    />
                ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[140px]">
                {/* Step 1: Interests */}
                {step === 0 && (
                    <div className="flex flex-wrap gap-2">
                        {INTERESTS.map(interest => (
                            <button
                                key={interest.id}
                                onClick={() => toggleInterest(interest.id)}
                                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedInterests.includes(interest.id)
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                                        : 'bg-white/10 text-pr-text-1 hover:bg-white/20 border border-pr-border'
                                    }`}
                            >
                                <span className="mr-1.5">{interest.emoji}</span>
                                {interest.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Step 2: Location */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs font-medium text-pr-text-2 block mb-1">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pr-text-3" />
                                    <input
                                        type="text"
                                        placeholder="Los Angeles"
                                        value={location.city}
                                        onChange={e => setLocation({ ...location, city: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 bg-white/10 border border-pr-border rounded-xl text-pr-text-1 placeholder:text-pr-text-3 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="w-24">
                                <label className="text-xs font-medium text-pr-text-2 block mb-1">Zip</label>
                                <input
                                    type="text"
                                    placeholder="90210"
                                    value={location.zip}
                                    onChange={e => setLocation({ ...location, zip: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/10 border border-pr-border rounded-xl text-pr-text-1 placeholder:text-pr-text-3 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setLocation({ ...location, online_only: !location.online_only })}
                            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${location.online_only
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/10 text-pr-text-1 border border-pr-border hover:bg-white/20'
                                }`}
                        >
                            {location.online_only ? '✓ Online deals only' : 'I only want online deals'}
                        </button>
                    </div>
                )}

                {/* Step 3: Deal Types */}
                {step === 2 && (
                    <div className="grid grid-cols-2 gap-2">
                        {DEAL_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => toggleDealType(type.id)}
                                className={`p-3 rounded-xl text-left transition-all duration-200 ${selectedDealTypes.includes(type.id)
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                                        : 'bg-white/10 text-pr-text-1 hover:bg-white/20 border border-pr-border'
                                    }`}
                            >
                                <span className="text-lg">{type.emoji}</span>
                                <div className="text-sm font-medium mt-1">{type.label}</div>
                                <div className={`text-[10px] mt-0.5 ${selectedDealTypes.includes(type.id) ? 'text-white/70' : 'text-pr-text-3'
                                    }`}>
                                    {type.description}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-pr-border">
                <div className="flex items-center gap-2">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-pr-text-2 hover:text-pr-text-1 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        +{POINTS_REWARD} pts
                    </span>

                    {step < 2 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors btn-spring"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-colors btn-spring disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Done'}
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
