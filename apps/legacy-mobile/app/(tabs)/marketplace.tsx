import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, Dimensions } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';
import { TaskCard } from '@/components/tasks/TaskCard';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTaskStore } from '@/store/taskStore';
import { useCampaignStore } from '@/store/campaignStore';
import { Briefcase, ShoppingBag, Sparkles, Trophy } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useMaturityStore, UserMaturityState } from '@/store/maturityStore';
import { useAuthStore } from '@/store/authStore';
import { AppHeader } from '@/components/ui/AppHeader';
import { BalancesBar } from '@/components/ui/BalancesBar';
import { LinearGradient } from 'expo-linear-gradient';
import TodayLayout from '@/components/TodayLayout';

const { width } = Dimensions.get('window');

export default function MarketplaceScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { user } = useAuthStore();
  const { maturityState } = useMaturityStore();
  const isFocusedMode = maturityState < UserMaturityState.OPERATOR_PRO;
  const [activeTab, setActiveTab] = useState('drops');
  const [refreshing, setRefreshing] = useState(false);

  const { tasks, isLoading: tasksLoading, fetchTasks } = useTaskStore();
  const { campaigns, isLoading: campaignsLoading, fetchCampaigns } = useCampaignStore();

  useEffect(() => {
    if (activeTab === 'drops') {
      fetchTasks();
    } else if (activeTab === 'campaigns') {
      fetchCampaigns();
    }
  }, [activeTab]);


  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'drops') {
      await fetchTasks();
    } else if (activeTab === 'campaigns') {
      await fetchCampaigns();
    }
    setRefreshing(false);
  };

  const handleTaskPress = (taskId: string) => {
    router.push({ pathname: '/task/[id]', params: { id: taskId } } as any);
  };

  const handleCampaignPress = (campaignId: string) => {
    router.push({ pathname: '/campaign/[id]', params: { id: campaignId } } as any);
  };

  const tabs = [
    { key: 'drops', label: 'Drops' },
    { key: 'campaigns', label: 'Campaigns' },
  ];

  const isLoading = activeTab === 'drops' ? tasksLoading :
    activeTab === 'campaigns' ? campaignsLoading : false;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[colors.primary, '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroTitle}>Marketplace</Text>
            <Text style={styles.heroSubtitle}>Unlock rewards & grow your rank</Text>
          </View>
          <Trophy size={40} color="rgba(255,255,255,0.2)" />
        </View>
        <Sparkles size={100} color="rgba(255,255,255,0.05)" style={styles.heroIcon} />
      </LinearGradient>

      <View style={styles.contentPadding}>
        <BalancesBar user={user} />

        <View style={styles.tabContainer}>
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="pills"
          />
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading && !refreshing) {
      return <LoadingIndicator fullScreen text={`Loading ${activeTab}...`} />;
    }

    const data = activeTab === 'drops' ? tasks : campaigns;

    return (
      <FlatList
        data={data as any}
        keyExtractor={(item) => (item as any).id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            {activeTab === 'drops' ?
              <TaskCard task={item as any} onPress={handleTaskPress} /> :
              <CampaignCard campaign={item as any} onPress={handleCampaignPress} />
            }
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
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
            title={activeTab === 'drops' ? "No Drops Available" : "No Campaigns Available"}
            description={activeTab === 'drops' ? "Check back later for new drops." : "Check back later for new campaigns."}
            icon={activeTab === 'drops' ? <Briefcase size={48} color={theme.textSecondary} /> : <ShoppingBag size={48} color={theme.textSecondary} />}
            style={styles.emptyState}
          />
        }
      />
    );
  };

  const content = (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader transparent hideLeft showBack showNotifications showAvatar />
      {renderContent()}
    </View>
  );

  return isFocusedMode ? <TodayLayout>{content}</TodayLayout> : content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 120,
  },
  cardWrapper: {
    paddingHorizontal: 16,
  },
  emptyState: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
});