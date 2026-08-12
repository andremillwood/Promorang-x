import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { privacyApi, WEB_BASE } from '@/lib/api';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { permissionStatus, enableNotifications } = useNotifications();
  const [deleting, setDeleting] = useState(false);
  const [enablingNotifications, setEnablingNotifications] = useState(false);

  const requestDeletion = () => {
    Alert.alert(
      'Delete your Promorang account?',
      'This requests deletion of your account, profile, uploaded content, and associated personal data. Records that must be retained for fraud prevention, payments, tax, or other legal obligations may be kept only as required.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => Alert.alert(
            'Final confirmation',
            `Submit a deletion request for ${user?.email || 'this account'}? Processing may take up to 30 days.`,
            [
              { text: 'Keep account', style: 'cancel' },
              {
                text: 'Request deletion',
                style: 'destructive',
                onPress: async () => {
                  setDeleting(true);
                  try {
                    const result = await privacyApi.requestAccountDeletion();
                    await signOut();
                    Alert.alert('Request received', result.message, [{ text: 'OK', onPress: () => router.replace('/auth/login') }]);
                  } catch (error) {
                    Alert.alert('Request not submitted', error instanceof Error ? error.message : 'Please try again.');
                  } finally {
                    setDeleting(false);
                  }
                },
              },
            ]
          ),
        },
      ]
    );
  };

  const turnOnNotifications = async () => {
    setEnablingNotifications(true);
    const result = await enableNotifications();
    setEnablingNotifications(false);
    Alert.alert(result.enabled ? 'Notifications enabled' : 'Notifications not enabled', result.enabled ? 'Promorang can now send account and Moment updates.' : result.error || 'Check your device settings.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
        <Text style={styles.headerTitle}>Settings & privacy</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>ACCOUNT</Text>
        <View style={styles.card}>
          <SettingRow icon="mail" title="Signed-in email" detail={user?.email || 'No email available'} />
          <SettingRow icon="notifications" title="Notifications" detail={permissionStatus === 'granted' ? 'Enabled' : 'Off until you choose to enable them'} action={permissionStatus === 'granted' ? undefined : turnOnNotifications} actionLabel={enablingNotifications ? 'Enabling…' : 'Enable'} loading={enablingNotifications} />
        </View>

        <Text style={styles.eyebrow}>PRIVACY & SAFETY</Text>
        <View style={styles.card}>
          <LinkRow icon="shield-checkmark" title="Privacy Policy" url={`${WEB_BASE}/privacy`} />
          <LinkRow icon="document-text" title="Terms of Service" url={`${WEB_BASE}/terms`} />
          <LinkRow icon="people" title="Community conduct" url={`${WEB_BASE}/terms#conduct`} />
          <LinkRow icon="help-circle" title="Contact support" url="mailto:support@promorang.co" />
          <LinkRow icon="globe" title="Account deletion webpage" url={`${WEB_BASE}/account-deletion`} />
        </View>

        <Text style={styles.eyebrow}>YOUR DATA</Text>
        <View style={styles.dangerCard}>
          <View style={styles.dangerIcon}><Ionicons name="trash" size={20} color={Colors.error} /></View>
          <View style={styles.dangerCopy}><Text style={styles.dangerTitle}>Delete account and data</Text><Text style={styles.dangerDetail}>Initiate deletion without emailing or calling support.</Text></View>
          <Pressable accessibilityRole="button" disabled={deleting} onPress={requestDeletion} style={styles.deleteButton}>{deleting ? <ActivityIndicator size="small" color={Colors.error} /> : <Text style={styles.deleteText}>Delete</Text>}</Pressable>
        </View>
        <Text style={styles.retention}>Deletion includes shared user-generated content unless retention is required by law. Promorang will confirm completion using your account email.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ icon, title, detail, action, actionLabel, loading }: { icon: any; title: string; detail: string; action?: () => void; actionLabel?: string; loading?: boolean }) {
  return <View style={styles.row}><View style={styles.rowIcon}><Ionicons name={icon} size={18} color={Colors.primary} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowDetail}>{detail}</Text></View>{action ? <Pressable disabled={loading} onPress={action} style={styles.rowAction}><Text style={styles.rowActionText}>{actionLabel}</Text></Pressable> : null}</View>;
}

function LinkRow({ icon, title, url }: { icon: any; title: string; url: string }) {
  return <Pressable accessibilityRole="link" onPress={() => Linking.openURL(url)} style={styles.row}><View style={styles.rowIcon}><Ionicons name={icon} size={18} color={Colors.primary} /></View><Text style={[styles.rowTitle, styles.rowCopy]}>{title}</Text><Ionicons name="open-outline" size={17} color={Colors.gray[500]} /></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { height: 58, paddingHorizontal: Spacing.container, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  headerTitle: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  headerSpacer: { width: 40 },
  content: { padding: Spacing.container, paddingBottom: 54 },
  eyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1.1, marginTop: 20, marginBottom: 9 },
  card: { borderRadius: BorderRadius.xl, overflow: 'hidden', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  row: { minHeight: 62, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash },
  rowCopy: { flex: 1 },
  rowTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  rowDetail: { color: Colors.gray[500], fontSize: 12, lineHeight: 15, marginTop: 2 },
  rowAction: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99, backgroundColor: Colors.ambientWash },
  rowActionText: { color: Colors.primary, fontSize: 12, fontWeight: '900' },
  dangerCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14, borderRadius: BorderRadius.xl, backgroundColor: 'rgba(239,68,68,.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,.25)' },
  dangerIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,.12)' },
  dangerCopy: { flex: 1 },
  dangerTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  dangerDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 14, marginTop: 2 },
  deleteButton: { minWidth: 62, alignItems: 'center', paddingVertical: 9, paddingHorizontal: 11, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(239,68,68,.35)' },
  deleteText: { color: Colors.error, fontSize: 12, fontWeight: '900' },
  retention: { color: Colors.gray[600], fontSize: 12, lineHeight: 14, marginTop: 9 },
});
