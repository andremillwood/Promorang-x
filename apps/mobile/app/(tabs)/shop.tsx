import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/feed/ProductCard';
import { useProductStore } from '@/store/productStore';
import { Store, Search as SearchIcon, SlidersHorizontal, ChevronDown } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Input } from '@/components/ui/Input';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'popular';

export default function ShopScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { products, isLoading, fetchProducts, categories, fetchCategories } = useProductStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});

    useEffect(() => {
        fetchProducts({ search: searchTerm, category_id: selectedCategory });
        fetchCategories();
    }, [selectedCategory]);

    const handleSearch = () => {
        fetchProducts({ search: searchTerm, category_id: selectedCategory });
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchProducts({ search: searchTerm, category_id: selectedCategory });
        await fetchCategories();
        setRefreshing(false);
    };

    const handleProductPress = (productId: string) => {
        router.push({ pathname: '/product/[id]', params: { id: productId } } as any);
    };

    const sortProducts = (items: typeof products) => {
        const sorted = [...items];
        switch (sortBy) {
            case 'price_low':
                return sorted.sort((a, b) => (a.price_usd || 0) - (b.price_usd || 0));
            case 'price_high':
                return sorted.sort((a, b) => (b.price_usd || 0) - (a.price_usd || 0));
            case 'popular':
                return sorted.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
            case 'newest':
            default:
                return sorted.sort((a, b) => 
                    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                );
        }
    };

    const filterByPrice = (items: typeof products) => {
        return items.filter(item => {
            const price = item.price_usd || 0;
            if (priceRange.min && price < priceRange.min) return false;
            if (priceRange.max && price > priceRange.max) return false;
            return true;
        });
    };

    const displayProducts = sortProducts(filterByPrice(products));

    const sortOptions: { key: SortOption; label: string }[] = [
        { key: 'newest', label: 'Newest' },
        { key: 'popular', label: 'Popular' },
        { key: 'price_low', label: 'Price: Low to High' },
        { key: 'price_high', label: 'Price: High to Low' },
    ];

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    onSubmitEditing={handleSearch}
                    containerStyle={styles.searchInput}
                    leftIcon={<SearchIcon size={20} color={theme.textSecondary} />}
                />
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: showFilters ? colors.primary : theme.card, borderColor: theme.border }]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <SlidersHorizontal size={20} color={showFilters ? '#FFF' : theme.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Filters Panel */}
            {showFilters && (
                <Card style={[styles.filtersPanel, { backgroundColor: theme.card }]}>
                    <Text style={[styles.filterLabel, { color: theme.text }]}>Sort By</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortOptions}>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.sortChip,
                                    sortBy === option.key && styles.activeSortChip
                                ]}
                                onPress={() => setSortBy(option.key)}
                            >
                                <Text style={[
                                    styles.sortChipText,
                                    sortBy === option.key && styles.activeSortChipText
                                ]}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={[styles.filterLabel, { color: theme.text, marginTop: 12 }]}>Price Range</Text>
                    <View style={styles.priceRangeRow}>
                        <TouchableOpacity
                            style={[styles.priceChip, !priceRange.max && !priceRange.min && styles.activePriceChip]}
                            onPress={() => setPriceRange({})}
                        >
                            <Text style={[styles.priceChipText, !priceRange.max && !priceRange.min && styles.activePriceChipText]}>All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.priceChip, priceRange.max === 25 && styles.activePriceChip]}
                            onPress={() => setPriceRange({ max: 25 })}
                        >
                            <Text style={[styles.priceChipText, priceRange.max === 25 && styles.activePriceChipText]}>Under $25</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.priceChip, priceRange.min === 25 && priceRange.max === 50 && styles.activePriceChip]}
                            onPress={() => setPriceRange({ min: 25, max: 50 })}
                        >
                            <Text style={[styles.priceChipText, priceRange.min === 25 && priceRange.max === 50 && styles.activePriceChipText]}>$25 - $50</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.priceChip, priceRange.min === 50 && styles.activePriceChip]}
                            onPress={() => setPriceRange({ min: 50 })}
                        >
                            <Text style={[styles.priceChipText, priceRange.min === 50 && styles.activePriceChipText]}>$50+</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            )}

            {/* Category Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContent}
            >
                <TouchableOpacity
                    style={[
                        styles.categoryChip,
                        !selectedCategory && styles.activeCategoryChip
                    ]}
                    onPress={() => setSelectedCategory('')}
                >
                    <Text style={[
                        styles.categoryText,
                        !selectedCategory && styles.activeCategoryText
                    ]}>All Products</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.categoryChip,
                            selectedCategory === cat.id && styles.activeCategoryChip
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                    >
                        <Text style={styles.categoryIcon}>{cat.icon}</Text>
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === cat.id && styles.activeCategoryText
                        ]}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results Count */}
            <View style={styles.resultsRow}>
                <Text style={[styles.resultsText, { color: theme.textSecondary }]}>
                    {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} found
                </Text>
            </View>
        </View>
    );

    if (isLoading && !refreshing && products.length === 0) {
        return <LoadingIndicator fullScreen text="Loading shop..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <FlatList
                data={displayProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProductCard product={item} onPress={handleProductPress} />
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
                        title="No Products Found"
                        description="Try a different search or check back later."
                        icon={<Store size={48} color={theme.textSecondary} />}
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
    headerContainer: {
        paddingBottom: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        marginBottom: 0,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    filtersPanel: {
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 16,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    sortOptions: {
        flexDirection: 'row',
    },
    sortChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    activeSortChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    sortChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4B5563',
    },
    activeSortChipText: {
        color: '#FFFFFF',
    },
    priceRangeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    priceChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    activePriceChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    priceChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4B5563',
    },
    activePriceChipText: {
        color: '#FFFFFF',
    },
    categoryScroll: {
        maxHeight: 50,
        marginBottom: 8,
    },
    categoryContent: {
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    activeCategoryChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryIcon: {
        marginRight: 6,
        fontSize: 14,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
    },
    activeCategoryText: {
        color: '#FFFFFF',
    },
    resultsRow: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    resultsText: {
        fontSize: 13,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    emptyState: {
        marginTop: 60,
    },
});
