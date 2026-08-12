import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';

interface SpinWheelNativeModalProps {
  visible: boolean;
  onClose: () => void;
  onRewardClaimed?: (reward: string, amount: number) => void;
}

const REWARDS = [
  { label: '50 Gems', amount: 50, color: '#F59E0B' },
  { label: '2x Boost', amount: 2, color: '#EC4899' },
  { label: '100 Gems', amount: 100, color: '#10B981' },
  { label: '1 Piece', amount: 1, color: '#8B5CF6' },
  { label: '25 Gems', amount: 25, color: '#3B82F6' },
  { label: '3x Yield', amount: 3, color: '#F43F5E' },
];

export const SpinWheelNativeModal: React.FC<SpinWheelNativeModalProps> = ({
  visible,
  onClose,
  onRewardClaimed,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<typeof REWARDS[0] | null>(null);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonReward(null);

    const prizeIndex = Math.floor(Math.random() * REWARDS.length);
    const degreesPerSegment = 360 / REWARDS.length;
    const extraRounds = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetDegree = extraRounds + (360 - (prizeIndex * degreesPerSegment + degreesPerSegment / 2));

    setRotation(targetDegree);

    setTimeout(() => {
      setSpinning(false);
      const prize = REWARDS[prizeIndex];
      setWonReward(prize);
      if (onRewardClaimed) {
        onRewardClaimed(prize.label, prize.amount);
      }
    }, 4000);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color="#F59E0B" />
            <Text style={styles.badgeText}>DAILY UNLOCK</Text>
          </View>

          <Text style={styles.title}>Spin to Boost Rewards</Text>
          <Text style={styles.subtitle}>Unlock free Gems, multipliers & pieces!</Text>

          {/* Wheel Container */}
          <View style={styles.wheelWrapper}>
            <View style={styles.pointer} />
            <View style={[styles.wheel, { transform: [{ rotate: `${rotation}deg` }] }]}>
              <Svg height="220" width="220" viewBox="0 0 100 100">
                <G rotation="-90" origin="50, 50">
                  {REWARDS.map((reward, i) => {
                    const angle = 360 / REWARDS.length;
                    const startAngle = i * angle;
                    const endAngle = (i + 1) * angle;
                    const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                    const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    return (
                      <G key={i}>
                        <Path d={d} fill={reward.color} opacity={i % 2 === 0 ? 0.95 : 0.8} />
                        <SvgText
                          x="70"
                          y="50"
                          fill="#FFFFFF"
                          fontSize="4"
                          fontWeight="bold"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                          transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                        >
                          {reward.label}
                        </SvgText>
                      </G>
                    );
                  })}
                </G>
              </Svg>
            </View>
            <View style={styles.centerHub}>
              <Ionicons name="trophy" size={20} color="#F59E0B" />
            </View>
          </View>

          {wonReward && (
            <View style={styles.rewardBanner}>
              <Text style={styles.rewardBannerTitle}>CONGRATULATIONS!</Text>
              <Text style={styles.rewardBannerText}>
                Unlocked <Text style={{ color: '#F59E0B' }}>{wonReward.label}</Text>
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={wonReward ? onClose : handleSpin}
            disabled={spinning}
          >
            <Text style={styles.actionBtnText}>
              {spinning ? 'SPINNING...' : wonReward ? 'CLAIM REWARD' : 'SPIN FOR FREE REWARDS'}
            </Text>
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
    borderColor: 'rgba(245, 158, 11, 0.3)',
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
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#F59E0B',
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
    marginBottom: 20,
  },
  wheelWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  pointer: {
    position: 'absolute',
    top: -6,
    zIndex: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderTopWidth: 16,
    borderTopColor: '#F59E0B',
  },
  wheel: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
  },
  centerHub: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#18181B',
    borderWidth: 2,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  rewardBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardBannerTitle: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },
  rewardBannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtn: {
    width: '100%',
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
