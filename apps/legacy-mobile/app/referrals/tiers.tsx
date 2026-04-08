import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { Crown, Medal, Star, Award, CheckCircle2, Lock } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'https://promorang-api.vercel.app';

interface ReferralTier {
    tier_name: string;
    tier_level: number;
    min_referrals: number;
    commission_rate: number;
    badge_icon: string;
    badge_color: string;
    perks: string[];
}

export default function ReferralTiersScreen() {
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [tiers, setTiers] = useState<ReferralTier[]>([]);
    const [currentTier, setCurrentTier] = useState<number>(1);
    const [totalReferrals, setTotalReferrals] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        if (!token) return;

        try {
            const [tiersRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/referrals/tiers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/referrals/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const tiersData = await tiersRes.json();
            const statsData = await statsRes.json();

            if (tiersData.status === 'success' && tiersData.data?.tiers) {
                setTiers(tiersData.data.tiers);
            }
            if (statsData.status === 'success' && statsData.data) {
                setCurrentTier(statsData.data.summary?.tier?.tier_level || 1);
                setTotalReferrals(statsData.data.summary?.total_referrals || 0);
            }
        } catch (error) {
            console.error('Error fetching tiers:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getTierIcon = (tierLevel: number, size: number = 28) => {
        switch (tierLevel) {
            case 1: return <Medal size={size} color="#CD7F32" />;
            case 2: return <Medal size={size} color="#C0C0C0" />;
            case 3: return <Crown size={size} color="#FFD700" />;
            case 4: return <Star size={size} color="#8B5CF6" />;
            default: return <Award size={size} color={colors.primary} />;
        }
    };

    const getTierGradient = (tierLevel: number): [string, string] => {
        switch (tierLevel) {
            case 1: return ['#CD7F32', '#8B4513'];
            case 2: return ['#C0C0C0', '#808080'];
            case 3: return ['#FFD700', '#FFA500'];
            case 4: return ['#8B5CF6', '#6D28D9'];
            default: return [colors.primary, '#7C3AED'];
        }
    };

    if (isLoading) {
        return <LoadingIndicator fullScreen text="Loading tiers..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Referral Tiers',
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { color: theme.text, fontWeight: '700' },
                }}
            />

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
                {/* Progress Header */}
                <Card style={styles.progressCard}>
                    <Text style={[styles.progressTitle, { color: theme.text }]}>Your Progress</Text>
                    <Text style={[styles.progressValue, { color: colors.primary }]}>
                        {totalReferrals} Referrals
                    </Text>
                    <View style={styles.progressBar}>
                        {tiers.map((tier, index) => {
                            const isCompleted = totalReferrals >= tier.min_referrals;
                            const isCurrent = tier.tier_level === currentTier;
                            return (
                                <View
                                    key={tier.tier_level}
                                    style={[
                                        styles.progressSegment,
                                        isCompleted && { backgroundColor: tier.badge_color },
                                        isCurrent && styles.progressSegmentCurrent,
                                        index === 0 && styles.progressSegmentFirst,
                                        index === tiers.length - 1 && styles.progressSegmentLast,
                                    ]}
                                />
                            );
                        })}
                    </View>
                    <View style={styles.progressLabels}>
                        {tiers.map((tier) => (
                            <Text key={tier.tier_level} style={styles.progressLabel}>
                                {tier.min_referrals}
                            </Text>
                        ))}
                    </View>
                </Card>

                {/* Tiers List */}
                {tiers.map((tier) => {
                    const isUnlocked = totalReferrals >= tier.min_referrals;
                    const isCurrent = tier.tier_level === currentTier;

                    return (
                        <View key={tier.tier_level} style={styles.tierWrapper}>
                            {isCurrent && (
                                <View style={styles.currentBadge}>
                                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                                </View>
                            )}
                            <Card style={[
                                styles.tierCard,
                                !isUnlocked && styles.tierCardLocked,
                                isCurrent && styles.tierCardCurrent,
                            ]}>
                                <LinearGradient
                                    colors={getTierGradient(tier.tier_level)}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.tierHeader}
                                >
                                    <View style={styles.tierHeaderLeft}>
                                        {getTierIcon(tier.tier_level)}
                                        <View>
                                            <Text style={styles.tierName}>{tier.tier_name}</Text>
                                            <Text style={styles.tierRequirement}>
                                                {tier.min_referrals}+ referrals
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.tierCommission}>
                                        <Text style={styles.tierCommissionValue}>
                                            {(tier.commission_rate * 100).toFixed(0)}%
                                        </Text>
                                        <Text style={styles.tierCommissionLabel}>Commission</Text>
                                    </View>
                                </LinearGradient>

                                <View style={styles.tierPerks}>
                                    <Text style={[styles.tierPerksTitle, { color: theme.text }]}>Perks</Text>
                                    {tier.perks.map((perk, index) => (
                                        <View key={index} style={styles.perkItem}>
                                            {isUnlocked ? (
                                                <CheckCircle2 size={16} color="#10B981" />
                                            ) : (
                                                <Lock size={16} color="#9CA3AF" />
                                            )}
                                            <Text style={[
                                                styles.perkText,
                                                { color: isUnlocked ? theme.text : theme.textSecondary }
                                            ]}>
                                                {perk}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {!isUnlocked && (
                                    <View style={styles.lockedOverlay}>
                                        <Lock size={24} color="#9CA3AF" />
                                        <Text style={styles.lockedText}>
                                            {tier.min_referrals - totalReferrals} more referrals to unlock
                                        </Text>
                                    </View>
                                )}
                            </Card>
                        </View>
                    );
                })}

                {/* Info Card */}
                <Card style={styles.infoCard}>
                    <Text style={[styles.infoTitle, { color: theme.text }]}>How Tiers Work</Text>
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                        As you refer more users, you'll unlock higher tiers with better commission rates and exclusive perks. 
                        Your tier is based on your total number of successful referrals.
                    </Text>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    progressCard: {
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    progressValue: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 16,
    },
    progressBar: {
        flexDirection: 'row',
        width: '100%',
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressSegment: {
        flex: 1,
        backgroundColor: '#E5E7EB',
    },
    progressSegmentCurrent: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    progressSegmentFirst: {
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    progressSegmentLast: {
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    progressLabel: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    tierWrapper: {
        marginBottom: 16,
        position: 'relative',
    },
    currentBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 1,
    },
    currentBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
    },
    tierCard: {
        overflow: 'hidden',
        padding: 0,
    },
    tierCardLocked: {
        opacity: 0.7,
    },
    tierCardCurrent: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    tierHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    tierHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    tierName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    tierRequirement: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    tierCommission: {
        alignItems: 'flex-end',
    },
    tierCommissionValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFF',
    },
    tierCommissionLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
    },
    tierPerks: {
        padding: 16,
    },
    tierPerksTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
    },
    perkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    perkText: {
        fontSize: 14,
        flex: 1,
    },
    lockedOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    lockedText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
    },
    infoCard: {
        padding: 16,
        marginTop: 8,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    },
});
