import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { useSearchStore } from '@/store/searchStore';
import { Search as SearchIcon, User, Archive, ShoppingBag, Store, ArrowRight, X, TrendingUp, Sparkles, Calendar, ArrowLeft } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeColors } from '@/hooks/useThemeColors';
import { safeBack } from '@/lib/navigation';

const TRENDING_SEARCHES = ['Creator', 'Drops', 'Fashion', 'Tech', 'Crypto', 'Events'];

export default function SearchScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const insets = useSafeAreaInsets();
    const { query, setQuery, performGlobalSearch, results, isSearching, clearResults } = useSearchStore();
    const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'drops' | 'shop' | 'events'>('all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                performGlobalSearch(query);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleClear = () => {
        setQuery('');
        clearResults();
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.avatarContainer}>
                {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
                ) : (
                    <User size={24} color={colors.white} />
                )}
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]}>{item.display_name || item.username}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>@{item.username}</Text>
            </View>
            <ArrowRight size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    const renderDropItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => router.push({ pathname: '/task/[id]', params: { id: item.id } } as any)}
        >
            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Archive size={20} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {item.gem_reward_base} Gems • {item.description}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderProductItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } } as any)}
        >
            <View style={styles.productImageContainer}>
                {item.images && item.images[0] ? (
                    <Image source={{ uri: item.images[0] }} style={styles.productImage} />
                ) : (
                    <ShoppingBag size={20} color={colors.darkGray} />
                )}
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    ${item.price_usd}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderStoreItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => router.push({ pathname: '/store/[slug]', params: { slug: item.store_slug } } as any)}
        >
            <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
                <Store size={20} color="#9333EA" />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]}>{item.store_name}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    ★ {item.rating?.toFixed(1) || 'New'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderEventItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => router.push({ pathname: '/events/[id]', params: { id: item.id } } as any)}
        >
            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Calendar size={20} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {new Date(item.event_date).toLocaleDateString()} • {item.location_name}
                </Text>
            </View>
            <ArrowRight size={20} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    const renderSectionHeader = (title: string, count: number, filter: any) => {
        if (count === 0) return null;
        return (
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{title} ({count})</Text>
                {activeFilter === 'all' && (
                    <TouchableOpacity onPress={() => setActiveFilter(filter)}>
                        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>See All</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const hasResults = results.users?.length > 0 || results.drops?.length > 0 || results.products?.length > 0 || results.stores?.length > 0 || (results.events?.length || 0) > 0;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: insets.top + 12 }]}>
                <View style={styles.searchBarContainer}>
                    <TouchableOpacity onPress={() => safeBack(router)} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.inputWrapper}>
                        <SearchIcon size={20} color={theme.textSecondary} style={styles.searchIcon} />
                        <Input
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search people, drops..." // Shortened placeholder
                            containerStyle={styles.searchInput}
                            style={{ color: theme.text }}
                            placeholderTextColor={theme.textSecondary}
                            autoFocus
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                                <X size={16} color={colors.white} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    {(['all', 'users', 'drops', 'shop', 'events'] as const).map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                activeFilter === filter && { backgroundColor: theme.text },
                                activeFilter !== filter && { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }
                            ]}
                            onPress={() => setActiveFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter ? { color: theme.background } : { color: theme.text }
                            ]}>
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isSearching ? (
                <View style={styles.loadingContainer}>
                    <LoadingIndicator text="Searching Promorang values..." />
                </View>
            ) : (
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                    {(!query) && (
                        <View style={styles.suggestionsContainer}>
                            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12, paddingHorizontal: 16 }]}>
                                <TrendingUp size={14} color={colors.primary} /> Trending on Promorang
                            </Text>
                            <View style={styles.tagsContainer}>
                                {TRENDING_SEARCHES.map(tag => (
                                    <TouchableOpacity
                                        key={tag}
                                        style={[styles.tagChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                                        onPress={() => {
                                            setQuery(tag);
                                            performGlobalSearch(tag);
                                        }}
                                    >
                                        <Text style={[styles.tagText, { color: theme.text }]}>#{tag}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {(!hasResults && query.length >= 2) && (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: theme.surface }]}>
                                <SearchIcon size={48} color={theme.textSecondary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No results found</Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                We couldn't find anything matching "{query}". Try a different term or check out what's trending.
                            </Text>
                        </View>
                    )}

                    {/* USERS Section */}
                    {(activeFilter === 'all' || activeFilter === 'users') && results.users?.length > 0 && (
                        <View style={styles.section}>
                            {renderSectionHeader('People', results.users.length, 'users')}
                            {results.users.map(item => <View key={item.id}>{renderUserItem({ item })}</View>)}
                        </View>
                    )}

                    {/* DROPS Section */}
                    {(activeFilter === 'all' || activeFilter === 'drops') && results.drops?.length > 0 && (
                        <View style={styles.section}>
                            {renderSectionHeader('Drops', results.drops.length, 'drops')}
                            {results.drops.map(item => <View key={item.id}>{renderDropItem({ item })}</View>)}
                        </View>
                    )}

                    {/* SHOP Section (Products & Stores) */}
                    {(activeFilter === 'all' || activeFilter === 'shop') && (results.products?.length > 0 || results.stores?.length > 0) && (
                        <View style={styles.section}>
                            {renderSectionHeader('Shop', (results.products?.length || 0) + (results.stores?.length || 0), 'shop')}
                            {results.stores?.map(item => <View key={item.id}>{renderStoreItem({ item })}</View>)}
                            {results.products?.map(item => <View key={item.id}>{renderProductItem({ item })}</View>)}
                        </View>
                    )}

                    {/* EVENTS Section */}
                    {(activeFilter === 'all' || activeFilter === 'events') && (results.events?.length || 0) > 0 && (
                        <View style={styles.section}>
                            {renderSectionHeader('Events', results.events.length, 'events')}
                            {results.events.map(item => <View key={item.id}>{renderEventItem({ item })}</View>)}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    inputWrapper: {
        flex: 1,
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
        top: 12, // Vertically center icon
    },
    searchInput: {
        marginBottom: 0,
        paddingLeft: 40,
        paddingRight: 40,
        height: 44,
    },
    clearButton: {
        position: 'absolute',
        right: 12,
        top: 12, // Vertically center icon
        backgroundColor: '#9CA3AF',
        borderRadius: 12,
        padding: 2,
        zIndex: 1,
    },
    filtersScroll: {
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    avatar: {
        width: 40,
        height: 40,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    productImageContainer: {
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden'
    },
    productImage: {
        width: 40,
        height: 40
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
    },
    loadingContainer: {
        marginTop: 40,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        marginTop: 20,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    suggestionsContainer: {
        marginTop: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 8,
    },
    tagChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
