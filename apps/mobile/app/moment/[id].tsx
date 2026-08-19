import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Platform, Pressable, ScrollView, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';
import type { Moment } from '@/hooks/useMoments';
import type { Scene } from '@promorang/shared';
import { useSavedObjects } from '@/hooks/useSavedObjects';
import { PoweredParticipation } from '@/components/PoweredParticipation';
import { SceneReturn } from '@/components/SceneReturn';
import { MomentAccess } from '@/components/MomentAccess';
import { MomentNow } from '@/components/MomentNow';
import { useMomentParticipation } from '@/hooks/useMomentParticipation';
import { SubMomentGovernance } from '@/components/SubMomentGovernance';

const fallbackMomentImage = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=88';

export default function MomentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggle } = useSavedObjects();
  const saved = isSaved('moment', id || '');
  const participation = useMomentParticipation(id);
  const going = participation.joined;

  const toggleGoing = async () => {
    try {
      if (going) await participation.leave();
      else await participation.join();
    } catch (error: any) {
      Alert.alert(going ? 'Could not leave Moment' : 'Could not join Moment', error?.message || 'Please try again.');
    }
  };
  const [scene, setScene] = useState<Scene | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setMoment(null);
        setLoading(false);
        return;
      }
      if (id.startsWith('demo')) {
        const { DEMO_MOMENTS } = require('@/hooks/useMoments');
        const demoItem = DEMO_MOMENTS.find((m: any) => m.id === id) || DEMO_MOMENTS[0];
        setMoment(demoItem);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('moments').select('*').eq('id', id).maybeSingle();
      setMoment(data || null);
      const { data: sceneLink } = await (supabase as any).from('moment_scene_links').select('scenes(*)').eq('moment_id', id).order('relationship', { ascending: true }).limit(1).maybeSingle();
      setScene(sceneLink?.scenes || null);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.loadingText}>Entering the moment…</Text></View>;
  if (!moment) {
    return (
      <View style={styles.notFound}>
        <View style={styles.notFoundIcon}><Ionicons name="calendar-clear-outline" size={30} color={Colors.primary} /></View>
        <Text style={styles.notFoundTitle}>Moment unavailable</Text>
        <Text style={styles.notFoundDetail}>This Moment could not be found or is no longer available.</Text>
        <Pressable style={styles.notFoundAction} onPress={() => router.replace('/discover')}><Text style={styles.notFoundActionText}>Explore what is live</Text><Ionicons name="arrow-forward" size={16} color={Colors.black} /></Pressable>
      </View>
    );
  }
  const item = moment;
  const shareMoment = () => {
    Share.share({ message: `${item.title} · ${item.location || 'Promorang'}\nOpen in Promorang: promorang://moment/${item.id}` }).catch(() => undefined);
  };
  const momentType = item.type ? `${item.type.charAt(0).toUpperCase()}${item.type.slice(1)} Scene` : 'Promorang Scene';
  const statusLabel = item.status ? item.status.replace(/_/g, ' ').toUpperCase() : 'MOMENT';
  const accessLabel = item.status === 'active' ? 'Open now' : statusLabel.toLowerCase();
  const rewardLabel = (item as Moment & { reward?: string | null }).reward || 'Proof may unlock value';
  const journey = participation.journey;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: item.image_url || fallbackMomentImage }} style={styles.hero}>
          <View style={styles.shade} />
          <View style={styles.nav}>
            <Pressable accessibilityLabel="Go back" style={styles.roundButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
            <View style={styles.navRight}>
              <Pressable accessibilityLabel="Share moment" style={styles.roundButton} onPress={shareMoment}><Ionicons name="share-outline" size={20} color={Colors.white} /></Pressable>
              <Pressable accessibilityLabel="Save moment" style={styles.roundButton} onPress={() => toggle({ object_type: 'moment', object_id: item.id, title: item.title, subtitle: item.location, image_url: item.image_url || null, metadata: { type: item.type } }).catch((error) => Alert.alert('Could not save', error.message))}><Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? Colors.primary : Colors.white} /></Pressable>
            </View>
          </View>
          <View style={styles.heroBody}>
            <View style={styles.live}><View style={styles.liveDot} /><Text style={styles.liveText}>{statusLabel}</Text></View>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.hostRow}><View style={styles.hostAvatar}><Text style={styles.hostInitial}>{momentType.charAt(0)}</Text></View><View style={styles.hostCopy}><Text style={styles.hostLabel}>SCENE</Text><Text style={styles.hostName}>{momentType}</Text></View><Ionicons name="checkmark-circle" size={18} color={Colors.primary} /></View>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <View style={styles.quickFacts}>
            <Fact icon="pulse" label="Status" value={item.status || 'active'} />
            <View style={styles.factDivider} />
            <Fact icon="location" label="Place" value={item.location || 'Promorang'} />
            <View style={styles.factDivider} />
            <Fact icon="ticket" label="Access" value={accessLabel} />
          </View>

          <Text style={styles.sectionEyebrow}>THE MOMENT</Text>
          <Text style={styles.description}>{item.description}</Text>
          {scene ? <Pressable style={styles.sceneLink} onPress={() => router.push(`/scene/${scene.slug}` as any)}><View style={styles.sceneMark}><Ionicons name="people" size={19} color={Colors.primary} /></View><View style={styles.sceneLinkCopy}><Text style={styles.sceneLinkLabel}>PART OF {scene.title.toUpperCase()}</Text><Text style={styles.sceneLinkTitle}>{scene.metadata?.tagline || 'Meet the people and places around this Moment.'}</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.gray[500]} /></Pressable> : null}
          <Pressable style={styles.peopleRow} onPress={() => router.push({ pathname: '/search', params: { type: 'people', q: item.title } } as any)}>
            <View style={styles.avatars}>{['#DD8B61', '#6C8EAD', '#8C6F5B', '#7D986D'].map((color, index) => <View key={color} style={[styles.avatar, { backgroundColor: color, marginLeft: index ? -8 : 0 }]} />)}</View>
            <View style={styles.peopleCopy}><Text style={styles.peopleTitle}>People connected to this Moment</Text><Text style={styles.peopleDetail}>Search scenes, creators, and people around this Moment</Text></View>
            <Ionicons name="chevron-forward" size={19} color={Colors.gray[500]} />
          </Pressable>

          <Text style={styles.sectionEyebrow}>{journey?.eyebrow.toUpperCase() || 'YOUR ACTION'}</Text>
          <View style={styles.actionCard}>
            <View style={styles.actionTop}><View style={styles.actionIcon}><Ionicons name={journey?.stage === 'review' ? 'time' : journey?.stage === 'kept' || journey?.stage === 'return' ? 'archive' : 'location'} size={21} color={Colors.primary} /></View><View style={styles.actionCopy}><Text style={styles.actionTitle}>{journey?.title || 'Let the host know you made it'}</Text><Text style={styles.actionDetail}>{journey?.body || 'Check in here and add a capture if the Moment asks for one.'}</Text></View><Text style={styles.gemReward}>{rewardLabel}</Text></View>
            <View style={styles.proofRow}><Proof icon="navigate" text="Be at the place" /><Proof icon="camera" text="Add one capture" /></View>
            <View style={styles.actionButtons}>
              <Pressable style={styles.checkIn} onPress={() => journey?.stage === 'kept' || journey?.stage === 'return' || journey?.stage === 'recognized' ? router.push('/vault') : router.push({ pathname: '/check-in', params: { momentId: item.id, title: item.title, venue: item.location || '' } } as never)}><Text style={styles.checkInText}>{journey?.action.label || 'Check in'}</Text><Ionicons name="arrow-forward" size={17} color={Colors.black} /></Pressable>
              <Pressable style={styles.addProof} onPress={() => router.push({ pathname: '/post', params: { momentId: item.id } } as never)}><Ionicons name="camera" size={17} color={Colors.white} /><Text style={styles.addProofText}>Share a capture</Text></Pressable>
            </View>
          </View>

          <View style={styles.journeyCard}>
            <Text style={styles.journeyScript}>Before · there · after</Text>
            <Text style={styles.journeyIntro}>This Moment stays with you beyond the event page.</Text>
            {[
              ['01', going ? 'Your place is held' : 'Choose to be there', going ? 'You said you’re going.' : 'Save your place when it feels right.'],
              ['02', 'Arrive and leave a trace', 'Check in simply. Share only what belongs to the scene.'],
              ['03', 'Keep what returns with you', 'The memory, any recognition, and the next invitation live in your Vault.'],
            ].map(([number, title, copy]) => (
              <View key={number} style={styles.journeyStep}>
                <Text style={styles.journeyNumber}>{number}</Text>
                <View style={styles.journeyCopy}><Text style={styles.journeyTitle}>{title}</Text><Text style={styles.journeyDetail}>{copy}</Text></View>
              </View>
            ))}
          </View>

          <PoweredParticipation
            momentId={item.id}
            venueName={(item as Moment & { venue_name?: string | null }).venue_name || item.location}
            reward={(item as Moment & { reward?: string | null }).reward}
          />

          <MomentNow momentId={item.id} momentTitle={item.title} onJoin={() => void toggleGoing()} />
          {!going ? <Pressable style={styles.guestEntry} onPress={()=>router.push({pathname:'/guest-rsvp',params:{momentId:item.id,title:item.title}} as never)}><Ionicons name="people-outline" size={19} color={Colors.primary}/><View style={styles.guestEntryCopy}><Text style={styles.guestEntryTitle}>Reserve for a group</Text><Text style={styles.guestEntryDetail}>No account required for your guests.</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.gray[500]}/></Pressable> : null}
          {!(item as Moment & { parent_moment_id?: string | null }).parent_moment_id ? <SubMomentGovernance momentId={item.id} momentTitle={item.title} location={item.location} /> : null}

          <SceneReturn sceneName={momentType} />
          <MomentAccess momentId={item.id} />

          <View style={styles.valueCard}>
            <View style={styles.valueIcon}><Ionicons name="archive" size={20} color={Colors.primary} /></View>
            <View style={styles.valueCopy}><Text style={styles.valueEyebrow}>WHAT YOU KEEP</Text><Text style={styles.valueTitle}>A memory of being part of this</Text><Text style={styles.valueDetail}>Plus any access, invitation, or useful value this Moment opens.</Text></View>
          </View>

          <Pressable style={styles.growCard} onPress={() => router.push('/promoshare')}>
            <View><Text style={styles.growEyebrow}>PROMOSHARE · WHAT YOUR STORY STARTED</Text><Text style={styles.growTitle}>Help the right people find this</Text><Text style={styles.growDetail}>Share with your point of view. See who felt drawn in, joined, visited, or came back because of it.</Text></View>
            <Ionicons name="arrow-up" size={21} color={Colors.white} style={{ transform: [{ rotate: '45deg' }] }} />
          </Pressable>
        </View>
        <View style={{ height: 115 }} />
      </ScrollView>

      <View style={styles.sticky}>
        <View><Text style={styles.stickyLabel}>ACCESS</Text><Text style={styles.stickyValue}>{accessLabel}</Text></View>
        <Pressable disabled={participation.changing || participation.loading} style={[styles.goingButton, going && styles.goingButtonActive, (participation.changing || participation.loading) && { opacity: .6 }]} onPress={() => void toggleGoing()}>{participation.changing ? <ActivityIndicator size="small" color={Colors.black} /> : <Ionicons name={going ? 'checkmark' : 'add'} size={18} color={Colors.black} />}<Text style={styles.goingText}>{going ? 'You’re going' : 'I’m going'}</Text></Pressable>
      </View>
    </View>
  );
}

