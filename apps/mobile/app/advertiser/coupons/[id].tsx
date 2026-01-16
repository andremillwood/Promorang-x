import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAdvertiserStore, Coupon } from '@/store/advertiserStore';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import {
    ArrowLeft,
    Gift,
    Calendar,
    Users,
    TrendingUp,
    Package,
    Edit,
    Trash2,
    RefreshCw,
    Pause,
    Play,
    CheckCircle2,
    XCircle,
    Target,
    Plus,
    Percent,
    DollarSign
} from 'lucide-react-native';
import colors from '@/constants/colors';

export default function CouponDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const {
        selectedCoupon,
        getCoupon,
        updateCoupon,
        deleteCoupon,
        replenishCoupon,
        toggleCouponStatus,
        redeemCoupon,
        setSelectedCoupon,
        drops
    } = useAdvertiserStore();
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadCoupon();
    }, [id]);

    const loadCoupon = async () => {
        if (!id) return;
        setLoading(true);
        await getCoupon(id);
        setLoading(false);
    };

    const onRefresh = useCallback(async () => {
        if (!id) return;
        setRefreshing(true);
        await getCoupon(id);
        setRefreshing(false);
    }, [id]);

    const handleToggleStatus = async () => {
        if (!selectedCoupon) return;
        
        setIsUpdating(true);
        const success = await toggleCouponStatus(selectedCoupon.id);
        setIsUpdating(false);
        
        if (success) {
            Alert.alert('Success', `Coupon ${selectedCoupon.status === 'active' ? 'paused' : 'activated'} successfully`);
        } else {
            Alert.alert('Error', 'Failed to update coupon status');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Coupon',
            'Are you sure you want to delete this coupon? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!selectedCoupon) return;
                        const success = await deleteCoupon(selectedCoupon.id);
                        if (success) {
                            router.back();
                        } else {
                            Alert.alert('Error', 'Failed to delete coupon');
                        }
                    }
                }
            ]
        );
    };

    const handleReplenish = () => {
        Alert.prompt(
            'Replenish Inventory',
            'Enter quantity to add:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add',
                    onPress: async (quantity: string | undefined) => {
                        if (!quantity || !selectedCoupon) return;
                        const numQuantity = parseInt(quantity, 10);
                        if (isNaN(numQuantity) || numQuantity <= 0) {
                            Alert.alert('Error', 'Please enter a valid quantity');
                            return;
                        }
                        const result = await replenishCoupon(selectedCoupon.id, numQuantity);
                        if (result) {
                            Alert.alert('Success', `Added ${numQuantity} more coupons`);
                        } else {
                            Alert.alert('Error', 'Failed to replenish coupon');
                        }
                    }
                }
            ],
            'plain-text',
            '',
            'numeric'
        );
    };

    const handleRecordRedemption = () => {
        Alert.prompt(
            'Record Redemption',
            'Enter recipient name:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Record',
                    onPress: async (userName: string | undefined) => {
                        if (!userName || !selectedCoupon) return;
                        const success = await redeemCoupon(selectedCoupon.id, userName);
                        if (success) {
                            Alert.alert('Success', 'Redemption recorded successfully');
                            onRefresh();
                        } else {
                            Alert.alert('Error', 'Failed to record redemption');
                        }
                    }
                }
            ],
            'plain-text'
        );
    };

    const handleEdit = () => {
        router.push(`/advertiser/coupons/edit/${id}` as any);
    };

    const formatValue = (coupon: Coupon) => {
        if (coupon.value_unit === 'percentage') {
            return `${coupon.value}%`;
        } else if (coupon.value_unit === 'usd' || coupon.value_unit === 'fixed') {
            return `$${coupon.value}`;
        } else if (coupon.value_unit === 'gems') {
            return `${coupon.value} gems`;
        } else if (coupon.value_unit === 'keys') {
            return `${coupon.value} keys`;
        }
        return `${coupon.value} ${coupon.value_unit}`;
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

    const getRewardTypeLabel = (type: string) => {
        switch (type) {
            case 'giveaway':
                return 'Giveaway';
            case 'credit':
                return 'Credit';
            case 'discount':
                return 'Discount';
            default:
                return 'Coupon';
        }
    };

    if (loading) {
        return <LoadingIndicator fullScreen text="Loading coupon..." />;
    }

    if (!selectedCoupon) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Coupon Not Found</Text>
                </View>
                <View style={styles.errorState}>
                    <Text style={styles.errorText}>The requested coupon could not be found.</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
                        <Text style={styles.errorButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const coupon = selectedCoupon;
    const statusStyle = getStatusStyle(coupon.status);
    const usedCount = coupon.quantity_total - coupon.quantity_remaining;
    const redemptionRate = coupon.quantity_total > 0 ? (usedCount / coupon.quantity_total) * 100 : 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{coupon.title}</Text>
                    <View style={styles.headerMeta}>
                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                {coupon.status}
                            </Text>
                        </View>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeText}>{getRewardTypeLabel(coupon.reward_type)}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity 
                    onPress={handleToggleStatus} 
                    style={styles.statusButton}
                    disabled={isUpdating || coupon.status === 'expired' || coupon.status === 'depleted'}
                >
                    {coupon.status === 'active' ? (
                        <Pause size={20} color="#D97706" />
                    ) : (
                        <Play size={20} color="#16A34A" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Description */}
                {coupon.description && (
                    <Text style={styles.description}>{coupon.description}</Text>
                )}

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                            <Gift size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.statValue}>{formatValue(coupon)}</Text>
                        <Text style={styles.statLabel}>Reward Value</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
                            <Package size={20} color="#16A34A" />
                        </View>
                        <Text style={styles.statValue}>
                            {coupon.quantity_remaining}/{coupon.quantity_total}
                        </Text>
                        <Text style={styles.statLabel}>Remaining</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
                            <TrendingUp size={20} color="#9333EA" />
                        </View>
                        <Text style={styles.statValue}>{redemptionRate.toFixed(1)}%</Text>
                        <Text style={styles.statLabel}>Redemption Rate</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#FFF7ED' }]}>
                            <Users size={20} color="#EA580C" />
                        </View>
                        <Text style={styles.statValue}>{coupon.assignments?.length || 0}</Text>
                        <Text style={styles.statLabel}>Assignments</Text>
                    </Card>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
                        <RefreshCw size={20} color="#2563EB" />
                        <Text style={styles.actionText}>Refresh</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleReplenish}>
                        <Plus size={20} color="#16A34A" />
                        <Text style={styles.actionText}>Replenish</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
                        <Edit size={20} color="#9333EA" />
                        <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.deleteAction]} onPress={handleDelete}>
                        <Trash2 size={20} color="#DC2626" />
                        <Text style={[styles.actionText, { color: '#DC2626' }]}>Delete</Text>
                    </TouchableOpacity>
                </View>

                {/* Record Redemption */}
                <TouchableOpacity onPress={handleRecordRedemption} style={styles.redeemButton}>
                    <CheckCircle2 size={20} color="#10B981" />
                    <Text style={styles.redeemButtonText}>Record Redemption</Text>
                </TouchableOpacity>

                {/* Assignments */}
                {coupon.assignments && coupon.assignments.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Assignments</Text>
                        <Card style={styles.assignmentsCard}>
                            {coupon.assignments.map((assignment, index) => (
                                <View 
                                    key={assignment.id} 
                                    style={[
                                        styles.assignmentItem,
                                        index < coupon.assignments!.length - 1 && styles.assignmentBorder
                                    ]}
                                >
                                    <View style={styles.assignmentInfo}>
                                        <View style={[
                                            styles.assignmentIcon,
                                            { backgroundColor: assignment.target_type === 'drop' ? '#DBEAFE' : '#F3E8FF' }
                                        ]}>
                                            {assignment.target_type === 'drop' ? (
                                                <Target size={16} color="#2563EB" />
                                            ) : (
                                                <TrendingUp size={16} color="#9333EA" />
                                            )}
                                        </View>
                                        <View>
                                            <Text style={styles.assignmentLabel}>
                                                {assignment.target_label || assignment.target_id}
                                            </Text>
                                            <Text style={styles.assignmentType}>
                                                {assignment.target_type === 'drop' ? 'Drop' : 'Leaderboard'}
                                                {assignment.assigned_at && ` • ${new Date(assignment.assigned_at).toLocaleDateString()}`}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.assignmentStatus,
                                        { backgroundColor: assignment.status === 'active' ? '#DCFCE7' : '#F3F4F6' }
                                    ]}>
                                        <Text style={[
                                            styles.assignmentStatusText,
                                            { color: assignment.status === 'active' ? '#16A34A' : '#6B7280' }
                                        ]}>
                                            {assignment.status || 'active'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </Card>
                    </>
                )}

                {/* Redemptions */}
                {coupon.redemptions && coupon.redemptions.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Recent Redemptions</Text>
                        <Card style={styles.redemptionsCard}>
                            {coupon.redemptions.slice(0, 10).map((redemption, index) => (
                                <View 
                                    key={redemption.id} 
                                    style={[
                                        styles.redemptionItem,
                                        index < Math.min(coupon.redemptions!.length, 10) - 1 && styles.redemptionBorder
                                    ]}
                                >
                                    <View style={styles.redemptionInfo}>
                                        <Text style={styles.redemptionUser}>
                                            {redemption.user_name || 'Unknown User'}
                                        </Text>
                                        <Text style={styles.redemptionMeta}>
                                            {redemption.reward_value} {redemption.reward_unit === 'percentage' ? '%' : redemption.reward_unit?.toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.redemptionRight}>
                                        <Text style={styles.redemptionDate}>
                                            {new Date(redemption.redeemed_at).toLocaleDateString()}
                                        </Text>
                                        <View style={[
                                            styles.redemptionStatus,
                                            { backgroundColor: redemption.status === 'completed' ? '#DCFCE7' : '#F3F4F6' }
                                        ]}>
                                            <Text style={[
                                                styles.redemptionStatusText,
                                                { color: redemption.status === 'completed' ? '#16A34A' : '#6B7280' }
                                            ]}>
                                                {redemption.status || 'completed'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </Card>
                    </>
                )}

                {/* Validity Period */}
                <Text style={styles.sectionTitle}>Validity Period</Text>
                <Card style={styles.validityCard}>
                    <View style={styles.validityRow}>
                        <View style={styles.validityItem}>
                            <Calendar size={18} color="#6B7280" />
                            <View>
                                <Text style={styles.validityLabel}>Start Date</Text>
                                <Text style={styles.validityValue}>
                                    {new Date(coupon.start_date).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.validityDivider} />
                        <View style={styles.validityItem}>
                            <Calendar size={18} color="#6B7280" />
                            <View>
                                <Text style={styles.validityLabel}>End Date</Text>
                                <Text style={styles.validityValue}>
                                    {new Date(coupon.end_date).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>

                <View style={{ height: 100 }} />
            </ScrollView>
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
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    headerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    typeBadge: {
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9333EA',
    },
    statusButton: {
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
    },
    scrollContent: {
        padding: 16,
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: '47%',
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        width: '47%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    deleteAction: {
        borderColor: '#FEE2E2',
        backgroundColor: '#FEF2F2',
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    redeemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 14,
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        marginBottom: 24,
    },
    redeemButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#047857',
    },
    assignmentsCard: {
        padding: 0,
        borderRadius: 16,
        backgroundColor: colors.white,
        overflow: 'hidden',
        marginBottom: 24,
    },
    assignmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    assignmentBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    assignmentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    assignmentIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    assignmentLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    assignmentType: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    assignmentStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    assignmentStatusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    redemptionsCard: {
        padding: 0,
        borderRadius: 16,
        backgroundColor: colors.white,
        overflow: 'hidden',
        marginBottom: 24,
    },
    redemptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    redemptionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    redemptionInfo: {
        flex: 1,
    },
    redemptionUser: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    redemptionMeta: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    redemptionRight: {
        alignItems: 'flex-end',
    },
    redemptionDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    redemptionStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    redemptionStatusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    validityCard: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: colors.white,
    },
    validityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    validityItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    validityDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 16,
    },
    validityLabel: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    validityValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 2,
    },
    errorState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    errorButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    errorButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
});
