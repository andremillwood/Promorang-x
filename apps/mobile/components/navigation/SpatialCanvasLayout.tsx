import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SpatialCanvasLayoutProps {
  children?: any;
  onOpenMap?: () => void;
  onOpenScanner?: () => void;
  onOpenStories?: () => void;
}

export function SpatialCanvasLayout({
  children,
  onOpenMap,
  onOpenScanner,
  onOpenStories,
}: SpatialCanvasLayoutProps) {
  return (
    <View style={styles.container}>
      {/* Content Surface */}
      <View style={styles.contentContainer}>{children}</View>

      {/* Floating Snapchat-Style Quick Action Dock */}
      <View style={styles.floatingDockContainer}>
        {/* Map Shortcut (Down/Left Spatial Anchor) */}
        <Pressable style={styles.dockIconCircle} onPress={onOpenMap}>
          <Ionicons name="map" size={22} color="#FFF" />
        </Pressable>

        {/* Center Camera Shutter / Instant Scan Anchor */}
        <Pressable
          style={[styles.dockIconCircle, styles.centerShutterCircle]}
          onPress={onOpenScanner}
        >
          <Ionicons name="camera" size={26} color="#000" />
        </Pressable>

        {/* Stories / Discover Shortcut (Right Spatial Anchor) */}
        <Pressable style={styles.dockIconCircle} onPress={onOpenStories}>
          <Ionicons name="play-circle" size={24} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  contentContainer: {
    flex: 1,
  },
  floatingDockContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 16,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  dockIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerShutterCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFD700',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
});
