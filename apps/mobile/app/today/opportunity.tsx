import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Card } from '@/components/ui/Card';
import {
    ChevronLeft,
    Gift,
    Zap,
    Sparkles,
    Trophy,
    Clock,
    ArrowRight,
    Rocket
} from 'lucide-react-native';
import colors from '@/constants/colors';

const API_URL = 'https://promorang-api.vercel.app';

interface TodayState {
    headline: {
        type: string;
        payload: {
            title: string;
            subtitle?: string;
            drop_id?: string;
            reward_amount?: number;
            multiplier?: number;
        };
        drop?: {
            id: string;
            title: string;
            description: string;
            gem_reward_base: number;
            category?: string;
        };
    };
}

export default function TodayOpportunityScreen() {
    const router = useRouter();
    const { token } = useAuthStore();
    const theme = useThemeColors();
    const [todayState, setTodayState] = useState<TodayState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchState = async () => {
            try {
                const response = await fetch(`${API_URL}/api/today`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (response.ok) {
                    const data = await response.json();
                    setTodayState(data);
                }
            } catch (error) {
                console.error('[TodayOpportunity] Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchState();
    }, []);

    const handleStartMission = () => {
        const dropId = todayState?.headline?.drop?.id || todayState?.headline?.payload?.drop_id;
        if (dropId) {
            router.push({ pathname: '/drop/[id]', params: { id: dropId } } as any);
        } else {
            router.push('/(tabs)/discover');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <LoadingIndicator />
                </View>
            </View>
        );
    }

    const { headline } = todayState || {};
    const payload = headline?.payload;
    const drop = headline?.drop;
    const type = headline?.type || 'reward';

    const themes: Record<string, { bg: string; color: string; icon: any }> = {
        reward: { bg: '#3B82F620', color: '#3B82F6', icon: Gift },
        multiplier: { bg: '#F59E0B20', color: '#F59E0B', icon: Zap },
        chance: { bg: '#8B5CF620', color: '#8B5CF6', icon: Sparkles },
    };
    const currentTheme = themes[type] || themes.reward;
    const ThemeIcon = currentTheme.icon;

    const missionId = new Date().toISOString().split('T')[0].replace(/-/g, '');

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.missionIdContainer}>
                    <Text style={[styles.missionIdLabel, { color: theme.textSecondary }]}>MISSION ID</Text>
                    <Text style={[styles.missionIdValue, { color: theme.textSecondary }]}>{missionId}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Card */}
                <Card style={[styles.heroCard, { backgroundColor: currentTheme.bg }]} variant="elevated">
                    <View style={styles.heroBadge}>
                        <ThemeIcon size={20} color={currentTheme.color} />
                        <Text style={[styles.heroBadgeText, { color: currentTheme.color }]}>
                            {type === 'reward' ? 'Featured Drop' : type === 'multiplier' ? 'Multiplier Event' : 'Lucky Draw Event'}
                        </Text>
                    </View>
                    <Text style={[styles.heroTitle, { color: theme.text }]}>
                        {payload?.title || "Today's Opportunity"}
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                        {payload?.subtitle || 'Complete this mission to earn rewards'}
                    </Text>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        {type === 'reward' && (
                            <View style={styles.statBadge}>
                                <Trophy size={14} color="#3B82F6" />
                                <Text style={styles.statBadgeText}>{payload?.reward_amount || 'High'} Gems</Text>
                            </View>
                        )}
                        {type === 'multiplier' && (
                            <View style={styles.statBadge}>
                                <Zap size={14} color="#F59E0B" />
                                <Text style={styles.statBadgeText}>{payload?.multiplier}× Boost</Text>
                            </View>
                        )}
                        <View style={styles.statBadge}>
                            <Clock size={14} color="#10B981" />
                            <Text style={styles.statBadgeText}>Today Only</Text>
                        </View>
                    </View>
                </Card>

                {/* Mission Briefing */}
                {type === 'reward' && drop && (
                    <Card style={styles.briefingCard} variant="elevated">
                        <View style={styles.briefingHeader}>
                            <Rocket size={16} color={theme.textSecondary} />
                            <Text style={[styles.briefingTitle, { color: theme.textSecondary }]}>MISSION BRIEFING</Text>
                        </View>
                        <Text style={[styles.briefingDropTitle, { color: theme.text }]}>{drop.title}</Text>
                        <Text style={[styles.briefingDropDesc, { color: theme.textSecondary }]}>{drop.description}</Text>
                        <View style={styles.briefingMeta}>
                            <View style={styles.metaItem}>
                                <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Category</Text>
                                <Text style={[styles.metaValue, { color: theme.text }]}>{drop.category || 'General'}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Complexity</Text>
                                <Text style={[styles.metaValue, { color: theme.text }]}>Quick Engage</Text>
                            </View>
                        </View>
                    </Card>
                )}

                {/* Steps */}
                <View style={styles.stepsContainer}>
                    <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>01</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, { color: theme.text }]}>Accept the Mission</Text>
                            <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>Commit by tapping the button below.</Text>
                        </View>
                    </View>
                    <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>02</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, { color: theme.text }]}>Complete & Submit</Text>
                            <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>Engage with the content and submit proof.</Text>
                        </View>
                    </View>
                    <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>03</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={[styles.stepTitle, { color: theme.text }]}>Claim Daily Ticket</Text>
                            <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>Every completion earns a draw entry.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* CTA Button */}
            <View style={styles.ctaContainer}>
                <TouchableOpacity
                    style={[styles.ctaButton, { backgroundColor: currentTheme.color }]}
                    onPress={handleStartMission}
                    activeOpacity={0.9}
                >
                    <Text style={styles.ctaButtonText}>
                        {type === 'reward' ? 'Start Mission' : 'Go to Earning Center'}
                    </Text>
                    <ArrowRight size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
    },
    backButton: {
        padding: 8,
    },
    missionIdContainer: {
        alignItems: 'flex-end',
    },
    missionIdLabel: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1,
    },
    missionIdValue: {
        fontSize: 11,
        fontFamily: 'monospace',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 120,
    },
    heroCard: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 16,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    heroBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    statBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1F2937',
    },
    briefingCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
    },
    briefingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    briefingTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    briefingDropTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    briefingDropDesc: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    briefingMeta: {
        flexDirection: 'row',
        gap: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    metaItem: {},
    metaLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    metaValue: {
        fontSize: 13,
        fontWeight: '600',
    },
    stepsContainer: {
        gap: 20,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    stepNumber: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1F2937',
    },
    stepContent: {
        flex: 1,
        paddingTop: 4,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    ctaContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 36,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    ctaButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 16,
    },
    ctaButtonText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFF',
    },
});
