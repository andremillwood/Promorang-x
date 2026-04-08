import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ShoppingBag, Star, Zap } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import typography from '@/constants/typography';

interface ProductCardProps {
    product: any;
    onPress: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
    const theme = useThemeColors();

    // Fallback image
    const imageUrl = product.images?.[0] || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80&sig=${product.id}`;

    return (
        <TouchableOpacity onPress={() => onPress(product.id)} activeOpacity={0.9} style={styles.touchable}>
            <Card style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} padding="none" variant="elevated">
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        contentFit="cover"
                        transition={200}
                    />
                    <View style={styles.badgeOverlay}>
                        {product.category && (
                            <Badge
                                text={product.category}
                                variant="primary"
                                size="sm"
                                style={styles.categoryBadge}
                            />
                        )}
                    </View>
                    {(product.rating || 0) > 0 && (
                        <View style={styles.ratingBadge}>
                            <Star size={10} color="#FFD700" fill="#FFD700" />
                            <Text style={styles.ratingText}>{product.rating}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                        {product.name || product.title || 'Featured Item'}
                    </Text>

                    <View style={styles.priceRow}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>
                                {product.price ? `$${product.price}` : 'Free'}
                            </Text>
                            {product.originalPrice && (
                                <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                                    ${product.originalPrice}
                                </Text>
                            )}
                        </View>
                        <View style={styles.earningBadge}>
                            <Zap size={10} color={colors.primary} />
                            <Text style={styles.earningText}>Earn Gems</Text>
                        </View>
                    </View>

                    <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                        {product.description || 'Exclusive item available in the marketplace.'}
                    </Text>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        flex: 1,
    },
    card: {
        marginBottom: 16,
        overflow: 'hidden',
        height: 260, // Consistent height for grid
    },
    imageContainer: {
        width: '100%',
        height: 140,
        position: 'relative',
        backgroundColor: colors.lightGray + '40',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badgeOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
    },
    categoryBadge: {
        opacity: 0.9,
    },
    ratingBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: '700',
        marginLeft: 2,
    },
    content: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        ...typography.presets.bodySmall,
        fontWeight: '700',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.success,
    },
    originalPrice: {
        fontSize: 10,
        textDecorationLine: 'line-through',
    },
    earningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 2,
    },
    earningText: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 11,
        lineHeight: 14,
    },
});
