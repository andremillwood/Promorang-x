import { Ionicons } from '@expo/vector-icons';
import { ACTIVATION_REVIEW_NEXT_DECISIONS, ACTIVATION_SUCCESS_LANGUAGE, SCENE_RETURN_CARDS } from '@promorang/shared';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors } from '@/constants/DesignTokens';

type Props = {
  sceneName?: string | null;
};

const roleIcons = {
  participant: 'people',
  creator: 'megaphone',
  host: 'location',
  brand: 'business',
} as const;

export function SceneReturn({ sceneName }: Props) {
  return (
    <View style={styles.shell}>
      <View style={styles.headingRow}>
        <View style={styles.icon}><Ionicons name="heart-circle" size={20} color={Colors.primary} /></View>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>THE SCENE KEEPS IT MOVING</Text>
          <Text style={styles.title}>One Moment ends. The relationships should not.</Text>
        </View>
      </View>
      <Text style={styles.intro}>{sceneName || 'This Scene'} connects the people, content, places, and partners who keep showing up. That is how one action becomes belonging, familiar faces, and repeat demand.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
        {SCENE_RETURN_CARDS.map((item) => (
          <View key={item.label} style={styles.card}>
            <Ionicons name={roleIcons[item.role]} size={18} color={Colors.primary} />
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDetail}>{item.detail}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.sharedReturn}>
        <Text style={styles.sharedLabel}>SHARED RETURN</Text>
        <Text style={styles.sharedTitle}>{ACTIVATION_SUCCESS_LANGUAGE.sharedReturn}</Text>
        <View style={styles.decisionRow}>
          {ACTIVATION_REVIEW_NEXT_DECISIONS.map((decision) => (
            <View key={decision.id} style={styles.decisionPill}>
              <Text style={styles.decisionText}>{decision.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable accessibilityRole="button" style={styles.action} onPress={() => router.push('/discover')}>
        <Text style={styles.actionText}>Find more in this Scene</Text>
        <Ionicons name="arrow-forward" size={17} color={Colors.black} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { marginTop: 13, paddingVertical: 17, borderRadius: BorderRadius['2xl'], backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, backgroundColor: 'transparent' },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash, marginRight: 10 },
  headingCopy: { flex: 1, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .6 },
  title: { color: Colors.white, fontSize: 15, lineHeight: 20, fontWeight: '800', letterSpacing: -.25, marginTop: 4 },
  intro: { color: Colors.gray[400], fontSize: 10, lineHeight: 16, marginTop: 11, paddingHorizontal: 16 },
  cards: { gap: 9, paddingHorizontal: 16, paddingTop: 15 },
  card: { width: 205, minHeight: 160, padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[800], borderWidth: 1, borderColor: Colors.border },
  cardLabel: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .5, marginTop: 12 },
  cardTitle: { color: Colors.white, fontSize: 12, lineHeight: 16, fontWeight: '800', marginTop: 5 },
  cardDetail: { color: Colors.gray[500], fontSize: 9, lineHeight: 14, marginTop: 6 },
  sharedReturn: { marginHorizontal: 16, marginTop: 12, padding: 13, borderRadius: BorderRadius.xl, backgroundColor: 'rgba(103,197,135,.08)', borderWidth: 1, borderColor: 'rgba(103,197,135,.18)' },
  sharedLabel: { color: Colors.success, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .6 },
  sharedTitle: { color: Colors.white, fontSize: 10, lineHeight: 15, fontWeight: '700', marginTop: 4 },
  decisionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, backgroundColor: 'transparent' },
  decisionPill: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: 'rgba(103,197,135,.16)' },
  decisionText: { color: Colors.success, fontFamily: 'SpaceMono', fontSize: 6.5, letterSpacing: .4, textTransform: 'uppercase' },
  action: { marginHorizontal: 16, marginTop: 12, height: 45, borderRadius: 16, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionText: { color: Colors.black, fontSize: 11, fontWeight: '900' },
});
