import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PromorangNativeMap, MapMarkerItem } from '../PromorangNativeMap';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SAMPLE_DROP_PINS: MapMarkerItem[] = [
  {
    id: 'pin-1',
    title: 'Downtown Coffee Co.',
    description: 'Free Pastry w/ Any Cold Brew • 0.3mi',
    latitude: 33.749,
    longitude: -84.388,
    category: 'Food & Drink',
  },
  {
    id: 'pin-2',
    title: 'Pulse Fitness Studio',
    description: '50% Off First Class Drop-In • 0.8mi',
    latitude: 33.755,
    longitude: -84.382,
    category: 'Wellness',
  },
  {
    id: 'pin-3',
    title: 'Metropolitan Cinema',
    description: '2-for-1 Ticket Pass Drop • 1.2mi',
    latitude: 33.742,
    longitude: -84.394,
    category: 'Entertainment',
  },
];

interface PromoHeatmapViewProps {
  onSelectDropPin?: (pin: MapMarkerItem) => void;
  onOpenScanner?: () => void;
}

export const PromoHeatmapView: React.FC<PromoHeatmapViewProps> = ({
  onSelectDropPin,
  onOpenScanner,
}) => {
  const [selectedPin, setSelectedPin] = useState<MapMarkerItem | null>(
    SAMPLE_DROP_PINS[0]
  );

  return (
    <View style={styles.container}>
      {/* Dark Spatial Heatmap Base */}
      <PromorangNativeMap markers={SAMPLE_DROP_PINS} style={styles.map} />

      {/* Top Floating Controls Pill */}
      <View style={styles.topControlPill}>
        <Ionicons name="map-outline" size={16} color="#FFD700" />
        <Text style={styles.topControlText}>3 Sponsorship Drops Nearby</Text>
      </View>

      {/* Snapchat-Style Bottom Drawer Card */}
      {selectedPin && (
        <View style={styles.bottomDrawerCard}>
          <View style={styles.drawerHandle} />
          <View style={styles.drawerHeader}>
            <View style={styles.merchantIconBg}>
              <Ionicons name="location" size={20} color="#FFD700" />
            </View>
            <View style={styles.merchantInfo}>
              <Text style={styles.merchantTitle}>{selectedPin.title}</Text>
              <Text style={styles.merchantDesc}>{selectedPin.description}</Text>
            </View>
            <Pressable
              style={styles.closeDrawerButton}
              onPress={() => setSelectedPin(null)}
            >
              <Ionicons name="close-circle" size={22} color="rgba(255,255,255,0.4)" />
            </Pressable>
          </View>

          {/* Action Row */}
          <View style={styles.drawerActionRow}>
            <Pressable style={styles.secondaryActionButton}>
              <Ionicons name="navigate-outline" size={16} color="#FFF" />
              <Text style={styles.secondaryActionText}>Directions</Text>
            </Pressable>

            <Pressable
              style={styles.primaryClaimButton}
              onPress={() => {
                if (onSelectDropPin) onSelectDropPin(selectedPin);
                if (onOpenScanner) onOpenScanner();
              }}
            >
              <Ionicons name="qr-code-outline" size={18} color="#000" />
              <Text style={styles.primaryClaimText}>Claim at Venue</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topControlPill: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 13, 13, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 6,
    zIndex: 5,
  },
  topControlText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomDrawerCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#181818',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  drawerHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  merchantIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  merchantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  merchantTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  merchantDesc: {
    color: '#A0A0A0',
    fontSize: 13,
    marginTop: 2,
  },
  closeDrawerButton: {
    padding: 4,
  },
  drawerActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 6,
  },
  secondaryActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryClaimButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 6,
  },
  primaryClaimText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});
