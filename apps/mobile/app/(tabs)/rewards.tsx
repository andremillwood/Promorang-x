import { StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useUserBalance, useEconomyHistory } from '@/hooks/useEconomy';
import { useCouponWallet } from '@/hooks/useCouponWallet';
import { format } from 'date-fns';

export default function RewardsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { balance, loading: balanceLoading } = useUserBalance();
    const { history, loading: historyLoading } = useEconomyHistory();
    const { coupons, loading: couponsLoading } = useCouponWallet();
    const availableGems = balance?.gems || 0;
    const securedSignals = (balance?.promokeys || 0) + (balance?.gold || 0);
    const gemProgress = Math.min(((availableGems % 250) / 250) * 100, 100);

    if (balanceLoading) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
                <ActivityIndicator size="large" color={DesignColors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Gem-native reward wallet */}
            <View style={[styles.tierCard, { backgroundColor: DesignColors.primary }]}>
                <View style={styles.tierHeader}>
                <Text style={styles.tierLabel}>REWARD WALLET</Text>
                    <Ionicons name="diamond" size={24} color={DesignColors.white} />
                </View>
                <Text style={styles.tierTitle}>{availableGems.toLocaleString()} <Text style={{ color: DesignColors.secondary }}>Gems available</Text></Text>

                {/* Gem progress marker */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${gemProgress}%`, backgroundColor: DesignColors.secondary }]} />
                </View>
                <Text style={styles.tierHint}>{250 - (availableGems % 250)} Gems until your next 250-Gem value marker</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                    <Text style={[styles.statVal, { color: isDark ? 'white' : 'black' }]}>{availableGems.toLocaleString()}</Text>
                    <Text style={styles.statLab}>Available Gems</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                    <Text style={[styles.statVal, { color: isDark ? 'white' : 'black' }]}>{securedSignals.toLocaleString()}</Text>
                    <Text style={styles.statLab}>Access signals</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: isDark ? 'white' : 'black', marginBottom: 0 }]}>Claimed Offers</Text>
                <Text style={styles.sectionCount}>{coupons.length}</Text>
            </View>

            {couponsLoading ? (
                <ActivityIndicator size="small" color={DesignColors.primary} style={{ marginBottom: 20 }} />
            ) : coupons.length === 0 ? (
                <View style={[styles.emptyLedger, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white, marginBottom: Spacing.xl }]}>
                    <Ionicons name="pricetag-outline" size={32} color={DesignColors.gray[400]} />
                    <Text style={styles.emptyText}>Claimed offers will live here.</Text>
                </View>
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offerRail} contentContainerStyle={styles.offerRailContent}>
                    {coupons.slice(0, 8).map((item) => {
                        const coupon = item.coupons;
                        const value = coupon?.discount_value ? `${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : ''}` : 'Offer';
                        return (
                            <Pressable
                                key={item.id}
                                style={[styles.offerCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                                onPress={() => Alert.alert(
                                    coupon?.name || 'Promorang offer',
                                    `Code: ${item.claim_code || 'Code pending'}\nStatus: ${item.status}${item.expires_at ? `\nExpires: ${format(new Date(item.expires_at), 'MMM d, yyyy')}` : ''}\n\nShow this code to the merchant when redeeming.`
                                )}
                            >
                                <View style={styles.offerTop}>
                                    <View style={styles.offerIcon}>
                                        <Ionicons name={item.status === 'redeemed' ? 'checkmark-circle' : 'pricetag'} size={18} color={DesignColors.black} />
                                    </View>
                                    <Text style={[styles.offerStatus, item.status === 'redeemed' && { color: DesignColors.success }]}>{item.status}</Text>
                                </View>
                                <Text numberOfLines={2} style={[styles.offerTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>{coupon?.name || 'Promorang offer'}</Text>
                                <Text style={styles.offerStore}>{coupon?.merchant_stores?.store_name || value}</Text>
                                <Text selectable style={[styles.offerCode, { color: isDark ? DesignColors.white : DesignColors.black }]}>{item.claim_code || 'CODE READY'}</Text>
                                <Text style={styles.offerExpiry}>{item.expires_at ? `Until ${format(new Date(item.expires_at), 'MMM d')}` : 'No expiry posted'}</Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            )}

            {/* Content Tabs (Simplified for Mobile) */}
            <Text style={[styles.sectionTitle, { color: isDark ? 'white' : 'black' }]}>Recent Activity</Text>

            {historyLoading ? (
                <ActivityIndicator size="small" color={DesignColors.primary} style={{ marginTop: 20 }} />
            ) : history.length === 0 ? (
                <View style={[styles.emptyLedger, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                    <Ionicons name="time-outline" size={32} color={DesignColors.gray[400]} />
                    <Text style={styles.emptyText}>No reward activity yet.</Text>
                </View>
            ) : (
                <View style={styles.rewardsList}>
                    {history.map((item) => (
                        <View
                            key={item.id}
                            style={[styles.rewardItem, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                        >
                            <View style={[styles.rewardIcon, { backgroundColor: item.amount > 0 ? DesignColors.success + '15' : DesignColors.error + '15' }]}>
                                <Ionicons
                                    name={item.currency === 'gems' ? 'diamond' : 'sparkles'}
                                    size={20}
                                    color={item.amount > 0 ? DesignColors.success : DesignColors.error}
                                />
                            </View>
                            <View style={styles.rewardInfo}>
                                <Text style={[styles.rewardTitle, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                                    {item.description || item.transaction_type}
                                </Text>
                                <Text style={styles.rewardVenue}>{format(new Date(item.created_at), 'MMM d, h:mm a')}</Text>
                            </View>
                            <View style={[styles.rewardPrice, { backgroundColor: item.amount > 0 ? DesignColors.success + '20' : DesignColors.error + '20' }]}>
                                <Text style={[styles.priceText, { color: item.amount > 0 ? DesignColors.success : DesignColors.error }]}>
                                    {item.amount > 0 ? '+' : ''}{item.amount} {item.currency === 'gems' ? 'Gems' : 'value'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: Spacing.container,
        paddingTop: Platform.OS === 'ios' ? 20 : 10,
    },
    tierCard: {
        borderRadius: BorderRadius["2xl"],
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    tierHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        backgroundColor: 'transparent',
    },
    tierLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1,
    },
    tierTitle: {
        fontSize: Typography.sizes["2xl"],
        fontWeight: 'bold',
        color: DesignColors.white,
        marginBottom: Spacing.md,
    },
    progressTrack: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 4,
        marginBottom: Spacing.sm,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    tierHint: {
        fontSize: Typography.sizes.xs,
        color: 'rgba(255,255,255,0.8)',
        fontStyle: 'italic',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
        backgroundColor: 'transparent',
    },
    statBox: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statVal: {
        fontSize: Typography.sizes.xl,
        fontWeight: 'bold',
    },
    statLab: {
        fontSize: Typography.sizes.xs,
        color: DesignColors.gray[500],
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: 'bold',
        marginBottom: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        backgroundColor: 'transparent',
    },
    sectionCount: {
        minWidth: 30,
        overflow: 'hidden',
        borderRadius: BorderRadius.full,
        paddingHorizontal: 9,
        paddingVertical: 4,
        textAlign: 'center',
        color: DesignColors.black,
        backgroundColor: DesignColors.secondary,
        fontSize: 11,
        fontWeight: '900' as any,
    },
    offerRail: {
        marginHorizontal: -Spacing.container,
        marginBottom: Spacing.xl,
    },
    offerRailContent: {
        paddingHorizontal: Spacing.container,
        gap: Spacing.sm,
    },
    offerCard: {
        width: 230,
        minHeight: 178,
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    offerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: Spacing.md,
    },
    offerIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: DesignColors.primary,
    },
    offerStatus: {
        color: DesignColors.primary,
        fontSize: 10,
        fontWeight: '900' as any,
        textTransform: 'uppercase',
    },
    offerTitle: {
        fontSize: Typography.sizes.base,
        lineHeight: 20,
        fontWeight: '900' as any,
    },
    offerStore: {
        marginTop: 4,
        fontSize: Typography.sizes.xs,
        color: DesignColors.gray[500],
    },
    offerCode: {
        marginTop: Spacing.md,
        fontFamily: 'SpaceMono',
        fontSize: 13,
        letterSpacing: 0.5,
    },
    offerExpiry: {
        marginTop: 4,
        fontSize: 10,
        color: DesignColors.gray[500],
    },
    rewardsList: {
        gap: Spacing.sm,
        backgroundColor: 'transparent',
    },
    rewardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    rewardIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    rewardInfo: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    rewardTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: 'bold',
    },
    rewardVenue: {
        fontSize: Typography.sizes.xs,
        color: DesignColors.gray[500],
        marginTop: 2,
    },
    rewardPrice: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: DesignColors.secondary,
    },
    priceText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyLedger: {
        padding: 40,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: DesignColors.gray[500],
        fontWeight: 'medium',
    },
});
