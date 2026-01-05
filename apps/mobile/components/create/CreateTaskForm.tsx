import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { TabBar } from '@/components/ui/TabBar';
import { DollarSign, Clock } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export const CreateTaskForm: React.FC = () => {
  const router = useRouter();

  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const difficultyOptions = [
    { key: 'easy', label: 'Easy' },
    { key: 'medium', label: 'Medium' },
    { key: 'hard', label: 'Hard' },
  ];

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return false;
    }
    if (!reward || isNaN(Number(reward)) || Number(reward) <= 0) {
      Alert.alert('Error', 'Please enter a valid reward amount');
      return false;
    }
    return true;
  };

  const createTaskMutation = trpc.tasks.create.useMutation();

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await createTaskMutation.mutateAsync({
        title,
        description,
        reward: Number(reward),
        category: category || 'General',
        requirements: requirements ? requirements.split('\n').filter(r => r.trim()) : [],
        deadline: deadline || undefined,
      });
      
      console.log('Task created:', result);
      
      Alert.alert(
        'Success',
        'Your task has been created successfully!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/marketplace') }]
      );
    } catch (error) {
      console.error('Create task error:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Task Details</Text>
      
      <Input
        label="Task Title"
        placeholder="Enter a clear, concise title"
        value={title}
        onChangeText={setTitle}
      />
      
      <Input
        label="Description"
        placeholder="Describe what needs to be done"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        inputStyle={styles.textArea}
      />
      
      <Input
        label="Reward Amount"
        placeholder="Enter amount in $"
        value={reward}
        onChangeText={setReward}
        keyboardType="numeric"
        leftIcon={<DollarSign size={20} color={colors.darkGray} />}
      />
      
      <Input
        label="Estimated Time"
        placeholder="e.g., 1-2 hours, 30 minutes"
        value={estimatedTime}
        onChangeText={setEstimatedTime}
        leftIcon={<Clock size={20} color={colors.darkGray} />}
      />
      
      <Input
        label="Category"
        placeholder="e.g., Content Creation, Social Sharing"
        value={category}
        onChangeText={setCategory}
      />
      
      <Text style={styles.label}>Difficulty Level</Text>
      <TabBar
        tabs={difficultyOptions}
        activeTab={difficulty}
        onTabChange={setDifficulty}
        variant="pills"
        containerStyle={styles.difficultyTabs}
      />
      
      <Input
        label="Requirements"
        placeholder="List requirements separated by new lines"
        value={requirements}
        onChangeText={setRequirements}
        multiline
        numberOfLines={4}
        inputStyle={styles.textArea}
      />
      
      <Input
        label="Deadline (Optional)"
        placeholder="MM/DD/YYYY"
        value={deadline}
        onChangeText={setDeadline}
      />
      
      <Divider style={styles.divider} />
      
      <Button
        title="Create Task"
        onPress={handleSubmit}
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  difficultyTabs: {
    marginBottom: 16,
  },
  divider: {
    marginVertical: 24,
  },
  submitButton: {
    marginBottom: 16,
  },
});