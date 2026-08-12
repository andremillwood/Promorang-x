import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { commerceApi } from '@/lib/api';
import { resolveCommerceReceiptPresentation } from '@promorang/shared';

type Receipt = {
  id: string;
  receipt_type: string;
  status: string;
  amount?: number | string | null;
  currency?: string | null;
  redemption_code?: string | null;
  occurred_at?: string | null;
  attribution?: Record<string, any> | null;
  merchant_products?: {
    id?: string | null;
    name?: string | null;
    description?: string | null;
    image_url?: string | null;
    category?: string | null;
    fulfillment_mode?: string | null;
  } | null;
};

type TimelineItem = {
  label: string;
  at?: string | null;
  tone?: string;
  detail?: string | null;
};

function money(receipt?: Receipt | null) {
  const amount = Number(receipt?.amount || 0);
  if (!amount) return 'No cash value';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: receipt?.currency || 'USD' }).format(amount);
}

function receiptTitle(receipt?: Receipt | null) {
  if (!receipt) return 'Commerce receipt';
  if (receipt.merchant_products?.name) return receipt.merchant_products.name;
  if (receipt.receipt_type === 'claim') return `Offer claimed${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ''}`;
  if (receipt.receipt_type === 'redemption') return `Offer redeemed${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ''}`;
  return receipt.receipt_type.replace('_', ' ');
}

function statusColor(status?: string) {
  if (status === 'fulfilled') return Colors.success;
  if (status === 'cancelled' || status === 'refunded') return Colors.error;
  if (status === 'pending' || status === 'issued') return Colors.warning;
  return Colors.gray[400];
}

function iconFor(type?: string) {
  if (type === 'purchase') return 'bag-check';
  if (type === 'reservation') return 'bookmark';
  if (type === 'claim') return 'gift';
  if (type === 'redemption') return 'checkmark-done';
  return 'receipt';
}

