import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { safetyApi } from '@/lib/api';

const reasons = [
  ['spam', 'Spam or misleading'],
  ['harassment', 'Harassment or bullying'],
  ['hate', 'Hate or hateful conduct'],
  ['nudity', 'Nudity or sexual content'],
  ['violence', 'Violence or threats'],
  ['dangerous', 'Dangerous or illegal activity'],
  ['fraud', 'Fraud or impersonation'],
  ['intellectual_property', 'Intellectual property'],
  ['other', 'Something else'],
] as const;

type Reason = (typeof reasons)[number][0];

export default function ReportScreen() {
  const params = useLocalSearchParams<{ targetType?: string; targetId?: string; reportedUserId?: string; title?: string }>();
  const [reason, setReason] = useState<Reason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason || !params.targetId || !params.targetType) return;
    setSubmitting(true);
    try {
      const targetType = ['moment', 'content', 'product', 'offer', 'piece', 'user'].includes(params.targetType) ? params.targetType as any : 'content';
      const reportedUserId = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(params.reportedUserId || '') ? params.reportedUserId : null;
      await safetyApi.report({ target_type: targetType, target_id: params.targetId, reported_user_id: reportedUserId, reason, details: details.trim() || null });
      Alert.alert('Report received', 'Thank you. Our moderation team will review it and take appropriate action.', [{ text: 'Done', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Report not submitted', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return <SafeAreaView style={styles.screen}><View style={styles.header}><Pressable accessibilityLabel="Close report" onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={22} color={Colors.white} /></Pressable><Text style={styles.headerTitle}>Report content</Text><View style={styles.spacer} /></View><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>HELP KEEP PROMORANG SAFE</Text><Text style={styles.title}>What is wrong with this?</Text><Text style={styles.subtitle} numberOfLines={2}>{params.title || 'Reported content'}</Text><View style={styles.reasons}>{reasons.map(([id, label]) => <Pressable key={id} onPress={() => setReason(id)} style={[styles.reason, reason === id && styles.reasonActive]}><Text style={[styles.reasonText, reason === id && styles.reasonTextActive]}>{label}</Text><Ionicons name={reason === id ? 'checkmark-circle' : 'ellipse-outline'} size={19} color={reason === id ? Colors.primary : Colors.gray[600]} /></Pressable>)}</View><Text style={styles.label}>ADDITIONAL DETAILS · OPTIONAL</Text><TextInput value={details} onChangeText={setDetails} multiline maxLength={1000} placeholder="Add context that will help the review team." placeholderTextColor={Colors.gray[600]} style={styles.input} /><Text style={styles.note}>Reports are confidential. False or abusive reports may be actioned under the Terms of Service.</Text><Pressable disabled={!reason || submitting} onPress={submit} style={[styles.submit, (!reason || submitting) && styles.disabled]}>{submitting ? <ActivityIndicator color={Colors.black} /> : <><Text style={styles.submitText}>Submit report</Text><Ionicons name="shield-checkmark" size={18} color={Colors.black} /></>}</Pressable></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black }, header: { height: 58, paddingHorizontal: Spacing.container, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray[900] }, headerTitle: { color: Colors.white, fontSize: 15, fontWeight: '800' }, spacer: { width: 40 }, content: { padding: Spacing.container, paddingBottom: 50 }, eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1 }, title: { color: Colors.white, fontSize: 27, fontWeight: '900', marginTop: 6 }, subtitle: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 5 }, reasons: { marginTop: 21, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border }, reason: { minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.gray[900], borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border }, reasonActive: { backgroundColor: Colors.ambientWash }, reasonText: { color: Colors.gray[300], fontSize: 12, fontWeight: '700' }, reasonTextActive: { color: Colors.white }, label: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1, marginTop: 22, marginBottom: 8 }, input: { minHeight: 105, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900], color: Colors.white, padding: 14, fontSize: 12, textAlignVertical: 'top' }, note: { color: Colors.gray[600], fontSize: 9, lineHeight: 14, marginTop: 8 }, submit: { height: 54, borderRadius: 99, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 22 }, submitText: { color: Colors.black, fontSize: 12, fontWeight: '900' }, disabled: { opacity: .45 },
});
