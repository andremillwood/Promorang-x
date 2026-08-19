import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { usePromoShareDashboard } from '@/hooks/usePromoShare';
import { useMoments } from '@/hooks/useMoments';
import { useVaultMemories, useVaultSummary } from '@/hooks/useVault';
import { useUserBalance } from '@/hooks/useEconomy';

export default function GrowScreen() {
  const { data, loading, error, refetch } = usePromoShareDashboard();
  const { moments, error: momentsError } = useMoments();
  const { memories, loading: memoriesLoading } = useVaultMemories();
  const { summary, loading: vaultLoading } = useVaultSummary();
  const { balance, loading: balanceLoading } = useUserBalance();
  const cycle = data?.active_cycles?.[0];
  const stats = cycle ? data?.user_stats_by_cycle?.find((item) => item.cycle_id === cycle.id) : undefined;
  const featuredMoment = moments[0];
  const completed = stats?.verified_actions_count || 0;
  const target = 3;
  const qualified = stats?.eligibility_status === 'eligible' || stats?.eligibility_status === 'qualified';
  const firstMemory = memories[0];
  const keptCount = memories.length + Object.values(summary?.asset_counts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const gems = Number(balance?.gems || 0);
  const storyLoading = loading || memoriesLoading || vaultLoading || balanceLoading;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>WHAT HAPPENED BECAUSE OF YOU</Text><Text style={styles.title}>Your story is taking shape.</Text></View>
        <Pressable accessibilityLabel="Learn about PromoShare" style={styles.info} onPress={() => Alert.alert('PromoShare', 'Share Promorang moments with your point of view. Verified visits, check-ins, referrals, and purchases show what your story helped move.')}><Ionicons name="information" size={19} color={Colors.white} /></Pressable>
      </View>
      <Text style={styles.subtitle}>See where you showed up, what your contribution moved, what stayed with you, and the most meaningful way to continue.</Text>

      {storyLoading ? (
        <View style={styles.state}><ActivityIndicator color={Colors.primary} /><Text style={styles.stateText}>Gathering your story…</Text></View>
      ) : error ? (
        <View style={styles.state}><Ionicons name="cloud-offline-outline" size={32} color={Colors.gray[500]} /><Text style={styles.stateTitle}>Growth data took a detour</Text><Pressable style={styles.retry} onPress={refetch}><Text style={styles.retryText}>Try again</Text></Pressable></View>
      ) : (
        <>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={[styles.status, qualified && styles.statusQualified]}><View style={styles.statusDot} /><Text style={styles.statusText}>{qualified ? 'SOMETHING OPENED' : 'STILL UNFOLDING'}</Text></View>
              <Text style={styles.cycle}>{cycle?.cycle_type?.toUpperCase() || 'THIS WEEK'}</Text>
            </View>
            <Text style={styles.heroLabel}>{qualified ? 'YOUR CONTRIBUTION TRAVELLED' : 'YOUR NEXT CHAPTER'}</Text>
            <Text style={styles.heroTitle}>{qualified ? 'Your point of view brought people closer to the Scene.' : completed > 0 ? 'You have already helped something move. Keep the thread alive.' : 'Begin with one Moment that feels worth being part of.'}</Text>
            <Text style={styles.heroHint}>{completed > 0 ? `${completed} verified ${completed === 1 ? 'action has' : 'actions have'} become part of this chapter.` : 'No artificial streaks. Just real participation, remembered when it matters.'}</Text>
            <View style={styles.chapterMarks} accessibilityLabel={`${completed} verified actions toward ${target}`}>
              {Array.from({ length: target }).map((_, index) => <View key={index} style={[styles.chapterMark, index < completed && styles.chapterMarkComplete]} />)}
            </View>
          </View>

          <Text style={styles.sectionEyebrow}>YOUR STORY SO FAR</Text>
          <View style={styles.storyRail}>
            <StoryBeat icon="footsteps" eyebrow="YOU TOOK PART" title={completed > 0 ? `${completed} verified ${completed === 1 ? 'move' : 'moves'}` : 'Your first move is waiting'} detail={completed > 0 ? 'Actions that could be traced back to your participation.' : 'Choose something you genuinely want to support.'} />
            <StoryBeat icon="archive" eyebrow="YOU KEPT" title={keptCount > 0 ? `${keptCount} ${keptCount === 1 ? 'thing that mattered' : 'things that mattered'}` : 'A private record starts here'} detail={firstMemory?.title || 'Memories, access, and recognition will collect in your Vault.'} onPress={() => router.push('/vault')} />
            <StoryBeat icon="sparkles" eyebrow="VALUE RETURNED" title={gems > 0 ? `${gems.toLocaleString()} Gems available` : 'Recognition before accounting'} detail={gems > 0 ? 'Funded value you can use where Promorang says it applies.' : 'When funded value opens, Promorang will explain why and what it can do.'} onPress={() => router.push('/vault')} />
          </View>

          <Text style={styles.sectionEyebrow}>NEXT BEST ACTION</Text>
          <Pressable style={styles.nextMove} onPress={() => router.push(featuredMoment ? `/moment/${featuredMoment.id}` as any : '/discover')}>
            <View style={styles.moveIcon}><Ionicons name="megaphone" size={22} color={Colors.primary} /></View>
            <View style={styles.moveCopy}><Text style={styles.moveMeta}>{featuredMoment ? `${featuredMoment.type.toUpperCase()} · ${featuredMoment.location || 'PROMORANG'}` : momentsError ? 'MOMENTS OFFLINE' : 'DISCOVER MOMENTS'}</Text><Text style={styles.moveTitle}>{featuredMoment ? `Help ${featuredMoment.title} travel` : 'Find something worth sharing'}</Text><Text style={styles.moveDetail}>{featuredMoment ? 'Share with context. A verified visit from your link counts toward qualification.' : 'Live Moments you can support will appear in Discover when they are available.'}</Text></View>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </Pressable>

          <View style={styles.explainer}>
            <Text style={styles.explainerEyebrow}>HOW YOUR INFLUENCE BECOMES VISIBLE</Text>
            {[
              ['1', 'Choose something worth supporting', 'A moment, drop, or action prompt with a clear outcome.'],
              ['2', 'Share with your point of view', 'Context builds trust better than dropping a link.'],
              ['3', 'See what your work caused', 'Visits, check-ins, referrals, and purchases create credible attribution and can unlock funded value.'],
            ].map(([number, title, detail]) => (
              <View key={number} style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{number}</Text></View><View style={styles.stepCopy}><Text style={styles.stepTitle}>{title}</Text><Text style={styles.stepDetail}>{detail}</Text></View></View>
            ))}
          </View>
        </>
      )}
      <View style={{ height: 105 }} />
    </ScrollView>
  );
}

