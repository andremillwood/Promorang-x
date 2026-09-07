import { ActivityIndicator, ImageBackground, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useVaultAssets, useVaultMemories, useVaultSummary, useVaultTransactions } from '@/hooks/useVault';
import { useState } from 'react';
import { CommerceReceipt, useCommerceReceipts } from '@/hooks/useCommerceReceipts';
import { resolveCommerceReceiptPresentation } from '@promorang/shared';
import { useQuery } from '@tanstack/react-query';
import { guestRsvpApi } from '@/lib/api';
import { PromoCardFace } from '@/components/people/PromoCardFace';
import { useMyPromoCard } from '@/hooks/usePeopleExperience';
import { presentPromoCard } from '@/lib/promoCard';

const assetMeta = {
  token: { label: 'Value', icon: 'sparkles', color: Colors.primary },
  nft: { label: 'Memories', icon: 'images', color: Colors.purple },
  coupon: { label: 'Rewards', icon: 'gift', color: Colors.success },
  ticket: { label: 'Access', icon: 'ticket', color: Colors.warning },
  key: { label: 'Invitations', icon: 'key', color: Colors.info },
} as const;

function receiptPresentation(receipt: CommerceReceipt) {
  const type = receipt.receipt_type || 'receipt';
  const status = receipt.status || 'issued';
  const productName = receipt.merchant_products?.name;
  const couponCode = receipt.attribution?.coupon_code;
  const title = productName
    || (type === 'claim' ? `Offer claimed${couponCode ? ` · ${couponCode}` : ''}` : null)
    || (type === 'redemption' ? `Offer redeemed${couponCode ? ` · ${couponCode}` : ''}` : null)
    || type.replace('_', ' ');
  const icon = type === 'purchase' ? 'bag-check' : type === 'reservation' ? 'bookmark' : type === 'redemption' ? 'checkmark-done' : type === 'claim' ? 'gift' : 'receipt';
  const color = type === 'purchase' ? Colors.success : type === 'reservation' ? Colors.info : type === 'redemption' ? Colors.primary : type === 'claim' ? Colors.warning : Colors.primary;
  const amount = Number(receipt.amount || 0);
  const value = receipt.redemption_code
    || (amount > 0 ? `${amount.toLocaleString()} ${receipt.currency || 'USD'}` : status);

  const consequence = resolveCommerceReceiptPresentation({ receiptType: type, status, productName, attribution: receipt.attribution as any });
  return { title, icon, color, value, status, consequence };
}

