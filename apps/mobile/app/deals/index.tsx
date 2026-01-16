/**
 * Deals Entry Screen (Mobile)
 * 
 * Primary entry surface for new users on mobile.
 * Shows available deals in a simple, action-first interface.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useMaturityStore } from '@/store/maturityStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';

interface Deal {
  id: string;
  title: string;
  brand: string;
  description: string;
  reward_amount: number;
  reward_type: 'gems' | 'points' | 'coupon';
  participants_count: number;
  max_participants?: number;
  expires_at?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://api.promorang.co';

// Mock deals for demo
const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    title: 'Share Your Favorite Coffee Spot',
    brand: 'Local Cafes',
    description: 'Post a photo of your favorite local coffee shop',
    reward_amount: 50,
    reward_type: 'gems',
    participants_count: 234,
    max_participants: 500,
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty: 'easy',
    tags: ['photo', 'local']
  },
  {
    id: '2',
    title: 'Review a New Restaurant',
    brand: 'FoodieHub',
    description: 'Try a new restaurant and share your honest review',
    reward_amount: 100,
    reward_type: 'gems',
    participants_count: 89,
    max_participants: 200,
    difficulty: 'medium',
    tags: ['review', 'food']
  },
  {
    id: '3',
    title: 'Unbox & React',
    brand: 'TechGear',
    description: 'Create an unboxing video for our latest product',
    reward_amount: 250,
    reward_type: 'gems',
    participants_count: 45,
    max_participants: 100,
    difficulty: 'hard',
    tags: ['video', 'tech']
  },
  {
    id: '4',
    title: 'Style Challenge',
    brand: 'FashionForward',
    description: 'Show us your unique style with our new collection',
    reward_amount: 75,
    reward_type: 'gems',
    participants_count: 156,
    max_participants: 300,
    difficulty: 'easy',
    tags: ['fashion', 'photo']
  }
];

function DealCard({ deal, onPress }: { deal: Deal; onPress: () => void }) {
  const theme = useThemeColors();
  
  const daysLeft = deal.expires_at 
    ? Math.ceil((new Date(deal.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const difficultyColors = {
    easy: { bg: '#dcfce7', text: '#166534' },
    medium: { bg: '#fef3c7', text: '#92400e' },
    hard: { bg: '#fee2e2', text: '#991b1b' }
  };

  const diffColor = difficultyColors[deal.difficulty];

  return (
    <TouchableOpacity 
      style={[styles.dealCard, { backgroundColor: theme.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.dealHeader}>
        <View style={styles.brandInfo}>
          <View style={styles.brandAvatar}>
            <Text style={styles.brandInitial}>{deal.brand.charAt(0)}</Text>
          </View>
          <View>
            <Text style={[styles.brandName, { color: theme.textSecondary }]}>{deal.brand}</Text>
            <Text style={[styles.dealTitle, { color: theme.text }]} numberOfLines={2}>{deal.title}</Text>
          </View>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: diffColor.bg }]}>
          <Text style={[styles.difficultyText, { color: diffColor.text }]}>{deal.difficulty}</Text>
        </View>
      </View>

      <Text style={[styles.dealDescription, { color: theme.textSecondary }]} numberOfLines={2}>
        {deal.description}
      </Text>

      <View style={styles.tagsRow}>
        {deal.tags.slice(0, 3).map(tag => (
          <View key={tag} style={[styles.tag, { backgroundColor: theme.background }]}>
            <Text style={[styles.tagText, { color: theme.textSecondary }]}>#{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsRow}>
        {daysLeft !== null && (
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{daysLeft}d left</Text>
          </View>
        )}
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.statText, { color: theme.textSecondary }]}>{deal.participants_count} joined</Text>
        </View>
      </View>

      <View style={styles.dealFooter}>
        <View style={styles.rewardInfo}>
          <Ionicons name="gift" size={18} color={colors.primary} />
          <Text style={styles.rewardAmount}>{deal.reward_amount}</Text>
          <Text style={[styles.rewardType, { color: theme.textSecondary }]}>Gems</Text>
        </View>
        <LinearGradient
          colors={[colors.primary, '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.claimButton}
        >
          <Text style={styles.claimButtonText}>Claim</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

export default function DealsScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { isAuthenticated } = useAuthStore();
  const { recordAction, visibility } = useMaturityStore();
  
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const fetchDeals = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/drops?status=active&limit=20`);
      if (response.ok) {
        const result = await response.json();
        if (result.data?.length > 0) {
          const apiDeals = result.data.map((drop: any) => ({
            id: drop.id,
            title: drop.title || drop.name,
            brand: drop.brand_name || drop.advertiser_name || 'Promorang',
            description: drop.description || '',
            reward_amount: drop.gem_reward || drop.reward_amount || 50,
            reward_type: 'gems' as const,
            participants_count: drop.applications_count || 0,
            max_participants: drop.max_participants,
            expires_at: drop.end_date || drop.expires_at,
            difficulty: drop.difficulty || 'easy',
            tags: drop.tags || ['deal']
          }));
          setDeals([...apiDeals, ...MOCK_DEALS.slice(0, 2)]);
        }
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchDeals().finally(() => setIsLoading(false));
  }, [fetchDeals]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDeals();
    setRefreshing(false);
  }, [fetchDeals]);

  const handleDealPress = async (dealId: string) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    // Record the action
    const token = await useAuthStore.getState().getToken?.();
    await recordAction('deal_claimed', { deal_id: dealId }, token || undefined);
    
    router.push(`/drop/${dealId}` as any);
  };

  const filteredDeals = filter === 'all' 
    ? deals 
    : deals.filter(d => d.difficulty === filter);

  const renderHeader = () => (
    <View>
      {/* Hero */}
      <LinearGradient
        colors={[colors.primary, '#8b5cf6', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroLabel}>
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.heroLabelText}>Earn rewards for what you already do</Text>
          </View>
          <Text style={styles.heroTitle}>Today's {visibility.labels.deals}</Text>
          <Text style={styles.heroSubtitle}>
            Complete simple tasks, share content, and earn real rewards.
          </Text>
        </View>
      </LinearGradient>

      {/* Badges Row */}
      <View style={[styles.badgesRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={16} color="#22c55e" />
          <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{visibility.labels.verified}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="trophy" size={16} color="#f59e0b" />
          <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{visibility.labels.weeklyWins}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterTab,
              filter === f && styles.filterTabActive,
              { backgroundColor: filter === f ? theme.text : theme.surface }
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterTabText,
              { color: filter === f ? theme.surface : theme.textSecondary }
            ]}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredDeals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DealCard deal={item} onPress={() => handleDealPress(item.id)} />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No deals found for this filter.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingBottom: 100
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20
  },
  heroContent: {
    gap: 8
  },
  heroLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  heroLabelText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500'
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700'
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500'
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  filterTabActive: {},
  filterTabText: {
    fontSize: 13,
    fontWeight: '600'
  },
  dealCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  brandAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  brandName: {
    fontSize: 12,
    marginBottom: 2
  },
  dealTitle: {
    fontSize: 15,
    fontWeight: '600',
    maxWidth: 200
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  dealDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  tagText: {
    fontSize: 11
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statText: {
    fontSize: 12
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)'
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary
  },
  rewardType: {
    fontSize: 14
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 14
  }
});
