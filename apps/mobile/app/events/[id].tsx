import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar, MapPin, Users, Ticket, Share2, ArrowLeft, CheckCircle2, Target, Info, Loader2, QrCode, Camera, Megaphone } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LinearGradient } from 'expo-linear-gradient';
import CheckInQR from '@/components/events/CheckInQR';
import { safeBack } from '@/lib/navigation';

const API_URL = 'https://promorang-api.vercel.app';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useThemeColors();
    const { token, user } = useAuthStore();

    const [event, setEvent] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [sponsors, setSponsors] = useState<any[]>([]);
    const [tiers, setTiers] = useState<any[]>([]);
    const [hasRsvp, setHasRsvp] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEventData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/events/${id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            const result = await response.json();
            if (result.status === 'success') {
                setEvent(result.data.event);
                setTasks(result.data.tasks || []);
                setSponsors(result.data.sponsors || []);
                setHasRsvp(result.data.hasRsvp || false);
            }
        } catch (error) {
            console.error('Failed to fetch event details:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [id, token]);

    const fetchTiers = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/events/${id}/ticket-tiers`);
            const result = await response.json();
            if (result.status === 'success') {
                setTiers(result.data.tiers || []);
            }
        } catch (error) {
            console.error('Failed to fetch ticket tiers:', error);
        }
    }, [id]);

    useEffect(() => {
        fetchEventData();
        fetchTiers();
    }, [fetchEventData, fetchTiers]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchEventData();
        fetchTiers();
    };

    const handlePurchaseTicket = async (tierId: string) => {
        if (!token) {
            router.push('/(auth)/login');
            return;
        }

        try {
            setPurchaseLoading(tierId);
            const response = await fetch(`${API_URL}/api/events/${id}/tickets/purchase`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tier_id: tierId })
            });
            const result = await response.json();
            if (result.status === 'success') {
                Alert.alert(
                    'Ticket Purchased!',
                    'Your ticket has been added to My Tickets.',
                    [
                        { text: 'View Ticket', onPress: () => router.push('/tickets' as any) },
                        { text: 'Stay Here', style: 'cancel' }
                    ]
                );
                fetchTiers();
            } else {
                Alert.alert('Error', result.error || 'Failed to purchase ticket');
            }
        } catch (error) {
            console.error('Error purchasing ticket:', error);
            Alert.alert('Error', 'Failed to purchase ticket');
        } finally {
            setPurchaseLoading(null);
        }
    };

    const handleRsvp = async () => {
        if (!token) {
            router.push('/(auth)/login');
            return;
        }

        try {
            setActionLoading(true);
            const method = hasRsvp ? 'DELETE' : 'POST';
            const response = await fetch(`${API_URL}/api/events/${id}/rsvp`, {
                method,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.status === 'success') {
                setHasRsvp(!hasRsvp);
                fetchEventData(); // Refresh to get updated attendee count
            }
        } catch (error) {
            console.error('Failed to update RSVP:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleShare = async () => {
        if (!event) return;
        try {
            await Share.share({
                message: `Check out this event on Promorang: ${event.title}\n${event.description || ''}`,
                url: `https://promorang.app/events/${id}`, // Fallback URL
            });
        } catch (error) {
            console.error('Error sharing event:', error);
        }
    };

    if (isLoading && !refreshing) {
        return <LoadingIndicator fullScreen text="Loading event details..." />;
    }

    if (!event) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Event not found</Text>
                <TouchableOpacity onPress={() => safeBack(router)} style={styles.backButton}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: '',
                    headerTransparent: true,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => safeBack(router)}
                            style={[styles.headerIcon, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                        >
                            <ArrowLeft size={24} color="#FFF" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handleShare}
                            style={[styles.headerIcon, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
                        >
                            <Share2 size={24} color="#FFF" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
            >
                {/* Banner */}
                <View style={styles.bannerContainer}>
                    {event.banner_url || event.flyer_url ? (
                        <Image
                            source={{ uri: event.banner_url || event.flyer_url }}
                            style={styles.banner}
                        />
                    ) : (
                        <LinearGradient
                            colors={['#8B5CF6', '#EC4899']}
                            style={styles.banner}
                        />
                    )}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.bannerOverlay}
                    />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
                        <Badge
                            text={event.category || 'EVENT'}
                            variant="primary"
                            size="sm"
                        />
                    </View>

                    <View style={styles.organizerRow}>
                        <View style={styles.organizerInfo}>
                            {event.organizer_avatar ? (
                                <Image source={{ uri: event.organizer_avatar }} style={styles.organizerAvatar} />
                            ) : (
                                <View style={[styles.organizerAvatar, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.organizerInitial}>{event.organizer_name?.[0] || 'P'}</Text>
                                </View>
                            )}
                            <Text style={[styles.organizerName, { color: theme.textSecondary }]}>
                                Hosted by <Text style={{ color: theme.text, fontWeight: '700' }}>{event.organizer_name}</Text>
                            </Text>
                        </View>
                    </View>

                    <Card style={styles.infoCard} variant="elevated">
                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                                <Calendar size={20} color="#8B5CF6" />
                            </View>
                            <View>
                                <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>When</Text>
                                <Text style={[styles.infoValue, { color: theme.text }]}>{formatDate(event.event_date)}</Text>
                                <Text style={[styles.infoSubValue, { color: theme.textSecondary }]}>{formatTime(event.event_date)}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <MapPin size={20} color="#10B981" />
                            </View>
                            <View>
                                <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>Where</Text>
                                <Text style={[styles.infoValue, { color: theme.text }]}>{event.location_name || 'Virtual Event'}</Text>
                                {event.location_address && (
                                    <Text style={[styles.infoSubValue, { color: theme.textSecondary }]}>{event.location_address}</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <Users size={20} color="#3B82F6" />
                            </View>
                            <View>
                                <Text style={[styles.infoTitle, { color: theme.textSecondary }]}>Attendance</Text>
                                <Text style={[styles.infoValue, { color: theme.text }]}>{event.total_rsvps || 0} Joined</Text>
                                <Text style={[styles.infoSubValue, { color: theme.textSecondary }]}>Limited capacity</Text>
                            </View>
                        </View>
                    </Card>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>About this event</Text>
                        <Text style={[styles.description, { color: theme.textSecondary }]}>{event.description}</Text>
                    </View>

                    {/* Check-In QR Code for RSVP'd users */}
                    {hasRsvp && user?.id !== event.creator_id && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <QrCode size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 8 }]}>Check-In Pass</Text>
                            </View>
                            <CheckInQR
                                checkInCode={event.id?.replace(/-/g, '').slice(0, 12) || ''}
                                eventName={event.title}
                                isVirtual={event.is_virtual}
                            />
                        </View>
                    )}

                    {tasks.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Target size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.text, marginLeft: 8 }]}>Missions & Rewards</Text>
                            </View>
                            <View style={styles.tasksIntro}>
                                <LinearGradient
                                    colors={['#8B5CF6', '#EC4899']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.tasksIntroBg}
                                >
                                    <Target size={28} color="#FFF" />
                                    <View style={styles.tasksIntroText}>
                                        <Text style={styles.tasksIntroTitle}>Earning Opportunities</Text>
                                        <Text style={styles.tasksIntroDesc}>Complete missions to unlock rewards and reputation points.</Text>
                                    </View>
                                </LinearGradient>
                            </View>
                            {tasks.map((task, index) => (
                                <Card key={task.id || index} style={styles.taskCard}>
                                    <View style={styles.taskHeader}>
                                        <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text>
                                        <View style={styles.rewardBadge}>
                                            <Text style={styles.rewardText}>+{task.points_reward} Pts</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.taskDesc, { color: theme.textSecondary }]}>{task.description}</Text>
                                    <TouchableOpacity
                                        style={styles.taskButton}
                                        onPress={() => {
                                            if (!hasRsvp) {
                                                Alert.alert('RSVP Required', 'You must join this event to complete tasks!');
                                                return;
                                            }
                                            router.push({
                                                pathname: '/task/[id]',
                                                params: { id: task.id, eventId: id }
                                            } as any);
                                        }}
                                    >
                                        <Megaphone size={16} color="#FFF" style={{ marginRight: 6 }} />
                                        <Text style={styles.taskButtonText}>Submit Proof</Text>
                                    </TouchableOpacity>
                                </Card>
                            ))}
                        </View>
                    )}

                    {sponsors.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sponsors</Text>
                            <View style={styles.sponsorsGrid}>
                                {sponsors.map((sponsor, index) => (
                                    <View key={sponsor.id || index} style={styles.sponsorItem}>
                                        {sponsor.sponsor_logo ? (
                                            <Image source={{ uri: sponsor.sponsor_logo }} style={styles.sponsorLogo} />
                                        ) : (
                                            <View style={styles.sponsorPlaceholder}>
                                                <Text style={styles.sponsorInitial}>{sponsor.sponsor_name?.[0]}</Text>
                                            </View>
                                        )}
                                        <Text style={[styles.sponsorName, { color: theme.textSecondary }]}>{sponsor.sponsor_name}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={[
                        styles.rsvpButton,
                        hasRsvp ? styles.rsvpButtonActive : { backgroundColor: colors.primary }
                    ]}
                    onPress={handleRsvp}
                    disabled={actionLoading}
                >
                    {actionLoading ? (
                        <Loader2 size={24} color="#FFF" />
                    ) : hasRsvp ? (
                        <>
                            <CheckCircle2 size={20} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={styles.rsvpButtonText}>Going</Text>
                        </>
                    ) : (
                        <Text style={styles.rsvpButtonText}>Join Event</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    bannerContainer: {
        height: 250,
        width: '100%',
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        padding: 20,
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: '#FFF', // Should be theme.background but for overlay effect
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        flex: 1,
        marginRight: 10,
    },
    organizerRow: {
        marginBottom: 24,
    },
    organizerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    organizerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    organizerInitial: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    organizerName: {
        fontSize: 14,
    },
    infoCard: {
        padding: 16,
        marginBottom: 24,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoTitle: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    infoSubValue: {
        fontSize: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
    },
    taskCard: {
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    rewardBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    rewardText: {
        color: '#10B981',
        fontSize: 12,
        fontWeight: '700',
    },
    taskDesc: {
        fontSize: 14,
        marginBottom: 12,
    },
    taskButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    taskButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFF',
    },
    tasksIntro: {
        marginBottom: 16,
    },
    tasksIntroBg: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    tasksIntroText: {
        flex: 1,
    },
    tasksIntroTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    tasksIntroDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
    sponsorsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    sponsorItem: {
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 16,
    },
    sponsorLogo: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginBottom: 4,
    },
    sponsorPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    sponsorInitial: {
        fontWeight: '700',
        color: '#9CA3AF',
    },
    sponsorName: {
        fontSize: 10,
        fontWeight: '600',
    },
    tierCard: {
        marginBottom: 12,
        padding: 16,
    },
    tierHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tierName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    tierDesc: {
        fontSize: 13,
        maxWidth: 200,
    },
    tierPricing: {
        alignItems: 'flex-end',
    },
    tierPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.primary,
    },
    tierFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    tierAvailability: {
        fontSize: 13,
        fontWeight: '500',
    },
    tierButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    tierButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    tierButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 34,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
    },
    rsvpButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    rsvpButtonActive: {
        backgroundColor: '#10B981',
    },
    rsvpButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    backButton: {
        marginTop: 10,
    }
});
