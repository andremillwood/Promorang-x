import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Clock, DollarSign, Users, CheckCircle, AlertCircle, Key, Info, Target, Share2, TrendingUp } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  notFound: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: colors.darkGray,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: colors.lightGray,
  },
  card: {
    margin: 16,
    marginTop: -20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleArea: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    marginRight: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray + '30',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: colors.darkGray,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  statSubtext: {
    fontSize: 9,
    color: colors.darkGray,
    marginTop: 2,
  },
  divider: {
    marginVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    marginLeft: 8,
  },
  description: {
    fontSize: 15,
    color: colors.black,
    lineHeight: 24,
    opacity: 0.8,
  },
  list: {
    paddingLeft: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  listText: {
    fontSize: 15,
    color: colors.black,
    flex: 1,
    lineHeight: 22,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  statusPending: {
    backgroundColor: colors.primary + '10',
  },
  statusSuccess: {
    backgroundColor: colors.success + '10',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  applySection: {
    marginTop: 8,
  },
  messageInput: {
    backgroundColor: colors.lightGray + '40',
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 15,
    color: colors.black,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  keyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: colors.warning + '10',
    padding: 10,
    borderRadius: 8,
  },
  keyText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 8,
    fontWeight: '600',
  },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 20,
    paddingBottom: 35,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  applyButton: {
    width: '100%',
    height: 56,
  },
  shareButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  halfButton: {
    flex: 1,
  },
});

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useThemeColors();
  const router = useRouter();
  const { tasks, myTasks, applyForTask, completeTask, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const [applying, setApplying] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');

  // Find the task in either tasks or myTasks
  const task = [...tasks, ...myTasks].find(t => t.id === id);
  const myApplication = myTasks.find(t => t.id === id);
  const isApplied = !!myApplication;

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFound, { color: theme.textSecondary }]}>Task not found</Text>
      </View>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const getRewardPerKey = () => {
    if (!task.key_cost || task.key_cost === 0) return 0;
    const reward = task.gem_reward_base || task.reward;
    return (reward / task.key_cost).toFixed(1);
  };

  const handleApply = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to apply for tasks.');
      return;
    }

    const keyCost = task.key_cost || 1;
    if ((user.keys_balance || 0) < keyCost) {
      Alert.alert('Insufficient Keys', `This task requires ${keyCost} keys to apply. You have ${user.keys_balance || 0}.`);
      return;
    }

    if (task.is_proof_drop && !applicationMessage) {
      Alert.alert('Message Required', 'Please provide a brief message about how you will complete this task.');
      return;
    }

    setApplying(true);
    try {
      await applyForTask(task.id, applicationMessage);
      Alert.alert('Success', 'Application submitted! Good luck.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to apply for task.');
    } finally {
      setApplying(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeTask(task.id);
      Alert.alert('Success', 'Submission received! The creator will review it shortly.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit proof.');
    } finally {
      setCompleting(false);
    }
  };

  const handleExternalShare = async () => {
    try {
      await Share.share({
        message: `Join me on this task: ${task.title} - Earn ${task.gem_reward_base || task.reward} Gems!`,
        url: task.content_url || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share task.');
    }
  };

  const handleRelayShare = () => {
    // Basic implementation - in real app would trigger relay system
    Alert.alert('Relay', 'Task shared with your network via Relay!');
  };

  const previewImage = task.preview_image || task.content_url || `https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80&sig=${task.id}`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      <Image
        source={{ uri: previewImage }}
        style={styles.heroImage}
        contentFit="cover"
        transition={300}
      />

      <Card style={styles.card} padding="large">
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <Text style={styles.title}>{task.title}</Text>
            <View style={styles.badgeRow}>
              <Badge
                text={task.difficulty}
                variant={getDifficultyColor(task.difficulty) as any}
                size="sm"
                style={styles.badge}
              />
              {task.category && (
                <Badge text={task.category.toUpperCase()} variant="primary" size="sm" style={styles.badge} />
              )}
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push(`/profile/${task.creator.id}`)}>
            <Avatar source={task.creator.avatar} size="lg" name={task.creator.name} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Reward</Text>
            <Text style={styles.statValue}>{task.gem_reward_base || task.reward} Gems</Text>
            <Text style={styles.statSubtext}>total pool</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Cost</Text>
            <Text style={styles.statValue}>{task.key_cost || 1} Keys</Text>
            <Text style={styles.statSubtext}>entry required</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>ROI</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>{getRewardPerKey()}x</Text>
            <Text style={styles.statSubtext}>yield per key</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>What you need to do</Text>
          </View>
          <View style={styles.list}>
            {(Array.isArray(task.requirements) ? task.requirements : [task.requirements]).map((req, i) => (
              <View key={i} style={styles.listItem}>
                <CheckCircle size={16} color={colors.success} style={styles.listIcon} />
                <Text style={styles.listText}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        {task.deliverables && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CheckCircle size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Deliverables</Text>
            </View>
            <Text style={styles.description}>{task.deliverables}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Share2 size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Promote this Drop</Text>
          </View>
          <Text style={styles.description}>Help this drop reach more participants and earn extra influence.</Text>
          <View style={styles.shareButtonsRow}>
            <Button
              title="Relay"
              onPress={handleRelayShare}
              variant="primary"
              size="md"
              style={styles.halfButton}
              leftIcon={<TrendingUp size={18} color={colors.white} />}
            />
            <Button
              title="Share"
              onPress={handleExternalShare}
              variant="outline"
              size="md"
              style={styles.halfButton}
              leftIcon={<Share2 size={18} color={colors.primary} />}
            />
          </View>
        </View>

        {isApplied ? (
          <View style={[styles.statusBanner, myApplication.status === 'completed' ? styles.statusSuccess : styles.statusPending]}>
            <AlertCircle size={20} color={myApplication.status === 'completed' ? colors.success : colors.primary} />
            <Text style={[styles.statusText, { color: myApplication.status === 'completed' ? colors.success : colors.primary }]}>
              {myApplication.status === 'completed' ? 'This task is completed!' : 'Your application is pending review.'}
            </Text>
          </View>
        ) : (
          <View style={styles.applySection}>
            <Text style={styles.sectionTitle}>Apply with message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="e.g. I will share this on my Instagram stories (10k followers)..."
              placeholderTextColor={colors.darkGray}
              multiline
              numberOfLines={3}
              value={applicationMessage}
              onChangeText={setApplicationMessage}
            />
            <View style={styles.keyInfo}>
              <Key size={16} color={colors.warning} />
              <Text style={styles.keyText}>Applying will use {task.key_cost || 1} Master Key(s)</Text>
            </View>
          </View>
        )}
      </Card>

      <View style={styles.actionFooter}>
        {!isApplied ? (
          <Button
            title={`Apply (${task.key_cost || 1} Keys)`}
            onPress={handleApply}
            variant="primary"
            size="lg"
            isLoading={applying}
            style={styles.applyButton}
          />
        ) : task.status !== 'completed' && myApplication.status !== 'completed' ? (
          <Button
            title="Mark as Completed"
            onPress={handleComplete}
            variant="primary"
            size="lg"
            isLoading={completing}
            style={styles.applyButton}
          />
        ) : (
          <Button
            title="Task Finalized"
            variant="outline"
            size="lg"
            disabled
            style={styles.applyButton}
            onPress={() => { }}
          />
        )}
      </View>
    </ScrollView>
  );
}