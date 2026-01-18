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

const { width } = Dimensions.get('window');

// Mock data for trending content
const MOCK_TRENDING = [
    {
        id: '1',
        thumbnail: 'https://picsum.photos/300/400?random=1',
        title: 'Amazing street food tour in Tokyo',
        platform: 'TikTok',
        views: 125000,
        growthRate: 340,
        estimatedValue: '$2.50',
        postedAgo: '2h',
        claimed: false,
    },
    {
        id: '2',
        thumbnail: 'https://picsum.photos/300/400?random=2',
        title: 'Budget travel hacks you NEED to know',
        platform: 'Instagram',
        views: 89000,
        growthRate: 280,
        estimatedValue: '$1.80',
        postedAgo: '4h',
        claimed: false,
    },
    {
        id: '3',
        thumbnail: 'https://picsum.photos/300/400?random=3',
        title: 'Workout routine that changed my life',
        platform: 'YouTube',
        views: 210000,
        growthRate: 520,
        estimatedValue: '$4.20',
        postedAgo: '6h',
        claimed: true,
    },
    {
        id: '4',
        thumbnail: 'https://picsum.photos/300/400?random=4',
        title: 'This makeup trick went viral',
        platform: 'TikTok',
        views: 450000,
        growthRate: 890,
        estimatedValue: '$8.50',
        postedAgo: '1h',
        claimed: false,
    },
];

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
    const [content, setContent] = useState(MOCK_TRENDING);

    const onRefresh = async () => {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Simulate refresh
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleClaimContent = async (id: string) => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setContent(prev =>
            prev.map(item =>
                item.id === id ? { ...item, claimed: true } : item
            )
        );
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
        if (views >= 1000) return (views / 1000).toFixed(0) + 'K';
        return views.toString();
    };

    const renderContentCard = ({ item }: { item: typeof MOCK_TRENDING[0] }) => (
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
                            onPress={() => handleClaimContent(item.id)}
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Bounty Hunt</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Find viral content, earn finder's fees
                    </Text>
                </View>
                <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Filter size={18} color={theme.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Stats Banner */}
            <View style={styles.statsBanner}>
                <LinearGradient
                    colors={['rgba(249, 115, 22, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.statsBannerGradient, { borderColor: 'rgba(249, 115, 22, 0.2)' }]}
                >
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
                </LinearGradient>
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

            {/* Content Grid */}
            <FlatList
                data={content}
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
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>
                            🔥 Trending Now
                        </Text>
                        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                            {content.length} opportunities
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsBanner: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    statsBannerGradient: {
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
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
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
