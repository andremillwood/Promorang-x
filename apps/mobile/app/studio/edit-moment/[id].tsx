import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';

const types = [
  ['community', 'Community', 'people'],
  ['activation', 'Activation', 'flash'],
  ['bounty', 'Action prompt', 'flag'],
  ['digital', 'Online', 'globe'],
] as const;

export default function EditMomentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<(typeof types)[number][0]>('community');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id || id.startsWith('demo')) {
        Alert.alert('Moment unavailable', 'This Moment could not be found or is no longer available.');
        setLoadFailed(true);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('moments').select('title, location, description, type').eq('id', id).maybeSingle();
      if (error || !data) {
        setLoadFailed(true);
        Alert.alert('Could not load moment', error?.message || 'Moment not found.');
      } else {
        setLoadFailed(false);
        setTitle(data.title || ''); setLocation(data.location || ''); setDescription(data.description || ''); setType((data.type as typeof type) || 'community');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const change = (setter: (value: string) => void) => (value: string) => { setter(value); setDirty(true); };
  const save = async () => {
    if (!title.trim() || !location.trim()) return Alert.alert('Missing essentials', 'Title and location are required.');
    if (!id || id.startsWith('demo')) return Alert.alert('Moment unavailable', 'This Moment could not be found or is no longer available.');
    setSaving(true);
    const { error } = await supabase.from('moments').update({ title: title.trim(), location: location.trim(), description: description.trim() || null, type }).eq('id', id);
    setSaving(false);
    if (error) return Alert.alert('Could not save changes', error.message);
    router.replace(`/studio/moment/${id}` as any);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={Colors.primary} /></View>;
  if (loadFailed) return <View style={styles.loading}><Text style={styles.unavailableTitle}>Moment unavailable</Text><Text style={styles.unavailableDetail}>This Moment could not be found or is no longer available.</Text><Pressable style={styles.unavailableAction} onPress={() => router.replace('/studio')}><Text style={styles.unavailableActionText}>Back to Studio</Text></Pressable></View>;
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Cancel editing" style={styles.close} onPress={() => router.back()}><Ionicons name="close" size={22} color={Colors.white} /></Pressable>
        <View style={styles.heading}><Text style={styles.eyebrow}>MANAGE MOMENT</Text><Text style={styles.headerTitle}>Edit details</Text></View>
        <Pressable onPress={save} disabled={saving || !dirty}><Text style={[styles.saveTop, (!dirty || saving) && styles.saveTopMuted]}>{saving ? 'Saving' : 'Save'}</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Keep the public promise clear.</Text>
        <Text style={styles.subtitle}>Changes update the discovery and detail surfaces without affecting attendance or existing contributions.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>MOMENT NAME</Text>
          <TextInput value={title} onChangeText={change(setTitle)} style={styles.titleInput} placeholderTextColor={Colors.gray[600]} maxLength={70} />
          <Text style={styles.count}>{title.length}/70</Text>
        </View>

        <Text style={styles.labelOutside}>MOMENT TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.types}>
          {types.map(([value, label, icon]) => <Pressable key={value} onPress={() => { setType(value); setDirty(true); }} style={[styles.type, type === value && styles.typeActive]}><Ionicons name={icon} size={17} color={type === value ? Colors.black : Colors.gray[300]} /><Text style={[styles.typeText, type === value && styles.typeTextActive]}>{label}</Text></Pressable>)}
        </ScrollView>

        <View style={styles.field}>
          <Text style={styles.label}>PLACE</Text>
          <View style={styles.inputRow}><Ionicons name="location" size={19} color={Colors.primary} /><TextInput value={location} onChangeText={change(setLocation)} style={styles.input} placeholder="Venue, neighborhood or online" placeholderTextColor={Colors.gray[600]} /></View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PUBLIC DESCRIPTION</Text>
          <TextInput value={description} onChangeText={change(setDescription)} style={styles.description} multiline maxLength={280} placeholder="What should people know?" placeholderTextColor={Colors.gray[600]} />
          <Text style={styles.count}>{description.length}/280</Text>
        </View>

        <View style={styles.preserved}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
          <View style={styles.preservedCopy}><Text style={styles.preservedTitle}>Existing movement stays intact</Text><Text style={styles.preservedDetail}>RSVPs, check-ins, contributions, and attribution will remain connected.</Text></View>
        </View>

        <Pressable style={[styles.saveButton, (!dirty || saving) && styles.saveButtonMuted]} onPress={save} disabled={!dirty || saving}>
          {saving ? <ActivityIndicator color={Colors.black} /> : <><Text style={styles.saveButtonText}>Save changes</Text><Ionicons name="checkmark" size={18} color={Colors.black} /></>}
        </Pressable>
        <View style={{ height: 35 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  loading: { flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center' },
  unavailableTitle: { color: Colors.white, fontSize: 18, fontWeight: '800' },
  unavailableDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7, maxWidth: 300 },
  unavailableAction: { paddingHorizontal: 15, paddingVertical: 11, borderRadius: 19, backgroundColor: Colors.primary, marginTop: 18 },
  unavailableActionText: { color: Colors.black, fontSize: 11, fontWeight: '900' },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, marginLeft: 13, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: 1 },
  headerTitle: { color: Colors.white, fontSize: 16, fontWeight: '800', marginTop: 2 },
  saveTop: { color: Colors.primary, fontSize: 12, fontWeight: '800' },
  saveTopMuted: { color: Colors.gray[600] },
  content: { paddingHorizontal: Spacing.container, paddingTop: 23 },
  title: { color: Colors.white, fontSize: Typography.sizes['2xl'], fontWeight: '800', letterSpacing: -.7 },
  subtitle: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 340 },
  field: { padding: 15, marginTop: 17, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  label: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .8 },
  labelOutside: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .8, marginTop: 20, marginBottom: 9 },
  titleInput: { color: Colors.white, fontSize: 20, fontWeight: '700', paddingTop: 12, paddingBottom: 5 },
  count: { color: Colors.gray[600], fontSize: 9, textAlign: 'right', marginTop: 4 },
  types: { gap: 8 },
  type: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 19, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  typeActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { color: Colors.gray[300], fontSize: 10, fontWeight: '700' },
  typeTextActive: { color: Colors.black },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8, backgroundColor: 'transparent' },
  input: { color: Colors.white, fontSize: 14, flex: 1, paddingVertical: 6 },
  description: { color: Colors.white, fontSize: 14, lineHeight: 20, minHeight: 100, textAlignVertical: 'top', paddingTop: 11 },
  preserved: { flexDirection: 'row', gap: 10, padding: 14, marginTop: 13, borderRadius: BorderRadius.xl, backgroundColor: 'rgba(103,197,135,.08)', borderWidth: 1, borderColor: 'rgba(103,197,135,.2)' },
  preservedCopy: { flex: 1, backgroundColor: 'transparent' },
  preservedTitle: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  preservedDetail: { color: Colors.gray[400], fontSize: 9, lineHeight: 14, marginTop: 3 },
  saveButton: { height: 52, borderRadius: 17, marginTop: 17, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  saveButtonMuted: { opacity: .45 },
  saveButtonText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
});
