import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { Camera, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import { safeBack } from '@/lib/navigation';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert('Error', 'Name and username are required');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatar: avatar
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => safeBack(router) }
      ]);
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeAvatar = () => {
    // In a real app, you would open a camera or image picker
    Alert.alert('Change Avatar', 'This feature is not implemented in the demo');
  };

  return (
    <>
      <Stack.Screen options={{
        title: 'Edit Profile',
        headerRight: () => (
          <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
            <Text style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        )
      }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.avatarContainer}>
          <Avatar
            source={avatar}
            size="xl"
            name={name}
            borderColor={colors.primary}
          />
          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={handleChangeAvatar}
          >
            <Camera size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <Input
              value={username}
              onChangeText={setUsername}
              placeholder="Your username"
              maxLength={30}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={4}
              maxLength={150}
              textAlignVertical="top"
              style={styles.bioInput}
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            style={styles.saveChangesButton}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray,
  },
  contentContainer: {
    padding: 16,
  },
  saveButton: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.darkGray,
    marginBottom: 8,
  },
  bioInput: {
    height: 100,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: colors.darkGray,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  saveChangesButton: {
    width: '100%',
  },
});