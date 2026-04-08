/**
 * Quest Celebration Screen
 * 
 * Mobile celebration for completing a quest and earning gems.
 */

import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    FadeIn,
    SlideInUp
} from 'react-native-reanimated';
import { Diamond, Sparkles, ArrowRight, Wallet } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface QuestCelebrationProps {
    gemsEarned: number;
    onSeeWallet: () => void;
    onNextQuest: () => void;
}

export default function QuestCelebration({
    gemsEarned,
    onSeeWallet,
    onNextQuest
}: QuestCelebrationProps) {
    const iconScale = useSharedValue(0);
    const iconRotation = useSharedValue(-180);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Icon animation
        iconScale.value = withSpring(1, { damping: 8, stiffness: 100 });
        iconRotation.value = withSpring(0, { damping: 12, stiffness: 80 });

        // Pulse animation
        pulseScale.value = withRepeat(
            withSequence(
                withSpring(1.1, { damping: 4 }),
                withSpring(1, { damping: 4 })
            ),
            -1,
            true
        );
    }, []);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: iconScale.value },
            { rotate: `${iconRotation.value}deg` }
        ]
    }));

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }]
    }));

    return (
        <LinearGradient
            colors={['#0f172a', '#581c87', '#0f172a']}
            style={styles.container}
        >
            {/* Background glow */}
            <Animated.View style={[styles.glowOrb, pulseAnimatedStyle]} />

            {/* Icon */}
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                <LinearGradient
                    colors={['#a855f7', '#ec4899']}
                    style={styles.iconGradient}
                >
                    <Diamond size={56} color="#FFF" />
                </LinearGradient>
            </Animated.View>

            {/* Amount */}
            <Animated.View entering={FadeIn.delay(300)}>
                <View style={styles.amountRow}>
                    <Sparkles size={24} color="#fbbf24" />
                    <Text style={styles.amountText}>+{gemsEarned} GEMS</Text>
                    <Sparkles size={24} color="#fbbf24" />
                </View>
            </Animated.View>

            {/* USD Value */}
            <Animated.Text entering={FadeIn.delay(500)} style={styles.usdText}>
                Success!
            </Animated.Text>

            <Animated.Text entering={FadeIn.delay(600)} style={styles.subtitleText}>
                You just entered the story. Keep going to build your profile.
            </Animated.Text>

            {/* CTAs */}
            <Animated.View entering={SlideInUp.delay(800)} style={styles.ctaContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onNextQuest}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#f97316', '#ec4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryButtonGradient}
                    >
                        <Text style={styles.primaryButtonText}>Next Quest</Text>
                        <ArrowRight size={20} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onSeeWallet}
                    activeOpacity={0.8}
                >
                    <Wallet size={20} color="#FFF" />
                    <Text style={styles.secondaryButtonText}>See My Wallet</Text>
                </TouchableOpacity>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    glowOrb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 112,
        height: 112,
        borderRadius: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#a855f7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    amountText: {
        fontSize: 40,
        fontWeight: '900',
        color: '#f97316',
    },
    usdText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 16,
        color: 'rgba(216, 180, 254, 0.8)',
        marginBottom: 40,
    },
    ctaContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 8,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        gap: 8,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
