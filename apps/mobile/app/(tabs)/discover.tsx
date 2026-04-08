import { useState } from 'react';
import { StyleSheet, ScrollView, Pressable, TextInput, Platform, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { Colors as DesignColors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/DesignTokens';
import { useColorScheme } from '@/components/useColorScheme';
import { useMoments } from '@/hooks/useMoments';

const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'community', label: 'Community', icon: 'people' },
    { id: 'activation', label: 'Brand', icon: 'flash' },
    { id: 'digital', label: 'Digital', icon: 'globe' },
    { id: 'bounty', label: 'Bounties', icon: 'cash' },
];

export default function DiscoverScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { moments, loading } = useMoments(selectedCategory);

    return (
        <View style={[styles.container, { backgroundColor: isDark ? DesignColors.black : DesignColors.gray[50] }]}>
            {/* Absolute Search Header */}
            <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint={isDark ? 'dark' : 'light'} style={styles.header}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={DesignColors.gray[400]} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search moments, hosts, cities..."
                        placeholderTextColor={DesignColors.gray[500]}
                        style={[styles.searchInput, { color: isDark ? DesignColors.white : DesignColors.black }]}
                    />
                    <Ionicons name="options" size={20} color={DesignColors.primary} style={styles.filterIcon} />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
                    {categories.map((cat) => (
                        <Pressable
                            key={cat.id}
                            onPress={() => setSelectedCategory(cat.id)}
                            style={[
                                styles.categoryPill,
                                cat.id === selectedCategory && { backgroundColor: DesignColors.primary }
                            ]}
                        >
                            <Ionicons name={cat.icon as any} size={14} color={cat.id === selectedCategory ? DesignColors.white : isDark ? DesignColors.gray[400] : DesignColors.gray[600]} />
                            <Text style={[
                                styles.categoryLabel,
                                cat.id === selectedCategory && { color: DesignColors.white, fontWeight: 'bold' },
                                cat.id !== selectedCategory && { color: isDark ? DesignColors.gray[400] : DesignColors.gray[600] }
                            ]}>
                                {cat.label}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </BlurView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <View style={styles.centered}>
                        <Text style={{ color: DesignColors.gray[500] }}>Loading moments...</Text>
                    </View>
                ) : moments.length === 0 ? (
                    <View style={styles.centered}>
                        <Ionicons name="search-outline" size={48} color={DesignColors.gray[300]} />
                        <Text style={{ color: DesignColors.gray[500], marginTop: 12 }}>No moments found</Text>
                    </View>
                ) : (
                    <View style={styles.masonryGrid}>
                        {/* Left Column */}
                        <View style={styles.column}>
                            {moments.filter((_, i) => i % 2 === 0).map((item) => (
                                <MomentCard key={item.id} item={item} isDark={isDark} />
                            ))}
                        </View>
                        {/* Right Column */}
                        <View style={styles.column}>
                            {moments.filter((_, i) => i % 2 !== 0).map((item) => (
                                <MomentCard key={item.id} item={item} isDark={isDark} />
                            ))}
                        </View>
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Map Button */}
            <Pressable style={styles.mapButton}>
                <Ionicons name="map" size={20} color={DesignColors.white} />
                <Text style={styles.mapButtonText}>Map</Text>
            </Pressable>
        </View>
    );
}

function MomentCard({ item, isDark }: { item: any, isDark: boolean }) {
    return (
        <Pressable style={[styles.card, { height: item.height }]}>
            <View style={[styles.cardImagePlaceholder, { height: item.height - 50 }]}>
                <Ionicons name="images-outline" size={32} color={DesignColors.gray[700]} />
                <View style={styles.cardOverlay}>
                    <BlurView intensity={30} tint="dark" style={styles.cardCategoryBlur}>
                        <Text style={styles.cardCategoryText}>{item.category}</Text>
                    </BlurView>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <Text style={[styles.cardTitle, { color: isDark ? DesignColors.white : DesignColors.black }]} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.cardHost}>by {item.host}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: Spacing.md,
        zIndex: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.container,
        paddingHorizontal: Spacing.md,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.sizes.base,
        paddingVertical: 8,
        backgroundColor: 'transparent',
    },
    filterIcon: {
        marginLeft: Spacing.sm,
    },
    categoryScroll: {
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.container,
        backgroundColor: 'transparent',
    },
    categoryContent: {
        gap: Spacing.sm,
        paddingRight: Spacing.container * 2,
        backgroundColor: 'transparent',
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(0,0,0,0.03)',
        gap: 6,
    },
    categoryLabel: {
        fontSize: Typography.sizes.sm,
    },
    scrollContent: {
        paddingHorizontal: Spacing.container,
        paddingTop: Spacing.md,
    },
    masonryGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        backgroundColor: 'transparent',
    },
    column: {
        flex: 1,
        gap: Spacing.md,
        backgroundColor: 'transparent',
    },
    card: {
        width: COLUMN_WIDTH,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    cardImagePlaceholder: {
        width: '100%',
        backgroundColor: DesignColors.gray[900],
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'transparent',
    },
    cardCategoryBlur: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        overflow: 'hidden',
    },
    cardCategoryText: {
        color: DesignColors.white,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    cardFooter: {
        paddingVertical: 8,
        paddingHorizontal: 4,
        backgroundColor: 'transparent',
    },
    cardTitle: {
        fontSize: Typography.sizes.sm,
        fontWeight: 'bold',
    },
    cardHost: {
        fontSize: Typography.sizes.xs,
        color: DesignColors.gray[500],
        marginTop: 2,
    },
    mapButton: {
        position: 'absolute',
        bottom: 100,
        left: '50%',
        transform: [{ translateX: -40 }],
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DesignColors.secondary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BorderRadius.full,
        gap: 8,
        ...Shadows.medium,
    },
    mapButtonText: {
        color: DesignColors.white,
        fontWeight: 'bold',
        fontSize: Typography.sizes.sm,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
});
