import { StyleSheet, Text, View } from 'react-native';

import { PromorangMark } from '@/components/brand/PromorangMark';
import { Colors } from '@/constants/DesignTokens';

export function PromorangValidReceipt({
  title,
  reference,
  nextBenefit,
}: {
  title: string;
  reference?: string;
  nextBenefit?: string;
}) {
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={styles.head}>
        <PromorangMark size={36} />
        <View>
          <Text style={styles.brand}>PROMORANG</Text>
          <Text style={styles.valid}>VALID</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.copy}>This is a Promorang PromoCard redemption. The perk is used.</Text>
      {reference ? <Text style={styles.ref}>Ref {reference}</Text> : null}
      {nextBenefit ? <Text style={styles.next}>Next for this person: {nextBenefit}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,85,0,0.4)',
    backgroundColor: '#0b0b0c',
    padding: 20,
    marginBottom: 14,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2.2, fontWeight: '800' },
  valid: { color: Colors.primary, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  title: { color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 12 },
  copy: { color: Colors.gray[400], fontSize: 13, lineHeight: 19, marginTop: 6 },
  ref: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 11, marginTop: 10 },
  next: { color: Colors.white, fontSize: 12, marginTop: 8 },
});
