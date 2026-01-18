/**
 * OnboardingFlow
 * 
 * Typeform/Duolingo-inspired onboarding questionnaire.
 * Shows one question at a time with smooth animations.
 * Collects user preferences before showing the main experience.
 */

import { useState } from 'react';
import {
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Gift,
    DollarSign,
    Users,
    TrendingUp,
    Music,
    Shirt,
    UtensilsCrossed,
    Dumbbell,
    Gamepad2,
    Plane,
    Heart,
    Laugh,
    Instagram,
    Youtube,
    Twitter,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingFlowProps {
    onComplete: (preferences: UserPreferences) => void;
    userName?: string;
}

export interface UserPreferences {
    goal: string;
    interests: string[];
    platforms: string[];
}

// Question definitions
const GOALS = [
    { id: 'earn_money', label: 'Earn money from my social presence', icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { id: 'get_deals', label: 'Get exclusive deals & samples', icon: Gift, color: 'from-purple-500 to-pink-500' },
    { id: 'grow_influence', label: 'Grow my influence & reach', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { id: 'connect_brands', label: 'Connect with cool brands', icon: Users, color: 'from-orange-500 to-amber-500' },
];

const INTERESTS = [
    { id: 'fashion', label: 'Fashion & Style', icon: Shirt },
    { id: 'food', label: 'Food & Dining', icon: UtensilsCrossed },
    { id: 'fitness', label: 'Fitness & Health', icon: Dumbbell },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'music', label: 'Music & Entertainment', icon: Music },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'beauty', label: 'Beauty & Skincare', icon: Heart },
    { id: 'comedy', label: 'Comedy & Memes', icon: Laugh },
];

const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-600 to-pink-500' },
    { id: 'tiktok', label: 'TikTok', icon: Music, color: 'bg-black' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-600' },
    { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'bg-black' },
];

export default function OnboardingFlow({ onComplete, userName }: OnboardingFlowProps) {
    const [step, setStep] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState<string>('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    const totalSteps = 3;
    const progress = ((step + 1) / totalSteps) * 100;

    const handleNext = () => {
        if (step < totalSteps - 1) {
            setIsAnimating(true);
            setTimeout(() => {
                setStep(step + 1);
                setIsAnimating(false);
            }, 200);
        } else {
            // Complete onboarding
            onComplete({
                goal: selectedGoal,
                interests: selectedInterests,
                platforms: selectedPlatforms,
            });
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setIsAnimating(true);
            setTimeout(() => {
                setStep(step - 1);
                setIsAnimating(false);
            }, 200);
        }
    };

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const togglePlatform = (id: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const canProceed = () => {
        switch (step) {
            case 0: return selectedGoal !== '';
            case 1: return selectedInterests.length > 0;
            case 2: return selectedPlatforms.length > 0;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-pr-surface-background flex flex-col">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-pr-surface-3 z-50">
                <div
                    className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Header */}
            <header className="py-6 px-6 flex items-center justify-between">
                <img
                    src="https://mocha-cdn.com/0198f6f0-5737-78cb-955a-4b0907aa1065/Promorang_logo_FULL-02.png"
                    alt="Promorang"
                    className="h-7 w-auto"
                />
                <span className="text-sm text-pr-text-3">{step + 1} of {totalSteps}</span>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-8">
                <div
                    className={`max-w-xl w-full transition-all duration-200 ${isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
                        }`}
                >
                    {/* Step 0: What's your goal? */}
                    {step === 0 && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1">
                                    {userName ? `Hey ${userName}! ` : ''}What brings you here?
                                </h1>
                                <p className="text-pr-text-2">Pick the one that sounds most like you</p>
                            </div>

                            <div className="space-y-3">
                                {GOALS.map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => setSelectedGoal(goal.id)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${selectedGoal === goal.id
                                                ? 'border-orange-500 bg-orange-500/10'
                                                : 'border-pr-border hover:border-pr-text-3 bg-pr-surface-card'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center flex-shrink-0`}>
                                            <goal.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="font-medium text-pr-text-1">{goal.label}</span>
                                        {selectedGoal === goal.id && (
                                            <Check className="w-5 h-5 text-orange-500 ml-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 1: What are you into? */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1">
                                    What are you into?
                                </h1>
                                <p className="text-pr-text-2">Pick all that apply • This helps us show relevant deals</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {INTERESTS.map((interest) => (
                                    <button
                                        key={interest.id}
                                        onClick={() => toggleInterest(interest.id)}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${selectedInterests.includes(interest.id)
                                                ? 'border-orange-500 bg-orange-500/10'
                                                : 'border-pr-border hover:border-pr-text-3 bg-pr-surface-card'
                                            }`}
                                    >
                                        <interest.icon className={`w-6 h-6 ${selectedInterests.includes(interest.id) ? 'text-orange-500' : 'text-pr-text-2'
                                            }`} />
                                        <span className="text-sm font-medium text-pr-text-1">{interest.label}</span>
                                        {selectedInterests.includes(interest.id) && (
                                            <div className="absolute top-2 right-2">
                                                <Check className="w-4 h-4 text-orange-500" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <p className="text-center text-xs text-pr-text-3">
                                Selected: {selectedInterests.length} / {INTERESTS.length}
                            </p>
                        </div>
                    )}

                    {/* Step 2: Which platforms do you use? */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-pr-text-1">
                                    Where do you hang out?
                                </h1>
                                <p className="text-pr-text-2">Select the platforms you use most</p>
                            </div>

                            <div className="space-y-3">
                                {PLATFORMS.map((platform) => (
                                    <button
                                        key={platform.id}
                                        onClick={() => togglePlatform(platform.id)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${selectedPlatforms.includes(platform.id)
                                                ? 'border-orange-500 bg-orange-500/10'
                                                : 'border-pr-border hover:border-pr-text-3 bg-pr-surface-card'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center flex-shrink-0`}>
                                            <platform.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="font-medium text-pr-text-1">{platform.label}</span>
                                        {selectedPlatforms.includes(platform.id) && (
                                            <Check className="w-5 h-5 text-orange-500 ml-auto" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="py-6 px-4 border-t border-pr-border/50">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                    {step > 0 ? (
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="text-pr-text-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    ) : (
                        <div />
                    )}

                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white px-8"
                    >
                        {step === totalSteps - 1 ? "Let's go!" : 'Continue'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}
