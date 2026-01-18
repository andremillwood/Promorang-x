/**
 * Onboarding Questionnaire
 * 
 * Typeform-style onboarding flow for mobile.
 * Collects user preferences: goals, interests, platforms.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ArrowRight,
    ArrowLeft,
    DollarSign,
    Gift,
    TrendingUp,
    Users,
    Shirt,
    UtensilsCrossed,
    Dumbbell,
    Gamepad2,
    Music,
    Plane,
    Heart,
    Smile,
    Instagram,
    Youtube,
    Twitter,
    Check
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface UserPreferences {
    goal: string;
    interests: string[];
    platforms: string[];
}

// Question definitions
const GOALS = [
    { id: 'earn_money', label: 'Earn money from my social presence', icon: DollarSign, color: ['#10B981', '#059669'] as [string, string] },
    { id: 'get_deals', label: 'Get exclusive deals & samples', icon: Gift, color: ['#8B5CF6', '#EC4899'] as [string, string] },
    { id: 'grow_influence', label: 'Grow my influence & reach', icon: TrendingUp, color: ['#3B82F6', '#06B6D4'] as [string, string] },
    { id: 'connect_brands', label: 'Connect with cool brands', icon: Users, color: ['#F59E0B', '#EF4444'] as [string, string] },
];

const INTERESTS = [
    { id: 'fashion', label: 'Fashion', icon: Shirt },
    { id: 'food', label: 'Food', icon: UtensilsCrossed },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'travel', label: 'Travel', icon: Plane },
    { id: 'beauty', label: 'Beauty', icon: Heart },
    { id: 'comedy', label: 'Comedy', icon: Smile },
];

const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'linear-gradient(45deg, #833AB4, #E1306C)' },
    { id: 'tiktok', label: 'TikTok', icon: Music, color: '#000' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
    { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: '#000' },
];

export default function QuestionnaireScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const [step, setStep] = useState(0);
    const [selectedGoal, setSelectedGoal] = useState<string>('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    const totalSteps = 3;
    const progress = ((step + 1) / totalSteps) * 100;

    const handleNext = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (step < totalSteps - 1) {
            setStep(step + 1);
        } else {
            // Complete questionnaire
            const preferences: UserPreferences = {
                goal: selectedGoal,
                interests: selectedInterests,
                platforms: selectedPlatforms,
            };

            await AsyncStorage.setItem('promorang_user_preferences', JSON.stringify(preferences));
            await AsyncStorage.setItem('promorang_questionnaire_complete', 'true');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Navigate to first contact or onboarding slides
            router.replace('/onboarding');
        }
    };

    const handleBack = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const toggleInterest = async (id: string) => {
        await Haptics.selectionAsync();
        setSelectedInterests(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const togglePlatform = async (id: string) => {
        await Haptics.selectionAsync();
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Progress Bar */}
            <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.stepIndicator, { color: theme.textSecondary }]}>
                    {step + 1} of {totalSteps}
                </Text>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentInner}
                showsVerticalScrollIndicator={false}
            >
                {/* Step 0: Goals */}
                {step === 0 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.questionTitle, { color: theme.text }]}>
                            What brings you here?
                        </Text>
                        <Text style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                            Pick the one that sounds most like you
                        </Text>

                        <View style={styles.optionsContainer}>
                            {GOALS.map((goal) => {
                                const Icon = goal.icon;
                                const isSelected = selectedGoal === goal.id;

                                return (
                                    <TouchableOpacity
                                        key={goal.id}
                                        style={[
                                            styles.goalOption,
                                            { backgroundColor: theme.surface, borderColor: isSelected ? colors.primary : theme.border },
                                            isSelected && { borderWidth: 2 }
                                        ]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setSelectedGoal(goal.id);
                                        }}
                                    >
                                        <LinearGradient
                                            colors={goal.color}
                                            style={styles.goalIconContainer}
                                        >
                                            <Icon size={24} color="#FFF" />
                                        </LinearGradient>
                                        <Text style={[styles.goalLabel, { color: theme.text }]}>
                                            {goal.label}
                                        </Text>
                                        {isSelected && (
                                            <View style={styles.checkCircle}>
                                                <Check size={16} color={colors.primary} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Step 1: Interests */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.questionTitle, { color: theme.text }]}>
                            What are you into?
                        </Text>
                        <Text style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                            Pick all that apply
                        </Text>

                        <View style={styles.gridContainer}>
                            {INTERESTS.map((interest) => {
                                const Icon = interest.icon;
                                const isSelected = selectedInterests.includes(interest.id);

                                return (
                                    <TouchableOpacity
                                        key={interest.id}
                                        style={[
                                            styles.gridOption,
                                            { backgroundColor: theme.surface, borderColor: isSelected ? colors.primary : theme.border },
                                            isSelected && { borderWidth: 2 }
                                        ]}
                                        onPress={() => toggleInterest(interest.id)}
                                    >
                                        <Icon size={24} color={isSelected ? colors.primary : theme.textSecondary} />
                                        <Text style={[
                                            styles.gridLabel,
                                            { color: isSelected ? colors.primary : theme.text }
                                        ]}>
                                            {interest.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={[styles.counterText, { color: theme.textSecondary }]}>
                            Selected: {selectedInterests.length}
                        </Text>
                    </View>
                )}

                {/* Step 2: Platforms */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <Text style={[styles.questionTitle, { color: theme.text }]}>
                            Where do you hang out?
                        </Text>
                        <Text style={[styles.questionSubtitle, { color: theme.textSecondary }]}>
                            Select the platforms you use most
                        </Text>

                        <View style={styles.optionsContainer}>
                            {PLATFORMS.map((platform) => {
                                const Icon = platform.icon;
                                const isSelected = selectedPlatforms.includes(platform.id);

                                return (
                                    <TouchableOpacity
                                        key={platform.id}
                                        style={[
                                            styles.platformOption,
                                            { backgroundColor: theme.surface, borderColor: isSelected ? colors.primary : theme.border },
                                            isSelected && { borderWidth: 2 }
                                        ]}
                                        onPress={() => togglePlatform(platform.id)}
                                    >
                                        <View style={[styles.platformIconContainer, { backgroundColor: platform.id === 'instagram' ? '#E1306C' : '#000' }]}>
                                            <Icon size={24} color="#FFF" />
                                        </View>
                                        <Text style={[styles.platformLabel, { color: theme.text }]}>
                                            {platform.label}
                                        </Text>
                                        {isSelected && (
                                            <View style={styles.checkCircle}>
                                                <Check size={16} color={colors.primary} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Footer Navigation */}
            <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                {step > 0 ? (
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <ArrowLeft size={20} color={theme.textSecondary} />
                        <Text style={[styles.backButtonText, { color: theme.textSecondary }]}>Back</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backButton} />
                )}

                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        !canProceed() && styles.nextButtonDisabled
                    ]}
                    onPress={handleNext}
                    disabled={!canProceed()}
                >
                    <LinearGradient
                        colors={canProceed() ? ['#F97316', '#EC4899'] : ['#6B7280', '#6B7280']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.nextButtonGradient}
                    >
                        <Text style={styles.nextButtonText}>
                            {step === totalSteps - 1 ? "Let's go!" : 'Continue'}
                        </Text>
                        <ArrowRight size={20} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progressContainer: {
        height: 4,
        width: '100%',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
        alignItems: 'flex-end',
    },
    stepIndicator: {
        fontSize: 14,
        fontWeight: '500',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentInner: {
        padding: 20,
        paddingBottom: 40,
    },
    stepContent: {
        flex: 1,
    },
    questionTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    questionSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    optionsContainer: {
        gap: 12,
    },
    goalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    goalIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    gridOption: {
        width: (width - 52) / 2,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        gap: 8,
    },
    gridLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    counterText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 14,
    },
    platformOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 16,
    },
    platformIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    platformLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        minWidth: 80,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    nextButton: {
        flex: 1,
        marginLeft: 16,
        borderRadius: 14,
        overflow: 'hidden',
    },
    nextButtonDisabled: {
        opacity: 0.5,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
});
