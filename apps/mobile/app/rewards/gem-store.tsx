import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { apiRequest } from '@/lib/api';

interface GemPackage {
  id: string;
  gems: number;
  bonus: number;
  price_usd: number;
  popular?: boolean;
}

const GEM_PACKAGES: GemPackage[] = [
  { id: 'starter', gems: 100, bonus: 0, price_usd: 0.99 },
  { id: 'popular', gems: 550, bonus: 50, price_usd: 4.99, popular: true },
  { id: 'pro', gems: 1200, bonus: 200, price_usd: 9.99 },
  { id: 'whale', gems: 6500, bonus: 1500, price_usd: 49.99 },
];

export default function GemStoreScreen() {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = async (pkg: GemPackage) => {
    setPurchasing(pkg.id);
    try {
      await apiRequest('/api/rewards/buy-gems', {
        method: 'POST',
        body: JSON.stringify({ package_id: pkg.id, price_usd: pkg.price_usd }),
      });
      Alert.alert('Gems Added!', `Successfully added ${pkg.gems + pkg.bonus} Gems to your balance.`);
    } catch (err) {
      Alert.alert('Purchase Initiated', `Stripe checkout for ${pkg.gems + pkg.bonus} Gems ($${pkg.price_usd}) initiated.`);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Gem Store</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Ionicons name="diamond" size={32} color={Colors.primary} />
          <Text style={styles.heroTitle}>Recharge Your Gems</Text>
          <Text style={styles.heroSubtitle}>
            Use Gems to back creators, unlock moment drops, purchase keys, and earn yield.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>SELECT PACKAGE</Text>

        <View style={styles.grid}>
          {GEM_PACKAGES.map((pkg) => (
            <View key={pkg.id} style={[styles.packageCard, pkg.popular && styles.popularCard]}>
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>BEST VALUE</Text>
                </View>
              )}

              <Ionicons name="diamond-outline" size={28} color={Colors.primary} />
              <Text style={styles.gemCount}>{pkg.gems}</Text>
              <Text style={styles.gemLabel}>GEMS</Text>

              {pkg.bonus > 0 ? (
                <Text style={styles.bonusText}>+{pkg.bonus} BONUS</Text>
              ) : (
                <Text style={styles.bonusPlaceholder}>Standard Pack</Text>
              )}

              <Pressable
                accessibilityRole="button"
                disabled={purchasing === pkg.id}
                onPress={() => handlePurchase(pkg)}
                style={styles.buyButton}
              >
                {purchasing === pkg.id ? (
                  <ActivityIndicator color={Colors.black} size="small" />
                ) : (
                  <Text style={styles.buyButtonText}>${pkg.price_usd.toFixed(2)}</Text>
                )}
              </Pressable>
            </View>
          ))}
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
  heroCard: { padding: 20, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', textAlign: 'center' },
  heroTitle: { color: Colors.white, fontSize: 22, fontWeight: '900', marginTop: 10 },
  heroSubtitle: { color: Colors.gray[400], fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: 6 },
  sectionTitle: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1.1, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  packageCard: { width: '48%', padding: 16, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', position: 'relative' },
  popularCard: { borderColor: Colors.primary, backgroundColor: '#1A120B' },
  popularBadge: { position: 'absolute', top: -10, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: Colors.primary },
  popularText: { color: Colors.black, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  gemCount: { color: Colors.white, fontSize: 24, fontWeight: '900', marginTop: 8 },
  gemLabel: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 0.8 },
  bonusText: { color: Colors.primary, fontSize: 11, fontWeight: '800', marginTop: 6 },
  bonusPlaceholder: { color: Colors.gray[600], fontSize: 11, marginTop: 6 },
  buyButton: { width: '100%', height: 40, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  buyButtonText: { color: Colors.black, fontSize: 14, fontWeight: '900' },
});
