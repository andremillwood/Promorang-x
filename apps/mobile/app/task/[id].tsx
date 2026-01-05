import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, DollarSign, Users, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { useTaskStore } from '@/store/taskStore';
import colors from '@/constants/colors';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { tasks, myTasks, applyForTask, completeTask, isLoading } = useTaskStore();
  const [applying, setApplying] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Find the task in either tasks or myTasks
  const task = [...tasks, ...myTasks].find(t => t.id === id);
  const isApplied = myTasks.some(t => t.id === id);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Task not found</Text>
      </View>
    );
  }

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

  const handleApply = async () => {
    setApplying(true);
    try {
      await applyForTask(task.id);
      Alert.alert('Success', 'You have successfully applied for this task.');
    } catch (error) {
      Alert.alert('Error', 'Failed to apply for task. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeTask(task.id);
      Alert.alert('Success', 'Task marked as completed. Your reward will be processed soon.');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    } finally {
      setCompleting(false);
    }
  };

  const handleCreatorPress = () => {
    router.push(`/profile/${task.creator.id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{task.title}</Text>
          <Badge
            text={task.difficulty}
            variant={getDifficultyColor(task.difficulty) as any}
            size="sm"
            style={styles.badge}
          />
        </View>

        <View style={styles.creatorContainer}>
          <Avatar
            source={task.creator.avatar}
            size="md"
            name={task.creator.name}
          />
          <View style={styles.creatorInfo}>
            <Text style={styles.creatorName}>{task.creator.name}</Text>
            <Text style={styles.creatorRole}>Task Creator</Text>
          </View>
          <Button
            title="View Profile"
            variant="outline"
            size="sm"
            onPress={handleCreatorPress}
          />
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{task.description}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <DollarSign size={20} color={colors.success} />
            <Text style={styles.metaLabel}>Reward</Text>
            <Text style={styles.metaValue}>${task.reward}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={20} color={colors.darkGray} />
            <Text style={styles.metaLabel}>Est. Time</Text>
            <Text style={styles.metaValue}>{task.estimatedTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users size={20} color={colors.darkGray} />
            <Text style={styles.metaLabel}>Completions</Text>
            <Text style={styles.metaValue}>{task.completions}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Requirements</Text>
        <View style={styles.requirementsList}>
          {task.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <CheckCircle size={16} color={colors.success} style={styles.requirementIcon} />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        {task.deadline && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.deadlineContainer}>
              <AlertCircle size={20} color={colors.warning} />
              <Text style={styles.deadlineText}>
                Deadline: {new Date(task.deadline).toLocaleDateString()}
              </Text>
            </View>
          </>
        )}
      </Card>

      <View style={styles.actionContainer}>
        {!isApplied ? (
          <Button
            title="Apply for Task"
            onPress={handleApply}
            variant="primary"
            size="lg"
            isLoading={applying}
            style={styles.button}
          />
        ) : task.status !== 'completed' ? (
          <Button
            title="Mark as Completed"
            onPress={handleComplete}
            variant="primary"
            size="lg"
            isLoading={completing}
            style={styles.button}
          />
        ) : (
          <Button
            title="Task Completed"
            variant="outline"
            size="lg"
            disabled={true}
            style={styles.button}
            onPress={() => {}}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  notFound: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    color: colors.darkGray,
  },
  card: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.black,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    marginTop: 4,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  creatorRole: {
    fontSize: 12,
    color: colors.darkGray,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.black,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  requirementsList: {
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requirementIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  requirementText: {
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}10`,
    padding: 12,
    borderRadius: 8,
  },
  deadlineText: {
    fontSize: 14,
    color: colors.black,
    marginLeft: 8,
  },
  actionContainer: {
    padding: 16,
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
});