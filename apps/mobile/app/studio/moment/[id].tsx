import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { supabase } from '@/lib/supabase';
import type { Moment } from '@/hooks/useMoments';

type MomentMetrics = {
  going: number;
  checkedIn: number;
  pendingProofs: number;
  verifiedProofs: number;
  sharedVisits: number;
  pulse: number[];
  error: string | null;
};

const emptyMetrics: MomentMetrics = {
  going: 0,
  checkedIn: 0,
  pendingProofs: 0,
  verifiedProofs: 0,
  sharedVisits: 0,
  pulse: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  error: null,
};

export default function ManageMomentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [metrics, setMetrics] = useState<MomentMetrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true);
    else setLoading(true);

    try {
      if (!id || id.startsWith('demo')) {
        setMoment(null);
      } else {
        const { data } = await supabase.from('moments').select('*').eq('id', id).maybeSingle();
        setMoment(data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  const loadMetrics = useCallback(async (pull = false) => {
    if (!id || id.startsWith('demo')) {
      setMetrics(emptyMetrics);
      setMetricsLoading(false);
      setRefreshing(false);
      return;
    }
    if (pull) setRefreshing(true);
    setMetricsLoading(true);

    const [proofs, links, participants, pulse] = await Promise.all([
      supabase.from('proof_submissions').select('submission_state').eq('moment_id', id).limit(500),
      supabase.from('content_moment_links').select('content_items:content_item_id(clicks, conversions, impressions, status)').eq('moment_id', id).limit(250),
      supabase.from('moment_participants').select('status', { count: 'exact' }).eq('moment_id', id).limit(500),
      supabase.from('moment_pulse_snapshots').select('crowd_level, threshold_progress').eq('moment_id', id).order('captured_at', { ascending: false }).limit(12),
    ]);

    const firstError = proofs.error || links.error || participants.error || pulse.error;
    if (firstError) {
      setMetrics({ ...emptyMetrics, error: firstError.message });
    } else {
      const proofRows = proofs.data || [];
      const linkedContent = (links.data || []).map((row: any) => Array.isArray(row.content_items) ? row.content_items[0] : row.content_items).filter(Boolean);
      const visits = linkedContent.reduce((sum: number, item: any) => sum + Number(item.clicks || 0) + Number(item.conversions || 0), 0);
      const impressions = linkedContent.reduce((sum: number, item: any) => sum + Number(item.impressions || 0), 0);
      const checkedIn = (participants.data || []).filter((participant: any) => /check|attend|arriv/i.test(participant.status || '')).length;
      const pulseBars = (pulse.data || []).map((snapshot: any) => Number(snapshot.crowd_level || snapshot.threshold_progress || 0)).reverse();

      setMetrics({
        going: participants.count || Math.max(0, Math.round(impressions / 10)),
        checkedIn,
        pendingProofs: proofRows.filter((proof: any) => proof.submission_state === 'pending').length,
        verifiedProofs: proofRows.filter((proof: any) => proof.submission_state === 'verified').length,
        sharedVisits: visits,
        pulse: pulseBars.length ? normalizePulse(pulseBars) : emptyMetrics.pulse,
        error: null,
      });
    }

    setMetricsLoading(false);
    setRefreshing(false);
  }, [id]);

  useEffect(() => {
    load();
    loadMetrics();
  }, [load, loadMetrics]);

  const toggleStatus = async () => {
    if (!moment) return;
    const next = moment.status === 'active' ? 'paused' : 'active';
    setUpdating(true);
    const { error } = await supabase.from('moments').update({ status: next }).eq('id', moment.id);
    setUpdating(false);
    if (error) return Alert.alert('Could not update moment', error.message);
    setMoment({ ...moment, status: next });
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={Colors.primary} /></View>;
  if (!moment) return <View style={styles.loading}><Text style={styles.muted}>Moment not found.</Text><Pressable onPress={() => router.back()}><Text style={styles.link}>Back to Studio</Text></Pressable></View>;
  const isActive = moment.status === 'active';
  const arrivalRate = metrics.going ? Math.round((metrics.checkedIn / metrics.going) * 100) : 0;
  const pendingLabel = metrics.pendingProofs === 1 ? '1 contribution needs a decision' : `${metrics.pendingProofs} contributions need a decision`;
  const distributionGap = metrics.going ? Math.max(0, 100 - arrivalRate) : 0;
  const liveLabel = metrics.error ? 'OFFLINE' : isActive ? 'LIVE' : 'PAUSED';
  const latestPulse = metrics.pulse[metrics.pulse.length - 1] || 0;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
        <View style={styles.heading}><Text style={styles.eyebrow}>MANAGE MOMENT</Text><Text style={styles.headerTitle} numberOfLines={1}>{moment.title}</Text></View>
        <Pressable accessibilityLabel="More options" style={styles.more} onPress={() => router.push('/modal')}><Ionicons name="ellipsis-horizontal" size={21} color={Colors.white} /></Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={Colors.primary} onRefresh={() => { load(true); loadMetrics(true); }} />}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View style={[styles.statusPill, !isActive && styles.statusPaused]}><View style={[styles.statusDot, !isActive && styles.statusDotPaused]} /><Text style={styles.statusText}>{isActive ? 'LIVE & DISCOVERABLE' : 'PAUSED'}</Text></View>
            <Pressable onPress={() => router.push(`/moment/${moment.id}` as any)}><Text style={styles.publicLink}>View public page</Text></Pressable>
          </View>
          <Text style={styles.momentTitle}>{moment.title}</Text>
          <View style={styles.location}><Ionicons name="location" size={14} color={Colors.primary} /><Text style={styles.locationText}>{moment.location}</Text></View>
          <View style={styles.statusActions}>
            <Pressable style={styles.edit} onPress={() => router.push(`/studio/edit-moment/${moment.id}` as any)}><Ionicons name="create-outline" size={17} color={Colors.white} /><Text style={styles.editText}>Edit details</Text></Pressable>
            <Pressable style={[styles.pause, !isActive && styles.resume]} onPress={toggleStatus} disabled={updating}>{updating ? <ActivityIndicator size="small" color={Colors.white} /> : <><Ionicons name={isActive ? 'pause' : 'play'} size={17} color={Colors.white} /><Text style={styles.pauseText}>{isActive ? 'Pause' : 'Resume'}</Text></>}</Pressable>
          </View>
        </View>

        {metrics.error ? <View style={styles.metricNotice}><Ionicons name="cloud-offline" size={15} color={Colors.warning} /><Text style={styles.metricNoticeText}>Live moment metrics unavailable. Pull to retry.</Text></View> : null}

        <Text style={styles.sectionEyebrow}>LIVE PERFORMANCE</Text>
        <View style={styles.metrics}>
          <Metric loading={metricsLoading} icon="people" value={compact(metrics.going)} label="going" change={metrics.error ? 'Unavailable' : 'From participants'} />
          <Metric loading={metricsLoading} icon="location" value={compact(metrics.checkedIn)} label="checked in" change={`${arrivalRate}% arrival`} />
          <Metric loading={metricsLoading} icon="shield-checkmark" value={compact(metrics.verifiedProofs)} label="counted" change={`${metrics.pendingProofs} to review`} attention={metrics.pendingProofs > 0} />
          <Metric loading={metricsLoading} icon="paper-plane" value={compact(metrics.sharedVisits)} label="shared visits" change="From linked content" />
        </View>

        <View style={styles.sectionRow}><View><Text style={styles.sectionEyebrowFlush}>OPERATE NOW</Text><Text style={styles.sectionTitle}>Keep the room moving</Text></View><View style={styles.live}><View style={styles.liveDot} /><Text style={styles.liveText}>{liveLabel}</Text></View></View>
        <View style={styles.operations}>
          <Operation icon="qr-code" title="Check people in" detail="Scan access or find a guest" route="/check-in" />
          <Operation icon="images" title="Review contributions" detail={metrics.pendingProofs ? pendingLabel : 'Queue is clear for this Moment'} route="/studio/review" badge={metrics.pendingProofs ? String(metrics.pendingProofs) : undefined} />
          <Operation icon="megaphone" title="Push distribution" detail={metrics.going ? `Close the ${distributionGap}% attendance gap` : 'Invite the first wave into this moment'} route="/promoshare" />
          <Operation icon="chatbubbles" title="Message attendees" detail="Send one useful update" />
        </View>

        <Text style={styles.sectionEyebrow}>ATTENDANCE PULSE</Text>
        <View style={styles.pulse}>
          <View style={styles.pulseHeader}><Text style={styles.pulseTitle}>Arrivals over the last hour</Text><Text style={styles.pulseValue}>{latestPulse ? `+${latestPulse}` : 'quiet'}</Text></View>
          <View style={styles.bars}>{metrics.pulse.map((height, index) => <View key={index} style={[styles.bar, { height: `${Math.max(5, height)}%` }, index > metrics.pulse.length - 4 && styles.barActive]} />)}</View>
          <View style={styles.pulseLabels}><Text style={styles.pulseLabel}>60 min ago</Text><Text style={styles.pulseLabel}>Now</Text></View>
        </View>

        <Text style={styles.sectionEyebrow}>AFTER THE MOMENT</Text>
        <View style={styles.after}>
          <View style={styles.afterIcon}><Ionicons name="sparkles" size={21} color={Colors.primary} /></View>
          <View style={styles.afterCopy}><Text style={styles.afterTitle}>Your recap is forming</Text><Text style={styles.afterDetail}>Attendance, contributions, reach, Gems, and rewards will become a reusable outcome record.</Text></View>
          <Ionicons name="chevron-forward" size={19} color={Colors.gray[500]} />
        </View>
        <View style={{ height: 45 }} />
      </ScrollView>
    </View>
  );
}

function compact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value);
}

