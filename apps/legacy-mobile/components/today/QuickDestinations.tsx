import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Rocket, Store, Sparkles, Trophy, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';

interface QuickDestinationsProps {
    maturityState: number;
}

export const QuickDestinations: React.FC<QuickDestinationsProps> = ({ maturityState }) => {
    const router = useRouter();
    const theme = useThemeColors();

    const items = [
        {
            id: 'earn',
            title: 'Earning Center',
            subtitle: 'Discover active drops & proofs',
            path: '/events', // Mapped to events for verified early users, or earning hub
            icon: Rocket,
            color: '#10B981',
            bg: 'rgba(16, 185, 129, 0.1)',
            gradient: ['#ECFDF5', '#D1FAE5'] // Emerald-50 to Emerald-100
        },
        {
            id: 'market',
            title: 'Marketplace',
            subtitle: 'Shop curated hits',
            path: '/(tabs)/marketplace',
            icon: Store,
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
            gradient: ['#FFFBEB', '#FEF3C7'] // Amber-50 to Amber-100
        },
        {
            id: 'promoshare',
            title: 'PromoShare V2',
            subtitle: 'Jackpot & draws',
            path: '/promoshare',
            icon: Sparkles,
            color: '#8B5CF6',
            bg: 'rgba(139, 92, 246, 0.1)',
            gradient: ['#F5F3FF', '#EDE9FE'] // Violet-50 to Violet-100
        }
    ];

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>QUICK DESTINATIONS</Text>

            <View style={styles.grid}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push(item.path as any)}
                        style={styles.cardWrapper}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[theme.surface, theme.surface]} // Simplified for now, can add gradient if needed
                            style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
                                    <item.icon size={20} color={item.color} />
                                </View>
                                <ArrowRight size={16} color={theme.textSecondary} />
                            </View>

                            <View style={styles.content}>
                                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}

                {maturityState >= 2 && (
                    <TouchableOpacity
                        onPress={() => router.push('/leaderboard' as any)}
                        style={[styles.cardWrapper, styles.fullWidth]}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[theme.surface, theme.surface]}
                            style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)', flexDirection: 'row', gap: 4, width: 'auto', paddingHorizontal: 8 }]}>
                                    <Trophy size={16} color="#F59E0B" />
                                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#F59E0B', textTransform: 'uppercase' }}>Competitive</Text>
                                </View>
                                <ArrowRight size={16} color={theme.textSecondary} />
                            </View>

                            <View style={styles.content}>
                                <Text style={[styles.title, { color: theme.text }]}>Global Rankings</Text>
                                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>See where you stand against the community</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                style={styles.marketplaceLink}
                onPress={() => router.push('/(tabs)/marketplace' as any)}
            >
                <Text style={styles.marketplaceLinkText}>CURATED MARKETPLACE →</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        marginBottom: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    cardWrapper: {
        flexBasis: '48%',
        flexGrow: 1,
    },
    fullWidth: {
        flexBasis: '100%',
    },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        minHeight: 110,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        gap: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 11,
        lineHeight: 14,
    },
    marketplaceLink: {
        alignItems: 'center',
        marginTop: 24,
        opacity: 0.5,
    },
    marketplaceLinkText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        color: colors.gray,
    },
});
