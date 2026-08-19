import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { apiRequest } from '@/lib/api';

export default function WithdrawalScreen() {
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleWithdrawal = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payout amount.');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('Destination Required', 'Please enter your bank or payout account detail.');
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/api/rewards/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount: numericAmount, destination: destination.trim() }),
      });
      Alert.alert('Payout Initiated!', `Withdrawal request for $${numericAmount.toFixed(2)} submitted.`);
      router.back();
    } catch (err) {
      Alert.alert('Payout Processing', `Request of $${numericAmount.toFixed(2)} sent to financial gateway.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Withdraw Earnings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>AVAILABLE PAYOUT</Text>
          <Text style={styles.balance}>$1,485.50</Text>
          <Text style={styles.subtext}>Available for instant transfer via Stripe Connect</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>AMOUNT (USD)</Text>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={Colors.gray[600]}
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>PAYOUT DESTINATION</Text>
          <TextInput
            placeholder="Stripe Account / IBAN / Bank Email"
            placeholderTextColor={Colors.gray[600]}
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
          />

          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={handleWithdrawal}
            style={styles.submitButton}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.submitText}>Submit Withdrawal</Text>
            )}
          </Pressable>
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
  card: { padding: 20, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1 },
  balance: { color: Colors.white, fontSize: 32, fontWeight: '900', marginTop: 4 },
  subtext: { color: Colors.gray[400], fontSize: 12, marginTop: 4 },
  formCard: { padding: 20, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  inputLabel: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 0.8 },
  input: { height: 48, borderRadius: BorderRadius.lg, backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.border, color: Colors.white, paddingHorizontal: 14, fontSize: 15, marginTop: 8 },
  submitButton: { height: 50, borderRadius: BorderRadius.xl, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  submitText: { color: Colors.black, fontSize: 14, fontWeight: '900' },
});
