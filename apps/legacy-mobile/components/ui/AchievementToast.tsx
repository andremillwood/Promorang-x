import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Zap, Gift, Diamond, Crown, Target, Flame } from 'lucide-react-native';
import { haptics } from '@/lib/haptics';

const { width } = Dimensions.get('window');

export type AchievementType = 
    | 'drop_complete'
    | 'coupon_earned'
    | 'level_up'
    | 'streak'
    | 'referral'
    | 'first_drop'
    | 'gems_earned'
    | 'leaderboard';

interface AchievementToastProps {
    visible: boolean;
    type: AchievementType;
    title: string;
    subtitle?: string;
    value?: string | number;
    onHide?: () => void;
    duration?: number;
}

const ACHIEVEMENT_CONFIG: Record<AchievementType, {
    icon: any;
    iconColor: string;
    gradient: [string, string];
}> = {
    drop_complete: {
        icon: Zap,
        iconColor: '#F59E0B',
        gradient: ['#F59E0B', '#EF4444'],
    },
    coupon_earned: {
        icon: Gift,
        iconColor: '#10B981',
        gradient: ['#10B981', '#3B82F6'],
    },
    level_up: {
        icon: Crown,
        iconColor: '#FFD700',
        gradient: ['#8B5CF6', '#EC4899'],
    },
    streak: {
        icon: Flame,
        iconColor: '#FF6B35',
        gradient: ['#FF6B35', '#F59E0B'],
    },
    referral: {
        icon: Target,
        iconColor: '#3B82F6',
        gradient: ['#3B82F6', '#8B5CF6'],
    },
    first_drop: {
        icon: Star,
        iconColor: '#FFD700',
        gradient: ['#FFD700', '#F59E0B'],
    },
    gems_earned: {
        icon: Diamond,
        iconColor: '#8B5CF6',
        gradient: ['#8B5CF6', '#EC4899'],
    },
    leaderboard: {
        icon: Trophy,
        iconColor: '#FFD700',
        gradient: ['#6366F1', '#8B5CF6'],
    },
};

export function AchievementToast({
    visible,
    type,
    title,
    subtitle,
    value,
    onHide,
    duration = 3000,
}: AchievementToastProps) {
    const translateY = useRef(new Animated.Value(-150)).current;
    const scale = useRef(new Animated.Value(0.8)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const config = ACHIEVEMENT_CONFIG[type];
    const Icon = config.icon;

    useEffect(() => {
        if (visible) {
            showToast();
        }
    }, [visible]);

    const showToast = async () => {
        // Trigger haptic feedback
        if (type === 'level_up') {
            await haptics.levelUp();
        } else if (type === 'gems_earned' || type === 'coupon_earned') {
            await haptics.collect();
        } else {
            await haptics.success();
        }

        // Animate in
        Animated.parallel([
            Animated.spring(translateY, {
                toValue: 60,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto hide after duration
        setTimeout(() => {
            hideToast();
        }, duration);
    };

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -150,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide?.();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }, { scale }],
                    opacity,
                },
            ]}
        >
            <LinearGradient
                colors={config.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <View style={styles.iconContainer}>
                    <Icon size={28} color={config.iconColor} />
                </View>
                
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>

                {value && (
                    <View style={styles.valueContainer}>
                        <Text style={styles.value}>{value}</Text>
                    </View>
                )}
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        zIndex: 9999,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    valueContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    value: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFF',
    },
});

export default AchievementToast;
