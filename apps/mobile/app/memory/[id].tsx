import { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Scene } from '@promorang/shared';

type MemoryDetail = {
  id: string;
  title: string;
  rarity: string;
  legacy_score: number;
  issued_at: string;
  collection_key: string | null;
  metadata: Record<string, unknown> | null;
  moment_id: string | null;
  moments?: { title?: string | null; location?: string | null; image_url?: string | null; starts_at?: string | null; description?: string | null } | null;
};

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [memory, setMemory] = useState<MemoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [relatedMoments, setRelatedMoments] = useState<Array<{ id: string; title: string; starts_at?: string | null; location?: string | null }>>([]);

  useEffect(() => {
    if (!id || !user) return setLoading(false);
    let active = true;
    void (async () => {
      const { data, error: queryError } = await supabase.from('memories')
        .select('id, title, rarity, legacy_score, issued_at, collection_key, metadata, moment_id, moments:moment_id(title, location, image_url, starts_at, description)')
        .eq('id', id).eq('user_id', user.id).maybeSingle();
        if (!active) return;
        setMemory((data as MemoryDetail | null) || null);
        setError(queryError ? 'This memory could not be opened right now.' : data ? null : 'This memory is no longer available.');
        if (data?.moment_id) {
          const { data: links } = await (supabase as any).from('moment_scene_links').select('scene_id, relationship, scenes(*)').eq('moment_id', data.moment_id).order('relationship').limit(1);
          const linkedScene = links?.[0]?.scenes as Scene | undefined;
          if (active && linkedScene) {
            setScene(linkedScene);
            const { data: related } = await (supabase as any).from('moment_scene_links').select('moments(id,title,starts_at,location,status)').eq('scene_id', linkedScene.id).limit(8);
            if (active) setRelatedMoments((related || []).map((link: any) => link.moments).filter((item: any) => item && item.id !== data.moment_id && (!item.status || item.status === 'active')).sort((a: any, b: any) => new Date(a.starts_at || 0).getTime() - new Date(b.starts_at || 0).getTime()).slice(0, 2));
          }
        }
        setLoading(false);
    })();
    return () => { active = false; };
  }, [id, user]);

  if (loading) return <View style={styles.state}><ActivityIndicator color={Colors.primary} /><Text style={styles.stateCopy}>Opening the memory…</Text></View>;
  if (!memory) return <View style={styles.state}><Ionicons name="images-outline" size={34} color={Colors.gray[500]} /><Text style={styles.stateTitle}>Memory unavailable</Text><Text style={styles.stateCopy}>{error}</Text><Pressable style={styles.lightAction} onPress={() => router.back()}><Text style={styles.lightActionText}>Return to your Vault</Text></Pressable></View>;

  const moment = memory.moments;
  const date = new Date(memory.issued_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topbar}><Pressable accessibilityLabel="Back to Vault" onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={Colors.white} /></Pressable><Text style={styles.privateLabel}>PRIVATE MEMORY</Text><View style={styles.topbarSpacer} /></View>
      <ImageBackground source={moment?.image_url ? { uri: moment.image_url } : undefined} style={styles.artifact} imageStyle={styles.artifactImage}>
        <View style={styles.shade} />
        <View style={styles.artifactTop}><Text style={styles.rarity}>{(memory.rarity || 'KEPT').toUpperCase()}</Text><Ionicons name="lock-closed" size={15} color={Colors.white} /></View>
        <View style={styles.artifactCopy}><Text style={styles.place}>{moment?.location || memory.collection_key || 'PROMORANG'}</Text><Text style={styles.title}>{memory.title}</Text><Text style={styles.date}>KEPT {date.toUpperCase()}</Text></View>
      </ImageBackground>

      <View style={styles.note}>
        <Text style={styles.noteEyebrow}>WHY THIS STAYED</Text>
        <Text style={styles.noteTitle}>You were part of what happened.</Text>
        <Text style={styles.noteBody}>{moment?.description || 'This memory is a private record of showing up and taking part. It keeps the Moment close without turning your experience into a score.'}</Text>
      </View>

      <View style={styles.trace}>
        {[['location', 'Where', moment?.location || 'Part of your Promorang story'], ['sparkles', 'What returned', memory.legacy_score > 0 ? 'Recognition that stays with this memory' : 'A verified place in the story'], ['archive', 'Where it lives', 'Privately in your Vault']].map(([icon, label, value]) => (
          <View key={label} style={styles.traceLine}><View style={styles.traceIcon}><Ionicons name={icon as any} size={17} color={Colors.primary} /></View><View style={styles.traceCopy}><Text style={styles.traceLabel}>{label}</Text><Text style={styles.traceValue}>{value}</Text></View></View>
        ))}
      </View>

      <View style={styles.returnCard}>
        <Text style={styles.returnEyebrow}>{scene ? 'THE SCENE AROUND THIS MEMORY' : 'WHERE THIS CAN LEAD'}</Text>
        <Text style={styles.returnTitle}>{scene ? `${scene.title} is still gathering.` : moment?.title ? `Return to ${moment.title}` : 'Find the next place that feels like yours.'}</Text>
        <Text style={styles.returnBody}>{scene?.metadata?.next_invitation || scene?.description || 'Revisit the people, place, and context around this memory—or discover what is gathering next.'}</Text>
        {scene ? <Pressable style={styles.returnAction} onPress={() => router.push(`/scene/${scene.slug}` as any)}><Text style={styles.returnActionText}>Step back into the Scene</Text><Ionicons name="arrow-forward" size={17} color={Colors.black} /></Pressable> : <Pressable style={styles.returnAction} onPress={() => router.push(memory.moment_id ? `/moment/${memory.moment_id}` as any : '/discover')}><Text style={styles.returnActionText}>{memory.moment_id ? 'Return to the Moment' : 'Discover what is next'}</Text><Ionicons name="arrow-forward" size={17} color={Colors.black} /></Pressable>}
      </View>

      {relatedMoments.length > 0 ? <View style={styles.nextGatherings}>
        <Text style={styles.noteEyebrow}>COMING BACK INTO VIEW</Text><Text style={styles.nextTitle}>The next reasons to return</Text>
        {relatedMoments.map((item) => <Pressable accessibilityRole="button" key={item.id} style={styles.nextMoment} onPress={() => router.push(`/moment/${item.id}` as any)}><View style={styles.nextDate}><Text style={styles.nextDateMonth}>{item.starts_at ? new Date(item.starts_at).toLocaleDateString(undefined, { month: 'short' }).toUpperCase() : 'NEXT'}</Text><Text style={styles.nextDateDay}>{item.starts_at ? new Date(item.starts_at).getDate() : '•'}</Text></View><View style={styles.nextCopy}><Text style={styles.nextMomentTitle}>{item.title}</Text><Text style={styles.nextPlace}>{item.location || scene?.city || 'Part of the Scene'}</Text></View><Ionicons name="arrow-forward" size={17} color={Colors.gray[500]} /></Pressable>)}
      </View> : null}
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black }, content: { paddingHorizontal: Spacing.container, paddingTop: 16 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, backgroundColor: 'transparent' }, back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border }, privateLabel: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.1 }, topbarSpacer: { width: 40, backgroundColor: 'transparent' },
  artifact: { height: 460, padding: 18, justifyContent: 'space-between', overflow: 'hidden', borderRadius: BorderRadius['2xl'], backgroundColor: '#211810' }, artifactImage: { borderRadius: BorderRadius['2xl'] }, shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.35)' }, artifactTop: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' }, rarity: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1, paddingHorizontal: 10, paddingVertical: 7, overflow: 'hidden', borderRadius: 14, backgroundColor: 'rgba(0,0,0,.5)' }, artifactCopy: { backgroundColor: 'transparent' }, place: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: .8, textTransform: 'uppercase' }, title: { color: Colors.white, fontSize: 36, lineHeight: 38, fontWeight: '900', letterSpacing: -1.4, marginTop: 7 }, date: { color: 'rgba(255,255,255,.62)', fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .7, marginTop: 12 },
  note: { paddingVertical: 28, backgroundColor: 'transparent' }, noteEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1 }, noteTitle: { color: Colors.white, fontSize: 24, lineHeight: 28, fontWeight: '900', letterSpacing: -.6, marginTop: 8 }, noteBody: { color: Colors.gray[400], fontSize: 13, lineHeight: 20, marginTop: 9 },
  trace: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.border, paddingVertical: 7, backgroundColor: 'transparent' }, traceLine: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, backgroundColor: 'transparent' }, traceIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash, marginRight: 11 }, traceCopy: { flex: 1, backgroundColor: 'transparent' }, traceLabel: { color: Colors.gray[500], fontSize: 11 }, traceValue: { color: Colors.white, fontSize: 13, fontWeight: '700', marginTop: 2 },
  returnCard: { marginTop: 26, padding: 20, borderRadius: BorderRadius['2xl'], backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.28)' }, returnEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1 }, returnTitle: { color: Colors.white, fontSize: 23, lineHeight: 27, fontWeight: '900', letterSpacing: -.5, marginTop: 8 }, returnBody: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 7 }, returnAction: { minHeight: 47, marginTop: 17, borderRadius: 24, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, returnActionText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
  nextGatherings: { marginTop: 30, backgroundColor: 'transparent' }, nextTitle: { color: Colors.white, fontSize: 24, lineHeight: 28, fontWeight: '900', letterSpacing: -.6, marginTop: 7, marginBottom: 14 }, nextMoment: { minHeight: 76, flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, paddingVertical: 11, backgroundColor: 'transparent' }, nextDate: { width: 48, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray[900], marginRight: 12 }, nextDateMonth: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .5 }, nextDateDay: { color: Colors.white, fontSize: 18, fontWeight: '900', marginTop: 1 }, nextCopy: { flex: 1, paddingRight: 8, backgroundColor: 'transparent' }, nextMomentTitle: { color: Colors.white, fontSize: 14, fontWeight: '800' }, nextPlace: { color: Colors.gray[500], fontSize: 11, marginTop: 4 },
  state: { flex: 1, minHeight: 600, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 10, backgroundColor: Colors.black }, stateTitle: { color: Colors.white, fontSize: 20, fontWeight: '800' }, stateCopy: { color: Colors.gray[500], fontSize: 12, textAlign: 'center' }, lightAction: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 20, backgroundColor: Colors.gray[900] }, lightActionText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
});
