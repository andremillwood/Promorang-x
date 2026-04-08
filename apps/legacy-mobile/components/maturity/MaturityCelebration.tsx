import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp,
    ZoomIn,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { Trophy, Sparkles, ChevronRight, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { useMaturityStore, UserMaturityState } from '@/store/maturityStore';

const { width, height } = Dimensions.get('window');

interface MaturityCelebrationProps {
    visible: boolean;
    onClose: () => void;
    rank: UserMaturityState;
}

export const MaturityCelebration: React.FC<MaturityCelebrationProps> = ({ visible, onClose, rank }) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            rotation.value = withRepeat(
                withTiming(360, { duration: 10000, easing: Easing.linear }),
                -1,
                false
            );
        }
    }, [visible]);

    const rayStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const getRankInfo = () => {
        switch (rank) {
            case UserMaturityState.ACTIVE:
                return {
                    title: 'Level Up: Active!',
                    subtitle: 'You\'ve unlocked the Daily Layer.',
                    features: ['Daily Draw Entry', 'Verification Shield']
                };
            case UserMaturityState.REWARDED:
                return {
                    title: 'Level Up: Rewarded!',
                    subtitle: 'You\'re earning real value now.',
                    features: ['Balance Dashboard', 'PromoShare Access']
                };
            case UserMaturityState.POWER_USER:
                return {
                    title: 'Level Up: Power User!',
                    subtitle: 'The full platform is now yours.',
                    features: ['Growth Hub', 'Forecasts & Staking', 'Advanced Wallet']
                };
            case UserMaturityState.OPERATOR_PRO:
                return {
                    title: 'Level Up: Operator Pro!',
                    subtitle: 'Elite status achieved.',
                    features: ['Operator Tools', 'Merchant Matrix', 'Priority Support']
                };
            default:
                return {
                    title: 'Keep Going!',
                    subtitle: 'Perform more actions to level up.',
                    features: ['Earn Points', 'Complete Tasks']
                };
        }
    };

    const info = getRankInfo();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
        >
            <View style={styles.overlay}>
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    style={StyleSheet.absoluteFill}
                >
                    <View style={styles.backdrop} />
                </Animated.View>

                {/* Background Rays */}
                <Animated.View style={[styles.raysContainer, rayStyle]}>
                    {[...Array(8)].map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.ray,
                                { transform: [{ rotate: `${i * 45}deg` }] }
                            ]}
                        />
                    ))}
                </Animated.View>

                <Animated.View
                    entering={ZoomIn.duration(600).springify()}
                    style={styles.card}
                >
                    <LinearGradient
                        colors={[colors.primary, '#8b5cf6']}
                        style={styles.cardGradient}
                    >
                        <Animated.View entering={ZoomIn.delay(300).duration(500)}>
                            <View style={styles.iconContainer}>
                                <Trophy size={48} color="#FFF" />
                                <View style={styles.sparkleTL}><Sparkles size={20} color="#FFD700" /></View>
                                <View style={styles.sparkleBR}><Star size={20} color="#FFD700" /></View>
                            </View>
                        </Animated.View>

                        <Text style={styles.title}>{info.title}</Text>
                        <Text style={styles.subtitle}>{info.subtitle}</Text>

                        <View style={styles.featuresContainer}>
                            <Text style={styles.featuresTitle}>WHAT'S NEW:</Text>
                            {info.features.map((feature, idx) => (
                                <Animated.View
                                    key={feature}
                                    entering={SlideInUp.delay(500 + (idx * 100))}
                                    style={styles.featureItem}
                                >
                                    <ChevronRight size={16} color="rgba(255,255,255,0.7)" />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </Animated.View>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <Text style={styles.buttonText}>Awesome!</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    raysContainer: {
        position: 'absolute',
        width: width * 1.5,
        height: width * 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ray: {
        position: 'absolute',
        width: 40,
        height: height * 1.2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
    },
    card: {
        width: width * 0.85,
        borderRadius: 32,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    cardGradient: {
        padding: 32,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    sparkleTL: {
        position: 'absolute',
        top: -10,
        left: -10,
    },
    sparkleBR: {
        position: 'absolute',
        bottom: -10,
        right: -10,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFF',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    featuresContainer: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.1)',
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
    },
    featuresTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 2,
        marginBottom: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    featureText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#FFF',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
        width: '100%',
    },
    buttonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
    },
});
