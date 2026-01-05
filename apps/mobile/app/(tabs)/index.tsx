import React, { useEffect, useState } from 'react';
import { View, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFeedStore } from '@/store/feedStore';
import { PostCard } from '@/components/feed/PostCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { FileText, Share2, Target, Award, TrendingUp } from 'lucide-react-native';
import colors from '@/constants/colors';
import { FlashList } from '@shopify/flash-list';
import { analytics } from '@/lib/analytics';

export default function DashboardScreen() {
  const router = useRouter();
  const { posts, isLoading, fetchPosts, likePost, sharePost } = useFeedStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
    analytics.screen('Dashboard');
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handlePostLike = (postId: string) => {
    likePost(postId);
  };

  const handlePostComment = (postId: string) => {
    router.push({ pathname: '/post/[id]', params: { id: postId } } as any);
  };

  const handlePostShare = (postId: string) => {
    sharePost(postId);
  };

  const handlePostBack = (postId: string) => {
    router.push({ pathname: '/post/[id]', params: { id: postId, action: 'back' } } as any);
  };

  const handleUserPress = (userId: string) => {
    router.push({ pathname: '/profile/[id]', params: { id: userId } } as any);
  };

  const handlePostPress = (postId: string) => {
    router.push({ pathname: '/post/[id]', params: { id: postId } } as any);
  };

  if (isLoading && !refreshing && posts.length === 0) {
    return <LoadingIndicator fullScreen text="Loading your feed..." />;
  }

  const renderHeader = () => (
    <Card style={styles.quickActionsCard}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => router.push({ pathname: '/(tabs)/bets', params: { tab: 'content' } } as any)}>
          <Share2 size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>Content Shares</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => router.push({ pathname: '/(tabs)/bets', params: { tab: 'growth' } } as any)}>
          <Target size={24} color={colors.success} />
          <Text style={styles.quickActionText}>Growth Hub</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/bets' as any)}>
          <Award size={24} color={colors.warning} />
          <Text style={styles.quickActionText}>Social Bets</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/marketplace' as any)}>
          <TrendingUp size={24} color={colors.info} />
          <Text style={styles.quickActionText}>Marketplace</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={handlePostLike}
            onComment={handlePostComment}
            onShare={handlePostShare}
            onBack={handlePostBack}
            onUserPress={handleUserPress}
            onPostPress={handlePostPress}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        estimatedItemSize={400} // Estimated height of a post card
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
            title="No Posts Yet"
            description="Follow more creators or check back later for new content."
            icon={<FileText size={48} color={colors.darkGray} />}
            style={styles.emptyState}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    marginTop: 100,
  },
  quickActionsCard: {
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
});