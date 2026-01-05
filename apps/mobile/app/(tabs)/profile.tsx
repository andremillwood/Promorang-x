import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { TabBar } from '@/components/ui/TabBar';
import { PostCard } from '@/components/feed/PostCard';
import { TaskCard } from '@/components/tasks/TaskCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { useFeedStore } from '@/store/feedStore';
import { useTaskStore } from '@/store/taskStore';
import { FileText, Briefcase } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { posts, likePost, sharePost, fetchPosts } = useFeedStore();
  const { myTasks, fetchMyTasks, isLoading: tasksLoading } = useTaskStore();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      
      // Fetch posts if not already loaded
      if (posts.length === 0) {
        await fetchPosts();
      }
      
      setIsLoading(false);
    };
    
    // Only load data if user is available (already initialized in root layout)
    if (user && !authLoading) {
      loadInitialData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading, posts.length, fetchPosts]);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchMyTasks();
    }
  }, [activeTab, fetchMyTasks]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'tasks') {
      await fetchMyTasks();
    } else {
      await fetchPosts();
    }
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
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

  const handleTaskPress = (taskId: string) => {
    router.push({ pathname: '/task/[id]', params: { id: taskId } } as any);
  };

  const tabs = [
    { key: 'posts', label: 'Posts' },
    { key: 'tasks', label: 'My Tasks' },
  ];

  if (isLoading || authLoading) {
    return <LoadingIndicator fullScreen text="Loading profile..." />;
  }

  // Filter posts to show only user's posts
  const userPosts = posts.filter(post => post.creator.id === user?.id);

  const renderContent = () => {
    if (activeTab === 'tasks' && tasksLoading && !refreshing) {
      return <LoadingIndicator fullScreen text="Loading your tasks..." />;
    }

    if (activeTab === 'posts') {
      return (
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
              description="Create your first post to share with your followers."
              icon={<FileText size={48} color={colors.darkGray} />}
              style={styles.emptyState}
            />
          }
        />
      );
    } else {
      return (
        <FlatList
          data={myTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={() => handleTaskPress(item.id)} />
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
              title="No Tasks Yet"
              description="Browse the marketplace to find tasks to complete."
              icon={<Briefcase size={48} color={colors.darkGray} />}
              actionLabel="Find Tasks"
              onAction={() => router.push('/(tabs)/marketplace' as any)}
              style={styles.emptyState}
            />
          }
        />
      );
    }
  };

  if (!user) {
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
              isCurrentUser={true}
              onEditProfile={handleEditProfile}
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
        ListFooterComponent={renderContent()}
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