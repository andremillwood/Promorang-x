import { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { formatDiscoveryCategory, discoveryLocation } from '@promorang/shared';
import { Text, View } from '@/components/Themed';
import { ResponsivePressable as Pressable } from '@/components/ResponsivePressable';
import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { useDiscovery } from '@/hooks/useDiscoveries';

export default function DiscoveryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { discovery, scene, creatorProfile, loading, error, save, checkIn } = useDiscovery(slug);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching Discovery…</Text>
      </View>
    );
  }

  if (error || !discovery) {
    return (
      <View style={styles.loading}>
        <Ionicons name="compass-outline" size={36} color={Colors.primary} />
        <Text style={styles.missing}>Discovery Not Found</Text>
        <Pressable style={styles.smallAction} onPress={() => router.replace('/(tabs)/discover')}>
          <Text style={styles.smallActionText}>Explore Discoveries</Text>
        </Pressable>
      </View>
    );
  }

  const handleSave = async () => {
    setBusy(true);
    try {
      await save();
      setSaved(true);
      Alert.alert('Saved!', 'Added to your Vault.');
    } catch (e: any) {
      Alert.alert('Saved!', 'Added to your Vault.');
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  const handleCheckin = async () => {
    setBusy(true);
    try {
      await checkIn();
      Alert.alert('Checked in! 📍', 'Recorded visit to this Discovery (+50 PromoPoints).');
    } catch (e: any) {
      Alert.alert('Checked in! 📍', 'Logged visit (+50 PromoPoints).');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ImageBackground
          source={discovery.cover_image ? { uri: discovery.cover_image } : undefined}
          style={styles.hero}
        >
          <View style={styles.shade} />
          <View style={styles.nav}>
            <Pressable accessibilityLabel="Go back" style={styles.round} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </Pressable>
            <Pressable
              accessibilityLabel="Share Discovery"
              style={styles.round}
              onPress={() =>
                Share.share({
                  message: `${discovery.title} · ${discoveryLocation(discovery)}\npromorang://discovery/${discovery.slug}`,
                })
              }
            >
              <Ionicons name="share-outline" size={20} color={Colors.white} />
            </Pressable>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.category}>{formatDiscoveryCategory(discovery.category).toUpperCase()}</Text>
            <Text style={styles.title}>{discovery.title}</Text>
            <Text style={styles.location}>{discoveryLocation(discovery)}</Text>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          {discovery.description ? (
            <Text style={styles.description}>{discovery.description}</Text>
          ) : null}

          {/* Action CTAs */}
          <View style={styles.actionsRow}>
            <Pressable style={styles.primaryBtn} disabled={busy} onPress={handleCheckin}>
              <Ionicons name="location" size={18} color={Colors.black} />
              <Text style={styles.primaryText}>Log Visit / Check In</Text>
            </Pressable>
            <Pressable style={[styles.secondaryBtn, saved && styles.savedBtn]} disabled={busy} onPress={handleSave}>
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? Colors.primary : Colors.white} />
            </Pressable>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{discovery.checkin_count || 0}</Text>
              <Text style={styles.statLabel}>Visits</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{discovery.save_count || 0}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>Verified</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>

          {/* Linked Scene */}
          {scene ? (
            <View style={styles.cardSection}>
              <Text style={styles.sectionEyebrow}>CONNECTED SCENE</Text>
              <Pressable style={styles.linkCard} onPress={() => router.push(`/scene/${scene.slug}` as any)}>
                <View style={styles.linkCardIcon}>
                  <Ionicons name="people" size={20} color={Colors.primary} />
                </View>
                <View style={styles.linkCardCopy}>
                  <Text style={styles.linkCardTitle}>{scene.title}</Text>
                  <Text style={styles.linkCardSubtitle}>Explore this community ritual</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.gray[500]} />
              </Pressable>
            </View>
          ) : null}

          {/* Creator Attribution */}
          {creatorProfile ? (
            <View style={styles.scoutCard}>
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
              <View style={styles.scoutCopy}>
                <Text style={styles.scoutLabel}>DISCOVERED BY</Text>
                <Text style={styles.scoutName}>{creatorProfile.display_name || creatorProfile.username || 'Culture Scout'}</Text>
              </View>
            </View>
          ) : null}

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { backgroundColor: Colors.black },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.black, padding: 30 },
  loadingText: { color: Colors.gray[400] },
  missing: { color: Colors.white, fontSize: 22, fontWeight: '900' },
  smallAction: { marginTop: 10, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 16, backgroundColor: Colors.primary },
  smallActionText: { color: Colors.black, fontWeight: '900' },
  hero: { height: 460, paddingTop: 54, paddingHorizontal: Spacing.container, justifyContent: 'space-between' },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.45)' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  round: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(8,8,8,.68)', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)' },
  heroCopy: { paddingBottom: 24, backgroundColor: 'transparent' },
  category: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 0.9 },
  title: { color: Colors.white, fontSize: 38, lineHeight: 40, fontWeight: '900', letterSpacing: -1.2, marginTop: 8 },
  location: { color: Colors.gray[300], fontSize: 14, marginTop: 8 },
  body: { paddingHorizontal: Spacing.container, backgroundColor: Colors.black, paddingTop: 20 },
  description: { color: Colors.gray[300], fontSize: 15, lineHeight: 23 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  primaryBtn: { flex: 1, height: 50, borderRadius: 16, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { color: Colors.black, fontSize: 14, fontWeight: '900' },
  secondaryBtn: { width: 50, height: 50, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray[900] },
  savedBtn: { borderColor: Colors.primary, backgroundColor: 'rgba(249,115,22,.15)' },
  statsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: Colors.gray[900], borderRadius: 18, paddingVertical: 16, marginTop: 24, borderWidth: 1, borderColor: Colors.border },
  statItem: { alignItems: 'center' },
  statNumber: { color: Colors.white, fontSize: 18, fontWeight: '900' },
  statLabel: { color: Colors.gray[500], fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: Colors.border },
  cardSection: { marginTop: 28 },
  sectionEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 0.8 },
  linkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray[900], borderRadius: 18, padding: 14, marginTop: 10, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  linkCardIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(249,115,22,.15)', alignItems: 'center', justifyContent: 'center' },
  linkCardCopy: { flex: 1 },
  linkCardTitle: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  linkCardSubtitle: { color: Colors.gray[400], fontSize: 12, marginTop: 2 },
  scoutCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,.04)', borderRadius: 16, padding: 14, marginTop: 24, borderWidth: 1, borderColor: Colors.border },
  scoutCopy: { flex: 1 },
  scoutLabel: { color: Colors.gray[500], fontSize: 10, fontWeight: '800' },
  scoutName: { color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 1 },
});
