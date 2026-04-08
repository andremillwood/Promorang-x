import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import TodayLayout from '@/components/TodayLayout';
import { AppHeader } from '@/components/ui/AppHeader';
import { useProductStore } from '@/store/productStore';
import { ProductCard } from '@/components/feed/ProductCard';
import { useRouter, Stack } from 'expo-router';
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingBag, Sparkles, Store } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { BalancesBar } from '@/components/ui/BalancesBar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function StoreScreen() {
    const theme = useThemeColors();
    const router = useRouter();
    const { user } = useAuthStore();
    const { products, isLoading, fetchProducts } = useProductStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchProducts();
        setRefreshing(false);
    }, [fetchProducts]);

    const handleProductPress = (productId: string) => {
        router.push({ pathname: '/product/[id]', params: { id: productId } } as any);
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <LinearGradient
                colors={['#F59E0B', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroSection}
            >
                <View style={styles.heroContent}>
                    <View>
                        <Text style={styles.heroTitle}>Premium Shop</Text>
                        <Text style={styles.heroSubtitle}>Spend points, earn gems back</Text>
                    </View>
                    <Store size={40} color="rgba(255,255,255,0.2)" />
                </View>
                <Sparkles size={100} color="rgba(255,255,255,0.05)" style={styles.heroIcon} />
            </LinearGradient>

            <View style={styles.contentPadding}>
                <BalancesBar user={user} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Collections</Text>
            </View>
        </View>
    );

    return (
        <TodayLayout>
            <AppHeader transparent hideLeft showBack showNotifications showAvatar />
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ headerShown: false }} />

                {isLoading && !refreshing && products.length === 0 ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        renderItem={({ item }) => (
                            <View style={styles.productWrapper}>
                                <ProductCard
                                    product={item}
                                    onPress={() => handleProductPress(item.id)}
                                />
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={renderHeader}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                        }
                        ListEmptyComponent={
                            <EmptyState
                                title="No Products Found"
                                description="We couldn't find any products right now. Try checking out our latest deals in the meantime!"
                                icon={<ShoppingBag size={48} color={theme.textSecondary} />}
                                actionLabel="Explore Deals"
                                onAction={() => router.push('/deals')}
                                style={styles.emptyState}
                            />
                        }
                    />
                )}
            </View>
        </TodayLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        marginBottom: 8,
    },
    heroSection: {
        padding: 24,
        paddingTop: 60, // Increased to clear transparent header
        paddingBottom: 40,
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    heroIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
    },
    contentPadding: {
        paddingHorizontal: 16,
        marginTop: -20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    listContent: {
        paddingBottom: 120,
    },
    productWrapper: {
        width: width / 2,
        padding: 8,
    },
    emptyState: {
        marginTop: 60,
    },
});
