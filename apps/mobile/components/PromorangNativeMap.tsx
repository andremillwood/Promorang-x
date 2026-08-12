import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors, BorderRadius, Spacing } from '@/constants/DesignTokens';

export interface MapMarkerItem {
  id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  category?: string;
  route?: string;
}

interface PromorangNativeMapProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: MapMarkerItem[];
  style?: object;
  showsUserLocation?: boolean;
}

const DEFAULT_REGION = {
  latitude: 33.749, // Atlanta default
  longitude: -84.388,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Dark theme map styling matching Promorang #0D0D0D palette
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0d0d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8c8c8c' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#ff6a00' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b6b6b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#141a15' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1f1f1f' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#141414' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#2b231b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f160e' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#080c14' }],
  },
];

let NativeMapView: any = null;
let NativeMarker: any = null;
let NativeCallout: any = null;
let PROVIDER_GOOGLE_REF: any = null;

try {
  const Maps = require('react-native-maps');
  NativeMapView = Maps.default || Maps;
  NativeMarker = Maps.Marker;
  NativeCallout = Maps.Callout;
  PROVIDER_GOOGLE_REF = Maps.PROVIDER_GOOGLE;
} catch (e) {
  // Graceful fallback when react-native-maps module is not yet installed in local workspace
}

export function PromorangNativeMap({
  initialRegion = DEFAULT_REGION,
  markers = [],
  style,
  showsUserLocation = true,
}: PromorangNativeMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);

  if (Platform.OS === 'web' || !NativeMapView) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Ionicons name="map-outline" size={32} color={Colors.primary} />
        <Text style={styles.fallbackTitle}>Interactive Native Map</Text>
        <Text style={styles.fallbackSubtitle}>
          {markers.length} moments mapped near Atlanta
        </Text>
        <View style={styles.markerList}>
          {markers.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => m.route && router.push(m.route as any)}
              style={styles.markerItem}
            >
              <Ionicons name="location" size={18} color={Colors.primary} />
              <View style={styles.markerCopy}>
                <Text style={styles.markerTitle}>{m.title}</Text>
                {m.description ? (
                  <Text style={styles.markerDesc} numberOfLines={1}>
                    {m.description}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.gray[500]} />
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const MapComp = NativeMapView;
  const MarkerComp = NativeMarker;
  const CalloutComp = NativeCallout;

  return (
    <View style={[styles.container, style]}>
      <MapComp
        provider={PROVIDER_GOOGLE_REF}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={true}
      >
        {markers.map((marker) => (
          <MarkerComp
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => setSelectedMarker(marker)}
          >
            <View style={styles.customMarker}>
              <Ionicons name="location" size={24} color={Colors.primary} />
            </View>
            <CalloutComp
              tooltip
              onPress={() => {
                if (marker.route) {
                  router.push(marker.route as any);
                }
              }}
            >
              <View style={styles.calloutCard}>
                <Text style={styles.calloutCategory}>{marker.category || 'MOMENT'}</Text>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                {marker.description && (
                  <Text style={styles.calloutDesc} numberOfLines={2}>
                    {marker.description}
                  </Text>
                )}
                <View style={styles.calloutAction}>
                  <Text style={styles.calloutActionText}>View Details</Text>
                  <Ionicons name="arrow-forward" size={12} color={Colors.black} />
                </View>
              </View>
            </CalloutComp>
          </MarkerComp>
        ))}
      </MapComp>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
  customMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 106, 0, 0.15)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutCard: {
    width: 200,
    padding: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: 'rgba(255,106,0,0.3)',
  },
  calloutCategory: {
    color: Colors.primary,
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  calloutTitle: { color: Colors.white, fontSize: 13, fontWeight: '800', marginTop: 2 },
  calloutDesc: { color: Colors.gray[400], fontSize: 11, marginTop: 4 },
  calloutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  calloutActionText: { color: Colors.black, fontSize: 10, fontWeight: '900' },
  fallbackContainer: {
    padding: 20,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.gray[900],
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 8,
  },
  fallbackTitle: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  fallbackSubtitle: { color: Colors.gray[400], fontSize: 12 },
  markerList: { width: '100%', marginTop: 12, gap: 8 },
  markerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.black,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  markerCopy: { flex: 1 },
  markerTitle: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  markerDesc: { color: Colors.gray[400], fontSize: 11, marginTop: 2 },
});