export default function VaultScreen() {
  const [activeTab, setActiveTab] = useState<'kept' | 'activity'>('kept');
  const card = useMyPromoCard();
  const cardView = presentPromoCard(card.data);
  const { assets, loading: assetsLoading } = useVaultAssets();
  const { memories, loading: memoriesLoading } = useVaultMemories();
  const { summary, loading: summaryLoading } = useVaultSummary();
  const { transactions, loading: transactionsLoading } = useVaultTransactions();
  const { receipts, loading: receiptsLoading } = useCommerceReceipts();
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['guest-attendance-receipts'],
    queryFn: guestRsvpApi.attendanceReceipts,
  });
  const attendanceReceipts = attendanceData?.receipts || [];
  const loading = assetsLoading || summaryLoading || memoriesLoading;
  const assetCount = memories.length + Object.values(summary?.asset_counts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const retainedGemValue = summary?.total_value_usd || 0;
  const featuredMemory = memories[0];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>WHAT YOU KEEP</Text><Text style={styles.title}>Vault</Text></View>
        <Pressable accessibilityLabel="Vault settings" style={styles.settings} onPress={() => router.push('/modal')}><Ionicons name="settings-outline" size={20} color={Colors.white} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}><View style={styles.lock}><Ionicons name="lock-closed" size={18} color={Colors.primary} /></View><Text style={styles.heroMeta}>PRIVATE BY DEFAULT</Text></View>
          <Text style={styles.heroLabel}>RETAINED VALUE & MEMORY</Text>
          <Text style={styles.heroValue}>{assetCount}</Text>
          <Text style={styles.heroUnit}>memories, access, and value kept from taking part</Text>
          <View style={styles.heroDivider} />
          <View style={styles.heroFoot}>
            <View><Text style={styles.footValue}>{retainedGemValue.toLocaleString()} Gems</Text><Text style={styles.footLabel}>retained platform value</Text></View>
            <Pressable style={styles.scanButton} onPress={() => router.push('/check-in')}><Ionicons name="qr-code" size={17} color={Colors.black} /><Text style={styles.scanText}>Use access</Text></Pressable>
          </View>
        </View>

        <Pressable onPress={() => router.push('/card')} style={styles.cardLink}>
          <PromoCardFace
            holder={cardView.holder}
            available={cardView.available}
            limit={cardView.limit}
            places={cardView.places}
            tier={cardView.tier}
            cardNumber={cardView.cardNumber}
            compact
          />
        </Pressable>

        <View style={styles.tabs}>
          <Pressable onPress={() => setActiveTab('kept')} style={[styles.tab, activeTab === 'kept' && styles.tabActive]}><Text style={[styles.tabText, activeTab === 'kept' && styles.tabTextActive]}>Memories</Text></Pressable>
          <Pressable onPress={() => setActiveTab('activity')} style={[styles.tab, activeTab === 'activity' && styles.tabActive]}><Text style={[styles.tabText, activeTab === 'activity' && styles.tabTextActive]}>Activity</Text></Pressable>
        </View>

        {loading ? (
          <View style={styles.state}><ActivityIndicator color={Colors.primary} /><Text style={styles.stateText}>Opening your Vault…</Text></View>
        ) : activeTab === 'kept' ? (
          <>
            {featuredMemory?.moments?.image_url ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`Open memory: ${featuredMemory.title}`} style={styles.featuredMemory} onPress={() => router.push(`/memory/${featuredMemory.id}` as any)}>
                <ImageBackground source={{ uri: featuredMemory.moments.image_url }} style={styles.featuredMemoryImage} imageStyle={styles.featuredMemoryRadius}>
                  <View style={styles.featuredMemoryShade} />
                  <View style={styles.featuredMemoryBadge}><Text style={styles.featuredMemoryBadgeText}>LATEST MEMORY</Text></View>
                  <View style={styles.featuredMemoryCopy}><Text style={styles.featuredMemoryPlace}>{featuredMemory.moments.location || 'PROMORANG'}</Text><Text style={styles.featuredMemoryTitle}>{featuredMemory.title}</Text><Text style={styles.featuredMemoryAction}>Open the memory  →</Text></View>
                </ImageBackground>
              </Pressable>
            ) : null}
            <Text style={styles.sectionEyebrow}>COLLECTIONS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collections}>
              {(Object.keys(assetMeta) as Array<keyof typeof assetMeta>).map((type) => {
                const meta = assetMeta[type];
                const count = type === 'nft' ? memories.length + (summary?.asset_counts?.[type] || 0) : summary?.asset_counts?.[type] || 0;
                return (
                  <View key={type} style={styles.collection}>
                    <View style={[styles.collectionIcon, { backgroundColor: `${meta.color}18` }]}><Ionicons name={meta.icon} size={21} color={meta.color} /></View>
                    <Text style={styles.collectionCount}>{count}</Text><Text style={styles.collectionLabel}>{meta.label}</Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Recently kept</Text><Text style={styles.sectionCount}>{memories.length + assets.length} objects</Text></View>
            {memories.length === 0 && assets.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}><Ionicons name="archive-outline" size={29} color={Colors.primary} /></View>
                <Text style={styles.emptyTitle}>Your first object starts outside.</Text>
                <Text style={styles.emptyDetail}>Show up, take part, or open something new. The memories, access, and useful value will live here.</Text>
                <Pressable style={styles.emptyAction} onPress={() => router.push('/discover')}><Text style={styles.emptyActionText}>Find something to do</Text><Ionicons name="arrow-forward" size={16} color={Colors.black} /></Pressable>
              </View>
            ) : <>
              {memories.map((memory) => (
                <Pressable accessibilityRole="button" accessibilityLabel={`Open memory: ${memory.title}`} onPress={() => router.push(`/memory/${memory.id}` as any)} key={memory.id} style={styles.asset}>
                  <View style={[styles.assetIcon, { backgroundColor: `${Colors.purple}18` }]}><Ionicons name="images" size={20} color={Colors.purple} /></View>
                  <View style={styles.assetCopy}><Text style={styles.assetType}>{memory.rarity.toUpperCase()} MEMORY</Text><Text style={styles.assetName}>{memory.title}</Text><Text style={styles.assetDetail}>{memory.moments?.location ? `${memory.moments.location} · ` : ''}Kept from being part of it</Text></View>
                  <View style={styles.assetValue}><Ionicons name="arrow-forward" size={17} color={Colors.gray[500]} /><Text style={styles.assetSymbol}>OPEN</Text></View>
                </Pressable>
              ))}
              {assets.map((asset) => {
              const meta = assetMeta[asset.asset_type];
              return (
                <View key={asset.id} style={styles.asset}>
                  <View style={[styles.assetIcon, { backgroundColor: `${meta.color}18` }]}><Ionicons name={meta.icon} size={20} color={meta.color} /></View>
                  <View style={styles.assetCopy}><Text style={styles.assetType}>{meta.label.toUpperCase()}</Text><Text style={styles.assetName}>{asset.asset_name}</Text><Text style={styles.assetDetail}>{asset.expires_at ? `Available until ${new Date(asset.expires_at).toLocaleDateString()}` : 'Opened by taking part'}</Text></View>
                  <View style={styles.assetValue}><Text style={styles.assetAmount}>{asset.balance.toLocaleString()}</Text><Text style={styles.assetSymbol}>{asset.asset_symbol}</Text></View>
                </View>
              );
            })}
            </>}
          </>
        ) : (
          <>
            <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Vault activity</Text><Ionicons name="pulse" size={18} color={Colors.primary} /></View>
            {(transactionsLoading || receiptsLoading || attendanceLoading) ? <View style={styles.state}><ActivityIndicator color={Colors.primary} /></View> : transactions.length === 0 && receipts.length === 0 && attendanceReceipts.length === 0 ? (
              <View style={styles.empty}><Text style={styles.emptyTitle}>No activity yet.</Text><Text style={styles.emptyDetail}>Unlocks, redemptions, and transfers will leave a clear receipt here.</Text></View>
            ) : <>{attendanceReceipts.map((receipt: any) => {
              const outcomes = receipt.outcomes || {};
              const value = [outcomes.pieces_awarded ? `${outcomes.piece_quantity || 4} Pieces` : null, outcomes.promoshare_ticket_awarded ? '1 PromoShare ticket' : null].filter(Boolean).join(' · ') || 'Attendance verified';
              return (
                <View key={`attendance-${receipt.id}`} style={styles.activity}>
                  <View style={[styles.activityIcon, { backgroundColor: Colors.ambientWash }]}><Ionicons name="checkmark-circle" size={18} color={Colors.primary} /></View>
                  <View style={styles.activityCopy}><Text style={styles.activityEyebrow}>IT COUNTED · ATTENDANCE RECEIPT</Text><Text style={styles.activityTitle}>{receipt.moments?.title || 'Moment attended'}</Text><Text style={styles.activityDate}>{new Date(receipt.verified_at).toLocaleDateString()} · {receipt.verification_method || 'verified'} · {value}</Text></View>
                  <Text style={styles.activityAmount}>{receipt.status}</Text>
                </View>
              );
            })}{receipts.map((receipt) => {
              const meta = receiptPresentation(receipt);
              return (
                <Pressable key={receipt.id} style={styles.activity} onPress={() => router.push(`/receipts/${receipt.id}` as any)}>
                  <View style={[styles.activityIcon, { backgroundColor: `${meta.color}18` }]}><Ionicons name={meta.icon as any} size={18} color={meta.color} /></View>
                  <View style={styles.activityCopy}><Text style={styles.activityEyebrow}>{meta.consequence.headline.toUpperCase()}</Text><Text style={styles.activityTitle}>{meta.title}</Text><Text style={styles.activityDate}>{new Date(receipt.occurred_at).toLocaleDateString()} · {meta.consequence.outcomes.map((outcome) => outcome.value).join(' · ')}</Text></View>
                  <Text style={styles.activityAmount} numberOfLines={1}>{meta.value}</Text>
                </Pressable>
              );
            })}{transactions.map((transaction) => {
              const incoming = transaction.amount > 0;
              return (
                <View key={transaction.id} style={styles.activity}>
                  <View style={[styles.activityIcon, { backgroundColor: incoming ? 'rgba(103,197,135,.12)' : Colors.ambientWash }]}><Ionicons name={incoming ? 'arrow-down' : 'arrow-up'} size={18} color={incoming ? Colors.success : Colors.primary} /></View>
                  <View style={styles.activityCopy}><Text style={styles.activityTitle}>{transaction.transaction_type.replace('_', ' ')}</Text><Text style={styles.activityDate}>{new Date(transaction.created_at).toLocaleDateString()} · {transaction.status}</Text></View>
                  <Text style={[styles.activityAmount, { color: incoming ? Colors.success : Colors.white }]}>{incoming ? '+' : ''}{transaction.amount}</Text>
                </View>
              );
            })}</>}
          </>
        )}
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: 18, paddingHorizontal: Spacing.container, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.black },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1.1 },
  title: { color: Colors.white, fontSize: Typography.sizes['3xl'], fontWeight: '800', letterSpacing: -1, marginTop: 3 },
  settings: { width: 41, height: 41, borderRadius: 21, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.container },
  hero: { overflow: 'hidden', padding: 20, borderRadius: BorderRadius['2xl'], backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  heroGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -70, top: -90, backgroundColor: 'rgba(255,106,26,.13)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' },
  lock: { width: 36, height: 36, borderRadius: 13, backgroundColor: Colors.ambientWash, alignItems: 'center', justifyContent: 'center' },
  heroMeta: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .7 },
  heroLabel: { color: Colors.gray[400], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .8, marginTop: 25 },
  heroValue: { color: Colors.white, fontSize: 43, lineHeight: 48, fontWeight: '800', letterSpacing: -1.5, marginTop: 3 },
  heroUnit: { color: Colors.gray[400], fontSize: 12 },
  heroDivider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: 17 },
  heroFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent' },
  footValue: { color: Colors.white, fontSize: 17, fontWeight: '800' },
  footLabel: { color: Colors.gray[500], fontSize: 12, marginTop: 2 },
  scanButton: { flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 13, paddingVertical: 10, borderRadius: 18, backgroundColor: Colors.primary },
  scanText: { color: Colors.black, fontSize: 13, fontWeight: '800' },
  cardLink: { marginBottom: 8 },
  tabs: { flexDirection: 'row', marginVertical: 18, padding: 4, borderRadius: 16, backgroundColor: Colors.gray[900] },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 13, backgroundColor: 'transparent' },
  tabActive: { backgroundColor: Colors.gray[700] },
  tabText: { color: Colors.gray[500], fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: Colors.white },
  sectionEyebrow: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1, marginBottom: 10 },
  featuredMemory: { height: 300, overflow: 'hidden', borderRadius: BorderRadius['2xl'], marginBottom: 24, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  featuredMemoryImage: { flex: 1, justifyContent: 'space-between', padding: 15 },
  featuredMemoryRadius: { borderRadius: BorderRadius['2xl'] },
  featuredMemoryShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.34)' },
  featuredMemoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(8,8,8,.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,.15)' },
  featuredMemoryBadgeText: { color: Colors.white, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: .7 },
  featuredMemoryCopy: { backgroundColor: 'transparent' },
  featuredMemoryPlace: { color: Colors.accent, fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: .65 },
  featuredMemoryTitle: { color: Colors.white, fontSize: 28, lineHeight: 30, fontWeight: '900', letterSpacing: -.8, marginTop: 6 },
  featuredMemoryAction: { color: Colors.white, fontSize: 12, fontWeight: '800', marginTop: 12 },
  collections: { gap: 9, paddingBottom: 24 },
  collection: { width: 104, padding: 13, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  collectionIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  collectionCount: { color: Colors.white, fontSize: 19, fontWeight: '800', marginTop: 14 },
  collectionLabel: { color: Colors.gray[500], fontSize: 12, marginTop: 2 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11, backgroundColor: 'transparent' },
  sectionTitle: { color: Colors.white, fontSize: 17, fontWeight: '800' },
  sectionCount: { color: Colors.gray[500], fontFamily: 'SpaceMono', fontSize: 12 },
  empty: { padding: 25, borderRadius: BorderRadius.xl, alignItems: 'center', backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  emptyIcon: { width: 56, height: 56, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.ambientWash },
  emptyTitle: { color: Colors.white, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  emptyDetail: { color: Colors.gray[400], fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6, maxWidth: 285 },
  emptyAction: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 20, backgroundColor: Colors.primary },
  emptyActionText: { color: Colors.black, fontSize: 13, fontWeight: '800' },
  asset: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 9, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  assetIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  assetCopy: { flex: 1, backgroundColor: 'transparent' },
  assetType: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: .6 },
  assetName: { color: Colors.white, fontSize: 13, fontWeight: '700', marginTop: 3 },
  assetDetail: { color: Colors.gray[500], fontSize: 12, marginTop: 3 },
  assetValue: { alignItems: 'flex-end', backgroundColor: 'transparent' },
  assetAmount: { color: Colors.white, fontSize: 15, fontWeight: '800' },
  assetSymbol: { color: Colors.gray[500], fontSize: 12, marginTop: 2 },
  activity: { flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 9, borderRadius: BorderRadius.xl, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.border },
  activityIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  activityCopy: { flex: 1, backgroundColor: 'transparent' },
  activityEyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: .6, marginBottom: 3 },
  activityTitle: { color: Colors.white, fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  activityDate: { color: Colors.gray[500], fontSize: 12, marginTop: 3, textTransform: 'capitalize' },
  activityAmount: { fontSize: 14, fontWeight: '800' },
  state: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'transparent' },
  stateText: { color: Colors.gray[500], fontSize: 12 },
});
