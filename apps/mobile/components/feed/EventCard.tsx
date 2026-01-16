import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Calendar, MapPin, Users, Ticket, Star } from 'lucide-react-native';
import { Event } from '@/types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useThemeColors } from '@/hooks/useThemeColors';
import { LinearGradient } from 'expo-linear-gradient';

interface EventCardProps {
    event: Event;
    onPress: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
    const theme = useThemeColors();
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <TouchableOpacity onPress={() => onPress(event.id)} activeOpacity={0.9}>
            <Card style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }] as any} padding="none">
                <View style={styles.imageContainer}>
                    {event.image ? (
                        <Image
                            source={{ uri: event.image }}
                            style={styles.image}
                            contentFit="cover"
                        />
                    ) : (
                        <LinearGradient
                            colors={['#FF6600', '#FF3366', '#FF00CC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.placeholderImage}
                        >
                            <Calendar size={48} color={colors.white} opacity={0.5} />
                        </LinearGradient>
                    )}

                    <View style={styles.badgesRow}>
                        <Badge
                            text={event.type.toUpperCase()}
                            variant="primary"
                            size="sm"
                            style={styles.typeBadge}
                        />
                        {event.isRegistered && (
                            <Badge
                                text="REGISTERED"
                                variant="success"
                                size="sm"
                                style={styles.registeredBadge}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.text }, typography.presets.body]} numberOfLines={2}>
                        {event.title}
                    </Text>

                    <Text style={[styles.description, { color: theme.textSecondary }, typography.presets.bodySmall]} numberOfLines={2}>
                        {event.description}
                    </Text>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Calendar size={14} color={colors.primary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>{formatDate(event.date)}</Text>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MapPin size={14} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                                {event.location}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Users size={14} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>{event.attendees} attending</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        {event.organizer ? (
                            <View style={styles.organizer}>
                                <Avatar
                                    source={event.organizer.avatar}
                                    size="xs"
                                    name={event.organizer.name}
                                />
                                <Text style={styles.organizerName}>by {event.organizer.name}</Text>
                            </View>
                        ) : (
                            <View style={styles.organizer}>
                                <Avatar
                                    size="xs"
                                    name="Promorang"
                                />
                                <Text style={styles.organizerName}>by Promorang</Text>
                            </View>
                        )}

                        <TouchableOpacity style={styles.button}>
                            <Text style={styles.buttonText}>
                                {event.isRegistered ? 'View Details' : 'Register Now'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 180,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgesRow: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    typeBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    registeredBadge: {
        backgroundColor: colors.success,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: colors.darkGray,
        marginBottom: 12,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        flex: 1,
    },
    metaText: {
        fontSize: 13,
        color: colors.darkGray,
        marginLeft: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
    organizer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    organizerName: {
        fontSize: 12,
        color: colors.darkGray,
        marginLeft: 6,
        fontWeight: '500',
    },
    button: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    buttonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
});
