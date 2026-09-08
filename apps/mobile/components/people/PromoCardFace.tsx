import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { PromorangMark } from '@/components/brand/PromorangMark';
import { BorderRadius, Colors } from '@/constants/DesignTokens';
import { resolvePromoCardFace, type PromoCardFaceModel } from '@promorang/shared';

type PromoCardFaceProps = {
  holder?: string;
  available?: string;
  limit?: string;
  places?: string;
  tier?: string;
  cardNumber?: string;
  compact?: boolean;
  model?: PromoCardFaceModel;
  flipped?: boolean;
  onFlip?: () => void;
  onPress?: () => void;
  onUsePress?: () => void;
};

function stamps(model: PromoCardFaceModel) {
  return [model.sceneMark, model.crewMark].filter(Boolean) as string[];
}

export function PromoCardFace({
  holder = 'Your card',
  available,
  limit,
  places,
  tier,
  compact = false,
  model,
  flipped,
  onFlip,
  onPress,
  onUsePress,
}: PromoCardFaceProps) {
  const [localFlip, setLocalFlip] = useState(false);
  const face =
    model ||
    resolvePromoCardFace({
      holder,
      nearbyCount: /nearby/i.test(`${available} ${places}`) ? 1 : 0,
      nextBenefitTitle: limit,
    });
  const isFlipped = flipped ?? localFlip;
  const canFlip = Boolean(face.canFlip && face.credential);
  const toggle = () => {
    if (!canFlip) {
      onUsePress?.();
      return;
    }
    if (onFlip) onFlip();
    else setLocalFlip((value) => !value);
    if (!isFlipped) onUsePress?.();
  };

  const front = (
    <>
      <View style={[styles.glow, face.state === 'empty' && styles.glowQuiet]} />
      <View style={styles.sheen} />
      {face.state === 'used' ? <View style={styles.punch} /> : null}
      <View style={styles.top}>
        <View style={styles.brandLockup}>
          <View style={styles.markBadge}>
            <PromorangMark size={compact ? 28 : 34} />
          </View>
          <View>
            <Text style={styles.brand}>PROMORANG</Text>
            <Text style={styles.title}>PromoCard</Text>
            {tier ? <Text style={styles.tier}>{tier} tier</Text> : null}
          </View>
        </View>
        {face.issuerInitial ? (
          <View style={styles.issuer} accessibilityLabel={`${face.issuer} mark`}>
            <Text style={styles.issuerText}>{face.issuerInitial}</Text>
          </View>
        ) : null}
      </View>
      <View>
        <Text style={styles.meta}>{face.action}</Text>
        <Text style={[styles.available, compact && styles.availableCompact]}>{face.headline}</Text>
        <Text style={styles.limit}>{face.detail}</Text>
        <Text style={styles.places}>{face.places}</Text>
        {stamps(face).length || face.returnStamp ? (
          <View style={styles.stampRow}>
            {stamps(face).map((mark) => (
              <Text key={mark} style={styles.stamp}>{mark}</Text>
            ))}
            {face.returnStamp ? (
              <Text style={[styles.stamp, styles.returnStamp]}>
                {face.returnStamp}
                {face.returnDate ? ` · ${face.returnDate}` : ''}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.foot}>
        <Text style={styles.holder}>{face.holder}</Text>
        <Text style={styles.cue}>{face.footerCue}</Text>
      </View>
    </>
  );

  const back = (
    <>
      <View style={styles.glow} />
      <View style={[styles.markBadge, styles.backMark]}>
        <PromorangMark size={32} />
      </View>
      <Text style={styles.brand}>PROMORANG · HOLD AT THE DOOR</Text>
      <Text style={styles.backIssuer}>{face.issuer || 'PromoCard'}</Text>
      <View style={styles.codeBox}>
        <Text style={styles.meta}>SHOW THIS</Text>
        <Text selectable style={styles.code}>{face.credential}</Text>
      </View>
      <Text style={styles.cue}>{face.footerCue}</Text>
    </>
  );

  const body = (
    <LinearGradient
      colors={
        face.state === 'empty' || face.state === 'expired' || face.state === 'used'
          ? ['#141414', '#090909', '#101010']
          : ['#141414', '#080808', '#0E0E0E']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        compact && styles.cardCompact,
        face.state === 'ready' && styles.cardReady,
        (face.state === 'used' || face.state === 'expired') && styles.cardFaded,
      ]}
      accessibilityLabel="PromoCard"
    >
      {isFlipped && canFlip ? back : front}
    </LinearGradient>
  );

  if (onPress && !canFlip) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel="Open PromoCard" onPress={onPress}>
        {body}
      </Pressable>
    );
  }

  return (
    <View>
      {body}
      {canFlip || onUsePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isFlipped ? 'Hide PromoCard code' : 'Flip PromoCard to show the merchant'}
          onPress={toggle}
          style={styles.use}
        >
          <Text style={styles.useText}>{isFlipped ? 'Turn it back over' : face.action}</Text>
        </Pressable>
      ) : null}
    </View>
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
    borderColor: 'rgba(214,178,90,0.42)',
    shadowColor: '#FF5500',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
  },
  cardCompact: { minHeight: 168, padding: 16 },
  cardReady: { borderColor: 'rgba(255,85,0,0.55)' },
  cardFaded: { opacity: 0.72 },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -50,
    top: -70,
    backgroundColor: 'rgba(255,85,0,0.14)',
  },
  glowQuiet: { backgroundColor: 'rgba(255,85,0,0.08)' },
  sheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 70,
    left: '42%',
    backgroundColor: 'rgba(246,212,138,0.1)',
    transform: [{ skewX: '-18deg' }],
  },
  markBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(214,178,90,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  punch: {
    position: 'absolute',
    left: '18%',
    right: '18%',
    top: '48%',
    height: 3,
    backgroundColor: 'rgba(255,85,0,0.55)',
    transform: [{ rotate: '-8deg' }],
    zIndex: 2,
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
    color: '#F6D48A',
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: 'rgba(214,178,90,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  issuer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(214,178,90,0.5)',
    backgroundColor: 'rgba(214,178,90,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  issuerText: { color: '#F6D48A', fontSize: 18, fontWeight: '900' },
  meta: { color: Colors.gray[400], fontSize: 11, letterSpacing: 0.4 },
  available: { color: '#F6D48A', fontSize: 32, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  availableCompact: { fontSize: 24 },
  limit: { color: Colors.gray[400], fontSize: 12, marginTop: 4 },
  places: { color: Colors.gray[500], fontSize: 12, marginTop: 2 },
  stampRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  stamp: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,85,0,0.45)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: '#FFB067',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    overflow: 'hidden',
  },
  returnStamp: { borderStyle: 'solid', borderColor: 'rgba(214,178,90,0.5)', color: '#F6D48A' },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 },
  holder: { color: Colors.gray[300], fontSize: 12, flexShrink: 0 },
  cue: { color: Colors.gray[400], fontSize: 10, textAlign: 'right', flex: 1 },
  backMark: { alignSelf: 'center', marginBottom: 8 },
  backIssuer: { color: Colors.white, fontSize: 20, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  codeBox: { alignItems: 'center', marginVertical: 16 },
  code: { color: '#F6D48A', fontFamily: 'SpaceMono', fontSize: 26, fontWeight: '900', letterSpacing: 2, marginTop: 6 },
  use: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,85,0,0.4)',
    backgroundColor: 'rgba(255,85,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  useText: { color: Colors.primary, fontSize: 13, fontWeight: '900' },
});
