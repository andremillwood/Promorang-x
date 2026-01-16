import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';
import { TaskCard } from '@/components/tasks/TaskCard';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTaskStore } from '@/store/taskStore';
import { useCampaignStore } from '@/store/campaignStore';
import { Briefcase, ShoppingBag } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function MarketplaceScreen() {
  const router = useRouter();
  const theme = useThemeColors();
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

  const renderContent = () => {
    if (isLoading && !refreshing) {
      return <LoadingIndicator fullScreen text={`Loading ${activeTab}...`} />;
    }

    if (activeTab === 'drops') {
      return (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={handleTaskPress} />
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
              title="No Drops Available"
              description="Check back later for new drops to complete."
              icon={<Briefcase size={48} color={theme.textSecondary} />}
              style={styles.emptyState}
            />
          }
        />
      );
    } else if (activeTab === 'campaigns') {
      return (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CampaignCard campaign={item} onPress={handleCampaignPress} />
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
              title="No Campaigns Available"
              description="Check back later for new campaigns to promote."
              icon={<ShoppingBag size={48} color={theme.textSecondary} />}
              style={styles.emptyState}
            />
          }
        />
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underlined"
        containerStyle={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }] as any}
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    marginTop: 100,
  },
});