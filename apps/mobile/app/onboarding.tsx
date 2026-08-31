import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { supabase } from '@/lib/supabase';

const ROLES: Array<{ id: Exclude<UserRole, 'admin'>; title: string; detail: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = [
  { id: 'participant', title: 'I go out', detail: 'Find a night, a room, or a crowd worth showing up for.', icon: 'people' },
  { id: 'host', title: 'I have a place', detail: 'A bar, venue, or night. Put tonight where people can join.', icon: 'calendar' },
  { id: 'merchant', title: 'I run a shop', detail: 'Turn nearby attention into visits at your door.', icon: 'storefront' },
  { id: 'creator', title: 'I make the story', detail: 'Point people at a night they can join.', icon: 'camera' },
  { id: 'brand', title: 'I am a brand', detail: 'Connect spend to people who actually show up.', icon: 'business' },
  { id: 'agency', title: 'Agency', detail: 'Coordinate activations across clients.', icon: 'layers' },
];

const INTERESTS = [
  ['social', 'Social'], ['food', 'Food & drink'], ['fitness', 'Wellness'], ['music', 'Music'],
  ['arts', 'Arts & culture'], ['outdoor', 'Outdoors'], ['networking', 'Networking'], ['workshop', 'Learning'],
] as const;

export default function OnboardingScreen() {
  const { user, chooseRole } = useAuth();
  const { markCompleted } = useOnboarding();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || '');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('participant');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const canContinue = useMemo(() => step === 0 ? name.trim().length >= 2 : step === 1 ? Boolean(role) : interests.length > 0, [step, name, role, interests]);

  const toggleInterest = (id: string) => {
    setInterests((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const cleanName = name.trim();
      const roleResult = await chooseRole(role);
      if (roleResult.error) throw roleResult.error;

      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        full_name: cleanName,
        location: city.trim() || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (profileError) throw profileError;

      const { error: preferencesError } = await supabase.rpc('upsert_user_preferences', {
        p_user_id: user.id,
        p_age_range: null,
        p_gender: null,
        p_city: city.trim() || null,
        p_state: null,
        p_country: 'JM',
        p_latitude: null,
        p_longitude: null,
        p_location_radius_km: 25,
        p_location_sharing_enabled: false,
        p_lifestyle_tags: [],
        p_preferred_categories: interests,
        p_preferred_times: [],
        p_notification_enabled: true,
        p_email_digest_frequency: 'weekly',
      });
      if (preferencesError) throw preferencesError;

      try {
        const { error: authError } = await supabase.auth.updateUser({ data: { full_name: cleanName, name: cleanName } });
        if (authError) console.warn('[Onboarding] Non-fatal auth metadata update error:', authError.message);
      } catch (e) {
        console.warn('[Onboarding] Non-fatal auth metadata update exception:', e);
      }

      await markCompleted();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Could not finish setup', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topbar}>
        <View style={styles.brand}><View style={styles.brandMark}><Ionicons name="sparkles" size={17} color={Colors.black} /></View><Text style={styles.brandText}>PROMORANG</Text></View>
        <Text style={styles.counter}>{step + 1} OF 3</Text>
      </View>
      <View style={styles.progress}><View style={[styles.progressFill, { width: `${((step + 1) / 3) * 100}%` }]} /></View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 && <>
          <Text style={styles.eyebrow}>MAKE IT YOURS</Text>
          <Text style={styles.title}>What should the Scene call you?</Text>
          <Text style={styles.subtitle}>This is how your contributions and Moments will be recognized.</Text>
          <Text style={styles.label}>YOUR NAME</Text>
          <TextInput autoFocus value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={Colors.gray[600]} style={styles.input} autoCapitalize="words" />
          <Text style={styles.label}>CITY · OPTIONAL</Text>
          <TextInput value={city} onChangeText={setCity} placeholder="Kingston" placeholderTextColor={Colors.gray[600]} style={styles.input} autoCapitalize="words" />
        </>}

        {step === 1 && <>
          <Text style={styles.eyebrow}>CHOOSE YOUR STARTING POINT</Text>
          <Text style={styles.title}>Do you have a place, or are you going out?</Text>
          <Text style={styles.subtitle}>If you run a bar or night, pick I have a place. You can add other roles later.</Text>
          <View style={styles.roleList}>{ROLES.map((item) => {
            const selected = role === item.id;
            return <Pressable key={item.id} onPress={() => setRole(item.id)} style={[styles.roleCard, selected && styles.selectedCard]}>
              <View style={[styles.roleIcon, selected && styles.selectedIcon]}><Ionicons name={item.icon} size={21} color={selected ? Colors.black : Colors.primary} /></View>
              <View style={styles.roleCopy}><Text style={styles.roleTitle}>{item.title}</Text><Text style={styles.roleDetail}>{item.detail}</Text></View>
              <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={selected ? Colors.primary : Colors.gray[600]} />
            </Pressable>;
          })}</View>
        </>}

        {step === 2 && <>
          <Text style={styles.eyebrow}>TUNE YOUR DISCOVERY</Text>
          <Text style={styles.title}>What pulls you out into the world?</Text>
          <Text style={styles.subtitle}>Choose at least one. These shape what appears first, and you can change them later.</Text>
          <View style={styles.interests}>{INTERESTS.map(([id, label]) => {
            const selected = interests.includes(id);
            return <Pressable key={id} onPress={() => toggleInterest(id)} style={[styles.interest, selected && styles.interestSelected]}><Text style={[styles.interestText, selected && styles.interestTextSelected]}>{label}</Text>{selected && <Ionicons name="checkmark" size={16} color={Colors.black} />}</Pressable>;
          })}</View>
        </>}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 ? <Pressable accessibilityLabel="Previous onboarding step" onPress={() => setStep((value) => value - 1)} style={styles.back}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable> : <View style={styles.backPlaceholder} />}
        <Pressable disabled={!canContinue || saving} onPress={() => step < 2 ? setStep((value) => value + 1) : void finish()} style={[styles.continue, (!canContinue || saving) && styles.disabled]}>
          {saving ? <ActivityIndicator color={Colors.black} /> : <><Text style={styles.continueText}>{step === 2 ? 'Enter Promorang' : 'Continue'}</Text><Ionicons name="arrow-forward" size={19} color={Colors.black} /></>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  topbar: { paddingHorizontal: Spacing.container, paddingTop: Platform.OS === 'android' ? 10 : 4, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 30, height: 30, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.sm },
  brandText: { color: Colors.white, fontSize: 13, fontWeight: '900' },
  counter: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12 },
  progress: { height: 2, backgroundColor: Colors.gray[800] },
  progressFill: { height: 2, backgroundColor: Colors.primary },
  content: { padding: Spacing.container, paddingTop: 38, paddingBottom: 28 },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, marginBottom: 12 },
  title: { color: Colors.white, fontSize: 32, lineHeight: 38, fontWeight: '900', maxWidth: 340 },
  subtitle: { color: Colors.gray[400], fontSize: 15, lineHeight: 22, marginTop: 12, marginBottom: 30, maxWidth: 360 },
  label: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 12, marginBottom: 8, marginTop: 12 },
  input: { color: Colors.white, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: 15, minHeight: 54, fontSize: 16, marginBottom: 8 },
  roleList: { gap: 10 },
  roleCard: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, backgroundColor: Colors.gray[900], borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  selectedCard: { borderColor: Colors.primary, backgroundColor: Colors.ambientWash },
  roleIcon: { width: 45, height: 45, borderRadius: BorderRadius.md, backgroundColor: Colors.gray[800], alignItems: 'center', justifyContent: 'center' },
  selectedIcon: { backgroundColor: Colors.primary },
  roleCopy: { flex: 1 },
  roleTitle: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  roleDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 17, marginTop: 3 },
  interests: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  interest: { minHeight: 48, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  interestSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  interestText: { color: Colors.white, fontSize: 14, fontWeight: '700' },
  interestTextSelected: { color: Colors.black },
  footer: { paddingHorizontal: Spacing.container, paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.black },
  back: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  backPlaceholder: { width: 52 },
  continue: { flex: 1, height: 52, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  continueText: { color: Colors.black, fontSize: 15, fontWeight: '900' },
  disabled: { opacity: 0.4 },
});