function Fact({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.fact}><Ionicons name={icon} size={17} color={Colors.primary} /><Text style={styles.factLabel}>{label}</Text><Text style={styles.factValue}>{value}</Text></View>;
}
function Proof({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return <View style={styles.proof}><Ionicons name={icon} size={14} color={Colors.success} /><Text style={styles.proofText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  guestEntry:{marginTop:12,minHeight:62,borderRadius:18,borderWidth:1,borderColor:'rgba(255,106,26,.25)',backgroundColor:'#24160F',paddingHorizontal:15,flexDirection:'row',alignItems:'center',gap:11},guestEntryCopy:{flex:1,backgroundColor:'transparent'},guestEntryTitle:{color:Colors.white,fontSize:13,fontWeight:'900'},guestEntryDetail:{color:Colors.gray[400],fontSize:10,marginTop:3},
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.black },
  loadingText: { color: Colors.gray[500], fontSize: 12 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.container, backgroundColor: Colors.black },
  notFoundIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center' },
  notFoundTitle: { color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 16 },
  notFoundDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 7, maxWidth: 300 },
  notFoundAction: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 19, backgroundColor: Colors.primary, marginTop: 18 },
  notFoundActionText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
  content: { backgroundColor: Colors.black },
  hero: { height: 510, paddingTop: Platform.OS === 'ios' ? 54 : 34, paddingHorizontal: Spacing.container, justifyContent: 'space-between' },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.34)' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  navRight: { flexDirection: 'row', gap: 8, backgroundColor: 'transparent' },
  roundButton: { width: 41, height: 41, borderRadius: 21, backgroundColor: 'rgba(8,8,8,.7)', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center' },
  heroBody: { paddingBottom: 25, backgroundColor: 'transparent' },
  live: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(8,8,8,.76)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  liveText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  location: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .7, marginTop: 15, textTransform: 'uppercase' },
  title: { color: Colors.white, fontSize: 38, lineHeight: 43, fontWeight: '800', letterSpacing: -1.3, marginTop: 6 },
  hostRow: { flexDirection: 'row', alignItems: 'center', marginTop: 17, backgroundColor: 'transparent' },
  hostAvatar: { width: 35, height: 35, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  hostInitial: { color: Colors.black, fontWeight: '900' },
  hostCopy: { flex: 1, backgroundColor: 'transparent' },
  hostLabel: { color: Colors.gray[300], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  hostName: { color: Colors.white, fontSize: 12, fontWeight: '700', marginTop: 2 },
  body: { paddingHorizontal: Spacing.container, backgroundColor: Colors.black },
  quickFacts: { flexDirection: 'row', paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: 'transparent' },
  fact: { flex: 1, alignItems: 'center', backgroundColor: 'transparent' },
  factLabel: { color: Colors.gray[500], fontSize: 12, marginTop: 5 },
  factValue: { color: Colors.white, fontSize: 13, fontWeight: '700', marginTop: 2 },
  factDivider: { width: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1, marginTop: 25, marginBottom: 9 },
  description: { color: Colors.gray[200], fontSize: 14, lineHeight: 21 },
  sceneLink: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 16, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.border },
  sceneMark: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash },
  sceneLinkCopy: { flex: 1, backgroundColor: 'transparent' },
  sceneLinkLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: .7 },
  sceneLinkTitle: { color: Colors.white, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 3 },
  peopleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 17, padding: 13, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  avatars: { flexDirection: 'row', marginRight: 10, backgroundColor: 'transparent' },
  avatar: { width: 27, height: 27, borderRadius: 14, borderWidth: 2, borderColor: Colors.gray[900] },
  peopleCopy: { flex: 1, backgroundColor: 'transparent' },
  peopleTitle: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  peopleDetail: { color: Colors.gray[500], fontSize: 12, marginTop: 3 },
  actionCard: { padding: 16, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  actionTop: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  actionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  actionCopy: { flex: 1, backgroundColor: 'transparent' },
  actionTitle: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  actionDetail: { color: Colors.gray[500], fontSize: 12, marginTop: 3 },
  gemReward: { color: Colors.primary, fontSize: 12, lineHeight: 15, fontWeight: '900', maxWidth: 94, textAlign: 'right' },
  proofRow: { flexDirection: 'row', gap: 8, marginTop: 14, backgroundColor: 'transparent' },
  proof: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 9, borderRadius: 10, backgroundColor: 'rgba(103,197,135,.08)' },
  proofText: { color: Colors.gray[300], fontSize: 12 },
  actionButtons: { flexDirection: 'row', gap: 9, marginTop: 13, backgroundColor: 'transparent' },
  checkIn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 47, borderRadius: 16, backgroundColor: Colors.primary },
  checkInText: { color: Colors.black, fontSize: 12, fontWeight: '900' },
  addProof: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 47, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[800] },
  addProofText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  journeyCard: { marginTop: 14, padding: 18, borderRadius: BorderRadius['2xl'], backgroundColor: '#15120F', borderWidth: 1, borderColor: 'rgba(255,176,103,.18)' },
  journeyScript: { color: Colors.accent, fontSize: 24, lineHeight: 28, fontWeight: '600', fontStyle: 'italic', letterSpacing: -.6 },
  journeyIntro: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 7, marginBottom: 8 },
  journeyStep: { flexDirection: 'row', gap: 13, paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, backgroundColor: 'transparent' },
  journeyNumber: { width: 24, color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .7 },
  journeyCopy: { flex: 1, backgroundColor: 'transparent' },
  journeyTitle: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  journeyDetail: { color: Colors.gray[500], fontSize: 12, lineHeight: 17, marginTop: 3 },
  valueCard: { flexDirection: 'row', marginTop: 13, padding: 15, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' },
  valueIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  valueCopy: { flex: 1, backgroundColor: 'transparent' },
  valueEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  valueTitle: { color: Colors.white, fontSize: 12, fontWeight: '800', marginTop: 4 },
  valueDetail: { color: Colors.gray[400], fontSize: 12, marginTop: 3 },
  growCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 13, padding: 16, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  growEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  growTitle: { color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 4 },
  growDetail: { color: Colors.gray[500], fontSize: 12, lineHeight: 14, marginTop: 3, maxWidth: 280 },
  sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.container, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(12,12,12,.96)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  stickyLabel: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .7 },
  stickyValue: { color: Colors.white, fontSize: 12, fontWeight: '700', marginTop: 3 },
  goingButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, backgroundColor: Colors.primary },
  goingButtonActive: { backgroundColor: Colors.success },
  goingText: { color: Colors.black, fontSize: 12, fontWeight: '900' },
});
