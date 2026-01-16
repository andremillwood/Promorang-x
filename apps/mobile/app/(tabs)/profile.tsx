import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { TabBar } from '@/components/ui/TabBar';
import { PostCard } from '@/components/feed/PostCard';
import { TaskCard } from '@/components/tasks/TaskCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { useFeedStore } from '@/store/feedStore';
import { useTaskStore } from '@/store/taskStore';
import {
  FileText, Briefcase, User, Zap, MapPin, Award,
  TrendingUp, Target, CheckCircle2, Clock, Star, Wallet, ChevronRight, Store as StoreIcon, ArrowRight, Ticket, Shield
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

const API_URL = 'https://promorang-api.vercel.app';

type TabType = 'overview' | 'content' | 'drops' | 'applications' | 'achievements';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user, isLoading: authLoading, token } = useAuthStore();
  const { posts, likePost, sharePost, fetchPosts } = useFeedStore();
  const { myTasks, fetchMyTasks, isLoading: tasksLoading } = useTaskStore();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userDrops, setUserDrops] = useState<any[]>([]);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  const [store, setStore] = useState<any>(null);
  const [dropsLoading, setDropsLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const fetchUserDrops = useCallback(async () => {
    if (!user?.id || !token) return;
    setDropsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}/drops`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserDrops(Array.isArray(data) ? data : data.drops || []);
      }
    } catch (error) {
      console.error('Failed to fetch user drops:', error);
    } finally {
      setDropsLoading(false);
    }
  }, [user?.id, token]);

  const fetchUserApplications = useCallback(async () => {
    if (!token) return;
    setApplicationsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/drop-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserApplications(Array.isArray(data) ? data : data.applications || []);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  }, [token]);

  const fetchLeaderboardPosition = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}/leaderboard-position`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaderboardPosition(data.daily_rank || null);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard position:', error);
    }
  }, [user?.id, token]);

  const fetchUserStore = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_URL}/api/marketplace/my-store`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setStore(data.data?.store || null);
      }
    } catch (error) {
      console.error('Failed to fetch store info:', error);
    }
  }, [user?.id, token]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      if (posts.length === 0) {
        await fetchPosts();
      }
      if (user.role === 'merchant' || user.role === 'advertiser') {
        await fetchUserStore();
      }
      setIsLoading(false);
    };

    if (user && !authLoading) {
      loadInitialData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading, posts.length, fetchPosts, fetchLeaderboardPosition]);

  useEffect(() => {
    if (activeTab === 'drops') {
      fetchUserDrops();
    } else if (activeTab === 'applications') {
      fetchUserApplications();
    }
  }, [activeTab, fetchUserDrops, fetchUserApplications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPosts(),
      fetchLeaderboardPosition(),
      activeTab === 'drops' ? fetchUserDrops() : Promise.resolve(),
      activeTab === 'applications' ? fetchUserApplications() : Promise.resolve(),
    ]);
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit' as any);
  };

  const handlePostLike = (postId: string) => likePost(postId);
  const handlePostComment = (postId: string) => router.push({ pathname: '/post/[id]', params: { id: postId } } as any);
  const handlePostShare = (postId: string) => sharePost(postId);
  const handlePostBack = (postId: string) => router.push({ pathname: '/post/[id]', params: { id: postId, action: 'back' } } as any);
  const handleUserPress = (userId: string) => router.push({ pathname: '/profile/[id]', params: { id: userId } } as any);
  const handleTaskPress = (taskId: string) => router.push({ pathname: '/task/[id]', params: { id: taskId } } as any);

  const tabs: { key: TabType | 'store'; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'content', label: 'Content' },
    { key: 'drops', label: 'Drops' },
    { key: 'applications', label: 'Applications' },
    { key: 'achievements', label: 'Achievements' },
  ];

  if (store) {
    tabs.splice(2, 0, { key: 'store', label: 'Store' });
  }

  if (isLoading || authLoading) {
    return <LoadingIndicator fullScreen text="Loading profile..." />;
  }

  if (!user) {
    return <LoadingIndicator fullScreen text="Loading profile..." />;
  }

  const userPosts = posts.filter(post => post.creator.id === user?.id);

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Quick Access Cards */}
      <View style={styles.quickAccessRow}>
        <TouchableOpacity
          style={[styles.quickAccessCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/(tabs)/wallet' as any)}
        >
          <View style={[styles.quickAccessIcon, { backgroundColor: '#8B5CF610' }]}>
            <Wallet size={22} color={colors.primary} />
          </View>
          <Text style={[styles.quickAccessTitle, { color: theme.text }]}>Wallet</Text>
          <Text style={[styles.quickAccessSubtitle, { color: theme.textSecondary }]}>Balance & earnings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickAccessCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/tickets' as any)}
        >
          <View style={[styles.quickAccessIcon, { backgroundColor: '#EC489910' }]}>
            <Ticket size={22} color="#EC4899" />
          </View>
          <Text style={[styles.quickAccessTitle, { color: theme.text }]}>My Tickets</Text>
          <Text style={[styles.quickAccessSubtitle, { color: theme.textSecondary }]}>Event passes</Text>
        </TouchableOpacity>
      </View>

      {/* Social Shield Quick Access - Prominent placement */}
      <TouchableOpacity
        style={[styles.walletCard, { backgroundColor: '#10B98110', borderColor: '#10B98130' }]}
        onPress={() => router.push('/growth/hub' as any)}
      >
        <View style={[styles.walletIconContainer, { backgroundColor: '#10B98120' }]}>
          <Shield size={24} color="#10B981" />
        </View>
        <View style={styles.walletTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.walletTitle, { color: '#10B981' }]}>Social Shield</Text>
            <View style={{ backgroundColor: '#10B98120', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#10B981' }}>ACTIVE</Text>
            </View>
          </View>
          <Text style={[styles.walletSubtitle, { color: theme.textSecondary }]}>Earnings protection from algorithm changes</Text>
        </View>
        <ChevronRight size={20} color="#10B981" />
      </TouchableOpacity>

      {/* PromoShare Quick Access */}
      <TouchableOpacity
        style={[styles.walletCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => router.push('/promoshare' as any)}
      >
        <View style={[styles.walletIconContainer, { backgroundColor: '#6366F110' }]}>
          <Ticket size={24} color="#6366F1" />
        </View>
        <View style={styles.walletTextContainer}>
          <Text style={[styles.walletTitle, { color: theme.text }]}>PromoShare</Text>
          <Text style={[styles.walletSubtitle, { color: theme.textSecondary }]}>Weekly draws & prizes</Text>
        </View>
        <ChevronRight size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Content Shares Market Quick Access */}
      <TouchableOpacity
        style={[styles.walletCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => router.push('/market' as any)}
      >
        <View style={[styles.walletIconContainer, { backgroundColor: '#3B82F610' }]}>
          <TrendingUp size={24} color="#3B82F6" />
        </View>
        <View style={styles.walletTextContainer}>
          <Text style={[styles.walletTitle, { color: theme.text }]}>Content Market</Text>
          <Text style={[styles.walletSubtitle, { color: theme.textSecondary }]}>Trade content shares</Text>
        </View>
        <ChevronRight size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Coupons Quick Access */}
      <TouchableOpacity
        style={[styles.walletCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => router.push('/coupons' as any)}
      >
        <View style={[styles.walletIconContainer, { backgroundColor: '#10B98110' }]}>
          <Award size={24} color="#10B981" />
        </View>
        <View style={styles.walletTextContainer}>
          <Text style={[styles.walletTitle, { color: theme.text }]}>My Coupons</Text>
          <Text style={[styles.walletSubtitle, { color: theme.textSecondary }]}>Rewards & discounts earned</Text>
        </View>
        <ChevronRight size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Referrals Quick Access */}
      <TouchableOpacity
        style={[styles.walletCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => router.push('/referrals' as any)}
      >
        <View style={[styles.walletIconContainer, { backgroundColor: '#8B5CF610' }]}>
          <User size={24} color="#8B5CF6" />
        </View>
        <View style={styles.walletTextContainer}>
          <Text style={[styles.walletTitle, { color: theme.text }]}>Referrals</Text>
          <Text style={[styles.walletSubtitle, { color: theme.textSecondary }]}>Invite friends & earn rewards</Text>
        </View>
        <ChevronRight size={20} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Stats</Text>
        <View style={styles.quickStatsGrid}>
          <Card style={[styles.quickStatCard, { backgroundColor: theme.card }]}>
            <Target size={24} color="#10B981" />
            <Text style={[styles.quickStatValue, { color: theme.text }]}>{myTasks.length}</Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Tasks Done</Text>
          </Card>
          <Card style={[styles.quickStatCard, { backgroundColor: theme.card }]}>
            <FileText size={24} color="#3B82F6" />
            <Text style={[styles.quickStatValue, { color: theme.text }]}>{userPosts.length}</Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Posts</Text>
          </Card>
          <Card style={[styles.quickStatCard, { backgroundColor: theme.card }]}>
            <Zap size={24} color="#8B5CF6" />
            <Text style={[styles.quickStatValue, { color: theme.text }]}>{userDrops.length}</Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Drops</Text>
          </Card>
          <Card style={[styles.quickStatCard, { backgroundColor: theme.card }]}>
            <MapPin size={24} color="#F59E0B" />
            <Text style={[styles.quickStatValue, { color: theme.text }]}>{userApplications.length}</Text>
            <Text style={[styles.quickStatLabel, { color: theme.textSecondary }]}>Applications</Text>
          </Card>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
        {userPosts.length > 0 ? (
          userPosts.slice(0, 2).map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handlePostLike}
              onComment={handlePostComment}
              onShare={handlePostShare}
              onBack={handlePostBack}
              onUserPress={handleUserPress}
            />
          ))
        ) : (
          <Card style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No recent activity. Start creating content!
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );

  const renderContentTab = () => (
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
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
      ListEmptyComponent={
        <EmptyState
          title="No Content Yet"
          description="Create your first post to share with your followers."
          icon={<FileText size={48} color={theme.textSecondary} />}
          style={styles.emptyState}
        />
      }
    />
  );

  const renderDropsTab = () => (
    <FlatList
      data={userDrops}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={[styles.dropCard, { backgroundColor: theme.card }]}>
          <View style={styles.dropHeader}>
            <Zap size={20} color={colors.primary} />
            <Text style={[styles.dropTitle, { color: theme.text }]} numberOfLines={1}>
              {item.title || 'Untitled Drop'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#10B981' : theme.border }]}>
              <Text style={styles.statusText}>{item.status || 'draft'}</Text>
            </View>
          </View>
          <Text style={[styles.dropDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description || 'No description'}
          </Text>
          <View style={styles.dropStats}>
            <Text style={[styles.dropStat, { color: theme.textSecondary }]}>
              {item.applications_count || 0} applications
            </Text>
            <Text style={[styles.dropStat, { color: theme.textSecondary }]}>
              {item.gem_reward_base || 0} Gems reward
            </Text>
          </View>
        </Card>
      )}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
      ListEmptyComponent={
        dropsLoading ? (
          <LoadingIndicator text="Loading drops..." />
        ) : (
          <EmptyState
            title="No Drops Created"
            description="Create your first drop to start engaging with creators."
            icon={<Zap size={48} color={theme.textSecondary} />}
            style={styles.emptyState}
          />
        )
      }
    />
  );

  const renderApplicationsTab = () => (
    <FlatList
      data={userApplications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={[styles.applicationCard, { backgroundColor: theme.card }]}>
          <View style={styles.applicationHeader}>
            <MapPin size={20} color="#F59E0B" />
            <Text style={[styles.applicationTitle, { color: theme.text }]} numberOfLines={1}>
              {item.drop?.title || 'Unknown Drop'}
            </Text>
          </View>
          <View style={styles.applicationMeta}>
            <View style={[
              styles.applicationStatus,
              { backgroundColor: getStatusColor(item.status) }
            ]}>
              {getStatusIcon(item.status)}
              <Text style={styles.applicationStatusText}>{item.status}</Text>
            </View>
            <Text style={[styles.applicationDate, { color: theme.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </Card>
      )}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
      ListEmptyComponent={
        applicationsLoading ? (
          <LoadingIndicator text="Loading applications..." />
        ) : (
          <EmptyState
            title="No Applications"
            description="Apply to drops to start earning rewards."
            icon={<MapPin size={48} color={theme.textSecondary} />}
            actionLabel="Browse Drops"
            onAction={() => router.push('/(tabs)/drops' as any)}
            style={styles.emptyState}
          />
        )
      }
    />
  );

  const renderAchievementsTab = () => {
    const badges = user.badges || [];
    const demoAchievements = [
      { id: '1', name: 'First Drop', description: 'Complete your first drop', earned: true, icon: Zap },
      { id: '2', name: 'Social Butterfly', description: 'Follow 10 creators', earned: true, icon: User },
      { id: '3', name: 'Rising Star', description: 'Reach 100 followers', earned: false, icon: Star },
      { id: '4', name: 'Streak Master', description: 'Maintain a 7-day streak', earned: false, icon: TrendingUp },
    ];

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {demoAchievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <Card
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    {
                      backgroundColor: theme.card,
                      opacity: achievement.earned ? 1 : 0.5,
                    }
                  ]}
                >
                  <View style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.earned ? colors.primary + '20' : theme.border }
                  ]}>
                    <IconComponent
                      size={24}
                      color={achievement.earned ? colors.primary : theme.textSecondary}
                    />
                  </View>
                  <Text style={[styles.achievementName, { color: theme.text }]}>
                    {achievement.name}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: theme.textSecondary }]}>
                    {achievement.description}
                  </Text>
                  {achievement.earned && (
                    <CheckCircle2 size={16} color={colors.success} style={styles.earnedBadge} />
                  )}
                </Card>
              );
            })}
          </View>
        </View>
      </ScrollView>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'rgba(16, 185, 129, 0.2)';
      case 'pending': return 'rgba(245, 158, 11, 0.2)';
      case 'rejected': return 'rgba(239, 68, 68, 0.2)';
      default: return 'rgba(107, 114, 128, 0.2)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={14} color="#10B981" />;
      case 'pending': return <Clock size={14} color="#F59E0B" />;
      default: return <Clock size={14} color="#6B7280" />;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverviewTab();
      case 'content': return renderContentTab();
      case 'drops': return renderDropsTab();
      case 'applications': return renderApplicationsTab();
      case 'achievements': return renderAchievementsTab();
      case 'store': return (
        <View style={styles.tabContent}>
          <TouchableOpacity
            style={[styles.storeLinkCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/store/[slug]', params: { slug: store.store_slug } } as any)}
          >
            <View style={styles.storeLinkContent}>
              <StoreIcon size={24} color={colors.primary} />
              <View style={styles.storeLinkTextWrapper}>
                <Text style={[styles.storeLinkTitle, { color: theme.text }]}>View Public Store</Text>
                <Text style={[styles.storeLinkSub, { color: theme.textSecondary }]}>See how others view your store</Text>
              </View>
              <ArrowRight size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>
      );
      default: return renderOverviewTab();
    }
  };

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
              isCurrentUser={true}
              onEditProfile={handleEditProfile}
              leaderboardPosition={leaderboardPosition}
              store={store}
            />
            <TabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as TabType)}
              variant="underlined"
              containerStyle={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
            />
          </>
        }
        ListFooterComponent={renderTabContent()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
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
  tabContent: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    marginTop: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  dropCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  dropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  dropTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'capitalize',
  },
  dropDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  dropStats: {
    flexDirection: 'row',
    gap: 16,
  },
  dropStat: {
    fontSize: 12,
  },
  applicationCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  applicationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  applicationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  applicationStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  applicationDate: {
    fontSize: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  earnedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  storeLinkCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  storeLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  storeLinkTextWrapper: {
    flex: 1,
  },
  storeLinkTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  storeLinkSub: {
    fontSize: 13,
    marginTop: 2,
  },
  quickAccessRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickAccessCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickAccessTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickAccessSubtitle: {
    fontSize: 12,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F610',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletTextContainer: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  walletSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});