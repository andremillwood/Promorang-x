import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { Text, View } from '@/components/Themed';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { couponApi, merchantApi } from '@/lib/api';

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

export default function MerchantScannerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(true);

  const pendingReceipts = useMemo(() => receipts.filter((receipt) => ['issued', 'pending'].includes(receipt.status)), [receipts]);

  const fetchReceipts = useCallback(async () => {
    setLoadingReceipts(true);
    try {
      const response = await merchantApi.getReceipts();
      setReceipts((response.receipts || []) as ReceiptRow[]);
    } catch (error) {
      console.error('Error fetching merchant receipts:', error);
    } finally {
      setLoadingReceipts(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const validateCode = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      Alert.alert('Invalid Code', 'Please enter a valid redemption code.');
      return;
    }

    setValidating(true);
    try {
      try {
        const sale = await merchantApi.validateSaleCode(code);
        Alert.alert(
          'Redemption validated',
          `${sale?.merchant_products?.name || sale?.product_name || 'Product sale'} is now marked fulfilled.`,
        );
      } catch (saleError) {
        const couponResult = await couponApi.validateMerchantCode(code);
        Alert.alert(
          'Offer redeemed',
          `Coupon code ${couponResult.data?.redemption?.claim_code || code} is now marked redeemed.`,
        );
      }

      setManualCode('');
      setScanning(false);
      fetchReceipts();
    } catch (error: any) {
      console.error('Validation error:', error);
      Alert.alert('Validation Failed', error.message || 'Could not validate this code.');
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

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: isDark ? Colors.black : Colors.gray[50] }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.black : Colors.gray[50] }]}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color={Colors.gray[400]} />
          <Text style={styles.permissionTitle}>Camera access helps the counter move faster</Text>
          <Text style={styles.permissionText}>Scan customer receipt, product sale, and offer codes. Manual entry still works when needed.</Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.black : Colors.gray[50] }]}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>MERCHANT COUNTER</Text>
        <Text style={styles.title}>Validate what people brought in.</Text>
        <Text style={styles.subtitle}>Product sales, reservations, and offer claims all end here: scan, validate, fulfill, or cancel.</Text>
        <View style={styles.heroStats}>
          <View style={styles.stat}><Text style={styles.statValue}>{pendingReceipts.length}</Text><Text style={styles.statLabel}>Needs action</Text></View>
          <View style={styles.stat}><Text style={styles.statValue}>{receipts.filter((receipt) => receipt.status === 'fulfilled').length}</Text><Text style={styles.statLabel}>Fulfilled</Text></View>
        </View>
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
  eyebrow: { color: Colors.primary, fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1 },
  title: { color: Colors.white, fontSize: Typography.sizes['2xl'], fontWeight: '900' as any, letterSpacing: -0.7, marginTop: 6 },
  subtitle: { color: Colors.gray[400], fontSize: Typography.sizes.sm, lineHeight: 20, marginTop: 8 },
  heroStats: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md, backgroundColor: 'transparent' },
  stat: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.lg, backgroundColor: Colors.black },
  statValue: { color: Colors.white, fontSize: Typography.sizes.xl, fontWeight: '900' as any },
  statLabel: { color: Colors.gray[500], fontSize: Typography.sizes.xs, marginTop: 2 },
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
  fulfillButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: Colors.success },
  fulfillText: { color: Colors.black, fontWeight: '900' as any, fontSize: Typography.sizes.xs },
  cancelButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: Colors.gray[800] },
  cancelText: { color: Colors.gray[300], fontWeight: '800' as any, fontSize: Typography.sizes.xs },
});
