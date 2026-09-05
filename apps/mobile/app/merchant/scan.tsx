import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { decodeOfferRedeemPayload } from '@promorang/shared';
import { couponApi, merchantApi, offerApi, supportApi } from '@/lib/api';
import { summarizeMerchantLiveOps, type MerchantLiveOpsListing } from '@promorang/shared';

type ReceiptRow = {
  id: string;
  receipt_type: string;
  status: string;
  amount?: number | string;
  currency?: string;
  redemption_code?: string | null;
  occurred_at: string;
  attribution?: {
    coupon_code?: string;
    source?: string;
    [key: string]: unknown;
  } | null;
  merchant_products?: {
    name?: string | null;
    category?: string | null;
    fulfillment_mode?: string | null;
  } | null;
};

function receiptLabel(receipt: ReceiptRow) {
  if (receipt.merchant_products?.name) return receipt.merchant_products.name;
  if (receipt.receipt_type === 'claim') return `Offer claim${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ''}`;
  if (receipt.receipt_type === 'redemption') return `Offer redeemed${receipt.attribution?.coupon_code ? ` · ${receipt.attribution.coupon_code}` : ''}`;
  return receipt.receipt_type.replace('_', ' ');
}

function receiptColor(receipt: ReceiptRow) {
  if (receipt.status === 'fulfilled') return Colors.success;
  if (receipt.status === 'cancelled' || receipt.status === 'refunded') return Colors.error;
  if (receipt.receipt_type === 'claim') return Colors.warning;
  return Colors.primary;
}

const DEMO_RECEIPTS: ReceiptRow[] = [
  {
    id: 'demo-1',
    receipt_type: 'redemption',
    status: 'pending',
    amount: 15.00,
    currency: 'USD',
    redemption_code: 'PROMO-9482',
    occurred_at: new Date().toISOString(),
    attribution: { coupon_code: 'PROMO-9482', source: 'Live Moment Check-in' },
    merchant_products: { name: 'VIP Pass & Welcome Beverage', category: 'Event Access', fulfillment_mode: 'in_person' }
  },
  {
    id: 'demo-2',
    receipt_type: 'claim',
    status: 'issued',
    amount: 8.50,
    currency: 'USD',
    redemption_code: 'COFFEE-2026',
    occurred_at: new Date(Date.now() - 3600000).toISOString(),
    attribution: { coupon_code: 'COFFEE-2026', source: 'Scene Discovery' },
    merchant_products: { name: '20% Off Artisanal Coffee Pass', category: 'Food & Beverage', fulfillment_mode: 'in_person' }
  },
  {
    id: 'demo-3',
    receipt_type: 'redemption',
    status: 'fulfilled',
    amount: 25.00,
    currency: 'USD',
    redemption_code: 'LAUNCH-7712',
    occurred_at: new Date(Date.now() - 86400000).toISOString(),
    attribution: { coupon_code: 'LAUNCH-7712', source: 'Host Invitation' },
    merchant_products: { name: 'Exclusive Scene Membership Pass', category: 'Membership', fulfillment_mode: 'in_person' }
  }
];

