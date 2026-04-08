import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Flame, Gift, Sunrise, Star, Sparkles } from 'lucide-react-native';
import { getStateBasedCopy, UserState } from '@/lib/userState';

interface TodayMultiplierProps {
    type: string;
    value: number;
    reason: string | null;
    userState: number; // MaturityState (0-3)
}

// Premium gradient themes for multiplier types
const MULTIPLIER_THEMES: Record<string, {
    colors: [string, string, string];
    iconGradient: [string, string];
    textColor: string;
    iconColor: string;
}> = {
    base: {
        colors: ['rgba(31, 41, 55, 0.8)', 'rgba(17, 24, 39, 0.8)', 'rgba(17, 24, 39, 0.9)'],
        iconGradient: ['#9CA3AF', '#6B7280'],
        textColor: '#D1D5DB',
        iconColor: '#FFF',
    },
    streak_bonus: {
        colors: ['rgba(234, 88, 12, 0.3)', 'rgba(217, 119, 6, 0.2)', 'rgba(202, 138, 4, 0.1)'],
        iconGradient: ['#F97316', '#F59E0B'],
        textColor: '#FB923C',
        iconColor: '#FFF',
    },
    catchup_boost: {
        colors: ['rgba(5, 150, 105, 0.3)', 'rgba(13, 148, 136, 0.2)', 'rgba(8, 145, 178, 0.1)'],
        iconGradient: ['#34D399', '#14B8A6'],
        textColor: '#34D399',
        iconColor: '#FFF',
    },
    weekend_wave: {
        colors: ['rgba(147, 51, 234, 0.3)', 'rgba(219, 39, 119, 0.2)', 'rgba(192, 38, 211, 0.1)'],
        iconGradient: ['#A78BFA', '#EC4899'],
        textColor: '#C084FC',
        iconColor: '#FFF',
    },
    welcome_boost: {
        colors: ['rgba(37, 99, 235, 0.3)', 'rgba(79, 70, 229, 0.2)', 'rgba(124, 58, 237, 0.1)'],
        iconGradient: ['#60A5FA', '#6366F1'],
        textColor: '#60A5FA',
        iconColor: '#FFF',
    },
    milestone: {
        colors: ['rgba(202, 138, 4, 0.3)', 'rgba(217, 119, 6, 0.2)', 'rgba(234, 88, 12, 0.1)'],
        iconGradient: ['#FACC15', '#F59E0B'],
        textColor: '#FACC15',
        iconColor: '#FFF',
    },
    sponsored: {
        colors: ['rgba(8, 145, 178, 0.3)', 'rgba(2, 132, 199, 0.2)', 'rgba(37, 99, 235, 0.1)'],
        iconGradient: ['#22D3EE', '#0EA5E9'],
        textColor: '#22D3EE',
        iconColor: '#FFF',
    },
};

const MULTIPLIER_ICONS: Record<string, any> = {
    base: Zap,
    streak_bonus: Flame,
    catchup_boost: Gift,
    weekend_wave: Sunrise,
    welcome_boost: Star,
    milestone: Sparkles,
    sponsored: Zap,
};

export const TodayMultiplier: React.FC<TodayMultiplierProps> = ({ type, value, reason, userState }) => {
    // Fallback for userState helper if not available on mobile yet
    const multiplierLabel = userState === 0 ? "Multiplier" : "Boost";

    const theme = MULTIPLIER_THEMES[type] || MULTIPLIER_THEMES.base;
    const Icon = MULTIPLIER_ICONS[type] || MULTIPLIER_ICONS.base;
    const isActive = value > 1;

    return (
        <LinearGradient
            colors={theme.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <LinearGradient
                    colors={theme.iconGradient}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Icon size={14} color={theme.iconColor} />
                </LinearGradient>
                <Text style={styles.label}>{multiplierLabel.toUpperCase()}</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.value, { color: theme.textColor, opacity: isActive ? 1 : 0.7 }]}>
                    {value.toFixed(1)}×
                </Text>

                <Text style={styles.reason} numberOfLines={2}>
                    {reason ? reason : (userState === 0 ? "First action boost" : "Base rate")}
                </Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        minHeight: 120,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    value: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 4,
    },
    reason: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        lineHeight: 14,
    }
});
