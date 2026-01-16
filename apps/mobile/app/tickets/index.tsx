import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ticket, Calendar, MapPin, QrCode, ChevronRight, TicketX } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'https://promorang-api.vercel.app';

interface EventTicket {
    id: string;
    activation_code: string;
    status: 'valid' | 'used' | 'expired';
    activated_at: string | null;
    created_at: string;
    tier: {
        id: string;
        name: string;
        price_gems: number;
        price_gold: number;
        event: {
            id: string;
            title: string;
            event_date: string;
            location_name?: string;
            banner_url?: string;
            flyer_url?: string;
        };
    };
}

export default function MyTicketsScreen() {
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [tickets, setTickets] = useState<EventTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'valid' | 'used'>('all');

    const fetchTickets = useCallback(async () => {
        if (!token) return;
        
        try {
            const response = await fetch(`${API_URL}/api/users/me/tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.status === 'success') {
                setTickets(result.data.tickets || []);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTickets();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'valid': return '#10B981';
            case 'used': return '#6B7280';
            case 'expired': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        if (activeFilter === 'all') return true;
        return ticket.status === activeFilter;
    });

    const renderTicketCard = ({ item }: { item: EventTicket }) => (
        <TouchableOpacity
            style={[styles.ticketCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/tickets/[id]', params: { id: item.id } } as any)}
            activeOpacity={0.7}
        >
            <View style={styles.ticketImageContainer}>
                {item.tier.event.banner_url || item.tier.event.flyer_url ? (
                    <Image
                        source={{ uri: item.tier.event.banner_url || item.tier.event.flyer_url }}
                        style={styles.ticketImage}
                    />
                ) : (
                    <LinearGradient
                        colors={['#8B5CF6', '#EC4899']}
                        style={styles.ticketImage}
                    />
                )}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.ticketContent}>
                <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={2}>
                    {item.tier.event.title}
                </Text>
                <Text style={[styles.tierName, { color: colors.primary }]}>{item.tier.name}</Text>

                <View style={styles.ticketMeta}>
                    <View style={styles.metaItem}>
                        <Calendar size={14} color={theme.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                            {formatDate(item.tier.event.event_date)}
                        </Text>
                    </View>
                    {item.tier.event.location_name && (
                        <View style={styles.metaItem}>
                            <MapPin size={14} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                                {item.tier.event.location_name}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.ticketFooter}>
                    <View style={styles.codeContainer}>
                        <QrCode size={14} color={theme.textSecondary} />
                        <Text style={[styles.codeText, { color: theme.textSecondary }]}>
                            {item.activation_code}
                        </Text>
                    </View>
                    <ChevronRight size={20} color={theme.textSecondary} />
                </View>
            </View>
        </TouchableOpacity>
    );

    if (isLoading && !refreshing) {
        return <LoadingIndicator fullScreen text="Loading your tickets..." />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <View style={styles.headerIcon}>
                    <Ticket size={24} color={colors.primary} />
                </View>
                <View>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>My Tickets</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Your event access passes
                    </Text>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                {(['all', 'valid', 'used'] as const).map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterButton,
                            activeFilter === filter && styles.filterButtonActive
                        ]}
                        onPress={() => setActiveFilter(filter)}
                    >
                        <Text style={[
                            styles.filterText,
                            activeFilter === filter && styles.filterTextActive
                        ]}>
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            {filter === 'valid' && ` (${tickets.filter(t => t.status === 'valid').length})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {tickets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <TicketX size={64} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                    <Text style={[styles.emptyTitle, { color: theme.text }]}>No Tickets Yet</Text>
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Purchase tickets to events to see them here.
                    </Text>
                    <TouchableOpacity
                        style={styles.browseButton}
                        onPress={() => router.push('/events' as any)}
                    >
                        <Text style={styles.browseButtonText}>Browse Events</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredTickets}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTicketCard}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 60,
        borderBottomWidth: 1,
        gap: 12,
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#8B5CF610',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    filterTextActive: {
        color: '#FFF',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    ticketCard: {
        flexDirection: 'row',
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
    },
    ticketImageContainer: {
        width: 100,
        position: 'relative',
    },
    ticketImage: {
        width: '100%',
        height: '100%',
        minHeight: 140,
    },
    statusBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    ticketContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    tierName: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    ticketMeta: {
        gap: 6,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        flex: 1,
    },
    ticketFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    codeText: {
        fontSize: 12,
        fontFamily: 'monospace',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    browseButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
