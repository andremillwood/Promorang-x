import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import {
    Gift, Store, BarChart3, ArrowRight, Calendar,
    Rocket, TrendingUp, ChevronRight
} from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Card } from '@/components/ui/Card';

interface SectionProps {
    title: string;
}

export const EverydayValue: React.FC<SectionProps> = ({ title }) => {
    const router = useRouter();
    const theme = useThemeColors();

    const items = [
        {
            id: 'deals',
            title: 'Claim Deals',
            subtitle: 'Earn rewards from brands',
            path: '/deals',
            icon: Gift,
            color: '#EA580C',
            bgColor: '#FFEDD5',
        },
        {
            id: 'scout',
            title: 'Scout Trends',
            subtitle: 'Find viral hits & earn equity',
            path: '/bounty',
            icon: TrendingUp,
            color: '#8B5CF6',
            bgColor: '#EDE9FE',
        },
        {
            id: 'shop',
            title: 'Shop & Promote',
            subtitle: 'Buy items & earn commission',
            path: '/(tabs)/marketplace',
            icon: Store,
            color: '#D97706',
            bgColor: '#FEF3C7',
        },
        {
            id: 'forecast',
            title: 'Forecast Trends',
            subtitle: 'Spot hits & earn shares',
            path: '/(tabs)/discover',
            icon: BarChart3,
            color: '#2563EB',
            bgColor: '#DBEAFE',
        },
    ];

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>
            <View style={styles.grid}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push(item.path as any)}
                        style={[
                            styles.card,
                            { backgroundColor: theme.card, borderColor: theme.border }
                        ]}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                            <item.icon size={20} color={item.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                        </View>
                        <ArrowRight size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export const RankUpActions: React.FC<SectionProps> = ({ title }) => {
    const router = useRouter();
    const theme = useThemeColors();

    const items = [
        {
            id: 'events',
            title: 'Events Hub',
            subtitle: 'Meet the community & earn keys',
            path: '/events-entry',
            icon: Calendar,
            color: '#2563EB',
            borderColor: '#BFDBFE',
        },
        {
            id: 'post',
            title: 'Share & Rank Up',
            subtitle: 'Build your rank & enter the draw',
            path: '/post',
            icon: Rocket,
            color: '#7C3AED',
            borderColor: '#DDD6FE',
        },
        {
            id: 'bounty',
            title: 'Scout Opportunities',
            subtitle: 'Tag cool content & earn first',
            path: '/bounty',
            icon: TrendingUp,
            color: '#EA580C',
            borderColor: '#FED7AA',
            isSpecial: true,
        },
    ];

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>
            <View style={styles.list}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push(item.path as any)}
                        style={[
                            styles.listCard,
                            { backgroundColor: theme.card, borderColor: item.borderColor },
                            item.isSpecial && styles.specialCard
                        ]}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                            <item.icon size={20} color={item.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                        </View>
                        <ChevronRight size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export const BusinessGateway = () => {
    const router = useRouter();
    const theme = useThemeColors();

    return (
        <TouchableOpacity
            style={styles.businessCard}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
        >
            <View style={styles.businessIconBg}>
                <Store size={22} color="#059669" />
            </View>
            <View style={styles.businessText}>
                <Text style={styles.businessTitle}>Got a Business?</Text>
                <Text style={styles.businessSubtitle}>
                    Try Promorang to attract customers. Create one free sampling offer today.
                </Text>
                <View style={styles.businessLink}>
                    <Text style={styles.businessLinkText}>Learn How</Text>
                    <ArrowRight size={14} color="#059669" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        flexBasis: '48%',
        flexGrow: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        gap: 10,
    },
    fullWidthCard: {
        flexBasis: '100%',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    cardSubtitle: {
        fontSize: 11,
    },
    list: {
        gap: 10,
    },
    listCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    specialCard: {
        backgroundColor: '#FFF5F5', // Soft orange/pink tint
    },
    businessCard: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        borderWidth: 1,
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    businessIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    businessText: {
        flex: 1,
    },
    businessTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#064E3B',
        marginBottom: 4,
    },
    businessSubtitle: {
        fontSize: 13,
        color: '#065F46',
        lineHeight: 18,
        marginBottom: 8,
    },
    businessLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    businessLinkText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#059669',
    },
});
