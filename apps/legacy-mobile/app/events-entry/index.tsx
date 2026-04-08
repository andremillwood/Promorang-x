/**
 * Events Entry (Simplified)
 * 
 * Lightweight events view for rank 0-1 users.
 * Shows upcoming events with simple RSVP action.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    RefreshControl,
    Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Calendar,
    MapPin,
    Users,
    ArrowRight,
    Clock,
    Sparkles,
    ChevronLeft
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';

const { width } = Dimensions.get('window');

const API_URL = 'https://promorang-api.vercel.app';

// Mock events for display
const MOCK_EVENTS = [
    {
        id: '1',
        title: 'Brand Launch Party',
        description: 'Exclusive launch event with free samples and giveaways',
        date: '2026-01-25',
        time: '7:00 PM',
        location: 'Downtown LA',
        image: 'https://picsum.photos/400/200?random=1',
        attendees: 45,
        reward: '+50 Points',
        category: 'Party',
    },
    {
        id: '2',
        title: 'Fitness Pop-Up',
        description: 'Free workout class with influencer trainers',
        date: '2026-01-28',
        time: '9:00 AM',
        location: 'Santa Monica Beach',
        image: 'https://picsum.photos/400/200?random=2',
        attendees: 120,
        reward: '+75 Points',
        category: 'Fitness',
    },
    {
        id: '3',
        title: 'Live Drop: Sneaker Release',
        description: 'Be first to get exclusive sneakers',
        date: '2026-02-01',
        time: '12:00 PM',
        location: 'Online',
        image: 'https://picsum.photos/400/200?random=3',
        attendees: 500,
        reward: '+100 Points',
        category: 'Drop',
    },
];

export default function EventsEntryScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();
    const [events, setEvents] = useState(MOCK_EVENTS);
    const [refreshing, setRefreshing] = useState(false);
    const [rsvpedEvents, setRsvpedEvents] = useState<Set<string>>(new Set());

    const handleRefresh = async () => {
        setRefreshing(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // In production, fetch from API
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleRSVP = async (eventId: string) => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRsvpedEvents(prev => new Set([...prev, eventId]));
        // In production, POST to API
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const renderEventCard = ({ item }: { item: typeof MOCK_EVENTS[0] }) => {
        const isRsvped = rsvpedEvents.has(item.id);

        return (
            <TouchableOpacity
                style={[styles.eventCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push(`/events/${item.id}` as any)}
                activeOpacity={0.8}
            >
                <Image source={{ uri: item.image }} style={styles.eventImage} />

                {/* Category Badge */}
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>

                {/* Reward Badge */}
                <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.rewardBadge}
                >
                    <Sparkles size={12} color="#FFF" />
                    <Text style={styles.rewardText}>{item.reward}</Text>
                </LinearGradient>

                <View style={styles.eventContent}>
                    <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>
                        {item.title}
                    </Text>

                    <Text style={[styles.eventDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>

                    <View style={styles.eventDetails}>
                        <View style={styles.detailRow}>
                            <Calendar size={14} color={theme.textSecondary} />
                            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                                {formatDate(item.date)} at {item.time}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <MapPin size={14} color={theme.textSecondary} />
                            <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                                {item.location}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.eventFooter}>
                        <View style={styles.attendeesRow}>
                            <Users size={14} color={theme.textSecondary} />
                            <Text style={[styles.attendeesText, { color: theme.textSecondary }]}>
                                {item.attendees} going
                            </Text>
                        </View>

                        {isRsvped ? (
                            <View style={[styles.rsvpedBadge, { backgroundColor: '#10B98120' }]}>
                                <Text style={styles.rsvpedText}>✓ RSVP'd</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.rsvpButton}
                                onPress={() => handleRSVP(item.id)}
                            >
                                <LinearGradient
                                    colors={['#3B82F6', '#6366F1']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.rsvpButtonGradient}
                                >
                                    <Text style={styles.rsvpButtonText}>RSVP</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Events</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Earn for showing up
                    </Text>
                </View>
            </View>

            {/* Explainer Banner */}
            <View style={[styles.explainerBanner, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Calendar size={18} color="#3B82F6" />
                <Text style={[styles.explainerText, { color: '#3B82F6' }]}>
                    RSVP to events and earn points when you show up!
                </Text>
            </View>

            {/* Events List */}
            <FlatList
                data={events}
                renderItem={renderEventCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Calendar size={48} color={theme.textSecondary} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Events Yet</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            Check back soon for upcoming events
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    explainerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    explainerText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    eventCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 16,
    },
    eventImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#1A1A1A',
    },
    categoryBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFF',
    },
    rewardBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    rewardText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
    eventContent: {
        padding: 16,
    },
    eventTitle: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
    },
    eventDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    eventDetails: {
        gap: 6,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 13,
    },
    eventFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    attendeesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    attendeesText: {
        fontSize: 13,
    },
    rsvpButton: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    rsvpButtonGradient: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    rsvpButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    rsvpedBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    rsvpedText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#10B981',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
