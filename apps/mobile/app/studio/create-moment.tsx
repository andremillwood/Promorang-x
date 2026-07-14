import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const types = [
  ['community', 'Community', 'people'],
  ['activation', 'Activation', 'flash'],
  ['bounty', 'Action prompt', 'flag'],
  ['digital', 'Online', 'globe'],
] as const;

export default function CreateMomentScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<(typeof types)[number][0]>('community');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = async () => {
    if (!title.trim() || !location.trim()) {
      Alert.alert('Moment needs a shape', 'Add a title and location before publishing.');
      return;
    }
    if (!user) return Alert.alert('Sign in required', 'Sign in to publish a moment.');
    setPublishing(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase.from('moments').insert({
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim(),
        type,
        status: 'active',
        organizer_id: user.id,
      }).select('id').single();
      if (insertError) throw insertError;
      router.replace(`/moment/${data.id}` as any);
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Could not publish this moment.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Close" style={styles.close} onPress={() => router.back()}><Ionicons name="close" size={22} color={Colors.white} /></Pressable>
        <View style={styles.heading}><Text style={styles.eyebrow}>STUDIO</Text><Text style={styles.headerTitle}>Create moment</Text></View>
        <Text style={styles.step}>1 OF 1</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Give people one clear reason to move.</Text>
        <Text style={styles.subtitle}>Start with the decision-making essentials. You can add tickets, rewards and collaborators after publishing.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>MOMENT NAME</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Sunset Sessions" placeholderTextColor={Colors.gray[600]} style={styles.titleInput} maxLength={70} />
          <Text style={styles.count}>{title.length}/70</Text>
        </View>

        <Text style={styles.labelOutside}>WHAT KIND OF MOVEMENT?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.types}>
          {types.map(([id, label, icon]) => (
            <Pressable key={id} style={[styles.type, type === id && styles.typeActive]} onPress={() => setType(id)}>
              <Ionicons name={icon} size={18} color={type === id ? Colors.black : Colors.gray[300]} />
              <Text style={[styles.typeText, type === id && styles.typeTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.field}>
          <Text style={styles.label}>PLACE</Text>
          <View style={styles.inputRow}><Ionicons name="location" size={19} color={Colors.primary} /><TextInput value={location} onChangeText={setLocation} placeholder="Venue, neighborhood or online" placeholderTextColor={Colors.gray[600]} style={styles.input} /></View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>WHY IT MATTERS</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="What will happen, who is it for, and why should they show up?" placeholderTextColor={Colors.gray[600]} style={styles.description} multiline maxLength={280} />
          <Text style={styles.count}>{description.length}/280</Text>
        </View>

        <View style={styles.timing}>
          <View style={styles.timingIcon}><Ionicons name="calendar" size={20} color={Colors.primary} /></View>
          <View style={styles.timingCopy}><Text style={styles.timingTitle}>Timing and access</Text><Text style={styles.timingDetail}>Publishing creates the moment now. Add schedule, capacity and tickets from Manage.</Text></View>
          <Ionicons name="chevron-forward" size={19} color={Colors.gray[500]} />
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewEyebrow}>LIVE PREVIEW</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewVisual}><Ionicons name={types.find(([id]) => id === type)?.[2] || 'people'} size={31} color={Colors.primary} /></View>
            <View style={styles.previewCopy}><Text style={styles.previewType}>{type.toUpperCase()} · NEW</Text><Text style={styles.previewTitle} numberOfLines={1}>{title || 'Your moment name'}</Text><Text style={styles.previewLocation} numberOfLines={1}>{location || 'Add a place'}</Text></View>
          </View>
        </View>

        {error && <View style={styles.error}><Ionicons name="alert-circle" size={18} color={Colors.error} /><Text style={styles.errorText}>{error}</Text></View>}
        <Pressable style={[styles.publish, publishing && styles.publishMuted]} onPress={publish} disabled={publishing}>
          {publishing ? <><ActivityIndicator size="small" color={Colors.black} /><Text style={styles.publishText}>Publishing…</Text></> : <><Text style={styles.publishText}>Publish moment</Text><Ionicons name="arrow-forward" size={18} color={Colors.black} /></>}
        </Pressable>
        <Text style={styles.note}>The moment will be visible immediately. You can pause it from Studio.</Text>
        <View style={{ height: 35 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, marginLeft: 13, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: 1 },
  headerTitle: { color: Colors.white, fontSize: 16, fontWeight: '800', marginTop: 2 },
  step: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9 },
  content: { paddingHorizontal: Spacing.container, paddingTop: 24 },
  title: { color: Colors.white, fontSize: Typography.sizes['2xl'], lineHeight: 31, fontWeight: '800', letterSpacing: -.7, maxWidth: 330 },
  subtitle: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 8, maxWidth: 340 },
  field: { padding: 15, marginTop: 17, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  label: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .8 },
  labelOutside: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .8, marginTop: 20, marginBottom: 9 },
  titleInput: { color: Colors.white, fontSize: 20, fontWeight: '700', paddingTop: 12, paddingBottom: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8, backgroundColor: 'transparent' },
  input: { color: Colors.white, fontSize: 14, flex: 1, paddingVertical: 6 },
  description: { color: Colors.white, fontSize: 14, lineHeight: 20, minHeight: 90, textAlignVertical: 'top', paddingTop: 11 },
  count: { color: Colors.gray[600], fontSize: 9, textAlign: 'right', marginTop: 4 },
  types: { gap: 8 },
  type: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 19, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  typeActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { color: Colors.gray[300], fontSize: 10, fontWeight: '700' },
  typeTextActive: { color: Colors.black },
  timing: { flexDirection: 'row', alignItems: 'center', padding: 14, marginTop: 13, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  timingIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  timingCopy: { flex: 1, backgroundColor: 'transparent' },
  timingTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  timingDetail: { color: Colors.gray[500], fontSize: 9, lineHeight: 14, marginTop: 3, paddingRight: 8 },
  preview: { marginTop: 22, backgroundColor: 'transparent' },
  previewEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .8, marginBottom: 9 },
  previewCard: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' },
  previewVisual: { width: 67, height: 67, borderRadius: 17, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  previewCopy: { flex: 1, backgroundColor: 'transparent' },
  previewType: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .6 },
  previewTitle: { color: Colors.white, fontSize: 15, fontWeight: '800', marginTop: 5 },
  previewLocation: { color: Colors.gray[400], fontSize: 10, marginTop: 4 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, marginTop: 13, borderRadius: BorderRadius.lg, backgroundColor: 'rgba(239,98,91,.10)', borderWidth: 1, borderColor: 'rgba(239,98,91,.28)' },
  errorText: { color: Colors.gray[200], fontSize: 10, flex: 1 },
  publish: { height: 52, marginTop: 17, borderRadius: 17, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  publishMuted: { opacity: .55 },
  publishText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
  note: { color: Colors.gray[600], fontSize: 9, textAlign: 'center', marginTop: 10 },
});
