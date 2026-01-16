import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { useProductStore } from '@/store/productStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { safeBack } from '@/lib/navigation';

export default function CartScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { cart, isLoading, fetchCart, removeFromCart } = useProductStore();

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemove = async (itemId: string) => {
        const success = await removeFromCart(itemId);
        if (success) {
            Alert.alert("Removed", "Item removed from cart.");
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.cart_items) return { usd: 0, gems: 0, gold: 0 };
        return cart.cart_items.reduce((acc, item) => {
            if (item.price_usd) acc.usd += item.price_usd * item.quantity;
            if (item.price_gems) acc.gems += item.price_gems * item.quantity;
            if (item.price_gold) acc.gold += item.price_gold * item.quantity;
            return acc;
        }, { usd: 0, gems: 0, gold: 0 });
    };

    const totals = calculateTotal();

    const renderPrice = (item: any) => {
        const prices = [];
        if (item.price_usd) prices.push(`$${item.price_usd.toFixed(2)}`);
        if (item.price_gems) prices.push(`${item.price_gems} 💎`);
        if (item.price_gold) prices.push(`${item.price_gold} 🪙`);
        return prices.join(' or ');
    };

    if (isLoading && !cart) return <LoadingIndicator fullScreen text="Loading cart..." />;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Shopping Cart',
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => safeBack(router)} style={styles.headerBack}>
                            <ArrowLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <FlatList
                data={cart?.cart_items || []}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Card style={[styles.cartItem, { backgroundColor: theme.surface }] as any}>
                        <Image
                            source={{ uri: item.products?.images?.[0] || 'https://via.placeholder.com/80' }}
                            style={styles.itemImage}
                        />
                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={1}>{item.products?.name}</Text>
                            <Text style={[styles.itemPrice, { color: theme.textSecondary }]}>{renderPrice(item)}</Text>
                            <Text style={[styles.itemQty, { color: theme.textSecondary }]}>Qty: {item.quantity}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
                            <Trash2 size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </Card>
                )}
                ListEmptyComponent={
                    <EmptyState
                        title="Your cart is empty"
                        description="Browse the marketplace to find amazing products."
                        icon={<ShoppingBag size={48} color={theme.textSecondary} />}
                        actionLabel="Go Shopping"
                        onAction={() => router.push('/(tabs)/marketplace')}
                        style={styles.emptyState}
                    />
                }
            />

            {cart && cart.cart_items.length > 0 && (
                <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: theme.text }]}>Total:</Text>
                        <View style={styles.totalValues}>
                            {totals.usd > 0 && <Text style={styles.totalValue}>${totals.usd.toFixed(2)}</Text>}
                            {totals.gems > 0 && <Text style={styles.totalValue}>{totals.gems} 💎</Text>}
                            {totals.gold > 0 && <Text style={styles.totalValue}>{totals.gold} 🪙</Text>}
                        </View>
                    </View>
                    <Button
                        title="Proceed to Checkout"
                        onPress={() => Alert.alert("Checkout", "Checkout flow coming soon!")}
                        variant="primary"
                        size="lg"
                        style={styles.checkoutBtn}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBack: {
        marginLeft: 8,
        padding: 8,
    },
    listContent: {
        padding: 16,
        paddingBottom: 120,
    },
    cartItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
    },
    itemQty: {
        fontSize: 12,
        marginTop: 4,
    },
    removeBtn: {
        padding: 8,
    },
    emptyState: {
        marginTop: 100,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
    },
    totalValues: {
        alignItems: 'flex-end',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.primary,
    },
    checkoutBtn: {
        width: '100%',
    },
});
