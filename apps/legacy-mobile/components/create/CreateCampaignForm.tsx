import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { TabBar } from '@/components/ui/TabBar';
import { DollarSign, Calendar, Image as ImageIcon } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import * as ImagePicker from 'expo-image-picker';

export const CreateCampaignForm: React.FC = () => {
  const router = useRouter();


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [rewardType, setRewardType] = useState('fixed');
  const [category, setCategory] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [mediaUri, setMediaUri] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rewardTypeOptions = [
    { key: 'fixed', label: 'Fixed Amount' },
    { key: 'percentage', label: 'Percentage' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a campaign title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a campaign description');
      return false;
    }
    if (!reward || isNaN(Number(reward)) || Number(reward) <= 0) {
      Alert.alert('Error', 'Please enter a valid reward amount');
      return false;
    }
    if (!mediaUri) {
      Alert.alert('Error', 'Please upload a campaign image');
      return false;
    }
    return true;
  };

  const createCampaignMutation = trpc.campaigns.create.useMutation();

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await createCampaignMutation.mutateAsync({
        title,
        description,
        budget: Number(reward),
        targetAudience: category || 'General',
        duration: 30, // Default 30 days
        requirements: ['Complete the campaign tasks', 'Follow brand guidelines'],
      });

      console.log('Campaign created:', result);

      Alert.alert(
        'Success',
        'Your campaign has been created successfully!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/marketplace') }]
      );
    } catch (error) {
      console.error('Create campaign error:', error);
      Alert.alert('Error', 'Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Campaign Details</Text>

      <Input
        label="Campaign Title"
        placeholder="Enter a compelling title"
        value={title}
        onChangeText={setTitle}
      />

      <Input
        label="Description"
        placeholder="Describe your campaign and what you're promoting"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        inputStyle={styles.textArea}
      />

      <Text style={styles.label}>Reward Type</Text>
      <TabBar
        tabs={rewardTypeOptions}
        activeTab={rewardType}
        onTabChange={setRewardType}
        variant="pills"
        containerStyle={styles.rewardTypeTabs}
      />

      <Input
        label={`Reward ${rewardType === 'percentage' ? 'Percentage' : 'Amount'}`}
        placeholder={rewardType === 'percentage' ? "Enter percentage (e.g., 10)" : "Enter amount in $"}
        value={reward}
        onChangeText={setReward}
        keyboardType="numeric"
        leftIcon={<DollarSign size={20} color={colors.darkGray} />}
      />

      <Input
        label="Category"
        placeholder="e.g., Fashion, Technology, Health"
        value={category}
        onChangeText={setCategory}
      />

      <Input
        label="Expiration Date (Optional)"
        placeholder="MM/DD/YYYY"
        value={expiresAt}
        onChangeText={setExpiresAt}
        leftIcon={<Calendar size={20} color={colors.darkGray} />}
      />

      <Text style={styles.label}>Campaign Image</Text>
      <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
        {mediaUri ? (
          <ExpoImage source={{ uri: mediaUri }} style={styles.previewImage} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ImageIcon size={40} color={colors.darkGray} />
            <Text style={styles.uploadText}>Tap to upload image</Text>
          </View>
        )}
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <Button
        title="Create Campaign"
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
  rewardTypeTabs: {
    marginBottom: 16,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    color: colors.darkGray,
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  divider: {
    marginVertical: 24,
  },
  submitButton: {
    marginBottom: 16,
  },
});