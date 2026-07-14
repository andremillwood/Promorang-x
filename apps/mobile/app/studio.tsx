import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useMoments } from '@/hooks/useMoments';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type StudioMetrics = {
  pendingProofs: number;
  verifiedProofs: number;
  attributedVisits: number;
  peopleMoved: number;
  oldestPending: string | null;
  error: string | null;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

const emptyMetrics: StudioMetrics = {
  pendingProofs: 0,
  verifiedProofs: 0,
  attributedVisits: 0,
  peopleMoved: 0,
  oldestPending: null,
  error: null,
};

export default function StudioScreen() {
  const { user, activeRole } = useAuth();
  const { moments } = useMoments();
  const [metrics, setMetrics] = useState<StudioMetrics>(emptyMetrics);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Creator';
  const active = moments.slice(0, 2);
  const metricsUnavailable = Boolean(metrics.error);
  const earnedGems = Math.max(0, Math.round(metrics.verifiedProofs * 6.8));

  const fetchMetrics = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true);
    else setMetricsLoading(true);

    const [pending, published, content, oldest] = await Promise.all([
      supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('content_items').select('impressions, clicks, conversions').in('status', ['published', 'pending_review']).limit(250),
      supabase.from('content_items').select('posted_at').eq('status', 'pending_review').order('posted_at', { ascending: true }).limit(1).maybeSingle(),
    ]);

    const firstError = pending.error || published.error || content.error || oldest.error;
    if (firstError) {
      setMetrics({ ...emptyMetrics, error: firstError.message });
    } else {
      const totals = (content.data || []).reduce((sum, item) => ({
        impressions: sum.impressions + Number(item.impressions || 0),
        visits: sum.visits + Number(item.clicks || 0) + Number(item.conversions || 0),
      }), { impressions: 0, visits: 0 });

      setMetrics({
        pendingProofs: pending.count || 0,
        verifiedProofs: published.count || 0,
        attributedVisits: totals.visits,
        peopleMoved: moments.length ? Math.max(moments.length * 12, Math.round(totals.impressions / 10)) : Math.round(totals.impressions / 10),
        oldestPending: oldest.data?.posted_at ? formatWaitTime(oldest.data.posted_at) : null,
        error: null,
      });
    }

    setMetricsLoading(false);
    setRefreshing(false);
  }, [moments.length]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const attentionCopy = useMemo(() => {
    if (metrics.pendingProofs > 0) {
      return {
        title: `${metrics.pendingProofs} ${metrics.pendingProofs === 1 ? 'submission awaits' : 'submissions await'} review`,
        detail: metrics.oldestPending ? `Oldest submission has waited ${metrics.oldestPending}.` : 'New submissions are ready for a decision.',
      };
    }
    return {
      title: 'Review queue is clear',
      detail: metricsUnavailable ? 'Live metrics are unavailable. Pull to retry.' : 'New creator submissions will appear here.',
    };
  }, [metrics.oldestPending, metrics.pendingProofs, metricsUnavailable]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
        <View style={styles.heading}><Text style={styles.eyebrow}>OPERATIONS LAYER</Text><Text style={styles.title}>Studio</Text></View>
        <Pressable accessibilityLabel="Studio settings" style={styles.settings} onPress={() => router.push('/modal')}><Ionicons name="options-outline" size={20} color={Colors.white} /></Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={Colors.primary} onRefresh={() => fetchMetrics(true)} />}
      >
        <View style={styles.welcome}>
          <View><Text style={styles.welcomeMeta}>{(activeRole || 'creator').toUpperCase()} MODE</Text><Text style={styles.welcomeTitle}>Keep it moving, {firstName}.</Text><Text style={styles.welcomeDetail}>Your audience needs one clear next action.</Text></View>
          <View style={styles.liveSignal}><View style={styles.liveDot} /><Text style={styles.liveText}>{metricsUnavailable ? 'OFFLINE' : 'LIVE'}</Text></View>
        </View>

        {metrics.error ? <View style={styles.metricNotice}><Ionicons name="cloud-offline" size={15} color={Colors.warning} /><Text style={styles.metricNoticeText}>Live metrics unavailable. Pull to retry.</Text></View> : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metrics}>
          <Metric loading={metricsLoading} icon="people" value={compact(metrics.peopleMoved)} label="people moved" change={`${moments.length || active.length} active moments`} />
          <Metric loading={metricsLoading} icon="shield-checkmark" value={compact(metrics.verifiedProofs)} label="moments counted" change={`${metrics.pendingProofs} to review`} attention={metrics.pendingProofs > 0} />
          <Metric loading={metricsLoading} icon="paper-plane" value={compact(metrics.attributedVisits)} label="attributed visits" change="From counted activity" />
          <Metric loading={metricsLoading} icon="diamond" value={`${compact(earnedGems)} Gems`} label="earned" change="Eligible payout value" />
        </ScrollView>

        <Text style={styles.sectionEyebrow}>NEEDS YOUR ATTENTION</Text>
        <Pressable style={styles.attention} onPress={() => router.push('/studio/review' as Href)}>
          <View style={styles.attentionIcon}><Ionicons name="images" size={22} color={Colors.warning} /></View>
          <View style={styles.attentionCopy}><Text style={styles.attentionTitle}>{attentionCopy.title}</Text><Text style={styles.attentionDetail}>{attentionCopy.detail}</Text></View>
          <View style={styles.reviewButton}><Text style={styles.reviewText}>Review</Text></View>
        </Pressable>
        <Pressable style={styles.attention} onPress={() => router.push((active[0]?.id || moments[0]?.id) ? `/studio/moment/${active[0]?.id || moments[0]?.id}` as Href : '/studio/create-moment' as Href)}>
          <View style={styles.attentionIcon}><Ionicons name="ticket" size={22} color={Colors.primary} /></View>
          <View style={styles.attentionCopy}><Text style={styles.attentionTitle}>{active.length || moments.length ? `${active.length || moments.length} active moment${(active.length || moments.length) === 1 ? '' : 's'}` : 'No active moments yet'}</Text><Text style={styles.attentionDetail}>{active.length || moments.length ? 'Keep one distribution push ready before the room cools.' : 'Create the next Moment to start seeing what moves.'}</Text></View>
          <Ionicons name="chevron-forward" size={19} color={Colors.gray[500]} />
        </Pressable>

        <View style={styles.sectionRow}><View><Text style={styles.sectionEyebrowFlush}>ACTIVE WORK</Text><Text style={styles.sectionTitle}>What you’re moving</Text></View><Pressable onPress={() => router.push((active[0]?.id || moments[0]?.id) ? `/studio/moment/${active[0]?.id || moments[0]?.id}` as Href : '/studio/create-moment' as Href)}><Text style={styles.seeAll}>Manage all</Text></Pressable></View>
        {active.length ? active.map((moment, index) => (
          <Pressable key={moment.id} style={styles.work} onPress={() => router.push(`/studio/moment/${moment.id}` as Href)}>
            <View style={[styles.workDate, index === 0 && styles.workDateActive]}><Text style={styles.workMonth}>{index === 0 ? 'JUL' : 'JUL'}</Text><Text style={styles.workDay}>{index === 0 ? '04' : '06'}</Text></View>
            <View style={styles.workCopy}><View style={styles.workStatus}><View style={styles.workDot} /><Text style={styles.workStatusText}>{moment.status?.toUpperCase?.() || (index === 0 ? 'LIVE TONIGHT' : 'PUBLISHED')}</Text></View><Text style={styles.workTitle}>{moment.title}</Text><Text style={styles.workDetail}>{moment.location} · {index === 0 ? `${Math.max(12, metrics.peopleMoved)} moved` : `${Math.max(0, metrics.pendingProofs)} to review`}</Text></View>
            <Ionicons name="chevron-forward" size={19} color={Colors.gray[500]} />
          </Pressable>
        )) : (
          <Pressable style={styles.emptyWork} onPress={() => router.push('/studio/create-moment' as Href)}>
            <View style={styles.emptyWorkIcon}><Ionicons name="add" size={22} color={Colors.primary} /></View>
            <View style={styles.emptyWorkCopy}><Text style={styles.emptyWorkTitle}>No active work yet</Text><Text style={styles.emptyWorkDetail}>Create a Moment to start collecting proof, movement, and retained value.</Text></View>
            <Ionicons name="chevron-forward" size={19} color={Colors.gray[500]} />
          </Pressable>
        )}

        <Text style={styles.sectionEyebrow}>QUICK ACTIONS</Text>
        <View style={styles.actions}>
          <Action icon="add" label="Create moment" onPress={() => router.push('/studio/create-moment' as Href)} />
          <Action icon="camera" label="Launch drop" onPress={() => router.push('/post')} />
          <Action icon="qr-code" label="Check people in" onPress={() => router.push('/check-in')} />
          <Action icon="megaphone" label="Distribution" onPress={() => router.push('/promoshare')} />
        </View>

        <View style={styles.payout}>
          <View style={styles.payoutIcon}><Ionicons name="wallet" size={21} color={Colors.success} /></View>
          <View style={styles.payoutCopy}><Text style={styles.payoutMeta}>NEXT PAYOUT</Text><Text style={styles.payoutValue}>{earnedGems.toLocaleString()} Gems · Friday</Text><Text style={styles.payoutDetail}>US${earnedGems.toLocaleString()} platform value from counted attendance and attributed movement.</Text></View>
          <Pressable onPress={() => router.push('/dashboard/payouts')}><Ionicons name="arrow-forward" size={20} color={Colors.white} /></Pressable>
        </View>
        <View style={{ height: 45 }} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/studio/create-moment' as Href)}><Ionicons name="add" size={23} color={Colors.black} /><Text style={styles.fabText}>Create</Text></Pressable>
    </View>
  );
}

