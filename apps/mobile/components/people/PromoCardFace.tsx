import { StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors } from '@/constants/DesignTokens';

type PromoCardFaceProps = {
  holder?: string;
  available?: string;
  limit?: string;
  places?: string;
};

export function PromoCardFace({
  holder = 'Member',
  available = '0 pts',
  limit = '0 keys',
  places = 'Your perks live here',
}: PromoCardFaceProps) {
  return (
    <View style={styles.card} accessibilityLabel="PromoCard">
      <View style={styles.top}>
        <View>
          <Text style={styles.brand}>PROMORANG</Text>
          <Text style={styles.title}>PromoCard</Text>
        </View>
        <View style={styles.chip} />
      </View>
      <View>
        <Text style={styles.meta}>On the card</Text>
        <Text style={styles.available}>{available}</Text>
        <Text style={styles.limit}>
          {limit} · {places}
        </Text>
      </View>
      <View style={styles.foot}>
        <Text style={styles.holder}>{holder}</Text>
        <Text style={styles.serial}>PR · 0842</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 188,
    borderRadius: BorderRadius['2xl'],
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: '#16120E',
    borderWidth: 1,
    borderColor: 'rgba(255,176,103,0.28)',
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { color: 'rgba(255,210,140,0.8)', fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2.2, fontWeight: '800' },
  title: { color: Colors.white, fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginTop: 4 },
  chip: {
    width: 44,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8B15A',
  },
  meta: { color: Colors.gray[400], fontSize: 11, letterSpacing: 0.4 },
  available: { color: '#FFE4B5', fontSize: 34, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  limit: { color: Colors.gray[400], fontSize: 12, marginTop: 4 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  holder: { color: Colors.gray[300], fontSize: 12 },
  serial: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 1.4 },
});
