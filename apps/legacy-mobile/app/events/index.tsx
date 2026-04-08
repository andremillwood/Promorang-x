import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { EventCard } from '@/components/feed/EventCard';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { EmptyState } from '@/components/ui/EmptyState';
import { Calendar, Plus, Sparkles } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import TodayLayout from '@/components/TodayLayout';
import { AppHeader } from '@/components/ui/AppHeader';
import { BalancesBar } from '@/components/ui/BalancesBar';
import { LinearGradient } from 'expo-linear-gradient';

import { useEventStore } from '@/store/eventStore';

const { width } = Dimensions.get('window');

export default function EventsScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { isAuthenticated, user } = useAuthStore();
    const { events, isLoading, fetchEvents } = useEventStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
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

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroSection}
            >
                <View style={styles.heroContent}>
                    <View>
                        <Text style={styles.heroTitle}>Events Hub</Text>
                        <Text style={styles.heroSubtitle}>Connect, attend & earn gems</Text>
                    </View>
                    <Calendar size={40} color="rgba(255,255,255,0.2)" />
                </View>
                <Sparkles size={100} color="rgba(255,255,255,0.05)" style={styles.heroIcon} />
            </LinearGradient>

            <View style={styles.contentPadding}>
                <BalancesBar user={user} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured & Upcoming</Text>
            </View>
        </View>
    );

    return (
        <TodayLayout>
            <AppHeader transparent hideLeft showBack showNotifications showAvatar />
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ headerShown: false }} />

                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.cardWrapper}>
                            <EventCard event={item} onPress={handleEventPress} />
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
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
                />

                {/* FAB - Create Event */}
                {isAuthenticated && (
                    <TouchableOpacity style={styles.fab} onPress={handleCreateEvent}>
                        <Plus size={28} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>
        </TodayLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        marginBottom: 8,
    },
    heroSection: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
        position: 'relative',
        overflow: 'hidden',
    },
    heroContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    heroSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    heroIcon: {
        position: 'absolute',
        right: -20,
        bottom: -20,
    },
    contentPadding: {
        paddingHorizontal: 16,
        marginTop: -20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    listContent: {
        paddingBottom: 120,
    },
    cardWrapper: {
        paddingHorizontal: 16,
    },
    emptyState: {
        marginTop: 40,
        paddingHorizontal: 24,
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
