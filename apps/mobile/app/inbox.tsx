import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useInboxActivity } from '@/hooks/useInboxActivity';
import { resolveNotificationJourney, type NotificationJourneyKind } from '@promorang/shared';

type Filter = 'all' | 'proof' | 'social';
type ActivityItem = {
  id: string;
  kind: NotificationJourneyKind;
  eyebrow: string;
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
  route?: string;
};

const kindMeta = {
  recognition: { icon: 'shield-checkmark', color: Colors.success }, memory: { icon: 'images', color: Colors.purple }, scene: { icon: 'people', color: Colors.info }, return: { icon: 'calendar', color: Colors.primary }, value: { icon: 'key', color: Colors.warning }, moment: { icon: 'sparkles', color: Colors.primary }, general: { icon: 'notifications', color: Colors.gray[400] },
  growth: { icon: 'trending-up', color: Colors.primary, label: 'GROWTH' },
} as const;

export default function InboxScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const [readIds, setReadIds] = useState<string[]>([]);
  const { notifications, loading, error, refresh, markRead, markAllRead } = useInboxActivity();
  const source: ActivityItem[] = notifications.map((item) => {
    const journey = resolveNotificationJourney({ type: item.type, relatedId: item.related_id });
    return ({
    id: item.id,
    kind: notificationKind(item.type),
    title: item.title,
    detail: item.message || 'Open to see what changed.',
    time: relativeTime(item.created_at),
    unread: !item.is_read,
    route: journey.destination, eyebrow: journey.eyebrow,
  }); });
  const visible = source.filter((item) => filter === 'all' || filter === 'proof' && ['recognition', 'memory', 'value'].includes(item.kind) || filter === 'social' && ['scene', 'return'].includes(item.kind));
  const unread = source.filter((item) => item.unread && !readIds.includes(item.id)).length;

  const openItem = (item: ActivityItem) => {
    setReadIds((current) => current.includes(item.id) ? current : [...current, item.id]);
    if (notifications.some((notification) => notification.id === item.id)) {
      markRead(item.id).catch((markError) => Alert.alert('Could not update inbox', markError.message || 'Please try again.'));
    }
    if (item.route) router.push(item.route as any);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" style={styles.back} onPress={() => router.back()}><Ionicons name="arrow-back" size={21} color={Colors.white} /></Pressable>
        <View style={styles.heading}><Text style={styles.eyebrow}>USEFUL UPDATES</Text><Text style={styles.title}>Inbox</Text></View>
        <Pressable accessibilityLabel="Mark all read" style={styles.markRead} onPress={() => { setReadIds(source.map((item) => item.id)); markAllRead().catch((markError) => Alert.alert('Could not update inbox', markError.message || 'Please try again.')); }}><Ionicons name="checkmark-done" size={21} color={Colors.primary} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View><Text style={styles.summaryValue}>{unread}</Text><Text style={styles.summaryLabel}>updates need your attention</Text></View>
          <View style={styles.summaryIcon}><Ionicons name="pulse" size={22} color={Colors.primary} /></View>
        </View>

        <View style={styles.filters}>
          {([['all', 'All activity'], ['proof', 'What opened'], ['social', 'Your Scene']] as const).map(([id, label]) => (
            <Pressable key={id} style={[styles.filter, filter === id && styles.filterActive]} onPress={() => setFilter(id)}><Text style={[styles.filterText, filter === id && styles.filterTextActive]}>{label}</Text></Pressable>
          ))}
        </View>

        <Text style={styles.sectionEyebrow}>RECENT ACTIVITY</Text>
        {loading && notifications.length === 0 ? <View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.loadingText}>Checking for updates…</Text></View> : error && notifications.length === 0 ? <Pressable style={styles.loading} onPress={refresh}><Ionicons name="cloud-offline-outline" size={29} color={Colors.gray[500]} /><Text style={styles.loadingTitle}>Inbox could not refresh</Text><Text style={styles.loadingText}>Tap to try again.</Text></Pressable> : visible.length === 0 ? <View style={styles.loading}><Ionicons name="notifications-off-outline" size={31} color={Colors.gray[500]} /><Text style={styles.loadingTitle}>No updates yet</Text><Text style={styles.loadingText}>Proof decisions, unlocks, Scene activity, and growth signals will appear here.</Text></View> : visible.map((item) => {
          const meta = kindMeta[item.kind];
          const isUnread = item.unread && !readIds.includes(item.id);
          return (
            <Pressable key={item.id} style={[styles.item, isUnread && styles.itemUnread]} onPress={() => openItem(item)}>
              <View style={[styles.itemIcon, { backgroundColor: `${meta.color}18` }]}><Ionicons name={meta.icon} size={21} color={meta.color} /></View>
              <View style={styles.itemCopy}>
                <View style={styles.itemMeta}><Text style={[styles.kind, { color: meta.color }]}>{item.eyebrow}</Text><Text style={styles.time}>{item.time}</Text></View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDetail}>{item.detail}</Text>
              </View>
              {isUnread ? <View style={styles.unreadDot} /> : item.route ? <Ionicons name="chevron-forward" size={18} color={Colors.gray[600]} /> : null}
            </Pressable>
          );
        })}

        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}><Ionicons name="notifications" size={21} color={Colors.primary} /></View>
          <View style={styles.permissionCopy}><Text style={styles.permissionTitle}>Keep the useful updates</Text><Text style={styles.permissionDetail}>Hear when a host recognizes your contribution, access is ending, someone joins your Scene, or a Moment you chose is about to begin.</Text></View>
          <Ionicons name="chevron-forward" size={19} color={Colors.gray[500]} />
        </View>
        <View style={{ height: 45 }} />
      </ScrollView>
    </View>
  );
}

function notificationKind(type: string): ActivityItem['kind'] { return resolveNotificationJourney({ type }).kind; }
function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: Spacing.container, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: Colors.black },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  heading: { flex: 1, marginLeft: 13, backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1 },
  title: { color: Colors.white, fontSize: Typography.sizes['2xl'], fontWeight: '800', letterSpacing: -.7, marginTop: 2 },
  markRead: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  content: { paddingHorizontal: Spacing.container, paddingTop: 18 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: BorderRadius.xl, backgroundColor: '#24160F', borderWidth: 1, borderColor: 'rgba(255,106,26,.24)' },
  summaryValue: { color: Colors.white, fontSize: 31, fontWeight: '800' },
  summaryLabel: { color: Colors.gray[400], fontSize: 13, marginTop: 2 },
  summaryIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 7, marginTop: 17, backgroundColor: 'transparent' },
  filter: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 17, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.gray[400], fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: Colors.black },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1, marginTop: 25, marginBottom: 10 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 9, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  itemUnread: { borderColor: 'rgba(255,106,26,.3)', backgroundColor: '#1D1713' },
  itemIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  itemCopy: { flex: 1, backgroundColor: 'transparent' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  kind: { fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6, flex: 1 },
  time: { color: Colors.gray[600], fontSize: 12 },
  itemTitle: { color: Colors.white, fontSize: 13, fontWeight: '800', marginTop: 4 },
  itemDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 15, marginTop: 3, paddingRight: 9 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: 8 },
  permissionCard: { flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 16, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  permissionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  permissionCopy: { flex: 1, backgroundColor: 'transparent' },
  permissionTitle: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  permissionDetail: { color: Colors.gray[500], fontSize: 12, lineHeight: 14, marginTop: 3, paddingRight: 8 },
  loading: { minHeight: 190, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'transparent' },
  loadingTitle: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  loadingText: { color: Colors.gray[500], fontSize: 12 },
});
