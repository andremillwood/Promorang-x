import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Dimensions,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Search,
    TrendingUp,
    Calendar,
    ShoppingBag,
    BarChart3,
    Ticket,
    Gift,
    Users,
    Sparkles,
    ChevronRight,
    Play,
    Star,
    MapPin,
    Clock,
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { haptics } from '@/lib/haptics';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');
const API_URL = 'https://promorang-api.vercel.app';

interface Category {
    id: string;
    name: string;
    icon: any;
    color: string;
    route: string;
    description: string;
}

interface FeaturedItem {
    id: string;
    type: 'event' | 'content' | 'drop' | 'product';
    title: string;
    subtitle: string;
    image: string;
    badge?: string;
}

const CATEGORIES: Category[] = [
    { id: 'events', name: 'Events', icon: Calendar, color: '#EC4899', route: '/events', description: 'Upcoming experiences' },
    { id: 'invest', name: 'Invest', icon: TrendingUp, color: '#3B82F6', route: '/(tabs)/forecasts', description: 'Forecasts & shares' },
    { id: 'growth', name: 'Growth Hub', icon: Sparkles, color: '#10B981', route: '/(tabs)/growth', description: 'Stake & grow' },
    { id: 'shop', name: 'Shop', icon: ShoppingBag, color: '#F59E0B', route: '/(tabs)/shop', description: 'Products & merch' },
    { id: 'promoshare', name: 'PromoShare', icon: Ticket, color: '#8B5CF6', route: '/promoshare', description: 'Weekly draws' },
    { id: 'leaderboard', name: 'Leaderboard', icon: BarChart3, color: '#EF4444', route: '/leaderboard', description: 'Top creators' },
    { id: 'referrals', name: 'Referrals', icon: Users, color: '#6366F1', route: '/referrals', description: 'Invite & earn' },
    { id: 'market', name: 'Market', icon: BarChart3, color: '#14B8A6', route: '/market', description: 'Trade content shares' },
];

const QUICK_ACTIONS = [
    { id: 'trending', name: 'Trending', icon: Sparkles, color: '#F59E0B' },
    { id: 'new', name: 'New', icon: Star, color: '#10B981' },
    { id: 'nearby', name: 'Nearby', icon: MapPin, color: '#EC4899' },
    { id: 'live', name: 'Live', icon: Play, color: '#EF4444' },
];

