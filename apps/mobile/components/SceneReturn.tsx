import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors } from '@/constants/DesignTokens';

type Props = {
  sceneName?: string | null;
};

export function SceneReturn({ sceneName }: Props) {
  return (
    <View style={styles.shell}>
      <View style={styles.orbit}><Ionicons name="heart" size={22} color={Colors.primary} /></View>
      <Text style={styles.eyebrow}>AFTER THE MOMENT</Text>
      <Text style={styles.title}>The night ends. The Scene remembers you.</Text>
      <Text style={styles.intro}>Keep {sceneName || 'this Scene'} close—the people, places and invitations that feel like your world should be easier to find the next time.</Text>
      <View style={styles.thread}><View style={styles.threadDot} /><View style={styles.threadLine} /><Text style={styles.threadText}>Your next invitation should feel connected, not random.</Text></View>

      <Pressable accessibilityRole="button" style={styles.action} onPress={() => router.push('/discover')}>
        <Text style={styles.actionText}>See what this opens next</Text>
        <Ionicons name="arrow-forward" size={17} color={Colors.black} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { marginTop: 13, padding: 20, borderRadius: BorderRadius['2xl'], backgroundColor: '#15120F', borderWidth: 1, borderColor: 'rgba(255,176,103,.18)', overflow: 'hidden' },
  orbit: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash, borderWidth: 1, borderColor: 'rgba(255,106,26,.22)' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .9, marginTop: 22 },
  title: { color: Colors.white, fontSize: 26, lineHeight: 29, fontWeight: '800', letterSpacing: -.8, marginTop: 7, maxWidth: 300 },
  intro: { color: Colors.gray[400], fontSize: 13, lineHeight: 19, marginTop: 11, maxWidth: 320 },
  thread: { flexDirection: 'row', alignItems: 'center', marginTop: 22, backgroundColor: 'transparent' },
  threadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  threadLine: { width: 34, height: StyleSheet.hairlineWidth, backgroundColor: Colors.primary, marginHorizontal: 8 },
  threadText: { flex: 1, color: Colors.gray[300], fontSize: 12, lineHeight: 17, fontStyle: 'italic' },
  action: { marginTop: 22, height: 48, borderRadius: 16, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
});
