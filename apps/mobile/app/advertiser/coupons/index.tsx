import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdvertiserStore, Coupon } from '@/store/advertiserStore';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import {
    Plus,
    ArrowLeft,
    Gift,
    TicketPercent,
    Users,
    Calendar,
    ChevronRight,
    BarChart2,
    Package,
    Percent,
    DollarSign
} from 'lucide-react-native';
import colors from '@/constants/colors';

export default function CouponsListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { coupons, redemptions, isLoadingCoupons, fetchCoupons, setSelectedCoupon } = useAdvertiserStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCoupons();
        setRefreshing(false);
    }, []);

    const handleCouponPress = (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        router.push(`/advertiser/coupons/${coupon.id}` as any);
    };

    const handleCreateCoupon = () => {
        router.push('/advertiser/coupons/new' as any);
    };

    const handleAnalytics = () => {
        router.push('/advertiser/coupons/analytics' as any);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'active':
                return { bg: '#DCFCE7', text: '#16A34A' };
            case 'paused':
                return { bg: '#FEF3C7', text: '#D97706' };
            case 'expired':
                return { bg: '#F3F4F6', text: '#6B7280' };
            case 'depleted':
                return { bg: '#FEE2E2', text: '#DC2626' };
            default:
                return { bg: '#DBEAFE', text: '#2563EB' };
        }
    };

    const getRewardIcon = (rewardType: string) => {
        switch (rewardType) {
            case 'giveaway':
                return <Gift size={20} color="#9333EA" />;
            case 'credit':
                return <DollarSign size={20} color="#16A34A" />;
            default:
                return <Percent size={20} color="#EC4899" />;
        }
    };

    const formatValue = (coupon: Coupon) => {
        if (coupon.value_unit === 'percentage') {
            return `${coupon.value}% off`;
        } else if (coupon.value_unit === 'usd' || coupon.value_unit === 'fixed') {
            return `$${coupon.value}`;
        } else if (coupon.value_unit === 'gems') {
            return `${coupon.value} gems`;
        } else if (coupon.value_unit === 'keys') {
            return `${coupon.value} keys`;
        }
        return `${coupon.value} ${coupon.value_unit}`;
    };

    // Calculate summary stats
    const activeCoupons = coupons.filter(c => c.status === 'active').length;
    const totalDistributed = coupons.reduce((sum, c) => sum + (c.quantity_total - c.quantity_remaining), 0);
    const recentRedemptions = redemptions.length;

    if (isLoadingCoupons && coupons.length === 0) {
        return <LoadingIndicator fullScreen text="Loading coupons..." />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Text style={styles.title}>Coupons & Rewards</Text>
                    <Text style={styles.subtitle}>Manage incentives for your campaigns</Text>
                </View>
                <TouchableOpacity onPress={handleAnalytics} style={styles.analyticsButton}>
                    <BarChart2 size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Summary Stats */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, { backgroundColor: '#F3E8FF' }]}>
                        <TicketPercent size={20} color="#9333EA" />
                        <Text style={[styles.summaryValue, { color: '#6B21A8' }]}>{activeCoupons}</Text>
                        <Text style={styles.summaryLabel}>Active</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#FFF7ED' }]}>
                        <Gift size={20} color="#EA580C" />
                        <Text style={[styles.summaryValue, { color: '#C2410C' }]}>{totalDistributed}</Text>
                        <Text style={styles.summaryLabel}>Distributed</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
                        <Users size={20} color="#10B981" />
                        <Text style={[styles.summaryValue, { color: '#047857' }]}>{recentRedemptions}</Text>
                        <Text style={styles.summaryLabel}>Redeemed</Text>
                    </View>
                </View>

                {/* Info Card */}
                <Card style={styles.infoCard}>
                    <View style={styles.infoContent}>
                        <Gift size={20} color="#2563EB" />
                        <View style={styles.infoText}>
                            <Text style={styles.infoTitle}>How Coupons Work</Text>
                            <Text style={styles.infoDescription}>
                                Assign coupons to drops or leaderboard positions. Creators automatically receive codes when they meet conditions.
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Create Button */}
                <TouchableOpacity onPress={handleCreateCoupon} style={styles.createButton}>
                    <LinearGradient
                        colors={['#9333EA', '#EC4899']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.createButtonGradient}
                    >
                        <Plus size={20} color={colors.white} />
                        <Text style={styles.createButtonText}>Create Incentive</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Coupons List */}
                <Text style={styles.sectionTitle}>Your Coupons</Text>
                
                {coupons.length > 0 ? (
                    coupons.map((coupon) => {
                        const statusStyle = getStatusStyle(coupon.status);
                        const usedCount = coupon.quantity_total - coupon.quantity_remaining;
                        const usagePercent = coupon.quantity_total > 0 
                            ? (usedCount / coupon.quantity_total) * 100 
                            : 0;

                        return (
                            <TouchableOpacity
                                key={coupon.id}
                                onPress={() => handleCouponPress(coupon)}
                                activeOpacity={0.7}
                            >
                                <Card style={styles.couponCard}>
                                    <View style={styles.couponHeader}>
                                        <View style={styles.couponIconContainer}>
                                            {getRewardIcon(coupon.reward_type)}
                                        </View>
                                        <View style={styles.couponInfo}>
                                            <View style={styles.couponTitleRow}>
                                                <Text style={styles.couponTitle} numberOfLines={1}>
                                                    {coupon.title}
                                                </Text>
                                                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                        {coupon.status}
                                                    </Text>
                                                </View>
                                            </View>
                                            {coupon.description && (
                                                <Text style={styles.couponDescription} numberOfLines={1}>
                                                    {coupon.description}
                                                </Text>
                                            )}
                                        </View>
                                        <ChevronRight size={20} color="#9CA3AF" />
                                    </View>

                                    <View style={styles.couponDetails}>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Reward</Text>
                                            <Text style={styles.detailValue}>{formatValue(coupon)}</Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <Text style={styles.detailLabel}>Remaining</Text>
                                            <Text style={styles.detailValue}>
                                                {coupon.quantity_remaining} / {coupon.quantity_total}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressBar}>
                                            <View 
                                                style={[
                                                    styles.progressFill, 
                                                    { 
                                                        width: `${Math.min(usagePercent, 100)}%`,
                                                        backgroundColor: usagePercent > 80 ? '#DC2626' : '#9333EA'
                                                    }
                                                ]} 
                                            />
                                        </View>
                                        <Text style={styles.progressText}>
                                            {usedCount} used
                                        </Text>
                                    </View>

                                    <View style={styles.couponFooter}>
                                        <View style={styles.footerItem}>
                                            <Calendar size={14} color="#9CA3AF" />
                                            <Text style={styles.footerText}>
                                                Expires {new Date(coupon.end_date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        {coupon.assignments && coupon.assignments.length > 0 && (
                                            <View style={styles.footerItem}>
                                                <Users size={14} color="#9CA3AF" />
                                                <Text style={styles.footerText}>
                                                    {coupon.assignments.length} assigned
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Gift size={48} color="#9CA3AF" />
                        <Text style={styles.emptyTitle}>No coupons yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Create your first coupon to incentivize creators
                        </Text>
                        <TouchableOpacity onPress={handleCreateCoupon} style={styles.emptyButton}>
                            <LinearGradient
                                colors={['#9333EA', '#EC4899']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.emptyButtonGradient}
                            >
                                <Plus size={20} color={colors.white} />
                                <Text style={styles.emptyButtonText}>Create Coupon</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            {coupons.length > 0 && (
                <TouchableOpacity 
                    style={[styles.fab, { bottom: insets.bottom + 80 }]} 
                    onPress={handleCreateCoupon}
                >
                    <LinearGradient
                        colors={['#9333EA', '#EC4899']}
                        style={styles.fabGradient}
                    >
                        <Plus size={28} color={colors.white} />
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
    },
    subtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    analyticsButton: {
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
    },
    scrollContent: {
        padding: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 8,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    infoCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        marginBottom: 16,
    },
    infoContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    infoText: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 4,
    },
    infoDescription: {
        fontSize: 13,
        color: '#3B82F6',
        lineHeight: 18,
    },
    createButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    createButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    couponCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    couponHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    couponIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    couponInfo: {
        flex: 1,
    },
    couponTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    couponTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    couponDescription: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    couponDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        color: '#6B7280',
        width: 50,
    },
    couponFooter: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 12,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: colors.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    emptyButton: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    emptyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    emptyButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 15,
    },
    fab: {
        position: 'absolute',
        right: 20,
        borderRadius: 28,
        shadowColor: '#9333EA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
