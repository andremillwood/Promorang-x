import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TeamSlashNativeModalProps {
  visible: boolean;
  onClose: () => void;
  dealTitle?: string;
  slashedPrice?: number;
  originalPrice?: number;
}

export const TeamSlashNativeModal: React.FC<TeamSlashNativeModalProps> = ({
  visible,
  onClose,
  dealTitle = 'Exclusive Promoshare Yield Pool',
  slashedPrice = 10,
  originalPrice = 100,
}) => {
  const [joinedCount] = useState(1);
  const targetCount = 3;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Slash ${dealTitle} down to $${slashedPrice} with me on Promorang! https://promorang.com/slash?ref=squad_123`,
      });
    } catch (error) {
      console.log('Share error', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.badge}>
            <Ionicons name="flash" size={12} color="#F97316" />
            <Text style={styles.badgeText}>SQUAD SLASHING ACTIVE</Text>
          </View>

          <Text style={styles.title}>Slash Price with Friends</Text>
          <Text style={styles.subtitle}>
            Invite 3 friends to join your squad and cut price to ${slashedPrice}!
          </Text>

          <View style={styles.timerCard}>
            <View>
              <Text style={styles.timerLabel}>TIME REMAINING</Text>
              <Text style={styles.timerValue}>14:59</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.timerLabel}>TARGET PRICE</Text>
              <Text style={styles.priceValue}>
                ${slashedPrice} <Text style={styles.oldPrice}>${originalPrice}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.progressRow}>
            {Array.from({ length: targetCount }).map((_, i) => {
              const filled = i < joinedCount;
              return (
                <View key={i} style={[styles.slot, filled && styles.slotFilled]}>
                  <Ionicons
                    name={filled ? 'checkmark-circle' : 'person-outline'}
                    size={22}
                    color={filled ? '#F97316' : '#52525B'}
                  />
                  <Text style={[styles.slotText, filled && { color: '#F97316' }]}>
                    {filled ? (i === 0 ? 'You' : `Friend #${i}`) : 'Empty'}
                  </Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={18} color="#000000" />
            <Text style={styles.shareBtnText}>INVITE SQUAD TO SLASH</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#18181B',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    padding: 24,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#F97316',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#A1A1AA',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 18,
  },
  timerCard: {
    width: '100%',
    backgroundColor: '#09090B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timerLabel: {
    color: '#71717A',
    fontSize: 9,
    fontWeight: '800',
  },
  timerValue: {
    color: '#F97316',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Platform',
  },
  priceValue: {
    color: '#10B981',
    fontSize: 20,
    fontWeight: '800',
  },
  oldPrice: {
    color: '#71717A',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  slot: {
    flex: 1,
    height: 70,
    backgroundColor: '#09090B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotFilled: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
    borderStyle: 'solid',
  },
  slotText: {
    color: '#71717A',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  shareBtn: {
    width: '100%',
    backgroundColor: '#F97316',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
