import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors } from '@/constants/DesignTokens';

type Props = {
  momentId: string;
  venueName?: string | null;
  reward?: string | null;
};

const trail = [
  { icon: 'play-circle', label: 'Content', detail: 'creates the reason' },
  { icon: 'location', label: 'Moment', detail: 'creates the action' },
  { icon: 'checkmark-circle', label: 'Show up', detail: 'make it count' },
  { icon: 'sparkles', label: 'Open doors', detail: 'see what comes next' },
] as const;

export function PoweredParticipation({ momentId, venueName, reward }: Props) {
  return (
    <View style={styles.shell}>
      <View style={styles.glow} />
      <Text style={styles.eyebrow}>HOW THIS MOMENT IS POWERED</Text>
      <Text style={styles.title}>A story draws people in. Showing up changes what happens next.</Text>
      <Text style={styles.intro}>
        A host, brand, or merchant defines the outcome and contributes the experience, budget, access, product, or reward. Creators give people a reason and a next step.
      </Text>

      <View style={styles.trail}>
        {trail.map((step, index) => (
          <View key={step.label} style={styles.step}>
            <View style={[styles.stepIcon, index === 2 && styles.stepIconActive]}>
              <Ionicons name={step.icon} size={16} color={index === 2 ? Colors.black : Colors.primary} />
            </View>
            <Text style={styles.stepLabel}>{step.label}</Text>
            <Text style={styles.stepDetail}>{step.detail}</Text>
          </View>
        ))}
      </View>

      <View style={styles.funder}>
        <View style={styles.funderIcon}><Ionicons name="storefront" size={18} color={Colors.primary} /></View>
        <View style={styles.funderCopy}>
          <Text style={styles.funderLabel}>POWERED AROUND A REAL OUTCOME</Text>
          <Text style={styles.funderName}>{venueName || 'Host and participating partners'}</Text>
          <Text style={styles.funderDetail}>Their support should make the experience better and create a reason for people to care, return, and choose them.</Text>
        </View>
      </View>

      <View style={styles.unlock}>
        <Text style={styles.unlockLabel}>WHAT CAN RETURN TO YOU</Text>
        <Text style={styles.unlockValue}>{reward || 'A verified memory, progress, and any funded reward'}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={styles.contentAction}
        onPress={() => router.push({ pathname: '/search', params: { type: 'content', momentId } } as any)}
      >
        <View style={styles.contentActionCopy}>
          <Text style={styles.contentActionLabel}>CONTENT + PROMOSHARE</Text>
          <Text style={styles.contentActionTitle}>See what is moving this Moment</Text>
          <Text style={styles.contentActionDetail}>Creator stories can lead to real visits and new connections. PromoShare shows what those stories set in motion.</Text>
        </View>
        <Ionicons name="arrow-forward" size={19} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { overflow: 'hidden', marginTop: 22, padding: 17, borderRadius: BorderRadius['2xl'], backgroundColor: '#111110', borderWidth: 1, borderColor: Colors.border },
  glow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -85, top: -100, backgroundColor: 'rgba(255,106,26,.14)' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .8 },
  title: { color: Colors.white, fontSize: 19, lineHeight: 24, fontWeight: '800', letterSpacing: -.45, marginTop: 8, maxWidth: 310 },
  intro: { color: Colors.gray[400], fontSize: 11, lineHeight: 17, marginTop: 8 },
  trail: { flexDirection: 'row', marginTop: 18, paddingTop: 15, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, backgroundColor: 'transparent' },
  step: { flex: 1, alignItems: 'center', backgroundColor: 'transparent' },
  stepIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash, borderWidth: 1, borderColor: 'rgba(255,106,26,.2)' },
  stepIconActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepLabel: { color: Colors.white, fontSize: 9, fontWeight: '800', marginTop: 7 },
  stepDetail: { color: Colors.gray[600], fontSize: 7, lineHeight: 10, textAlign: 'center', marginTop: 2, maxWidth: 66 },
  funder: { flexDirection: 'row', marginTop: 18, padding: 13, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  funderIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash, marginRight: 10 },
  funderCopy: { flex: 1, backgroundColor: 'transparent' },
  funderLabel: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .5 },
  funderName: { color: Colors.white, fontSize: 11, fontWeight: '800', marginTop: 4 },
  funderDetail: { color: Colors.gray[500], fontSize: 9, lineHeight: 14, marginTop: 3 },
  unlock: { marginTop: 10, padding: 13, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.23)' },
  unlockLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .6 },
  unlockValue: { color: Colors.white, fontSize: 11, fontWeight: '700', lineHeight: 16, marginTop: 4 },
  contentAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10, padding: 13, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  contentActionCopy: { flex: 1, backgroundColor: 'transparent' },
  contentActionLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .6 },
  contentActionTitle: { color: Colors.white, fontSize: 11, fontWeight: '800', marginTop: 4 },
  contentActionDetail: { color: Colors.gray[500], fontSize: 9, lineHeight: 14, marginTop: 3, maxWidth: 285 },
});
