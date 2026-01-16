import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Switch } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Image as ImageIcon, Link, TrendingUp, DollarSign, ChevronDown } from 'lucide-react-native';
import colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import * as ImagePicker from 'expo-image-picker';

export const CreatePostForm: React.FC = () => {
  const router = useRouter();

  const [content, setContent] = useState('');
  const [mediaUri, setMediaUri] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState('');
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const [enableContentShares, setEnableContentShares] = useState(false);
  const [enableForecasts, setEnableForecasts] = useState(false);
  const [initialSharePrice, setInitialSharePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const platforms = [
    { key: 'instagram', label: 'Instagram', icon: '📷' },
    { key: 'tiktok', label: 'TikTok', icon: '🎵' },
    { key: 'youtube', label: 'YouTube', icon: '📺' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { key: 'twitter', label: 'Twitter/X', icon: '🐦' },
    { key: 'facebook', label: 'Facebook', icon: '👥' },
    { key: 'other', label: 'Other', icon: '🌐' },
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const selectPlatform = (platform: string) => {
    setSourcePlatform(platform);
    setShowPlatformPicker(false);
  };

  const getPlatformDisplay = () => {
    const platform = platforms.find(p => p.key === sourcePlatform);
    return platform ? `${platform.icon} ${platform.label}` : 'Select platform';
  };

  const validateForm = () => {
    if (!content.trim() && !mediaUri) {
      Alert.alert('Error', 'Please enter text or upload media');
      return false;
    }

    if (enableContentShares && (!initialSharePrice || isNaN(Number(initialSharePrice)) || Number(initialSharePrice) <= 0)) {
      Alert.alert('Error', 'Please enter a valid initial share price');
      return false;
    }

    if (sourceUrl && !sourcePlatform) {
      Alert.alert('Error', 'Please select a source platform');
      return false;
    }

    return true;
  };

  const createPostMutation = trpc.posts.create.useMutation();

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await createPostMutation.mutateAsync({
        title: content.slice(0, 50) || 'Untitled Post',
        content,
        mediaUrl: mediaUri || undefined,
        enableContentShares,
        enableBetting: enableForecasts, // API uses enableBetting, UI shows "Forecasts"
      });

      console.log('Post created:', result);

      Alert.alert(
        'Success',
        'Your post has been created successfully!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error) {
      console.error('Create post error:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <View style={styles.container}>
      <Input
        label="What's on your mind?"
        placeholder="Share your thoughts..."
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
        inputStyle={styles.textArea}
      />

      <Text style={styles.label}>Add Media (Optional)</Text>
      <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
        {mediaUri ? (
          <ExpoImage source={{ uri: mediaUri }} style={styles.previewImage} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ImageIcon size={40} color={colors.darkGray} />
            <Text style={styles.uploadText}>Tap to upload image or video</Text>
          </View>
        )}
      </TouchableOpacity>

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>Content Source (Optional)</Text>
      <Text style={styles.sectionDescription}>
        If you&apos;re sharing content from another platform, provide the source link
      </Text>

      <Input
        label="Source URL"
        placeholder="https://..."
        value={sourceUrl}
        onChangeText={setSourceUrl}
        leftIcon={<Link size={20} color={colors.darkGray} />}
      />

      <Text style={styles.label}>Source Platform</Text>
      <TouchableOpacity
        style={styles.platformSelector}
        onPress={() => setShowPlatformPicker(!showPlatformPicker)}
      >
        <Text style={[styles.platformText, !sourcePlatform && styles.placeholderText]}>
          {getPlatformDisplay()}
        </Text>
        <ChevronDown size={20} color={colors.darkGray} />
      </TouchableOpacity>

      {showPlatformPicker && (
        <View style={styles.platformPicker}>
          {platforms.map((platform) => (
            <TouchableOpacity
              key={platform.key}
              style={styles.platformOption}
              onPress={() => selectPlatform(platform.key)}
            >
              <Text style={styles.platformOptionText}>
                {platform.icon} {platform.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>Monetization Options</Text>

      <View style={styles.toggleContainer}>
        <View style={styles.toggleInfo}>
          <TrendingUp size={20} color={colors.primary} />
          <Text style={styles.toggleLabel}>Enable Content Shares</Text>
        </View>
        <Switch
          value={enableContentShares}
          onValueChange={setEnableContentShares}
          trackColor={{ false: colors.lightGray, true: `${colors.primary}80` }}
          thumbColor={enableContentShares ? colors.primary : colors.darkGray}
        />
      </View>

      {enableContentShares && (
        <Input
          label="Initial Share Price"
          placeholder="Enter amount in $"
          value={initialSharePrice}
          onChangeText={setInitialSharePrice}
          keyboardType="numeric"
          leftIcon={<DollarSign size={20} color={colors.darkGray} />}
        />
      )}

      <View style={styles.toggleContainer}>
        <View style={styles.toggleInfo}>
          <TrendingUp size={20} color={colors.primary} />
          <Text style={styles.toggleLabel}>Enable Social Forecasts</Text>
        </View>
        <Switch
          value={enableForecasts}
          onValueChange={setEnableForecasts}
          trackColor={{ false: colors.lightGray, true: `${colors.primary}80` }}
          thumbColor={enableForecasts ? colors.primary : colors.darkGray}
        />
      </View>

      <Button
        title="Create Post"
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
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
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.black,
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  platformSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  platformText: {
    fontSize: 16,
    color: colors.black,
  },
  placeholderText: {
    color: colors.darkGray,
  },
  platformPicker: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 16,
    overflow: 'hidden',
  },
  platformOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  platformOptionText: {
    fontSize: 16,
    color: colors.black,
  },
});