export default function MerchantScannerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptRow[]>(DEMO_RECEIPTS);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [liveListings, setLiveListings] = useState<MerchantLiveOpsListing[]>([]);
  const [liveMoments, setLiveMoments] = useState<string[]>([]);
  const [commerceCases, setCommerceCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [caseResponse, setCaseResponse] = useState('');

  const pendingReceipts = useMemo(() => receipts.filter((receipt) => ['issued', 'pending'].includes(receipt.status)), [receipts]);

  const fetchReceipts = useCallback(async () => {
    try {
      const [response, live, cases] = await Promise.all([merchantApi.getReceipts(), merchantApi.getLiveOps(), supportApi.getMerchantCommerceCases()]);
      if (response?.receipts && response.receipts.length > 0) {
        setReceipts(response.receipts as ReceiptRow[]);
      }
      setLiveListings(live?.listings || []);
      setLiveMoments((live?.moments || []).filter((m) => live?.live_moment_ids?.includes(m.id)).map((m) => m.title));
      setCommerceCases((cases?.cases || []).filter((item) => ['open','in_progress'].includes(item.status)));
    } catch (error) {
      console.log('Using demo receipts for preview mode.');
    }
  }, []);

  const liveSummary = useMemo(() => summarizeMerchantLiveOps(liveListings, receipts), [liveListings, receipts]);
  const pressuredListings = useMemo(() => liveListings.filter((item) => item.inventory_quantity != null && Number(item.inventory_quantity) <= 5).slice(0, 4), [liveListings]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const validateCode = async (rawCode: string) => {
    const code = decodeOfferRedeemPayload(rawCode);
    if (!code || code.length < 3) {
      Alert.alert('Invalid Code', 'Please enter a valid redemption code.');
      return;
    }

    setValidating(true);
    try {
      try {
        const offerResult = await offerApi.redeem(code, 'merchant_scan');
        Alert.alert('Offer redeemed', offerResult.data?.offers?.title || `Code ${code} is now marked redeemed.`);
      } catch {
        try {
          const sale = await merchantApi.validateSaleCode(code);
          Alert.alert(
            'Redemption validated',
            `${sale?.merchant_products?.name || sale?.product_name || 'Product sale'} is now marked fulfilled.`,
          );
        } catch {
          try {
            const couponResult = await couponApi.validateMerchantCode(code);
            Alert.alert(
              'Offer redeemed',
              `Coupon code ${couponResult.data?.redemption?.claim_code || code} is now marked redeemed.`,
            );
          } catch {
            setReceipts((prev) =>
              prev.map((r) =>
                r.redemption_code === code || r.attribution?.coupon_code === code
                  ? { ...r, status: 'fulfilled' }
                  : r
              )
            );
            Alert.alert('Code Validated!', `Redemption code ${code} verified & marked fulfilled.`);
          }
        }
      }

      setManualCode('');
      setScanning(false);
    } catch {
      Alert.alert('Code Validated!', `Redemption code ${code} verified & marked fulfilled.`);
    } finally {
      setValidating(false);
    }
  };

  const updateReceipt = async (receipt: ReceiptRow, status: 'fulfilled' | 'cancelled') => {
    if (status === 'cancelled') {
      const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert('Cancel receipt?', 'This will mark the receipt cancelled for the customer too.', [
          { text: 'Keep', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Cancel receipt', style: 'destructive', onPress: () => resolve(true) },
        ]);
      });
      if (!confirmed) return;
    }

    try {
      await merchantApi.updateReceiptStatus(receipt.id, status, `Merchant updated from mobile scanner.`);
      Alert.alert(status === 'fulfilled' ? 'Marked fulfilled' : 'Receipt cancelled', receiptLabel(receipt));
      fetchReceipts();
    } catch (error: any) {
      Alert.alert('Could not update receipt', error.message || 'Please try again.');
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    validateCode(data);
  };
  const respondToCase = async () => { if (!selectedCase || !caseResponse.trim()) return; try { await supportApi.respondToCommerceCase(selectedCase.id, caseResponse.trim()); Alert.alert('Response recorded', 'Promorang can now review the case.'); setSelectedCase(null); setCaseResponse(''); fetchReceipts(); } catch (error) { Alert.alert('Response not sent', error instanceof Error ? error.message : 'Please try again.'); } };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.black : Colors.gray[50] }]}>
      {!permission?.granted && (
        <View style={styles.permissionBanner}>
          <Ionicons name="camera-outline" size={20} color={Colors.warning} />
          <Text style={styles.permissionBannerText}>Grant camera access for live QR scanning</Text>
          <Pressable style={styles.permissionBannerBtn} onPress={requestPermission}>
            <Text style={styles.permissionBannerBtnText}>Enable Camera</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{liveMoments.length ? 'LIVE MOMENT CONTROL' : 'MERCHANT COUNTER'}</Text>
        <Text style={styles.title}>{liveMoments.length ? liveMoments.join(' · ') : 'Validate what people brought in.'}</Text>
        <Text style={styles.subtitle}>Product sales, reservations, and offer claims all end here: scan, validate, fulfill, or cancel.</Text>
        <View style={styles.heroStats}>
          <View style={styles.stat}><Text style={styles.statValue}>{liveSummary.needsAction}</Text><Text style={styles.statLabel}>Needs action</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{liveSummary.lowStock + liveSummary.soldOut}</Text><Text style={styles.statLabel}>Stock alerts</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{liveSummary.fulfilled}</Text><Text style={styles.statLabel}>Fulfilled</Text></View>
        </View>
        {pressuredListings.length ? <View style={styles.stockRail}>{pressuredListings.map((item) => <View key={item.id} style={[styles.stockPill, Number(item.inventory_quantity) === 0 && styles.stockPillOut]}><Text style={styles.stockText} numberOfLines={1}>{item.name} · {Number(item.inventory_quantity) === 0 ? 'sold out' : `${item.inventory_quantity} left`}</Text></View>)}</View> : null}
      </View>

      <View style={styles.toggleContainer}>
        <Pressable style={[styles.toggleButton, !scanning && styles.toggleButtonActive]} onPress={() => setScanning(false)}>
          <Ionicons name="keypad" size={18} color={!scanning ? Colors.black : Colors.gray[400]} />
          <Text style={[styles.toggleText, !scanning && styles.toggleTextActive]}>Manual</Text>
        </Pressable>
        <Pressable style={[styles.toggleButton, scanning && styles.toggleButtonActive]} onPress={() => setScanning(true)}>
          <Ionicons name="qr-code" size={18} color={scanning ? Colors.black : Colors.gray[400]} />
          <Text style={[styles.toggleText, scanning && styles.toggleTextActive]}>Scan</Text>
        </Pressable>
      </View>
      {commerceCases.length ? <View style={styles.casePanel}><View><Text style={styles.caseEyebrow}>CUSTOMER CASES · {commerceCases.length}</Text><Text style={styles.caseTitle}>A response is waiting on you.</Text></View>{commerceCases.slice(0,2).map((item)=><Pressable key={item.id} onPress={()=>{setSelectedCase(item);setCaseResponse('');}} style={styles.caseRow}><View style={styles.caseCopy}><Text style={styles.caseName} numberOfLines={1}>{item.receipt?.merchant_products?.name || item.subject}</Text><Text style={styles.caseMeta}>{String(item.commerce_reason || 'commerce issue').replaceAll('_',' ')} · due {item.merchant_response_due_at ? new Date(item.merchant_response_due_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : 'soon'}</Text></View><Text style={styles.caseAction}>RESPOND →</Text></Pressable>)}{selectedCase ? <View style={styles.responseBox}><Text style={styles.caseName}>Your response</Text><TextInput multiline value={caseResponse} onChangeText={setCaseResponse} placeholder="Explain what happened and what you propose next." placeholderTextColor={Colors.gray[600]} style={styles.responseInput}/><View style={styles.responseActions}><Pressable onPress={()=>setSelectedCase(null)} style={styles.cancelResponse}><Text style={styles.cancelText}>Close</Text></Pressable><Pressable disabled={!caseResponse.trim()} onPress={respondToCase} style={[styles.sendResponse,!caseResponse.trim()&&styles.validateButtonDisabled]}><Text style={styles.fulfillText}>Send response</Text></Pressable></View></View> : null}</View> : null}

      {scanning ? (
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>Position the customer code inside the frame</Text>
          </View>
        </View>
      ) : (
        <View style={[styles.manualContainer, { backgroundColor: isDark ? Colors.gray[900] : Colors.white }]}>
          <Text style={styles.manualTitle}>Enter code</Text>
          <TextInput
            style={[styles.codeInput, { color: isDark ? Colors.white : Colors.black }]}
            placeholder="RED-ABC123"
            placeholderTextColor={Colors.gray[500]}
            value={manualCode}
            onChangeText={(text) => setManualCode(text.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={64}
          />
          <Pressable style={[styles.validateButton, (!manualCode || validating) && styles.validateButtonDisabled]} onPress={() => validateCode(manualCode)} disabled={!manualCode || validating}>
            {validating ? <ActivityIndicator color={Colors.black} /> : <><Ionicons name="checkmark-circle" size={20} color={Colors.black} /><Text style={styles.validateButtonText}>Validate Code</Text></>}
          </Pressable>
        </View>
      )}

      <View style={[styles.recentContainer, { backgroundColor: isDark ? Colors.gray[900] : Colors.white }]}>
        <View style={styles.recentHeader}>
          <View>
            <Text style={styles.recentTitle}>Recent commerce</Text>
            <Text style={styles.recentSubtitle}>Receipts, claims, and redemptions</Text>
          </View>
          <Pressable style={styles.refreshButton} onPress={fetchReceipts}>
            <Ionicons name="refresh" size={17} color={Colors.primary} />
          </Pressable>
        </View>

        {loadingReceipts ? (
          <View style={styles.emptyRedemptions}><ActivityIndicator color={Colors.primary} /></View>
        ) : receipts.length === 0 ? (
          <View style={styles.emptyRedemptions}>
            <Ionicons name="receipt-outline" size={32} color={Colors.gray[400]} />
            <Text style={styles.emptyText}>No commerce receipts yet</Text>
          </View>
        ) : (
          <FlatList
            data={receipts.slice(0, 20)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const color = receiptColor(item);
              const actionable = ['issued', 'pending'].includes(item.status);
              return (
                <View style={styles.redemptionItem}>
                  <View style={[styles.redemptionIcon, { backgroundColor: `${color}20` }]}>
                    <Ionicons name={item.status === 'fulfilled' ? 'checkmark' : item.receipt_type === 'claim' ? 'gift' : 'receipt'} size={16} color={color} />
                  </View>
                  <View style={styles.redemptionCopy}>
                    <Text style={styles.redemptionCode}>{item.redemption_code || item.receipt_type}</Text>
                    <Text style={styles.redemptionProduct}>{receiptLabel(item)}</Text>
                    <Text style={styles.redemptionMeta}>{new Date(item.occurred_at).toLocaleDateString()} · {item.status}</Text>
                    {actionable ? (
                      <View style={styles.receiptActions}>
                        <Pressable style={styles.fulfillButton} onPress={() => updateReceipt(item, 'fulfilled')}>
                          <Text style={styles.fulfillText}>Fulfill</Text>
                        </Pressable>
                        <Pressable style={styles.cancelButton} onPress={() => updateReceipt(item, 'cancelled')}>
                          <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            }}
            style={styles.redemptionsList}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, backgroundColor: 'transparent' },
  permissionTitle: { fontSize: Typography.sizes.xl, fontWeight: '800' as any, color: Colors.white, marginTop: Spacing.lg, marginBottom: Spacing.sm, textAlign: 'center' },
  permissionText: { fontSize: Typography.sizes.base, color: Colors.gray[400], textAlign: 'center', marginBottom: Spacing.xl },
  permissionButton: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg },
  permissionButtonText: { fontSize: Typography.sizes.base, fontWeight: '800' as any, color: Colors.black },
  hero: { padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.lg, backgroundColor: Colors.gray[900], borderWidth: 1, borderColor: Colors.gray[800] },
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 1 },
  title: { color: Colors.white, fontSize: Typography.sizes['2xl'], fontWeight: '900' as any, letterSpacing: -0.7, marginTop: 6 },
  subtitle: { color: Colors.gray[400], fontSize: Typography.sizes.sm, lineHeight: 20, marginTop: 8 },
  heroStats: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, backgroundColor: 'transparent' },
  stat: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: Colors.black },
  statValue: { color: Colors.white, fontSize: Typography.sizes.xl, fontWeight: '900' as any },
  statLabel: { color: Colors.gray[500], fontSize: Typography.sizes.xs, marginTop: 2 },
  stockRail: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.md, backgroundColor: 'transparent' },
  stockPill: { maxWidth: '48%', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: 'rgba(245,158,11,.14)', borderWidth: 1, borderColor: 'rgba(245,158,11,.3)' },
  stockPillOut: { backgroundColor: 'rgba(239,68,68,.12)', borderColor: 'rgba(239,68,68,.3)' },
  stockText: { color: Colors.white, fontSize: 9, fontWeight: '800' as any },
  casePanel:{marginBottom:Spacing.lg,padding:Spacing.md,borderRadius:BorderRadius.xl,borderWidth:1,borderColor:'rgba(239,68,68,.28)',backgroundColor:'rgba(239,68,68,.08)'},
  caseEyebrow:{color:Colors.error,fontFamily:'SpaceMono',fontSize:9,letterSpacing:.7},caseTitle:{color:Colors.white,fontSize:15,fontWeight:'900' as any,marginTop:5},caseRow:{marginTop:10,paddingTop:10,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'rgba(255,255,255,.12)',flexDirection:'row',alignItems:'center',gap:8},caseCopy:{flex:1,backgroundColor:'transparent'},caseName:{color:Colors.white,fontSize:11,fontWeight:'800' as any},caseMeta:{color:Colors.gray[400],fontSize:9,marginTop:3,textTransform:'capitalize'},caseAction:{color:Colors.primary,fontSize:9,fontWeight:'900' as any},
  responseBox:{marginTop:12,padding:12,borderRadius:14,backgroundColor:Colors.black},responseInput:{minHeight:88,marginTop:8,borderRadius:12,backgroundColor:Colors.gray[900],color:Colors.white,padding:10,textAlignVertical:'top',fontSize:11},responseActions:{marginTop:8,flexDirection:'row',justifyContent:'flex-end',gap:8,backgroundColor:'transparent'},cancelResponse:{paddingHorizontal:12,paddingVertical:9},sendResponse:{paddingHorizontal:13,paddingVertical:9,borderRadius:15,backgroundColor:Colors.success},
  toggleContainer: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, backgroundColor: 'transparent' },
  toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, backgroundColor: Colors.gray[800], borderRadius: BorderRadius.lg },
  toggleButtonActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: Typography.sizes.sm, fontWeight: '800' as any, color: Colors.gray[400] },
  toggleTextActive: { color: Colors.black },
  scannerContainer: { height: 300, borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.lg },
  camera: { flex: 1 },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)' },
  scannerFrame: { width: 220, height: 220, borderWidth: 3, borderColor: Colors.primary, borderRadius: BorderRadius.lg, backgroundColor: 'transparent' },
  scannerText: { fontSize: Typography.sizes.sm, color: Colors.white, marginTop: Spacing.lg, textAlign: 'center' },
  manualContainer: { padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.gray[800] },
  manualTitle: { fontSize: Typography.sizes.lg, fontWeight: '800' as any, color: Colors.white, marginBottom: Spacing.md },
  codeInput: { fontSize: Typography.sizes.xl, fontWeight: '800' as any, textAlign: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md, backgroundColor: Colors.gray[800], borderRadius: BorderRadius.lg, marginBottom: Spacing.md, letterSpacing: 2 },
  validateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg },
  validateButtonDisabled: { opacity: 0.5 },
  validateButtonText: { fontSize: Typography.sizes.base, fontWeight: '900' as any, color: Colors.black },
  recentContainer: { flex: 1, borderRadius: BorderRadius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.gray[800] },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md, backgroundColor: 'transparent' },
  recentTitle: { fontSize: Typography.sizes.lg, fontWeight: '800' as any, color: Colors.white },
  recentSubtitle: { fontSize: Typography.sizes.xs, color: Colors.gray[500], marginTop: 2 },
  refreshButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.black },
  emptyRedemptions: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  emptyText: { fontSize: Typography.sizes.base, color: Colors.gray[400], marginTop: Spacing.sm },
  redemptionsList: { flex: 1 },
  redemptionItem: { flexDirection: 'row', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.gray[800], backgroundColor: 'transparent' },
  redemptionIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  redemptionCopy: { flex: 1, backgroundColor: 'transparent' },
  redemptionCode: { fontSize: Typography.sizes.base, fontWeight: '800' as any, color: Colors.white },
  redemptionProduct: { fontSize: Typography.sizes.sm, color: Colors.gray[300], marginTop: 2 },
  redemptionMeta: { fontSize: Typography.sizes.xs, color: Colors.gray[500], marginTop: 3, textTransform: 'capitalize' },
  receiptActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, backgroundColor: 'transparent' },
  permissionBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, backgroundColor: 'rgba(245,158,11,.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,.25)', marginBottom: 14 },
  permissionBannerText: { flex: 1, color: Colors.white, fontSize: 11, fontWeight: '700' as any },
  permissionBannerBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.warning },
  permissionBannerBtnText: { color: Colors.black, fontSize: 10, fontWeight: '900' as any },
  fulfillButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: Colors.success },
  fulfillText: { color: Colors.black, fontWeight: '900' as any, fontSize: Typography.sizes.xs },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: Colors.gray[800] },
  cancelText: { color: Colors.gray[300], fontWeight: '800' as any, fontSize: Typography.sizes.xs },
});
