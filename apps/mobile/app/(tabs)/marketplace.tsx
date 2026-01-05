import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { TabBar } from '@/components/ui/TabBar';
import { Card } from '@/components/ui/Card';
import { TaskCard } from '@/components/tasks/TaskCard';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateTaskForm } from '@/components/create/CreateTaskForm';
import { CreateCampaignForm } from '@/components/create/CreateCampaignForm';
import { CreatePostForm } from '@/components/create/CreatePostForm';
import { useTaskStore } from '@/store/taskStore';
import { useCampaignStore } from '@/store/campaignStore';
import { Briefcase, ShoppingBag, Plus } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function MarketplaceScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('tasks');
  const [refreshing, setRefreshing] = useState(false);
  
  const { tasks, isLoading: tasksLoading, fetchTasks } = useTaskStore();
  const { campaigns, isLoading: campaignsLoading, fetchCampaigns } = useCampaignStore();

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'campaigns') {
      fetchCampaigns();
    }
  }, [activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'tasks') {
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
    { key: 'tasks', label: 'Tasks' },
    { key: 'campaigns', label: 'Campaigns' },
    { key: 'create', label: 'Create' },
  ];

  const [createTab, setCreateTab] = useState('post');
  const createTabs = [
    { key: 'post', label: 'Post' },
    { key: 'task', label: 'Task' },
    { key: 'campaign', label: 'Campaign' },
  ];

  const isLoading = activeTab === 'tasks' ? tasksLoading : activeTab === 'campaigns' ? campaignsLoading : false;
  const data = activeTab === 'tasks' ? tasks : activeTab === 'campaigns' ? campaigns : [];

  const renderCreateContent = () => {
    switch (createTab) {
      case 'post':
        return <CreatePostForm />;
      case 'task':
        return <CreateTaskForm />;
      case 'campaign':
        return <CreateCampaignForm />;
      default:
        return <CreatePostForm />;
    }
  };

  const renderContent = () => {
    if (activeTab === 'create') {
      return (
        <ScrollView style={styles.createContainer}>
          <Card style={styles.createCard}>
            <Text style={styles.createTitle}>Create New</Text>
            <TabBar
              tabs={createTabs}
              activeTab={createTab}
              onTabChange={setCreateTab}
              variant="pills"
              containerStyle={styles.createTabBar}
            />
            {renderCreateContent()}
          </Card>
        </ScrollView>
      );
    }

    if (isLoading && !refreshing && data.length === 0) {
      return <LoadingIndicator fullScreen text={`Loading ${activeTab}...`} />;
    }

    if (activeTab === 'tasks') {
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
              title="No Tasks Available"
              description="Check back later for new tasks to complete."
              icon={<Briefcase size={48} color={colors.darkGray} />}
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
              icon={<ShoppingBag size={48} color={colors.darkGray} />}
              style={styles.emptyState}
            />
          }
        />
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underlined"
        containerStyle={styles.tabBar}
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  tabBar: {
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.black,
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
  createContainer: {
    flex: 1,
    padding: 16,
  },
  createCard: {
    marginBottom: 24,
  },
  createTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 16,
  },
  createTabBar: {
    marginBottom: 24,
  },
});