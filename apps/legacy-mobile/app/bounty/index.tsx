/**
 * Bounty Hunt Hub
 * 
 * Mobile interface for scouting content and earning finder's fees.
 * Users can browse trending content, claim it, and earn when brands sponsor it.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Image,
    RefreshControl,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Search,
    TrendingUp,
    Eye,
    Clock,
    DollarSign,
    ChevronRight,
    Sparkles,
    Target,
    Award,
    Filter
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import TodayLayout from '@/components/TodayLayout';
import { useBountyStore } from '@/store/bountyStore';
import { AppHeader } from '@/components/ui/AppHeader';
import { BalancesBar } from '@/components/ui/BalancesBar';
import { useAuthStore } from '@/store/authStore';
import { Stack } from 'expo-router';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'new', label: 'New', icon: Clock },
    { id: 'high_value', label: 'High Value', icon: DollarSign },
];

export default function BountyHuntScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');

    // Use store instead of local state
    const { user } = useAuthStore();
    const { trendingItems, isLoading, fetchTrending, claimBounty } = useBountyStore();

    useEffect(() => {
        fetchTrending();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await fetchTrending();
        setRefreshing(false);
    };

    const handleClaimContent = async (item: any) => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await claimBounty(item);
        } catch (error) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            alert('Failed to claim: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
        if (views >= 1000) return (views / 1000).toFixed(0) + 'K';
        return views.toString();
    };

    const renderContentCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.contentCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push(`/content-share/${item.id}`)}
            activeOpacity={0.8}
        >
            <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumbnail}
            />

            {/* Growth Badge */}
            <View style={styles.growthBadge}>
                <TrendingUp size={12} color="#10B981" />
                <Text style={styles.growthText}>+{item.growthRate}%</Text>
            </View>

            {/* Content Info */}
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                    {item.title}
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Eye size={12} color={theme.textSecondary} />
                        <Text style={[styles.statText, { color: theme.textSecondary }]}>
                            {formatViews(item.views)}
                        </Text>
                    </View>
                    <View style={styles.stat}>
                        <Clock size={12} color={theme.textSecondary} />
                        <Text style={[styles.statText, { color: theme.textSecondary }]}>
                            {item.postedAgo}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.valueContainer}>
                        <Text style={styles.valueLabel}>Est. Value</Text>
                        <Text style={styles.valueAmount}>{item.estimatedValue}</Text>
                    </View>

                    {item.claimed ? (
                        <View style={[styles.claimedBadge, { backgroundColor: theme.border }]}>
                            <Text style={[styles.claimedText, { color: theme.textSecondary }]}>Claimed</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.claimButton}
                            onPress={() => handleClaimContent(item)}
                        >
                            <LinearGradient
                                colors={['#F97316', '#EC4899']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.claimButtonGradient}
                            >
                                <Target size={14} color="#FFF" />
                                <Text style={styles.claimButtonText}>Claim</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <TodayLayout>
            <AppHeader transparent hideLeft showBack showNotifications showAvatar />
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ headerShown: false }} />

                <FlatList
                    data={trendingItems}
                    renderItem={renderContentCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    ListHeaderComponent={() => (
                        <View style={styles.headerContainer}>
                            <LinearGradient
                                colors={['#F97316', '#EC4899']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroSection}
                            >
                                <View style={styles.heroContent}>
                                    <View>
                                        <Text style={styles.heroTitle}>Bounty Hunt</Text>
                                        <Text style={styles.heroSubtitle}>Find viral content, earn fees</Text>
                                    </View>
                                    <Target size={40} color="rgba(255,255,255,0.2)" />
                                </View>
                                <Sparkles size={100} color="rgba(255,255,255,0.05)" style={styles.heroIcon} />
                            </LinearGradient>

                            <View style={styles.contentPadding}>
                                <View style={{ paddingHorizontal: 16 }}>
                                    <BalancesBar user={user} />
                                </View>

                                {/* Stats Banner */}
                                <View style={styles.statsBanner}>
                                    <View style={[styles.statsBannerContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
                                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Claimed</Text>
                                        </View>
                                        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: '#10B981' }]}>$0.00</Text>
                                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Earned</Text>
                                        </View>
                                        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                                        <View style={styles.statItem}>
                                            <Text style={[styles.statValue, { color: theme.text }]}>0</Text>
                                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Categories */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.categoriesContainer}
                                    contentContainerStyle={styles.categoriesContent}
                                >
                                    {CATEGORIES.map((cat) => {
                                        const Icon = cat.icon;
                                        const isActive = activeCategory === cat.id;

                                        return (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[
                                                    styles.categoryChip,
                                                    {
                                                        backgroundColor: isActive ? colors.primary : theme.surface,
                                                        borderColor: isActive ? colors.primary : theme.border,
                                                    }
                                                ]}
                                                onPress={() => {
                                                    Haptics.selectionAsync();
                                                    setActiveCategory(cat.id);
                                                }}
                                            >
                                                <Icon size={14} color={isActive ? '#FFF' : theme.textSecondary} />
                                                <Text style={[
                                                    styles.categoryLabel,
                                                    { color: isActive ? '#FFF' : theme.text }
                                                ]}>
                                                    {cat.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                        🔥 Trending Now
                                    </Text>
                                    <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                                        {trendingItems.length} items
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                />
            </View>
        </TodayLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        marginBottom: 8,
    },
    heroSection: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    heroIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
    },
    contentPadding: {
        paddingHorizontal: 0,
        marginTop: -20,
    },
    statsBanner: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    statsBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 32,
        marginHorizontal: 12,
    },
    categoriesContainer: {
        maxHeight: 44,
        marginBottom: 16,
    },
    categoriesContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
        marginRight: 8,
    },
    categoryLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    sectionSubtitle: {
        fontSize: 12,
    },
    contentCard: {
        width: (width - 44) / 2,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: 160,
        backgroundColor: '#1A1A1A',
    },
    growthBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    growthText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 11,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueContainer: {},
    valueLabel: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    valueAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },
    claimButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    claimButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        gap: 4,
    },
    claimButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    claimedBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    claimedText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
