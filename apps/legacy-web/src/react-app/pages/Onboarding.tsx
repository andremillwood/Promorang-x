import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/react-app/hooks/useAuth';
import api from '@/react-app/lib/api';
import WelcomeScreen from '@/react-app/components/onboarding/WelcomeScreen';
import IntentOrientation from '@/react-app/components/onboarding/IntentOrientation';
import type { OnboardingIntent } from '@/react-app/components/onboarding/IntentOrientation';
import ValuePreview from '@/react-app/components/onboarding/ValuePreview';
import ParticipantFlow from '@/react-app/components/onboarding/persona/ParticipantFlow';
import CreatorFlow from '@/react-app/components/onboarding/persona/CreatorFlow';
import BrandFlow from '@/react-app/components/onboarding/persona/BrandFlow';
import MerchantFlow from '@/react-app/components/onboarding/persona/MerchantFlow';

export default function Onboarding() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    // Onboarding Phases: welcome -> orientation -> preview -> account -> persona
    const [phase, setPhase] = useState<'welcome' | 'orientation' | 'preview' | 'account' | 'persona'>('welcome');
    const [intent, setIntent] = useState<OnboardingIntent | null>(null);

    // If user is already logged in and at 'account' phase, skip to persona
    useEffect(() => {
        if (user && phase === 'account') {
            setPhase('persona');
        }
    }, [user, phase]);

    const handleWelcomeContinue = () => {
        setPhase('orientation');
    };

    const handleIntentSelect = (selectedIntent: OnboardingIntent) => {
        setIntent(selectedIntent);
        setPhase('preview');
    };

    const handlePreviewContinue = () => {
        if (user) {
            setPhase('persona');
        } else {
            setPhase('account');
        }
    };

    // Render based on phase
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (phase === 'welcome') {
        return <WelcomeScreen onContinue={handleWelcomeContinue} />;
    }

    if (phase === 'orientation') {
        return <IntentOrientation onSelect={handleIntentSelect} />;
    }

    if (phase === 'preview' && intent) {
        return <ValuePreview intent={intent} onContinue={handlePreviewContinue} />;
    }

    if (phase === 'account' && intent) {
        // Redirect to register, but we want to return here. 
        // For simplicity in this implementation, we'll just show a "Join Now" screen 
        // or redirect to /register with a return path.
        // For now, let's navigate to register.
        navigate('/register?returnTo=/onboarding&phase=persona&intent=' + intent);
        return null;
    }

    if (phase === 'persona' && intent) {
        const handleComplete = async () => {
            try {
                await api.post('/users/onboarding/complete');
                localStorage.setItem('promorang_onboarding_complete', 'true');
                navigate('/dashboard');
            } catch (error) {
                console.error('Failed to complete onboarding:', error);
                // Fallback to local state if API fails
                localStorage.setItem('promorang_onboarding_complete', 'true');
                navigate('/dashboard');
            }
        };

        switch (intent) {
            case 'participant':
                return <ParticipantFlow onComplete={handleComplete} />;
            case 'creator':
                return <CreatorFlow onComplete={handleComplete} />;
            case 'brand':
                return <BrandFlow onComplete={handleComplete} />;
            case 'merchant':
                return <MerchantFlow onComplete={handleComplete} />;
            default:
                return <ParticipantFlow onComplete={handleComplete} />;
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