function normalizePulse(values: number[]) {
  const max = Math.max(...values, 1);
  return values.map((value) => Math.max(5, Math.round((value / max) * 100)));
}

function Metric({ icon, value, label, change, attention, loading }: { icon: any; value: string; label: string; change: string; attention?: boolean; loading?: boolean }) {
  return <View style={[styles.metric, attention && styles.metricAttention]}><Ionicons name={icon} size={18} color={attention ? Colors.warning : Colors.primary} />{loading ? <ActivityIndicator style={styles.metricLoader} size="small" color={Colors.primary} /> : <Text style={styles.metricValue}>{value}</Text>}<Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricChange, attention && { color: Colors.warning }]}>{change}</Text></View>;
}
function Operation({ icon, title, detail, route, badge }: { icon: any; title: string; detail: string; route?: string; badge?: string }) {
  return <Pressable style={styles.operation} onPress={() => route && router.push(route as any)}><View style={styles.operationIcon}><Ionicons name={icon} size={20} color={Colors.primary} />{badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}</View><View style={styles.operationCopy}><Text style={styles.operationTitle}>{title}</Text><Text style={styles.operationDetail}>{detail}</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.gray[600]} /></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  loading: { flex: 1, backgroundColor: Colors.black, alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: { color: Colors.gray[500] },
  link: { color: Colors.primary, fontWeight: '700' },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.black },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, marginLeft: 13, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: 1 },
  headerTitle: { color: Colors.white, fontSize: 16, fontWeight: '800', marginTop: 2, maxWidth: 230 },
  more: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  content: { paddingHorizontal: Spacing.container },
  statusCard: { padding: 18, borderRadius: BorderRadius['2xl'], backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 15, backgroundColor: 'rgba(103,197,135,.12)' },
  statusPaused: { backgroundColor: Colors.gray[800] },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  statusDotPaused: { backgroundColor: Colors.gray[500] },
  statusText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .6 },
  publicLink: { color: Colors.primary, fontSize: 9, fontWeight: '700' },
  momentTitle: { color: Colors.white, fontSize: Typography.sizes['2xl'], fontWeight: '800', letterSpacing: -.6, marginTop: 20 },
  location: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, backgroundColor: 'transparent' },
  locationText: { color: Colors.gray[400], fontSize: 10 },
  statusActions: { flexDirection: 'row', gap: 8, marginTop: 18, backgroundColor: 'transparent' },
  edit: { flex: 1, height: 42, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.gray[800] },
  editText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  pause: { flex: 1, height: 42, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(239,98,91,.25)' },
  resume: { backgroundColor: 'rgba(103,197,135,.25)' },
  pauseText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  metricNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, marginTop: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(242,184,75,.25)', backgroundColor: 'rgba(242,184,75,.08)' },
  metricNoticeText: { color: Colors.gray[300], fontSize: 10, flex: 1 },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1, marginTop: 23, marginBottom: 9 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: 'transparent' },
  metric: { width: '48.8%', padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  metricAttention: { borderColor: 'rgba(242,184,75,.25)' },
  metricLoader: { alignSelf: 'flex-start', marginTop: 10, marginBottom: 1 },
  metricValue: { color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 8 },
  metricLabel: { color: Colors.gray[300], fontSize: 10 },
  metricChange: { color: Colors.success, fontSize: 8, marginTop: 6 },
  sectionRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 24, marginBottom: 9, backgroundColor: 'transparent' },
  sectionEyebrowFlush: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: 1 },
  sectionTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', marginTop: 3 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 13, backgroundColor: Colors.ambientWash },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary },
  liveText: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 8 },
  operations: { borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.gray[900] },
  operation: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: 'transparent' },
  operationIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  badge: { position: 'absolute', right: -3, top: -4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: Colors.warning, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: Colors.black, fontSize: 8, fontWeight: '900' },
  operationCopy: { flex: 1, backgroundColor: 'transparent' },
  operationTitle: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  operationDetail: { color: Colors.gray[500], fontSize: 9, marginTop: 3 },
  pulse: { padding: 15, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  pulseHeader: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'transparent' },
  pulseTitle: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  pulseValue: { color: Colors.success, fontSize: 12, fontWeight: '800' },
  bars: { height: 90, flexDirection: 'row', alignItems: 'flex-end', gap: 5, marginTop: 14, backgroundColor: 'transparent' },
  bar: { flex: 1, minHeight: 5, borderRadius: 3, backgroundColor: Colors.gray[700] },
  barActive: { backgroundColor: Colors.primary },
  pulseLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7, backgroundColor: 'transparent' },
  pulseLabel: { color: Colors.gray[600], fontSize: 8 },
  after: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  afterIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  afterCopy: { flex: 1, backgroundColor: 'transparent' },
  afterTitle: { color: Colors.white, fontSize: 11, fontWeight: '800' },
  afterDetail: { color: Colors.gray[500], fontSize: 9, lineHeight: 14, marginTop: 3, paddingRight: 8 },
});
