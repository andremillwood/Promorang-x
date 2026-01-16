import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Flame, Gift, Calendar, Trophy, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';

const API_URL = 'https://promorang-api.vercel.app';

interface StreakStatus {
    current_streak: number;
    longest_streak: number;
    checked_in_today: boolean;
    next_reward: number;
    total_streak_gems: number;
}

interface CheckInResult {
    success: boolean;
    streak: number;
    reward: number;
    is_milestone: boolean;
    message: string;
    already_checked_in?: boolean;
}

export const StreakWidget = () => {
    const theme = useThemeColors();
    const { token } = useAuthStore();
    const [status, setStatus] = useState<StreakStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);
    const [result, setResult] = useState<CheckInResult | null>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/api/streaks/status`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    setStatus(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching streak status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        if (!token || checkingIn || status?.checked_in_today) return;

        setCheckingIn(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            const response = await fetch(`${API_URL}/api/streaks/checkin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();

            if (data.status === 'success') {
                setResult(data.data);
                if (data.data.success && !data.data.already_checked_in) {
                    // Success!
                    fetchStatus();
                }
            }
        } catch (error) {
            console.error('Error checking in:', error);
        } finally {
            setCheckingIn(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    if (!status) return null;

    const streakLevel = status.current_streak >= 30 ? 'legendary' :
        status.current_streak >= 14 ? 'epic' :
            status.current_streak >= 7 ? 'rare' : 'common';

    const levelColors: Record<string, [string, string, ...string[]]> = {
        common: ['#FB923C', '#F59E0B'],
        rare: ['#3B82F6', '#06B6D4'],
        epic: ['#8B5CF6', '#EC4899'],
        legendary: ['#FACC15', '#FB923C', '#EF4444'],
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <LinearGradient
                        colors={levelColors[streakLevel]}
                        style={styles.iconContainer}
                    >
                        <Flame size={20} color="white" />
                    </LinearGradient>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>Daily Streak</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Keep the fire burning!</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Text style={[styles.streakCount, { color: colors.primary }]}>{status.current_streak}</Text>
                    <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>DAYS</Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Trophy size={16} color="#F59E0B" />
                    <Text style={[styles.statValue, { color: theme.text }]}>{status.longest_streak}</Text>
                    <Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>BEST</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Gift size={16} color="#10B981" />
                    <Text style={[styles.statValue, { color: theme.text }]}>{status.next_reward}</Text>
                    <Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>NEXT</Text>
                </View>
                <View style={[styles.statItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <Zap size={16} color="#3B82F6" />
                    <Text style={[styles.statValue, { color: theme.text }]}>{status.total_streak_gems}</Text>
                    <Text style={[styles.statLabelSmall, { color: theme.textSecondary }]}>TOTAL</Text>
                </View>
            </View>

            {/* Check-in Button */}
            <TouchableOpacity
                onPress={handleCheckIn}
                disabled={checkingIn || status.checked_in_today}
                activeOpacity={0.8}
            >
                {status.checked_in_today ? (
                    <View style={[styles.button, styles.buttonCompleted]}>
                        <Calendar size={20} color="white" />
                        <Text style={styles.buttonText}>✓ Checked in today!</Text>
                    </View>
                ) : (
                    <LinearGradient
                        colors={levelColors[streakLevel]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.button}
                    >
                        {checkingIn ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Flame size={20} color="white" />
                                <Text style={styles.buttonText}>Claim Daily Bonus ({status.next_reward} 💎)</Text>
                            </>
                        )}
                    </LinearGradient>
                )}
            </TouchableOpacity>

            {/* Result Message */}
            {result && !status.checked_in_today && (
                <View style={styles.resultContainer}>
                    <Text style={[styles.resultText, result.success ? styles.textSuccess : styles.textWarning]}>
                        {result.message}
                    </Text>
                </View>
            )}

            {/* Streak Calendar Preview */}
            <View style={styles.calendarPreview}>
                {[...Array(7)].map((_, i) => {
                    const daysFilled = Math.min(status.current_streak, 7);
                    const isFilled = i < daysFilled;
                    return (
                        <View
                            key={i}
                            style={[
                                styles.calendarDay,
                                isFilled ? { backgroundColor: levelColors[streakLevel][0] } : { borderStyle: 'dashed', borderColor: theme.border, borderWidth: 1 }
                            ]}
                        >
                            {isFilled && <Text style={styles.calendarDayText}>{i + 1}</Text>}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    container: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 12,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    streakCount: {
        fontSize: 28,
        fontWeight: '900',
        lineHeight: 28,
    },
    streakLabel: {
        fontSize: 10,
        fontWeight: '800',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '900',
        marginTop: 4,
    },
    statLabelSmall: {
        fontSize: 10,
        fontWeight: '700',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    buttonCompleted: {
        backgroundColor: '#10B981',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '900',
    },
    resultContainer: {
        marginTop: 12,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
    },
    resultText: {
        fontSize: 13,
        fontWeight: '700',
    },
    textSuccess: {
        color: '#047857',
    },
    textWarning: {
        color: '#B45309',
    },
    calendarPreview: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 16,
    },
    calendarDay: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarDayText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '800',
    },
});
