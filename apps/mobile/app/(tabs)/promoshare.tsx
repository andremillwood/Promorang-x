import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { usePromoShareDashboard } from '@/hooks/usePromoShare';
import { useMoments } from '@/hooks/useMoments';

export default function GrowScreen() {
  const { data, loading, error, refetch } = usePromoShareDashboard();
  const { moments, error: momentsError } = useMoments();
  const cycle = data?.active_cycles?.[0];
  const stats = cycle ? data?.user_stats_by_cycle?.find((item) => item.cycle_id === cycle.id) : undefined;
  const featuredMoment = moments[0];
  const completed = stats?.verified_actions_count || 0;
  const target = 3;
  const progress = Math.min(completed / target, 1);
  const qualified = stats?.eligibility_status === 'eligible' || stats?.eligibility_status === 'qualified';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>WHAT YOUR STORY STARTED</Text><Text style={styles.title}>Help the Scene travel.</Text></View>
        <Pressable accessibilityLabel="Learn about PromoShare" style={styles.info} onPress={() => Alert.alert('PromoShare', 'Share Promorang moments with your point of view. Verified visits, check-ins, referrals, and purchases show what your story helped move.')}><Ionicons name="information" size={19} color={Colors.white} /></Pressable>
      </View>
      <Text style={styles.subtitle}>Share content and Moments with your point of view. See who felt drawn in, showed up, returned, or found something new because of it.</Text>

      {loading ? (
        <View style={styles.state}><ActivityIndicator color={Colors.primary} /><Text style={styles.stateText}>Loading your verified impact…</Text></View>
      ) : error ? (
        <View style={styles.state}><Ionicons name="cloud-offline-outline" size={32} color={Colors.gray[500]} /><Text style={styles.stateTitle}>Growth data took a detour</Text><Pressable style={styles.retry} onPress={refetch}><Text style={styles.retryText}>Try again</Text></Pressable></View>
      ) : (
        <>
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={[styles.status, qualified && styles.statusQualified]}><View style={styles.statusDot} /><Text style={styles.statusText}>{qualified ? 'QUALIFIED' : 'IN PROGRESS'}</Text></View>
              <Text style={styles.cycle}>{cycle?.cycle_type?.toUpperCase() || 'WEEKLY'} CYCLE</Text>
            </View>
            <Text style={styles.heroLabel}>WHAT HAPPENED BECAUSE OF YOU</Text>
            <Text style={styles.heroTitle}>{qualified ? 'Your story is bringing people into the Scene.' : `${Math.max(target - completed, 0)} more people taking part until something new opens.`}</Text>
            <View style={styles.progressLabels}><Text style={styles.progressPrimary}>{completed} of {target} actions</Text><Text style={styles.progressSecondary}>{Math.round(progress * 100)}%</Text></View>
            <View style={styles.track}><View style={[styles.fill, { width: `${progress * 100}%` }]} /></View>
            <Text style={styles.heroHint}>Promorang looks beyond likes to the people who joined, visited, returned, and became part of what happened.</Text>
          </View>

          <Text style={styles.sectionEyebrow}>NEXT BEST ACTION</Text>
          <Pressable style={styles.nextMove} onPress={() => router.push(featuredMoment ? `/moment/${featuredMoment.id}` as any : '/discover')}>
            <View style={styles.moveIcon}><Ionicons name="megaphone" size={22} color={Colors.primary} /></View>
            <View style={styles.moveCopy}><Text style={styles.moveMeta}>{featuredMoment ? `${featuredMoment.type.toUpperCase()} · ${featuredMoment.location || 'PROMORANG'}` : momentsError ? 'MOMENTS OFFLINE' : 'DISCOVER MOMENTS'}</Text><Text style={styles.moveTitle}>{featuredMoment ? `Help ${featuredMoment.title} travel` : 'Find something worth sharing'}</Text><Text style={styles.moveDetail}>{featuredMoment ? 'Share with context. A verified visit from your link counts toward qualification.' : 'Live Moments you can support will appear in Discover when they are available.'}</Text></View>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </Pressable>

          <View style={styles.metrics}>
            <Metric icon="paper-plane" value={String(data?.total_entries_all_time || 0)} label="People moved" />
            <View style={styles.metricDivider} />
            <Metric icon="sparkles" value={String(data?.total_won_all_time || 0)} label="Gems unlocked" />
            <View style={styles.metricDivider} />
            <Metric icon="shield-checkmark" value={String(completed)} label="People who took part" />
          </View>

          <View style={styles.explainer}>
            <Text style={styles.explainerEyebrow}>HOW VALUE MOVES</Text>
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

function Metric({ icon, value, label }: { icon: any; value: string; label: string }) {
  return <View style={styles.metric}><Ionicons name={icon} size={17} color={Colors.primary} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  content: { paddingTop: 18, paddingHorizontal: Spacing.container },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1.1 },
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
  statusText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .6 },
  cycle: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9 },
  heroLabel: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 10, marginTop: 28, letterSpacing: .7 },
  heroTitle: { color: Colors.white, fontSize: 25, lineHeight: 30, fontWeight: '800', letterSpacing: -.6, marginTop: 7 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 23, backgroundColor: 'transparent' },
  progressPrimary: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  progressSecondary: { color: Colors.primary, fontSize: 11, fontWeight: '800' },
  track: { height: 5, borderRadius: 3, backgroundColor: Colors.gray[700], marginTop: 8 },
  fill: { height: 5, borderRadius: 3, backgroundColor: Colors.primary },
  heroHint: { color: Colors.gray[400], fontSize: 10, marginTop: 10 },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1, marginTop: 27, marginBottom: 10 },
  nextMove: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  moveIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  moveCopy: { flex: 1, backgroundColor: 'transparent' },
  moveMeta: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .5 },
  moveTitle: { color: Colors.white, fontSize: 14, fontWeight: '800', marginTop: 4 },
  moveDetail: { color: Colors.gray[400], fontSize: 10, lineHeight: 15, marginTop: 3, paddingRight: 8 },
  metrics: { flexDirection: 'row', marginTop: 14, paddingVertical: 17, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  metric: { flex: 1, alignItems: 'center', backgroundColor: 'transparent' },
  metricValue: { color: Colors.white, fontSize: 18, fontWeight: '800', marginTop: 5 },
  metricLabel: { color: Colors.gray[500], fontSize: 9, marginTop: 2, textAlign: 'center' },
  metricDivider: { width: StyleSheet.hairlineWidth, backgroundColor: Colors.border },
  explainer: { marginTop: 14, padding: 17, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  explainerEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  step: { flexDirection: 'row', paddingTop: 14, backgroundColor: 'transparent' },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  stepNumberText: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 11 },
  stepCopy: { flex: 1, backgroundColor: 'transparent' },
  stepTitle: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  stepDetail: { color: Colors.gray[500], fontSize: 10, lineHeight: 15, marginTop: 3 },
});
