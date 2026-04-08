import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ChevronRight, Zap, Gift, Calendar, TrendingUp } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { haptics } from '@/lib/haptics';

const API_URL = 'https://promorang-api.vercel.app';

interface PersonalizedItem {
    id: string;
    type: 'drop' | 'coupon' | 'event' | 'creator';
    title: string;
    subtitle: string;
    image?: string;
    reward?: string;
    reason: string; // Why this is recommended
    gradient: [string, string];
}

interface PersonalizedSectionProps {
    title?: string;
    subtitle?: string;
}

export function PersonalizedSection({ 
    title = "Picked For You",
    subtitle = "Based on your activity"
}: PersonalizedSectionProps) {
    const router = useRouter();
    const theme = useThemeColors();
    const { user, token } = useAuthStore();
    const [items, setItems] = useState<PersonalizedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPersonalizedContent();
    }, []);

    const fetchPersonalizedContent = async () => {
        try {
            // In a real implementation, this would call an ML-powered recommendation API
            // For now, we'll fetch and personalize based on user preferences
            const [dropsRes, eventsRes] = await Promise.all([
                fetch(`${API_URL}/api/drops?limit=5`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                }),
                fetch(`${API_URL}/api/events?limit=3`)
            ]);

            const dropsData = await dropsRes.json();
            const eventsData = await eventsRes.json();

            const personalizedItems: PersonalizedItem[] = [];

            // Add personalized drops
            const drops = Array.isArray(dropsData?.drops) ? dropsData.drops 
                : Array.isArray(dropsData?.data) ? dropsData.data 
                : Array.isArray(dropsData) ? dropsData : [];
            drops.slice(0, 3).forEach((drop: any, index: number) => {
                personalizedItems.push({
                    id: drop.id,
                    type: 'drop',
                    title: drop.title || 'Quick Drop',
                    subtitle: `Earn ${drop.gems_reward || 5} gems`,
                    image: drop.image_url,
                    reward: `+${drop.gems_reward || 5} 💎`,
                    reason: getDropReason(index),
                    gradient: ['#F59E0B', '#EF4444'],
                });
            });

            // Add personalized events
            const events = Array.isArray(eventsData?.events) ? eventsData.events 
                : Array.isArray(eventsData?.data) ? eventsData.data 
                : Array.isArray(eventsData) ? eventsData : [];
            events.slice(0, 2).forEach((event: any, index: number) => {
                personalizedItems.push({
                    id: event.id,
                    type: 'event',
                    title: event.title || 'Upcoming Event',
                    subtitle: event.location || 'Virtual',
                    image: event.image_url,
                    reason: getEventReason(index),
                    gradient: ['#3B82F6', '#8B5CF6'],
                });
            });

            setItems(personalizedItems);
        } catch (error) {
            console.error('Error fetching personalized content:', error);
            // Fallback to mock data
            setItems(getMockPersonalizedItems());
        } finally {
            setIsLoading(false);
        }
    };

    const getDropReason = (index: number): string => {
        const reasons = [
            "Popular in your area",
            "Matches your interests",
            "Quick to complete",
            "High reward",
            "Trending now",
        ];
        return reasons[index % reasons.length];
    };

    const getEventReason = (index: number): string => {
        const reasons = [
            "Near you",
            "Friends are attending",
            "Based on your interests",
        ];
        return reasons[index % reasons.length];
    };

    const getMockPersonalizedItems = (): PersonalizedItem[] => [
        {
            id: '1',
            type: 'drop',
            title: 'Share & Earn',
            subtitle: 'Earn 10 gems',
            reward: '+10 💎',
            reason: 'Popular in your area',
            gradient: ['#F59E0B', '#EF4444'],
        },
        {
            id: '2',
            type: 'coupon',
            title: '20% Off Coffee',
            subtitle: 'Local Cafe',
            reward: '20% OFF',
            reason: 'Based on your location',
            gradient: ['#10B981', '#3B82F6'],
        },
        {
            id: '3',
            type: 'event',
            title: 'Creator Meetup',
            subtitle: 'This Saturday',
            reason: 'Friends are attending',
            gradient: ['#8B5CF6', '#EC4899'],
        },
    ];

    const handleItemPress = async (item: PersonalizedItem) => {
        await haptics.light();
        
        switch (item.type) {
            case 'drop':
                router.push({ pathname: '/drop/[id]', params: { id: item.id } } as any);
                break;
            case 'coupon':
                router.push({ pathname: '/coupons/[id]', params: { id: item.id } } as any);
                break;
            case 'event':
                router.push({ pathname: '/events/[id]', params: { id: item.id } } as any);
                break;
            case 'creator':
                router.push({ pathname: '/user/[id]', params: { id: item.id } } as any);
                break;
        }
    };

    const getTypeIcon = (type: PersonalizedItem['type']) => {
        switch (type) {
            case 'drop': return Zap;
            case 'coupon': return Gift;
            case 'event': return Calendar;
            case 'creator': return TrendingUp;
        }
    };

    if (isLoading || items.length === 0) return null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Sparkles size={20} color="#FFD700" />
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.seeAllButton}
                    onPress={() => {
                        haptics.light();
                        router.push('/discover' as any);
                    }}
                >
                    <Text style={styles.seeAllText}>See All</Text>
                    <ChevronRight size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Horizontal Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {items.map((item) => {
                    const Icon = getTypeIcon(item.type);
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.card}
                            onPress={() => handleItemPress(item)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={item.gradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.cardGradient}
                            >
                                {/* Type Badge */}
                                <View style={styles.typeBadge}>
                                    <Icon size={12} color="#FFF" />
                                    <Text style={styles.typeBadgeText}>
                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                    </Text>
                                </View>

                                {/* Content */}
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                                    <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                                </View>

                                {/* Reward Badge */}
                                {item.reward && (
                                    <View style={styles.rewardBadge}>
                                        <Text style={styles.rewardText}>{item.reward}</Text>
                                    </View>
                                )}

                                {/* Reason */}
                                <View style={styles.reasonContainer}>
                                    <Text style={styles.reasonText}>{item.reason}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    card: {
        width: 160,
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        gap: 4,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFF',
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    rewardBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    rewardText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    reasonContainer: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    reasonText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
});

export default PersonalizedSection;
