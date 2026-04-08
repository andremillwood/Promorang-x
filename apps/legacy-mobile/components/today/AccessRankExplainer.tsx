import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles, ChevronRight, Trophy, Users, Ticket, TrendingUp, Gift, Flame, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Rank definitions with benefits (Shared with web)
const RANK_DATA = [
    {
        level: 0,
        name: 'New',
        emoji: '🌱',
        daysRequired: 0,
        unlocks: ['Access to Today page', 'Entry to deals & events'],
    },
    {
        level: 1,
        name: 'Explorer',
        emoji: '🔍',
        daysRequired: 1,
        unlocks: ['Daily Draw entries', 'Post content for proof'],
    },
    {
        level: 2,
        name: 'Member',
        emoji: '⭐',
        daysRequired: 7,
        unlocks: ['Leaderboard access', 'PromoShare lottery'],
    },
    {
        level: 3,
        name: 'Insider',
        emoji: '💎',
        daysRequired: 14,
        unlocks: ['Growth Hub', 'Full platform access'],
    },
];

interface AccessRankExplainerProps {
    currentRank: number;
    daysActive?: number;
    streakDays?: number;
}

export const AccessRankExplainer: React.FC<AccessRankExplainerProps> = ({
    currentRank,
    daysActive = 0,
    streakDays = 0
}) => {
    const router = useRouter();
    const theme = useThemeColors();
    const [expanded, setExpanded] = React.useState(false);

    const currentRankData = RANK_DATA[Math.min(currentRank, RANK_DATA.length - 1)];
    const nextRankData = currentRank < RANK_DATA.length - 1 ? RANK_DATA[currentRank + 1] : null;

    // Calculate progress to next rank
    const currentThreshold = currentRankData.daysRequired;
    const nextThreshold = nextRankData?.daysRequired || currentThreshold;
    const daysIntoCurrentRank = daysActive - currentThreshold;
    const daysNeededForNext = nextThreshold - currentThreshold;
    const progressPercent = nextRankData
        ? Math.min(Math.max((daysIntoCurrentRank / daysNeededForNext) * 100, 0), 100)
        : 100;
    const daysUntilNext = Math.max(nextThreshold - daysActive, 0);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.outerContainer}>
            <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.container, { borderColor: 'rgba(139, 92, 246, 0.2)' }]}
            >
                {/* Header Row */}
                <View style={styles.header}>
                    <View style={styles.rankBadge}>
                        <Text style={styles.rankEmoji}>{currentRankData.emoji}</Text>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, { color: theme.text }]}>
                            Rank: {currentRankData.name}
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Day {daysActive} on Promorang
                        </Text>
                    </View>
                    {streakDays > 0 && (
                        <View style={styles.streakBadge}>
                            <Flame size={14} color="#F59E0B" />
                            <Text style={styles.streakText}>{streakDays}</Text>
                        </View>
                    )}
                </View>

                {/* Progress Bar */}
                {nextRankData && (
                    <View style={styles.progressSection}>
                        <View style={styles.progressLabels}>
                            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                                Progress to {nextRankData.name}
                            </Text>
                            <Text style={[styles.progressValue, { color: theme.text }]}>
                                {Math.round(progressPercent)}%
                            </Text>
                        </View>
                        <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                            <LinearGradient
                                colors={['#8B5CF6', '#EC4899']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                            />
                        </View>
                        <Text style={[styles.progressHint, { color: theme.textSecondary }]}>
                            {daysUntilNext === 0
                                ? 'Complete an action to rank up!'
                                : `${daysUntilNext} more day${daysUntilNext !== 1 ? 's' : ''} to reach ${nextRankData.name}`
                            }
                        </Text>
                    </View>
                )}

                {/* Next Unlock Preview */}
                {nextRankData && (
                    <View style={[styles.unlockCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <LinearGradient
                            colors={['#8B5CF6', '#EC4899']}
                            style={styles.unlockIcon}
                        >
                            <Sparkles size={16} color="#FFF" />
                        </LinearGradient>
                        <View style={styles.unlockText}>
                            <Text style={[styles.unlockTitle, { color: theme.text }]}>
                                Next: {nextRankData.unlocks[0]}
                            </Text>
                            <Text style={[styles.unlockSubtitle, { color: theme.textSecondary }]}>
                                Unlocks at {nextRankData.name} rank
                            </Text>
                        </View>
                    </View>
                )}

                {/* Why It Matters */}
                <TouchableOpacity
                    style={styles.expandButton}
                    onPress={toggleExpand}
                    activeOpacity={0.7}
                >
                    <ChevronDown
                        size={18}
                        color={theme.textSecondary}
                        style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                    />
                    <Text style={[styles.expandText, { color: theme.textSecondary }]}>
                        Why does Access Rank matter?
                    </Text>
                </TouchableOpacity>

                {expanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.benefitItem}>
                            <Gift size={16} color="#10B981" />
                            <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                                Earlier access to limited opportunities
                            </Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Ticket size={16} color="#8B5CF6" />
                            <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                                Unlock daily draws & lotteries
                            </Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <TrendingUp size={16} color="#3B82F6" />
                            <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                                Multiply earnings via Growth Hub
                            </Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Users size={16} color="#F59E0B" />
                            <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                                Unlock referral rewards
                            </Text>
                        </View>
                    </View>
                )}

                {/* CTA */}
                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    <LinearGradient
                        colors={['#8B5CF6', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaText}>View Full Progress</Text>
                        <ChevronRight size={18} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: 16,
    },
    container: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    rankBadge: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankEmoji: {
        fontSize: 24,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
    },
    subtitle: {
        fontSize: 13,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    streakText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#92400E',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressValue: {
        fontSize: 12,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    progressHint: {
        fontSize: 11,
        fontStyle: 'italic',
    },
    unlockCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    unlockIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    unlockText: {
        flex: 1,
    },
    unlockTitle: {
        fontSize: 13,
        fontWeight: '700',
    },
    unlockSubtitle: {
        fontSize: 11,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    expandText: {
        fontSize: 13,
        fontWeight: '600',
    },
    expandedContent: {
        paddingLeft: 26,
        paddingVertical: 8,
        gap: 12,
        marginBottom: 8,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    benefitText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    ctaButton: {
        marginTop: 8,
        borderRadius: 14,
        overflow: 'hidden',
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    ctaText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
});
