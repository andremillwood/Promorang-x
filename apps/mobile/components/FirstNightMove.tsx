import { Ionicons } from '@expo/vector-icons';
import { getOpeningMove, type OpeningPathChoice } from '@promorang/shared';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ResponsivePressable as Pressable } from '@/components/ResponsivePressable';
import { BorderRadius, Colors } from '@/constants/DesignTokens';
import { useAuth } from '@/context/AuthContext';

type Props = {
  role: string | null;
  hostedMomentCount: number;
  joinedMomentCount: number;
};

export function FirstNightMove({ role, hostedMomentCount, joinedMomentCount }: Props) {
  const { chooseRole } = useAuth();
  const move = getOpeningMove({ role, hostedMomentCount, joinedMomentCount });

  const choose = async (choice: OpeningPathChoice) => {
    if (choice === 'place') {
      await chooseRole('host');
      router.push('/studio/create-moment');
      return;
    }
    router.push('/discover');
  };

  if (move.path === 'choose_path') {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>{move.eyebrow.toUpperCase()}</Text>
        <Text style={styles.headline}>{move.headline}</Text>
        <Text style={styles.body}>{move.body}</Text>
        <View style={styles.plain}>
          <Text style={styles.plainLabel}>IN PLAIN ENGLISH</Text>
          <Text style={styles.plainBody}>{move.plainEnglish}</Text>
        </View>
        <Pressable style={styles.primary} onPress={() => void choose('place')}>
          <View>
            <Text style={styles.primaryTitle}>I have a place</Text>
            <Text style={styles.primaryDetail}>A bar, restaurant, venue, or night.</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.black} />
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => void choose('out')}>
          <View>
            <Text style={styles.secondaryTitle}>I am going out</Text>
            <Text style={styles.secondaryDetail}>Find something worth showing up for.</Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{move.eyebrow.toUpperCase()}</Text>
      <Text style={styles.headline}>{move.headline}</Text>
      <Text style={styles.body}>{move.body}</Text>
      <View style={styles.plain}>
        <Text style={styles.plainLabel}>IN PLAIN ENGLISH</Text>
        <Text style={styles.plainBody}>{move.plainEnglish}</Text>
      </View>
      <Pressable
        style={styles.primary}
        onPress={() => router.push(move.destination === 'create' ? '/studio/create-moment' : '/discover')}
      >
        <Text style={styles.primaryTitle}>{move.ctaLabel}</Text>
        <Ionicons name="arrow-forward" size={18} color={Colors.black} />
      </Pressable>
      <View style={styles.ticket}>
        <View style={styles.ticketMain}>
          <Text style={styles.ticketKicker}>{move.eyebrow.toUpperCase()}</Text>
          <Text style={styles.ticketTitle}>{move.ticketTitle}</Text>
          <Text style={styles.ticketDetail}>{move.ticketDetail}</Text>
        </View>
        <View style={styles.ticketStub}>
          <Text style={styles.ticketStubText}>{move.ticketStub}</Text>
        </View>
      </View>
      {move.steps.map((step) => (
        <View key={step.label} style={styles.stepRow}>
          <Text style={styles.stepLabel}>{step.label}</Text>
          <View style={styles.stepCopy}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 16, padding: 18, borderRadius: BorderRadius['2xl'], backgroundColor: '#11100F', borderWidth: 1, borderColor: 'rgba(255,106,26,.28)' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 1.2 },
  headline: { color: Colors.white, fontSize: 32, lineHeight: 34, fontWeight: '900', letterSpacing: -1.2, marginTop: 10 },
  body: { color: Colors.gray[300], fontSize: 15, lineHeight: 22, marginTop: 12 },
  plain: { marginTop: 14, padding: 12, borderRadius: 16, backgroundColor: 'rgba(251,191,36,.08)', borderWidth: 1, borderColor: 'rgba(251,191,36,.22)' },
  plainLabel: { color: '#FDE68A', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  plainBody: { color: Colors.white, fontSize: 14, lineHeight: 20, marginTop: 6 },
  primary: { marginTop: 16, minHeight: 56, borderRadius: 18, backgroundColor: Colors.primary, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  primaryTitle: { color: Colors.black, fontSize: 15, fontWeight: '900' },
  primaryDetail: { color: 'rgba(0,0,0,.62)', fontSize: 12, marginTop: 2, maxWidth: 240 },
  secondary: { marginTop: 10, minHeight: 56, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,.16)', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secondaryTitle: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  secondaryDetail: { color: Colors.gray[400], fontSize: 12, marginTop: 2, maxWidth: 240 },
  ticket: { marginTop: 16, minHeight: 132, borderRadius: 18, overflow: 'hidden', flexDirection: 'row', backgroundColor: '#F4E7D4' },
  ticketMain: { flex: 1, padding: 16 },
  ticketKicker: { color: '#9A4A16', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  ticketTitle: { color: '#1A120C', fontSize: 22, fontWeight: '900', marginTop: 4 },
  ticketDetail: { color: '#4A3B2F', fontSize: 13, lineHeight: 18, marginTop: 8 },
  ticketStub: { width: 54, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: 'rgba(26,18,12,.16)', backgroundColor: '#E8D7BE' },
  ticketStubText: { color: '#1A120C', fontSize: 11, fontWeight: '800', transform: [{ rotate: '90deg' }] },
  stepRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  stepLabel: { width: 28, color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 11 },
  stepCopy: { flex: 1 },
  stepTitle: { color: Colors.white, fontSize: 14, fontWeight: '800' },
  stepText: { color: Colors.gray[400], fontSize: 13, lineHeight: 18, marginTop: 4 },
});
