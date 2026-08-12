import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SlashItNativeModalProps {
  visible: boolean;
  onClose: () => void;
  dealTitle: string;
  originalPrice: number;
  currentPrice: number;
  targetPrice: number;
  slashesNeeded: number;
  slashesCompleted: number;
  squadCode?: string;
}

export const SlashItNativeModal: React.FC<SlashItNativeModalProps> = ({
  visible,
  onClose,
  dealTitle,
  originalPrice,
  currentPrice,
  targetPrice,
  slashesNeeded,
  slashesCompleted,
  squadCode = 'SLASH-9912',
}) => {
  const percentage = Math.min(100, Math.round((slashesCompleted / slashesNeeded) * 100));

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Help me slash the price on ${dealTitle}! Tap to slash $5 off for me on Promorang: https://promorang.com/slash/${squadCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="scissors" size={28} color="#f43f5e" />
            <Text style={styles.headerTitle}>Pinduoduo Social Slash</Text>
          </View>

          <Text style={styles.dealTitle}>{dealTitle}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.origPrice}>${originalPrice.toFixed(2)}</Text>
            <Text style={styles.currentPrice}>${currentPrice.toFixed(2)}</Text>
            <Ionicons name="arrow-forward" size={16} color="#64748b" />
            <Text style={styles.targetPrice}>${targetPrice.toFixed(2)} Target</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{slashesCompleted} Slashes</Text>
            <Text style={styles.progressText}>{slashesNeeded - slashesCompleted} Remaining</Text>
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#ffffff" />
            <Text style={styles.shareBtnText}>Share & Ask Friends to Slash</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f43f5e',
  },
  closeBtn: {
    alignSelf: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  headerTitle: {
    color: '#f43f5e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dealTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  origPrice: {
    color: '#64748b',
    textDecorationLine: 'line-through',
    fontSize: 14,
  },
  currentPrice: {
    color: '#f43f5e',
    fontSize: 22,
    fontWeight: '900',
  },
  targetPrice: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 10,
    backgroundColor: '#1e293b',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f43f5e',
    borderRadius: 5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#e11d48',
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