function compact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value);
}

function formatWaitTime(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hours`;
  return `${Math.round(hours / 24)} days`;
}

function Metric({ icon, value, label, change, loading, attention }: { icon: IconName; value: string; label: string; change: string; loading?: boolean; attention?: boolean }) {
  return <View style={[styles.metric, attention && styles.metricAttention]}><Ionicons name={icon} size={18} color={attention ? Colors.warning : Colors.primary} />{loading ? <ActivityIndicator style={styles.metricLoader} size="small" color={Colors.primary} /> : <Text style={styles.metricValue}>{value}</Text>}<Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricChange, attention && styles.metricChangeAttention]}>{change}</Text></View>;
}
function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return <Pressable style={styles.action} onPress={onPress}><View style={styles.actionIcon}><Ionicons name={icon} size={21} color={Colors.primary} /></View><Text style={styles.actionLabel}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.black },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, marginLeft: 13, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1 },
  title: { color: Colors.white, fontSize: Typography.sizes['2xl'], fontWeight: '800', letterSpacing: -.7, marginTop: 2 },
  settings: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  content: { paddingHorizontal: Spacing.container, paddingTop: 8 },
  welcome: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 18, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' },
  welcomeMeta: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .7 },
  welcomeTitle: { color: Colors.white, fontSize: 20, fontWeight: '800', marginTop: 6 },
  welcomeDetail: { color: Colors.gray[400], fontSize: 10, marginTop: 4 },
  liveSignal: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 14, backgroundColor: 'rgba(255,106,26,.12)' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  liveText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 8 },
  metricNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, marginTop: 10, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(242,184,75,.25)', backgroundColor: 'rgba(242,184,75,.08)' },
  metricNoticeText: { color: Colors.gray[300], fontSize: 10, flex: 1 },
  metrics: { gap: 9, paddingVertical: 15 },
  metric: { width: 132, padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  metricAttention: { borderColor: 'rgba(242,184,75,.32)', backgroundColor: 'rgba(242,184,75,.07)' },
  metricLoader: { alignSelf: 'flex-start', marginTop: 14, marginBottom: 2 },
  metricValue: { color: Colors.white, fontSize: 21, fontWeight: '800', marginTop: 12 },
  metricLabel: { color: Colors.gray[300], fontSize: 10, marginTop: 2 },
  metricChange: { color: Colors.success, fontSize: 8, marginTop: 7 },
  metricChangeAttention: { color: Colors.warning },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 1, marginTop: 12, marginBottom: 10 },
  attention: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 8, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  attentionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  attentionCopy: { flex: 1, backgroundColor: 'transparent' },
  attentionTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  attentionDetail: { color: Colors.gray[500], fontSize: 9, marginTop: 3 },
  reviewButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: Colors.primary },
  reviewText: { color: Colors.black, fontSize: 9, fontWeight: '900' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 10, backgroundColor: 'transparent' },
  sectionEyebrowFlush: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1 },
  sectionTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', marginTop: 4 },
  seeAll: { color: Colors.primary, fontSize: 10, fontWeight: '700' },
  work: { flexDirection: 'row', alignItems: 'center', padding: 13, marginBottom: 8, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  workDate: { width: 47, height: 51, borderRadius: 13, backgroundColor: Colors.gray[800], alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  workDateActive: { backgroundColor: Colors.primary },
  workMonth: { color: Colors.black, fontFamily: 'SpaceMono', fontSize: 8 },
  workDay: { color: Colors.white, fontSize: 17, fontWeight: '800', marginTop: 1 },
  workCopy: { flex: 1, backgroundColor: 'transparent' },
  workStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'transparent' },
  workDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary },
  workStatusText: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 7, letterSpacing: .5 },
  workTitle: { color: Colors.white, fontSize: 12, fontWeight: '800', marginTop: 4 },
  workDetail: { color: Colors.gray[500], fontSize: 9, marginTop: 3 },
  emptyWork: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  emptyWorkIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  emptyWorkCopy: { flex: 1, backgroundColor: 'transparent' },
  emptyWorkTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  emptyWorkDetail: { color: Colors.gray[500], fontSize: 9, lineHeight: 13, marginTop: 3 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, backgroundColor: 'transparent' },
  action: { width: '48%', flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  actionIcon: { width: 37, height: 37, borderRadius: 12, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  actionLabel: { color: Colors.white, fontSize: 10, fontWeight: '700', flex: 1 },
  payout: { flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 20, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  payoutIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: 'rgba(103,197,135,.12)', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  payoutCopy: { flex: 1, backgroundColor: 'transparent' },
  payoutMeta: { color: Colors.success, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: .6 },
  payoutValue: { color: Colors.white, fontSize: 13, fontWeight: '800', marginTop: 3 },
  payoutDetail: { color: Colors.gray[500], fontSize: 9, marginTop: 3 },
  fab: { position: 'absolute', right: 18, bottom: Platform.OS === 'ios' ? 28 : 18, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 17, height: 47, borderRadius: 24, backgroundColor: Colors.primary },
  fabText: { color: Colors.black, fontSize: 11, fontWeight: '900' },
});
