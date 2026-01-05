import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { TabBar } from '@/components/ui/TabBar';
import { PostCard } from '@/components/feed/PostCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useFeedStore } from '@/store/feedStore';
import { FileText } from 'lucide-react-native';
import colors from '@/constants/colors';
import { users } from '@/mocks/users';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { posts, likePost, sharePost, fetchPosts } = useFeedStore();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Find the user by ID
  const user = users.find(u => u.id === id) || users[0];
  const isCurrentUser = currentUser?.id === user.id;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (posts.length === 0) {
        await fetchPosts();
      }
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Filter posts to show only this user's posts
  const userPosts = posts.filter(post => post.creator.id === user.id);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
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
    { key: 'posts', label: 'Posts' },
  ];

  if (isLoading) {
    return <LoadingIndicator fullScreen text="Loading profile..." />;
  }

  return (
    <View style={styles.container}>
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
            />
            <TabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              variant="underlined"
              containerStyle={styles.tabBar}
            />
          </>
        }
        ListFooterComponent={
          <FlatList
            data={userPosts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onLike={handlePostLike}
                onComment={handlePostComment}
                onShare={handlePostShare}
                onBack={handlePostBack}
                onUserPress={handleUserPress}
              />
            )}
            contentContainerStyle={styles.listContent}
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
                description={`${isCurrentUser ? 'You haven\'t' : 'This user hasn\'t'} posted anything yet.`}
                icon={<FileText size={48} color={colors.darkGray} />}
                style={styles.emptyState}
              />
            }
          />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  listContainer: {
    flexGrow: 1,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    marginTop: 100,
  },
});