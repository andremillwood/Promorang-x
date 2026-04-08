import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, Users, Clock, Target } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Forecast } from '@/store/forecastStore';
import colors from '@/constants/colors';

interface ForecastCardProps {
    forecast: Forecast;
    onPress: (id: string) => void;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, onPress }) => {
    const theme = useThemeColors();

    const progress = forecast.target.value > 0 ? forecast.currentValue / forecast.target.value : 0;
    const timeLeft = new Date(forecast.expiresAt).getTime() - new Date().getTime();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

    const getPlatformColor = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'instagram': return '#E1306C';
            case 'tiktok': return '#000000';
            case 'twitter': return '#1DA1F2';
            case 'youtube': return '#FF0000';
            case 'facebook': return '#4267B2';
            default: return colors.primary;
        }
    };

    return (
        <TouchableOpacity
            onPress={() => onPress(forecast.id)}
            activeOpacity={0.85}
        >
            <Card style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card }])}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.typeTag}>
                        <TrendingUp size={14} color={colors.primary} />
                        <Text style={styles.typeText}>FORECAST</Text>
                    </View>
                    <View style={[styles.platformBadge, { backgroundColor: getPlatformColor(forecast.target.platform) }]}>
                        <Text style={styles.platformText}>{forecast.target.platform}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                    {forecast.title}
                </Text>

                {/* Creator */}
                <View style={styles.creatorRow}>
                    <Avatar
                        source={forecast.creator.avatar}
                        size="sm"
                        name={forecast.creator.name}
                    />
                    <Text style={[styles.creatorName, { color: theme.textSecondary }]}>
                        by {forecast.creator.name}
                    </Text>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                            {forecast.currentValue.toLocaleString()} / {forecast.target.value.toLocaleString()} {forecast.target.metric}
                        </Text>
                        <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
                    </View>
                    <ProgressBar progress={progress} height={6} />
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Target size={16} color="#10B981" />
                        <Text style={[styles.statValue, { color: theme.text }]}>{forecast.odds}x</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Odds</Text>
                    </View>
                    <View style={styles.stat}>
                        <Users size={16} color="#8B5CF6" />
                        <Text style={[styles.statValue, { color: theme.text }]}>{forecast.participants}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Predictors</Text>
                    </View>
                    <View style={styles.stat}>
                        <Clock size={16} color={daysLeft <= 1 ? '#EF4444' : '#F59E0B'} />
                        <Text style={[styles.statValue, { color: theme.text }]}>{daysLeft}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Days Left</Text>
                    </View>
                </View>

                {/* CTA */}
                <View style={styles.ctaContainer}>
                    <Text style={styles.ctaText}>Make Prediction →</Text>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primary,
    },
    platformBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    platformText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 10,
        lineHeight: 24,
    },
    creatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    creatorName: {
        fontSize: 13,
    },
    progressSection: {
        marginBottom: 14,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressText: {
        fontSize: 12,
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        marginBottom: 12,
    },
    stat: {
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 10,
    },
    ctaContainer: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    ctaText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
});
