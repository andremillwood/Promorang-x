import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    FlatList,
    Image,
    Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    TrendingUp,
    TrendingDown,
    Search,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Briefcase,
    Star,
    Users,
    ChevronRight,
    Cpu,
    Music,
    Gamepad2,
    Heart,
    Shirt,
    Sparkles,
    Dumbbell,
    UtensilsCrossed,
    Plane,
    GraduationCap,
    Laugh,
    Filter,
    Eye,
    Wallet,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import { haptics } from '@/lib/haptics';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');
const API_URL = 'https://promorang-api.vercel.app';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
}

interface MarketOverview {
    index_value: number;
    change_percent: number;
    total_market_cap: number;
    total_volume: number;
    active_shares: number;
}

interface ContentShare {
    id: string;
    content_id: string;
    title: string;
    creator_name: string;
    creator_avatar: string;
    platform: string;
    category_name: string;
    current_price: number;
    change_24h: number;
    volume_24h: number;
    market_cap: number;
    holder_count: number;
    thumbnail?: string;
}

interface Mover {
    content_id: string;
    title: string;
    change_percent: number;
    price: number;
}

const ICON_MAP: Record<string, any> = {
    Cpu,
    Shirt,
    Music,
    Laugh,
    Sparkles,
    Briefcase,
    Gamepad2,
    Dumbbell,
    UtensilsCrossed,
    Plane,
    GraduationCap,
    Heart,
};

const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
};

const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
};

