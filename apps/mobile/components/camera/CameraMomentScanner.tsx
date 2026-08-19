import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CameraMomentScannerProps {
  visible: boolean;
  onClose: () => void;
  onMomentCaptured?: (data: { uri?: string; timestamp: number }) => void;
}

export const CameraMomentScanner: React.FC<CameraMomentScannerProps> = ({
  visible,
  onClose,
  onMomentCaptured,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const handleShutter = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (onMomentCaptured) {
        onMomentCaptured({ timestamp: Date.now() });
      }
      onClose();
    }, 600);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.container}>
        {/* Simulated Viewfinder overlay */}
        <View style={styles.viewfinderBackground}>
          {/* AR Target Reticle Box */}
          <View style={styles.arReticleContainer}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={styles.arPill}>
              <Ionicons name="sparkles" size={14} color="#FFD700" />
              <Text style={styles.arPillText}>Instant Moment AR Ready</Text>
            </View>
          </View>
        </View>

        {/* Top Camera Controls */}
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={onClose}>
            <Ionicons name="close" size={26} color="#FFF" />
          </Pressable>
          <Text style={styles.titleText}>Proof-of-Moment</Text>
          <Pressable
            style={styles.iconButton}
            onPress={() => setFlashOn((prev) => !prev)}
          >
            <Ionicons
              name={flashOn ? 'flash' : 'flash-off'}
              size={24}
              color={flashOn ? '#FFD700' : '#FFF'}
            />
          </Pressable>
        </View>

        {/* Bottom Shutter Control (Snapchat Ring Style) */}
        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.shutterRing, isScanning && styles.shutterActive]}
            onPress={handleShutter}
          >
            <View style={styles.shutterInner} />
          </Pressable>
          <Text style={styles.hintText}>Tap for Moment • Hold for Scan</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  viewfinderBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  arReticleContainer: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.72,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FFD700',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  arPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    gap: 6,
  },
  arPillText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
  },
  topBar: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  titleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  shutterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  shutterActive: {
    borderColor: '#FFD700',
    transform: [{ scale: 0.95 }],
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFF',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
});
