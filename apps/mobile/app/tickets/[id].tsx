import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, Ticket, ShieldCheck, CheckCircle2, Info, Share2 } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '@/store/authStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import colors from '@/constants/colors';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'https://promorang-api.vercel.app';

interface TicketData {
    id: string;
    activation_code: string;
    status: 'valid' | 'used' | 'expired';
    activated_at: string | null;
    created_at: string;
    tier: {
        id: string;
        name: string;
        price_gems: number;
        event: {
            id: string;
            title: string;
            event_date: string;
            location_name?: string;
            location_address?: string;
            banner_url?: string;
            flyer_url?: string;
            is_virtual?: boolean;
            organizer_name?: string;
        };
    };
}


export default function TicketDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useThemeColors();
    const { token } = useAuthStore();

    const [ticket, setTicket] = useState<TicketData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTicket = useCallback(async () => {
        if (!token || !id) return;
        
        try {
            const response = await fetch(`${API_URL}/api/events/tickets/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.status === 'success') {
                setTicket(result.data.ticket);
            }
        } catch (error) {
            console.error('Error fetching ticket:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token, id]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

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

    const handleShare = async () => {
        if (!ticket) return;
        try {
            await Share.share({
                message: `My ticket for ${ticket.tier.event.title}`,
                url: `https://promorang.app/tickets/${id}`,
            });
        } catch (error) {
            console.error('Error sharing ticket:', error);
        }
    };

    if (isLoading) {
        return <LoadingIndicator fullScreen text="Loading ticket..." />;
    }

    if (!ticket) {
        return (
            <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Ticket not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const qrValue = JSON.stringify({
        type: 'event_ticket',
        code: ticket.activation_code,
        ticket_id: ticket.id,
        event_id: ticket.tier.event.id
    });

    const isUsed = ticket.status === 'used';
    const isExpired = ticket.status === 'expired';

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: '',
                    headerTransparent: true,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => router.back()}
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

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Banner */}
                <View style={styles.bannerContainer}>
                    {ticket.tier.event.banner_url || ticket.tier.event.flyer_url ? (
                        <Image
                            source={{ uri: ticket.tier.event.banner_url || ticket.tier.event.flyer_url }}
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
                    
                    {/* Status Badge */}
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: isUsed ? '#6B7280' : isExpired ? '#EF4444' : '#10B981' }
                    ]}>
                        <Text style={styles.statusText}>
                            {isUsed ? '✓ USED' : isExpired ? 'EXPIRED' : '✓ VALID'}
                        </Text>
                    </View>

                    {/* Event Title */}
                    <View style={styles.bannerContent}>
                        <Text style={styles.eventTitle}>{ticket.tier.event.title}</Text>
                        <Text style={styles.organizerName}>
                            by {ticket.tier.event.organizer_name || 'Event Organizer'}
                        </Text>
                    </View>
                </View>

                {/* Ticket Card */}
                <View style={styles.ticketCard}>
                    {/* Tier Badge */}
                    <View style={styles.tierBadge}>
                        <Ticket size={16} color={colors.primary} />
                        <Text style={styles.tierText}>{ticket.tier.name}</Text>
                    </View>

                    {/* Event Info */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: '#8B5CF610' }]}>
                                <Calendar size={20} color="#8B5CF6" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>When</Text>
                                <Text style={styles.infoValue}>{formatDate(ticket.tier.event.event_date)}</Text>
                                <Text style={styles.infoSubValue}>{formatTime(ticket.tier.event.event_date)}</Text>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={[styles.infoIcon, { backgroundColor: '#EC489910' }]}>
                                <MapPin size={20} color="#EC4899" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.infoLabel}>Where</Text>
                                <Text style={styles.infoValue}>
                                    {ticket.tier.event.location_name || 'Virtual Event'}
                                </Text>
                                {ticket.tier.event.location_address && (
                                    <Text style={styles.infoSubValue} numberOfLines={1}>
                                        {ticket.tier.event.location_address}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerCircleLeft} />
                        <View style={styles.dividerLine} />
                        <View style={styles.dividerCircleRight} />
                    </View>

                    {/* QR Code Section */}
                    <View style={styles.qrSection}>
                        <Text style={styles.qrTitle}>Your Entry Pass</Text>
                        <Text style={styles.qrSubtitle}>Show this QR code at the venue entrance</Text>

                        <View style={[
                            styles.qrContainer,
                            (isUsed || isExpired) && styles.qrContainerDisabled
                        ]}>
                            <QRCode
                                value={qrValue}
                                size={180}
                                color="#1F2937"
                                backgroundColor="#FFFFFF"
                            />
                        </View>

                        {/* Activation Code */}
                        <View style={styles.codeBox}>
                            <Text style={styles.codeLabel}>ACTIVATION CODE</Text>
                            <Text style={styles.codeValue}>{ticket.activation_code}</Text>
                        </View>

                        {/* Info Messages */}
                        <View style={styles.infoMessages}>
                            <View style={[styles.infoMessage, { backgroundColor: '#8B5CF610' }]}>
                                <ShieldCheck size={18} color="#8B5CF6" />
                                <Text style={[styles.infoMessageText, { color: '#7C3AED' }]}>
                                    This ticket is personal and linked to your account.
                                </Text>
                            </View>

                            {ticket.tier.event.is_virtual && (
                                <View style={[styles.infoMessage, { backgroundColor: '#3B82F610' }]}>
                                    <Info size={18} color="#3B82F6" />
                                    <Text style={[styles.infoMessageText, { color: '#2563EB' }]}>
                                        For virtual events, check-in may be automatic.
                                    </Text>
                                </View>
                            )}

                            {isUsed && ticket.activated_at && (
                                <View style={[styles.infoMessage, { backgroundColor: '#10B98110' }]}>
                                    <CheckCircle2 size={18} color="#10B981" />
                                    <Text style={[styles.infoMessageText, { color: '#059669' }]}>
                                        Checked in on {formatDate(ticket.activated_at)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.ticketFooter}>
                        <Text style={styles.footerText}>Ticket ID: {ticket.id.slice(0, 8)}...</Text>
                        <Text style={styles.footerText}>Purchased {formatDate(ticket.created_at)}</Text>
                    </View>
                </View>

                {/* View Event Button */}
                <TouchableOpacity
                    style={styles.viewEventButton}
                    onPress={() => router.push({ pathname: '/events/[id]', params: { id: ticket.tier.event.id } } as any)}
                >
                    <Text style={styles.viewEventButtonText}>View Event Details</Text>
                </TouchableOpacity>
            </ScrollView>
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
    backLink: {
        marginTop: 16,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    bannerContainer: {
        height: 200,
        position: 'relative',
    },
    banner: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    statusBadge: {
        position: 'absolute',
        top: 60,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    bannerContent: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    organizerName: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    ticketCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 2,
        borderColor: '#E9D5FF',
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#8B5CF610',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        marginBottom: 20,
    },
    tierText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },
    infoGrid: {
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 2,
    },
    infoSubValue: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerCircleLeft: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        marginLeft: -30,
    },
    dividerLine: {
        flex: 1,
        height: 2,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dividerCircleRight: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
        marginRight: -30,
    },
    qrSection: {
        alignItems: 'center',
    },
    qrTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    qrSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 20,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 4,
        borderColor: colors.primary,
        marginBottom: 20,
    },
    qrContainerDisabled: {
        opacity: 0.5,
        borderColor: '#D1D5DB',
    },
    codeBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    codeLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 8,
    },
    codeValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        letterSpacing: 4,
        fontFamily: 'monospace',
    },
    infoMessages: {
        width: '100%',
        gap: 8,
    },
    infoMessage: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: 12,
        gap: 10,
    },
    infoMessageText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerText: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    viewEventButton: {
        backgroundColor: colors.primary,
        marginHorizontal: 16,
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    viewEventButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
