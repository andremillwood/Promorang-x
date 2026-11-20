import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sanitizeCompleteProfileNext, searchIsoCountries, validateSignupEligibility, isoCountryByCode } from '@promorang/shared';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Same route as web: /complete-profile?next=<path>
 * Saves public.users.dob and profiles.country_code (ISO-2) for the signed-in account,
 * then returns to `next`.
 */
export default function CompleteProfileScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ next?: string }>();
  const next = sanitizeCompleteProfileNext(typeof params.next === 'string' ? params.next : null);
  const [countryQuery, setCountryQuery] = useState('');
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [dob, setDob] = useState('');
  const [saving, setSaving] = useState(false);
  const matches = useMemo(() => searchIsoCountries(countryQuery), [countryQuery]);
  const selected = isoCountryByCode(countryCode);
  const ready = validateSignupEligibility({ countryCode, dob }) === null;

  const finish = async () => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    const gate = validateSignupEligibility({ countryCode, dob });
    if (gate === 'UNDERAGE') {
      Alert.alert('18 or older', 'You need to be 18 or older to join PromoRang.');
      return;
    }
    if (gate) {
      Alert.alert('Almost there', gate === 'DOB_REQUIRED' || gate === 'INVALID_DOB' ? 'Enter your date of birth.' : 'Choose your country.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.rpc('record_signup_eligibility', {
        p_country_code: countryCode,
        p_dob: dob,
        p_source: 'user_confirmed',
      });
      if (error && !/schema cache|could not find the function|PGRST202/i.test(error.message)) {
        if (error.message.includes('UNDERAGE')) {
          Alert.alert('18 or older', 'You need to be 18 or older to join PromoRang.');
          return;
        }
        throw new Error(error.message);
      }
      router.replace(next || '/(tabs)');
    } catch (error) {
      Alert.alert('Could not save', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.title}>Country and birthday</Text>
        <Text style={styles.subtitle}>Choose the country you call home. Nothing is selected for you. PromoRang is 18+.</Text>
        <Text style={styles.label}>HOME COUNTRY</Text>
        <TextInput
          value={countryQuery}
          onChangeText={(value) => {
            setCountryQuery(value);
            if (selected && value !== selected.name) setCountryCode(null);
          }}
          placeholder="Search countries"
          placeholderTextColor={Colors.gray[600]}
          style={styles.input}
          autoCapitalize="words"
        />
        {selected ? <Text style={styles.selected}>{selected.name} · {selected.code}</Text> : null}
        <View style={styles.list}>
          {matches.map((country) => {
            const active = country.code === countryCode;
            return (
              <Pressable key={country.code} onPress={() => { setCountryCode(country.code); setCountryQuery(country.name); }} style={[styles.row, active && styles.rowOn]}>
                <Text style={[styles.rowText, active && styles.rowTextOn]}>{country.name}</Text>
                <Text style={[styles.code, active && styles.rowTextOn]}>{country.code}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.label}>DATE OF BIRTH</Text>
        <TextInput
          value={dob}
          onChangeText={setDob}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.gray[600]}
          style={styles.input}
          autoCapitalize="none"
        />
        <Pressable disabled={!ready || saving} onPress={() => void finish()} style={[styles.save, (!ready || saving) && styles.disabled]}>
          {saving ? <ActivityIndicator color={Colors.black} /> : <><Text style={styles.saveText}>Save</Text><Ionicons name="arrow-forward" size={18} color={Colors.black} /></>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { padding: Spacing.container, paddingTop: 36, paddingBottom: 40 },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, marginBottom: 12 },
  title: { color: Colors.white, fontSize: 32, lineHeight: 38, fontWeight: '900' },
  subtitle: { color: Colors.gray[400], fontSize: 15, lineHeight: 22, marginTop: 12, marginBottom: 24 },
  label: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 12, marginBottom: 8, marginTop: 12 },
  input: { color: Colors.white, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: 15, minHeight: 54, fontSize: 16 },
  selected: { color: Colors.primary, fontWeight: '800', marginTop: 8 },
  list: { gap: 8, marginTop: 10 },
  row: { minHeight: 48, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  rowOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  rowText: { color: Colors.white, fontWeight: '700' },
  rowTextOn: { color: Colors.black },
  code: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 12 },
  save: { marginTop: 24, height: 52, borderRadius: BorderRadius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  saveText: { color: Colors.black, fontSize: 15, fontWeight: '900' },
  disabled: { opacity: 0.4 },
});