export default function PromoShareMarketScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'watchlist'>('market');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Data states
    const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [shares, setShares] = useState<ContentShare[]>([]);
    const [topGainers, setTopGainers] = useState<Mover[]>([]);
    const [topLosers, setTopLosers] = useState<Mover[]>([]);
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMarketData();
    }, []);

    const fetchMarketData = async () => {
        try {
            setIsLoading(true);
            // Fetch market overview, categories, and shares
            // For now using mock data - replace with real API calls
            
            // Mock market overview
            setMarketOverview({
                index_value: 1247.83,
                change_percent: 2.34,
                total_market_cap: 2450000,
                total_volume: 125000,
                active_shares: 342,
            });

            // Mock categories
            setCategories([
                { id: '1', name: 'Technology', slug: 'tech', description: 'Tech content', icon: 'Cpu', color: '#3B82F6' },
                { id: '2', name: 'Fashion', slug: 'fashion', description: 'Fashion content', icon: 'Shirt', color: '#EC4899' },
                { id: '3', name: 'Music', slug: 'music', description: 'Music content', icon: 'Music', color: '#8B5CF6' },
                { id: '4', name: 'Gaming', slug: 'gaming', description: 'Gaming content', icon: 'Gamepad2', color: '#EF4444' },
                { id: '5', name: 'Fitness', slug: 'fitness', description: 'Fitness content', icon: 'Dumbbell', color: '#14B8A6' },
                { id: '6', name: 'Comedy', slug: 'comedy', description: 'Comedy content', icon: 'Laugh', color: '#F59E0B' },
            ]);

            // Mock shares
            setShares([
                {
                    id: '1',
                    content_id: 'c1',
                    title: 'iPhone 16 Pro Max Review',
                    creator_name: 'TechReviewer',
                    creator_avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=tech1',
                    platform: 'YouTube',
                    category_name: 'Technology',
                    current_price: 24.50,
                    change_24h: 5.2,
                    volume_24h: 12500,
                    market_cap: 245000,
                    holder_count: 156,
                    thumbnail: 'https://picsum.photos/seed/tech1/200/200',
                },
                {
                    id: '2',
                    content_id: 'c2',
                    title: 'Summer Fashion Haul 2026',
                    creator_name: 'StyleQueen',
                    creator_avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=fashion1',
                    platform: 'TikTok',
                    category_name: 'Fashion',
                    current_price: 18.75,
                    change_24h: -2.1,
                    volume_24h: 8900,
                    market_cap: 187500,
                    holder_count: 98,
                    thumbnail: 'https://picsum.photos/seed/fashion1/200/200',
                },
                {
                    id: '3',
                    content_id: 'c3',
                    title: 'Acoustic Cover - Viral Hit',
                    creator_name: 'MusicMaven',
                    creator_avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=music1',
                    platform: 'Instagram',
                    category_name: 'Music',
                    current_price: 32.00,
                    change_24h: 12.5,
                    volume_24h: 25000,
                    market_cap: 320000,
                    holder_count: 245,
                    thumbnail: 'https://picsum.photos/seed/music1/200/200',
                },
                {
                    id: '4',
                    content_id: 'c4',
                    title: 'Epic Gaming Montage',
                    creator_name: 'ProGamer',
                    creator_avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=gaming1',
                    platform: 'Twitch',
                    category_name: 'Gaming',
                    current_price: 15.25,
                    change_24h: -0.8,
                    volume_24h: 6700,
                    market_cap: 152500,
                    holder_count: 89,
                    thumbnail: 'https://picsum.photos/seed/gaming1/200/200',
                },
            ]);

            // Mock movers
            setTopGainers([
                { content_id: 'c3', title: 'Acoustic Cover', change_percent: 12.5, price: 32.00 },
                { content_id: 'c1', title: 'iPhone Review', change_percent: 5.2, price: 24.50 },
                { content_id: 'c5', title: 'Workout Routine', change_percent: 3.8, price: 12.00 },
            ]);

            setTopLosers([
                { content_id: 'c6', title: 'Old Meme Comp', change_percent: -8.5, price: 2.50 },
                { content_id: 'c2', title: 'Fashion Haul', change_percent: -2.1, price: 18.75 },
                { content_id: 'c4', title: 'Gaming Montage', change_percent: -0.8, price: 15.25 },
            ]);

        } catch (error) {
            console.error('Error fetching market data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMarketData();
    };

    const navigateToShare = async (shareId: string) => {
        await haptics.light();
        router.push({ pathname: '/promoshare/[id]', params: { id: shareId } } as any);
    };

    const navigateToCategory = async (categorySlug: string) => {
        await haptics.light();
        setSelectedCategory(categorySlug);
    };

    const filteredShares = shares.filter(share => {
        const matchesSearch = share.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            share.creator_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || share.category_name.toLowerCase() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const renderMarketHeader = () => (
        <View style={styles.marketHeader}>
            {/* Market Index Card */}
            <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.indexCard}
            >
                <View style={styles.indexHeader}>
                    <View>
                        <Text style={styles.indexLabel}>PromoShare Index</Text>
                        <Text style={styles.indexValue}>
                            {marketOverview?.index_value.toFixed(2) || '---'}
                        </Text>
                    </View>
                    <View style={[
                        styles.changeBadge,
                        { backgroundColor: (marketOverview?.change_percent || 0) >= 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }
                    ]}>
                        {(marketOverview?.change_percent || 0) >= 0 ? (
                            <ArrowUpRight size={16} color="#10B981" />
                        ) : (
                            <ArrowDownRight size={16} color="#EF4444" />
                        )}
                        <Text style={[
                            styles.changeText,
                            { color: (marketOverview?.change_percent || 0) >= 0 ? '#10B981' : '#EF4444' }
                        ]}>
                            {Math.abs(marketOverview?.change_percent || 0).toFixed(2)}%
                        </Text>
                    </View>
                </View>

                <View style={styles.indexStats}>
                    <View style={styles.indexStat}>
                        <Text style={styles.indexStatLabel}>Market Cap</Text>
                        <Text style={styles.indexStatValue}>
                            {formatCurrency(marketOverview?.total_market_cap || 0)}
                        </Text>
                    </View>
                    <View style={styles.indexStat}>
                        <Text style={styles.indexStatLabel}>24h Volume</Text>
                        <Text style={styles.indexStatValue}>
                            {formatVolume(marketOverview?.total_volume || 0)}
                        </Text>
                    </View>
                    <View style={styles.indexStat}>
                        <Text style={styles.indexStatLabel}>Active</Text>
                        <Text style={styles.indexStatValue}>
                            {marketOverview?.active_shares || 0}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={[styles.quickAction, { backgroundColor: theme.surface }]}
                    onPress={() => router.push('/promoshare/portfolio' as any)}
                >
                    <Wallet size={20} color={colors.primary} />
                    <Text style={[styles.quickActionText, { color: theme.text }]}>Portfolio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.quickAction, { backgroundColor: theme.surface }]}
                    onPress={() => router.push('/promoshare/watchlist' as any)}
                >
                    <Star size={20} color="#F59E0B" />
                    <Text style={[styles.quickActionText, { color: theme.text }]}>Watchlist</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.quickAction, { backgroundColor: theme.surface }]}
                    onPress={() => router.push('/promoshare/activity' as any)}
                >
                    <Activity size={20} color="#10B981" />
                    <Text style={[styles.quickActionText, { color: theme.text }]}>Activity</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderMovers = () => (
        <View style={styles.moversSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Market Movers</Text>
            
            <View style={styles.moversRow}>
                {/* Top Gainers */}
                <View style={[styles.moverCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.moverHeader}>
                        <TrendingUp size={16} color="#10B981" />
                        <Text style={[styles.moverTitle, { color: '#10B981' }]}>Top Gainers</Text>
                    </View>
                    {topGainers.slice(0, 3).map((mover, index) => (
                        <TouchableOpacity
                            key={mover.content_id}
                            style={styles.moverItem}
                            onPress={() => navigateToShare(mover.content_id)}
                        >
                            <Text style={[styles.moverRank, { color: theme.textSecondary }]}>{index + 1}</Text>
                            <Text style={[styles.moverName, { color: theme.text }]} numberOfLines={1}>
                                {mover.title}
                            </Text>
                            <Text style={styles.moverChange}>+{mover.change_percent.toFixed(1)}%</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Top Losers */}
                <View style={[styles.moverCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.moverHeader}>
                        <TrendingDown size={16} color="#EF4444" />
                        <Text style={[styles.moverTitle, { color: '#EF4444' }]}>Top Losers</Text>
                    </View>
                    {topLosers.slice(0, 3).map((mover, index) => (
                        <TouchableOpacity
                            key={mover.content_id}
                            style={styles.moverItem}
                            onPress={() => navigateToShare(mover.content_id)}
                        >
                            <Text style={[styles.moverRank, { color: theme.textSecondary }]}>{index + 1}</Text>
                            <Text style={[styles.moverName, { color: theme.text }]} numberOfLines={1}>
                                {mover.title}
                            </Text>
                            <Text style={[styles.moverChangeLoss]}>{mover.change_percent.toFixed(1)}%</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderCategories = () => (
        <View style={styles.categoriesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScroll}
            >
                <TouchableOpacity
                    style={[
                        styles.categoryChip,
                        !selectedCategory && styles.categoryChipActive,
                        { backgroundColor: !selectedCategory ? colors.primary : theme.surface }
                    ]}
                    onPress={() => setSelectedCategory(null)}
                >
                    <BarChart3 size={16} color={!selectedCategory ? '#FFF' : theme.textSecondary} />
                    <Text style={[
                        styles.categoryChipText,
                        { color: !selectedCategory ? '#FFF' : theme.text }
                    ]}>All</Text>
                </TouchableOpacity>
                {categories.map((category) => {
                    const IconComponent = ICON_MAP[category.icon] || BarChart3;
                    const isActive = selectedCategory === category.slug;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryChip,
                                isActive && styles.categoryChipActive,
                                { backgroundColor: isActive ? category.color : theme.surface }
                            ]}
                            onPress={() => navigateToCategory(category.slug)}
                        >
                            <IconComponent size={16} color={isActive ? '#FFF' : category.color} />
                            <Text style={[
                                styles.categoryChipText,
                                { color: isActive ? '#FFF' : theme.text }
                            ]}>{category.name}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderShareCard = ({ item }: { item: ContentShare }) => {
        const isPositive = item.change_24h >= 0;

        return (
            <TouchableOpacity
                style={[styles.shareCard, { backgroundColor: theme.surface }]}
                onPress={() => navigateToShare(item.id)}
                activeOpacity={0.7}
            >
                <Image
                    source={{ uri: item.thumbnail || item.creator_avatar }}
                    style={styles.shareThumbnail}
                />
                <View style={styles.shareInfo}>
                    <Text style={[styles.shareTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={[styles.shareCreator, { color: theme.textSecondary }]}>
                        {item.creator_name} • {item.platform}
                    </Text>
                    <View style={styles.shareStats}>
                        <View style={styles.holdersBadge}>
                            <Users size={12} color={theme.textSecondary} />
                            <Text style={[styles.holdersText, { color: theme.textSecondary }]}>
                                {item.holder_count}
                            </Text>
                        </View>
                        <Text style={[styles.shareVolume, { color: theme.textSecondary }]}>
                            Vol: {formatVolume(item.volume_24h)}
                        </Text>
                    </View>
                </View>
                <View style={styles.sharePriceSection}>
                    <Text style={[styles.sharePrice, { color: theme.text }]}>
                        ${item.current_price.toFixed(2)}
                    </Text>
                    <View style={[
                        styles.shareChangeBadge,
                        { backgroundColor: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }
                    ]}>
                        {isPositive ? (
                            <ArrowUpRight size={14} color="#10B981" />
                        ) : (
                            <ArrowDownRight size={14} color="#EF4444" />
                        )}
                        <Text style={{ color: isPositive ? '#10B981' : '#EF4444', fontSize: 12, fontWeight: '600' }}>
                            {Math.abs(item.change_24h).toFixed(1)}%
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'PromoShare',
                    headerStyle: { backgroundColor: theme.background },
                    headerTitleStyle: { color: theme.text, fontWeight: '700' },
                    headerRight: () => (
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => router.push('/promoshare/search' as any)}
                        >
                            <Search size={22} color={theme.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <FlatList
                data={filteredShares}
                keyExtractor={(item) => item.id}
                renderItem={renderShareCard}
                ListHeaderComponent={
                    <>
                        {renderMarketHeader()}
                        {renderMovers()}
                        {renderCategories()}
                        
                        {/* Search Bar */}
                        <View style={styles.searchSection}>
                            <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                                <Search size={18} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.searchInput, { color: theme.text }]}
                                    placeholder="Search shares..."
                                    placeholderTextColor={theme.textSecondary}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>
                        </View>

                        <View style={styles.listHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Shares` : 'All Shares'}
                            </Text>
                            <Text style={[styles.shareCount, { color: theme.textSecondary }]}>
                                {filteredShares.length} shares
                            </Text>
                        </View>
                    </>
                }
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
                        <BarChart3 size={48} color={theme.textSecondary} style={{ opacity: 0.3 }} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Shares Found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                            Try adjusting your search or filters
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
    headerButton: {
        padding: 8,
        marginRight: 8,
    },
    listContent: {
        paddingBottom: 100,
    },
    // Market Header
    marketHeader: {
        padding: 16,
    },
    indexCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
    indexHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    indexLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    indexValue: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFF',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    changeText: {
        fontSize: 14,
        fontWeight: '700',
    },
    indexStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    indexStat: {
        alignItems: 'center',
    },
    indexStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
    },
    indexStatValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
    quickAction: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 14,
        gap: 8,
    },
    quickActionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    // Movers Section
    moversSection: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    moversRow: {
        flexDirection: 'row',
        gap: 12,
    },
    moverCard: {
        flex: 1,
        borderRadius: 14,
        padding: 14,
    },
    moverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    moverTitle: {
        fontSize: 13,
        fontWeight: '600',
    },
    moverItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.1)',
    },
    moverRank: {
        width: 20,
        fontSize: 12,
        fontWeight: '600',
    },
    moverName: {
        flex: 1,
        fontSize: 13,
        marginRight: 8,
    },
    moverChange: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10B981',
    },
    moverChangeLoss: {
        fontSize: 12,
        fontWeight: '700',
        color: '#EF4444',
    },
    // Categories
    categoriesSection: {
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    categoriesScroll: {
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    categoryChipActive: {},
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    // Search
    searchSection: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    // List Header
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    shareCount: {
        fontSize: 13,
    },
    // Share Card
    shareCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 10,
        padding: 14,
        borderRadius: 14,
    },
    shareThumbnail: {
        width: 56,
        height: 56,
        borderRadius: 12,
        marginRight: 12,
    },
    shareInfo: {
        flex: 1,
    },
    shareTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    shareCreator: {
        fontSize: 12,
        marginBottom: 6,
    },
    shareStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    holdersBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    holdersText: {
        fontSize: 11,
    },
    shareVolume: {
        fontSize: 11,
    },
    sharePriceSection: {
        alignItems: 'flex-end',
    },
    sharePrice: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    shareChangeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 2,
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
});
