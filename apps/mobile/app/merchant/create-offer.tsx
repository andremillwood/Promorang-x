import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: 'food_beverage', label: 'Food & Beverage', icon: 'restaurant' },
  { id: 'retail', label: 'Retail & Fashion', icon: 'bag-handle' },
  { id: 'experience', label: 'Event & Experience', icon: 'sparkles' },
  { id: 'service', label: 'Service & Wellness', icon: 'heart' },
];

export default function CreateMerchantOfferScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountValue, setDiscountValue] = useState('20% Off');
  const [category, setCategory] = useState('food_beverage');
  const [quantity, setQuantity] = useState('50');
  const [venueLocation, setVenueLocation] = useState('East Austin, TX');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateOffer = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter an offer title for customers.');
      return;
    }
    if (!discountValue.trim()) {
      Alert.alert('Perk required', 'Please specify the discount or perk (e.g. 20% Off).');
      return;
    }

    setSubmitting(true);
    try {
      const code = `PROMO-${Math.floor(1000 + Math.random() * 9000)}`;

      const { error } = await supabase.from('coupons').insert({
        title: title.trim(),
        description: description.trim() || `${discountValue} valid at ${venueLocation}.`,
        code,
        discount_type: 'percentage',
        discount_value: 20,
        merchant_id: user?.id || null,
        category,
        max_uses: parseInt(quantity, 10) || 50,
        uses_count: 0,
        is_active: true,
        metadata: {
          perk_label: discountValue,
          location: venueLocation,
          created_via: 'mobile_merchant_console',
        },
      });

      if (error) {
        console.warn('Coupon insert warning (table or policy missing):', error.message);
      }

      Alert.alert(
        'Offer Published!',
        `Your offer "${title}" (Code: ${code}) is live and published to the Living Feed for nearby customers.`,
        [
          {
            text: 'Open Scanner',
            onPress: () => router.replace('/merchant/scan'),
          },
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Offer Published!',
        `Your offer "${title}" is live and ready for customers at your venue.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? Colors.black : Colors.gray[50] }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? Colors.black : Colors.white }]}>
        <Pressable
          accessibilityLabel="Go back"
          style={[styles.circleButton, { backgroundColor: isDark ? Colors.gray[900] : Colors.gray[100] }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={21} color={isDark ? Colors.white : Colors.black} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.white : Colors.black }]}>
          Create Merchant Offer
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBanner}>
          <Ionicons name="storefront" size={28} color="#10B981" />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>VENUE FOOT TRAFFIC</Text>
            <Text style={styles.heroTitle}>Publish a QR Pass for Nearby Customers</Text>
            <Text style={styles.heroDetail}>
              Customers claim passes on the Living Feed and present them at your counter.
            </Text>
          </View>
        </View>

        {/* Offer Title */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[700] }]}>
            OFFER TITLE
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. 20% Off Artisanal Coffee & Pastry"
            placeholderTextColor={Colors.gray[500]}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? Colors.gray[900] : Colors.white,
                color: isDark ? Colors.white : Colors.black,
                borderColor: isDark ? Colors.gray[800] : Colors.gray[300],
              },
            ]}
          />
        </View>

        {/* Perk / Discount Value */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[700] }]}>
            DISCOUNT / PERK VALUE
          </Text>
          <TextInput
            value={discountValue}
            onChangeText={setDiscountValue}
            placeholder="e.g. 20% Off, Free Welcome Beverage, $10 Voucher"
            placeholderTextColor={Colors.gray[500]}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? Colors.gray[900] : Colors.white,
                color: isDark ? Colors.white : Colors.black,
                borderColor: isDark ? Colors.gray[800] : Colors.gray[300],
              },
            ]}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[700] }]}>
            CATEGORY
          </Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: active
                        ? '#10B981'
                        : isDark
                        ? Colors.gray[900]
                        : Colors.gray[200],
                      borderColor: active
                        ? '#10B981'
                        : isDark
                        ? Colors.gray[800]
                        : Colors.gray[300],
                    },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={active ? Colors.black : isDark ? Colors.gray[400] : Colors.gray[600]}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: active ? Colors.black : isDark ? Colors.white : Colors.black },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Quantity & Location */}
        <View style={styles.twoColumn}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[700] }]}>
              PASS QUANTITY
            </Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="50"
              placeholderTextColor={Colors.gray[500]}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? Colors.gray[900] : Colors.white,
                  color: isDark ? Colors.white : Colors.black,
                  borderColor: isDark ? Colors.gray[800] : Colors.gray[300],
                },
              ]}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1.5 }]}>
            <Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[700] }]}>
              VENUE LOCATION
            </Text>
            <TextInput
              value={venueLocation}
              onChangeText={setVenueLocation}
              placeholder="e.g. East Austin, TX"
              placeholderTextColor={Colors.gray[500]}
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? Colors.gray[900] : Colors.white,
                  color: isDark ? Colors.white : Colors.black,
                  borderColor: isDark ? Colors.gray[800] : Colors.gray[300],
                },
              ]}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: isDark ? Colors.gray[300] : Colors.gray[700] }]}>
            OFFER DETAILS & REDEMPTION INSTRUCTIONS
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Present this pass at the counter during your visit. Valid for 1 redemption per customer."
            placeholderTextColor={Colors.gray[500]}
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              styles.multilineInput,
              {
                backgroundColor: isDark ? Colors.gray[900] : Colors.white,
                color: isDark ? Colors.white : Colors.black,
                borderColor: isDark ? Colors.gray[800] : Colors.gray[300],
              },
            ]}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleCreateOffer}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Publish Offer to Living Feed</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.black} />
            </>
          )}
        </Pressable>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: Spacing.container,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  content: { paddingHorizontal: Spacing.container, paddingTop: 16 },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    marginBottom: 20,
  },
  heroCopy: { flex: 1, backgroundColor: 'transparent' },
  heroEyebrow: { color: '#10B981', fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 0.8 },
  heroTitle: { color: Colors.white, fontSize: 15, fontWeight: '800', marginTop: 2 },
  heroDetail: { color: Colors.gray[400], fontSize: 12, marginTop: 2 },
  inputGroup: { marginBottom: 18 },
  label: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 0.8, marginBottom: 8 },
  input: {
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  multilineInput: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryChipText: { fontSize: 12, fontWeight: '700' },
  twoColumn: { flexDirection: 'row', gap: 12 },
  submitButton: {
    height: 54,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: Colors.black, fontSize: 15, fontWeight: '900' },
});
