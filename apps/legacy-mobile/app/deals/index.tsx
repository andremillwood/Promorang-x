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
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useMaturityStore } from '@/store/maturityStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import TodayLayout from '@/components/TodayLayout';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppHeader } from '@/components/ui/AppHeader';
import { Stack } from 'expo-router';
import { Gift, Sparkles, TrendingUp, Clock, Users, ShieldCheck, Trophy } from 'lucide-react-native';
import { BalancesBar } from '@/components/ui/BalancesBar';

interface Deal {
  id: string;
  title: string;
  brand: string;
  description: string;
  reward_amount: number;
  reward_type: 'gems' | 'points' | 'coupon' | 'percentage';
  reward_unit?: string;
  participants_count: number;
  max_participants?: number;
  expires_at?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

const { width } = Dimensions.get('window');

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

  const diffColor = difficultyColors[deal.difficulty] || difficultyColors.easy;

  const renderReward = () => {
    const isPercentage = deal.reward_type === 'percentage' || deal.reward_type === 'coupon';
    const unit = isPercentage ? '%' : (deal.reward_unit || 'Gems');

    return (
      <View style={styles.rewardInfo}>
        <Ionicons name={isPercentage ? "pricetag" : "gift"} size={18} color={colors.primary} />
        <Text style={styles.rewardAmount}>{deal.reward_amount}{isPercentage ? '%' : ''}</Text>
        <Text style={[styles.rewardType, { color: theme.textSecondary }]}>
          {isPercentage ? 'Off' : unit}
        </Text>
      </View>
    );
  };

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
        {renderReward()}
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

import { useCampaignStore } from '@/store/campaignStore';

export default function DealsScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { isAuthenticated, user } = useAuthStore();
  const { recordAction, visibility } = useMaturityStore();

  const { campaigns, isLoading, fetchCampaigns, joinCampaign } = useCampaignStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCampaigns();
    setRefreshing(false);
  }, [fetchCampaigns]);

  const handleDealPress = async (dealId: string) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    try {
      // Record the action
      const token = useAuthStore.getState().token;
      await recordAction('deal_claimed', { deal_id: dealId }, token || undefined);

      router.push(`/drop/${dealId}` as any);
    } catch (error) {
      console.error('Handle deal press error:', error);
    }
  };

  // Convert campaigns to Deal interface format for the UI if necessary
  // The DealCard expects specific fields
  const deals: Deal[] = campaigns.map(c => ({
    id: c.id,
    title: c.title,
    brand: typeof c.merchant === 'string' ? c.merchant : (c.merchant?.name || 'Promorang'),
    description: c.description || '',
    reward_amount: c.reward || 50,
    reward_type: (c.rewardType === 'percentage' || c.title.includes('%')) ? 'percentage' : (c.rewardType === 'coupon' ? 'coupon' : 'gems'),
    reward_unit: c.rewardType === 'percentage' ? '%' : (c.rewardType === 'coupon' ? 'Off' : 'Gems'),
    participants_count: c.shares || 0,
    difficulty: (c as any).difficulty || 'easy',
    tags: (c as any).tags || ['deal'],
    expires_at: c.expiresAt
  }));

  const filteredDeals = filter === 'all'
    ? deals
    : deals.filter(d => d.difficulty === filter);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#10B981', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroTitle}>Deals Hub</Text>
            <Text style={styles.heroSubtitle}>Rewards for your daily activity</Text>
          </View>
          <Gift size={40} color="rgba(255,255,255,0.2)" />
        </View>
        <Sparkles size={100} color="rgba(255,255,255,0.05)" style={styles.heroIcon} />
      </LinearGradient>

      <View style={styles.contentPadding}>
        <BalancesBar user={user} />

        <View style={styles.tabContainer}>
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
    </View>
  );

  return (
    <TodayLayout>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader transparent hideLeft showBack showNotifications showAvatar />
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
              <EmptyState
                title="No Deals Available"
                description="There are no active deals matching your filter right now. Why not check today's opportunities?"
                icon={<Ionicons name="gift-outline" size={48} color={theme.textSecondary} />}
                actionLabel="Scout Trends"
                onAction={() => router.push('/today')}
                style={{ marginTop: 60 }}
              />
            }
          />
        )}
      </View>
    </TodayLayout>
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
    paddingHorizontal: 16,
    marginTop: -20,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
