import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { apiRequest } from '@/lib/api';

interface StakingPool {
  id: string;
  name: string;
  apy: number;
  min_amount: number;
  duration_days: number;
  total_staked: number;
}

const DEMO_POOLS: StakingPool[] = [
  { id: '1', name: 'Creator Momentum Pool', apy: 14.5, min_amount: 100, duration_days: 30, total_staked: 250000 },
  { id: '2', name: 'Moment Yield Accelerator', apy: 22.0, min_amount: 500, duration_days: 90, total_staked: 890000 },
  { id: '3', name: 'Governance Vault', apy: 35.0, min_amount: 2500, duration_days: 180, total_staked: 3400000 },
];

export default function StakingScreen() {
  const [selectedPool, setSelectedPool] = useState<StakingPool>(DEMO_POOLS[0]);
  const [staking, setStaking] = useState(false);

  const handleStake = async () => {
    setStaking(true);
    try {
      await apiRequest('/api/rewards/stake', {
        method: 'POST',
        body: JSON.stringify({ pool_id: selectedPool.id, amount: selectedPool.min_amount }),
      });
      Alert.alert('Staking Successful!', `You have staked ${selectedPool.min_amount} Gems in ${selectedPool.name}.`);
    } catch (err) {
      Alert.alert('Staking Submitted', `Simulated stake of ${selectedPool.min_amount} Gems in ${selectedPool.name}.`);
    } finally {
      setStaking(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Staking Pools</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>REWARDS ENGINE</Text>
          <Text style={styles.heroTitle}>Stake Gems & Earn APY Yield</Text>
          <Text style={styles.heroSubtitle}>
            Lock your Gems in active creator pools to maximize yield and boost platform governance voting weight.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>AVAILABLE VAULTS</Text>

        {DEMO_POOLS.map((pool) => {
          const isSelected = selectedPool.id === pool.id;
          return (
            <Pressable
              key={pool.id}
              onPress={() => setSelectedPool(pool)}
              style={[styles.poolCard, isSelected && styles.poolCardSelected]}
            >
              <View style={styles.poolHeader}>
                <Text style={styles.poolName}>{pool.name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pool.apy}% APY</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>LOCK PERIOD</Text>
                  <Text style={styles.statValue}>{pool.duration_days} Days</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>MINIMUM STAKE</Text>
                  <Text style={styles.statValue}>{pool.min_amount} Gems</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>TOTAL POOL</Text>
                  <Text style={styles.statValue}>{(pool.total_staked / 1000).toFixed(0)}k Gems</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          disabled={staking}
          onPress={handleStake}
          style={styles.stakeButton}
        >
          {staking ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <Text style={styles.stakeButtonText}>
              Stake {selectedPool.min_amount} Gems ({selectedPool.apy}% APY)
            </Text>
          )}
        </Pressable>
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
  heroCard: { padding: 20, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1 },
  heroTitle: { color: Colors.white, fontSize: 22, fontWeight: '900', marginTop: 4 },
  heroSubtitle: { color: Colors.gray[400], fontSize: 13, lineHeight: 18, marginTop: 8 },
  sectionTitle: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1.1, marginTop: 8 },
  poolCard: { padding: 16, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  poolCardSelected: { borderColor: Colors.primary, backgroundColor: '#1A120B' },
  poolHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  poolName: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: Colors.ambientWash },
  badgeText: { color: Colors.primary, fontSize: 12, fontWeight: '900' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  stat: { gap: 2 },
  statLabel: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10 },
  statValue: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  stakeButton: { height: 50, borderRadius: BorderRadius.xl, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  stakeButtonText: { color: Colors.black, fontSize: 14, fontWeight: '900' },
});
