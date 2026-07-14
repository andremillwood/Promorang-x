import { StyleSheet, ScrollView, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useUserBalance } from '@/hooks/useEconomy';
import { API_BASE, commerceApi } from '@/lib/api';

interface Product {
    id: string;
    name: string;
    description: string;
    price_usd: number;
    price_points: number;
    image_url: string;
    category: string;
    inventory_count: number | null;
    merchant_id: string;
    terms_conditions: string | null;
    discount_type: string | null;
    discount_value: number | null;
    venues?: {
        name: string;
        address: string;
    };
}

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user } = useAuth();
    const { balance, refetch: refetchBalance } = useUserBalance();
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [openingCheckout, setOpeningCheckout] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('merchant_products')
                .select(`
          *,
          venues (
            name,
            address
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
            Alert.alert('Error', 'Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (method: 'gems' | 'reservation') => {
        if (!user || !product) return;

        const availableGems = balance?.gems || 0;

        if (method === 'gems' && availableGems < product.price_points) {
            Alert.alert('Insufficient Gems', `You need ${product.price_points} Gems but only have ${availableGems}.`);
            return;
        }

        // Check inventory
        if (product.inventory_count !== null && product.inventory_count === 0) {
            Alert.alert('Out of Stock', 'This product is currently out of stock.');
            return;
        }

        setPurchasing(true);
        try {
            const isReservation = method === 'reservation';
            const response = await fetch(`${API_BASE}${isReservation ? '/api/merchant/sales' : '/api/marketplace/purchase'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
                },
                body: JSON.stringify({
                    product_id: product.id,
                    ...(isReservation
                        ? { sale_type: 'reservation', amount_paid: 0, points_paid: 0, metadata: { source: 'mobile_product' } }
                        : { method: 'points', quantity: 1 }),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Purchase failed');
            }

            const result = await response.json();

            // Refetch balance
            await refetchBalance();

            // Navigate to redemption code screen
            router.push({
                pathname: '/redemption/[code]',
                params: { code: result.redemption_code, productName: product.name }
            });

            Alert.alert(
                isReservation ? 'Reservation Ready!' : 'Purchase Successful!',
                `Your redemption code is: ${result.redemption_code}`,
                [{ text: 'OK' }]
            );
        } catch (error: any) {
            console.error('Purchase error:', error);
            Alert.alert('Purchase Failed', error.message || 'Something went wrong');
        } finally {
            setPurchasing(false);
        }
    };

    const openHostedCheckout = async () => {
        if (!product) return;
        const checkoutUrl = commerceApi.getCheckoutUrl(product.id);
        await WebBrowser.openBrowserAsync(checkoutUrl, {
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
            controlsColor: DesignColors.primary,
        });
    };

    const findCompletedReceipt = async (paymentIntentId: string) => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            try {
                const result = await commerceApi.getReceiptByPaymentIntent(paymentIntentId);
                if (result.receipt?.id) return result.receipt.id;
            } catch {
                // Stripe webhooks can take a moment to create the receipt.
            }
            await new Promise(resolve => setTimeout(resolve, 900));
        }
        return null;
    };

    const handleCardCheckout = async () => {
        if (!product) return;

        if (product.inventory_count !== null && product.inventory_count === 0) {
            Alert.alert('Out of Stock', 'This product is currently out of stock.');
            return;
        }

        setOpeningCheckout(true);
        try {
            const intent = await commerceApi.createStripeIntent(product.id, 1);
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'Promorang',
                paymentIntentClientSecret: intent.clientSecret,
                returnURL: 'promorang://stripe-redirect',
                allowsDelayedPaymentMethods: false,
                appearance: {
                    colors: {
                        primary: DesignColors.primary,
                        background: isDark ? DesignColors.gray[900] : DesignColors.white,
                        componentBackground: isDark ? DesignColors.gray[800] : DesignColors.gray[50],
                        primaryText: isDark ? DesignColors.white : DesignColors.black,
                        secondaryText: DesignColors.gray[400],
                        componentBorder: DesignColors.gray[600],
                    },
                    shapes: { borderRadius: BorderRadius.lg },
                },
            });

            if (initError) throw new Error(initError.message);

            const { error: paymentError } = await presentPaymentSheet();
            if (paymentError) {
                if (paymentError.code === 'Canceled') return;
                throw new Error(paymentError.message);
            }

            const receiptId = await findCompletedReceipt(intent.paymentIntentId);
            Alert.alert(
                'Payment complete',
                receiptId
                    ? 'Your purchase is confirmed and its receipt is ready.'
                    : 'Your purchase is confirmed. Its receipt will appear in Vault shortly.',
                [
                    { text: 'Keep browsing', style: 'cancel' },
                    {
                        text: receiptId ? 'View receipt' : 'Open Vault',
                        onPress: () => receiptId
                            ? router.push(`/receipts/${receiptId}` as any)
                            : router.push('/(tabs)/vault' as any),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Card checkout error:', error);
            Alert.alert(
                'In-app checkout unavailable',
                error.message || 'Card checkout could not start in the app.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Continue on web',
                        onPress: () => openHostedCheckout().catch(() => {
                            Alert.alert('Checkout unavailable', 'Could not open the secure web checkout.');
                        }),
                    },
                ]
            );
        } finally {
            setOpeningCheckout(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={DesignColors.primary} />
                </View>
            </View>
        );
    }

    if (!product) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={DesignColors.gray[400]} />
                    <Text style={styles.emptyText}>Product not found</Text>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    const isOutOfStock = product.inventory_count !== null && product.inventory_count === 0;
    const availableGems = balance?.gems || 0;
    const canAffordGems = availableGems >= product.price_points;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                {product.image_url ? (
                    <Image source={{ uri: product.image_url }} style={styles.productImage} />
                ) : (
                    <View style={[styles.productImagePlaceholder, { backgroundColor: DesignColors.gray[800] }]}>
                        <Ionicons name="image-outline" size={64} color={DesignColors.gray[400]} />
                    </View>
                )}

                {/* Product Info */}
                <View style={[styles.contentContainer, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                    {/* Category Badge */}
                    {product.category && (
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{product.category}</Text>
                        </View>
                    )}

                    {/* Product Name */}
                    <Text style={styles.productName}>{product.name}</Text>

                    <Pressable onPress={() => router.push(`/merchant/${product.merchant_id}` as any)} style={styles.venueRow}>
                        <Ionicons name="storefront" size={16} color={DesignColors.primary} />
                        <Text style={styles.venueName}>Visit merchant storefront</Text>
                        <Ionicons name="chevron-forward" size={15} color={DesignColors.gray[400]} />
                    </Pressable>

                    {/* Venue Info */}
                    {product.venues && (
                        <View style={styles.venueRow}>
                            <Ionicons name="location" size={16} color={DesignColors.gray[400]} />
                            <Text style={styles.venueName}>{product.venues.name}</Text>
                        </View>
                    )}

                    {/* Stock Status */}
                    {product.inventory_count !== null && (
                        <View style={[styles.stockBadge, isOutOfStock && styles.stockBadgeOutOfStock]}>
                            <Ionicons
                                name={isOutOfStock ? "close-circle" : "checkmark-circle"}
                                size={16}
                                color={isOutOfStock ? DesignColors.red[500] : DesignColors.green[500]}
                            />
                            <Text style={[styles.stockText, isOutOfStock && styles.stockTextOutOfStock]}>
                                {isOutOfStock ? 'Out of Stock' : `${product.inventory_count} in stock`}
                            </Text>
                        </View>
                    )}

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{product.description || 'No description available.'}</Text>
                    </View>

                    {/* Terms & Conditions */}
                    {product.terms_conditions && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
                            <Text style={styles.termsText}>{product.terms_conditions}</Text>
                        </View>
                    )}

                    {/* Discount Info */}
                    {product.discount_type && product.discount_value && (
                        <View style={[styles.discountBanner, { backgroundColor: DesignColors.primary }]}>
                            <Ionicons name="pricetag" size={20} color={DesignColors.white} />
                            <Text style={styles.discountText}>
                                {product.discount_type === 'percentage' && `${product.discount_value}% OFF`}
                                {product.discount_type === 'fixed_amount' && `${product.discount_value} Gems OFF`}
                                {product.discount_type === 'bogo' && 'Buy One Get One'}
                                {product.discount_type === 'free_item' && 'Free Item Included'}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Purchase Footer */}
            <View style={[styles.footer, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <View style={styles.pricingContainer}>
                    {product.price_points > 0 && (
                        <Pressable
                            style={[
                                styles.purchaseButton,
                                styles.gemsButton,
                                (!canAffordGems || isOutOfStock) && styles.purchaseButtonDisabled
                            ]}
                            onPress={() => handlePurchase('gems')}
                            disabled={!canAffordGems || isOutOfStock || purchasing}
                        >
                            {purchasing ? (
                                <ActivityIndicator color={DesignColors.white} />
                            ) : (
                                <>
                                    <Ionicons name="diamond" size={20} color={DesignColors.white} />
                                    <Text style={styles.purchaseButtonText}>{product.price_points} Gems</Text>
                                </>
                            )}
                        </Pressable>
                    )}

                    {product.price_usd > 0 && (
                        <Pressable
                            style={[
                                styles.purchaseButton,
                                styles.cardButton,
                                isOutOfStock && styles.purchaseButtonDisabled
                            ]}
                            onPress={handleCardCheckout}
                            disabled={isOutOfStock || openingCheckout}
                        >
                            {openingCheckout ? (
                                <ActivityIndicator color={DesignColors.black} />
                            ) : (
                                <>
                                    <Ionicons name="card" size={20} color={DesignColors.black} />
                                    <Text style={[styles.purchaseButtonText, styles.cardButtonText]}>
                                        Pay ${Number(product.price_usd).toFixed(2)}
                                    </Text>
                                </>
                            )}
                        </Pressable>
                    )}

                    {product.price_usd > 0 && (
                        <View style={styles.secureCheckoutNote}>
                            <Ionicons name="lock-closed" size={13} color={DesignColors.gray[400]} />
                            <Text style={styles.secureCheckoutText}>Secure in-app checkout · receipt saved to Vault</Text>
                        </View>
                    )}

                    {product.price_usd > 0 && product.price_points <= 0 && (
                        <Pressable
                            style={[
                                styles.purchaseButton,
                                styles.reservationButton,
                                isOutOfStock && styles.purchaseButtonDisabled
                            ]}
                            onPress={() => handlePurchase('reservation')}
                            disabled={isOutOfStock || purchasing}
                        >
                            {purchasing ? (
                                <ActivityIndicator color={DesignColors.white} />
                            ) : (
                                <>
                                    <Ionicons name="bookmark" size={20} color={DesignColors.white} />
                                    <Text style={styles.purchaseButtonText}>Reserve · {Math.round(product.price_usd).toLocaleString()} Gems</Text>
                                </>
                            )}
                        </Pressable>
                    )}
                </View>

                {!canAffordGems && product.price_points > 0 && (
                    <Text style={styles.insufficientText}>
                        Need {product.price_points - availableGems} more Gems
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: 'transparent',
    },
    emptyText: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: DesignColors.gray[400],
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    backButton: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: DesignColors.primary,
        borderRadius: BorderRadius.lg,
    },
    backButtonText: {
        color: DesignColors.white,
        fontWeight: Typography.weights.semibold,
    },
    productImage: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    productImagePlaceholder: {
        width: '100%',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: Spacing.lg,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        marginTop: -20,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        backgroundColor: DesignColors.primary,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.md,
    },
    categoryText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
        color: DesignColors.white,
        textTransform: 'uppercase',
    },
    productName: {
        fontSize: Typography.sizes['2xl'],
        fontWeight: Typography.weights.bold,
        color: DesignColors.white,
        marginBottom: Spacing.sm,
    },
    venueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: Spacing.md,
        backgroundColor: 'transparent',
    },
    venueName: {
        fontSize: Typography.sizes.base,
        color: DesignColors.gray[400],
    },
    stockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: DesignColors.green[500] + '20',
        borderRadius: BorderRadius.lg,
        alignSelf: 'flex-start',
        marginBottom: Spacing.lg,
    },
    stockBadgeOutOfStock: {
        backgroundColor: DesignColors.red[500] + '20',
    },
    stockText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: DesignColors.green[500],
    },
    stockTextOutOfStock: {
        color: DesignColors.red[500],
    },
    section: {
        marginBottom: Spacing.lg,
        backgroundColor: 'transparent',
    },
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: DesignColors.white,
        marginBottom: Spacing.sm,
    },
    description: {
        fontSize: Typography.sizes.base,
        color: DesignColors.gray[300],
        lineHeight: 24,
    },
    termsText: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.gray[400],
        lineHeight: 20,
    },
    discountBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.lg,
    },
    discountText: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
        color: DesignColors.white,
    },
    footer: {
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: DesignColors.gray[800],
    },
    pricingContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        backgroundColor: 'transparent',
    },
    secureCheckoutNote: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        backgroundColor: 'transparent',
        marginTop: -2,
    },
    secureCheckoutText: {
        color: DesignColors.gray[400],
        fontSize: Typography.sizes.xs,
    },
    purchaseButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    gemsButton: {
        backgroundColor: DesignColors.primary,
    },
    reservationButton: {
        backgroundColor: DesignColors.green[600],
    },
    cardButton: {
        backgroundColor: DesignColors.white,
        borderWidth: 1,
        borderColor: DesignColors.primary,
    },
    purchaseButtonDisabled: {
        opacity: 0.5,
    },
    purchaseButtonText: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.bold,
        color: DesignColors.white,
    },
    cardButtonText: {
        color: DesignColors.black,
    },
    insufficientText: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.red[500],
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
});
