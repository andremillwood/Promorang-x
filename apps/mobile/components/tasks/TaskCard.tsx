import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, DollarSign, Users } from 'lucide-react-native';
import { Task } from '@/types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import colors from '@/constants/colors';

interface TaskCardProps {
  task: Task;
  onPress: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
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

  return (
    <TouchableOpacity onPress={() => onPress(task.id)} activeOpacity={0.8}>
      <Card style={styles.card} variant="elevated">
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {task.title}
            </Text>
            <Badge
              text={task.difficulty}
              variant={getDifficultyColor(task.difficulty) as any}
              size="sm"
              style={styles.badge}
            />
          </View>
          <Avatar
            source={task.creator.avatar}
            size="sm"
            name={task.creator.name}
          />
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <DollarSign size={16} color={colors.success} />
            <Text style={styles.metaText}>${task.reward}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={16} color={colors.darkGray} />
            <Text style={styles.metaText}>{task.estimatedTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={16} color={colors.darkGray} />
            <Text style={styles.metaText}>{task.completions} completed</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.category}>{task.category}</Text>
          {task.deadline && (
            <Text style={styles.deadline}>
              Due: {new Date(task.deadline).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginRight: 8,
    flex: 1,
  },
  badge: {
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 8,
  },
  category: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  deadline: {
    fontSize: 12,
    color: colors.darkGray,
  },
});