function formatDate(value?: string | null) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleString();
}

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const query = useQuery({
    queryKey: ['commerce-receipt-detail', id],
    enabled: Boolean(id),
    queryFn: () => commerceApi.getReceipt(String(id)),
  });

  const receipt = query.data?.receipt as Receipt | undefined;
  const timeline = (query.data?.timeline || []) as TimelineItem[];
  const status = statusColor(receipt?.status);
  const code = receipt?.redemption_code || receipt?.attribution?.coupon_code || receipt?.id;
  const presentation = receipt ? resolveCommerceReceiptPresentation({ receiptType: receipt.receipt_type, status: receipt.status, productName: receipt.merchant_products?.name, attribution: receipt.attribution }) : null;

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>COMMERCE PROOF</Text>
          <Text style={styles.headerTitle}>Receipt</Text>
        </View>
      </View>

      {query.isLoading ? (
        <View style={styles.state}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Opening receipt…</Text>
        </View>
      ) : query.error ? (
        <View style={styles.state}>
          <Ionicons name="warning" size={30} color={Colors.error} />
          <Text style={styles.errorTitle}>Receipt unavailable</Text>
          <Text style={styles.stateText}>{query.error instanceof Error ? query.error.message : 'Could not load this receipt.'}</Text>
        </View>
      ) : receipt ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            {receipt.merchant_products?.image_url ? (
              <Image source={{ uri: receipt.merchant_products.image_url }} style={styles.heroImage} />
            ) : null}
            <View style={styles.heroVeil} />
            <View style={styles.heroTop}>
              <View style={styles.iconBadge}><Ionicons name={iconFor(receipt.receipt_type) as any} size={19} color={Colors.primary} /></View>
              <View style={[styles.statusPill, { borderColor: `${status}55`, backgroundColor: `${status}18` }]}>
                <Text style={[styles.statusText, { color: status }]}>{receipt.status}</Text>
              </View>
            </View>
            <View style={styles.paperReceipt}>
              <Text style={styles.paperBrand}>{presentation?.eyebrow.toUpperCase()}</Text>
              <Text style={styles.paperHeadline}>{presentation?.headline.toUpperCase()}</Text>
              <Text style={styles.paperTitle}>{presentation?.title || receiptTitle(receipt)}</Text>
              <Text style={styles.paperDescription}>{presentation?.explanation}</Text>
              <View style={styles.paperRule} />
              {presentation?.outcomes.map(outcome => <View key={outcome.id} style={styles.outcomeRow}><Text style={styles.outcomeLabel}>{outcome.label}</Text><Text style={styles.outcomeValue}>{outcome.value}</Text></View>)}
              <View style={styles.savedRow}><Ionicons name="checkmark-circle" size={16} color={Colors.primary} /><Text style={styles.savedText}>SAVED TO VAULT</Text></View>
            </View>
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metric}><Text style={styles.metricLabel}>Value</Text><Text style={styles.metricValue}>{money(receipt)}</Text></View>
            <View style={styles.metric}><Text style={styles.metricLabel}>Issued</Text><Text style={styles.metricValueSmall}>{formatDate(receipt.occurred_at)}</Text></View>
          </View>

          <View style={styles.codeCard}>
            <Text style={styles.metricLabel}>Code / receipt ID</Text>
            <Text style={styles.codeText}>{code}</Text>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <Ionicons name="time" size={18} color={Colors.primary} />
          </View>
          {timeline.map((item, index) => {
            const tone = item.tone === 'stopped' ? Colors.error : item.tone === 'pending' ? Colors.warning : Colors.success;
            return (
              <View key={`${item.label}-${index}`} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: tone }]} />
                <View style={styles.timelineCopy}>
                  <Text style={styles.timelineTitle}>{item.label}</Text>
                  <Text style={styles.timelineDate}>{formatDate(item.at)}</Text>
                  {item.detail ? <Text style={styles.timelineDetail}>{item.detail}</Text> : null}
                </View>
              </View>
            );
          })}

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Connected commerce</Text>
            <Ionicons name="sparkles" size={18} color={Colors.primary} />
          </View>
          <View style={styles.detailCard}>
            <Detail label="Product" value={receipt.merchant_products?.name || 'Not attached'} />
            <Detail label="Fulfillment" value={receipt.merchant_products?.fulfillment_mode || receipt.attribution?.fulfillment_mode || 'Not specified'} />
            <Detail label="Source" value={receipt.attribution?.source || 'Promorang commerce'} />
            {receipt.attribution?.stripe_payment_intent_id ? <Detail label="Stripe intent" value={receipt.attribution.stripe_payment_intent_id} mono /> : null}
            {receipt.attribution?.stripe_refund_id ? <Detail label="Stripe refund" value={receipt.attribution.stripe_refund_id} mono /> : null}
          </View>
          {!['cancelled', 'refunded'].includes(receipt.status) ? <Pressable accessibilityRole="button" style={styles.reportButton} onPress={() => router.push({ pathname: '/commerce-issue', params: { receiptId: receipt.id, product: receiptTitle(receipt) } } as never)}><Ionicons name="alert-circle-outline" size={18} color={Colors.error} /><Text style={styles.reportText}>Report a problem with this transaction</Text></Pressable> : null}

          <View style={{ height: 80 }} />
        </ScrollView>
      ) : null}
    </View>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.detailMono]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: 18, paddingHorizontal: Spacing.container, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.black },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { backgroundColor: 'transparent' },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1 },
  headerTitle: { color: Colors.white, fontSize: Typography.sizes['2xl'], fontWeight: '900' as any, letterSpacing: -0.8 },
  content: { paddingHorizontal: Spacing.container },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, backgroundColor: Colors.black },
  stateText: { color: Colors.gray[400], fontSize: Typography.sizes.sm, textAlign: 'center', marginTop: 10 },
  errorTitle: { color: Colors.white, fontSize: Typography.sizes.xl, fontWeight: '900' as any, marginTop: 12 },
  hero: { minHeight: 310, overflow: 'hidden', padding: 20, borderRadius: BorderRadius['2xl'], backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.34 },
  heroVeil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.66)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' },
  iconBadge: { width: 44, height: 44, borderRadius: 16, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '900' as any, textTransform: 'uppercase', letterSpacing: 0.7 },
  paperReceipt:{marginTop:26,padding:18,backgroundColor:'#f4ead8',borderTopWidth:1,borderBottomWidth:1,borderStyle:'dashed',borderColor:'rgba(0,0,0,.24)'},
  paperBrand:{color:Colors.primary,fontFamily:'SpaceMono',fontSize:9,letterSpacing:1},
  paperHeadline:{color:'#17130f',fontSize:37,lineHeight:39,fontWeight:'900' as any,letterSpacing:-1.4,marginTop:6},
  paperTitle:{color:'#17130f',fontSize:14,fontWeight:'900' as any,textTransform:'capitalize',marginTop:3},
  paperDescription:{color:'rgba(0,0,0,.55)',fontSize:11,lineHeight:17,marginTop:8},
  paperRule:{height:1,backgroundColor:'rgba(0,0,0,.14)',marginVertical:13},
  outcomeRow:{flexDirection:'row',justifyContent:'space-between',gap:12,paddingVertical:7,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'rgba(0,0,0,.12)',backgroundColor:'transparent'},
  outcomeLabel:{color:'rgba(0,0,0,.5)',fontSize:11},
  outcomeValue:{color:'#17130f',fontSize:11,fontWeight:'900' as any,textTransform:'capitalize'},
  savedRow:{flexDirection:'row',alignItems:'center',gap:6,paddingTop:14,backgroundColor:'transparent'},
  savedText:{color:'#17130f',fontFamily:'SpaceMono',fontSize:9,letterSpacing:.5},
  reportButton:{marginTop:16,minHeight:48,borderRadius:16,borderWidth:1,borderColor:'rgba(239,68,68,.28)',backgroundColor:'rgba(239,68,68,.08)',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingHorizontal:14},
  reportText:{color:Colors.error,fontSize:12,fontWeight:'900' as any},
  typeLabel: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginTop: 56 },
  title: { color: Colors.white, fontSize: 38, lineHeight: 39, fontWeight: '900' as any, letterSpacing: -1.6, textTransform: 'uppercase', marginTop: 10 },
  description: { color: Colors.gray[300], fontSize: Typography.sizes.sm, lineHeight: 21, marginTop: 12 },
  metricGrid: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, backgroundColor: 'transparent' },
  metric: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  metricLabel: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .7, textTransform: 'uppercase' },
  metricValue: { color: Colors.white, fontSize: Typography.sizes.xl, fontWeight: '900' as any, marginTop: 7 },
  metricValueSmall: { color: Colors.white, fontSize: Typography.sizes.xs, fontWeight: '800' as any, marginTop: 7 },
  codeCard: { marginTop: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.xl, backgroundColor: Colors.ambientWash, borderWidth: 1, borderColor: 'rgba(255,106,26,.25)' },
  codeText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 12, lineHeight: 18, marginTop: 8 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xl, marginBottom: Spacing.sm, backgroundColor: 'transparent' },
  sectionTitle: { color: Colors.white, fontSize: Typography.sizes.lg, fontWeight: '900' as any },
  timelineItem: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, marginBottom: Spacing.sm, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  timelineCopy: { flex: 1, backgroundColor: 'transparent' },
  timelineTitle: { color: Colors.white, fontSize: Typography.sizes.sm, fontWeight: '800' as any },
  timelineDate: { color: Colors.gray[500], fontSize: Typography.sizes.xs, marginTop: 3 },
  timelineDetail: { color: Colors.gray[400], fontSize: Typography.sizes.xs, lineHeight: 17, marginTop: 6 },
  detailCard: { padding: Spacing.md, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  detailRow: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, backgroundColor: 'transparent' },
  detailLabel: { color: Colors.gray[500], fontSize: Typography.sizes.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { color: Colors.white, fontSize: Typography.sizes.sm, fontWeight: '700' as any, marginTop: 3 },
  detailMono: { fontFamily: 'SpaceMono', fontSize: 13 },
});
