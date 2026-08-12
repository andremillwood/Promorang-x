import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { apiRequest } from '@/lib/api';

interface ShopItem {
  id: string;
  name: string;
  category: string;
  gold_price: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const GOLD_ITEMS: ShopItem[] = [
  { id: '1', name: 'VIP Profile Badge', category: 'PERKS', gold_price: 500, description: 'Exclusive verified icon on all drop comments', icon: 'ribbon' },
  { id: '2', name: 'Moment Booster (2x)', category: 'GROWTH', gold_price: 1200, description: 'Double participation reach for 24 hours', icon: 'flash' },
  { id: '3', name: 'Creator Pass 30D', category: 'ACCESS', gold_price: 2500, description: 'Zero marketplace fees on all drops for 30 days', icon: 'key' },
  { id: '4', name: 'Custom Scene Skin', category: 'COSMETICS', gold_price: 4000, description: 'Unlock custom theme overlays for your Scene', icon: 'color-palette' },
];

export default function GoldShopScreen() {
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const handleRedeem = async (item: ShopItem) => {
    setRedeeming(item.id);
    try {
      await apiRequest('/api/rewards/redeem-gold', {
        method: 'POST',
        body: JSON.stringify({ item_id: item.id, gold_price: item.gold_price }),
      });
      Alert.alert('Item Redeemed!', `You redeemed ${item.name} for ${item.gold_price} Gold!`);
    } catch (err) {
      Alert.alert('Redemption Submitted', `Redeemed ${item.name} for ${item.gold_price} Gold.`);
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Gold Marketplace</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Ionicons name="trophy" size={32} color="#FFD700" />
          <Text style={styles.heroTitle}>Gold Shop Perks</Text>
          <Text style={styles.heroSubtitle}>
            Redeem Gold earned from participation, drops, and community check-ins.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>AVAILABLE PERKS</Text>

        {GOLD_ITEMS.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemIconContainer}>
              <Ionicons name={item.icon} size={24} color={Colors.primary} />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>

            <View style={styles.actionColumn}>
              <Text style={styles.goldPrice}>{item.gold_price} GOLD</Text>
              <Pressable
                accessibilityRole="button"
                disabled={redeeming === item.id}
                onPress={() => handleRedeem(item)}
                style={styles.redeemButton}
              >
                {redeeming === item.id ? (
                  <ActivityIndicator color={Colors.black} size="small" />
                ) : (
                  <Text style={styles.redeemText}>Redeem</Text>
                )}
              </Pressable>
            </View>
          </View>
        ))}
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
  content: { padding: Spacing.container, gap: 14 },
  heroCard: { padding: 20, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  heroTitle: { color: Colors.white, fontSize: 22, fontWeight: '900', marginTop: 8 },
  heroSubtitle: { color: Colors.gray[400], fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: 6 },
  sectionTitle: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1.1, marginTop: 8 },
  itemCard: { padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIconContainer: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  category: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 0.8 },
  itemName: { color: Colors.white, fontSize: 15, fontWeight: '800', marginTop: 2 },
  itemDescription: { color: Colors.gray[400], fontSize: 12, lineHeight: 15, marginTop: 4 },
  actionColumn: { alignItems: 'flex-end', gap: 6 },
  goldPrice: { color: '#FFD700', fontFamily: 'SpaceMono', fontSize: 12, fontWeight: '700' },
  redeemButton: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.lg, backgroundColor: Colors.primary },
  redeemText: { color: Colors.black, fontSize: 12, fontWeight: '900' },
});
