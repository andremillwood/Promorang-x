import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, ShoppingCart, Star, Share2, Store, Package, CheckCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useProductStore } from '@/store/productStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { Product } from '@/types';
import { safeBack } from '@/lib/navigation';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useThemeColors();
    const { fetchProductById, addToCart } = useProductStore();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        setLoading(true);
        const data = await fetchProductById(id);
        setProduct(data);
        setLoading(false);
    };

    const handleAddToCart = async () => {
        if (!product) return;
        setAdding(true);
        const success = await addToCart(product.id, 1);
        setAdding(false);
        if (success) {
            Alert.alert(
                "Added to Cart",
                `${product.name} has been added to your cart.`,
                [
                    { text: "Continue Shopping", style: "cancel" },
                    { text: "View Cart", onPress: () => router.push('/cart' as any) }
                ]
            );
        } else {
            Alert.alert("Error", "Failed to add product to cart.");
        }
    };

    if (loading) return <LoadingIndicator fullScreen text="Loading product..." />;

    if (!product) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Product not found</Text>
                <TouchableOpacity onPress={() => safeBack(router)} style={styles.backLink}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderPrice = () => {
        const prices = [];
        if (product.price_usd) prices.push(`$${product.price_usd.toFixed(2)}`);
        if (product.price_gems) prices.push(`${product.price_gems} 💎`);
        if (product.price_gold) prices.push(`${product.price_gold} 🪙`);
        return prices.length > 0 ? prices.join(' or ') : 'Contact for Price';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    headerShown: false
                }}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => safeBack(router)} style={styles.headerBtn}>
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Share2 size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/cart' as any)} style={styles.headerBtn}>
                        <ShoppingCart size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.images[selectedImage] || 'https://via.placeholder.com/400' }}
                        style={styles.mainImage}
                        resizeMode="cover"
                    />
                    {product.images && product.images.length > 1 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailList}>
                            {product.images.map((img, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedImage(index)}
                                    style={[
                                        styles.thumbnailBtn,
                                        selectedImage === index && styles.activeThumbnail
                                    ]}
                                >
                                    <Image source={{ uri: img }} style={styles.thumbnail} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={[styles.category, { color: theme.textSecondary }]}>
                        {product.category_name || 'Marketplace Item'}
                    </Text>
                    <Text style={[styles.title, { color: theme.text }]}>{product.name}</Text>

                    <View style={styles.ratingPriceRow}>
                        <View style={styles.ratingContainer}>
                            <Star size={16} color="#FFB800" fill="#FFB800" />
                            <Text style={[styles.ratingText, { color: theme.text }]}>{product.rating?.toFixed(1) || '0.0'}</Text>
                            <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>({product.review_count || 0} reviews)</Text>
                        </View>
                        <Text style={[styles.priceTag, { color: colors.primary }]}>{renderPrice()}</Text>
                    </View>

                    <Card style={[styles.merchantCard, { backgroundColor: theme.surface }] as any}>
                        <View style={styles.merchantInfo}>
                            <Image
                                source={{ uri: product.merchant_stores?.logo_url || 'https://via.placeholder.com/40' }}
                                style={styles.merchantLogo}
                            />
                            <View style={styles.merchantText}>
                                <Text style={[styles.merchantName, { color: theme.text }]}>{product.merchant_stores?.store_name || "Merchant Store"}</Text>
                                <View style={styles.verifiedRow}>
                                    <CheckCircle size={14} color="#10B981" />
                                    <Text style={styles.verifiedText}>Verified Merchant</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.storeLink}
                            onPress={() => {
                                const slug = product.merchant_stores?.store_slug;
                                if (slug) {
                                    router.push({ pathname: '/store/[slug]', params: { slug } } as any);
                                }
                            }}
                        >
                            <Store size={18} color={colors.primary} />
                            <Text style={styles.storeLinkText}>Visit Store</Text>
                        </TouchableOpacity>
                    </Card>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        {product.description || product.short_description || "No description available for this product."}
                    </Text>

                    <View style={styles.features}>
                        <View style={styles.featureItem}>
                            <Package size={20} color={theme.textSecondary} />
                            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                                {product.is_digital ? 'Instant Digital Delivery' : 'Fast Shipping Available'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
                <Button
                    title="Add to Cart"
                    onPress={handleAddToCart}
                    variant="outline"
                    isLoading={adding}
                    style={styles.cartBtn}
                />
                <Button
                    title="Buy Now"
                    onPress={() => Alert.alert("Order", "Order flow coming soon!")}
                    variant="primary"
                    style={styles.buyBtn}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    backLink: {
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imageContainer: {
        width: '100%',
        backgroundColor: '#F3F4F6',
    },
    mainImage: {
        width: '100%',
        height: 400,
    },
    thumbnailList: {
        padding: 12,
    },
    thumbnailBtn: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeThumbnail: {
        borderColor: colors.primary,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
    },
    detailsContainer: {
        padding: 20,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
    },
    ratingPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 12,
        marginLeft: 4,
    },
    priceTag: {
        fontSize: 18,
        fontWeight: '800',
    },
    merchantCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    merchantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    merchantLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    merchantText: {
        marginLeft: 12,
    },
    merchantName: {
        fontSize: 15,
        fontWeight: '700',
    },
    verifiedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    verifiedText: {
        fontSize: 11,
        color: '#10B981',
        marginLeft: 4,
        fontWeight: '600',
    },
    storeLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    storeLinkText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 20,
    },
    features: {
        marginTop: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '500',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 32,
        gap: 12,
        borderTopWidth: 1,
    },
    cartBtn: {
        flex: 1,
    },
    buyBtn: {
        flex: 1,
    }
});
