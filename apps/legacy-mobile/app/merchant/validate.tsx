/**
 * MerchantValidate Screen (React Native)
 * 
 * P1 High: Manual coupon validation page for merchants without smartphones/QR.
 * Staff can enter a 6-8 digit code to validate redemption.
 * 
 * Ported from web: apps/web/src/react-app/pages/MerchantValidate.tsx
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { CheckCircle, XCircle, Gift, KeyRound, ArrowLeft } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';

interface ValidationResult {
    success: boolean;
    coupon?: {
        id: string;
        code: string;
        discount_type: string;
        discount_value: number;
        description?: string;
    };
    customer?: {
        name?: string;
    };
    error?: string;
}

export default function MerchantValidateScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [code, setCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [result, setResult] = useState<ValidationResult | null>(null);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

    const handleCodeChange = (value: string) => {
        // Only allow alphanumeric, uppercase, max 8 chars
        const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
        setCode(sanitized);
        setResult(null);
    };

    const handleValidate = async () => {
        if (code.length < 4) {
            setResult({ success: false, error: 'Code must be at least 4 characters' });
            return;
        }

        setIsValidating(true);
        setResult(null);

        try {
            const response = await fetch(`${API_URL}/api/coupons/validate/${code}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success && data.coupon) {
                setResult({
                    success: true,
                    coupon: data.coupon,
                    customer: data.customer,
                });
            } else {
                setResult({
                    success: false,
                    error: data.error || data.message || 'Invalid or expired code',
                });
            }
        } catch (err) {
            console.error('Validation error:', err);
            setResult({ success: false, error: 'Network error. Please try again.' });
        } finally {
            setIsValidating(false);
        }
    };

    const handleConfirmRedemption = async () => {
        if (!result?.coupon?.id) return;

        setIsConfirming(true);

        try {
            const response = await fetch(`${API_URL}/api/coupons/${result.coupon.id}/redeem`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ validation_code: code }),
            });

            const data = await response.json();

            if (data.success) {
                // Show success, then reset after 3s
                setTimeout(() => {
                    setCode('');
                    setResult(null);
                }, 3000);
            } else {
                setResult({
                    success: false,
                    error: data.error || data.message || 'Failed to confirm redemption',
                });
            }
        } catch (err) {
            console.error('Redemption error:', err);
            setResult({ success: false, error: 'Network error. Please try again.' });
        } finally {
            setIsConfirming(false);
        }
    };

    const formatDiscount = (coupon: ValidationResult['coupon']) => {
        if (!coupon) return '';
        if (coupon.discount_type === 'percentage') {
            return `${coupon.discount_value}% OFF`;
        }
        return `$${coupon.discount_value} OFF`;
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Validate Coupon',
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                            <ArrowLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Validate Coupon</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Enter the customer's code
                        </Text>
                    </View>

                    {/* Code Entry Card */}
                    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
                                <KeyRound size={20} color="#10B981" />
                            </View>
                            <View>
                                <Text style={[styles.cardTitle, { color: theme.text }]}>Redemption Code</Text>
                                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
                                    Ask customer for their code
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={[styles.codeInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                            value={code}
                            onChangeText={handleCodeChange}
                            placeholder="ABCD1234"
                            placeholderTextColor={theme.textSecondary}
                            maxLength={8}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            textAlign="center"
                            editable={!isValidating && !isConfirming}
                        />

                        <TouchableOpacity
                            style={[styles.checkButton, (code.length < 4 || isValidating) && styles.buttonDisabled]}
                            onPress={handleValidate}
                            disabled={code.length < 4 || isValidating}
                        >
                            {isValidating ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <>
                                    <Gift size={20} color="#FFF" />
                                    <Text style={styles.checkButtonText}>Check Code</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Result Display */}
                    {result && (
                        <View
                            style={[
                                styles.resultCard,
                                result.success ? styles.resultSuccess : styles.resultError,
                            ]}
                        >
                            {result.success && result.coupon ? (
                                <View style={styles.resultContent}>
                                    <CheckCircle size={56} color="#10B981" />
                                    <Text style={styles.resultTitle}>Valid Coupon!</Text>

                                    <View style={styles.couponDetails}>
                                        <Text style={styles.discountValue}>{formatDiscount(result.coupon)}</Text>
                                        {result.coupon.description && (
                                            <Text style={styles.discountDesc}>{result.coupon.description}</Text>
                                        )}
                                        {result.customer?.name && (
                                            <Text style={styles.customerName}>Customer: {result.customer.name}</Text>
                                        )}
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.confirmButton, isConfirming && styles.buttonDisabled]}
                                        onPress={handleConfirmRedemption}
                                        disabled={isConfirming}
                                    >
                                        {isConfirming ? (
                                            <ActivityIndicator color="#FFF" size="small" />
                                        ) : (
                                            <>
                                                <CheckCircle size={20} color="#FFF" />
                                                <Text style={styles.confirmButtonText}>Confirm Redemption</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.resultContent}>
                                    <XCircle size={56} color="#EF4444" />
                                    <Text style={[styles.resultTitle, { color: '#EF4444' }]}>Invalid Code</Text>
                                    <Text style={styles.errorMessage}>{result.error}</Text>
                                    <TouchableOpacity
                                        style={styles.tryAgainButton}
                                        onPress={() => {
                                            setCode('');
                                            setResult(null);
                                        }}
                                    >
                                        <Text style={styles.tryAgainText}>Try another code</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Help text */}
                    <Text style={[styles.helpText, { color: theme.textSecondary }]}>
                        Can't find the code? Ask the customer to show their coupon in the Promorang app.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    cardSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    codeInput: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: 6,
        borderWidth: 1,
        borderRadius: 14,
        padding: 20,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    checkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10B981',
        borderRadius: 14,
        padding: 18,
    },
    checkButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    resultCard: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
    },
    resultSuccess: {
        backgroundColor: '#10B98115',
        borderWidth: 1,
        borderColor: '#10B98130',
    },
    resultError: {
        backgroundColor: '#EF444415',
        borderWidth: 1,
        borderColor: '#EF444430',
    },
    resultContent: {
        alignItems: 'center',
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#10B981',
        marginTop: 16,
        marginBottom: 16,
    },
    couponDetails: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 16,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    discountValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#10B981',
    },
    discountDesc: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
        textAlign: 'center',
    },
    customerName: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#10B981',
        borderRadius: 14,
        padding: 18,
        width: '100%',
    },
    confirmButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    errorMessage: {
        fontSize: 14,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    tryAgainButton: {
        padding: 12,
    },
    tryAgainText: {
        fontSize: 14,
        color: '#6B7280',
    },
    helpText: {
        fontSize: 12,
        textAlign: 'center',
    },
});
