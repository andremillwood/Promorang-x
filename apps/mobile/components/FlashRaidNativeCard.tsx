import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FlashRaidNativeCardProps {
  title: string;
  merchantName: string;
  multiplier: number;
  claimedSpots: number;
  totalSpots: number;
  userWithinRadius: boolean;
  onClaim: () => void;
}

export const FlashRaidNativeCard: React.FC<FlashRaidNativeCardProps> = ({
  title,
  merchantName,
  multiplier,
  claimedSpots,
  totalSpots,
  userWithinRadius,
  onClaim,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="flash" size={12} color="#000000" />
          <Text style={styles.badgeText}>POKÉMON GO RAID</Text>
        </View>
        <Text style={styles.multiplierText}>{multiplier}x Yield</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.merchant}>{merchantName}</Text>

      <View style={styles.footer}>
        <Text style={styles.spots}>
          {claimedSpots}/{totalSpots} Spots Claimed
        </Text>

        {userWithinRadius ? (
          <TouchableOpacity style={styles.claimBtn} onPress={onClaim}>
            <Text style={styles.claimBtnText}>Claim Raid Drop</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.disabledBtn}>
            <Ionicons name="navigate-outline" size={14} color="#94a3b8" />
            <Text style={styles.disabledText}>Walk Closer</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  badgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  multiplierText: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  merchant: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spots: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  claimBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  claimBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  disabledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  disabledText: {
    color: '#94a3b8',
    fontSize: 12,
  },
});
