import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { EventCard } from '@/components/feed/EventCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { Calendar, Plus, User } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';

const API_URL = 'https://promorang-api.vercel.app';

export default function EventsScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token, isAuthenticated } = useAuthStore();
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/events?limit=20&upcoming=true`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (response.ok) {
                const data = await response.json();
                const eventsData = (data?.data?.events || data?.events || []).map((e: any) => ({
                    ...e,
                    date: e.event_date || e.date,
                    location: e.location_name || e.location,
                    image: e.banner_url || e.flyer_url || e.image,
                    organizer: e.organizer_name ? { name: e.organizer_name, avatar: e.organizer_avatar } : e.organizer,
                    attendees: e.total_rsvps || e.attendees || 0,
                    type: e.category || e.type || 'event',
                    isRegistered: e.hasRsvp || e.isRegistered || false,
                }));
                setEvents(eventsData);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchEvents();
    };

    const handleEventPress = (eventId: string) => {
        router.push({ pathname: '/events/[id]', params: { id: eventId } } as any);
    };

    const handleCreateEvent = () => {
        if (!isAuthenticated) {
            router.push('/(auth)/login');
            return;
        }
        router.push('/events/create');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'Events',
                    headerShown: true,
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: colors.primary,
                    headerTitleStyle: { fontWeight: '700', color: theme.text },
                    headerRight: () => isAuthenticated ? (
                        <TouchableOpacity
                            onPress={() => router.push('/events/my-events')}
                            style={styles.headerButton}
                        >
                            <User size={22} color={colors.primary} />
                        </TouchableOpacity>
                    ) : null,
                }}
            />

            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <EventCard event={item} onPress={handleEventPress} />
                )}
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
                    !isLoading ? (
                        <EmptyState
                            title="No Events Scheduled"
                            description="Stay tuned for upcoming creator meetups and live drops."
                            icon={<Calendar size={48} color={theme.textSecondary} />}
                            actionLabel="Create Event"
                            onAction={handleCreateEvent}
                            style={styles.emptyState}
                        />
                    ) : null
                }
                ListHeaderComponent={
                    events.length > 0 ? (
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Featured & Upcoming</Text>
                    ) : null
                }
            />

            {isLoading && !refreshing && <LoadingIndicator fullScreen text="Discovering events..." />}

            {/* FAB - Create Event */}
            {isAuthenticated && (
                <TouchableOpacity style={styles.fab} onPress={handleCreateEvent}>
                    <Plus size={28} color="#FFF" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 16,
        marginTop: 8,
    },
    emptyState: {
        marginTop: 60,
    },
    headerButton: {
        marginRight: 12,
        padding: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
