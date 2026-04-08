/**
 * Unlock Progress Bar
 * 
 * Shows progress toward unlocking full platform features.
 * Displayed for users in maturity state 1.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Rocket } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface UnlockProgressBarProps {
    completedQuests: number;
    totalQuests?: number;
}

export default function UnlockProgressBar({
    completedQuests,
    totalQuests = 3
}: UnlockProgressBarProps) {
    const theme = useThemeColors();
    const progress = Math.min(completedQuests / totalQuests, 1);
    const milestones = ['Landed', 'Quest 1', 'Quest 2', 'Unlocked!'];

    return (
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Accent stripe */}
            <LinearGradient
                colors={['rgba(59, 130, 246, 0.3)', 'rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.accentStripe}
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <Rocket size={20} color="#3b82f6" />
                    </View>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>Almost there, Explorer!</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Complete {totalQuests} side quests to unlock full platform features
                        </Text>
                    </View>
                </View>
                <Text style={[styles.count, { color: theme.text }]}>
                    {Math.min(completedQuests, totalQuests)}/{totalQuests}
                </Text>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                <LinearGradient
                    colors={['#3b82f6', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
            </View>

            {/* Milestones */}
            <View style={styles.milestones}>
                {milestones.map((label, index) => {
                    const isCompleted = index === 0 || completedQuests >= index;
                    const isLast = index === milestones.length - 1;
                    return (
                        <Text
                            key={label}
                            style={[
                                styles.milestone,
                                { color: isCompleted ? (isLast ? '#8b5cf6' : '#3b82f6') : theme.textSecondary }
                            ]}
                        >
                            {label}
                        </Text>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        overflow: 'hidden',
    },
    accentStripe: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
    },
    count: {
        fontSize: 14,
        fontWeight: '700',
    },
    progressTrack: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
    },
    milestones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    milestone: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
