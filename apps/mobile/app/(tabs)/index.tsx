import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFeedStore } from '@/store/feedStore';
import { PostCard } from '@/components/feed/PostCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { AppHeader } from '@/components/ui/AppHeader';
import { FeedTabBar, FeedTab } from '@/components/feed/FeedTabBar';
import { FileText, Coins, Diamond, Target, Flame, ArrowRight, Trophy, Shield, TrendingUp, DollarSign, Sparkles } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { FlashList } from '@shopify/flash-list';
import { analytics } from '@/lib/analytics';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { TaskCard } from '@/components/tasks/TaskCard';
import { EventCard } from '@/components/feed/EventCard';
import { CouponCard } from '@/components/feed/CouponCard';
import { ProductCard } from '@/components/feed/ProductCard';
import { StreakWidget } from '@/components/dashboard/StreakWidget';
import { QuestsWidget } from '@/components/dashboard/QuestsWidget';
import { PersonalizedSection } from '@/components/feed/PersonalizedSection';
import { PromoShareWidget } from '@/components/dashboard/PromoShareWidget';
import { useForecastStore, Forecast } from '@/store/forecastStore';
import { useProductStore } from '@/store/productStore';
import { ForecastCard } from '@/components/feed/ForecastCard';
import { Plus } from 'lucide-react-native';
import EconomyStepModal, { EconomyStep } from '@/components/EconomyStepModal';
import InstagramConnectModal from '@/components/InstagramConnectModal';

const API_URL = 'https://promorang-api.vercel.app';

