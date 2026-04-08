import { StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useUserBalance, useEconomyHistory } from '@/hooks/useEconomy';
import { format } from 'date-fns';

export default function RewardsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { balance, loading: balanceLoading } = useUserBalance();
    const { history, loading: historyLoading } = useEconomyHistory();

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
            {/* PromoKeys Card (Central Economy) */}
            <View style={[styles.tierCard, { backgroundColor: DesignColors.primary }]}>
                <View style={styles.tierHeader}>
                    <Text style={styles.tierLabel}>PROMOKEYS WALLET</Text>
                    <Ionicons name="key" size={24} color={DesignColors.white} />
                </View>
                <Text style={styles.tierTitle}>{balance?.promokeys || 0} <Text style={{ color: DesignColors.secondary }}>Available</Text></Text>

                {/* Key Progress Bar */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${((balance?.points || 0) % 1000) / 10}%`, backgroundColor: DesignColors.secondary }]} />
                </View>
                <Text style={styles.tierHint}>{1000 - ((balance?.points || 0) % 1000)} pts until next Key</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                    <Text style={[styles.statVal, { color: isDark ? 'white' : 'black' }]}>{balance?.points?.toLocaleString() || 0}</Text>
                    <Text style={styles.statLab}>Total Points</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                    <Text style={[styles.statVal, { color: isDark ? 'white' : 'black' }]}>Rank 1</Text>
                    <Text style={styles.statLab}>Pioneer</Text>
                </View>
            </View>

            {/* Content Tabs (Simplified for Mobile) */}
            <Text style={[styles.sectionTitle, { color: isDark ? 'white' : 'black' }]}>Recent Activity</Text>

            {historyLoading ? (
                <ActivityIndicator size="small" color={DesignColors.primary} style={{ marginTop: 20 }} />
            ) : history.length === 0 ? (
                <View style={[styles.emptyLedger, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                    <Ionicons name="time-outline" size={32} color={DesignColors.gray[400]} />
                    <Text style={styles.emptyText}>No activity recorded yet.</Text>
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
                                    name={item.currency === 'points' ? 'flash' : 'key'}
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
                                    {item.amount > 0 ? '+' : ''}{item.amount}
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
