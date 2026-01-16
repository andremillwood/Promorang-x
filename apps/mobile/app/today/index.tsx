import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import {
    Flame,
    Gift,
    Zap,
    Sparkles,
    Trophy,
    Clock,
    ChevronRight,
    Rocket,
    CheckCircle2,
    Heart,
    Mic,
    MessageCircle,
    Users
} from 'lucide-react-native';
import colors from '@/constants/colors';

const API_URL = 'https://promorang-api.vercel.app';

interface ReflectionItem {
    id: string;
    message: string;
    category: 'activity' | 'milestone' | 'streak' | 'community';
    icon: string;
    accent_color: string;
}

interface FeaturedItem {
    id: string;
    type: 'promorang_drop' | 'community';
    title: string;
    preview: string;
    accent_color: string;
    drop_id?: string;
}

interface TodayState {
    headline: {
        type: string;
        payload: {
            title: string;
            subtitle?: string;
            cta_text?: string;
            cta_action?: string;
            drop_id?: string;
            reward_amount?: number;
            multiplier?: number;
        };
    };
    multiplier: {
        type: string;
        value: number;
        reason: string | null;
    };
    yesterday_rank: {
        rank: number | null;
        percentile: number | null;
        change: number;
    } | null;
    today_progress: {
        tickets: number;
        dynamic_points: number;
    };
    draw: {
        auto_entered: boolean;
        tickets: number;
        status: string;
        result?: {
            won: boolean;
            prize_type?: string;
            prize_amount?: number;
        };
    };
    reflections: ReflectionItem[];
    featured_content: FeaturedItem[];
    headline_viewed: boolean;
    headline_engaged: boolean;
}

