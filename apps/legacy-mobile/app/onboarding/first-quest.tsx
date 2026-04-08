/**
 * First Quest Screen (Mobile)
 * 
 * Port of web FirstQuest.tsx for React Native.
 * Focused, distraction-free first action for new users.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp
} from 'react-native-reanimated';
import { Twitter, CheckCircle, ExternalLink, Diamond, Lock, Sparkles, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QuestCelebration from '@/components/onboarding/QuestCelebration';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';

type Stage = 'splash' | 'quest' | 'celebration' | 'realm-unlocked';

const FIRST_QUEST = {
    id: 'first-quest-follow',
    title: 'Follow @Promorang on X',
    description: 'Join our community and stay updated on the latest quests and rewards.',
    reward: 5,
    url: 'https://twitter.com/intent/follow?screen_name=Promorang'
};

const UNLOCKED_FEATURES = [
    { label: 'Daily Draw', color: ['#a855f7', '#ec4899'] as const },
    { label: 'Your Rank', color: ['#f59e0b', '#f97316'] as const },
    { label: 'Your Guild', color: ['#3b82f6', '#06b6d4'] as const },
];

export default function FirstQuestScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [stage, setStage] = useState<Stage>('splash');
    const [hasClicked, setHasClicked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenQuest = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await Linking.openURL(FIRST_QUEST.url);
        setHasClicked(true);
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            await apiClient.post('/users/me/first-quest', {
                quest_id: FIRST_QUEST.id,
                gems_earned: FIRST_QUEST.reward
            });
        } catch (err) {
            console.error('Failed to complete first quest:', err);
            // Continue anyway for smooth UX
        }

        setStage('celebration');
        setIsSubmitting(false);
    };

    const handleSeeWallet = () => {
        router.replace('/(tabs)/wallet');
    };

    const handleNextQuest = () => {
        setStage('realm-unlocked');
    };

    const handleRealmContinue = async () => {
        await AsyncStorage.setItem('promorang_questionnaire_complete', 'true');
        router.replace('/(tabs)');
    };

    // Splash screen
    if (stage === 'splash') {
        return (
            <LinearGradient colors={['#0f172a', '#581c87', '#0f172a']} style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <Animated.View entering={FadeIn.duration(800)} style={styles.splashContent}>
                        <View style={styles.splashIconContainer}>
                            <LinearGradient colors={['#f97316', '#ec4899']} style={styles.splashIcon}>
                                <Sparkles size={48} color="#FFF" />
                            </LinearGradient>
                        </View>

                        <Text style={styles.splashTitle}>Welcome to{'\n'}The Realm</Text>
                        <Text style={styles.splashSubtitle}>
                            Complete quests. Earn gems.{'\n'}Unlock real rewards.
                        </Text>

                        <TouchableOpacity
                            style={styles.splashButton}
                            onPress={() => setStage('quest')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#f97316', '#ec4899']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.splashButtonGradient}
                            >
                                <Text style={styles.splashButtonText}>Begin Your Journey</Text>
                                <ArrowRight size={20} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Quest screen
    if (stage === 'quest') {
        return (
            <LinearGradient colors={['#0f172a', '#581c87', '#0f172a']} style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.questContent}>
                        {/* Header */}
                        <Animated.View entering={SlideInUp.delay(100)} style={styles.questHeader}>
                            <View style={styles.questBadge}>
                                <Diamond size={14} color="#f97316" />
                                <Text style={styles.questBadgeText}>Your First Quest</Text>
                            </View>
                            <Text style={styles.questUnlockText}>Complete this to unlock The Realm</Text>
                        </Animated.View>

                        {/* Quest Card */}
                        <Animated.View entering={SlideInUp.delay(200)} style={styles.questCard}>
                            <View style={styles.questIconContainer}>
                                <LinearGradient colors={['#1d9bf0', '#1a8cd8']} style={styles.questIcon}>
                                    <Twitter size={32} color="#FFF" />
                                </LinearGradient>
                            </View>

                            <Text style={styles.questTitle}>{FIRST_QUEST.title}</Text>
                            <Text style={styles.questDescription}>{FIRST_QUEST.description}</Text>

                            <View style={styles.rewardBadge}>
                                <Text style={styles.rewardText}>
                                    Reward: {FIRST_QUEST.reward} Gems (${FIRST_QUEST.reward})
                                </Text>
                            </View>

                            {!hasClicked ? (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleOpenQuest}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#1d9bf0', '#1a8cd8']}
                                        style={styles.actionButtonGradient}
                                    >
                                        <Twitter size={20} color="#FFF" />
                                        <Text style={styles.actionButtonText}>Open X (Twitter)</Text>
                                        <ExternalLink size={16} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleComplete}
                                    disabled={isSubmitting}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#22c55e', '#10b981']}
                                        style={styles.actionButtonGradient}
                                    >
                                        <CheckCircle size={20} color="#FFF" />
                                        <Text style={styles.actionButtonText}>
                                            {isSubmitting ? 'Claiming...' : 'I Followed — Claim Reward'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </Animated.View>

                        {/* Unlock preview */}
                        <Animated.View entering={FadeIn.delay(400)} style={styles.unlockPreview}>
                            <Text style={styles.unlockLabel}>Complete to unlock</Text>
                            <View style={styles.unlockItems}>
                                {['Daily Draw', 'Your Rank', 'Guild'].map((item) => (
                                    <View key={item} style={styles.unlockItem}>
                                        <Lock size={12} color="#a78bfa" />
                                        <Text style={styles.unlockItemText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </Animated.View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // Celebration screen
    if (stage === 'celebration') {
        return (
            <QuestCelebration
                gemsEarned={FIRST_QUEST.reward}
                onSeeWallet={handleSeeWallet}
                onNextQuest={handleNextQuest}
            />
        );
    }

    // Realm unlocked screen
    return (
        <LinearGradient colors={['#0f172a', '#581c87', '#0f172a']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <Animated.View entering={FadeIn.duration(600)} style={styles.realmContent}>
                    <View style={styles.realmIconContainer}>
                        <LinearGradient colors={['#f59e0b', '#f97316', '#ec4899']} style={styles.realmIcon}>
                            <Sparkles size={48} color="#FFF" />
                        </LinearGradient>
                    </View>

                    <View style={styles.realmBadge}>
                        <Sparkles size={14} color="#fbbf24" />
                        <Text style={styles.realmBadgeText}>ACHIEVEMENT UNLOCKED</Text>
                        <Sparkles size={14} color="#fbbf24" />
                    </View>

                    <Text style={styles.realmTitle}>Welcome to{'\n'}The Realm!</Text>
                    <Text style={styles.realmSubtitle}>
                        You've completed your first quest.{'\n'}The gates are now open.
                    </Text>

                    <View style={styles.featureRow}>
                        {UNLOCKED_FEATURES.map((feature) => (
                            <View key={feature.label} style={styles.featureItem}>
                                <LinearGradient colors={feature.color as any} style={styles.featureIcon}>
                                    <Diamond size={24} color="#FFF" />
                                </LinearGradient>
                                <Text style={styles.featureLabel}>{feature.label}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.realmButton}
                        onPress={handleRealmContinue}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#f97316', '#ec4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.realmButtonGradient}
                        >
                            <Text style={styles.realmButtonText}>Explore The Realm</Text>
                            <ArrowRight size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    // Splash styles
    splashContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    splashIconContainer: {
        marginBottom: 32,
    },
    splashIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    splashSubtitle: {
        fontSize: 16,
        color: 'rgba(216, 180, 254, 0.8)',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    splashButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    splashButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 8,
    },
    splashButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    // Quest styles
    questContent: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    questHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    questBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.3)',
        gap: 8,
        marginBottom: 8,
    },
    questBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#f97316',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    questUnlockText: {
        fontSize: 14,
        color: 'rgba(216, 180, 254, 0.7)',
    },
    questCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    questIconContainer: {
        marginBottom: 20,
    },
    questIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    questDescription: {
        fontSize: 14,
        color: 'rgba(216, 180, 254, 0.8)',
        textAlign: 'center',
        marginBottom: 20,
    },
    rewardBadge: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(168, 85, 247, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
        marginBottom: 20,
    },
    rewardText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    actionButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    unlockPreview: {
        alignItems: 'center',
        marginTop: 32,
    },
    unlockLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(168, 85, 247, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 12,
    },
    unlockItems: {
        flexDirection: 'row',
        gap: 12,
    },
    unlockItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        gap: 6,
    },
    unlockItemText: {
        fontSize: 12,
        color: 'rgba(216, 180, 254, 0.8)',
    },
    // Realm unlocked styles
    realmContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    realmIconContainer: {
        marginBottom: 24,
    },
    realmIcon: {
        width: 112,
        height: 112,
        borderRadius: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    realmBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    realmBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fbbf24',
        letterSpacing: 3,
    },
    realmTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    realmSubtitle: {
        fontSize: 16,
        color: 'rgba(216, 180, 254, 0.8)',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    featureRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 40,
    },
    featureItem: {
        alignItems: 'center',
        gap: 8,
    },
    featureIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    realmButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    realmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 8,
    },
    realmButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
});
