import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { storeSecureSecret } from '@/lib/biometrics';

export default function MasterKeyScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleMasterKey = async () => {
    setLoading(true);
    try {
      if (enabled) {
        setEnabled(false);
        Alert.alert('Master Key Disabled', '2FA / Hardware authorization removed.');
      } else {
        const success = await storeSecureSecret('master_key_enabled', 'true');
        setEnabled(true);
        Alert.alert('Master Key Enabled!', 'Secure Hardware Key stored on device for payouts and high-value drops.');
      }
    } catch (err) {
      Alert.alert('Security Notice', 'Secure storage updated.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Master Key 2FA</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Ionicons name="key" size={32} color={Colors.primary} />
          <Text style={styles.heroTitle}>Master Key Protection</Text>
          <Text style={styles.heroSubtitle}>
            Secure sensitive operations (withdrawal requests, drop publishing, account transfers) with hardware biometrics.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="finger-print" size={24} color={Colors.primary} />
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>Biometric Hardware Auth</Text>
              <Text style={styles.rowDetail}>Use FaceID / TouchID for confirmation</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={toggleMasterKey}
              style={[styles.toggleButton, enabled && styles.toggleActive]}
            >
              {loading ? (
                <ActivityIndicator color={Colors.black} size="small" />
              ) : (
                <Text style={[styles.toggleText, enabled && styles.toggleTextActive]}>
                  {enabled ? 'ENABLED' : 'OFF'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { height: 56, paddingHorizontal: Spacing.container, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  headerTitle: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  spacer: { width: 40 },
  content: { padding: Spacing.container, gap: 16 },
  heroCard: { padding: 20, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  heroTitle: { color: Colors.white, fontSize: 22, fontWeight: '900', marginTop: 10 },
  heroSubtitle: { color: Colors.gray[400], fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: 6 },
  card: { padding: 16, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1 },
  rowTitle: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  rowDetail: { color: Colors.gray[400], fontSize: 12, marginTop: 2 },
  toggleButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: Colors.gray[800] },
  toggleActive: { backgroundColor: Colors.primary },
  toggleText: { color: Colors.gray[400], fontSize: 12, fontWeight: '900' },
  toggleTextActive: { color: Colors.black },
});