// Economy steps for the "Your Path" section
const ECONOMY_STEPS = [
  { id: 'monetize' as EconomyStep, label: 'Monetize', icon: Sparkles, color: '#F97316' },
  { id: 'spot_trends' as EconomyStep, label: 'Scout', icon: TrendingUp, color: '#EC4899' },
  { id: 'build_rank' as EconomyStep, label: 'Rank Up', icon: Trophy, color: '#8B5CF6' },
  { id: 'withdraw' as EconomyStep, label: 'Withdraw', icon: DollarSign, color: '#10B981' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isGuest, isAuthenticated, token } = useAuthStore();
  const { posts, isLoading: isFeedLoading, fetchPosts, likePost, sharePost } = useFeedStore();
  const { tasks: dropsFromStore, isLoading: isTasksLoading, fetchTasks } = useTaskStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>('for-you');
  const theme = useThemeColors();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [unifiedFeed, setUnifiedFeed] = useState<any[]>([]);
  const [isLoadingOther, setIsLoadingOther] = useState(false);
  const { forecasts, fetchForecasts, isLoading: isForecastsLoading } = useForecastStore();
  const { products, fetchProducts, isLoading: isProductsLoading } = useProductStore();

  // Economy modal state
  const [activeEconomyModal, setActiveEconomyModal] = useState<EconomyStep | null>(null);
  const [showInstagramModal, setShowInstagramModal] = useState(false);

  const isLoading = isFeedLoading || isTasksLoading || isLoadingOther || isForecastsLoading || isProductsLoading;

  useEffect(() => {
    fetchAllData();
    analytics.screen('Dashboard');
  }, []);

  // Update unified feed whenever base data changes
  useEffect(() => {
    if (activeTab === 'for-you' && (posts.length > 0 || dropsFromStore.length > 0)) {
      createFallbackMixedFeed();
    }
  }, [posts, dropsFromStore, events, activeTab]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPosts(),
      fetchTasks(),
      fetchEvents(),
      fetchForecasts(),
      fetchProducts(),
      fetchUnifiedFeed(),
    ]);
  };

  const fetchUnifiedFeed = async () => {
    try {
      const response = await fetch(`${API_URL}/api/feed/for-you?limit=20&offset=0`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        const feed = data?.data?.feed || data?.feed || [];
        if (Array.isArray(feed) && feed.length > 0) {
          setUnifiedFeed(feed);
        } else {
          createFallbackMixedFeed();
        }
      } else {
        createFallbackMixedFeed();
      }
    } catch (error) {
      console.error('Failed to fetch unified feed:', error);
      createFallbackMixedFeed();
    }
  };

  const createFallbackMixedFeed = () => {
    // Create a mixed feed from available data
    const mixed: any[] = [];
    const maxItems = Math.max(posts.length, dropsFromStore.length, events.length);

    for (let i = 0; i < maxItems && mixed.length < 20; i++) {
      if (posts[i]) mixed.push({ ...posts[i], type: 'content' });
      if (dropsFromStore[i]) mixed.push({ ...dropsFromStore[i], type: 'drop' });
      if (events[i]) mixed.push({ ...events[i], type: 'event' });
      if (products[i]) mixed.push({ ...products[i], type: 'product' });
    }

    setUnifiedFeed(mixed);
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events?limit=5&upcoming=true`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        const eventsData = (data?.data?.events || data?.events || []).map((e: any) => ({
          ...e,
          date: e.event_date || e.date,
          location: e.location_name || e.location,
          image: e.banner_url || e.flyer_url || e.image,
          organizer: e.organizer_name ? { name: e.organizer_name, avatar: e.organizer_avatar } : e.organizer,
          attendees: e.total_rsvps || e.attendees || 0,
          type: e.category || e.type || 'event',
          isRegistered: e.hasRsvp || e.isRegistered || false,
        }));
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchCoupons = async () => {
    setIsLoadingOther(true);
    try {
      const response = await fetch(`${API_URL}/api/rewards/coupons?limit=10`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setIsLoadingOther(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    if (activeTab === 'rewards') {
      await fetchCoupons();
    }
    setRefreshing(false);
  };

  const handleTabChange = (tab: FeedTab) => {
    setActiveTab(tab);
    analytics.screen(`Dashboard_${tab}`);
    // Fetch coupons when rewards tab is selected
    if (tab === 'rewards' && coupons.length === 0) {
      fetchCoupons();
    }
  };

  const handlePostLike = (postId: string) => {
    if (isGuest) {
      router.push('/(auth)/login');
      return;
    }
    likePost(postId);
  };

  const handlePostComment = (postId: string) => {
    router.push({ pathname: '/post/[id]', params: { id: postId } } as any);
  };

  const handlePostShare = (postId: string) => {
    sharePost(postId);
  };

  const handlePostBack = (postId: string) => {
    if (isGuest) {
      router.push('/(auth)/login');
      return;
    }
    router.push({ pathname: '/post/[id]', params: { id: postId, action: 'back' } } as any);
  };

  const handleUserPress = (userId: string) => {
    router.push({ pathname: '/profile/[id]', params: { id: userId } } as any);
  };

  const handlePostPress = (postId: string) => {
    router.push({ pathname: '/post/[id]', params: { id: postId } } as any);
  };

  const getCurrentFeedData = () => {
    switch (activeTab) {
      case 'for-you':
        // Unified feed with mixed content types (content, drops, events, products)
        if (unifiedFeed.length > 0) {
          return unifiedFeed;
        }
        // Fallback: interleave posts, drops, events
        const mixed: any[] = [];
        const maxLen = Math.max(posts.length, dropsFromStore.length, events.length);
        for (let i = 0; i < maxLen && mixed.length < 20; i++) {
          if (posts[i]) mixed.push({ ...posts[i], type: 'content' });
          if (dropsFromStore[i]) mixed.push({ ...dropsFromStore[i], type: 'drop' });
          if (events[i]) mixed.push({ ...events[i], type: 'event' });
        }
        return mixed;
      case 'social':
        return posts.map(p => ({ ...p, type: 'content' }));
      case 'drops':
        return dropsFromStore.map((d: any) => ({ ...d, type: 'drop' }));
      case 'rewards':
        return coupons.map(c => ({ ...c, type: 'coupon' }));
      case 'events':
        return events.map(e => ({ ...e, type: 'event' }));
      case 'forecasts':
        return forecasts.map(f => ({ ...f, type: 'forecast' }));
      case 'products':
        return products.map(p => ({ ...p, type: 'product' }));
      default:
        return posts;
    }
  };

  const feedData = getCurrentFeedData();

  if (isLoading && !refreshing && posts.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader showLogo showNotifications showAvatar />
        <FeedTabBar activeTab={activeTab} onTabChange={handleTabChange} />
        <ScrollView contentContainerStyle={styles.listContent}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </View>
    );
  }

  const renderUserStatsHeader = () => {
    if (!isAuthenticated || !user) return null;

    return (
      <Card style={styles.statsCard} variant="elevated">
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Coins size={20} color="#3B82F6" />
            <Text style={styles.statValue}>{(user.points_balance || 0).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statItem}>
            <Target size={20} color="#F59E0B" />
            <Text style={styles.statValue}>{user.keys_balance || 0}</Text>
            <Text style={styles.statLabel}>Keys</Text>
          </View>
          <View style={styles.statItem}>
            <Diamond size={20} color="#8B5CF6" />
            <Text style={styles.statValue}>{(user.gems_balance || 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Gems</Text>
          </View>
          <View style={styles.statItem}>
            <Flame size={20} color="#FF6B35" />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderGuestBanner = () => {
    if (!isGuest) return null;

    return (
      <TouchableOpacity
        style={styles.guestBanner}
        onPress={() => router.push('/(auth)/login')}
        activeOpacity={0.9}
      >
        <View style={styles.guestBannerContent}>
          <Text style={styles.guestBannerTitle}>Unlock Full Experience</Text>
          <Text style={styles.guestBannerText}>Sign up to earn, invest, and access exclusive deals</Text>
        </View>
        <ArrowRight size={20} color="#FFFFFF" />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {renderGuestBanner()}
      {!isGuest && (
        <>
          <StreakWidget />
          <QuestsWidget />
        </>
      )}
      {renderUserStatsHeader()}

      {/* Your Path to Rewards - Economy Flow Cards */}
      {!isGuest && activeTab === 'for-you' && (
        <View style={styles.economyFlowContainer}>
          <Text style={[styles.economyFlowTitle, { color: theme.text }]}>Your Path to Rewards</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.economyFlowScroll}
          >
            {ECONOMY_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <TouchableOpacity
                  key={step.id}
                  style={[styles.economyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => setActiveEconomyModal(step.id)}
                >
                  <View style={[styles.economyIconCircle, { backgroundColor: `${step.color}20` }]}>
                    <Icon size={20} color={step.color} />
                  </View>
                  <Text style={[styles.economyCardLabel, { color: theme.text }]}>{step.label}</Text>
                  <Text style={[styles.economyCardStep, { color: theme.textSecondary }]}>Step {index + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Personalized Recommendations - Spotify/Duolingo style */}
      {activeTab === 'for-you' && !isGuest && (
        <PersonalizedSection
          title="Picked For You"
          subtitle="Based on your activity"
        />
      )}

      {activeTab === 'events' && (
        <Card style={styles.eventsDiscoveryCard} variant="elevated">
          <View style={styles.eventsDiscoveryContent}>
            <View style={styles.eventsDiscoveryText}>
              <Text style={[styles.eventsDiscoveryTitle, { color: theme.text }]}>Host an Event</Text>
              <Text style={[styles.eventsDiscoverySub, { color: theme.textSecondary }]}>Create meetups & live drops</Text>
            </View>
            <TouchableOpacity
              style={styles.eventsDiscoveryButton}
              onPress={() => router.push('/events')}
            >
              <Text style={styles.eventsDiscoveryButtonText}>Manage</Text>
              <Plus size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Card>
      )}
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    // Safety check for null/undefined items
    if (!item) return null;

    // Render based on item type (works for unified feed)
    const itemType = item.type || 'content';

    if (itemType === 'drop') {
      return (
        <TaskCard
          task={item}
          onPress={(id) => router.push({ pathname: '/drop/[id]', params: { id } } as any)}
        />
      );
    }

    if (itemType === 'event') {
      return (
        <EventCard
          event={item}
          onPress={(id) => router.push({ pathname: '/events/[id]', params: { id } } as any)}
        />
      );
    }

    if (itemType === 'coupon') {
      return (
        <CouponCard
          coupon={item}
          onPress={(id) => router.push({ pathname: '/rewards/[id]', params: { id } } as any)}
        />
      );
    }

    if (itemType === 'product') {
      return (
        <ProductCard
          product={item}
          onPress={(id) => router.push({ pathname: '/product/[id]', params: { id } } as any)}
        />
      );
    }

    if (itemType === 'forecast') {
      return (
        <ForecastCard
          forecast={item as Forecast}
          onPress={(id) => router.push({ pathname: '/forecast/[id]', params: { id } } as any)}
        />
      );
    }

    // Default: content/post
    return (
      <PostCard
        post={item as any}
        onLike={handlePostLike}
        onComment={handlePostComment}
        onShare={handlePostShare}
        onBack={handlePostBack}
        onUserPress={handleUserPress}
        onPostPress={handlePostPress}
      />
    );
  };

  const getEmptyStateForTab = () => {
    switch (activeTab) {
      case 'drops':
        return {
          title: 'No Drops Available',
          description: 'Check back later for new earning opportunities.',
        };
      case 'products':
        return {
          title: 'No Products Yet',
          description: 'Check back later for new items in the shop.',
        };
      case 'rewards':
        return {
          title: 'No Rewards Yet',
          description: 'Complete drops and engage with content to unlock rewards.',
        };
      default:
        return {
          title: 'No Content Yet',
          description: 'Follow more creators or check back later for new content.',
        };
    }
  };

  const emptyState = getEmptyStateForTab();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader showLogo showNotifications showAvatar />
      <FeedTabBar activeTab={activeTab} onTabChange={handleTabChange} />

      <FlashList
        data={feedData}
        keyExtractor={(item: any, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem as any}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={[styles.listContent, { backgroundColor: theme.background }] as any}
        estimatedItemSize={300}
        {...({} as any)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={emptyState.title}
            description={emptyState.description}
            icon={<FileText size={48} color={theme.textSecondary} />}
            style={styles.emptyState}
          />
        }
      />

      {/* Economy Step Modal */}
      {activeEconomyModal && (
        <EconomyStepModal
          step={activeEconomyModal}
          visible={true}
          onClose={() => setActiveEconomyModal(null)}
          onOpenInstagramModal={() => {
            setActiveEconomyModal(null);
            setShowInstagramModal(true);
          }}
        />
      )}

      {/* Instagram Connect Modal */}
      <InstagramConnectModal
        visible={showInstagramModal}
        onClose={() => setShowInstagramModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 2,
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  guestBannerContent: {
    flex: 1,
  },
  guestBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  guestBannerText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  dropCard: {
    marginBottom: 12,
  },
  dropTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  dropDescription: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
    lineHeight: 20,
  },
  dropReward: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropRewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 6,
  },
  dropButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dropButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  couponCard: {
    marginBottom: 12,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  couponDescription: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
  },
  couponButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  couponButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemTypeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTypeLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  eventCard: {
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
    lineHeight: 20,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  eventButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  eventButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productCard: {
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  emptyState: {
    marginTop: 80,
  },
  leaderboardWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  leaderboardWidgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leaderboardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardWidgetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  leaderboardWidgetSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  eventsDiscoveryCard: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#3B82F610',
    borderColor: '#3B82F630',
    borderWidth: 1,
  },
  eventsDiscoveryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventsDiscoveryText: {
    flex: 1,
  },
  eventsDiscoveryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  eventsDiscoverySub: {
    fontSize: 12,
    marginTop: 2,
  },
  eventsDiscoveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  eventsDiscoveryButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  // Social Shield Widget Styles
  socialShieldWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#10B98110',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  socialShieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  socialShieldIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#10B98120',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialShieldTextContainer: {
    flex: 1,
  },
  socialShieldTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialShieldTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  socialShieldBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  socialShieldBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
  },
  socialShieldSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // Economy Flow Cards
  economyFlowContainer: {
    marginBottom: 16,
  },
  economyFlowTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  economyFlowScroll: {
    gap: 10,
  },
  economyCard: {
    width: 90,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  economyIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  economyCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  economyCardStep: {
    fontSize: 10,
  },
});