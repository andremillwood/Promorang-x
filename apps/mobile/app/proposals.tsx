import { ActivityIndicator, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { Proposal, useProposals } from '@/hooks/useProposals';

const statusLanguage = {
  draft: ['STILL SHAPING', 'Complete the people, value, and funding.'],
  sent: ['WITH PARTNERS', 'Ready for collaborators and funders to consider.'],
  accepted: ['READY TO BRING ALIVE', 'Move into the Moment and participant experience.'],
  declined: ['FIND A NEW FIT', 'Keep the idea and invite a better-aligned partner.'],
} as const;

export default function ProposalsScreen() {
  const { data = [], isLoading } = useProposals();
  return <View style={styles.screen}>
    <View style={styles.header}>
      <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.iconButton}><Ionicons name="arrow-back" size={20} color={Colors.white} /></Pressable>
      <View style={styles.heading}><Text style={styles.eyebrow}>ACTIVATION STUDIO</Text><Text style={styles.headerTitle}>Make the Scene move</Text></View>
      <Pressable accessibilityLabel="Start an activation" onPress={() => router.push('/create-proposal')} style={styles.addButton}><Ionicons name="add" size={22} color={Colors.black} /></Pressable>
    </View>
    <View style={styles.intro}><Text style={styles.introTitle}>From shared intention to a living Moment.</Text><Text style={styles.introCopy}>Shape the people, content, value, funding, and return around every Scene.</Text></View>
    {isLoading ? <View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.loadingText}>Opening your studio…</Text></View> : <FlatList data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <ActivationCard item={item} />} ListEmptyComponent={<EmptyState />} />}
  </View>;
}

function ActivationCard({ item }: { item: Proposal }) {
  const metadata = item.metadata || {};
  const [status, nextMove] = statusLanguage[item.status] || statusLanguage.draft;
  const scene = String(metadata.scene || 'Scene to be chosen');
  const participantValue = Array.isArray(metadata.participant_value) ? metadata.participant_value : [];
  const content = Array.isArray(metadata.content_needed) ? metadata.content_needed : [];
  return <View style={styles.card}>
    <View style={styles.cardTop}><View style={styles.status}><Text style={styles.statusText}>{status}</Text></View><Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text></View>
    <Text style={styles.scene}>{scene.toUpperCase()}</Text><Text style={styles.title}>{item.title}</Text><Text numberOfLines={3} style={styles.description}>{String(metadata.outcome_detail || item.description || 'A shared experience waiting to be shaped.')}</Text>
    <View style={styles.storyRow}><Story icon="calendar-outline" label="MOMENT" value={item.description || 'Shape the experience'} /><Story icon="videocam-outline" label="CONTENT" value={content.length ? `${content.length} story roles` : 'Plan how it travels'} /></View>
    <View style={styles.returnBox}><Text style={styles.returnLabel}>WHAT PEOPLE CAN LEAVE WITH</Text><Text style={styles.returnText}>{String(metadata.social_return || participantValue.join(' · ') || 'Belonging, recognition, access, and a reason to return.')}</Text></View>
    <Pressable accessibilityRole="button" onPress={() => router.push(`/proposal/${item.id}`)} style={styles.next}><View style={styles.nextCopy}><Text style={styles.nextLabel}>YOUR NEXT MOVE</Text><Text style={styles.nextText}>{nextMove}</Text></View><View style={styles.arrow}><Ionicons name="arrow-forward" size={18} color={Colors.black} /></View></Pressable>
  </View>;
}

function Story({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) { return <View style={styles.story}><Ionicons name={icon} size={16} color={Colors.primary} /><Text style={styles.storyLabel}>{label}</Text><Text numberOfLines={2} style={styles.storyText}>{value}</Text></View>; }
function EmptyState() { return <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="heart" size={28} color={Colors.primary} /></View><Text style={styles.emptyTitle}>Start with what you want people to feel.</Text><Text style={styles.emptyCopy}>Your first activation can begin with a Scene, gathering, story, place, or opportunity.</Text><Pressable onPress={() => router.push('/create-proposal')} style={styles.primaryButton}><Text style={styles.primaryText}>Shape the first plan</Text><Ionicons name="arrow-forward" size={17} color={Colors.black} /></Pressable></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: 56, paddingHorizontal: Spacing.container, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  heading: { flex: 1, marginLeft: 12, backgroundColor: 'transparent' }, eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .9 }, headerTitle: { color: Colors.white, fontWeight: '800', fontSize: 16, marginTop: 2 },
  addButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  intro: { paddingHorizontal: Spacing.container, paddingTop: 22, paddingBottom: 9, backgroundColor: Colors.black }, introTitle: { color: Colors.white, fontSize: Typography.sizes['2xl'], lineHeight: 30, fontWeight: '900', letterSpacing: -.7 }, introCopy: { color: Colors.gray[500], fontSize: 13, lineHeight: 17, marginTop: 7 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.black }, loadingText: { color: Colors.gray[500], fontSize: 12, marginTop: 10 }, list: { padding: Spacing.container, gap: 14, paddingBottom: 50 },
  card: { padding: 17, borderRadius: 24, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' }, status: { backgroundColor: '#26160E', borderWidth: 1, borderColor: 'rgba(255,106,26,.3)', borderRadius: 15, paddingHorizontal: 9, paddingVertical: 5 }, statusText: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 }, date: { color: Colors.gray[600], fontSize: 12 },
  scene: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .8, marginTop: 17 }, title: { color: Colors.white, fontSize: 23, lineHeight: 27, fontWeight: '900', letterSpacing: -.5, marginTop: 5 }, description: { color: Colors.gray[400], fontSize: 12, lineHeight: 16, marginTop: 8 },
  storyRow: { flexDirection: 'row', gap: 8, marginTop: 16, backgroundColor: 'transparent' }, story: { flex: 1, minHeight: 94, padding: 12, borderRadius: BorderRadius.lg, backgroundColor: Colors.black, borderWidth: 1, borderColor: Colors.border }, storyLabel: { color: Colors.gray[600], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .5, marginTop: 10 }, storyText: { color: Colors.gray[300], fontSize: 12, lineHeight: 13, fontWeight: '700', marginTop: 3 },
  returnBox: { marginTop: 9, padding: 13, borderRadius: BorderRadius.lg, backgroundColor: '#17110D', borderWidth: 1, borderColor: 'rgba(255,106,26,.18)' }, returnLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .55 }, returnText: { color: Colors.gray[300], fontSize: 12, lineHeight: 14, marginTop: 5 },
  next: { marginTop: 15, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }, nextCopy: { flex: 1, backgroundColor: 'transparent' }, nextLabel: { color: Colors.gray[600], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .5 }, nextText: { color: Colors.white, fontSize: 12, lineHeight: 14, fontWeight: '700', marginTop: 4, paddingRight: 12 }, arrow: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  empty: { alignItems: 'center', paddingTop: 65, paddingHorizontal: 25, backgroundColor: Colors.black }, emptyIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: '#24160F' }, emptyTitle: { color: Colors.white, textAlign: 'center', fontSize: 23, lineHeight: 28, fontWeight: '900', marginTop: 18 }, emptyCopy: { color: Colors.gray[500], textAlign: 'center', fontSize: 13, lineHeight: 17, marginTop: 8 }, primaryButton: { height: 48, marginTop: 22, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, backgroundColor: Colors.primary }, primaryText: { color: Colors.black, fontSize: 13, fontWeight: '900' },
});
