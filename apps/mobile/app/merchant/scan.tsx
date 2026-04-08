import { StyleSheet, Pressable, TextInput, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Redemption {
    id: string;
    redemption_code: string;
    validated_at: string;
    product_sales: {
        product_id: string;
        merchant_products: {
            name: string;
        };
    };
}

export default function MerchantScannerScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user } = useAuth();

    const [permission, requestPermission] = useCameraPermissions();
    const [scanning, setScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [recentRedemptions, setRecentRedemptions] = useState<Redemption[]>([]);

    useEffect(() => {
        fetchRecentRedemptions();
    }, []);

    const fetchRecentRedemptions = async () => {
        try {
            const { data, error } = await supabase
                .from('product_sales')
                .select(`
          id,
          redemption_code,
          validated_at,
          product_sales:product_id (
            merchant_products (
              name
            )
          )
        `)
                .eq('merchant_id', user?.id)
                .eq('status', 'validated')
                .order('validated_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            setRecentRedemptions(data || []);
        } catch (error) {
            console.error('Error fetching redemptions:', error);
        }
    };

    const validateCode = async (code: string) => {
        if (!code || code.length < 6) {
            Alert.alert('Invalid Code', 'Please enter a valid redemption code');
            return;
        }

        setValidating(true);
        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

            const response = await fetch(`${API_URL}/api/merchant/sales/${code.toUpperCase()}/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.id}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Validation failed');
            }

            const result = await response.json();

            Alert.alert(
                '✅ Redemption Validated',
                `Product: ${result.product_name}\nCustomer: ${result.user_id}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setManualCode('');
                            setScanning(false);
                            fetchRecentRedemptions();
                        }
                    }
                ]
            );
        } catch (error: any) {
            console.error('Validation error:', error);
            Alert.alert('Validation Failed', error.message || 'Could not validate redemption code');
        } finally {
            setValidating(false);
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanning(false);
        validateCode(data);
    };

    const handleManualValidation = () => {
        validateCode(manualCode);
    };

    if (!permission) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
                <ActivityIndicator size="large" color={DesignColors.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
                <View style={styles.permissionContainer}>
                    <Ionicons name="camera-outline" size={64} color={DesignColors.gray[400]} />
                    <Text style={styles.permissionTitle}>Camera Permission Required</Text>
                    <Text style={styles.permissionText}>
                        We need camera access to scan QR codes for redemption validation.
                    </Text>
                    <Pressable style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            {/* Scanner Toggle */}
            <View style={styles.toggleContainer}>
                <Pressable
                    style={[styles.toggleButton, !scanning && styles.toggleButtonActive]}
                    onPress={() => setScanning(false)}
                >
                    <Ionicons name="keypad" size={20} color={!scanning ? DesignColors.white : DesignColors.gray[400]} />
                    <Text style={[styles.toggleText, !scanning && styles.toggleTextActive]}>Manual Entry</Text>
                </Pressable>
                <Pressable
                    style={[styles.toggleButton, scanning && styles.toggleButtonActive]}
                    onPress={() => setScanning(true)}
                >
                    <Ionicons name="qr-code" size={20} color={scanning ? DesignColors.white : DesignColors.gray[400]} />
                    <Text style={[styles.toggleText, scanning && styles.toggleTextActive]}>QR Scanner</Text>
                </Pressable>
            </View>

            {/* Scanner/Manual Input */}
            {scanning ? (
                <View style={styles.scannerContainer}>
                    <CameraView
                        style={styles.camera}
                        facing="back"
                        onBarcodeScanned={handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr'],
                        }}
                    />
                    <View style={styles.scannerOverlay}>
                        <View style={styles.scannerFrame} />
                        <Text style={styles.scannerText}>Position QR code within frame</Text>
                    </View>
                </View>
            ) : (
                <View style={[styles.manualContainer, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                    <Text style={styles.manualTitle}>Enter Redemption Code</Text>
                    <TextInput
                        style={[styles.codeInput, { color: isDark ? DesignColors.white : DesignColors.black }]}
                        placeholder="ABC12345"
                        placeholderTextColor={DesignColors.gray[400]}
                        value={manualCode}
                        onChangeText={(text) => setManualCode(text.toUpperCase())}
                        autoCapitalize="characters"
                        maxLength={8}
                    />
                    <Pressable
                        style={[styles.validateButton, (!manualCode || validating) && styles.validateButtonDisabled]}
                        onPress={handleManualValidation}
                        disabled={!manualCode || validating}
                    >
                        {validating ? (
                            <ActivityIndicator color={DesignColors.white} />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color={DesignColors.white} />
                                <Text style={styles.validateButtonText}>Validate Code</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            )}

            {/* Recent Redemptions */}
            <View style={[styles.recentContainer, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Text style={styles.recentTitle}>Recent Redemptions</Text>
                {recentRedemptions.length === 0 ? (
                    <View style={styles.emptyRedemptions}>
                        <Ionicons name="receipt-outline" size={32} color={DesignColors.gray[400]} />
                        <Text style={styles.emptyText}>No redemptions yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={recentRedemptions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.redemptionItem}>
                                <View style={styles.redemptionIcon}>
                                    <Ionicons name="checkmark" size={16} color={DesignColors.green[500]} />
                                </View>
                                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                                    <Text style={styles.redemptionCode}>{item.redemption_code}</Text>
                                    <Text style={styles.redemptionProduct}>
                                        {item.product_sales?.merchant_products?.name || 'Unknown Product'}
                                    </Text>
                                </View>
                                <Text style={styles.redemptionTime}>
                                    {new Date(item.validated_at).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                        style={styles.redemptionsList}
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.lg,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: 'transparent',
    },
    permissionTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: '700' as any,
        color: DesignColors.white,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    permissionText: {
        fontSize: Typography.sizes.base,
        color: DesignColors.gray[400],
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    permissionButton: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        backgroundColor: DesignColors.primary,
        borderRadius: BorderRadius.lg,
    },
    permissionButtonText: {
        fontSize: Typography.sizes.base,
        fontWeight: '600' as any,
        color: DesignColors.white,
    },
    toggleContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
        backgroundColor: 'transparent',
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        backgroundColor: DesignColors.gray[800],
        borderRadius: BorderRadius.lg,
    },
    toggleButtonActive: {
        backgroundColor: DesignColors.primary,
    },
    toggleText: {
        fontSize: Typography.sizes.sm,
        fontWeight: '600' as any,
        color: DesignColors.gray[400],
    },
    toggleTextActive: {
        color: DesignColors.white,
    },
    scannerContainer: {
        height: 400,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
    },
    camera: {
        flex: 1,
    },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scannerFrame: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: DesignColors.primary,
        borderRadius: BorderRadius.lg,
        backgroundColor: 'transparent',
    },
    scannerText: {
        fontSize: Typography.sizes.base,
        color: DesignColors.white,
        marginTop: Spacing.xl,
        textAlign: 'center',
    },
    manualContainer: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: DesignColors.gray[800],
    },
    manualTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: '700' as any,
        color: DesignColors.white,
        marginBottom: Spacing.md,
    },
    codeInput: {
        fontSize: Typography.sizes['2xl'],
        fontWeight: '700' as any,
        textAlign: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.md,
        backgroundColor: DesignColors.gray[800],
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        letterSpacing: 4,
    },
    validateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        backgroundColor: DesignColors.green[600],
        borderRadius: BorderRadius.lg,
    },
    validateButtonDisabled: {
        opacity: 0.5,
    },
    validateButtonText: {
        fontSize: Typography.sizes.base,
        fontWeight: '700' as any,
        color: DesignColors.white,
    },
    recentContainer: {
        flex: 1,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: DesignColors.gray[800],
    },
    recentTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: '700' as any,
        color: DesignColors.white,
        marginBottom: Spacing.md,
    },
    emptyRedemptions: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    emptyText: {
        fontSize: Typography.sizes.base,
        color: DesignColors.gray[400],
        marginTop: Spacing.sm,
    },
    redemptionsList: {
        flex: 1,
    },
    redemptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: DesignColors.gray[800],
        backgroundColor: 'transparent',
    },
    redemptionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: DesignColors.green[500] + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    redemptionCode: {
        fontSize: Typography.sizes.base,
        fontWeight: '600' as any,
        color: DesignColors.white,
    },
    redemptionProduct: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.gray[400],
    },
    redemptionTime: {
        fontSize: Typography.sizes.xs,
        color: DesignColors.gray[500],
    },
});
