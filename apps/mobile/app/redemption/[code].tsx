import { StyleSheet, Pressable, Share, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import QRCode from 'react-native-qrcode-svg';

export default function RedemptionCodeScreen() {
    const { code, productName } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [copied, setCopied] = useState(false);

    const handleCopyCode = async () => {
        try {
            await Share.share({
                message: `Redemption Code: ${code}`,
            });
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error sharing code:', error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color={DesignColors.white} />
                </Pressable>
            </View>

            {/* Success Icon */}
            <View style={styles.successContainer}>
                <View style={[styles.successCircle, { backgroundColor: DesignColors.green[500] }]}>
                    <Ionicons name="checkmark" size={48} color={DesignColors.white} />
                </View>
                <Text style={styles.successTitle}>Purchase Successful!</Text>
                <Text style={styles.successSubtitle}>Show this code to the merchant</Text>
            </View>

            {/* QR Code */}
            <View style={[styles.qrContainer, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <View style={styles.qrWrapper}>
                    <QRCode
                        value={String(code)}
                        size={220}
                        backgroundColor={DesignColors.white}
                        color={DesignColors.black}
                    />
                </View>

                {/* Redemption Code */}
                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>Redemption Code</Text>
                    <Text style={styles.codeText}>{code}</Text>
                </View>

                {/* Copy Button */}
                <Pressable
                    style={[styles.copyButton, copied && styles.copyButtonSuccess]}
                    onPress={handleCopyCode}
                >
                    <Ionicons
                        name={copied ? "checkmark-circle" : "copy-outline"}
                        size={20}
                        color={copied ? DesignColors.green[500] : DesignColors.primary}
                    />
                    <Text style={[styles.copyButtonText, copied && styles.copyButtonTextSuccess]}>
                        {copied ? 'Shared!' : 'Share Code'}
                    </Text>
                </Pressable>
            </View>

            {/* Product Info */}
            {productName && (
                <View style={[styles.productInfo, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                    <Ionicons name="gift" size={24} color={DesignColors.primary} />
                    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <Text style={styles.productLabel}>Product</Text>
                        <Text style={styles.productName}>{productName}</Text>
                    </View>
                </View>
            )}

            {/* Instructions */}
            <View style={[styles.instructionsCard, { backgroundColor: DesignColors.primary + '20' }]}>
                <Ionicons name="information-circle" size={24} color={DesignColors.primary} />
                <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <Text style={styles.instructionsTitle}>How to Redeem</Text>
                    <Text style={styles.instructionsText}>
                        1. Visit the merchant location{'\n'}
                        2. Show this QR code or redemption code{'\n'}
                        3. Merchant will scan or enter the code{'\n'}
                        4. Enjoy your product!
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <Pressable
                    style={[styles.actionButton, { backgroundColor: DesignColors.primary }]}
                    onPress={() => router.push('/(tabs)/shop')}
                >
                    <Ionicons name="storefront" size={20} color={DesignColors.white} />
                    <Text style={styles.actionButtonText}>Browse More Products</Text>
                </Pressable>

                <Pressable
                    style={[styles.actionButton, { backgroundColor: isDark ? DesignColors.gray[800] : DesignColors.gray[200] }]}
                    onPress={() => router.push('/(tabs)/rewards')}
                >
                    <Ionicons name="receipt" size={20} color={isDark ? DesignColors.white : DesignColors.black} />
                    <Text style={[styles.actionButtonText, { color: isDark ? DesignColors.white : DesignColors.black }]}>
                        View Purchase History
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: Spacing.lg,
        backgroundColor: 'transparent',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: DesignColors.gray[800],
        justifyContent: 'center',
        alignItems: 'center',
    },
    successContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        backgroundColor: 'transparent',
    },
    successCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    successTitle: {
        fontSize: Typography.sizes['2xl'],
        fontWeight: '700' as any,
        color: DesignColors.white,
        marginBottom: Spacing.xs,
    },
    successSubtitle: {
        fontSize: Typography.sizes.base,
        color: DesignColors.gray[400],
    },
    qrContainer: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: DesignColors.gray[800],
    },
    qrWrapper: {
        padding: Spacing.lg,
        backgroundColor: DesignColors.white,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
    },
    codeContainer: {
        alignItems: 'center',
        marginBottom: Spacing.md,
        backgroundColor: 'transparent',
    },
    codeLabel: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.gray[400],
        marginBottom: Spacing.xs,
    },
    codeText: {
        fontSize: Typography.sizes['2xl'],
        fontWeight: '700' as any,
        color: DesignColors.white,
        letterSpacing: 2,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: DesignColors.primary + '20',
        borderRadius: BorderRadius.lg,
    },
    copyButtonSuccess: {
        backgroundColor: DesignColors.green[500] + '20',
    },
    copyButtonText: {
        fontSize: Typography.sizes.base,
        fontWeight: '600' as any,
        color: DesignColors.primary,
    },
    copyButtonTextSuccess: {
        color: DesignColors.green[500],
    },
    productInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: DesignColors.gray[800],
    },
    productLabel: {
        fontSize: Typography.sizes.xs,
        color: DesignColors.gray[400],
        marginBottom: 2,
    },
    productName: {
        fontSize: Typography.sizes.base,
        fontWeight: '600' as any,
        color: DesignColors.white,
    },
    instructionsCard: {
        flexDirection: 'row',
        gap: Spacing.md,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
    },
    instructionsTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: '700' as any,
        color: DesignColors.primary,
        marginBottom: Spacing.xs,
    },
    instructionsText: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.gray[300],
        lineHeight: 20,
    },
    actions: {
        gap: Spacing.md,
        backgroundColor: 'transparent',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    actionButtonText: {
        fontSize: Typography.sizes.base,
        fontWeight: '600' as any,
        color: DesignColors.white,
    },
});
