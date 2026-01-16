import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Star, Mail, ExternalLink, Store as StoreIcon, Grid, List, ShieldCheck } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/feed/ProductCard';
import { useProductStore } from '@/store/productStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { Store, Product } from '@/types';
import { safeBack } from '@/lib/navigation';

export default function StoreScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const router = useRouter();
    const theme = useThemeColors();
    const { fetchStore, fetchStoreProducts, isLoading } = useProductStore();

    const [store, setStore] = useState<Store | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        if (slug) {
            loadStoreData();
        }
    }, [slug]);

    const loadStoreData = async () => {
        const storeData = await fetchStore(slug);
        if (storeData) {
            setStore(storeData);
            const productsData = await fetchStoreProducts(storeData.id);
            setProducts(productsData);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadStoreData();
        setRefreshing(false);
    };

    if (isLoading && !store) return <LoadingIndicator fullScreen text="Loading store..." />;

    if (!store) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Store not found</Text>
                <TouchableOpacity onPress={() => safeBack(router)} style={styles.backLink}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Banner */}
            <View style={styles.bannerContainer}>
                <Image
                    source={{ uri: store.banner_url || 'https://via.placeholder.com/800x400' }}
                    style={styles.banner}
                />
                <TouchableOpacity onPress={() => safeBack(router)} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {/* Store Profile */}
            <View style={styles.profileContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={{ uri: store.logo_url || 'https://via.placeholder.com/120' }}
                        style={styles.logo}
                    />
                </View>

                <View style={styles.storeInfo}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.storeName, { color: theme.text }]}>{store.store_name}</Text>
                        <ShieldCheck size={18} color="#10B981" />
                    </View>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>{store.description}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Star size={14} color="#FFB800" fill="#FFB800" />
                            <Text style={[styles.statText, { color: theme.text }]}>{store.rating?.toFixed(1) || '0.0'}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>({store.review_count || 0})</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{products.length} Products</Text>
                    </View>

                    <View style={styles.actionRow}>
                        {store.contact_email && (
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Mail size={16} color={theme.text} />
                                <Text style={[styles.actionBtnText, { color: theme.text }]}>Contact</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
                            <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Follow Store</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Products</Text>
                <View style={styles.viewToggle}>
                    <TouchableOpacity onPress={() => setViewMode('grid')} style={[styles.toggleBtn, viewMode === 'grid' && styles.activeToggle]}>
                        <Grid size={20} color={viewMode === 'grid' ? colors.primary : theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setViewMode('list')} style={[styles.toggleBtn, viewMode === 'list' && styles.activeToggle]}>
                        <List size={20} color={viewMode === 'list' ? colors.primary : theme.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.productItem}>
                        <ProductCard
                            product={item}
                            onPress={(id) => router.push({ pathname: '/product/[id]', params: { id } } as any)}
                        />
                    </View>
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No products found"
                        description="This store hasn't listed any products yet."
                        icon={<StoreIcon size={48} color={theme.textSecondary} />}
                        style={styles.emptyState}
                    />
                }
            />
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
    headerContainer: {
        marginBottom: 8,
    },
    bannerContainer: {
        height: 180,
        position: 'relative',
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileContainer: {
        paddingHorizontal: 16,
        marginTop: -40,
        marginBottom: 20,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 16,
        borderWidth: 4,
        borderColor: '#FFF',
        backgroundColor: '#FFF',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    storeInfo: {
        marginTop: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    storeName: {
        fontSize: 22,
        fontWeight: '800',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 14,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 13,
    },
    statDivider: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 2,
    },
    toggleBtn: {
        padding: 6,
        borderRadius: 6,
    },
    activeToggle: {
        backgroundColor: '#FFF',
        elevation: 1,
    },
    listContent: {
        paddingBottom: 40,
    },
    productItem: {
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    emptyState: {
        marginTop: 60,
    },
});
