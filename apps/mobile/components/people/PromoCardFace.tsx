import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PromorangMark } from '@/components/brand/PromorangMark';
import { BorderRadius, Colors } from '@/constants/DesignTokens';

type PromoCardFaceProps = {
  holder?: string;
  available?: string;
  limit?: string;
  places?: string;
  tier?: string;
  cardNumber?: string;
  compact?: boolean;
  onPress?: () => void;
  onUsePress?: () => void;
};

export function PromoCardFace({
  holder = 'Your card',
  available = '0 pts',
  limit = '0 keys',
  places = 'Your perks live here',
  tier,
  cardNumber = '',
  compact = false,
  onPress,
  onUsePress,
}: PromoCardFaceProps) {
  const face = (
    <>
      <View style={styles.glow} />
      <View style={styles.sheen} />
      <View style={styles.top}>
        <View style={styles.brandLockup}>
          <PromorangMark size={34} />
          <View>
            <Text style={styles.brand}>PROMORANG</Text>
            <Text style={styles.title}>PromoCard</Text>
            {tier ? <Text style={styles.tier}>{tier} tier</Text> : null}
          </View>
        </View>
      </View>
      <View>
        <Text style={styles.meta}>On this card</Text>
        <Text style={[styles.available, compact && styles.availableCompact]}>{available}</Text>
        <Text style={styles.limit}>
          of {limit} this cycle · {places}
        </Text>
      </View>
    </>
  );

  const useControl = onUsePress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Use PromoCard in store"
      onPress={onUsePress}
      style={styles.use}
    >
      <Ionicons name="qr-code" size={14} color={Colors.black} />
      <Text style={styles.useText}>Use</Text>
    </Pressable>
  ) : (
    <View style={styles.accepted}>
      <Ionicons name="shield-checkmark" size={13} color="#67C587" />
      <Text style={styles.acceptedText}>Not a loan</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1A120C', '#0B0B0C', '#1A0E08']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, compact && styles.cardCompact]}
      accessibilityLabel="PromoCard"
    >
      {onPress ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Open PromoCard" onPress={onPress}>
          {face}
        </Pressable>
      ) : (
        face
      )}
      <View style={styles.foot}>
        <View>
          <Text style={styles.holder}>{holder}</Text>
          <Text style={styles.serial}>{cardNumber}</Text>
        </View>
        {useControl}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 210,
    borderRadius: 22,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,85,0,0.38)',
    shadowColor: '#FF5500',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 10,
  },
  cardCompact: {
    minHeight: 168,
    padding: 16,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -50,
    top: -70,
    backgroundColor: 'rgba(255,85,0,0.28)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 70,
    left: '42%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    transform: [{ skewX: '-18deg' }],
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brandLockup: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  brand: {
    color: Colors.primary,
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: '800',
  },
  title: { color: Colors.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginTop: 4 },
  tier: {
    marginTop: 6,
    alignSelf: 'flex-start',
    color: Colors.primary,
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: 'rgba(255,85,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  meta: { color: Colors.gray[400], fontSize: 11, letterSpacing: 0.4 },
  available: { color: '#FFD4B0', fontSize: 36, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  availableCompact: { fontSize: 28 },
  limit: { color: Colors.gray[400], fontSize: 12, marginTop: 4 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  holder: { color: Colors.gray[300], fontSize: 12 },
  serial: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 1.4, marginTop: 2 },
  use: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  useText: { color: Colors.black, fontSize: 12, fontWeight: '900' },
  accepted: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  acceptedText: { color: '#67C587', fontSize: 11, fontWeight: '700' },
});
