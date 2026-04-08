import { StyleSheet, ScrollView, Pressable, TextInput, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { useUserBalance } from '@/hooks/useEconomy';

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
    venues?: {
        name: string;
        address: string;
    };
}

export default function ShopScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { balance } = useUserBalance();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Food & Drink', 'Apparel', 'Experiences', 'Services'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
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
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleProductPress = (productId: string) => {
        router.push(`/product/${productId}`);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <View style={{ backgroundColor: 'transparent' }}>
                    <Text style={styles.headerTitle}>Marketplace</Text>
                    <Text style={styles.headerSubtitle}>Support local venues</Text>
                </View>
                <View style={styles.balanceCard}>
                    <Ionicons name="wallet" size={16} color={DesignColors.primary} />
                    <Text style={styles.balanceText}>{balance?.points || 0} pts</Text>
                </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}>
                <Ionicons name="search" size={20} color={DesignColors.gray[400]} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: isDark ? DesignColors.white : DesignColors.black }]}
                    placeholder="Search products or venues..."
                    placeholderTextColor={DesignColors.gray[400]}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Category Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContainer}
            >
                {categories.map((category) => (
                    <Pressable
                        key={category}
                        style={[
                            styles.categoryChip,
                            {
                                backgroundColor: selectedCategory === category
                                    ? DesignColors.primary
                                    : isDark ? DesignColors.gray[800] : DesignColors.gray[100]
                            }
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                {
                                    color: selectedCategory === category
                                        ? DesignColors.white
                                        : isDark ? DesignColors.gray[300] : DesignColors.gray[700]
                                }
                            ]}
                        >
                            {category}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Products Grid */}
            <ScrollView
                style={styles.productsScroll}
                contentContainerStyle={styles.productsContainer}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={DesignColors.primary} />
                    </View>
                ) : filteredProducts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="storefront-outline" size={64} color={DesignColors.gray[400]} />
                        <Text style={styles.emptyText}>No products found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                    </View>
                ) : (
                    <View style={styles.productsGrid}>
                        {filteredProducts.map((product) => (
                            <Pressable
                                key={product.id}
                                style={[styles.productCard, { backgroundColor: isDark ? DesignColors.gray[900] : DesignColors.white }]}
                                onPress={() => handleProductPress(product.id)}
                            >
                                {/* Product Image */}
                                {product.image_url ? (
                                    <Image source={{ uri: product.image_url }} style={styles.productImage} />
                                ) : (
                                    <View style={[styles.productImagePlaceholder, { backgroundColor: DesignColors.gray[200] }]}>
                                        <Ionicons name="image-outline" size={32} color={DesignColors.gray[400]} />
                                    </View>
                                )}

                                {/* Stock Badge */}
                                {product.inventory_count !== null && product.inventory_count < 10 && (
                                    <View style={styles.stockBadge}>
                                        <Text style={styles.stockBadgeText}>
                                            {product.inventory_count === 0 ? 'Out of Stock' : `${product.inventory_count} left`}
                                        </Text>
                                    </View>
                                )}

                                {/* Product Info */}
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

                                    {product.venues && (
                                        <View style={styles.venueInfo}>
                                            <Ionicons name="location" size={12} color={DesignColors.gray[400]} />
                                            <Text style={styles.venueName} numberOfLines={1}>{product.venues.name}</Text>
                                        </View>
                                    )}

                                    {/* Pricing */}
                                    <View style={styles.pricingRow}>
                                        {product.price_points > 0 && (
                                            <View style={styles.priceTag}>
                                                <Ionicons name="diamond" size={12} color={DesignColors.primary} />
                                                <Text style={styles.pricePoints}>{product.price_points}</Text>
                                            </View>
                                        )}
                                        {product.price_usd > 0 && (
                                            <View style={styles.priceTag}>
                                                <Text style={styles.priceUsd}>${product.price_usd.toFixed(2)}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: DesignColors.gray[800],
    },
    headerTitle: {
        fontSize: Typography.sizes['2xl'],
        fontWeight: Typography.weights.bold,
        color: DesignColors.white,
    },
    headerSubtitle: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.gray[400],
        marginTop: 2,
    },
    balanceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: DesignColors.gray[800],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    balanceText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: DesignColors.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: DesignColors.gray[800],
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.sizes.base,
        padding: 0,
    },
    categoryScroll: {
        marginTop: Spacing.md,
    },
    categoryContainer: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        marginRight: Spacing.sm,
    },
    categoryText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    productsScroll: {
        flex: 1,
        marginTop: Spacing.md,
    },
    productsContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        justifyContent: 'space-between',
    },
    productCard: {
        width: '48%',
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: DesignColors.gray[800],
    },
    productImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    productImagePlaceholder: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stockBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: DesignColors.red[500],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    stockBadgeText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
        color: DesignColors.white,
    },
    productInfo: {
        padding: Spacing.md,
        backgroundColor: 'transparent',
    },
    productName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: DesignColors.white,
        marginBottom: 4,
    },
    venueInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    venueName: {
        fontSize: Typography.sizes.xs,
        color: DesignColors.gray[400],
        flex: 1,
    },
    pricingRow: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: 'transparent',
    },
    priceTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'transparent',
    },
    pricePoints: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
        color: DesignColors.primary,
    },
    priceUsd: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
        color: DesignColors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl * 2,
        backgroundColor: 'transparent',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xl * 2,
        backgroundColor: 'transparent',
    },
    emptyText: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: DesignColors.gray[400],
        marginTop: Spacing.md,
    },
    emptySubtext: {
        fontSize: Typography.sizes.sm,
        color: DesignColors.gray[500],
        marginTop: 4,
    },
});
