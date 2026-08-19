import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.icon}><Ionicons name="compass-outline" size={34} color="#FF6A1A" /></View>
        <Text style={styles.eyebrow}>OFF THE MAP</Text>
        <Text style={styles.title}>This part of the Scene is not available.</Text>
        <Text style={styles.detail}>The link may have expired or the destination may have moved.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)')} style={styles.link}><Text style={styles.linkText}>Return to Today</Text><Ionicons name="arrow-forward" size={18} color="#080808" /></Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#080808',
  },
  icon: { width: 70, height: 70, borderRadius: 14, backgroundColor: '#171716', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  eyebrow: { color: '#FF6A1A', fontSize: 12, fontWeight: '800', marginBottom: 10 },
  title: {
    color: '#F7F5F2',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    textAlign: 'center',
    maxWidth: 340,
  },
  detail: { color: '#918C85', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 12, maxWidth: 320 },
  link: {
    marginTop: 28,
    minHeight: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 10,
    backgroundColor: '#FF6A1A',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#080808',
  },
});
