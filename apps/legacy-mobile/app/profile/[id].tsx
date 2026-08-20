import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { TabBar } from '@/components/ui/TabBar';
import { PostCard } from '@/components/feed/PostCard';
import { ForecastCard } from '@/components/feed/ForecastCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import TipCreatorModal from '@/components/TipCreatorModal';
import { useAuthStore } from '@/store/authStore';
import { useFeedStore } from '@/store/feedStore';
import { useForecastStore } from '@/store/forecastStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { FileText, Trophy, TrendingUp, Sparkles, Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import { users } from '@/mocks/users';

const MOCK_SUPPORTERS = [
  { id: 'supporter_1', name: 'Jordan Hayes', username: 'jordan_h', amount: 180, rank: 1, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  { id: 'supporter_2', name: 'Elena Chen', username: 'elena_c', amount: 120, rank: 2, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'supporter_3', name: 'Devon Miles', username: 'devon_m', amount: 75, rank: 3, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'supporter_4', name: 'Maya Lin', username: 'mayalin', amount: 50, rank: 4, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
];

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useThemeColors();
  const { user: currentUser } = useAuthStore();
  const { posts, likePost, sharePost, fetchPosts } = useFeedStore();
  const { forecasts, fetchForecasts } = useForecastStore();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTipModal, setShowTipModal] = useState(false);

  // Find the user by ID
  const user = users.find(u => u.id === id) || users[0];
  const isCurrentUser = currentUser?.id === user.id;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        posts.length === 0 ? fetchPosts() : Promise.resolve(),
        forecasts.length === 0 ? fetchForecasts() : Promise.resolve(),
      ]);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Filter posts & forecasts for this creator
  const userPosts = posts.filter(post => post.creator?.id === user.id);
  const userForecasts = forecasts.filter(f => f.creator?.id === user.id);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchForecasts()]);
    setRefreshing(false);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handlePostLike = (postId: string) => {
    likePost(postId);
  };

  const handlePostComment = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handlePostShare = (postId: string) => {
    sharePost(postId);
  };

  const handlePostBack = (postId: string) => {
    router.push(`/post/${postId}?action=back`);
  };

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const tabs = [
    { key: 'posts', label: `Posts (${userPosts.length})` },
    { key: 'polls', label: `Polls (${userForecasts.length})` },
    { key: 'supporters', label: 'Top Fans' },
  ];

  if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading profile..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={[]}
        keyExtractor={() => 'header'}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <ProfileHeader
              user={user}
              isCurrentUser={isCurrentUser}
              onFollow={handleFollow}
              isFollowing={isFollowing}
              onTipPress={() => setShowTipModal(true)}
            />
            <TabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="underlined"
              containerStyle={[styles.tabBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
            />
          </>
        }
        ListFooterComponent={
          <View style={styles.tabContentContainer}>
            {activeTab === 'posts' && (
              <FlatList
                data={userPosts}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <PostCard
                    post={item}
                    onLike={handlePostLike}
                    onComment={handlePostComment}
                    onShare={handlePostShare}
                    onBack={handlePostBack}
                    onUserPress={handleUserPress}
                    onTip={() => setShowTipModal(true)}
                  />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <EmptyState
                    title="No Posts Yet"
                    description={`${isCurrentUser ? "You haven't" : "This user hasn't"} posted anything yet.`}
                    icon={<FileText size={48} color={colors.darkGray} />}
                    style={styles.emptyState}
                  />
                }
              />
            )}

            {activeTab === 'polls' && (
              <FlatList
                data={userForecasts}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <ForecastCard
                    forecast={item}
                    onPress={(forecastId) => router.push(`/forecast/${forecastId}` as any)}
                  />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <EmptyState
                    title="No Creator Polls"
                    description="This creator has not launched any active community forecasts or polls yet."
                    icon={<TrendingUp size={48} color={colors.darkGray} />}
                    style={styles.emptyState}
                  />
                }
              />
            )}

            {activeTab === 'supporters' && (
              <View style={styles.supportersContainer}>
                <View style={[styles.supporterHeroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Trophy size={28} color="#F59E0B" />
                  <Text style={[styles.supporterHeroTitle, { color: theme.text }]}>Top Backers & Supporters</Text>
                  <Text style={[styles.supporterHeroSub, { color: theme.textSecondary }]}>
                    Fans who have backed and tipped @{user.username} the most.
                  </Text>
                  {!isCurrentUser && (
                    <TouchableOpacity
                      style={styles.tipHeroButton}
                      onPress={() => setShowTipModal(true)}
                    >
                      <Heart size={16} color="#FFF" fill="#FFF" />
                      <Text style={styles.tipHeroButtonText}>Tip & Join Leaderboard</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {MOCK_SUPPORTERS.map((fan) => (
                  <View
                    key={fan.id}
                    style={[styles.fanRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                  >
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{fan.rank}</Text>
                    </View>
                    <Avatar source={fan.avatar} size="md" name={fan.name} />
                    <View style={styles.fanInfo}>
                      <Text style={[styles.fanName, { color: theme.text }]}>{fan.name}</Text>
                      <Text style={[styles.fanUsername, { color: theme.textSecondary }]}>@{fan.username}</Text>
                    </View>
                    <View style={styles.tipAmountBadge}>
                      <Sparkles size={12} color={colors.primary} />
                      <Text style={styles.tipAmountText}>${fan.amount} tipped</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <TipCreatorModal
        visible={showTipModal}
        onClose={() => setShowTipModal(false)}
        creatorId={user.id}
        creatorUsername={user.username}
        creatorDisplayName={user.name}
        creatorImage={user.avatar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flexGrow: 1,
  },
  tabBar: {
    borderBottomWidth: 1,
  },
  tabContentContainer: {
    paddingBottom: 32,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    marginTop: 60,
  },
  supportersContainer: {
    padding: 16,
    gap: 12,
  },
  supporterHeroCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  supporterHeroTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
  },
  supporterHeroSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  tipHeroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F97316',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  tipHeroButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
  },
  fanInfo: {
    flex: 1,
  },
  fanName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fanUsername: {
    fontSize: 11,
    marginTop: 1,
  },
  tipAmountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipAmountText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});