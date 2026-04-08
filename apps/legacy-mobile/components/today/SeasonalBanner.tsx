import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sparkles, Zap } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { LinearGradient } from 'expo-linear-gradient';

interface SeasonData {
    id: string;
    name: string;
    banner_url: string;
    current_tier: number;
    completion_percentage: number;
    next_tier_xp: number;
    current_xp: number;
}

interface SeasonalBannerProps {
    seasonData: SeasonData;
    onPress?: () => void;
}

export const SeasonalBanner: React.FC<SeasonalBannerProps> = ({ seasonData, onPress }) => {
    const theme = useThemeColors();
    const { name, current_tier, completion_percentage } = seasonData;

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.container}>
            <LinearGradient
                colors={['#EA580C', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.left}>
                        <View style={styles.iconContainer}>
                            <Sparkles size={22} color="#FFF" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{name.toUpperCase()}</Text>
                            <View style={styles.tierRow}>
                                <View style={styles.tierBadge}>
                                    <Text style={styles.tierBadgeText}>TIER {current_tier}</Text>
                                </View>
                                <Text style={styles.progressText}>
                                    {completion_percentage}% to next level
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.right}>
                        <View style={styles.zapRow}>
                            <Zap size={12} color="rgba(255,255,255,0.5)" />
                            <Text style={styles.passLabel}>ACTIVE PASS</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${Math.min(100, completion_percentage)}%` }
                                ]}
                            />
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    gradient: {
        padding: 18,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 14,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 6,
    },
    tierRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tierBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    tierBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    progressText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 1,
    },
    right: {
        alignItems: 'flex-end',
        gap: 6,
    },
    zapRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    passLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    progressBarBg: {
        width: 80,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFF',
        borderRadius: 10,
    },
});
