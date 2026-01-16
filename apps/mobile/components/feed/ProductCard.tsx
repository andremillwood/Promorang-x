import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ShoppingBag, Star } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ProductCardProps {
    product: any;
    onPress: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    const theme = useThemeColors();
    return (
        <TouchableOpacity onPress={() => onPress(product.id)} activeOpacity={0.9}>
            <Card style={styles.card} padding="none">
                <View style={styles.container}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                        {product.images?.[0] ? (
                            <Image source={{ uri: product.images[0] }} style={styles.image} />
                        ) : (
                            <ShoppingBag size={32} color={colors.primary} />
                        )}
                    </View>

                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={[styles.category, { color: theme.textSecondary }]}>{product.category || 'Product'}</Text>
                            {(product.rating || 0) > 0 && (
                                <View style={styles.rating}>
                                    <Star size={12} color="#FFD700" fill="#FFD700" />
                                    <Text style={[styles.ratingText, { color: theme.text }]}>{product.rating}</Text>
                                </View>
                            )}
                        </View>

                        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                            {product.name || product.title || 'Featured Item'}
                        </Text>

                        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                            {product.description || 'Exclusive item available in the marketplace.'}
                        </Text>

                        <View style={styles.footer}>
                            <Text style={styles.price}>
                                {product.price ? `$${product.price}` : 'Points Only'}
                            </Text>
                            <View style={styles.button}>
                                <Text style={styles.buttonText}>View Item</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        overflow: 'hidden',
    },
    container: {
        flexDirection: 'row',
        minHeight: 120,
    },
    iconContainer: {
        width: 80,
        backgroundColor: colors.gray,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    category: {
        fontSize: 10,
        color: colors.darkGray,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: colors.black,
        fontWeight: '600',
        marginLeft: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 2,
    },
    description: {
        fontSize: 13,
        color: colors.darkGray,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.success,
    },
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    buttonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
});