export default function DiscoverScreen() {
    const router = useRouter();
    const theme = useThemeColors();

    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [featuredEvents, setFeaturedEvents] = useState<FeaturedItem[]>([]);
    const [trendingContent, setTrendingContent] = useState<FeaturedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDiscoverData();
    }, []);

    const fetchDiscoverData = async () => {
        try {
            setIsLoading(true);

            // Fetch events
            try {
                const eventsRes = await fetch(`${API_URL}/api/events?limit=5`);
                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    const events = Array.isArray(eventsData?.events) ? eventsData.events
                        : Array.isArray(eventsData?.data) ? eventsData.data
                        : Array.isArray(eventsData) ? eventsData : [];
                    
                    setFeaturedEvents(events.slice(0, 4).map((e: any) => ({
                        id: e.id,
                        type: 'event',
                        title: e.title || 'Upcoming Event',
                        subtitle: e.location || 'Virtual',
                        image: e.image_url || 'https://picsum.photos/seed/event/400/200',
                        badge: e.ticket_price ? `$${e.ticket_price}` : 'Free',
                    })));
                }
            } catch (e) {
                console.log('Events fetch failed');
            }

            // Fetch trending content
            try {
                const contentRes = await fetch(`${API_URL}/api/content?limit=6&sort=trending`);
                if (contentRes.ok) {
                    const contentData = await contentRes.json();
                    const content = Array.isArray(contentData?.content) ? contentData.content
                        : Array.isArray(contentData?.data) ? contentData.data
                        : Array.isArray(contentData) ? contentData : [];
                    
                    setTrendingContent(content.slice(0, 6).map((c: any) => ({
                        id: c.id,
                        type: 'content',
                        title: c.title || 'Content',
                        subtitle: c.creator_name || 'Creator',
                        image: c.thumbnail_url || c.image_url || 'https://picsum.photos/seed/content/200/200',
                    })));
                }
            } catch (e) {
                console.log('Content fetch failed');
            }

            // Fallback mock data if APIs fail
            if (featuredEvents.length === 0) {
                setFeaturedEvents([
                    { id: '1', type: 'event', title: 'Creator Meetup NYC', subtitle: 'New York, NY', image: 'https://picsum.photos/seed/event1/400/200', badge: '$25' },
                    { id: '2', type: 'event', title: 'Music Festival 2026', subtitle: 'Los Angeles, CA', image: 'https://picsum.photos/seed/event2/400/200', badge: '$50' },
                    { id: '3', type: 'event', title: 'Tech Conference', subtitle: 'San Francisco, CA', image: 'https://picsum.photos/seed/event3/400/200', badge: 'Free' },
                ]);
            }

            if (trendingContent.length === 0) {
                setTrendingContent([
                    { id: '1', type: 'content', title: 'iPhone 16 Review', subtitle: 'TechReviewer', image: 'https://picsum.photos/seed/c1/200/200' },
                    { id: '2', type: 'content', title: 'Summer Fashion', subtitle: 'StyleQueen', image: 'https://picsum.photos/seed/c2/200/200' },
                    { id: '3', type: 'content', title: 'Viral Dance', subtitle: 'DancePro', image: 'https://picsum.photos/seed/c3/200/200' },
                    { id: '4', type: 'content', title: 'Cooking Tips', subtitle: 'ChefMaster', image: 'https://picsum.photos/seed/c4/200/200' },
                ]);
            }

        } catch (error) {
            console.error('Error fetching discover data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDiscoverData();
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            haptics.light();
            router.push({ pathname: '/search', params: { q: searchQuery } } as any);
        }
    };

    const navigateToCategory = async (route: string) => {
        await haptics.light();
        router.push(route as any);
    };

    const navigateToItem = async (item: FeaturedItem) => {
        await haptics.light();
        if (item.type === 'event') {
            router.push({ pathname: '/events/[id]', params: { id: item.id } } as any);
        } else if (item.type === 'content') {
            router.push({ pathname: '/post/[id]', params: { id: item.id } } as any);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                        <Search size={20} color={theme.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="Search events, content, creators..."
                            placeholderTextColor={theme.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsRow}>
                    {QUICK_ACTIONS.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.quickAction}
                            onPress={() => haptics.light()}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                                <action.icon size={20} color={action.color} />
                            </View>
                            <Text style={[styles.quickActionText, { color: theme.text }]}>{action.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Categories Grid */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore</Text>
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[styles.categoryCard, { backgroundColor: theme.surface }]}
                                onPress={() => navigateToCategory(category.route)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                                    <category.icon size={24} color={category.color} />
                                </View>
                                <Text style={[styles.categoryName, { color: theme.text }]}>{category.name}</Text>
                                <Text style={[styles.categoryDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                                    {category.description}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Featured Events */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Events</Text>
                        <TouchableOpacity onPress={() => navigateToCategory('/events')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                        {featuredEvents.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={styles.eventCard}
                                onPress={() => navigateToItem(event)}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: event.image }} style={styles.eventImage} />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    style={styles.eventGradient}
                                >
                                    {event.badge && (
                                        <View style={styles.eventBadge}>
                                            <Text style={styles.eventBadgeText}>{event.badge}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                                    <View style={styles.eventLocationRow}>
                                        <MapPin size={12} color="rgba(255,255,255,0.8)" />
                                        <Text style={styles.eventLocation}>{event.subtitle}</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Trending Content */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Now</Text>
                        <TouchableOpacity onPress={() => navigateToCategory('/market')}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.contentGrid}>
                        {trendingContent.map((content) => (
                            <TouchableOpacity
                                key={content.id}
                                style={[styles.contentCard, { backgroundColor: theme.surface }]}
                                onPress={() => navigateToItem(content)}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: content.image }} style={styles.contentImage} />
                                <View style={styles.contentInfo}>
                                    <Text style={[styles.contentTitle, { color: theme.text }]} numberOfLines={1}>
                                        {content.title}
                                    </Text>
                                    <Text style={[styles.contentSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                                        {content.subtitle}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* PromoShare Banner */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.promoBanner}
                        onPress={() => navigateToCategory('/promoshare')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#6366F1', '#8B5CF6', '#EC4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.promoBannerGradient}
                        >
                            <View style={styles.promoBannerContent}>
                                <Ticket size={32} color="#FFF" />
                                <View style={styles.promoBannerText}>
                                    <Text style={styles.promoBannerTitle}>PromoShare Weekly Draw</Text>
                                    <Text style={styles.promoBannerSubtitle}>Earn tickets & win prizes!</Text>
                                </View>
                                <ChevronRight size={24} color="#FFF" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    // Search
    searchSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    // Quick Actions
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    quickAction: {
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '500',
    },
    // Sections
    section: {
        paddingHorizontal: 16,
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 12,
    },
    // Categories Grid
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryCard: {
        width: (width - 42) / 2,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    categoryIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    categoryDesc: {
        fontSize: 12,
    },
    // Events
    horizontalScroll: {
        paddingRight: 16,
    },
    eventCard: {
        width: 260,
        height: 150,
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: 12,
    },
    eventImage: {
        width: '100%',
        height: '100%',
    },
    eventGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        paddingTop: 40,
    },
    eventBadge: {
        position: 'absolute',
        top: -30,
        right: 12,
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    eventBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    eventLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eventLocation: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    // Content Grid
    contentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    contentCard: {
        width: (width - 42) / 2,
        borderRadius: 14,
        overflow: 'hidden',
    },
    contentImage: {
        width: '100%',
        height: 100,
    },
    contentInfo: {
        padding: 10,
    },
    contentTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    contentSubtitle: {
        fontSize: 11,
    },
    // Promo Banner
    promoBanner: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    promoBannerGradient: {
        padding: 20,
    },
    promoBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    promoBannerText: {
        flex: 1,
        marginLeft: 16,
    },
    promoBannerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    promoBannerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
});
