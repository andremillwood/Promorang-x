import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { ShoppingBag, Package, DollarSign, Star, Plus, ArrowRight, Store, QrCode } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';

const API_URL = 'https://promorang-api.vercel.app';

export default function MerchantDashboardScreen() {
    const router = useRouter();
    const { token } = useAuthStore();
    const { fetchStoreProducts } = useProductStore();

    const [store, setStore] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMerchantData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/marketplace/my-store`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success' && result.data.store) {
                    setStore(result.data.store);
                    const storeProducts = await fetchStoreProducts(result.data.store.id);
                    setProducts(storeProducts || []);
                }
            }
        } catch (error) {
            console.error('Error fetching merchant data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMerchantData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMerchantData();
    };

    if (isLoading && !refreshing) {
        return <LoadingIndicator fullScreen text="Loading merchant dashboard..." />;
    }

    if (!store) {
        return (
            <View style={styles.emptyContainer}>
                <Store size={64} color={colors.darkGray} />
                <Text style={styles.emptyTitle}>No Store Found</Text>
                <Text style={styles.emptySubtitle}>You haven't created a merchant store yet.</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => router.push('/store/create' as any)}
                >
                    <Plus size={20} color={colors.white} />
                    <Text style={styles.createButtonText}>Create Store</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>{store.store_name}</Text>
                    <Text style={styles.subtitle}>Merchant Dashboard</Text>
                </View>

                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
                            <DollarSign size={20} color="#16A34A" />
                        </View>
                        <Text style={styles.statLabel}>Sales</Text>
                        <Text style={styles.statValue}>${(store.total_sales || 0).toLocaleString()}</Text>
                    </Card>

                    <Card style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                            <ShoppingBag size={20} color="#2563EB" />
                        </View>
                        <Text style={styles.statLabel}>Orders</Text>
                        <Text style={styles.statValue}>{store.total_orders || 0}</Text>
                    </Card>

                    <Card style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#F3E8FF' }]}>
                            <Package size={20} color="#9333EA" />
                        </View>
                        <Text style={styles.statLabel}>Products</Text>
                        <Text style={styles.statValue}>{store.total_products || products.length}</Text>
                    </Card>

                    <Card style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
                            <Star size={20} color="#D97706" />
                        </View>
                        <Text style={styles.statLabel}>Rating</Text>
                        <Text style={styles.statValue}>{(store.rating || 0).toFixed(1)}</Text>
                    </Card>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push({ pathname: '/store/[slug]', params: { slug: store.store_slug } } as any)}
                    >
                        <Store size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>View Public Store</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push('/merchant/validate-coupon' as any)}
                    >
                        <QrCode size={20} color={colors.primary} />
                        <Text style={styles.actionButtonText}>Validate Coupon</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Products</Text>
                    <TouchableOpacity onPress={() => router.push('/merchant/products/new' as any)}>
                        <Plus size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {products.length === 0 ? (
                    <Card style={styles.emptyListCard}>
                        <Package size={40} color={colors.darkGray} />
                        <Text style={styles.emptyListText}>No products found.</Text>
                        <TouchableOpacity
                            style={styles.addProductLink}
                            onPress={() => router.push('/merchant/products/new' as any)}
                        >
                            <Text style={styles.addProductLinkText}>Add your first product</Text>
                        </TouchableOpacity>
                    </Card>
                ) : (
                    products.map(product => (
                        <Card key={product.id} style={styles.productCard}>
                            <View style={styles.productMain}>
                                <Image
                                    source={{ uri: product.images?.[0] || 'https://via.placeholder.com/60' }}
                                    style={styles.productImage}
                                />
                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                                    <Text style={styles.productPrice}>
                                        ${product.price} • {product.inventory_count} in stock
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } } as any)}
                                >
                                    <ArrowRight size={20} color={colors.darkGray} />
                                </TouchableOpacity>
                            </View>
                        </Card>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray,
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: colors.darkGray,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    statCard: {
        width: '48%',
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 12,
        color: colors.darkGray,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.black,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    actionButton: {
        flex: 1,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.lightGray,
        gap: 8,
    },
    actionButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.black,
    },
    productCard: {
        padding: 12,
        marginBottom: 12,
    },
    productMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: colors.lightGray,
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.black,
    },
    productPrice: {
        fontSize: 13,
        color: colors.darkGray,
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: colors.white,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginTop: 20,
        color: colors.black,
    },
    emptySubtitle: {
        fontSize: 16,
        color: colors.darkGray,
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    createButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    createButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyListCard: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyListText: {
        fontSize: 16,
        color: colors.darkGray,
        marginTop: 12,
    },
    addProductLink: {
        marginTop: 12,
    },
    addProductLinkText: {
        color: colors.primary,
        fontWeight: '600',
    }
});
