/**
 * OnboardingNudgeModal (React Native)
 * 
 * P0 Critical: Appears for State 0 users who haven't completed any verified actions.
 * Provides clear CTAs to guide new users to their first action.
 * 
 * Ported from web: apps/web/src/react-app/components/OnboardingNudgeModal.tsx
 */

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Gift, Camera, Calendar, X, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeColors } from '@/hooks/useThemeColors';

interface OnboardingNudgeModalProps {
    visible: boolean;
    onClose: () => void;
    onActionClick?: (action: string) => void;
}

const DISMISSAL_KEY = 'promorang_onboarding_nudge_dismissed';
const DISMISSAL_EXPIRY_HOURS = 24;

export async function isNudgeDismissed(): Promise<boolean> {
    try {
        const dismissed = await AsyncStorage.getItem(DISMISSAL_KEY);
        if (!dismissed) return false;

        const { timestamp } = JSON.parse(dismissed);
        const expiryMs = DISMISSAL_EXPIRY_HOURS * 60 * 60 * 1000;
        return Date.now() - timestamp < expiryMs;
    } catch {
        return false;
    }
}

export async function setNudgeDismissed(): Promise<void> {
    try {
        await AsyncStorage.setItem(DISMISSAL_KEY, JSON.stringify({ timestamp: Date.now() }));
    } catch (e) {
        console.error('Failed to save nudge dismissal:', e);
    }
}

const ACTIONS = [
    {
        id: 'deals',
        title: 'Find a Deal',
        description: 'Browse discounts and offers near you',
        icon: Gift,
        color: '#10B981',
        route: '/deals',
    },
    {
        id: 'post',
        title: 'Share Something',
        description: 'Show off a purchase and earn rewards',
        icon: Camera,
        color: '#F97316',
        route: '/post-entry',
    },
    {
        id: 'events',
        title: "See What's Happening",
        description: 'Local events and activities',
        icon: Calendar,
        color: '#8B5CF6',
        route: '/events-entry',
    },
];

export default function OnboardingNudgeModal({
    visible,
    onClose,
    onActionClick,
}: OnboardingNudgeModalProps) {
    const router = useRouter();
    const theme = useThemeColors();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.9));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
        }
    }, [visible]);

    const handleClose = async () => {
        await setNudgeDismissed();
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    const handleActionPress = async (action: typeof ACTIONS[0]) => {
        onActionClick?.(action.id);
        await setNudgeDismissed();
        onClose();
        router.push(action.route as any);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />

                <Animated.View
                    style={[
                        styles.modal,
                        { backgroundColor: theme.surface, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <X size={20} color={theme.textSecondary} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Sparkles size={28} color="#FFF" />
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>Let's Get Started!</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Pick one to begin earning rewards
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        {ACTIONS.map((action) => {
                            const Icon = action.icon;
                            return (
                                <TouchableOpacity
                                    key={action.id}
                                    style={[styles.actionCard, { backgroundColor: theme.background, borderColor: theme.border }]}
                                    onPress={() => handleActionPress(action)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                                        <Icon size={24} color={action.color} />
                                    </View>
                                    <View style={styles.actionText}>
                                        <Text style={[styles.actionTitle, { color: theme.text }]}>{action.title}</Text>
                                        <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                                            {action.description}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Skip text */}
                    <Text style={[styles.skipText, { color: theme.textSecondary }]}>
                        You can always find these options in your menu
                    </Text>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modal: {
        width: width - 40,
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        zIndex: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#F97316',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    actionsContainer: {
        gap: 12,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        gap: 16,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 13,
    },
    skipText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
    },
});
