import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const INTERESTS = [
  ['social', 'Social'], ['food', 'Food & drink'], ['fitness', 'Wellness'], ['music', 'Music'],
  ['arts', 'Arts & culture'], ['outdoor', 'Outdoors'], ['networking', 'Networking'], ['workshop', 'Learning'],
] as const;

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('full_name,bio,location,avatar_url').eq('user_id', user.id).maybeSingle(),
      supabase.from('user_preferences').select('preferred_categories').eq('user_id', user.id).maybeSingle(),
    ])
      .then(([profile, preferences]) => {
        if (profile.error) Alert.alert('Profile unavailable', profile.error.message);
        setName(profile.data?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '');
        setBio(profile.data?.bio || '');
        setLocation(profile.data?.location || '');
        setAvatarUrl(profile.data?.avatar_url || user.user_metadata?.avatar_url || null);
        setInterests(preferences.data?.preferred_categories || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const chooseAvatar = async () => {
    if (!user) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Allow photo access to choose a profile image.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;

    setSaving(true);
    try {
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      const extension = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
      const path = `${user.id}/${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: blob.type || 'image/jpeg', cacheControl: '3600' });
      if (error) throw error;
      const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
      setAvatarUrl(url);
    } catch (error) {
      Alert.alert('Photo not uploaded', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!user || name.trim().length < 2) return Alert.alert('Add your name', 'Your name must contain at least two characters.');
    setSaving(true);
    try {
      const cleanName = name.trim();
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        full_name: cleanName,
        bio: bio.trim() || null,
        location: location.trim() || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (profileError) throw profileError;
      const { error: authError } = await supabase.auth.updateUser({ data: { full_name: cleanName, name: cleanName, avatar_url: avatarUrl } });
      if (authError) throw authError;
      const { error: preferenceError } = await supabase.from('user_preferences').update({ preferred_categories: interests, updated_at: new Date().toISOString() }).eq('user_id', user.id);
      if (preferenceError) throw preferenceError;
      Alert.alert('Profile updated', 'Your public profile is ready.', [{ text: 'Done', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Profile not saved', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={Colors.primary} /></View>;

  const initials = (name || user?.email || 'P').split(/\s|@/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <Pressable accessibilityLabel="Save profile" disabled={saving} onPress={() => void save()} style={styles.saveButton}>{saving ? <ActivityIndicator size="small" color={Colors.black} /> : <Ionicons name="checkmark" size={22} color={Colors.black} />}</Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable accessibilityLabel="Change profile photo" onPress={() => void chooseAvatar()} style={styles.avatarArea}>
          {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatar} /> : <View style={styles.avatarFallback}><Text style={styles.initials}>{initials}</Text></View>}
          <View style={styles.camera}><Ionicons name="camera" size={17} color={Colors.black} /></View>
          <Text style={styles.photoAction}>Change photo</Text>
        </Pressable>

        <Field label="NAME"><TextInput value={name} onChangeText={setName} maxLength={80} autoCapitalize="words" style={styles.input} placeholder="Your name" placeholderTextColor={Colors.gray[600]} /></Field>
        <Field label="BIO"><TextInput value={bio} onChangeText={setBio} maxLength={240} multiline style={[styles.input, styles.bio]} placeholder="What do you bring to the Scene?" placeholderTextColor={Colors.gray[600]} /></Field>
        <Field label="LOCATION"><TextInput value={location} onChangeText={setLocation} maxLength={100} autoCapitalize="words" style={styles.input} placeholder="City or community" placeholderTextColor={Colors.gray[600]} /></Field>
        <Field label="INTERESTS">
          <View style={styles.interests}>{INTERESTS.map(([id, label]) => {
            const selected = interests.includes(id);
            return <Pressable key={id} onPress={() => setInterests((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} style={[styles.interest, selected && styles.interestSelected]}><Text style={[styles.interestText, selected && styles.interestTextSelected]}>{label}</Text></Pressable>;
          })}</View>
        </Field>
        <Text style={styles.note}>Your name, photo, bio, and location may appear with public Moments and contributions.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  loading: { flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: Spacing.container, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  iconButton: { width: 42, height: 42, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  saveButton: { width: 42, height: 42, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.container, paddingBottom: 40 },
  avatarArea: { alignItems: 'center', paddingVertical: 26 },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 2, borderColor: Colors.primary },
  avatarFallback: { width: 104, height: 104, borderRadius: 52, borderWidth: 2, borderColor: Colors.primary, backgroundColor: Colors.gray[800], alignItems: 'center', justifyContent: 'center' },
  initials: { color: Colors.white, fontSize: 30, fontWeight: '900' },
  camera: { position: 'absolute', top: 100, marginLeft: 72, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, borderWidth: 3, borderColor: Colors.black, alignItems: 'center', justifyContent: 'center' },
  photoAction: { color: Colors.primary, fontSize: 13, fontWeight: '800', marginTop: 12 },
  field: { marginBottom: 18 },
  label: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 12, marginBottom: 8 },
  input: { minHeight: 54, color: Colors.white, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: 15, fontSize: 15 },
  bio: { minHeight: 116, paddingTop: 15, textAlignVertical: 'top' },
  note: { color: Colors.gray[500], fontSize: 12, lineHeight: 18 },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  interest: { minHeight: 42, paddingHorizontal: 13, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900], alignItems: 'center', justifyContent: 'center' },
  interestSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  interestText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  interestTextSelected: { color: Colors.black },
});
