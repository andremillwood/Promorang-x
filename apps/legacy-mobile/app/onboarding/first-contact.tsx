import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import IntentOrientationStep, { OnboardingIntent } from '@/components/onboarding/IntentOrientationStep';
import ValuePreviewStep from '@/components/onboarding/ValuePreviewStep';

export default function FirstContactScreen() {
    const router = useRouter();
    const [phase, setPhase] = useState<'welcome' | 'orientation' | 'preview'>('welcome');
    const [intent, setIntent] = useState<OnboardingIntent | null>(null);

    const handleWelcomeContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setPhase('orientation');
    };

    const handleIntentSelect = async (selectedIntent: OnboardingIntent) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIntent(selectedIntent);
        setPhase('preview');
    };

    const handlePreviewContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // For mobile, we'll mark as complete for now and navigate to the main app
        // In a full implementation, we'd check auth and maybe show personal flow
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        await AsyncStorage.setItem('promorang_onboarding_intent', intent || 'participant');

        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.content}>
                {phase === 'welcome' && (
                    <WelcomeStep onContinue={handleWelcomeContinue} />
                )}
                {phase === 'orientation' && (
                    <IntentOrientationStep onSelect={handleIntentSelect} />
                )}
                {phase === 'preview' && intent && (
                    <ValuePreviewStep intent={intent} onContinue={handlePreviewContinue} />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
    },
});