export default function TodayScreen() {
    const router = useRouter();
    const { token, user } = useAuthStore();
    const theme = useThemeColors();
    const [todayState, setTodayState] = useState<TodayState | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTodayState = async () => {
        try {
            const response = await fetch(`${API_URL}/api/today`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (response.ok) {
                const data = await response.json();
                setTodayState(data);
            }
        } catch (error) {
            console.error('[Today] Error fetching state:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTodayState();
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTodayState();
    }, []);

    const handleHeadlinePress = () => {
        router.push('/today/opportunity' as any);
    };

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <AppHeader showLogo showNotifications showAvatar />
                <View style={styles.loadingContainer}>
                    <LoadingIndicator />
                </View>
            </View>
        );
    }

    const headlineType = todayState?.headline?.type || 'reward';
    const headlineThemes: Record<string, { bg: string; icon: any; color: string }> = {
        reward: { bg: '#3B82F620', icon: Gift, color: '#3B82F6' },
        multiplier: { bg: '#F59E0B20', icon: Zap, color: '#F59E0B' },
        chance: { bg: '#8B5CF620', icon: Sparkles, color: '#8B5CF6' },
    };
    const currentTheme = headlineThemes[headlineType] || headlineThemes.reward;
    const HeadlineIcon = currentTheme.icon;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <AppHeader showLogo showNotifications showAvatar />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>Today</Text>
                        <Text style={[styles.dateText, { color: theme.textSecondary }]}>{dateStr}</Text>
                    </View>
                    {(user as any)?.points_streak_days > 0 && (
                        <View style={styles.streakBadge}>
                            <Flame size={16} color="#F59E0B" />
                            <Text style={styles.streakText}>{(user as any).points_streak_days}-day</Text>
                        </View>
                    )}
                </View>

                {/* Headline Card */}
                <TouchableOpacity onPress={handleHeadlinePress} activeOpacity={0.9}>
                    <Card style={[styles.headlineCard, { backgroundColor: currentTheme.bg }]} variant="elevated">
                        <View style={styles.headlineBadge}>
                            <HeadlineIcon size={16} color={currentTheme.color} />
                            <Text style={[styles.headlineBadgeText, { color: currentTheme.color }]}>
                                {headlineType === 'reward' ? 'Featured Drop' : headlineType === 'multiplier' ? 'Multiplier Day' : 'Lucky Event'}
                            </Text>
                        </View>
                        <Text style={[styles.headlineTitle, { color: theme.text }]}>
                            {todayState?.headline?.payload?.title || "Today's Opportunity"}
                        </Text>
                        <Text style={[styles.headlineSubtitle, { color: theme.textSecondary }]}>
                            {todayState?.headline?.payload?.subtitle || 'Tap to explore'}
                        </Text>
                        <View style={styles.headlineCta}>
                            <Text style={[styles.headlineCtaText, { color: currentTheme.color }]}>
                                {todayState?.headline?.payload?.cta_text || 'Explore'}
                            </Text>
                            <ChevronRight size={18} color={currentTheme.color} />
                        </View>
                    </Card>
                </TouchableOpacity>

                {/* Multiplier + Rank Row */}
                <View style={styles.statsRow}>
                    <Card style={styles.statCard} variant="elevated">
                        <Zap size={20} color="#F59E0B" />
                        <Text style={[styles.statValue, { color: theme.text }]}>
                            {todayState?.multiplier?.value || 1.0}×
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Multiplier</Text>
                    </Card>
                    <Card style={styles.statCard} variant="elevated">
                        <Trophy size={20} color="#8B5CF6" />
                        <Text style={[styles.statValue, { color: theme.text }]}>
                            #{todayState?.yesterday_rank?.rank || '--'}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Yesterday</Text>
                    </Card>
                </View>

                {/* Being Seen: Reflection Strip */}
                {todayState?.reflections && todayState.reflections.length > 0 && (
                    <View style={styles.reflectionSection}>
                        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>NOTICED</Text>
                        {todayState.reflections.map((reflection) => {
                            const iconColors: Record<string, string> = {
                                blue: '#3B82F6', pink: '#EC4899', purple: '#8B5CF6', orange: '#F59E0B', emerald: '#10B981'
                            };
                            const bgColors: Record<string, string> = {
                                blue: '#3B82F620', pink: '#EC489920', purple: '#8B5CF620', orange: '#F59E0B20', emerald: '#10B98120'
                            };
                            const iconColor = iconColors[reflection.accent_color] || iconColors.blue;
                            const bgColor = bgColors[reflection.accent_color] || bgColors.blue;
                            const IconComponent = reflection.icon === 'flame' ? Flame :
                                reflection.icon === 'heart' ? Heart :
                                    reflection.icon === 'mic' ? Mic : Sparkles;
                            return (
                                <View key={reflection.id} style={[styles.reflectionItem, { backgroundColor: bgColor }]}>
                                    <IconComponent size={16} color={iconColor} />
                                    <Text style={[styles.reflectionText, { color: theme.text }]}>{reflection.message}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Being Seen: Featured Today */}
                {todayState?.featured_content && todayState.featured_content.length > 0 && (
                    <View style={styles.featuredSection}>
                        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>FEATURED TODAY</Text>
                        {todayState.featured_content.map((item) => {
                            const colors: Record<string, string> = {
                                emerald: '#10B981', indigo: '#6366F1', blue: '#3B82F6', purple: '#8B5CF6'
                            };
                            const bgColors: Record<string, string> = {
                                emerald: '#10B98120', indigo: '#6366F120', blue: '#3B82F620', purple: '#8B5CF620'
                            };
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.featuredItem, { backgroundColor: theme.card }]}
                                    onPress={() => router.push('/contribute' as any)}
                                >
                                    <View style={styles.featuredItemContent}>
                                        <Text style={[styles.featuredTitle, { color: theme.text }]}>{item.title}</Text>
                                        <Text style={[styles.featuredPreview, { color: colors[item.accent_color] || colors.blue }]}>{item.preview}</Text>
                                    </View>
                                    <View style={[styles.featuredIcon, { backgroundColor: bgColors[item.accent_color] || bgColors.blue }]}>
                                        {item.type === 'promorang_drop' ? (
                                            <MessageCircle size={16} color={colors[item.accent_color] || colors.blue} />
                                        ) : (
                                            <Users size={16} color={colors[item.accent_color] || colors.blue} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Soft Invitation */}
                <TouchableOpacity
                    style={styles.softInvitation}
                    onPress={() => router.push('/contribute' as any)}
                >
                    <Text style={[styles.softInvitationText, { color: theme.textSecondary }]}>
                        Want to add your voice?
                    </Text>
                </TouchableOpacity>

                {/* Draw Section */}
                <Card style={styles.drawCard} variant="elevated">
                    <View style={styles.drawHeader}>
                        <View style={styles.drawTitleRow}>
                            <Sparkles size={18} color="#8B5CF6" />
                            <Text style={[styles.drawTitle, { color: theme.text }]}>Daily Draw</Text>
                        </View>
                        <View style={styles.drawTimerBadge}>
                            <Clock size={12} color="#8B5CF6" />
                            <Text style={styles.drawTimerText}>Resets 10:00 UTC</Text>
                        </View>
                    </View>
                    <View style={styles.drawContent}>
                        <View style={styles.ticketRow}>
                            <Text style={[styles.ticketLabel, { color: theme.textSecondary }]}>Your Tickets</Text>
                            <Text style={[styles.ticketValue, { color: theme.text }]}>
                                {todayState?.draw?.tickets || 0}
                            </Text>
                        </View>
                        {todayState?.draw?.auto_entered && (
                            <View style={styles.enteredBadge}>
                                <CheckCircle2 size={14} color="#10B981" />
                                <Text style={styles.enteredText}>You're entered!</Text>
                            </View>
                        )}
                    </View>
                </Card>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <Text style={[styles.quickActionsTitle, { color: theme.textSecondary }]}>QUICK DESTINATIONS</Text>
                    <View style={styles.quickActionsGrid}>
                        <TouchableOpacity
                            style={[styles.quickActionCard, { backgroundColor: theme.card }]}
                            onPress={() => router.push('/(tabs)/discover')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#10B98120' }]}>
                                <Rocket size={18} color="#10B981" />
                            </View>
                            <Text style={[styles.quickActionLabel, { color: theme.text }]}>Earn</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.quickActionCard, { backgroundColor: theme.card }]}
                            onPress={() => router.push('/promoshare')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF620' }]}>
                                <Sparkles size={18} color="#8B5CF6" />
                            </View>
                            <Text style={[styles.quickActionLabel, { color: theme.text }]}>PromoShare</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.quickActionCard, { backgroundColor: theme.card }]}
                            onPress={() => router.push('/leaderboard')}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: '#F59E0B20' }]}>
                                <Trophy size={18} color="#F59E0B" />
                            </View>
                            <Text style={[styles.quickActionLabel, { color: theme.text }]}>Rankings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
    },
    dateText: {
        fontSize: 14,
        marginTop: 2,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    streakText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#92400E',
    },
    headlineCard: {
        padding: 20,
        marginBottom: 16,
        borderRadius: 20,
    },
    headlineBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    headlineBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headlineTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 6,
    },
    headlineSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    headlineCta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headlineCtaText: {
        fontSize: 15,
        fontWeight: '700',
    },
    earningsCard: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 16,
    },
    earningsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    earningsIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#3B82F620',
        justifyContent: 'center',
        alignItems: 'center',
    },
    earningsTextContainer: {
        flex: 1,
    },
    earningsLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    earningsValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    checklistCard: {
        padding: 0,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    checklistHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    checklistTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    checklistProgress: {
        backgroundColor: '#10B98120',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    checklistProgressText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#10B981',
    },
    checklistItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    checklistItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    checklistItemText: {
        flex: 1,
    },
    checklistItemLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    completedText: {
        textDecorationLine: 'line-through',
    },
    checklistItemSubtitle: {
        fontSize: 11,
        marginTop: 2,
    },
    checklistItemPoints: {
        fontSize: 13,
        fontWeight: '700',
        color: '#3B82F6',
    },
    drawCard: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 16,
    },
    drawHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    drawTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    drawTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    drawTimerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#8B5CF610',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    drawTimerText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#8B5CF6',
    },
    drawContent: {
        gap: 12,
    },
    ticketRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketLabel: {
        fontSize: 14,
    },
    ticketValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    enteredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#10B98110',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    enteredText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#10B981',
    },
    quickActions: {
        marginTop: 8,
    },
    quickActionsTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    quickActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    // Being Seen styles
    reflectionSection: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
    },
    reflectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    reflectionText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    featuredSection: {
        marginBottom: 16,
    },
    featuredItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    featuredItemContent: {
        flex: 1,
    },
    featuredTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    featuredPreview: {
        fontSize: 12,
        fontWeight: '500',
    },
    featuredIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    softInvitation: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    softInvitationText: {
        fontSize: 14,
        opacity: 0.6,
    },
});
