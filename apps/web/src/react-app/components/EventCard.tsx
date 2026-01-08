import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Ticket, Star } from 'lucide-react';
import type { EventType } from '../../shared/types';
import eventsService from '@/react-app/services/events';
import { Routes as RoutePaths } from '@/react-app/utils/url';
import RelayButton from './Relay/RelayButton';

interface EventCardProps {
    event: EventType;
    compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
    const navigate = useNavigate();
    const isUpcoming = eventsService.isUpcoming(event.event_date);
    const isHappeningNow = eventsService.isHappeningNow(event.event_date, event.event_end_date);

    const statusBadge = () => {
        if (isHappeningNow) {
            return (
                <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                    🔴 LIVE
                </span>
            );
        }
        if (event.is_featured) {
            return (
                <span className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full">
                    ⭐ Featured
                </span>
            );
        }
        return null;
    };

    if (compact) {
        return (
            <div
                className="w-full bg-pr-surface-card p-5 cursor-pointer transition-colors duration-200 hover:bg-pr-surface-2 group"
                onClick={() => navigate(`/events/${event.id}`)}
            >
                <div className="flex gap-4">
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-pr-surface-2">
                        {event.flyer_url || event.banner_url ? (
                            <img
                                src={event.flyer_url || event.banner_url || ''}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                📅
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-pr-text-1 truncate group-hover:text-purple-500 transition-colors">
                            {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-pr-text-2 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{eventsService.formatEventDate(event.event_date)}</span>
                        </div>
                        {event.location_name && (
                            <div className="flex items-center gap-2 text-sm text-pr-text-2 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location_name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={() => navigate(`/events/${event.id}`)}
            className="w-full bg-pr-surface-card cursor-pointer group transition-colors duration-200 hover:bg-pr-surface-2"
        >
            {/* Cover Image */}
            <div className="relative aspect-[16/9] bg-pr-surface-2 overflow-hidden">
                {event.banner_url || event.flyer_url ? (
                    <img
                        src={event.banner_url || event.flyer_url || ''}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <span className="text-6xl">📅</span>
                    </div>
                )}
                {statusBadge()}

                {/* Category Badge */}
                {event.category && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full">
                        {eventsService.getCategoryLabel(event.category)}
                    </div>
                )}

                {/* Rating Badge */}
                {event.average_rating > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{event.average_rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-xl font-bold text-pr-text-1 mb-2 group-hover:text-purple-500 transition-colors line-clamp-2">
                    {event.title}
                </h3>

                {event.description && (
                    <p className="text-pr-text-2 text-sm mb-4 line-clamp-2">
                        {event.description}
                    </p>
                )}

                <div className="space-y-2">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-pr-text-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>{eventsService.formatEventDate(event.event_date, event.event_end_date)}</span>
                    </div>

                    {/* Location */}
                    {event.location_name && (
                        <div className="flex items-center gap-2 text-sm text-pr-text-2">
                            <MapPin className="w-4 h-4 text-pink-500" />
                            <span>{event.location_name}</span>
                        </div>
                    )}

                    {/* RSVP Count */}
                    <div className="flex items-center gap-2 text-sm text-pr-text-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>
                            {event.total_rsvps || 0} RSVP'd
                            {event.max_attendees && ` / ${event.max_attendees} max`}
                        </span>
                    </div>

                    {/* Rewards */}
                    {(event.total_rewards_pool > 0 || event.total_gems_pool > 0) && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <span>🎁</span>
                            <span>
                                {event.total_rewards_pool > 0 && `${event.total_rewards_pool} Points`}
                                {event.total_rewards_pool > 0 && event.total_gems_pool > 0 && ' + '}
                                {event.total_gems_pool > 0 && `${event.total_gems_pool} Gems`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-pr-border">
                    <div className="flex items-center gap-2">
                        <Link
                            to={RoutePaths.profile(event.organizer_name || 'unknown')}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 group/organizer"
                        >
                            {event.organizer_avatar ? (
                                <img
                                    src={event.organizer_avatar}
                                    alt={event.organizer_name}
                                    className="w-6 h-6 rounded-full group-hover/organizer:scale-105 transition-transform"
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold group-hover/organizer:scale-105 transition-transform">
                                    {event.organizer_name?.[0] || '?'}
                                </div>
                            )}
                            <span className="text-sm text-pr-text-2 group-hover/organizer:text-purple-500 transition-colors">
                                by {event.organizer_name || 'Unknown'}
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <RelayButton
                            objectType="event"
                            objectId={String(event.id)}
                            showLabel={false}
                        />
                        {event.ticketing_url && (
                            <div className="flex items-center gap-1 text-sm text-purple-500">
                                <Ticket className="w-4 h-4" />
                                <span>Tickets</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
