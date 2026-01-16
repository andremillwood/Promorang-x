import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Gift, Ticket, Calendar, ChevronRight, Tag, Percent, DollarSign, CheckCircle2, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'https://promorang-api.vercel.app';

interface UserCoupon {
    id: string;
    coupon_id: string;
    is_redeemed: boolean;
    redeemed_at: string | null;
    assigned_at: string;
    target_label?: string;
    advertiser_coupons: {
        id: string;
        title: string;
        description: string;
        reward_type: 'percentage' | 'fixed' | 'free_item' | 'bogo';
        value: number;
        value_unit?: string;
        start_date: string;
        end_date: string;
        status: string;
        advertiser_id: string;
    };
}

export default function MyCouponsScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [coupons, setCoupons] = useState<UserCoupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'used'>('all');

    const fetchCoupons = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/api/rewards/coupons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.coupons) {
                setCoupons(result.coupons);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchCoupons();
    };

    const filteredCoupons = coupons.filter(coupon => {
        // Filter out coupons without advertiser_coupons data
        if (!coupon.advertiser_coupons) return false;
        if (filter === 'active') return !coupon.is_redeemed;
        if (filter === 'used') return coupon.is_redeemed;
        return true;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRewardIcon = (type: string) => {
        switch (type) {
            case 'percentage': return Percent;
            case 'fixed': return DollarSign;
            case 'free_item': return Gift;
            default: return Tag;
        }
    };

    const getRewardText = (coupon: UserCoupon['advertiser_coupons'] | undefined) => {
        if (!coupon) return 'Coupon';
        switch (coupon.reward_type) {
            case 'percentage': return `${coupon.value || 0}% OFF`;
            case 'fixed': return `$${coupon.value || 0} OFF`;
            case 'free_item': return 'FREE ITEM';
            case 'bogo': return 'BUY 1 GET 1';
            default: return coupon.title || 'Coupon';
        }
    };

    const renderCoupon = ({ item }: { item: UserCoupon }) => {
        const coupon = item.advertiser_coupons;
        
        // Skip items without advertiser_coupons data
        if (!coupon) {
            return null;
        }
        
        const isExpired = coupon.end_date ? new Date(coupon.end_date) < new Date() : false;
        const isUsed = item.is_redeemed;
        const RewardIcon = getRewardIcon(coupon.reward_type || 'default');

        return (
            <TouchableOpacity
                onPress={() => router.push({ pathname: '/coupons/[id]', params: { id: item.id } } as any)}
                activeOpacity={0.7}
            >
                <Card style={[styles.couponCard, (isUsed || isExpired) && styles.couponCardDisabled]}>
                    <View style={styles.couponLeft}>
                        <LinearGradient
                            colors={isUsed ? ['#9CA3AF', '#6B7280'] : isExpired ? ['#EF4444', '#DC2626'] : ['#8B5CF6', '#EC4899']}
                            style={styles.rewardBadge}
                        >
                            <RewardIcon size={20} color="#FFF" />
                            <Text style={styles.rewardText}>{getRewardText(coupon)}</Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.couponDivider}>
                        <View style={styles.dividerCircleTop} />
                        <View style={styles.dividerLine} />
                        <View style={styles.dividerCircleBottom} />
                    </View>

                    <View style={styles.couponRight}>
                        <Text style={[styles.couponTitle, { color: theme.text }]} numberOfLines={1}>
                            {coupon.title || 'Coupon'}
                        </Text>
                        <Text style={[styles.couponDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                            {coupon.description || 'Redeem this coupon for a discount'}
                        </Text>

                        <View style={styles.couponMeta}>
                            {isUsed ? (
                                <View style={styles.statusBadge}>
                                    <CheckCircle2 size={12} color="#10B981" />
                                    <Text style={[styles.statusText, { color: '#10B981' }]}>Redeemed</Text>
                                </View>
                            ) : isExpired ? (
                                <View style={styles.statusBadge}>
                                    <Clock size={12} color="#EF4444" />
                                    <Text style={[styles.statusText, { color: '#EF4444' }]}>Expired</Text>
                                </View>
                            ) : (
                                <View style={styles.expiryInfo}>
                                    <Calendar size={12} color={theme.textSecondary} />
                                    <Text style={[styles.expiryText, { color: theme.textSecondary }]}>
                                        Expires {formatDate(coupon.end_date)}
                                    </Text>
                                </View>
                            )}
                            <ChevronRight size={18} color={theme.textSecondary} />
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return <LoadingIndicator fullScreen text="Loading your coupons..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'My Coupons',
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { color: theme.text, fontWeight: '700' },
                }}
            />

            {/* Header Stats */}
            <View style={styles.statsContainer}>
                <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.statsGradient}
                >
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{coupons.filter(c => !c.is_redeemed).length}</Text>
                        <Text style={styles.statLabel}>Available</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{coupons.filter(c => c.is_redeemed).length}</Text>
                        <Text style={styles.statLabel}>Redeemed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{coupons.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {(['all', 'active', 'used'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.filterTab, filter === tab && styles.filterTabActive]}
                        onPress={() => setFilter(tab)}
                    >
                        <Text style={[
                            styles.filterTabText,
                            { color: filter === tab ? colors.primary : theme.textSecondary }
                        ]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Coupons List */}
            <FlatList
                data={filteredCoupons}
                keyExtractor={(item) => item.id}
                renderItem={renderCoupon}
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
                        <Gift size={64} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>
                            {filter === 'all' ? 'No Coupons Yet' : `No ${filter} coupons`}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                            Complete drops and campaigns to earn coupons and rewards!
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statsContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    statsGradient: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: 4,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterTabActive: {
        backgroundColor: '#EDE9FE',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    couponCard: {
        flexDirection: 'row',
        marginBottom: 12,
        padding: 0,
        overflow: 'hidden',
    },
    couponCardDisabled: {
        opacity: 0.7,
    },
    couponLeft: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    rewardBadge: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rewardText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '800',
        marginTop: 6,
        textAlign: 'center',
    },
    couponDivider: {
        width: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dividerCircleTop: {
        width: 20,
        height: 10,
        backgroundColor: '#F3F4F6',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        marginTop: -1,
    },
    dividerLine: {
        flex: 1,
        width: 1,
        borderLeftWidth: 2,
        borderLeftColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    dividerCircleBottom: {
        width: 20,
        height: 10,
        backgroundColor: '#F3F4F6',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        marginBottom: -1,
    },
    couponRight: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    couponTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    couponDescription: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 8,
    },
    couponMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    expiryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    expiryText: {
        fontSize: 11,
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
});
