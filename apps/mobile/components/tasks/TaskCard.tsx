import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Clock, DollarSign, Users } from 'lucide-react-native';
import { Task } from '@/types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useThemeColors } from '@/hooks/useThemeColors';

interface TaskCardProps {
  task: Task;
  onPress: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const theme = useThemeColors();
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRewardPerKey = () => {
    if (!task.key_cost || task.key_cost === 0) return 0;
    const reward = task.gem_reward_base || task.reward;
    return (reward / task.key_cost).toFixed(1);
  };

  const previewImage = task.preview_image || task.content_url || `https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1200&q=80&sig=${task.id}`;

  return (
    <TouchableOpacity onPress={() => onPress(task.id)} activeOpacity={0.8}>
      <Card style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }] as any} variant="elevated" padding="none">
        <Image
          source={{ uri: previewImage }}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.contentPadding}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                {task.title}
              </Text>
              <View style={styles.badgeRow}>
                <Badge
                  text={task.difficulty}
                  variant={getDifficultyColor(task.difficulty) as any}
                  size="sm"
                  style={styles.badge}
                />
                {task.is_proof_drop && (
                  <Badge text="Proof" variant="primary" size="sm" style={styles.badge} />
                )}
              </View>
            </View>
            <Avatar
              source={task.creator?.avatar}
              size="sm"
              name={task.creator?.name || 'Promorang'}
            />
          </View>

          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
            {task.description}
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <DollarSign size={14} color={colors.success} />
                <Text style={styles.statLabel}>Reward</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{task.gem_reward_base || task.reward}</Text>
              <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>gems</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Clock size={14} color={colors.primary} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Cost</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{task.key_cost || 1}</Text>
              <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>keys</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Users size={14} color={colors.info || '#2196F3'} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>ROI</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.success }]}>{getRewardPerKey()}x</Text>
              <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>per key</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Users size={14} color={theme.textSecondary} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Joined</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{task.current_participants || task.completions}</Text>
              <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>users</Text>
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Text style={styles.category}>{task.category}</Text>
            {task.deadline && (
              <Text style={[styles.deadline, { color: colors.error }]}>
                Due: {new Date(task.deadline).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 150,
    backgroundColor: colors.lightGray,
  },
  contentPadding: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    ...typography.presets.body,
    fontWeight: typography.weight.bold,
    color: colors.black,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginRight: 8,
  },
  description: {
    ...typography.presets.bodySmall,
    color: colors.darkGray,
    marginBottom: 16,
    lineHeight: typography.lineHeight.snug * 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.lightGray + '40', // Very light transparency
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    ...typography.presets.caption,
    fontSize: 10,
    color: colors.darkGray,
    marginLeft: 4,
    textTransform: 'uppercase',
    fontWeight: typography.weight.semibold,
  },
  statValue: {
    ...typography.presets.body,
    fontSize: 16,
    fontWeight: typography.weight.bold,
    color: colors.black,
  },
  statSubtext: {
    ...typography.presets.caption,
    fontSize: 10,
    color: colors.darkGray,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  category: {
    ...typography.presets.caption,
    color: colors.primary,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
  },
  deadline: {
    ...typography.presets.caption,
    color: colors.error,
    fontWeight: typography.weight.medium,
  },
});