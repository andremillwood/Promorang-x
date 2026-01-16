import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Gift, Calendar, MapPin, ShieldCheck, CheckCircle2, Info, Share2, Tag, Percent, DollarSign, Clock, Store } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { LinearGradient } from 'expo-linear-gradient';
import { safeBack } from '@/lib/navigation';

const API_URL = 'https://promorang-api.vercel.app';

interface CouponData {
    id: string;
    coupon_id: string;
    is_redeemed: boolean;
    redeemed_at: string | null;
    assigned_at: string;
    target_label?: string;
    redemption_code?: string;
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
        conditions?: {
            min_purchase?: number;
            valid_days?: string[];
            location_restriction?: string;
        };
        redemption_instructions?: string;
    };
}

export default function CouponDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useThemeColors();
    const { token, user } = useAuthStore();

    const [coupon, setCoupon] = useState<CouponData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const fetchCoupon = useCallback(async () => {
        if (!token || !id) return;

        try {
            const response = await fetch(`${API_URL}/api/rewards/coupons/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.coupon) {
                setCoupon(result.coupon);
            }
        } catch (error) {
            console.error('Error fetching coupon:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token, id]);

    useEffect(() => {
        fetchCoupon();
    }, [fetchCoupon]);

    const handleShare = async () => {
        if (!coupon) return;
        try {
            await Share.share({
                message: `Check out this coupon: ${coupon.advertiser_coupons.title} - ${getRewardText()}!`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleRedeem = async () => {
        if (!coupon || coupon.is_redeemed) return;

        Alert.alert(
            'Redeem Coupon',
            'Are you sure you want to mark this coupon as redeemed? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Redeem',
                    onPress: async () => {
                        setIsRedeeming(true);
                        try {
                            const response = await fetch(`${API_URL}/api/rewards/coupons/${id}/redeem`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            });
                            const result = await response.json();
                            if (result.success) {
                                Alert.alert('Success', 'Coupon redeemed successfully!');
                                fetchCoupon();
                            } else {
                                Alert.alert('Error', result.error || 'Failed to redeem coupon');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to redeem coupon');
                        } finally {
                            setIsRedeeming(false);
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getRewardIcon = () => {
        if (!coupon) return Gift;
        switch (coupon.advertiser_coupons.reward_type) {
            case 'percentage': return Percent;
            case 'fixed': return DollarSign;
            case 'free_item': return Gift;
            default: return Tag;
        }
    };

    const getRewardText = () => {
        if (!coupon) return '';
        const c = coupon.advertiser_coupons;
        switch (c.reward_type) {
            case 'percentage': return `${c.value}% OFF`;
            case 'fixed': return `$${c.value} OFF`;
            case 'free_item': return 'FREE ITEM';
            case 'bogo': return 'BUY 1 GET 1';
            default: return c.title;
        }
    };

    if (isLoading) {
        return <LoadingIndicator fullScreen text="Loading coupon..." />;
    }

    if (!coupon) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ title: 'Coupon Not Found' }} />
                <View style={styles.errorState}>
                    <Gift size={64} color={theme.textSecondary} />
                    <Text style={[styles.errorText, { color: theme.text }]}>Coupon not found</Text>
                    <TouchableOpacity onPress={() => safeBack(router)} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const qrValue = JSON.stringify({
        type: 'coupon_redemption',
        coupon_id: coupon.coupon_id,
        assignment_id: coupon.id,
        user_id: user?.id,
        code: coupon.redemption_code || coupon.id.slice(0, 8).toUpperCase()
    });

    const isUsed = coupon.is_redeemed;
    const isExpired = new Date(coupon.advertiser_coupons.end_date) < new Date();
    const RewardIcon = getRewardIcon();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: '',
                    headerTransparent: true,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => safeBack(router)}
                            style={[styles.headerIcon, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                        >
                            <ArrowLeft size={24} color="#FFF" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleShare}
                            style={[styles.headerIcon, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                        >
                            <Share2 size={24} color="#FFF" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Gradient */}
                <LinearGradient
                    colors={isUsed ? ['#9CA3AF', '#6B7280'] : isExpired ? ['#EF4444', '#DC2626'] : ['#8B5CF6', '#EC4899']}
                    style={styles.headerGradient}
                >
                    <View style={styles.rewardDisplay}>
                        <RewardIcon size={40} color="#FFF" />
                        <Text style={styles.rewardValue}>{getRewardText()}</Text>
                        <Text style={styles.rewardTitle}>{coupon.advertiser_coupons.title}</Text>
                    </View>
                </LinearGradient>

                {/* Coupon Card */}
                <View style={styles.couponCard}>
                    {/* Status Badge */}
                    {(isUsed || isExpired) && (
                        <View style={[styles.statusOverlay, isUsed ? styles.statusUsed : styles.statusExpired]}>
                            {isUsed ? (
                                <>
                                    <CheckCircle2 size={24} color="#10B981" />
                                    <Text style={[styles.statusOverlayText, { color: '#10B981' }]}>REDEEMED</Text>
                                </>
                            ) : (
                                <>
                                    <Clock size={24} color="#EF4444" />
                                    <Text style={[styles.statusOverlayText, { color: '#EF4444' }]}>EXPIRED</Text>
                                </>
                            )}
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={[styles.description, { color: theme.textSecondary }]}>
                            {coupon.advertiser_coupons.description}
                        </Text>
                    </View>

                    {/* Validity */}
                    <View style={styles.validitySection}>
                        <View style={styles.validityItem}>
                            <Calendar size={16} color={theme.textSecondary} />
                            <Text style={[styles.validityLabel, { color: theme.textSecondary }]}>Valid From</Text>
                            <Text style={[styles.validityValue, { color: theme.text }]}>
                                {formatDate(coupon.advertiser_coupons.start_date)}
                            </Text>
                        </View>
                        <View style={styles.validityDivider} />
                        <View style={styles.validityItem}>
                            <Clock size={16} color={isExpired ? '#EF4444' : theme.textSecondary} />
                            <Text style={[styles.validityLabel, { color: isExpired ? '#EF4444' : theme.textSecondary }]}>
                                {isExpired ? 'Expired On' : 'Valid Until'}
                            </Text>
                            <Text style={[styles.validityValue, { color: isExpired ? '#EF4444' : theme.text }]}>
                                {formatDate(coupon.advertiser_coupons.end_date)}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.ticketDivider}>
                        <View style={styles.dividerCircleLeft} />
                        <View style={styles.dividerDashed} />
                        <View style={styles.dividerCircleRight} />
                    </View>

                    {/* QR Code Section */}
                    <View style={styles.qrSection}>
                        <Text style={styles.qrTitle}>Redemption Code</Text>
                        <Text style={styles.qrSubtitle}>Show this to the cashier to redeem</Text>

                        <View style={[
                            styles.qrContainer,
                            (isUsed || isExpired) && styles.qrContainerDisabled
                        ]}>
                            <QRCode
                                value={qrValue}
                                size={180}
                                color="#1F2937"
                                backgroundColor="#FFFFFF"
                            />
                        </View>

                        {/* Manual Code */}
                        <View style={styles.codeBox}>
                            <Text style={styles.codeLabel}>REDEMPTION CODE</Text>
                            <Text style={styles.codeValue}>
                                {coupon.redemption_code || coupon.id.slice(0, 8).toUpperCase()}
                            </Text>
                        </View>

                        {/* Instructions */}
                        {coupon.advertiser_coupons.redemption_instructions && (
                            <View style={[styles.instructionsBox, { backgroundColor: '#FEF3C7' }]}>
                                <Info size={16} color="#D97706" />
                                <Text style={styles.instructionsText}>
                                    {coupon.advertiser_coupons.redemption_instructions}
                                </Text>
                            </View>
                        )}

                        {/* Info Messages */}
                        <View style={styles.infoMessages}>
                            <View style={[styles.infoMessage, { backgroundColor: '#8B5CF610' }]}>
                                <ShieldCheck size={18} color="#8B5CF6" />
                                <Text style={[styles.infoMessageText, { color: '#7C3AED' }]}>
                                    This coupon is personal and linked to your account.
                                </Text>
                            </View>

                            {coupon.advertiser_coupons.conditions?.min_purchase && (
                                <View style={[styles.infoMessage, { backgroundColor: '#3B82F610' }]}>
                                    <Store size={18} color="#3B82F6" />
                                    <Text style={[styles.infoMessageText, { color: '#2563EB' }]}>
                                        Minimum purchase: ${coupon.advertiser_coupons.conditions.min_purchase}
                                    </Text>
                                </View>
                            )}

                            {isUsed && coupon.redeemed_at && (
                                <View style={[styles.infoMessage, { backgroundColor: '#10B98110' }]}>
                                    <CheckCircle2 size={18} color="#10B981" />
                                    <Text style={[styles.infoMessageText, { color: '#059669' }]}>
                                        Redeemed on {formatDate(coupon.redeemed_at)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.couponFooter}>
                        <Text style={styles.footerText}>Coupon ID: {coupon.id.slice(0, 8)}...</Text>
                        <Text style={styles.footerText}>Received {formatDate(coupon.assigned_at)}</Text>
                    </View>
                </View>

                {/* Redeem Button */}
                {!isUsed && !isExpired && (
                    <TouchableOpacity
                        style={styles.redeemButton}
                        onPress={handleRedeem}
                        disabled={isRedeeming}
                    >
                        <LinearGradient
                            colors={['#10B981', '#059669']}
                            style={styles.redeemButtonGradient}
                        >
                            <CheckCircle2 size={20} color="#FFF" />
                            <Text style={styles.redeemButtonText}>
                                {isRedeeming ? 'Redeeming...' : 'Mark as Redeemed'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerGradient: {
        paddingTop: 100,
        paddingBottom: 60,
        alignItems: 'center',
    },
    rewardDisplay: {
        alignItems: 'center',
    },
    rewardValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFF',
        marginTop: 12,
    },
    rewardTitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    couponCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: -40,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    statusOverlay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 8,
    },
    statusUsed: {
        backgroundColor: '#ECFDF5',
    },
    statusExpired: {
        backgroundColor: '#FEF2F2',
    },
    statusOverlayText: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    },
    section: {
        padding: 20,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    validitySection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    validityItem: {
        flex: 1,
        alignItems: 'center',
    },
    validityDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 16,
    },
    validityLabel: {
        fontSize: 11,
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    validityValue: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 4,
    },
    ticketDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerCircleLeft: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        marginLeft: -10,
    },
    dividerDashed: {
        flex: 1,
        height: 2,
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    dividerCircleRight: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        marginRight: -10,
    },
    qrSection: {
        alignItems: 'center',
        padding: 20,
    },
    qrTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    qrSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 20,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 4,
        borderColor: colors.primary,
        marginBottom: 20,
    },
    qrContainerDisabled: {
        opacity: 0.5,
        borderColor: '#D1D5DB',
    },
    codeBox: {
        backgroundColor: '#F9FAFB',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
    },
    codeLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 4,
    },
    codeValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        letterSpacing: 4,
        fontFamily: 'monospace',
    },
    instructionsBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
        width: '100%',
    },
    instructionsText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
        lineHeight: 18,
    },
    infoMessages: {
        width: '100%',
        gap: 8,
    },
    infoMessage: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    infoMessageText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 16,
    },
    couponFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    footerText: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    redeemButton: {
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    redeemButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    redeemButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    errorState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    backButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: colors.primary,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});
