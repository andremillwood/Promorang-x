import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Flame, Gift, Zap, Sparkles, ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';
import TodayLayout from '@/components/TodayLayout';
import { AccessRankExplainer } from '@/components/today/AccessRankExplainer';
import { WhatsNextCard } from '@/components/today/WhatsNextCard';
import { EverydayValue, RankUpActions, BusinessGateway } from '@/components/today/TodaySections';
import { TodayDraw } from '@/components/today/TodayDraw';
import { ReflectionStrip } from '@/components/today/ReflectionStrip';
import { FeaturedToday } from '@/components/today/FeaturedToday';
import { useMaturityStore, UserMaturityState } from '@/store/maturityStore';
import { TodayMultiplier } from '@/components/today/TodayMultiplier';
import { TodayRank } from '@/components/today/TodayRank';
import { QuickDestinations } from '@/components/today/QuickDestinations';

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
    const { maturityState } = useMaturityStore();
    const theme = useThemeColors();
    const [todayState, setTodayState] = useState<TodayState | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const isEarlyState = maturityState < UserMaturityState.REWARDED;

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

    const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    if (loading) {
        return (
            <TodayLayout>
                <View style={[styles.container, { backgroundColor: theme.background }]}>
                    <AppHeader showLogo showNotifications showAvatar />
                    <View style={styles.loadingContainer}>
                        <LoadingIndicator />
                    </View>
                </View>
            </TodayLayout>
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
        <TodayLayout>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <AppHeader showLogo showNotifications showAvatar />
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
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

                    {/* Rank Explainer for S0/S1 */}
                    {isEarlyState && (
                        <AccessRankExplainer
                            currentRank={maturityState}
                            daysActive={3}
                            streakDays={(user as any)?.points_streak_days || 0}
                        />
                    )}

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

                    {/* Multiplier & Rank Row */}
                    <View style={styles.statsRow}>
                        <View style={{ flex: 1 }}>
                            <TodayMultiplier
                                type={todayState?.multiplier.type || 'base'}
                                value={todayState?.multiplier.value || 1.0}
                                reason={todayState?.multiplier.reason || null}
                                userState={maturityState}
                            />
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={{ flex: 1 }}>
                            <TodayRank
                                rank={todayState?.yesterday_rank?.rank || null}
                                percentile={todayState?.yesterday_rank?.percentile || null}
                                change={todayState?.yesterday_rank?.change || 0}
                                todayProgress={{
                                    tickets: todayState?.today_progress?.tickets || 0,
                                    dynamic_points: todayState?.today_progress?.dynamic_points || 0,
                                    label: ''
                                }}
                                userState={maturityState}
                            />
                        </View>
                    </View>

                    {/* Smart Guidance */}
                    <WhatsNextCard />

                    {/* Everyday Value: Prioritized for S2+ */}
                    {!isEarlyState && <EverydayValue title="Discovery Hub" />}

                    {/* Draw Section */}
                    {/* ... existing draw code ... */}
                    <TodayDraw
                        tickets={todayState?.draw?.tickets || 0}
                        autoEntered={todayState?.draw?.auto_entered || false}
                        prizes={[]}
                        status={todayState?.draw?.status || 'open'}
                        result={todayState?.draw?.result || null}
                    />

                    {/* Rank Up Actions: Priority for S0/S1 */}
                    {isEarlyState && (
                        <>
                            <RankUpActions title="Rank Up Actions" />
                            <BusinessGateway />
                        </>
                    )}

                    {/* Everyday Value: Lower priority for S0/S1 */}
                    {isEarlyState && <EverydayValue title="Everyday Value" />}

                    {/* Being Seen: Refined Sections */}
                    <ReflectionStrip reflections={todayState?.reflections || []} />
                    <FeaturedToday items={todayState?.featured_content || []} />

                    {/* Quick Destinations */}
                    <QuickDestinations maturityState={maturityState} />
                </ScrollView>
            </View>
        </TodayLayout>
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
