import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Trophy, Crown, Star, Zap, Key, Diamond, Medal, TrendingUp } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'https://promorang-api.vercel.app';

interface LeaderboardEntry {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string;
    profile_image?: string;
    points_earned: number;
    gems_earned: number;
    keys_used: number;
    gold_collected: number;
    composite_score: number;
}

type Period = 'daily' | 'weekly' | 'monthly';

export default function LeaderboardScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { user } = useAuthStore();

    const [period, setPeriod] = useState<Period>('daily');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userRank, setUserRank] = useState<number | null>(null);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/leaderboard/${period}`);
            const data = await response.json();
            const entries = Array.isArray(data) ? data : [];
            setLeaderboard(entries);

            // Find current user's rank
            if (user?.id) {
                const userIndex = entries.findIndex((e: LeaderboardEntry) => e.id === user.id);
                setUserRank(userIndex >= 0 ? userIndex + 1 : null);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            setLeaderboard([]);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [period, user?.id]);

    useEffect(() => {
        setIsLoading(true);
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard();
    };

    const getRankColors = (rank: number): [string, string] => {
        switch (rank) {
            case 1: return ['#FFD700', '#FFA500'];
            case 2: return ['#C0C0C0', '#A0A0A0'];
            case 3: return ['#CD7F32', '#8B4513'];
            default: return [colors.primary, '#7C3AED'];
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown size={20} color="#FFD700" />;
            case 2: return <Medal size={20} color="#C0C0C0" />;
            case 3: return <Medal size={20} color="#CD7F32" />;
            default: return null;
        }
    };

    const periodOptions: { key: Period; label: string; icon: any }[] = [
        { key: 'daily', label: 'Today', icon: Zap },
        { key: 'weekly', label: 'Week', icon: TrendingUp },
        { key: 'monthly', label: 'Month', icon: Star },
    ];

    const renderTopThree = () => {
        if (leaderboard.length < 3) return null;

        const [first, second, third] = leaderboard;

        return (
            <View style={styles.topThreeContainer}>
                {/* Second Place */}
                <View style={styles.topThreeItem}>
                    <View style={[styles.topThreeRank, { backgroundColor: '#C0C0C0' }]}>
                        <Text style={styles.topThreeRankText}>2</Text>
                    </View>
                    <Image
                        source={{ uri: second.avatar_url || second.profile_image || 'https://via.placeholder.com/60' }}
                        style={[styles.topThreeAvatar, styles.topThreeAvatarSecond]}
                    />
                    <Text style={[styles.topThreeName, { color: theme.text }]} numberOfLines={1}>
                        {second.display_name || 'User'}
                    </Text>
                    <Text style={styles.topThreeScore}>{second.composite_score.toFixed(0)}</Text>
                </View>

                {/* First Place */}
                <View style={[styles.topThreeItem, styles.topThreeItemFirst]}>
                    <Crown size={28} color="#FFD700" style={styles.crownIcon} />
                    <View style={[styles.topThreeRank, { backgroundColor: '#FFD700' }]}>
                        <Text style={[styles.topThreeRankText, { color: '#000' }]}>1</Text>
                    </View>
                    <Image
                        source={{ uri: first.avatar_url || first.profile_image || 'https://via.placeholder.com/60' }}
                        style={[styles.topThreeAvatar, styles.topThreeAvatarFirst]}
                    />
                    <Text style={[styles.topThreeName, { color: theme.text }]} numberOfLines={1}>
                        {first.display_name || 'User'}
                    </Text>
                    <Text style={[styles.topThreeScore, styles.topThreeScoreFirst]}>{first.composite_score.toFixed(0)}</Text>
                </View>

                {/* Third Place */}
                <View style={styles.topThreeItem}>
                    <View style={[styles.topThreeRank, { backgroundColor: '#CD7F32' }]}>
                        <Text style={styles.topThreeRankText}>3</Text>
                    </View>
                    <Image
                        source={{ uri: third.avatar_url || third.profile_image || 'https://via.placeholder.com/60' }}
                        style={[styles.topThreeAvatar, styles.topThreeAvatarThird]}
                    />
                    <Text style={[styles.topThreeName, { color: theme.text }]} numberOfLines={1}>
                        {third.display_name || 'User'}
                    </Text>
                    <Text style={styles.topThreeScore}>{third.composite_score.toFixed(0)}</Text>
                </View>
            </View>
        );
    };

    const renderLeaderboardItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
        const rank = index + 1;
        if (rank <= 3) return null; // Top 3 rendered separately

        const isCurrentUser = user?.id === item.id;

        return (
            <TouchableOpacity
                style={[
                    styles.leaderboardItem,
                    { backgroundColor: theme.card },
                    isCurrentUser && styles.currentUserItem
                ]}
                onPress={() => router.push({ pathname: '/user/[id]', params: { id: item.id } } as any)}
            >
                <View style={styles.rankContainer}>
                    <Text style={[styles.rankText, { color: theme.textSecondary }]}>#{rank}</Text>
                </View>

                <Image
                    source={{ uri: item.avatar_url || item.profile_image || 'https://via.placeholder.com/40' }}
                    style={styles.avatar}
                />

                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                        {item.display_name || 'Anonymous'}
                    </Text>
                    <Text style={[styles.userHandle, { color: theme.textSecondary }]}>
                        @{item.username || 'user'}
                    </Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Diamond size={14} color="#8B5CF6" />
                        <Text style={[styles.statValue, { color: theme.text }]}>{item.gems_earned}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Star size={14} color="#3B82F6" />
                        <Text style={[styles.statValue, { color: theme.text }]}>{item.points_earned}</Text>
                    </View>
                </View>

                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreValue}>{item.composite_score.toFixed(0)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return <LoadingIndicator fullScreen text="Loading leaderboard..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Leaderboard',
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { color: theme.text, fontWeight: '700' },
                }}
            />

            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <Trophy size={32} color="#FFF" />
                <View style={styles.headerText}>
                    <Text style={styles.headerTitle}>Top Performers</Text>
                    <Text style={styles.headerSubtitle}>Compete for rewards and recognition</Text>
                </View>
                {userRank && (
                    <View style={styles.userRankBadge}>
                        <Text style={styles.userRankText}>#{userRank}</Text>
                    </View>
                )}
            </LinearGradient>

            {/* Period Selector */}
            <View style={styles.periodSelector}>
                {periodOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = period === option.key;
                    return (
                        <TouchableOpacity
                            key={option.key}
                            style={[styles.periodButton, isActive && styles.periodButtonActive]}
                            onPress={() => setPeriod(option.key)}
                        >
                            <Icon size={16} color={isActive ? '#FFF' : theme.textSecondary} />
                            <Text style={[styles.periodButtonText, isActive && styles.periodButtonTextActive]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && renderTopThree()}

            {/* Rest of Leaderboard */}
            <FlatList
                data={leaderboard}
                keyExtractor={(item) => item.id}
                renderItem={renderLeaderboardItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Trophy size={64} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Rankings Yet</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                            Be the first to earn points and climb the leaderboard!
                        </Text>
                    </View>
                }
                ListHeaderComponent={
                    leaderboard.length > 3 ? (
                        <Text style={[styles.listHeader, { color: theme.textSecondary }]}>
                            Other Competitors
                        </Text>
                    ) : null
                }
            />

            {/* Score Legend */}
            <View style={[styles.legendContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Points ×0.25</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Gems ×0.40</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Keys ×0.15</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
                    <Text style={[styles.legendText, { color: theme.textSecondary }]}>Gold ×0.20</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 12,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    userRankBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    userRankText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    periodSelector: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    periodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        gap: 6,
    },
    periodButtonActive: {
        backgroundColor: colors.primary,
    },
    periodButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    periodButtonTextActive: {
        color: '#FFF',
    },
    topThreeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },
    topThreeItem: {
        alignItems: 'center',
        flex: 1,
    },
    topThreeItemFirst: {
        marginBottom: 20,
    },
    crownIcon: {
        marginBottom: 8,
    },
    topThreeRank: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        right: '25%',
        zIndex: 1,
    },
    topThreeRankText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#FFF',
    },
    topThreeAvatar: {
        borderRadius: 100,
        borderWidth: 3,
    },
    topThreeAvatarFirst: {
        width: 80,
        height: 80,
        borderColor: '#FFD700',
    },
    topThreeAvatarSecond: {
        width: 64,
        height: 64,
        borderColor: '#C0C0C0',
    },
    topThreeAvatarThird: {
        width: 64,
        height: 64,
        borderColor: '#CD7F32',
    },
    topThreeName: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
        maxWidth: 80,
    },
    topThreeScore: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.primary,
        marginTop: 4,
    },
    topThreeScoreFirst: {
        fontSize: 20,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    listHeader: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginTop: 8,
    },
    leaderboardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    currentUserItem: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    rankContainer: {
        width: 36,
        alignItems: 'center',
    },
    rankText: {
        fontSize: 14,
        fontWeight: '700',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
    },
    userHandle: {
        fontSize: 12,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginRight: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    scoreContainer: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    scoreValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 10,
    },
});
