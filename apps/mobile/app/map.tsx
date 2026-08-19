import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/DesignTokens';
import { PromorangNativeMap, MapMarkerItem } from '@/components/PromorangNativeMap';

const SAMPLE_MARKERS: MapMarkerItem[] = [
  {
    id: '1',
    title: 'I Luv Hip Hop Live',
    description: 'Weekly community cypher and live performance.',
    latitude: 33.749,
    longitude: -84.388,
    category: 'MOMENT',
    route: '/catalog',
  },
  {
    id: '2',
    title: 'Midtown Creator Hub',
    description: 'Verified venue and co-working activation.',
    latitude: 33.78,
    longitude: -84.384,
    category: 'VENUE',
    route: '/catalog',
  },
  {
    id: '3',
    title: 'Eastside Art Walk',
    description: 'Community drop & interactive proof station.',
    latitude: 33.755,
    longitude: -84.36,
    category: 'SCENE',
    route: '/scenes',
  },
];

export default function NativeMapScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>EXPLORE MAP</Text>
        <Pressable accessibilityLabel="Search" onPress={() => router.push('/search')} style={styles.iconButton}>
          <Ionicons name="search" size={19} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.mapContainer}>
        <PromorangNativeMap markers={SAMPLE_MARKERS} showsUserLocation={true} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: {
    height: 56,
    paddingHorizontal: Spacing.container,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[900],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 13, letterSpacing: 1 },
  mapContainer: { flex: 1, margin: Spacing.container, borderRadius: 20, overflow: 'hidden' },
});