function StoryBeat({ icon, eyebrow, title, detail, onPress }: { icon: any; eyebrow: string; title: string; detail: string; onPress?: () => void }) {
  const content = <><View style={styles.storyIcon}><Ionicons name={icon} size={19} color={Colors.primary} /></View><View style={styles.storyCopy}><Text style={styles.storyEyebrow}>{eyebrow}</Text><Text style={styles.storyTitle}>{title}</Text><Text style={styles.storyDetail}>{detail}</Text></View>{onPress ? <Ionicons name="arrow-forward" size={17} color={Colors.gray[500]} /> : null}</>;
  return onPress ? <Pressable accessibilityRole="button" onPress={onPress} style={styles.storyBeat}>{content}</Pressable> : <View style={styles.storyBeat}>{content}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { paddingTop: 18, paddingHorizontal: Spacing.container },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1.1 },
  title: { color: Colors.white, fontSize: Typography.sizes['3xl'], fontWeight: '800', letterSpacing: -1, marginTop: 5 },
  subtitle: { color: Colors.gray[400], fontSize: 13, lineHeight: 19, marginTop: 7, maxWidth: 330 },
  info: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  state: { minHeight: 350, justifyContent: 'center', alignItems: 'center', gap: 10, backgroundColor: 'transparent' },
  stateTitle: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  stateText: { color: Colors.gray[500], fontSize: 12 },
  retry: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 18 },
  retryText: { color: Colors.black, fontWeight: '800', fontSize: 12 },
  hero: { marginTop: 24, padding: 20, borderRadius: BorderRadius['2xl'], backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.28)' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,106,26,.12)' },
  statusQualified: { backgroundColor: 'rgba(103,197,135,.15)' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  statusText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  cycle: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12 },
  heroLabel: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 12, marginTop: 28, letterSpacing: .7 },
  heroTitle: { color: Colors.white, fontSize: 25, lineHeight: 30, fontWeight: '800', letterSpacing: -.6, marginTop: 7 },
  heroHint: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, marginTop: 12 },
  chapterMarks: { flexDirection: 'row', gap: 7, marginTop: 20, backgroundColor: 'transparent' },
  chapterMark: { flex: 1, height: 3, borderRadius: 2, backgroundColor: Colors.gray[700] },
  chapterMarkComplete: { backgroundColor: Colors.primary },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1, marginTop: 27, marginBottom: 10 },
  storyRail: { gap: 1, borderRadius: BorderRadius['2xl'], overflow: 'hidden', backgroundColor: Colors.border },
  storyBeat: { minHeight: 96, flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: Colors.gray[900] },
  storyIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash, marginRight: 12 },
  storyCopy: { flex: 1, paddingRight: 8, backgroundColor: 'transparent' },
  storyEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: .7 },
  storyTitle: { color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 4 },
  storyDetail: { color: Colors.gray[500], fontSize: 12, lineHeight: 16, marginTop: 3 },
  nextMove: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  moveIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  moveCopy: { flex: 1, backgroundColor: 'transparent' },
  moveMeta: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .5 },
  moveTitle: { color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 4 },
  moveDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 15, marginTop: 3, paddingRight: 8 },
  explainer: { marginTop: 14, padding: 17, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  explainerEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1, marginBottom: 4 },
  step: { flexDirection: 'row', paddingTop: 14, backgroundColor: 'transparent' },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  stepNumberText: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 13 },
  stepCopy: { flex: 1, backgroundColor: 'transparent' },
  stepTitle: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  stepDetail: { color: Colors.gray[500], fontSize: 12, lineHeight: 15, marginTop: 3 },
});
