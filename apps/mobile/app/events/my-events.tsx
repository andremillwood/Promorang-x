import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Plus, Calendar, MapPin, Users, MoreVertical, Edit2, Trash2, Eye } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuthStore } from '@/store/authStore';
import colors from '@/constants/colors';
import { safeBack } from '@/lib/navigation';

const API_URL = 'https://promorang-api.vercel.app';

interface Event {
    id: string;
    title: string;
    description: string;
    category: string;
    event_date: string;
    location_name?: string;
    is_virtual: boolean;
    status: 'draft' | 'published' | 'cancelled';
    total_attendees: number;
    flyer_url?: string;
}

export default function MyEventsScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const fetchMyEvents = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/api/events/me/created`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.status === 'success' || data.data) {
                setEvents(data.data?.events || []);
            }
        } catch (error) {
            console.error('Fetch my events error:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMyEvents();
    }, [fetchMyEvents]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMyEvents();
    };

    const handleDeleteEvent = async (eventId: string) => {
        Alert.alert(
            'Delete Event',
            'Are you sure you want to delete this event? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/api/events/${eventId}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (response.ok) {
                                setEvents(events.filter(e => e.id !== eventId));
                                Alert.alert('Deleted', 'Event has been deleted.');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete event.');
                        }
                    }
                }
            ]
        );
        setActiveMenu(null);
    };

    const handlePublishEvent = async (eventId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/events/${eventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'published' })
            });

            if (response.ok) {
                setEvents(events.map(e =>
                    e.id === eventId ? { ...e, status: 'published' } : e
                ));
                Alert.alert('Published', 'Your event is now live!');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to publish event.');
        }
        setActiveMenu(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return '#10B981';
            case 'draft': return '#F59E0B';
            case 'cancelled': return '#EF4444';
            default: return theme.textSecondary;
        }
    };

    const getCategoryEmoji = (category: string) => {
        const map: Record<string, string> = {
            concert: '🎵', conference: '🎤', meetup: '🤝', festival: '🎉',
            workshop: '🛠️', party: '🎊', sports: '⚽', art: '🎨',
            food: '🍔', nightlife: '🌙', other: '📅'
        };
        return map[category] || '📅';
    };

    const renderEventCard = ({ item }: { item: Event }) => {
        const eventDate = new Date(item.event_date);
        const isPast = eventDate < new Date();

        return (
            <Card style={[styles.eventCard, { backgroundColor: theme.card }]}>
                <TouchableOpacity
                    style={styles.cardContent}
                    onPress={() => router.push({ pathname: '/events/[id]', params: { id: item.id } })}
                >
                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.category)}</Text>
                        <View style={styles.cardTitleArea}>
                            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                        >
                            <MoreVertical size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Meta */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Calendar size={14} color={isPast ? '#EF4444' : theme.textSecondary} />
                            <Text style={[styles.metaText, { color: isPast ? '#EF4444' : theme.textSecondary }]}>
                                {eventDate.toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            {item.is_virtual ? (
                                <Text style={[styles.metaText, { color: theme.textSecondary }]}>🌐 Virtual</Text>
                            ) : (
                                <>
                                    <MapPin size={14} color={theme.textSecondary} />
                                    <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                                        {item.location_name || 'Location TBD'}
                                    </Text>
                                </>
                            )}
                        </View>
                        <View style={styles.metaItem}>
                            <Users size={14} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                {item.total_attendees || 0}
                            </Text>
                        </View>
                    </View>

                    {/* Dropdown Menu */}
                    {activeMenu === item.id && (
                        <View style={[styles.dropdown, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setActiveMenu(null);
                                    router.push({ pathname: '/events/[id]', params: { id: item.id } });
                                }}
                            >
                                <Eye size={16} color={theme.text} />
                                <Text style={[styles.dropdownText, { color: theme.text }]}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => {
                                    setActiveMenu(null);
                                    router.push({ pathname: '/events/edit/[id]' as any, params: { id: item.id } });
                                }}
                            >
                                <Edit2 size={16} color={theme.text} />
                                <Text style={[styles.dropdownText, { color: theme.text }]}>Edit</Text>
                            </TouchableOpacity>
                            {item.status === 'draft' && (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => handlePublishEvent(item.id)}
                                >
                                    <Eye size={16} color="#10B981" />
                                    <Text style={[styles.dropdownText, { color: '#10B981' }]}>Publish</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.dropdownItem}
                                onPress={() => handleDeleteEvent(item.id)}
                            >
                                <Trash2 size={16} color="#EF4444" />
                                <Text style={[styles.dropdownText, { color: '#EF4444' }]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            </Card>
        );
    };

    if (isLoading) {
        return <LoadingIndicator fullScreen text="Loading your events..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: 'My Events',
                    headerStyle: { backgroundColor: theme.surface },
                    headerTintColor: theme.text,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => safeBack(router)} style={styles.headerBack}>
                            <ArrowLeft size={24} color={theme.text} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push('/events/create')} style={styles.headerAdd}>
                            <Plus size={24} color={colors.primary} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={renderEventCard}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <EmptyState
                        title="No Events Yet"
                        description="Create your first event to start hosting and earning!"
                        icon={<Calendar size={48} color={theme.textSecondary} />}
                        actionLabel="Create Event"
                        onAction={() => router.push('/events/create')}
                    />
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/events/create')}
            >
                <Plus size={28} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBack: { marginLeft: 8, padding: 8 },
    headerAdd: { marginRight: 8, padding: 8 },
    listContent: { padding: 16, paddingBottom: 100 },
    eventCard: { marginBottom: 12, borderRadius: 16, overflow: 'visible' },
    cardContent: { padding: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    categoryEmoji: { fontSize: 28, marginRight: 12 },
    cardTitleArea: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
    statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    menuButton: { padding: 8 },
    metaRow: { flexDirection: 'row', gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 12 },
    dropdown: {
        position: 'absolute',
        right: 16,
        top: 50,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 8,
        minWidth: 140,
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 16 },
    dropdownText: { fontSize: 14, fontWeight: '500' },
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
